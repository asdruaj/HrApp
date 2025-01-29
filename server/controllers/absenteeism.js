import Absenteeism from '../models/Absenteeism.js'
import Employee from '../models/Employee.js'
import { mongoose } from 'mongoose'

export const getAbsenteeisms = async (req, res) => {
  try {
    const absenteeisms = await Absenteeism.find().populate({ path: 'employee', select: ['firstName', 'lastName', 'department', 'position', 'vacationDays', 'sickDays', 'unjustifiedAbsences', 'picturePath'] })
    res.status(200).json(absenteeisms)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getAbsenteeism = async (req, res) => {
  try {
    const { id } = req.params

    const absenteeism = await Absenteeism.findById(mongoose.Types.ObjectId.createFromHexString(id)).populate({ path: 'employee', select: ['firstName', 'lastName', 'department', 'position', 'vacationDays', 'sickDays', 'unjustifiedAbsences', 'picturePath'] })

    if (!absenteeism) return res.status(400).json({ message: 'Record does not exist!' })

    res.status(200).json(absenteeism)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const saveAbsenteeism = async (req, res) => {
  /*
  we use sessions to create a mongoDb transaction in order to ensure that either every
  query comes through or any of them does
  */
  const session = await mongoose.startSession()

  try {
    /* 1) Calculates time between dates and saves new record */
    const { start, end, employee, reason } = req.body

    const startDate = new Date(start).getTime()
    const endDate = new Date(end).getTime()

    const diff = endDate - startDate

    const dayDiff = diff / (1000 * 60 * 60 * 24) + 1

    await session.startTransaction()

    const newAbsenteeism = await new Absenteeism({ start, end, employee, reason })

    /* Deducts or add days in vacationDays, sicknessDays (if they have enough) or unjustifiedAbsences */
    const employeeData = await Employee.findById(employee)
    let employeeEdited
    let savedAbsenteeism

    if (!employeeData) throw new Error('This employee does not exist in the database')

    if (reason.toLowerCase() === 'vacation') {
      if (employeeData.vacationDays - dayDiff < 0) throw new Error('Este empleado no tiene suficientes días de vacaciones disponibles')

      employeeEdited = await Employee.findOneAndUpdate({ _id: employee }, { $inc: { vacationDays: -dayDiff } }, { new: true, select: 'vacationDays' }).session(session)
      savedAbsenteeism = await newAbsenteeism.save()
    } else if (reason.toLowerCase() === 'sickness') {
      if (employeeData.sickDays - dayDiff < 0) throw new Error('Este empleado no tiene suficientes bajas por enfermedad disponibles')

      savedAbsenteeism = await newAbsenteeism.save()
      employeeEdited = await Employee.findOneAndUpdate({ _id: employee }, { $inc: { sickDays: -dayDiff } }, { new: true, select: 'sickDays' }).session(session)
    } else if (reason.toLowerCase() === 'motherhood') {
      savedAbsenteeism = await newAbsenteeism.save()
    } else if (reason.toLowerCase() === 'fatherhood') {
      savedAbsenteeism = await newAbsenteeism.save()
    } else if (reason.toLowerCase() === 'family loss') {
      savedAbsenteeism = await newAbsenteeism.save()
    } else {
      employeeEdited = await Employee.findOneAndUpdate({ _id: employee }, { $inc: { unjustifiedAbsences: dayDiff } }, { new: true, select: 'unjustifiedAbsences' }).session(session)
    }
    await session.commitTransaction()

    res.status(200).json({ savedAbsenteeism, employeeEdited })
  } catch (err) {
    await session.abortTransaction()
    res.status(500).json({ message: err.message })
  } finally {
    session.endSession()
  }
}

export const deleteAbsenteeism = async (req, res) => {
  try {
    const { id } = req.params

    const result = await Absenteeism.deleteOne({ _id: id })
    if (result.deletedCount < 1) return res.status(400).json({ error: 'No records deleted' })

    res.status(200).json(result)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
