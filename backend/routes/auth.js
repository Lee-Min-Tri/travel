import express from "express"
import { login, register, updatePassword } from "../controllers/authController.js"
import { verifyUser } from '../utils/verifyToken.js';

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.post('/update-password/:id', verifyUser, updatePassword);

export default router