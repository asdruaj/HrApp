import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema({
  start: {
    type: Date,
    required: true,
    default: new Date()
  },
  end: {
    type: Date,
    required: true,
    default: new Date()
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  }
})

const Event = mongoose.model('Event', eventSchema)

export default Event
