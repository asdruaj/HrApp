import express from 'express'
import { protect } from '../middleware/auth.js'
import { deleteRecruitment, getEveryRecruitment, getRecruitment } from '../controllers/recruitment.js'

const router = express.Router()

router.get('/', protect, getEveryRecruitment)

router.get('/:id', protect, getRecruitment)

router.delete('/:id', protect, deleteRecruitment)

export default router
