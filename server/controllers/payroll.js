import Payroll from '../models/Payroll.js'

import mongoose from 'mongoose'

export const getEntirePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.find()
    res.status(200).json(payroll)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getOneRecord = async (req, res) => {
  try {
    const { id } = req.params

    const records = await Payroll.findById(mongoose.Types.ObjectId.createFromHexString(id))

    if (!records) return res.status(400).json({ message: 'Employee does not exist!' })

    res.status(200).json(records)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getRecordsByEmployee = async (req, res) => {
  try {
    const { id } = req.params

    const records = await Payroll.findOne({ employee: mongoose.Types.ObjectId.createFromHexString(id) })

    if (!records) return res.status(400).json({ message: 'Employee does not exist!' })

    res.status(200).json(records)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const savePayroll = async (req, res) => {
  try {
    const { employee, payDate, grossPay, deductions, netPay } = req.body

    const newPayroll = new Payroll({ employee, payDate, grossPay, deductions, netPay })

    const savedPayroll = await newPayroll.save()

    res.status(200).json(savedPayroll)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const editPayroll = async (req, res) => {
  try {
    const { id } = req.params
    const newPayrollData = req.body

    const editedPayroll = await Payroll.findOneAndUpdate({ _id: id }, newPayrollData, { new: true })

    if (!editedPayroll) return res.status(400).json({ message: 'This Record does not exist' })

    res.status(200).json(editedPayroll)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const deletePayroll = async (req, res) => {
  try {
    const { id } = req.params

    const result = await Payroll.deleteOne({ _id: id })
    if (result.deletedCount < 1) return res.status(400).json({ error: 'No records deleted' })

    res.status(200).json(result)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
