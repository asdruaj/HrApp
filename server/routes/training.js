import express from 'express'
import { deleteTraining, editTraining, getEveryTraining, getTraining, saveTraining } from '../controllers/training.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.get('/', protect, getEveryTraining)

router.get('/:id', protect, getTraining)

router.post('/save', protect, saveTraining)

router.patch('/:id', protect, editTraining)

router.delete('/:id', protect, deleteTraining)

export default router
