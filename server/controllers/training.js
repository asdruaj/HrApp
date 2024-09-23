import mongoose from 'mongoose'
import Training from '../models/Training.js'

export const getEveryTraining = async (req, res) => {
  try {
    const training = await Training.find()
    res.status(200).json(training)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getTraining = async (req, res) => {
  try {
    const { id } = req.params

    const training = await Training.findById(mongoose.Types.ObjectId.createFromHexString(id))

    if (!training) return res.status(400).json({ message: 'Record does not exist!' })

    res.status(200).json(training)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const saveTraining = async (req, res) => {
  try {
    const training = req.body

    const newTraining = new Training(training)

    const savedTraining = await newTraining.save()

    res.status(200).json(savedTraining)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const editTraining = async (req, res) => {
  try {
    const { id } = req.params
    const newTrainingData = req.body

    const editedTraining = await Training.findOneAndUpdate({ _id: id }, newTrainingData, { new: true })

    if (!editedTraining) return res.status(400).json({ message: 'This Record does not exist' })

    res.status(200).json(editedTraining)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const deleteTraining = async (req, res) => {
  try {
    const { id } = req.params

    const result = await Training.deleteOne({ _id: id })
    if (result.deletedCount < 1) return res.status(400).json({ error: 'No records deleted' })

    res.status(200).json(result)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
