import Tour from '../models/Tour.js';
import Booking from '../models/Booking.js';
import {
  calculateMinPassengers,
  calculateConfirmationDeadline,
  isTourFull,
  meetsMinimumPassengers,
  getDaysUntilDeparture,
  getDaysUntilConfirmationDeadline,
  getTourBookings,
  cancelTourBookings,
  formatTourStatus,
  suggestTourStatus,
  getTotalBookedPassengers,
  getOccupancyRate,
  isTourDueForConfirmation
} from '../utils/tourStatusUtils.js';

const getNextTourDate = (tour) => {
  const tourDates = Array.isArray(tour.tourDates) ? tour.tourDates : [];
  if (tourDates.length === 0) return null;
  const sorted = [...tourDates].sort((a, b) => new Date(a.date) - new Date(b.date));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return sorted.find(item => new Date(item.date).setHours(0, 0, 0, 0) >= today) || sorted[0];
};

const getFillStatusData = (tour) => {
  const nextDate = getNextTourDate(tour);
  const booked = nextDate?.bookedCount || 0;
  const available = nextDate?.seatsAvailable || 0;
  const total = booked + available;
  const percent = total > 0 ? Math.round((booked / total) * 100) : 0;
  return {
    tourDate: nextDate?.date || null,
    booked,
    available,
    total,
    fillPercent: percent
  };
};

// Get tour status overview (for admin dashboard)
export const getTourStatusOverview = async (req, res) => {
  try {
    const tours = await Tour.find();
    
    const overview = {
      total: tours.length,
      openForBooking: tours.filter(t => t.status === "Mở để đặt").length,
      pendingConfirmation: tours.filter(t =>
        ["Chờ xác nhận", "Đã đủ khách"].includes(t.status) || isTourDueForConfirmation(t)
      ).length,
      full: tours.filter(t => t.status === "Đã đủ khách").length,
      confirmed: tours.filter(t => t.status === "Đã xác nhận sẽ chạy").length,
      departed: tours.filter(t => t.status === "Đã khởi hành").length,
      completed: tours.filter(t => t.status === "Đã hoàn thành").length,
      cancelled: tours.filter(t => t.status === "Đã hủy").length,
    };

    res.status(200).json({
      success: true,
      message: 'Thành công',
      data: overview
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Get tours pending confirmation (within 7 days of departure)
export const getToursPendingConfirmation = async (req, res) => {
  try {
    const tours = await Tour.find({
      departureDate: { $exists: true }
    }).sort({ departureDate: 1 });

    const pendingTours = tours
      .filter(tour =>
        ["Chờ xác nhận", "Đã đủ khách"].includes(tour.status) ||
        isTourDueForConfirmation(tour)
      )
      .map(tour => {
        const bookedCount = tour.tourDates?.[0]?.bookedCount || 0;
        return {
          ...formatTourStatus(tour),
          bookedCount,
          minPassengers: tour.minPassengers,
          suggestedStatus: suggestTourStatus(tour, bookedCount),
          dueForConfirmation: isTourDueForConfirmation(tour)
        };
      });

    res.status(200).json({
      success: true,
      message: 'Danh sách tour chờ xác nhận',
      data: pendingTours
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

export const getToursFillStatus = async (req, res) => {
  try {
    const tours = await Tour.find({
      status: { $nin: ["Đã khởi hành", "Đã hoàn thành", "Đã hủy"] }
    }).sort({ title: 1 });

    const fillData = tours.map(tour => {
      const nextDate = getNextTourDate(tour);
      const fillStatus = getFillStatusData(tour);
      return {
        _id: tour._id,
        title: tour.title,
        city: tour.city,
        status: tour.status,
        tourDate: nextDate?.date || null,
        ...fillStatus,
        tourGuide: tour.tourGuide || {},
        minPassengers: tour.minPassengers,
        maxGroupSize: tour.maxGroupSize
      };
    });

    res.status(200).json({
      success: true,
      message: 'Danh sách fill chỗ trống',
      data: fillData
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

export const updateTourFillDecision = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, adminNotes } = req.body;

    if (!decision || !['go', 'no-go'].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: 'Tham số decision phải là go hoặc no-go'
      });
    }

    const tour = await Tour.findById(id);
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour không tồn tại'
      });
    }

    if (decision === 'go') {
      tour.status = 'Đã xác nhận sẽ chạy';
      if (adminNotes) tour.adminNotes = adminNotes;
      await tour.save();
      await Booking.updateMany(
        { tourId: id, status: 'Đang chờ liên hệ' },
        { status: 'Đã xác nhận' }
      );

      return res.status(200).json({
        success: true,
        message: 'Tour được xác nhận sẽ đi',
        data: formatTourStatus(tour)
      });
    }

    // decision === 'no-go'
    const cancelledBookings = await cancelTourBookings(id, 'Tour không đi');
    if (tour.tourDates && Array.isArray(tour.tourDates)) {
      tour.tourDates = tour.tourDates.map(dateItem => ({
        ...dateItem,
        seatsAvailable: dateItem.seatsAvailable + (dateItem.bookedCount || 0),
        bookedCount: 0
      }));
    }
    tour.status = 'Đã hủy';
    tour.cancelledReason = 'Tour không đi';
    if (adminNotes) tour.adminNotes = adminNotes;
    await tour.save();

    res.status(200).json({
      success: true,
      message: 'Tour được xác nhận không đi và hoàn tiền booking',
      data: {
        tour: formatTourStatus(tour),
        cancelledBookings: cancelledBookings.length
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Manual confirm tour will run
export const confirmTourToRun = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const tour = await Tour.findById(id);
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour không tồn tại'
      });
    }

    if (tour.status === "Đã khởi hành" || tour.status === "Đã hoàn thành") {
      return res.status(400).json({
        success: false,
        message: 'Không thể xác nhận tour đã khởi hành hoặc hoàn thành'
      });
    }

    tour.status = "Đã xác nhận sẽ chạy";
    if (adminNotes) {
      tour.adminNotes = adminNotes;
    }

    await tour.save();

    // Update all pending bookings to confirmed
    await Booking.updateMany(
      { tourId: id, status: "Đang chờ liên hệ" },
      { status: "Đã xác nhận" }
    );

    res.status(200).json({
      success: true,
      message: 'Xác nhận tour sẽ chạy thành công',
      data: formatTourStatus(tour)
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Manual cancel tour
export const cancelTour = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, adminNotes } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp lý do hủy tour'
      });
    }

    const tour = await Tour.findById(id);
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour không tồn tại'
      });
    }

    if (tour.status === "Đã khởi hành" || tour.status === "Đã hoàn thành") {
      return res.status(400).json({
        success: false,
        message: 'Không thể hủy tour đã khởi hành hoặc hoàn thành'
      });
    }

    // Cancel all related bookings
    const cancelledBookings = await cancelTourBookings(id, reason);

    // Restore all seats
    if (tour.tourDates && Array.isArray(tour.tourDates)) {
      tour.tourDates = tour.tourDates.map(dateItem => ({
        ...dateItem,
        seatsAvailable: dateItem.seatsAvailable + (dateItem.bookedCount || 0),
        bookedCount: 0
      }));
    }

    tour.status = "Đã hủy";
    tour.cancelledReason = reason;
    if (adminNotes) {
      tour.adminNotes = adminNotes;
    }

    await tour.save();

    res.status(200).json({
      success: true,
      message: 'Hủy tour thành công',
      data: {
        tour: formatTourStatus(tour),
        cancelledBookings: cancelledBookings.length
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Mark tour as departed
export const markTourDeparted = async (req, res) => {
  try {
    const { id } = req.params;

    const tour = await Tour.findById(id);
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour không tồn tại'
      });
    }

    if (tour.status === "Đã khởi hành") {
      return res.status(400).json({
        success: false,
        message: 'Tour đã được đánh dấu khởi hành rồi'
      });
    }

    tour.status = "Đã khởi hành";
    await tour.save();

    // Update all confirmed bookings
    await Booking.updateMany(
      { tourId: id, status: "Đã xác nhận" },
      { status: "Đã khởi hành" }
    );

    res.status(200).json({
      success: true,
      message: 'Đánh dấu tour khởi hành thành công',
      data: formatTourStatus(tour)
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Mark tour as completed
export const markTourCompleted = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const tour = await Tour.findById(id);
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour không tồn tại'
      });
    }

    if (tour.status === "Đã hoàn thành") {
      return res.status(400).json({
        success: false,
        message: 'Tour đã được đánh dấu hoàn thành rồi'
      });
    }

    tour.status = "Đã hoàn thành";
    if (adminNotes) {
      tour.adminNotes = adminNotes;
    }

    await tour.save();

    // Update all departed bookings
    await Booking.updateMany(
      { tourId: id, status: "Đã khởi hành" },
      { status: "Đã hoàn thành" }
    );

    res.status(200).json({
      success: true,
      message: 'Đánh dấu tour hoàn thành thành công',
      data: formatTourStatus(tour)
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Get detailed tour status info
export const getTourStatusDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const tour = await Tour.findById(id);
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour không tồn tại'
      });
    }

    const bookings = await Booking.find({ tourId: id }).populate('guideId', 'username email phone');
    const bookedCount = tour.tourDates?.[0]?.bookedCount || 0;

    const detail = {
      tour: formatTourStatus(tour),
      bookings: {
        total: bookings.length,
        confirmed: bookings.filter(b => b.status === "Đã xác nhận").length,
        pending: bookings.filter(b => b.status === "Đang chờ liên hệ").length,
        cancelled: bookings.filter(b => b.status === "Đã hủy" || b.status === "Khách hủy").length,
        completed: bookings.filter(b => b.status === "Đã hoàn thành").length
      },
      occupancy: {
        booked: bookedCount,
        available: tour.tourDates?.[0]?.seatsAvailable || 0,
        total: tour.maxGroupSize,
        percentage: getOccupancyRate(tour, tour.tourDates?.[0]?.date)
      },
      timeline: {
        daysUntilDeparture: getDaysUntilDeparture(tour.departureDate),
        daysUntilConfirmationDeadline: getDaysUntilConfirmationDeadline(tour.confirmationDeadline),
        meetsMinimum: meetsMinimumPassengers(bookedCount, tour.minPassengers)
      }
    };

    res.status(200).json({
      success: true,
      message: 'Thông tin chi tiết tour',
      data: detail
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Update tour status (automatic after booking)
export const updateTourStatusAuto = async (tourId) => {
  try {
    const tour = await Tour.findById(tourId);
    if (!tour) return null;

    const bookedCount = tour.tourDates?.[0]?.bookedCount || 0;
    const newStatus = suggestTourStatus(tour, bookedCount);

    if (newStatus !== tour.status) {
      tour.status = newStatus;
      await tour.save();
    }

    return tour;
  } catch (err) {
    console.error('Error updating tour status:', err);
    return null;
  }
};
