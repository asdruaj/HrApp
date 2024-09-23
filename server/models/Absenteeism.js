import mongoose from 'mongoose'

const absenteeismSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Types.ObjectId,
    ref: 'Employee'
  },
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
  reason: {
    type: String
  }
})

const Absenteeism = mongoose.model('Absenteeism', absenteeismSchema)

export default Absenteeism
