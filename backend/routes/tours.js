import express from 'express'
import { createTour, deleteTour, getAllTour, getFeaturedTour, getSingleTour, getTourBySearch, getTourCount, updateTour } from '../controllers/tourController.js';
import { 
  getTourStatusOverview,
  getToursPendingConfirmation,
  getToursFillStatus,
  updateTourFillDecision,
  confirmTourToRun,
  cancelTour,
  markTourDeparted,
  markTourCompleted,
  getTourStatusDetail
} from '../controllers/tourStatusController.js';
import { verifyAdmin, verifyAdminOrStaff } from '../utils/verifyToken.js';
import { verifyTourStatusPermission } from '../middleware/tourStatusMiddleware.js';
import multer from 'multer';
import path from 'path';


const router = express.Router()
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Đảm bảo bạn đã tạo thư mục 'uploads' ở thư mục gốc Backend
    },
    filename: (req, file, cb) => {
        // Tạo tên file duy nhất: thời gian + tên gốc
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Middleware xử lý nhiều loại file: 1 ảnh chính (photo) và tối đa 10 ảnh phụ (images)
const uploadMiddleware = upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'images', maxCount: 10 }
]);
router.get('/', getAllTour)
router.get('/search/getTourBySearch', getTourBySearch)
router.get('/search/getFeaturedTours', getFeaturedTour)
router.get('/search/getTourCount', getTourCount)
router.post('/', verifyAdminOrStaff, uploadMiddleware, createTour)
router.put('/:id',verifyAdminOrStaff, uploadMiddleware, updateTour)
router.delete('/:id',verifyAdminOrStaff, deleteTour)
router.get('/:id', getSingleTour)

// ===== TOUR STATUS MANAGEMENT ENDPOINTS =====
// Get tour status overview (for dashboard)
router.get('/status/overview', verifyAdminOrStaff, getTourStatusOverview)

// Get tours fill status for monitoring
router.get('/status/fill', verifyAdminOrStaff, getToursFillStatus)
router.put('/status/fill/:id', verifyAdminOrStaff, verifyTourStatusPermission, updateTourFillDecision)

// Get tours pending confirmation
router.get('/status/pending-confirmation', verifyAdminOrStaff, getToursPendingConfirmation)

// Get detailed status of a specific tour
router.get('/status/detail/:id', verifyAdminOrStaff, getTourStatusDetail)

// Confirm tour will run
router.put('/status/confirm/:id', verifyAdminOrStaff, verifyTourStatusPermission, confirmTourToRun)

// Cancel tour
router.put('/status/cancel/:id', verifyAdminOrStaff, verifyTourStatusPermission, cancelTour)

// Mark tour as departed
router.put('/status/departed/:id', verifyAdminOrStaff, verifyTourStatusPermission, markTourDeparted)

// Mark tour as completed
router.put('/status/completed/:id', verifyAdminOrStaff, verifyTourStatusPermission, markTourCompleted)


export default router;