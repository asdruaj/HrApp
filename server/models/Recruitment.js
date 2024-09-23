import mongoose from 'mongoose'

const recruitmentSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  idDocument: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  applicationDate: {
    type: Date,
    default: new Date()
  },
  status: {
    type: String,
    required: true
  },
  interviewDate: {
    type: Date,
    default: new Date()
  },
  interviewer: {
    type: String
  },
  cvPath: {
    type: String
  }
})

const Recruitment = mongoose.model('Recruitment', recruitmentSchema)

export default Recruitment
