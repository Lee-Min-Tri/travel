import express from 'express'
import { createUser, deleteUser, getAllUser, getGuides, getSingleUser, updateUser } from '../controllers/userControllers.js'
const router = express.Router()

import { verifyAdmin, verifyAdminOrStaff, verifyUser } from '../utils/verifyToken.js'

router.post('/', verifyAdmin, createUser)
router.put('/:id', verifyUser, updateUser)
router.delete('/:id',verifyUser, deleteUser)
router.get('/guides', verifyAdminOrStaff, getGuides)
router.get('/:id', verifyUser, getSingleUser)
router.get('/',verifyAdmin, getAllUser)

export default router;