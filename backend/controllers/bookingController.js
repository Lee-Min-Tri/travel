import Booking from "../models/Booking.js"
import Tour from "../models/Tour.js"
import User from "../models/User.js"
import { updateTourStatusAuto } from "../controllers/tourStatusController.js"

const normalizeBookingStatus = (booking) => {
    const normalized = booking.toObject ? booking.toObject() : { ...booking }
    if (normalized.status === 'cancelled') {
        normalized.status = 'Đã hủy'
    }
    return normalized
}

const isCancelledStatus = (status) => {
    if (!status) return false
    const normalized = status.toString().toLowerCase()
    return normalized === 'cancelled' || normalized === 'đã hủy'
}

const findTourDateIndex = (tourDates, bookingAt) => {
    return tourDates.findIndex(dateItem => {
        if (!dateItem || !dateItem.date) return false
        const tourDate = new Date(dateItem.date).toISOString().slice(0, 10)
        const selectedDate = new Date(bookingAt).toISOString().slice(0, 10)
        return tourDate === selectedDate
    })
}

const parsePositiveInt = (value) => Math.max(0, Number(value) || 0)

const calculateBookingPrice = (tourPrice, guestSize, childrenUnder7, children7To12) => {
    const totalGuests = parsePositiveInt(guestSize)
    const under7 = parsePositiveInt(childrenUnder7)
    const sevenTo12 = parsePositiveInt(children7To12)

    if (under7 + sevenTo12 > totalGuests) {
        throw new Error('Tổng số trẻ em không thể lớn hơn tổng số khách')
    }

    const adults = Math.max(0, totalGuests - under7 - sevenTo12)
    return Math.round((adults * tourPrice) + (sevenTo12 * tourPrice * 0.5))
}

const setGuideStatus = async (guideId, status) => {
    if (!guideId) return null
    return User.findByIdAndUpdate(guideId, { status }, { new: true })
}

const adjustTourSeats = async (tourId, bookingAt, guestSize, mode) => {
    const tour = await Tour.findById(tourId)
    if (!tour || !tour.tourDates?.length) return null

    const index = findTourDateIndex(tour.tourDates, bookingAt)
    if (index < 0) return null

    const dateItem = tour.tourDates[index]
    const guestCount = Number(guestSize) || 0
    if (guestCount <= 0) return null

    if (mode === 'reserve') {
        if (dateItem.seatsAvailable < guestCount) {
            throw new Error('Số khách vượt quá số ghế trống của ngày đã chọn')
        }
        dateItem.seatsAvailable -= guestCount
        dateItem.bookedCount += guestCount
    } else if (mode === 'restore') {
        dateItem.seatsAvailable += guestCount
        dateItem.bookedCount = Math.max(0, dateItem.bookedCount - guestCount)
    }

    await tour.save()
    return tour
}

export const createBooking = async(req,res)=>{
    try {
        const { tourId, bookingAt, guestSize, childrenUnder7, children7To12 } = req.body
        const guestCount = Number(guestSize) || 1
        const under7 = Number(childrenUnder7) || 0
        const sevenTo12 = Number(children7To12) || 0

        const tour = await Tour.findById(tourId)
        if (!tour) {
            return res.status(404).json({ success: false, message: 'Tour không tồn tại' })
        }

        if (!tour.tourDates || tour.tourDates.length === 0) {
            return res.status(400).json({ success: false, message: 'Tour chưa có ngày khởi hành. Vui lòng cập nhật ngày khởi hành trước.' })
        }

        if (under7 + sevenTo12 > guestCount) {
            return res.status(400).json({ success: false, message: 'Tổng số trẻ em không thể lớn hơn tổng số khách' })
        }

        const reserveResult = await adjustTourSeats(tourId, bookingAt, guestCount, 'reserve')
        if (!reserveResult) {
            return res.status(400).json({ success: false, message: 'Ngày khởi hành không hợp lệ hoặc đã hết ghế.' })
        }

        const totalPrice = calculateBookingPrice(tour.price, guestCount, under7, sevenTo12)
        const newBooking = new Booking({
            ...req.body,
            totalPrice,
            childrenUnder7: under7,
            children7To12: sevenTo12,
        })
        const saveBooking = await newBooking.save()
        if (req.body.guideId) {
            await setGuideStatus(req.body.guideId, 'Đang bận')
        }
        
        // Auto-update tour status (e.g., mark as full if all seats taken)
        await updateTourStatusAuto(tourId)
        
        return res.status(200).json({success:true, message:'Tour của bạn đã được đặt', data:saveBooking})
    } catch (err) {
        return res.status(500).json({success:false, message: err.message})
    }
}

export const getBooking = async(req, res)=>{
    const id = req.params.id

    try {
        let book = await Booking.findById(id)
            .populate('tourId')
            .populate('guideId', 'username email role status')
        if (!book) {
            return res.status(404).json({ success:false, message:'Không tìm thấy booking' })
        }

        if (book.userId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'nhân viên') {
            return res.status(403).json({ success:false, message:'Bạn không có quyền xem booking này' })
        }

        if (!book.tourId && book.tourName) {
            const tour = await Tour.findOne({ title: book.tourName }).select('itinerary')
            if (tour) {
                const plainBook = book.toObject()
                plainBook.tourId = { itinerary: tour.itinerary }
                return res.status(200).json({success:true, message:'Thành công', data:plainBook})
            }
        }

        return res.status(200).json({success:true, message:'Thành công', data:normalizeBookingStatus(book)})        
    } catch (err) {
        return res.status(500).json({success:false, message: err.message})
    }
}

export const getAllBooking = async(req, res)=>{
    try {
        const books = await Booking.find().populate('tourId')
        const normalizedBookings = books.map(normalizeBookingStatus)
        return res.status(200).json({success:true, message:'Thành công', data:normalizedBookings})        
    } catch (err) {
        return res.status(500).json({success:false, message:'Lỗi'})
    }
}

export const getBookingsByUser = async (req, res) => {
    const userId = req.params.userId

    try {
        const bookings = await Booking.find({ userId }).populate('tourId')
        const normalizedBookings = bookings.map(normalizeBookingStatus)
        return res.status(200).json({ success: true, message: 'Thành công', data: normalizedBookings })
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message })
    }
}

export const cancelBooking = async (req, res) => {
    const id = req.params.id

    try {
        const booking = await Booking.findById(id)
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy booking' })
        }

        if (booking.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền huỷ booking này' })
        }

        if (isCancelledStatus(booking.status)) {
            return res.status(400).json({ success: false, message: 'Booking đã được huỷ trước đó' })
        }

        await adjustTourSeats(booking.tourId, booking.bookingAt, Number(booking.guestSize || 1), 'restore')
        if (booking.guideId) {
            await setGuideStatus(booking.guideId, 'Đang rảnh')
        }
        booking.status = 'Đã hủy'
        await booking.save()

        return res.status(200).json({ success: true, message: 'Huỷ booking thành công', data: booking })
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message })
    }
}

export const updateBooking = async(req, res)=>{
    const id = req.params.id

    try {
        const existingBooking = await Booking.findById(id)
        if (!existingBooking) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy booking' })
        }

        const {
            startLocation,
            departureTime,
            consultant,
            tourGuide,
            specialNote,
            status,
            guestSize,
            childrenUnder7,
            children7To12,
            guideId
        } = req.body

        const prevCancelled = isCancelledStatus(existingBooking.status)
        const nextCancelled = isCancelledStatus(status)

        if (!prevCancelled && nextCancelled) {
            await adjustTourSeats(existingBooking.tourId, existingBooking.bookingAt, Number(existingBooking.guestSize || 1), 'restore')
        } else if (prevCancelled && !nextCancelled) {
            await adjustTourSeats(existingBooking.tourId, existingBooking.bookingAt, Number(existingBooking.guestSize || 1), 'reserve')
        }

        const tour = await Tour.findById(existingBooking.tourId)
        if (!tour) {
            return res.status(404).json({ success: false, message: 'Tour không tồn tại' })
        }

        const nextGuestSize = guestSize !== undefined ? Number(guestSize) : existingBooking.guestSize
        const nextUnder7 = childrenUnder7 !== undefined ? Number(childrenUnder7) : (existingBooking.childrenUnder7 || 0)
        const next7To12 = children7To12 !== undefined ? Number(children7To12) : (existingBooking.children7To12 || 0)

        if (nextUnder7 + next7To12 > nextGuestSize) {
            return res.status(400).json({ success: false, message: 'Tổng số trẻ em không thể lớn hơn tổng số khách' })
        }

        const totalPrice = calculateBookingPrice(tour.price, nextGuestSize, nextUnder7, next7To12)

        const previousGuideId = existingBooking.guideId ? existingBooking.guideId.toString() : null
        const updatedGuideId = guideId || previousGuideId

        if (previousGuideId && updatedGuideId && previousGuideId !== updatedGuideId) {
            await setGuideStatus(previousGuideId, 'Đang rảnh')
        }

        if (updatedGuideId) {
            await setGuideStatus(updatedGuideId, 'Đang bận')
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            id,
            {
                startLocation,
                departureTime,
                consultant,
                tourGuide,
                specialNote,
                status,
                guestSize: nextGuestSize,
                childrenUnder7: nextUnder7,
                children7To12: next7To12,
                totalPrice,
                guideId: updatedGuideId
            },
            { new: true, runValidators: false }
        )

        if (!updatedBooking) {
            return res.status(404).json({success:false, message:'Không tìm thấy booking'})
        }

        return res.status(200).json({
            success:true, 
            message:'Cập nhật booking thành công', 
            data:updatedBooking
        })        
    } catch (err) {
        return res.status(500).json({success:false, message: err.message})
    }
}

export const deleteBooking = async (req, res) => {
    const id = req.params.id

    try {
        const booking = await Booking.findById(id)

        if (!booking) {
            return res.status(404).json({success:false, message:'Không tìm thấy booking'})
        }

        // If booking isn't already cancelled, restore the seats for the tour date
        if (!isCancelledStatus(booking.status)) {
            await adjustTourSeats(booking.tourId, booking.bookingAt, Number(booking.guestSize || 1), 'restore')
        }

        if (booking.guideId) {
            await setGuideStatus(booking.guideId, 'Đang rảnh')
        }

        const deletedBooking = await Booking.findByIdAndDelete(id)

        return res.status(200).json({
            success:true,
            message:'Xóa booking thành công',
            data:deletedBooking
        })
    } catch (err) {
        return res.status(500).json({success:false, message: err.message})
    }
}

// Thống kê: Top 10 khách chi tiền nhiều nhất
export const getTopSpendingCustomers = async (req, res) => {
    try {
        const topCustomers = await Booking.aggregate([
            {
                $match: { status: { $nin: ['Đã hủy','Đã hoàn tiền'] } } // Exclude cancelled and refunded bookings
            },
            {
                $group: {
                    _id: '$fullName',
                    totalSpent: { $sum: '$totalPrice' },
                    bookingCount: { $sum: 1 },
                    userEmail: { $first: '$userEmail' },
                    phone: { $first: '$phone' }
                }
            },
            {
                $sort: { totalSpent: -1 }
            },
            {
                $limit: 10
            }
        ])

        return res.status(200).json({
            success: true,
            message: 'Top khách chi tiền nhiều nhất',
            data: topCustomers
        })
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message })
    }
}

// Thống kê: Top 10 khách đặt tour nhiều nhất
export const getTopFrequentCustomers = async (req, res) => {
    try {
        const topFrequent = await Booking.aggregate([
            {
                $match: { status: { $nin: ['Đã hủy','Đã hoàn tiền'] } }
            },
            {
                $group: {
                    _id: '$fullName',
                    bookingCount: { $sum: 1 },
                    totalSpent: { $sum: '$totalPrice' },
                    userEmail: { $first: '$userEmail' },
                    phone: { $first: '$phone' }
                }
            },
            {
                $sort: { bookingCount: -1 }
            },
            {
                $limit: 10
            }
        ])

        return res.status(200).json({
            success: true,
            message: 'Top khách đặt tour nhiều nhất',
            data: topFrequent
        })
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message })
    }
}

// Thống kê: Top 10 tour được đặt nhiều nhất
export const getTopBookedTours = async (req, res) => {
    try {
        const topTours = await Booking.aggregate([
            {
                $match: { status: { $nin: ['Đã hủy','Đã hoàn tiền'] } }
            },
            {
                $group: {
                    _id: '$tourName',
                    bookingCount: { $sum: 1 },
                    totalRevenue: { $sum: '$totalPrice' },
                    totalGuests: { $sum: '$guestSize' }
                }
            },
            {
                $sort: { bookingCount: -1 }
            },
            {
                $limit: 10
            }
        ])

        return res.status(200).json({
            success: true,
            message: 'Top tour được đặt nhiều nhất',
            data: topTours
        })
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message })
    }
}