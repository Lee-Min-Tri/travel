import Tour from '../models/Tour.js';
import Booking from '../models/Booking.js';

// Calculate minimum required passengers (70% of maxGroupSize)
export const calculateMinPassengers = (maxGroupSize) => {
  return Math.ceil(maxGroupSize * 0.7);
};

// Calculate confirmation deadline (3 days before departure)
export const calculateConfirmationDeadline = (departureDate) => {
  const deadline = new Date(departureDate);
  deadline.setDate(deadline.getDate() - 3);
  return deadline;
};

// Get total booked passengers for a specific tour date
export const getTotalBookedPassengers = (tour, bookingDate) => {
  if (!tour.tourDates || !Array.isArray(tour.tourDates)) {
    return 0;
  }
  
  const tourDateItem = tour.tourDates.find(dateItem => {
    if (!dateItem || !dateItem.date) return false;
    const tourDate = new Date(dateItem.date).toISOString().split('T')[0];
    const selectedDate = new Date(bookingDate).toISOString().split('T')[0];
    return tourDate === selectedDate;
  });

  return tourDateItem ? tourDateItem.bookedCount : 0;
};

// Get available seats for a specific tour date
export const getAvailableSeats = (tour, bookingDate) => {
  if (!tour.tourDates || !Array.isArray(tour.tourDates)) {
    return 0;
  }
  
  const tourDateItem = tour.tourDates.find(dateItem => {
    if (!dateItem || !dateItem.date) return false;
    const tourDate = new Date(dateItem.date).toISOString().split('T')[0];
    const selectedDate = new Date(bookingDate).toISOString().split('T')[0];
    return tourDate === selectedDate;
  });

  return tourDateItem ? tourDateItem.seatsAvailable : 0;
};

// Check if tour is full (no more seats available for primary date)
export const isTourFull = (tour) => {
  if (!tour.tourDates || tour.tourDates.length === 0) {
    return false;
  }
  
  // Get the first tour date (primary departure date)
  const primaryDate = tour.tourDates[0];
  return primaryDate && primaryDate.seatsAvailable <= 0;
};

// Calculate occupancy rate for a specific date
export const getOccupancyRate = (tour, bookingDate) => {
  if (!tour.tourDates) return 0;
  
  const tourDateItem = tour.tourDates.find(dateItem => {
    if (!dateItem || !dateItem.date) return false;
    const tourDate = new Date(dateItem.date).toISOString().split('T')[0];
    const selectedDate = new Date(bookingDate).toISOString().split('T')[0];
    return tourDate === selectedDate;
  });

  if (!tourDateItem) return 0;

  const totalSeats = tourDateItem.seatsAvailable + tourDateItem.bookedCount;
  if (totalSeats === 0) return 0;

  return Math.round((tourDateItem.bookedCount / totalSeats) * 100);
};

// Check if tour meets minimum passenger requirement
export const meetsMinimumPassengers = (bookedCount, minPassengers) => {
  return bookedCount >= minPassengers;
};

// Get days until departure
export const getDaysUntilDeparture = (departureDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const depDate = new Date(departureDate);
  depDate.setHours(0, 0, 0, 0);
  
  const diffTime = depDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Get days until confirmation deadline
export const getDaysUntilConfirmationDeadline = (confirmationDeadline) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const deadline = new Date(confirmationDeadline);
  deadline.setHours(0, 0, 0, 0);
  
  const diffTime = deadline - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Determine if a tour should be auto-cancelled based on rules
export const shouldAutoCancel = (tour, bookedCount) => {
  if (!tour.minPassengers || !tour.departureDate) {
    return false;
  }

  // Don't cancel if already cancelled
  if (tour.status === "Đã hủy") {
    return false;
  }

  // Don't cancel if already confirmed
  if (tour.status === "Đã xác nhận sẽ chạy" || tour.status === "Đã khởi hành") {
    return false;
  }

  const daysUntil = getDaysUntilDeparture(tour.departureDate);
  const meetsMin = meetsMinimumPassengers(bookedCount, tour.minPassengers);

  // Auto-cancel if:
  // 1. Less than 7 days until departure AND
  // 2. Still doesn't meet minimum passengers AND
  // 3. Status is still "Chờ xác nhận"
  if (daysUntil < 7 && !meetsMin && tour.status === "Chờ xác nhận") {
    return true;
  }

  return false;
};

export const isTourDueForConfirmation = (tour) => {
  if (!tour.departureDate) {
    return false;
  }

  if (["Đã hủy", "Đã xác nhận sẽ chạy", "Đã khởi hành", "Đã hoàn thành"].includes(tour.status)) {
    return false;
  }

  const bookedCount = tour.tourDates?.[0]?.bookedCount || 0;
  const daysUntil = getDaysUntilDeparture(tour.departureDate);
  const minPassengers = tour.minPassengers || calculateMinPassengers(tour.maxGroupSize || 0);
  const meetsMin = meetsMinimumPassengers(bookedCount, minPassengers);

  return daysUntil <= 7 && !meetsMin;
};

// Suggest new tour status based on booking count
export const suggestTourStatus = (tour, bookedCount) => {
  if (tour.status === "Đã khởi hành" || tour.status === "Đã hoàn thành" || tour.status === "Đã hủy") {
    return tour.status; // Don't change final statuses
  }

  const minPassengers = tour.minPassengers || calculateMinPassengers(tour.maxGroupSize || 0);

  // Full - when all seats taken
  if (isTourFull(tour)) {
    return "Đã đủ khách";
  }

  // Check if we're past confirmation deadline
  const daysUntilDeadline = getDaysUntilConfirmationDeadline(tour.confirmationDeadline);
  
  if (daysUntilDeadline <= 0) {
    // Deadline passed
    if (meetsMinimumPassengers(bookedCount, minPassengers)) {
      return "Đã xác nhận sẽ chạy";
    } else {
      return "Đã hủy"; // Auto-cancel
    }
  }

  // If the tour is within 7 days to departure and still below minimum,
  // we should encourage confirmation preparation.
  if (isTourDueForConfirmation(tour)) {
    return "Chờ xác nhận";
  }

  // Before deadline - check if meets minimum
  if (meetsMinimumPassengers(bookedCount, minPassengers)) {
    return "Mở để đặt"; // Keep open, could be confirmed later
  } else {
    return "Chờ xác nhận"; // Waiting for more bookings or confirmation
  }
};

// Get all bookings for a tour
export const getTourBookings = async (tourId) => {
  try {
    return await Booking.find({ tourId });
  } catch (err) {
    console.error('Error fetching tour bookings:', err);
    return [];
  }
};

// Cancel all bookings for a tour and auto-refund if payment already made
export const cancelTourBookings = async (tourId, reason) => {
  try {
    const bookings = await Booking.find({ tourId });
    const cancelledBookings = [];

    for (const booking of bookings) {
      if (booking.status !== 'Đã hủy' && booking.status !== 'Khách hủy') {
        // If booking was already paid, mark as refunded; otherwise mark as cancelled
        if (booking.status === 'Đã thanh toán') {
          booking.status = 'Đã hoàn tiền';
          booking.cancellationReason = `Hoàn tiền do ${reason}`;
        } else {
          booking.status = 'Đã hủy';
          booking.cancellationReason = reason;
        }
        await booking.save();
        cancelledBookings.push(booking);
      }
    }

    return cancelledBookings;
  } catch (err) {
    console.error('Error cancelling tour bookings:', err);
    return [];
  }
};

// Remove old tour dates that have passed
export const cleanupOldTourDates = async (tourId) => {
  try {
    const tour = await Tour.findById(tourId);
    if (!tour || !tour.tourDates || tour.tourDates.length === 0) {
      return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Process past dates: for each date that is before today, refund or cancel bookings then remove the date
    const originalLength = tour.tourDates.length;
    let removedCount = 0;

    const newDates = [];
    for (const dateItem of tour.tourDates) {
      if (!dateItem || !dateItem.date) {
        newDates.push(dateItem);
        continue;
      }

      const tourDate = new Date(dateItem.date);
      tourDate.setHours(0, 0, 0, 0);

      // If date is today or future, keep it
      if (tourDate >= today) {
        newDates.push(dateItem);
        continue;
      }

      // Date is in the past: handle bookings for that specific date
      const bookingsForDate = await Booking.find({ tourId, bookingAt: { $exists: true } });
      // Filter bookings that match this date (compare YYYY-MM-DD)
      const targetDateStr = tourDate.toISOString().split('T')[0];
      const bookingsOnThisDate = bookingsForDate.filter(b => {
        if (!b.bookingAt) return false;
        return new Date(b.bookingAt).toISOString().split('T')[0] === targetDateStr;
      });

      // Process each booking: refund paid ones, cancel others
      let processedAny = false;
      for (const booking of bookingsOnThisDate) {
        if (booking.status === 'Đã hoàn tiền' || booking.status === 'Đã hủy' || booking.status === 'Khách hủy') {
          continue;
        }

        processedAny = true;
        if (booking.status === 'Đã thanh toán') {
          booking.status = 'Đã hoàn tiền';
          booking.cancellationReason = `Hoàn tiền do lịch trình đã qua và tour không thực hiện`;
        } else {
          booking.status = 'Đã hủy';
          booking.cancellationReason = 'Hủy do lịch trình đã qua và tour không thực hiện';
        }
        await booking.save();
      }

      // After processing bookings (if any), remove this date from tourDates
      removedCount++;
    }

    tour.tourDates = newDates;
    if (removedCount > 0) {
      await tour.save();
      console.log(`[Tour Cleanup] Removed ${removedCount} old dates from tour: ${tour.title}`);
    }

    return tour;
  } catch (err) {
    console.error('Error cleaning up old tour dates:', err);
    return null;
  }
};

// Format tour status for API response
export const formatTourStatus = (tour) => {
  return {
    ...tour.toObject ? tour.toObject() : tour,
    occupancyRate: getOccupancyRate(tour, tour.tourDates?.[0]?.date),
    daysUntilDeparture: getDaysUntilDeparture(tour.departureDate),
    daysUntilConfirmationDeadline: getDaysUntilConfirmationDeadline(tour.confirmationDeadline),
    minPassengers: tour.minPassengers || calculateMinPassengers(tour.maxGroupSize || 0),
    meetsMinimumPassengers: meetsMinimumPassengers(
      tour.tourDates?.[0]?.bookedCount || 0,
      tour.minPassengers || calculateMinPassengers(tour.maxGroupSize || 0)
    )
  };
};
