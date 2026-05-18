import User from "../models/User.js";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const register = async(req, res)=>{
    try {
        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(req.body.password, salt)

        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hash,
            photo: req.body.photo,
            
        })

        await newUser.save()
        res.status(200).json({success:true, message: "Tạo tài khoản thành công"})
    } catch (err) {
        res.status(500).json({success:false, error: err.message})
    }
}
export const login = async(req, res)=>{
    const email = req.body.email

    try {
        const user = await User.findOne({email})
        if(!user){
            return res.status(404).json({success:false, message:'Không tìm thấy người dùng'})
        }

        const checkCorrectPassword = await bcrypt.compare(req.body.password, user.password)
        if(!checkCorrectPassword){
            return res.status(401).json({success:false, message:'không đúng email hoặc mật khẩu'})
        }

        const { password, ...rest } = user._doc;
        const token = jwt.sign(
          {
            id: user._id,
            role: user.role,
            email: user.email,
          },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "15d" }
        );

        return res
          .cookie('accessToken', token, {
            httpOnly: true,
            secure: true,
            expires: token.expiresIn,
          })
          .status(200)
          .json({ success: true, message: 'đăng nhập thành công', token, data: { ...rest } });
    } catch (err) {
        res.status(500).json({ success: false, message: 'không thể đăng nhập' });
    }
}

export const updatePassword = async (req, res) => {
    const userId = req.user.id; // ID lấy từ middleware verifyToken/verifyUser
    const { oldPassword, newPassword } = req.body;

    try {
        // 1. Tìm người dùng trong database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "Người dùng không tồn tại" });
        }

        // 2. Kiểm tra mật khẩu cũ có khớp không
        const isCorrect = await bcrypt.compare(oldPassword, user.password);
        if (!isCorrect) {
            return res.status(401).json({ success: false, message: "Mật khẩu cũ không chính xác!" });
        }

        // 3. Mã hóa mật khẩu mới
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(newPassword, salt);

        // 4. Cập nhật vào database
        await User.findByIdAndUpdate(userId, {
            $set: { password: hash }
        });

        res.status(200).json({ success: true, message: "Đổi mật khẩu thành công!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Lỗi server, không thể đổi mật khẩu" });
    }
};