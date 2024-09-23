import mongoose from 'mongoose'

const trainingSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: true
  },
  instructor: String,

  description: String,

  startDate: {
    type: Date,
    required: true,
    default: new Date()
  },

  endDate: {
    type: String,
    default: new Date()
  },

  departments: {
    type: Array,
    default: []
  },
  status: {
    type: String,
    default: 'Pendiente'
  },

  location: String,

  capacity: Number,

  attendance: {
    type: Array,
    default: []
  }
})

const Training = mongoose.model('Training', trainingSchema)

export default Training
