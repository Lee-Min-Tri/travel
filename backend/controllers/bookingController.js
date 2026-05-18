import Booking from "../models/Booking.js"
import Tour from "../models/Tour.js"

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
        const { tourId, bookingAt, guestSize } = req.body
        const guestCount = Number(guestSize) || 1

        const tour = await Tour.findById(tourId)
        if (!tour) {
            return res.status(404).json({ success: false, message: 'Tour không tồn tại' })
        }

        if (!tour.tourDates || tour.tourDates.length === 0) {
            return res.status(400).json({ success: false, message: 'Tour chưa có ngày khởi hành. Vui lòng cập nhật ngày khởi hành trước.' })
        }

        const reserveResult = await adjustTourSeats(tourId, bookingAt, guestCount, 'reserve')
        if (!reserveResult) {
            return res.status(400).json({ success: false, message: 'Ngày khởi hành không hợp lệ hoặc đã hết ghế.' })
        }

        const newBooking = new Booking(req.body)
        const saveBooking = await newBooking.save()
        return res.status(200).json({success:true, message:'Tour của bạn đã được đặt', data:saveBooking})
    } catch (err) {
        return res.status(500).json({success:false, message: err.message})
    }
}

export const getBooking = async(req, res)=>{
    const id = req.params.id

    try {
        let book = await Booking.findById(id).populate('tourId')
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

        const { startLocation, departureTime, consultant, tourGuide, specialNote, status } = req.body
        const prevCancelled = isCancelledStatus(existingBooking.status)
        const nextCancelled = isCancelledStatus(status)

        if (!prevCancelled && nextCancelled) {
            await adjustTourSeats(existingBooking.tourId, existingBooking.bookingAt, Number(existingBooking.guestSize || 1), 'restore')
        } else if (prevCancelled && !nextCancelled) {
            await adjustTourSeats(existingBooking.tourId, existingBooking.bookingAt, Number(existingBooking.guestSize || 1), 'reserve')
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            id,
            {
                startLocation,
                departureTime,
                consultant,
                tourGuide,
                specialNote,
                status
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
        const deletedBooking = await Booking.findByIdAndDelete(id)

        if (!deletedBooking) {
            return res.status(404).json({success:false, message:'Không tìm thấy booking'})
        }

        return res.status(200).json({
            success:true,
            message:'Xóa booking thành công',
            data:deletedBooking
        })
    } catch (err) {
        return res.status(500).json({success:false, message: err.message})
    }
}