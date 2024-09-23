import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      min: 2,
      max: 50
    },
    lastName: {
      type: String,
      required: true,
      min: 2,
      max: 50
    },
    position: String,
    department: String,
    hrPrivilege: {
      type: Boolean,
      default: false
    },
    adminPrivilege: {
      type: Boolean,
      default: false
    },
    email: {
      type: String,
      required: true,
      min: 2,
      max: 50
    },
    password: {
      type: String,
      required: true,
      min: 5
    },
    picturePath: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
)

const User = mongoose.model('User', UserSchema)

export default User
