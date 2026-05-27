import express from 'express'

import { verifyAdmin, verifyUser, verifyAdminOrStaff } from '../utils/verifyToken.js'
import { checkTourAvailability } from '../middleware/tourStatusMiddleware.js'
import { 
    createBooking, 
    getAllBooking, 
    getBooking, 
    getBookingsByUser, 
    cancelBooking, 
    updateBooking, 
    deleteBooking,
    getTopSpendingCustomers,
    getTopFrequentCustomers,
    getTopBookedTours
} from '../controllers/bookingController.js'

const router = express.Router()

// Stats routes (cần trước routes có :id để tránh conflict)
router.get('/stats/top-spending', verifyAdmin, getTopSpendingCustomers)
router.get('/stats/top-frequent', verifyAdmin, getTopFrequentCustomers)
router.get('/stats/top-tours', verifyAdmin, getTopBookedTours)

// Các routes khác
router.post('/', verifyUser, checkTourAvailability, createBooking)
router.get('/user/:userId', verifyUser, getBookingsByUser)
router.get('/:id', verifyUser, getBooking)
router.get('/', verifyAdminOrStaff, getAllBooking)
router.put('/:id/cancel', verifyUser, cancelBooking)
router.put('/:id', verifyAdminOrStaff, updateBooking)
router.patch('/:id', verifyAdminOrStaff, updateBooking)
router.delete('/:id', verifyAdminOrStaff, deleteBooking)

export default router