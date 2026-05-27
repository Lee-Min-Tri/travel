import User from '../models/User.js'
import bcrypt from 'bcryptjs'

export const createUser = async (req, res) => {
    try {
        if (!req.body.password) {
            return res.status(400).json({ success: false, message: 'Mật khẩu là bắt buộc' })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password, salt)

        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            photo: req.body.photo,
            phone: req.body.phone || '',
            role: req.body.role || 'user',
            status: req.body.status || 'Đang rảnh'
        })

        const saveUser = await newUser.save()
        res.status(200).json({ success: true, message: 'Tạo user thành công', data: saveUser })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Tạo user thất bại' })
    }
}

export const updateUser = async (req, res) => {
    const id = req.params.id
    try {
        let dataToUpdate = { ...req.body };

        // Nếu ô password trống, xóa nó khỏi data để không bị lưu đè vào DB
        if (!dataToUpdate.password || dataToUpdate.password === "") {
            delete dataToUpdate.password;
        } else {
            // Nếu có nhập mật khẩu mới thì mới mã hóa
            const salt = await bcrypt.genSalt(10);
            dataToUpdate.password = await bcrypt.hash(dataToUpdate.password, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: dataToUpdate },
            { new: true }
        );

        res.status(200).json({ success: true, message: 'Cập nhật user thành công', data: updatedUser })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Cập nhật user thất bại' })
    }
}
export const deleteUser = async (req, res) => {
    const id = req.params.id
    try {
        await User.findByIdAndDelete(id)

        res.status(200).json({ success: true, message: 'Xóa user thành công' })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Xóa user thất bại' })
    }
}
export const getSingleUser = async (req, res) => {
    const id = req.params.id
    try {
        const user = await User.findById(id)

        res.status(200).json({ success: true, message: 'Các user gợi ý', data: user })
    } catch (err) {
        res.status(404).json({ success: false, message: 'Không tìm thấy user' })
    }
}

export const getGuides = async (req, res) => {
    try {
        const guides = await User.find({ role: 'guide' }).select('username email phone status role')
        const normalizedGuides = guides.map(guide => ({
            _id: guide._id,
            username: guide.username,
            email: guide.email,
            phone: guide.phone || '',
            role: guide.role,
            status: guide.status || 'Đang rảnh'
        }))
        res.status(200).json({ success: true, message: 'Các hướng dẫn viên', data: normalizedGuides })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Không thể tải danh sách hướng dẫn viên' })
    }
}

export const getAllUser = async (req, res) => {

    try {
        const users = await User.find({})
        res.status(200).json({ success: true, message: 'Tất cả các user', data: users })
    } catch (err) {
        res.status(404).json({ success: false, message: 'Không tìm thấy user' })
    }
}