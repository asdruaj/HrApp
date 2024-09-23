import Event from '../models/Events.js'
import mongoose from 'mongoose'

export const getEvents = async (req, res) => {
  try {
    const event = await Event.find()
    res.status(200).json(event)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getEvent = async (req, res) => {
  try {
    const { id } = req.params

    const event = await Event.findById(mongoose.Types.ObjectId.createFromHexString(id))

    if (!event) return res.status(400).json({ message: 'Record does not exist!' })

    res.status(200).json(event)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
export const saveEvent = async (req, res) => {
  try {
    const event = req.body

    const newEvent = await new Event(event)

    const savedEvent = await newEvent.save()

    res.status(200).json(savedEvent)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const editEvent = async (req, res) => {
  try {
    const { id } = req.params
    const newEventData = req.body

    const editedEvent = await Event.findOneAndUpdate({ _id: id }, newEventData, { new: true })

    if (!editedEvent) return res.status(400).json({ message: 'This Record does not exist' })

    res.status(200).json(editedEvent)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params

    const result = await Event.deleteOne({ _id: id })
    if (result.deletedCount < 1) return res.status(400).json({ error: 'No records deleted' })

    res.status(200).json(result)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
