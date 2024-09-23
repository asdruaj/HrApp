import mongoose from 'mongoose'

const feedbackSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  latestChangeBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reportTitle: {
    type: String,
    required: true
  },
  descriptionRequest: String,

  dueDate: {
    type: Date,
    required: true,
    default: new Date()
  },
  report: String,

  observations: String,

  status: {
    type: String,
    default: 'Pendiente'
  }

}, { timestamps: true })

const Feedback = mongoose.model('Feedback', feedbackSchema)

export default Feedback
