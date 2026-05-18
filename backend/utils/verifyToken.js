import jwt from 'jsonwebtoken'

// 1. Hàm verifyToken để giải mã Token từ Header
export const verifyToken = (req, res, next) => {
    // Lấy token từ Header Authorization (Bearer <token>)
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: "Bạn chưa đăng nhập hoặc không có token!" 
        });
    }

    // Xác thực token
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(401).json({ 
                success: false, 
                message: "Token không hợp lệ hoặc đã hết hạn!" 
            });
        }

        req.user = user;
        next(); // Chuyển tiếp sang middleware kiểm tra quyền (User/Admin)
    });
}

// 2. Middleware kiểm tra User (Chính chủ hoặc Admin)
export const verifyUser = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user) {
            next();
        } else {
            return res.status(403).json({ 
                success: false, 
                message: "Bạn không có quyền thực hiện hành động này!" 
            });
        }
    });
}

// 3. Middleware kiểm tra Admin (Bắt buộc phải là Admin)
export const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === 'admin') {
            next();
        } else {
            return res.status(403).json({ 
                success: false, 
                message: "Bạn không được phép truy cập, yêu cầu quyền Admin!" 
            });
        }
    });
}

export const verifyAdminOrStaff = (req, res, next) => {
   verifyToken(req, res, () => {
      if (req.user.role === "admin" || req.user.role === "nhân viên") {
         next();
      } else {
         return res.status(403).json({ success: false, message: "Bạn không có quyền truy cập!" });
      }
   });
};