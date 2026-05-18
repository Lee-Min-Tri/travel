import Tour from '../models/Tour.js'

const parseTourDates = (tourData, defaultCapacity) => {
    if (!tourData.tourDates) return tourData;
    try {
        const dates = JSON.parse(tourData.tourDates);
        if (!Array.isArray(dates)) {
            throw new Error('Dữ liệu tourDates phải là mảng');
        }
        tourData.tourDates = dates.map(item => ({
            date: item.date,
            seatsAvailable: item.seatsAvailable !== undefined ? Number(item.seatsAvailable) : Number(defaultCapacity) || 0,
            bookedCount: Number(item.bookedCount || 0)
        }));
    } catch (err) {
        throw err;
    }
    return tourData;
}

export const createTour = async (req, res) => {
    // 1. Lấy tên file ảnh đại diện (photo)
    const photo = req.files && req.files['photo']
        ? req.files['photo'][0].filename
        : "";

    // 2. Lấy danh sách tên file ảnh thư viện (images)
    const images = req.files && req.files['images']
        ? req.files['images'].map(file => file.filename)
        : [];

    // 3. Parse itinerary từ JSON string nếu có
    let tourData = { ...req.body };
    if (tourData.itinerary) {
        try {
            tourData.itinerary = JSON.parse(tourData.itinerary);
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu itinerary không hợp lệ'
            });
        }
    }

    if (tourData.tourDates) {
        try {
            tourData = parseTourDates(tourData, tourData.maxGroupSize || 0);
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: err.message || 'Dữ liệu tourDates không hợp lệ'
            });
        }
    }

    // 4. Tạo đối tượng tour mới kết hợp req.body và các file ảnh
    const newTour = new Tour({
        ...tourData,
        photo: photo,
        images: images
    });

    try {
        const saveTour = await newTour.save();
        res.status(200).json({
            success: true,
            message: 'Tạo tour thành công',
            data: saveTour
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const updateTour = async (req, res) => {
    const id = req.params.id;

    try {
        // Tạo một đối tượng update chứa dữ liệu từ body (title, city, price...)
        let updateData = { ...req.body };

        // Parse itinerary từ JSON string nếu có
        if (updateData.itinerary) {
            try {
                updateData.itinerary = JSON.parse(updateData.itinerary);
            } catch (err) {
                return res.status(400).json({
                    success: false,
                    message: 'Dữ liệu itinerary không hợp lệ'
                });
            }
        }

        // Parse tourDates nếu có
        if (updateData.tourDates) {
            const currentTour = await Tour.findById(id).select('maxGroupSize');
            const defaultCapacity = updateData.maxGroupSize || currentTour?.maxGroupSize || 0;
            try {
                updateData = parseTourDates(updateData, defaultCapacity);
            } catch (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message || 'Dữ liệu tourDates không hợp lệ'
                });
            }
        }

        // KIỂM TRA VÀ CẬP NHẬT ẢNH MỚI (NẾU CÓ)
        // 1. Cập nhật ảnh đại diện (photo)
        if (req.files && req.files['photo']) {
            updateData.photo = req.files['photo'][0].filename;
        }

        // 2. Cập nhật thư viện ảnh (images)
        if (req.files && req.files['images']) {
            updateData.images = req.files['images'].map(file => file.filename);
        }

        const updatedTour = await Tour.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Cập nhật tour thành công',
            data: updatedTour
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Cập nhật tour thất bại'
        });
    }
};
export const deleteTour = async (req, res) => {
    const id = req.params.id
    try {
        await Tour.findByIdAndDelete(id)

        res.status(200).json({ success: true, message: 'Xóa tour thành công' })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Xóa tour thất bại' })
    }
}
export const getSingleTour = async (req, res) => {
    const id = req.params.id;
    try {
        const tour = await Tour.findById(id).populate("reviews");

        if (!tour) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tour với ID này'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Đã tìm thấy tour', // Đổi message ở đây
            data: tour
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: 'ID sai định dạng hoặc lỗi hệ thống',
            error: err.message // Thêm cái này để soi lỗi trong Postman
        });
    }
}
export const getAllTour = async (req, res) => {
    const page = parseInt(req.query.page)

    try {
        const tours = await Tour.find({}).populate("reviews").skip(page * 8).limit(8)
        res.status(200).json({ success: true, count: tours.length, message: 'Tất cả các tour', data: tours })
    } catch (err) {
        res.status(404).json({ success: false, message: 'Không tìm thấy tour' })
    }
}

export const getTourBySearch = async (req, res) => {
    const city = new RegExp(req.query.city, 'i')
    const distance = parseInt(req.query.distance) || 0
    const maxGroupSize = parseInt(req.query.maxGroupSize) || 1

    try {
        const tours = await Tour.find({
            $or: [
                { city: city },
                { title: city },
                { address: city }
            ], distance: { $gte: distance }, maxGroupSize: { $gte: maxGroupSize }
        }).populate("reviews")

        res.status(200).json({ success: true, message: 'Tất cả các tour', data: tours })
    } catch (error) {
        res.status(404).json({ success: false, message: 'Không tìm thấy tour' })
    }
}

export const getFeaturedTour = async (req, res) => {

    try {
        const tours = await Tour.find({ featured: true }).populate("reviews").limit(8)
        res.status(200).json({ success: true, message: 'Tất cả các tour', data: tours })
    } catch (err) {
        res.status(404).json({ success: false, message: 'Không tìm thấy tour' })
    }
}

export const getTourCount = async (req, res) => {
    try {
        const tourCount = await Tour.estimatedDocumentCount()

        res.status(200).json({ success: true, data: tourCount })
    } catch (err) {
        res.status(500).json({ success: false, message: "failed to fetch" })
    }
}