import mongoose from "mongoose";

const tourSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    city: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    distance: {
      type: Number,
      required: true,
    },
    photo: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      default: [] },
    desc: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    maxGroupSize: {
      type: Number,
      required: true,
    },
    tourDates: [
      {
        date: {
          type: Date,
          required: true,
        },
        seatsAvailable: {
          type: Number,
          required: true,
        },
        bookedCount: {
          type: Number,
          default: 0,
        },
      }
    ],

    reviews: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Review",
      },
    ],

    featured: {
      type: Boolean,
      default: false,
    },

    itinerary: [
  {
    day: { type: Number, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    meals: { type: String } 
  }
],

    // Tour Status Management
    status: {
      type: String,
      enum: [
        "Mở để đặt",           // Open for booking
        "Chờ xác nhận",        // Pending confirmation (not enough passengers or before deadline)
        "Đã đủ khách",         // Full
        "Đã xác nhận sẽ chạy",  // Confirmed to run
        "Đã khởi hành",        // Departed
        "Đã hoàn thành",       // Completed
        "Đã hủy"               // Cancelled
      ],
      default: "Mở để đặt"
    },

    minPassengers: {
      type: Number,
      // Calculated as 70% of maxGroupSize, can be overridden
    },

    departureDate: {
      type: Date,
      // Primary departure date (first date in tourDates)
    },

    confirmationDeadline: {
      type: Date,
      // Auto-calculated as 3 days before departureDate
    },

    cancelledReason: {
      type: String,
      // Reason for cancellation
    },

    adminNotes: {
      type: String,
      // Admin notes about the tour
    },

    tourGuide: {
      guideId: {
        type: mongoose.Types.ObjectId,
        ref: "User"
      },
      name: {
        type: String,
        default: ""
      },
      phone: {
        type: String,
        default: ""
      }
    }
  },
  { timestamps: true }
);

export default mongoose.model("Tour", tourSchema);
