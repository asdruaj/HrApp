import express from 'express'
import {
  getUser,
  editUser,
  deleteUser,
  getUsers
} from '../controllers/users.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

/*  READ */
router.get('/all', protect, getUsers)

/*  READ */
router.get('/:id', protect, getUser)

/* UPDATE */
router.patch('/:id', protect, editUser)

/* DELETE */
router.delete('/:id', protect, deleteUser)

export default router
