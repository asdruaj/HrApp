import mongoose from 'mongoose'

const dependentSchema = new mongoose.Schema({
  relationship: { type: String, required: true },
  name: { type: String, required: true },
  idDocument: { type: String, required: true },
  birthday: { type: Date, required: true }
})

const socialBenefitsSchema = new mongoose.Schema({

  date: {
    type: String
  },
  benefitsDays: String,
  aliquot: {
    type: String,
    default: null
  },
  totalWithdraw: {
    type: String,
    default: '0'
  },
  interestWithdraw: String,

  rate: { type: String, default: '' }

})

const EmployeeSchema = new mongoose.Schema(
  {
    idDocument: {
      type: String,
      require: true,
      min: 2,
      max: 50
    },
    firstName: {
      type: String,
      require: true,
      min: 2,
      max: 50
    },

    lastName: {
      type: String,
      require: true,
      min: 2,
      max: 50
    },
    hiringDate: {
      type: Date,
      default: Date.now()
    },
    address: {
      type: String,
      require: true,
      min: 2,
      max: 250
    },
    position: {
      type: String,
      require: true,
      min: 2,
      max: 50
    },
    department: {
      type: String,
      require: true,
      min: 2,
      max: 50
    },
    baseSalary: {
      type: mongoose.Types.Decimal128,
      require: true

    },
    accountNumber: {
      type: String,
      default: ''
    },
    payDue: {
      type: Boolean,
      default: false
    },

    payFrequency: {
      type: String,
      require: true

    },

    dependents: [dependentSchema],

    email: {
      type: String,
      require: true
    },
    phoneNumber: {
      type: Number,
      require: true
    },
    vacationDaysBase: {
      type: Number,
      default: 15
    },

    vacationDays: {
      type: Number,
      default: 0,
      min: 0
    },
    sickDays: {
      type: Number,
      default: 30
    },
    unjustifiedAbsences: {
      type: Number,
      default: 0,
      min: 0
    },
    utilsDays: {
      type: Number
    },
    picturePath: {
      type: String,
      default: ''

    },
    documents: {
      type: Array,
      default: []
    },
    socialBenefits: { type: [socialBenefitsSchema], default: [] },

    courses: [{ type: mongoose.Types.ObjectId, ref: 'Training' }]

  },
  { timestamps: true }
)

const Employee = mongoose.model('Employee', EmployeeSchema)

export default Employee
