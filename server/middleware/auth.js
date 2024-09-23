import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protect = async (req, res, next) => {
  const token = req.cookies.jwt
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      req.user = await User.findById(decoded.userId).select('-password')
      next()
    } catch (error) {
      console.error(error)
      res.status(401).json({ error: error.message })
    }
  } else {
    res.status(401).json({ error: 'Not authorized, no token' })
  }
}

export const isAdmin = async (req, res, next) => {
  if (req.user) {
    if (req.user.adminPrivilege) {
      next()
    } else {
      res.status(401).json({ message: 'No posee los permisos necesarios para realizar esta acción.' })
    }
  } else {
    // If req.user is not set, handle the case accordingly
    res.status(401).json({ error: 'User not found' })
  }
}

export const isHr = async (req, res, next) => {
  if (req.user) {
    if (req.user.hrPrivilege) {
      next()
    } else {
      res.status(401).json({ message: 'No posee los permisos necesarios para realizar esta acción.' })
    }
  } else {
    // If req.user is not set, handle the case accordingly
    res.status(401).json({ error: 'User not found' })
  }
}
