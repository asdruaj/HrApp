import express from 'express'
import { protect } from '../middleware/auth.js'
import { deleteEvent, editEvent, getEvent, getEvents, saveEvent } from '../controllers/events.js'

const router = express.Router()

router.get('/', protect, getEvents)

router.get('/:id', protect, getEvent)

router.post('/save', protect, saveEvent)

router.patch('/:id', protect, editEvent)

router.delete('/:id', protect, deleteEvent)

export default router
