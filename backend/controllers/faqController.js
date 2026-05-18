import FAQ from "../models/FAQ.js";

// Tạo FAQ mới
export const createFAQ = async (req, res) => {
  try {
    const { question, answer, category } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập câu hỏi và câu trả lời"
      });
    }

    const newFAQ = new FAQ({
      question,
      answer,
      category: category || "khác"
    });

    await newFAQ.save();

    return res.status(201).json({
      success: true,
      message: "Tạo FAQ thành công",
      data: newFAQ
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Lấy tất cả FAQ
export const getAllFAQ = async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ order: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách FAQ thành công",
      data: faqs
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Lấy FAQ theo category
export const getFAQByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const faqs = await FAQ.find({ category, isPublished: true }).sort({ order: 1 });

    return res.status(200).json({
      success: true,
      message: "Lấy FAQ theo danh mục thành công",
      data: faqs
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Lấy FAQ công khai
export const getPublishedFAQ = async (req, res) => {
  try {
    const faqs = await FAQ.find({ isPublished: true }).sort({ order: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Lấy FAQ công khai thành công",
      data: faqs
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Cập nhật FAQ
export const updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, category, isPublished, order } = req.body;

    const updatedFAQ = await FAQ.findByIdAndUpdate(
      id,
      { question, answer, category, isPublished, order },
      { new: true, runValidators: true }
    );

    if (!updatedFAQ) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy FAQ"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật FAQ thành công",
      data: updatedFAQ
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Xóa FAQ
export const deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedFAQ = await FAQ.findByIdAndDelete(id);

    if (!deletedFAQ) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy FAQ"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Xóa FAQ thành công",
      data: deletedFAQ
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
