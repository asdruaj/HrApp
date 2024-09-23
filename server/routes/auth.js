import express from 'express'
import { generateTemplink, getTokenData, login, logout } from '../controllers/auth.js'
import { isAdmin, protect } from '../middleware/auth.js'

const router = express.Router()

router.post('/login', login)
router.post('/logout', logout)
router.post('/generate-templink', protect, isAdmin, generateTemplink)
router.get('/linkTokenData/:token', getTokenData)
export default router
