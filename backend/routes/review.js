import express from 'express'
import { createReview, getAllReviews, deleteReview } from '../controllers/reviewController.js'
import { verifyUser, verifyAdminOrStaff } from '../utils/verifyToken.js'

const router = express.Router()

router.post('/:tourId', verifyUser, createReview)
router.get('/all', verifyAdminOrStaff, getAllReviews)
router.delete('/:id', verifyAdminOrStaff, deleteReview)

export default router