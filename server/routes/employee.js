import express from 'express'
import {
  getEmployee,
  getEmployees,
  deleteEmploye,
  updateWithdrawal,
  saveTraining
} from '../controllers/employees.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

/* Get all employees */
router.get('/', protect, getEmployees)

/* Get ONE employee */
router.get('/:id', protect, getEmployee)

/* Delete an employee */
router.delete('/:id', protect, deleteEmploye)

// Route to update withdraw field
router.patch('/:employeeId/socialBenefits/:socialBenefitId/withdraw', protect, updateWithdrawal)

router.patch('/saveTrainingToUser/:trainingId', protect, saveTraining)

export default router
