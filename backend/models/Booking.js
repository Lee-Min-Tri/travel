import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
    },
    userEmail: {
      type: String,
    },
    tourId: {
      type: mongoose.Types.ObjectId,
      ref: 'Tour'
    },
    tourName: {
      type: String,
      required: true
    },
    itinerary: [
      {
        day: { type: Number },
        location: { type: String },
        description: { type: String },
        meals: { type: String },
        time: { type: String },
        activities: { type: [String] }
      }
    ],
    totalPrice: {
      type: Number,
      required: true
    },
    fullName: {
      type: String,
      required: true,
    },
    guestSize: {
      type: Number,
      required: true
    },
    childrenUnder7: {
      type: Number,
      default: 0
    },
    children7To12: {
      type: Number,
      default: 0
    },
    phone: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      default: "Đang chờ liên hệ",
    },
    bookingAt: {
      type: Date,
      required: true
    },
    specialRequest: {
      type: String,
      default: ""
    },
    startLocation: {
      type: String,
      default: ""
    },
    departureTime: {
      type: String,
      default: ""
    },
    consultant: {
      name: {
        type: String,
        default: ""
      },
      phone: {
        type: String,
        default: ""
      }
    },
    tourGuide: {
      name: {
        type: String,
        default: ""
      },
      phone: {
        type: String,
        default: ""
      }
    },
    specialNote: {
      type: String,
      default: ""
    },
    staffId: {
      type: mongoose.Types.ObjectId,
      ref: "User", 
    },
    guideId: {
      type: mongoose.Types.ObjectId,
      ref: "User", 
    },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
