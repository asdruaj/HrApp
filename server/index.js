import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import multer from 'multer'
import helmet from 'helmet'
import path from 'path'
import { bcvDolar } from 'bcv-divisas'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import postsRoutes from './routes/posts.js'
import employeeRoutes from './routes/employee.js'
import trainingRoutes from './routes/training.js'
import recruitmentRoutes from './routes/recruitment.js'
import feedbackRoutes from './routes/feedback.js'
import eventsRoutes from './routes/events.js'
import absenteeismRoutes from './routes/absenteeism.js'
import payrollRoutes from './routes/payroll.js'
import { register } from './controllers/auth.js'
// import { createPost } from './controllers/posts.js'
import { protect } from './middleware/auth.js'
import cookieParser from 'cookie-parser'
import { connectDB } from './config/db.js'
import { editEmployee, saveEmployee, addQuarterlyEntries } from './controllers/employees.js'
import { editRecruitment, saveRecruitment } from './controllers/recruitment.js'
import cron from 'node-cron'
/* CONFIGURATIONS */

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config()

const app = express()
app.use(cookieParser())
app.use(express.json())
app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }))
app.use(bodyParser.json({ limit: '30mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }))
app.use(cors())

app.use('/avatar', express.static(path.join(__dirname, 'public/avatar')))
app.use('/employeesFiles', express.static(path.join(__dirname, 'public/employeesFiles')))

/* FILE STORAGE */
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/avatar')
  },
  filename: function (req, file, cb) {
    cb(null, 'avatar_' + new Date().getTime() + '_' + file.originalname)
  }
})

const employeeStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/employeesFiles')
  },
  filename: function (req, file, cb) {
    const prefix = file.fieldname === 'employeePicture' ? 'avatar' : 'file'
    cb(null, `${prefix}_${new Date().getTime()}_${file.originalname}`)
  }
})

const uploadAvatar = multer({ storage: avatarStorage })
const uploadEmployeeFiles = multer({ storage: employeeStorage })

/* ROUTES WITH FILES */

/* Register User */
app.post('/api/auth/register/:linkToken', uploadAvatar.single('picture'), register)
/* Save New Employee */
app.post('/api/employees/save', protect, uploadEmployeeFiles.fields([{ name: 'employeePicture', maxCount: 1 }, { name: 'employeeDocuments', maxCount: 5 }]), saveEmployee)
/* Update employee */
app.patch('/api/employees/:id', protect, uploadEmployeeFiles.fields([{ name: 'employeePicture', maxCount: 1 }, { name: 'employeeDocuments', maxCount: 5 }]), editEmployee)
/* Save Recruitment */
app.post('/api/recruitment/save', protect, uploadEmployeeFiles.single('cv'), saveRecruitment)
/* Update Recruitment */
app.patch('/api/recruitment/:id', protect, uploadEmployeeFiles.single('cv'), editRecruitment)

// app.post('/api/posts', protect, upload.single('picture'), createPost)
/* Check if user is logged in */
app.post('/api/auth/verifyToken', protect, async (req, res) => res.status(200).json(req.user))

// Get BCV prices endpoint
app.get('/api/bcv', async (req, res) => {
  try {
    const data = await bcvDolar()
    res.status(200).json(data)
  } catch (error) {
    res.status(500).json({ message: 'Error: ' + error })
  }
})

app.get('/api/mocks', (req, res) => {
  const filePath = path.join(__dirname, 'mocks', 'attendance.json')

  res.sendFile(filePath)
})

// RUTINA PARA AÑADIR ENTRADAS A PRESTACIONES SOCIALES
cron.schedule('0 3 1 * *', async () => {
  await addQuarterlyEntries()
})

/* ROUTES */
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/posts', postsRoutes)
app.use('/api/employees', employeeRoutes)
app.use('/api/training', trainingRoutes)
app.use('/api/recruitment', recruitmentRoutes)
app.use('/api/feedback', feedbackRoutes)
app.use('/api/events', eventsRoutes)
app.use('/api/absenteeism', absenteeismRoutes)
app.use('/api/payroll', payrollRoutes)

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 6001

connectDB()
app.listen(PORT, () => console.log(`Server on Port: ${PORT}`))
