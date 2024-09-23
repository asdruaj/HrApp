import mongoose from 'mongoose'
import Feedback from '../models/Feedback.js'

export const getEveryFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().populate({ path: 'createdBy', select: ['firstName', 'lastName'] }).populate({ path: 'latestChangeBy', select: ['firstName', 'lastName'] })
    res.status(200).json(feedbacks)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getFeedback = async (req, res) => {
  try {
    const { id } = req.params

    const feedback = await Feedback.findById(mongoose.Types.ObjectId.createFromHexString(id)).populate({ path: 'createdBy', select: ['firstName', 'lastName'] }).populate({ path: 'latestChangeBy', select: ['firstName', 'lastName'] })

    if (!feedback) return res.status(400).json({ message: 'Record does not exist!' })

    res.status(200).json(feedback)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
export const saveFeedback = async (req, res) => {
  try {
    const feedback = req.body

    const newFeedback = await new Feedback(feedback)

    const savedFeedback = await newFeedback.save()

    res.status(200).json(savedFeedback)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const editFeedback = async (req, res) => {
  try {
    const { id } = req.params
    const newFeedbackData = req.body

    const editedFeedback = await Feedback.findOneAndUpdate({ _id: id }, newFeedbackData, { new: true })

    if (!editedFeedback) return res.status(400).json({ message: 'This Record does not exist' })

    res.status(200).json(editedFeedback)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params

    const result = await Feedback.deleteOne({ _id: id })
    if (result.deletedCount < 1) return res.status(400).json({ error: 'No records deleted' })

    res.status(200).json(result)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
