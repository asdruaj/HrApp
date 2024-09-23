import mongoose from 'mongoose'

const payrollSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  payDate: {
    type: Date,
    required: true,
    default: new Date()
  },
  grossPay: {
    type: mongoose.Schema.Types.Decimal128,
    required: true
  },
  deductions: [{
    description: String,
    ammount: mongoose.Schema.Types.Decimal128
  }],
  netPay: {
    type: mongoose.Schema.Types.Decimal128,
    required: true
  }

})

const Payroll = mongoose.model('Payroll', payrollSchema)

export default Payroll
