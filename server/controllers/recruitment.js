import mongoose from 'mongoose'
import Recruitment from '../models/recruitment.js'

export const getEveryRecruitment = async (req, res) => {
  try {
    const recruitments = await Recruitment.find()
    res.status(200).json(recruitments)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getRecruitment = async (req, res) => {
  try {
    const { id } = req.params

    const recruitment = await Recruitment.findById(mongoose.Types.ObjectId.createFromHexString(id))

    if (!recruitment) return res.status(400).json({ message: 'Record does not exist!' })

    res.status(200).json(recruitment)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
export const saveRecruitment = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      idDocument,
      department,
      position,
      applicationDate,
      status,
      interviewDate,
      interviewer
    } = req.body

    const filename = req.file?.filename || ''

    const newRecruitment = new Recruitment({
      firstName,
      lastName,
      idDocument,
      department,
      position,
      applicationDate,
      status,
      interviewDate,
      interviewer,
      cvPath: filename
    })

    const savedRecruitment = await newRecruitment.save()

    res.status(200).json(savedRecruitment)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const editRecruitment = async (req, res) => {
  try {
    const { id } = req.params
    const {
      firstName,
      lastName,
      idDocument,
      department,
      position,
      applicationDate,
      status,
      interviewDate,
      interviewer
    } = req.body

    const filename = req.file && req.file.filename

    const editedRecruitment = await Recruitment.findOneAndUpdate({ _id: id },
      {
        firstName,
        lastName,
        idDocument,
        department,
        position,
        applicationDate,
        status,
        interviewDate,
        interviewer,
        cvPath: filename
      }, { new: true })

    if (!editedRecruitment) return res.status(400).json({ message: 'This Record does not exist' })

    res.status(200).json(editedRecruitment)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const deleteRecruitment = async (req, res) => {
  try {
    const { id } = req.params

    const result = await Recruitment.deleteOne({ _id: id })
    if (result.deletedCount < 1) return res.status(400).json({ error: 'No records deleted' })

    res.status(200).json(result)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
