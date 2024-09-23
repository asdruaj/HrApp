import express from 'express'
import {
  deletePayroll,
  editPayroll,
  getEntirePayroll,
  getOneRecord,
  getRecordsByEmployee,
  savePayroll
} from '../controllers/payroll.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

/* Get every record */
router.get('/', protect, getEntirePayroll)

/* Get single payroll record Id */
router.get('/:id', protect, getOneRecord)

/* Get every payroll record of an employee */
router.get('employee/:Id', protect, getRecordsByEmployee)

router.post('/save', protect, savePayroll)

router.patch('/:id', protect, editPayroll)

router.delete('/:id', protect, deletePayroll)

export default router
