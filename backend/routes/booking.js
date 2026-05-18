import express from 'express'

import { verifyAdmin, verifyUser, verifyAdminOrStaff } from '../utils/verifyToken.js'
import { createBooking, getAllBooking, getBooking, getBookingsByUser, cancelBooking, updateBooking, deleteBooking } from '../controllers/bookingController.js'

const router = express.Router()

router.post('/', verifyUser, createBooking)
router.get('/user/:userId', verifyUser, getBookingsByUser)
router.get('/:id', verifyUser, getBooking)
router.get('/', verifyAdminOrStaff, getAllBooking)
router.put('/:id/cancel', verifyUser, cancelBooking)
router.put('/:id', verifyAdminOrStaff, updateBooking)
router.patch('/:id', verifyAdminOrStaff, updateBooking)
router.delete('/:id', verifyAdminOrStaff, deleteBooking)

export default router