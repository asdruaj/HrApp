import mongoose from 'mongoose'

const linkTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

const LinkToken = mongoose.model('LinkToken', linkTokenSchema)

export default LinkToken
