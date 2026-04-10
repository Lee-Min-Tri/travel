import Booking from "../models/Booking.js"

export const createBooking = async(req,res)=>{
    const newBooking = new Booking(req.body)

    try {
        const saveBooking = await newBooking.save()
        return res.status(200).json({success:true, message:'Tour của bạn đã được đặt', data:saveBooking})
    } catch (err) {
        return res.status(500).json({success:false, message: err.message})
    }
}

export const getBooking = async(req, res)=>{
    const id = req.params.id

    try {
        const book = await Booking.findById(id)

        return res.status(200).json({success:true, message:'Thành công', data:book})        
    } catch (err) {
        return res.status(404).json({success:false, message:'Không tìm thấy'})
    }
}

export const getAllBooking = async(req, res)=>{

    try {
        const books = await Booking.findById(id)

        return res.status(200).json({success:true, message:'Thành công', data:books})        
    } catch (err) {
        return res.status(500).json({success:false, message:'Lỗi'})
    }
}