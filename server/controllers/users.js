import User from '../models/User.js'
import bcrypt from 'bcrypt'

/* READ */
export const getUsers = async (req, res) => {
  try {
    const users = await User.find()
    res.status(200).json(users)
  } catch (err) {
    res.status(404).json({ message: err.message })
  }
}

/* READ */
export const getUser = async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)
    if (!user) return res.status(400).json({ message: "User doesn't exist" })
    res.status(200).json(user)
  } catch (err) {
    res.status(404).json({ message: err.message })
  }
}

export const editUser = async (req, res) => {
  try {
    const { id } = req.params
    const {
      firstName,
      lastName,
      email,
      password,
      position,
      department,
      adminPrivilege,
      hrPrivilege
    } = req.body

    const salt = await bcrypt.genSalt()

    if (password !== undefined) {
      const passwordHash = await bcrypt.hash(password, salt)
      const user = await User.findOneAndUpdate({ _id: id }, { firstName, lastName, email, position, department, hrPrivilege, adminPrivilege, password: passwordHash }, { new: true })
      res.status(200).json(user)
    } else {
      const user = await User.findOneAndUpdate({ _id: id }, { firstName, lastName, email, password, position, department, hrPrivilege, adminPrivilege }, { new: true })
      res.status(200).json(user)
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params
    const result = await User.deleteOne({ _id: id })
    res.status(200).json(result)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
