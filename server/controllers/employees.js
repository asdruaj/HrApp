import mongoose from 'mongoose'
import Employee from '../models/Employee.js'
import dayjs from 'dayjs'
import { bcvDolar } from 'bcv-divisas'
import 'dayjs/locale/es.js'
dayjs.locale('es')

/* Save Employee */
export const saveEmployee = async (req, res) => {
  try {
    const {
      idDocument,
      firstName,
      lastName,
      hiringDate,
      address,
      position,
      department,
      baseSalary,
      payDue,
      payFrequency,
      accountNumber,
      dependents,
      bonuses,
      email,
      phoneNumber,
      vacationDaysBase,
      vacationDays,
      sickDays,
      utilsDays
    } = req.body

    const picturePath = req.files.employeePicture ? req.files.employeePicture[0].filename : null
    console.log(req.files)

    const documents = []
    if (req.files?.employeeDocuments?.length > 0) {
      req.files.employeeDocuments.map((item) => (
        documents.push(item.filename)
      ))
    }

    const newEmployee = new Employee({
      idDocument,
      firstName,
      lastName,
      hiringDate,
      address,
      position,
      department,
      baseSalary,
      payDue,
      payFrequency,
      accountNumber,
      dependents: dependents ? JSON.parse(dependents) : [],
      bonuses,
      email,
      vacationDaysBase,
      vacationDays,
      phoneNumber,
      sickDays,
      utilsDays,
      picturePath,
      documents
    })

    const savedEmployee = await newEmployee.save()

    console.log(savedEmployee)
    res.status(200).json(savedEmployee)
  } catch (err) {
    res.status(404).json({ message: err.message })
  }
}

/* Get all Employees */
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
    res.status(200).json(employees)
  } catch (err) {
    res.status(404).json({ message: err.message })
  }
}

/* Get one Employee by id */
export const getEmployee = async (req, res) => {
  try {
    const { id } = req.params
    const employee = await Employee.findById(mongoose.Types.ObjectId.createFromHexString(id)).populate('courses')
    console.log(employee)
    if (!employee) return res.status(400).json({ message: "employee doesn't exist" })
    res.status(200).json(employee)
  } catch (err) {
    res.status(404).json({ message: err.message })
  }
}

/* Edit one Employee */
export const editEmployee = async (req, res) => {
  try {
    const {
      idDocument,
      firstName,
      lastName,
      hiringDate,
      address,
      position,
      department,
      baseSalary,
      payDue,
      payFrequency,
      accountNumber,
      dependents,
      bonuses,
      email,
      phoneNumber,
      vacationDaysBase,
      vacationDays,
      sickDays,
      utilsDays
    } = req.body

    const picturePath = req.files.employeePicture && req.files?.employeePicture[0]?.filename
    console.log(req.files)

    const documents = req.files.employeeDocuments && req.files.employeeDocuments.map((item) => (
      item.filename
    ))

    const { id } = req.params

    const employee = await Employee.findOneAndUpdate({ _id: id }, {
      idDocument,
      firstName,
      lastName,
      hiringDate,
      address,
      position,
      department,
      baseSalary,
      payDue,
      payFrequency,
      accountNumber,
      dependents: dependents ? JSON.parse(dependents) : [],
      bonuses,
      email,
      phoneNumber,
      vacationDaysBase,
      vacationDays,
      sickDays,
      utilsDays,
      documents,
      picturePath
    }, { new: true })
    res.status(200).json(employee)
  } catch (err) {
    res.status(404).json({ message: err.message })
  }
}

/* Delete Employee */
export const deleteEmploye = async (req, res) => {
  try {
    const { id } = req.params

    const result = await Employee.deleteOne({ _id: id })
    res.status(200).json(result)
  } catch (err) {
    res.status(404).json({ message: err.message })
  }
}

// SOCIAL BENEFITS SECTION
const calculateSocialBenefitsDays = (date) => {
  const quarters = [0, 3, 6, 9] // Enero, Abril, Julio, Octubre
  const currentMonth = dayjs(date).month() // Obtener el mes de la fecha proporcionada (0-11)

  for (let i = 0; i < quarters.length; i++) {
    if (currentMonth < quarters[i]) {
      return (quarters[i] - currentMonth) * 5
    } else if (currentMonth === quarters[i]) {
      return 5
    }
  }
  // Si el mes actual es después de Octubre, el siguiente trimestre es Enero del próximo año
  return (12 - currentMonth) * 5
}

const getBcv = async () => {
  try {
    const data = await bcvDolar()
    return data
  } catch (error) {

  }
}

const calculateAliquot = async (employee, benefitsDays) => {
  try {
    const rates = await getBcv()
    const today = dayjs()

    const yearsOfService = today.diff(employee?.hiringDate, 'year')

    const vacationDays = employee && employee.vacationDaysBase + yearsOfService

    const salaryToBs = parseFloat((rates?._dolar * employee?.baseSalary * 100) / 100).toFixed(2)

    const dailySalary = employee && salaryToBs / 30

    const utilitiesDailyFraction = employee && (dailySalary * employee.utilsDays) / 360

    const vacationBonus = employee && (dailySalary * vacationDays) / 360

    const integralDailySalary = (dailySalary && utilitiesDailyFraction && vacationBonus) && dailySalary + utilitiesDailyFraction + vacationBonus

    const integralMonthlySalary = integralDailySalary && Math.round((integralDailySalary * 30) * 100 / 100).toFixed(2)

    const aliquot = (integralMonthlySalary / 30) * benefitsDays

    console.log(integralMonthlySalary)
    return parseFloat(aliquot).toFixed(2)
  } catch (error) {
    console.log(error)
  }
}

export const addQuarterlyEntries = async () => {
  try {
    const employees = await Employee.find()

    for (const employee of employees) {
      const quearters = [0, 3, 6, 9]
      const socialBenefits = {}
      const currentDate = dayjs()
      const benefitsDays = employee.socialBenefits.length <= 0 && dayjs(employee.hiringDate).year() === dayjs(currentDate).year() ? calculateSocialBenefitsDays(employee?.hiringDate) : 15

      console.log(benefitsDays)
      const quarter = currentDate.format('YYYY-MMMM')

      socialBenefits.date = quarter
      if (quearters.includes(currentDate.month())) {
        socialBenefits.aliquot = await calculateAliquot(employee, benefitsDays)
      } else {
        socialBenefits.aliquot = 0
      }

      if (currentDate.isAfter(dayjs(employee.hiringDate), 'month') || currentDate.isSame(dayjs(employee.hiringDate), 'month')) {
        await Employee.findOneAndUpdate({ _id: employee._id }, { $push: { socialBenefits } }, { new: true })
      }
    }
    console.log('Every employee updated')
  } catch (error) {
    console.log(error)
  }
}

export const updateWithdrawal = async (req, res) => {
  const { employeeId, socialBenefitId } = req.params
  const { totalWithdraw, interestWithdraw, rate } = req.body

  try {
    // Encuentra al empleado por su ID
    const employee = await Employee.findById(employeeId)

    if (!employee) {
      return res.status(404).json({ message: 'Empleado no encontrado' })
    }

    // Encuentra el beneficio social específico por su ID
    const benefit = employee.socialBenefits.id(socialBenefitId)

    if (!benefit) {
      return res.status(404).json({ message: 'Beneficio social no encontrado' })
    }

    // Actualiza los campos si existen en la solicitud
    if (totalWithdraw !== undefined) {
      benefit.totalWithdraw = totalWithdraw
    }

    if (interestWithdraw !== undefined) {
      benefit.interestWithdraw = interestWithdraw
    }
    if (rate !== undefined) {
      const employees = await Employee.find({
        'socialBenefits.date': benefit.date
      })

      for (const employee of employees) {
        employee.socialBenefits.forEach(item => {
          if (item.date === benefit.date) {
            item.rate = rate
          }
        })
        await employee.save()
      }
    }

    // Guarda los cambios
    await employee.save()

    res.status(200).json({ message: 'Datos actualizados correctamente', employee })
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar los datos', error })
  }
}

export const saveTraining = async (req, res) => {
  try {
    const { trainingId } = req.params
    const { userIds } = req.body

    const users = await Employee.find({ _id: { $in: userIds } })
    console.log(users)

    for (const user of users) {
      // Check if the trainingId already exists in the user's courses array
      if (!user.courses.some(course => course.equals(trainingId))) {
        const edited = await Employee.findOneAndUpdate(
          { _id: user._id },
          { $push: { courses: mongoose.Types.ObjectId.createFromHexString(trainingId) } },
          { new: true }
        )
        console.log(edited)
      }
    }

    res.status(200).json({ message: 'Cursos añadido con éxito' })
  } catch (error) {
    console.error('Error occurred:', error)
    res.status(500).json({ message: 'Error al actualizar los datos', error })
  }
}
