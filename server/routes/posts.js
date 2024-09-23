import express from 'express'
import { getFeedPosts, likePost } from '../controllers/posts.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

/* READ */
router.get('/', protect, getFeedPosts)

/* UPDATE */
router.patch('/:id/like', protect, likePost)

export default router
