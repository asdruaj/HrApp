import express from 'express'
import { protect } from '../middleware/auth.js'
import { deleteAbsenteeism, getAbsenteeism, getAbsenteeisms, saveAbsenteeism } from '../controllers/absenteeism.js'

const router = express.Router()

router.get('/', protect, getAbsenteeisms)

router.get('/:id', protect, getAbsenteeism)

router.post('/save', protect, saveAbsenteeism)

router.delete('/:id', protect, deleteAbsenteeism)

export default router
