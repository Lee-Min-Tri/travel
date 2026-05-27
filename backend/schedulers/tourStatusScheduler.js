import Tour from '../models/Tour.js';
import Booking from '../models/Booking.js';
import schedule from 'node-schedule';
import {
  getTotalBookedPassengers,
  getDaysUntilDeparture,
  shouldAutoCancel,
  cancelTourBookings,
  cleanupOldTourDates
} from '../utils/tourStatusUtils.js';

/**
 * Daily Tour Status Check Scheduler
 * Runs every day at 8 AM to:
 * 1. Auto-cancel tours that don't meet minimum passengers (< 7 days)
 * 2. Auto-mark tours as departed (when date arrives)
 * 3. Auto-mark tours as completed (when scheduled completion date arrives)
 */

export const tourStatusScheduler = async () => {
  try {
    console.log('[Tour Scheduler] Starting daily tour status check at', new Date());

    const tours = await Tour.find({
      status: { $nin: ["Đã khởi hành", "Đã hoàn thành", "Đã hủy"] }
    });

    let updated = {
      autoConfirmed: 0,
      autoCancelled: 0,
      departedToday: 0,
      completedToday: 0
    };

    for (const tour of tours) {
      if (!tour.tourDates || tour.tourDates.length === 0) {
        continue;
      }

      // Clean up old tour dates first
      await cleanupOldTourDates(tour._id);

      // Re-fetch tour after cleanup
      const updatedTour = await Tour.findById(tour._id);
      if (!updatedTour || !updatedTour.tourDates || updatedTour.tourDates.length === 0) {
        continue;
      }

      const primaryDate = updatedTour.tourDates[0];
      const bookedCount = primaryDate.bookedCount || 0;
      const daysUntil = getDaysUntilDeparture(primaryDate.date);

      // === AUTO-CANCEL LOGIC ===
      // If should auto-cancel: not enough passengers + less than 7 days + status is "Chờ xác nhận"
      if (shouldAutoCancel(updatedTour, bookedCount)) {
        await cancelTourBookings(updatedTour._id, "Tour không đủ khách");
        
        // Restore seats
        updatedTour.tourDates = updatedTour.tourDates.map(dateItem => ({
          ...dateItem,
          seatsAvailable: dateItem.seatsAvailable + (dateItem.bookedCount || 0),
          bookedCount: 0
        }));

        updatedTour.status = "Đã hủy";
        updatedTour.cancelledReason = "Không đủ khách để thực hiện chuyến tour";
        await updatedTour.save();

        updated.autoCancelled++;
        console.log(`[Tour Scheduler] Auto-cancelled: ${updatedTour.title} (${bookedCount}/${updatedTour.minPassengers} passengers)`);
      }

      // === DEPARTURE TODAY LOGIC ===
      if (daysUntil === 0 && updatedTour.status === "Đã xác nhận sẽ chạy") {
        updatedTour.status = "Đã khởi hành";
        await updatedTour.save();

        // Update all confirmed bookings
        await Booking.updateMany(
          { tourId: updatedTour._id, status: "Đã xác nhận" },
          { status: "Đã khởi hành" }
        );

        updated.departedToday++;
        console.log(`[Tour Scheduler] Tour departed: ${updatedTour.title}`);
      }

      // === COMPLETION LOGIC ===
      // Assuming tour duration is in itinerary (e.g., 5 days)
      // You might want to add completionDate field to Tour model
      if (daysUntil < -3 && updatedTour.status === "Đã khởi hành") {
        // Auto-mark as completed if it's been more than 3 days after departure
        updatedTour.status = "Đã hoàn thành";
        await updatedTour.save();

        // Update all departed bookings
        await Booking.updateMany(
          { tourId: updatedTour._id, status: "Đã khởi hành" },
          { status: "Đã hoàn thành" }
        );

        updated.completedToday++;
        console.log(`[Tour Scheduler] Tour completed: ${updatedTour.title}`);
      }
    }

    console.log('[Tour Scheduler] Daily check completed:', updated);
    return updated;
  } catch (err) {
    console.error('[Tour Scheduler] Error:', err.message);
    throw err;
  }
};

/**
 * Initialize the scheduler
 * Can be called from index.js to start the scheduler
 * 
 * Usage in index.js:
 * import { initTourStatusScheduler } from './schedulers/tourStatusScheduler.js';
 * 
 * // After connecting to database:
 * initTourStatusScheduler();
 */
export const initTourStatusScheduler = () => {
  // Schedule to run at 8 AM every day
  
  // Run every day at 8:00 AM
  const job = schedule.scheduleJob('0 8 * * *', async () => {
    await tourStatusScheduler();
  });

  // Also run immediately once on init so recent past-dates cleanup and cancellations
  // are applied right after server restarts.
  tourStatusScheduler()
    .then(() => console.log('[Tour Scheduler] Initial run completed'))
    .catch(err => console.error('[Tour Scheduler] Initial run error:', err.message));

  console.log('[Tour Scheduler] Initialized - will run daily at 8 AM (and ran once on startup)');
  return job;
};

/**
 * Alternative: Simple interval-based scheduler (for testing)
 * This runs the scheduler at a fixed interval instead of cron
 * 
 * Usage:
 * import { initTourStatusSchedulerInterval } from './schedulers/tourStatusScheduler.js';
 * 
 * // After connecting to database:
 * initTourStatusSchedulerInterval(24 * 60 * 60 * 1000); // Daily
 */
export const initTourStatusSchedulerInterval = (intervalMs = 24 * 60 * 60 * 1000) => {
  const intervalId = setInterval(async () => {
    await tourStatusScheduler();
  }, intervalMs);

  console.log(`[Tour Scheduler] Initialized - will run every ${intervalMs / 1000 / 60 / 60} hours`);
  return intervalId;
};

/**
 * Manual check endpoint (for testing/debugging)
 */
export const runTourStatusCheckManual = async (req, res) => {
  try {
    const result = await tourStatusScheduler();
    res.status(200).json({
      success: true,
      message: 'Tour status check completed',
      data: result
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
