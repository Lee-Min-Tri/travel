import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },

    photo: {
      type: String,
    },

    phone: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      default: "user",
    },

    status: {
      type: String,
      default: "Đang rảnh",
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
