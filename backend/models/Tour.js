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
  },
  { timestamps: true }
);

export default mongoose.model("Tour", tourSchema);
