import express from 'express'
import { protect } from '../middleware/auth.js'
import { deleteFeedback, editFeedback, getEveryFeedback, getFeedback, saveFeedback } from '../controllers/feedback.js'

const router = express.Router()

router.get('/', protect, getEveryFeedback)

router.get('/:id', protect, getFeedback)

router.post('/save', protect, saveFeedback)

router.patch('/:id', protect, editFeedback)

router.delete('/:id', protect, deleteFeedback)

export default router
