import express from "express";
const router = express.Router();

import {
  createFAQ,
  getAllFAQ,
  getFAQByCategory,
  getPublishedFAQ,
  updateFAQ,
  deleteFAQ
} from "../controllers/faqController.js";

import { verifyAdmin } from "../utils/verifyToken.js";

// Public routes
router.get("/", getPublishedFAQ);
router.get("/category/:category", getFAQByCategory);

// Admin routes
router.post("/", verifyAdmin, createFAQ);
router.get("/all", verifyAdmin, getAllFAQ);
router.put("/:id", verifyAdmin, updateFAQ);
router.delete("/:id", verifyAdmin, deleteFAQ);

export default router;
