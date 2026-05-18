import mongoose from "mongoose";

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      unique: true
    },
    answer: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ["bảo hiểm", "hoàn hủy", "an toàn", "thủ tục", "khác"],
      default: "khác"
    },
    isPublished: {
      type: Boolean,
      default: true
    },
    order: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model("FAQ", faqSchema);
