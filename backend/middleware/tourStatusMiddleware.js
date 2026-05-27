import Tour from '../models/Tour.js';

/**
 * Middleware to check if tour can accept new bookings
 * This runs before creating a booking
 */
export const checkTourAvailability = async (req, res, next) => {
  try {
    const { tourId } = req.body;

    if (!tourId) {
      return res.status(400).json({
        success: false,
        message: 'Tour ID không được cung cấp'
      });
    }

    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour không tồn tại'
      });
    }

    // Check if tour is cancelled
    if (tour.status === "Đã hủy") {
      return res.status(400).json({
        success: false,
        message: 'Tour đã bị hủy, không thể đặt chỗ'
      });
    }

    // Check if tour is full
    if (tour.status === "Đã khởi hành" || tour.status === "Đã hoàn thành") {
      return res.status(400).json({
        success: false,
        message: 'Tour đã khởi hành hoặc hoàn thành, không thể đặt chỗ'
      });
    }

    // Check if tour is currently full (no seats available for selected date)
    if (tour.tourDates && tour.tourDates.length > 0) {
      const selectedDate = new Date(req.body.bookingAt).toISOString().split('T')[0];
      const tourDate = tour.tourDates.find(dateItem => {
        if (!dateItem || !dateItem.date) return false;
        const tourDateStr = new Date(dateItem.date).toISOString().split('T')[0];
        return tourDateStr === selectedDate;
      });

      if (tourDate && tourDate.seatsAvailable <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Ngày khởi hành này đã hết chỗ'
        });
      }
    }

    // Add tour to request for later use
    req.tour = tour;
    next();
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * Middleware to check if booking can be modified
 * Prevents modifications to bookings of tours that have departed
 */
export const checkBookingModifiable = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const Booking = (await import('../models/Booking.js')).default;

    const booking = await Booking.findById(bookingId).populate('tourId');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking không tồn tại'
      });
    }

    // Check if tour has departed
    if (booking.tourId && booking.tourId.status === "Đã khởi hành") {
      return res.status(400).json({
        success: false,
        message: 'Không thể sửa booking của tour đã khởi hành'
      });
    }

    // Check if tour is completed
    if (booking.tourId && booking.tourId.status === "Đã hoàn thành") {
      return res.status(400).json({
        success: false,
        message: 'Không thể sửa booking của tour đã hoàn thành'
      });
    }

    req.booking = booking;
    next();
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * Middleware to verify admin permissions for tour status operations
 */
export const verifyTourStatusPermission = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Chưa xác thực'
    });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'nhân viên') {
    return res.status(403).json({
      success: false,
      message: 'Chỉ admin hoặc nhân viên mới được phép quản lý trạng thái tour'
    });
  }

  next();
};

/**
 * Middleware to log tour status changes
 */
export const logTourStatusChange = async (req, res, next) => {
  // This middleware logs tour status changes
  // You might want to implement this if you need audit logs
  
  const originalSend = res.send;
  
  res.send = function(data) {
    try {
      const jsonData = JSON.parse(data);
      
      if (jsonData.success && req.path.includes('/tour/status/')) {
        console.log(`[Tour Status Log] User: ${req.user?.username} | Action: ${req.method} ${req.path} | Status: ${jsonData.success}`);
      }
    } catch (e) {
      // Not JSON, ignore
    }
    
    res.send = originalSend;
    return res.send(data);
  };
  
  next();
};
