import User from '../models/User.js'

export const createUser = async (req, res) => {
    const newUser = new User(req.body)
    try {
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
export const getAllUser = async (req, res) => {

    try {
        const users = await User.find({})
        res.status(200).json({ success: true, message: 'Tất cả các user', data: users })
    } catch (err) {
        res.status(404).json({ success: false, message: 'Không tìm thấy user' })
    }
}