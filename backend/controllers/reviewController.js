import Tour from "../models/Tour.js"
import Review from "../models/Review.js"

export const createReview = async(req, res)=>{
    const tourId = req.params.tourId
    const newReview = new Review({...req.body, productId: tourId})

    try {
        const saveReview = await newReview.save()

        await Tour.findByIdAndUpdate(tourId,{
            $push: {reviews: saveReview._id}
        })

        res.status(200).json({success:true, message:'Đã đánh giá', data: saveReview})
    } catch (err) {
        res.status(500).json({success:false, message:'Không thể đánh giá'})
    }
}

export const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find().populate('productId', 'title')
        return res.status(200).json({ success: true, message: 'Thành công', data: reviews })
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message })
    }
}

export const deleteReview = async (req, res) => {
    const id = req.params.id

    try {
        const review = await Review.findById(id)
        if (!review) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá' })
        }

        await Review.findByIdAndDelete(id)
        await Tour.findByIdAndUpdate(review.productId, { $pull: { reviews: id } })

        return res.status(200).json({ success: true, message: 'Xóa đánh giá thành công' })
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message })
    }
}
