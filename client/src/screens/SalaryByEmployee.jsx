import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useGetEmployeeeQuery, useUpdateWithdrawalMutation } from '../state/employeesApiSlice'
import { Button, Select, Spinner, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, TextInput } from 'flowbite-react'
import { useSelector } from 'react-redux'
import { FaCheck, FaDollarSign, FaDownload, FaFloppyDisk, FaPencil } from 'react-icons/fa6'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import { toast } from 'sonner'
import { useGetAllAbsenteeismsQuery } from '../state/absenteeismApiSlice'
import { PDFDownloadLink } from '@react-pdf/renderer'
import PDFpayment from '../components/PDFpayment'

dayjs.extend(utc)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

const SalaryByEmployee = () => {
  // LÓGICA GENERAL

  const { id } = useParams()
  const { data: employee, isLoading, refetch } = useGetEmployeeeQuery(id)
  const { data: absenteeism } = useGetAllAbsenteeismsQuery()
  const { rates } = useSelector(state => state.bcv)

  const hiringDate = dayjs(employee?.hiringDate)
  const today = dayjs()

  const benefits = employee && [...employee?.socialBenefits]

  const [deductions, setDeductions] = useState({
    minimumSalary: 180,
    retentionPercentage: 4,
    paroForzoso: 0.5,
    LPH: 1,
    retentionTotal: null,
    paroTotal: null,
    LPHtotal: null,
    monthlyTotal: null
  })

  useEffect(() => {
    if (!isLoading && employee) {
      const retentionTotal = employee?.baseSalary.$numberDecimal > (deductions.minimumSalary * 5) ? parseFloat((deductions.minimumSalary * 5) * (deductions.retentionPercentage / 100)).toFixed(2) : parseFloat(employee?.baseSalary.$numberDecimal * (deductions.retentionPercentage / 100)).toFixed(2)

      const paroTotal = employee?.baseSalary.$numberDecimal > (deductions.minimumSalary * 5) ? parseFloat((deductions.minimumSalary * 5) * (deductions.paroForzoso / 100)).toFixed(2) : parseFloat(employee?.baseSalary.$numberDecimal * (deductions.paroForzoso / 100)).toFixed(2)

      const LPHtotal = parseFloat(employee?.baseSalary.$numberDecimal * (deductions.LPH / 100)).toFixed(2)

      const monthlyTotal = parseFloat(parseFloat(paroTotal) + parseFloat(LPHtotal) + parseFloat(retentionTotal)).toFixed(2)

      setDeductions(prev => ({ ...prev, retentionTotal, paroTotal, LPHtotal, monthlyTotal }))
    }
  }, [employee, isLoading])

  const handleDeductionsChange = (e) => {
    const { value, name } = e.target

    setDeductions(prev => ({ ...prev, [name]: value }))
  }

  const yearsOfService = today.diff(hiringDate, 'year')
  const vacationDays = employee && employee.vacationDaysBase + yearsOfService

  const dailySalary = employee && employee?.baseSalary.$numberDecimal / 30

  const utilitiesDailyFraction = employee && (dailySalary * employee.utilsDays) / 360

  const vacationBonus = employee && (dailySalary * vacationDays) / 360

  const integralDailySalary = (dailySalary && utilitiesDailyFraction && vacationBonus) && dailySalary + utilitiesDailyFraction + vacationBonus

  const integralMonthlySalary = integralDailySalary && Math.round((integralDailySalary * 30) * 100 / 100).toFixed(2)

  // deduccciones

  const [events, setEvents] = useState([])
  useEffect(() => {
    const fetchEvents = async () => {
      const response = await fetch('/api/mocks')
      const mockData = await response.json()
      const employeeData = mockData.find(person => person.idDocument === employee?.idDocument)
      if (employeeData) {
        const newEvents = employeeData.attendance.map(day => {
          const entryTime = dayjs(day.entry)
          const exitTime = dayjs(day.exit)
          return {
            title: `Entrada: ${entryTime}, Salida: ${exitTime}`,
            start: dayjs(day.entry).format('YYYY-MM-DD'),
            end: dayjs(day.exit).format('YYYY-MM-DD')
          }
        })
        setEvents(newEvents)
      }
    }

    fetchEvents()
  }, [employee])

  const isWeekend = (date) => { const day = dayjs(date).day(); return day === 0 || day === 6 }

  const getAbsentDays = (attendance, startDate, endDate) => {
    const absentDays = []
    let currentDate = dayjs(startDate)
    while (currentDate.isSameOrBefore(dayjs(endDate))) {
      const dateString = currentDate.format('YYYY-MM-DD')

      const isAbsent = !attendance.some(({ start, end }) => {
        const startDate = dayjs(start).format('YYYY-MM-DD')
        const endDate = dayjs(end).format('YYYY-MM-DD')

        return dayjs(dateString).isSameOrAfter(startDate) && dayjs(dateString).isSameOrBefore(endDate)
      })

      const hasPermit = absenteeism?.some((item) => {
        const startDate = dayjs(item.start).format('YYYY-MM-DD')
        const endDate = dayjs(item.end).format('YYYY-MM-DD')

        console.log(attendance)
        return item.employee._id === employee?._id && dayjs(dateString).isSameOrAfter(startDate) && dayjs(dateString).isSameOrBefore(endDate)
      })

      if (!hasPermit && isAbsent && !isWeekend(dateString)) {
        absentDays.push(dateString)
      }
      currentDate = currentDate.add(1, 'day')
    } return absentDays
  }

  const [absentDays, setAbsentDays] = useState('')

  useEffect(() => {
    const startDate = dayjs.utc().startOf('month').format('YYYY-MM-DD')
    const endDate = dayjs.utc().format('YYYY-MM-DD')

    setAbsentDays(getAbsentDays(events, startDate, endDate).length)
    console.log(getAbsentDays(events, startDate, endDate))
  }, [events])

  // LÓGICA UTILIDADES

  const [utilsMonthSalary, setUtilsMonthSalary] = useState({
    jan: '',
    feb: '',
    mar: '',
    apr: '',
    may: '',
    jun: '',
    jul: '',
    aug: '',
    sep: '',
    oct: '',
    nov: '',
    dec: ''
  })

  const [utilsAliquot, setUtilsAliquot] = useState({
    jan: '',
    feb: '',
    mar: '',
    apr: '',
    may: '',
    jun: '',
    jul: '',
    aug: '',
    sep: '',
    oct: '',
    nov: '',
    dec: ''
  })

  useEffect(() => {
    setUtilsMonthSalary(prev => ({
      ...prev,
      jan: employee?.baseSalary.$numberDecimal || '',
      feb: employee?.baseSalary.$numberDecimal || '',
      mar: employee?.baseSalary.$numberDecimal || '',
      apr: employee?.baseSalary.$numberDecimal || '',
      may: employee?.baseSalary.$numberDecimal || '',
      jun: employee?.baseSalary.$numberDecimal || '',
      jul: employee?.baseSalary.$numberDecimal || '',
      aug: employee?.baseSalary.$numberDecimal || '',
      sep: employee?.baseSalary.$numberDecimal || '',
      oct: employee?.baseSalary.$numberDecimal || '',
      nov: employee?.baseSalary.$numberDecimal || '',
      dec: employee?.baseSalary.$numberDecimal || ''
    }))

    setUtilsAliquot(prev => ({
      ...prev,
      jan: employee?.baseSalary.$numberDecimal > 0 ? parseFloat((employee?.utilsDays / 12) * (employee?.baseSalary.$numberDecimal / 30)).toFixed(2) : 0,
      feb: employee?.baseSalary.$numberDecimal > 0 ? parseFloat((employee?.utilsDays / 12) * (employee?.baseSalary.$numberDecimal / 30)).toFixed(2) : 0,
      mar: employee?.baseSalary.$numberDecimal > 0 ? parseFloat((employee?.utilsDays / 12) * (employee?.baseSalary.$numberDecimal / 30)).toFixed(2) : 0,
      apr: employee?.baseSalary.$numberDecimal > 0 ? parseFloat((employee?.utilsDays / 12) * (employee?.baseSalary.$numberDecimal / 30)).toFixed(2) : 0,
      may: employee?.baseSalary.$numberDecimal > 0 ? parseFloat((employee?.utilsDays / 12) * (employee?.baseSalary.$numberDecimal / 30)).toFixed(2) : 0,
      jun: employee?.baseSalary.$numberDecimal > 0 ? parseFloat((employee?.utilsDays / 12) * (employee?.baseSalary.$numberDecimal / 30)).toFixed(2) : 0,
      jul: employee?.baseSalary.$numberDecimal > 0 ? parseFloat((employee?.utilsDays / 12) * (employee?.baseSalary.$numberDecimal / 30)).toFixed(2) : 0,
      aug: employee?.baseSalary.$numberDecimal > 0 ? parseFloat((employee?.utilsDays / 12) * (employee?.baseSalary.$numberDecimal / 30)).toFixed(2) : 0,
      sep: employee?.baseSalary.$numberDecimal > 0 ? parseFloat((employee?.utilsDays / 12) * (employee?.baseSalary.$numberDecimal / 30)).toFixed(2) : 0,
      oct: employee?.baseSalary.$numberDecimal > 0 ? parseFloat((employee?.utilsDays / 12) * (employee?.baseSalary.$numberDecimal / 30)).toFixed(2) : 0,
      nov: employee?.baseSalary.$numberDecimal > 0 ? parseFloat((employee?.utilsDays / 12) * (employee?.baseSalary.$numberDecimal / 30)).toFixed(2) : 0,
      dec: employee?.baseSalary.$numberDecimal > 0 ? parseFloat((employee?.utilsDays / 12) * (employee?.baseSalary.$numberDecimal / 30)).toFixed(2) : 0
    }))
  }, [employee?.baseSalary.$numberDecimal])

  const handleUtilsChange = (e) => {
    const { name, value } = e.target

    setUtilsMonthSalary((prev) => ({
      ...prev,
      [name]: value
    }))

    setUtilsAliquot((prev) => ({
      ...prev,
      [name]: value > 0 ? parseFloat(((employee?.utilsDays / 12) * (value / 30)).toFixed(2)) : 0
    }))
  }

  // LÓGICA VACACIONES
  const [vacations, setVacations] = useState({
    vacationBonusDays: employee?.vacationDaysBase || 0,
    firstMonth: dayjs().subtract(1, 'month').format('MMMM').charAt(0).toUpperCase() + dayjs().subtract(1, 'month').format('MMMM').slice(1),
    secondMonth: dayjs().subtract(2, 'month').format('MMMM').charAt(0).toUpperCase() + dayjs().subtract(2, 'month').format('MMMM').slice(1),
    thirdMonth: dayjs().subtract(3, 'month').format('MMMM').charAt(0).toUpperCase() + dayjs().subtract(3, 'month').format('MMMM').slice(1),
    firstMonthValue: '',
    secondMonthValue: '',
    thirdMonthValue: '',
    averageVacationSalary: '',
    holidays: 0,
    daysOff: 0,
    totalVacationsAmmount: 0,
    deductions: {
      socialSecurity: 0,
      forcedStop: 0,
      LPH: 0,
      total: 0
    },
    monthsPassed: 0
  })

  const handleVacationsChange = (e) => {
    const { name, value } = e.target

    setVacations(prev => ({
      ...prev,
      [name]: value
    }))
  }

  useEffect(() => {
    setVacations(prev => ({
      ...prev,
      vacationBonusDays: employee?.vacationDaysBase || 0,
      firstMonthValue: employee?.baseSalary.$numberDecimal || '',
      secondMonthValue: employee?.baseSalary.$numberDecimal || '',
      thirdMonthValue: employee?.baseSalary.$numberDecimal || '',
      monthsPassed: dayjs().month() - dayjs(employee?.hiringDate).month() < 0 ? (dayjs().month() - dayjs(employee?.hiringDate).month()) + 12 : dayjs().month() - dayjs(employee?.hiringDate).month()
    }))
  }, [employee, employee?.baseSalary.$numberDecimal])

  useEffect(() => {
    if ((parseFloat(vacations.firstMonthValue) &&
    parseFloat(vacations.secondMonthValue) &&
    parseFloat(vacations.thirdMonthValue)) === employee?.baseSalary.$numberDecimal) {
      setVacations(prev => ({ ...prev, averageVacationSalary: employee?.baseSalary.$numberDecimal || '' }))
    } else {
      setVacations(prev => ({ ...prev, averageVacationSalary: ((parseFloat(vacations.firstMonthValue) + parseFloat(vacations.secondMonthValue) + parseFloat(vacations.thirdMonthValue)) / 3).toFixed(2) }))
    }
  }, [vacations.firstMonthValue, vacations.secondMonthValue, vacations.thirdMonthValue])

  useEffect(() => {
    setVacations(prev => ({
      ...prev,
      totalVacationsAmmount: parseFloat(parseFloat(vacations.holidays * (vacations.averageVacationSalary / 30)) + parseFloat(vacations.daysOff * (vacations.averageVacationSalary / 30)) + parseFloat((vacationDays * vacations.averageVacationSalary) / 30) + parseFloat(((parseInt(vacations.vacationBonusDays) + parseInt(yearsOfService)) * vacations.averageVacationSalary) / 30)).toFixed(2)
    }))
  }, [vacations.daysOff, vacations.holidays, vacations.averageVacationSalary])

  useEffect(() => {
    setVacations(prev => ({
      ...prev,
      deductions: {
        socialSecurity: ((vacations.totalVacationsAmmount * 12) / 52) * (0.04 * 4),
        forcedStop: ((vacations.totalVacationsAmmount * 12) / 52) * (0.005 * 4),
        LPH: 0.01 * vacations.totalVacationsAmmount
      }
    }))
  }, [vacations.totalVacationsAmmount])

  // LÓGICA PRESTACIONES SOCIALES
  const [editField, setEditField] = useState(null)
  const [formData, setFormData] = useState({})
  const [totalAliquotSum, setTotalAliquotSum] = useState(0)
  const [totalWithdrawSum, setTotalWithdrawSum] = useState(0)
  const [interestWithdrawSum, setInterestWithdrawSum] = useState(0)
  const [totalRateSum, setTotalRateSum] = useState(0)

  const [updateWithdrawal] = useUpdateWithdrawalMutation()

  useEffect(() => {
    if (employee) {
      calculateSums(employee?.socialBenefits)
    }
  }, [employee])

  const calculateSums = (benefits) => {
    const totalWithdrawSum = benefits.reduce((sum, benefit) => sum + parseFloat(benefit.totalWithdraw || 0), 0)
    const interestWithdrawSum = benefits.reduce((sum, benefit) => sum + parseFloat(benefit.interestWithdraw || 0), 0)
    const totalAliquotSum = benefits.reduce((sum, benefit) => sum + parseFloat(benefit.aliquot || 0), 0)
    const totalRateSum = benefits.reduce((sum, benefit) => sum + (parseFloat((benefit.rate / 100) || 0) * parseFloat(benefit.aliquot || 0)), 0)

    setTotalWithdrawSum(totalWithdrawSum)
    setInterestWithdrawSum(interestWithdrawSum)
    setTotalAliquotSum(totalAliquotSum)
    setTotalRateSum(totalRateSum)
  }

  const handleEditClick = (benefitId, field) => {
    setEditField({ benefitId, field })
    setFormData({})
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSaveClick = async (benefitId) => {
    const data = { [editField.field]: formData[editField.field] }
    if (formData[editField.field]) {
      try {
        if (editField.field === 'totalWithdraw' && parseFloat(formData[editField.field]) > parseFloat(((totalAliquotSum - totalWithdrawSum) * 0.75))) return toast.error('El valor no puede ser superior al total disponible')

        if (editField.field === 'interestWithdraw' && parseFloat(formData[editField.field]) > parseFloat((totalRateSum - interestWithdrawSum))) return toast.error('El valor no puede ser superior al total disponible')

        await updateWithdrawal({ employeeId: id, benefitId, data })

        const updatedBenefits = employee.socialBenefits.map(benefit =>
          benefit._id === benefitId ? { ...benefit, ...data } : benefit
        )
        calculateSums(updatedBenefits)
        refetch()
      } catch (error) {
        toast.error(error.message || error.error)
      }
    }
    setEditField(null)
  }

  // LÓGICA LIQUIDACIÓN
  const [terminationType, setTerminationType] = useState('')
  const [fireType, setFireType] = useState('')

  const [terminationCalc, setTerminationCalc] = useState({
    retroactivity: null,
    retroactivityDays: null,
    retroactivityAmmount: null,
    benefitsAmmount: null,
    benefitsWithdraw: null,
    additionalDays: null,
    additionalDaysAmmount: null,
    totalBenefitFund: null,
    utilities: null,
    vacationsEarned: null,
    aliquotBenefitWithdraws: null
  })

  const calcTermination = () => {
    const retroactivityDays = yearsOfService * 30
    const retroactivityAmmount = (employee?.baseSalary.$numberDecimal / 30) * retroactivityDays
    const benefitsAmmount = totalAliquotSum + (totalRateSum - interestWithdrawSum)

    const calcAdditionalDays = () => {
      const quarters = [0, 3, 6, 9] // Enero, Abril, Julio, Octubre
      const currentMonth = dayjs().month() // Obtener el mes de la fecha proporcionada (0-11)

      // eslint-disable-next-line no-unreachable-loop
      for (let i = 0; i < quarters.length; i++) {
        if (currentMonth < quarters[i]) {
          return (quarters[i] - currentMonth) * 5
        } else if (currentMonth === quarters[i]) {
          return 0
        }
      }
      // Si el mes actual es después de Octubre, el siguiente trimestre es Enero del próximo año
      return (12 - currentMonth) * 5
      // Si el mes actual es después de Octubre, el siguiente trimestre es Enero del próximo año
    }

    const additionalDaysAmmount = integralDailySalary * calcAdditionalDays()

    setTerminationCalc(prev => ({
      ...prev,
      retroactivity: yearsOfService,
      retroactivityDays,
      retroactivityAmmount,
      benefitsAmmount,
      benefitsWithdraw: totalWithdrawSum,
      additionalDays: calcAdditionalDays(),
      additionalDaysAmmount,
      totalBenefitFund: additionalDaysAmmount + benefitsAmmount,
      utilities: (Object.values(utilsAliquot).reduce((accumulator, value) => { return accumulator + parseFloat(value || 0) }, 0) - ((Object.values(utilsAliquot).reduce((acc, val) => { return acc + parseFloat(val || 0) }, 0)) * 0.005)).toFixed(2),
      vacationsEarned: parseFloat((vacations.totalVacationsAmmount - (vacations.deductions.socialSecurity + vacations.deductions.forcedStop + vacations.deductions.LPH)) * (vacations.monthsPassed / 12) || 0).toFixed(2),
      aliquotBenefitWithdraws: totalWithdrawSum
    }))
  }

  const calculateBenefits = () => {
    const maxAmmount = Math.max(terminationCalc.retroactivityAmmount, terminationCalc.totalBenefitFund)

    if (terminationType === 'despido' && fireType === 'injustificado') {
      return maxAmmount * 2
    } else {
      return maxAmmount
    }
  }

  useEffect(() => {
    if (!isLoading && employee) {
      calcTermination()
    }
  }, [employee, isLoading, totalAliquotSum, totalWithdrawSum, vacations])

  return (
    <>
      <div id='banner' className='w-full mt-[-4rem] bg-employeeBanner dark:bg-darkEmployeeBanner h-72 z-[-999] relative'>

        <div className='absolute w-full bottom-[-1rem] h-16 bg-slate-200 dark:bg-gray-950 ml-[-1rem] blur-md' />

      </div>

      <div id='container' className='md:px-16 -mt-52 px-4 pb-4 flex justify-around flex-wrap gap-6 font-montserrat'>

        {/* Bloque DATOS DEL TRABAJADOR */}
        <div id='worker-container' className='bg-slate-50 dark:bg-slate-800 dark:border-2 border-slate-600  shadow-lg px-4 py-2 rounded-md w-full max-w-xl  overflow-auto h-[32rem]'>
          <h2 className='text-lg font-semibold mb-4 dark:text-slate-200'>Datos del Trabajador</h2>
          {
      isLoading
        ? <Spinner />

        : <div className='mx-4 mt-4 mb-4'>

          <div className='ml-2 md:grid grid-cols-2 text-base'>
            <label className='font-medium text-gray-950 dark:text-slate-300'>Nombres</label>
            <span className='block md:text-end dark:text-slate-200 '>{employee.firstName} {employee.lastName}</span>
          </div>
          <hr className='h-px border-0 dark:bg-gray-700 my-1 bg-slate-300' />

          <div className='ml-2 md:grid grid-cols-2 text-base'>
            <label className='font-medium text-gray-950 dark:text-slate-300'>Documento de Identidad</label>
            <span className='block md:text-end dark:text-slate-200 '>{employee.idDocument}</span>
          </div>
          <hr className='h-px border-0 dark:bg-gray-700 my-1 bg-slate-300' />

          <div className='ml-2 md:grid grid-cols-2 text-base'>
            <label className='font-medium text-gray-950 dark:text-slate-300'>Fecha de Contratación</label>
            <span className='block md:text-end dark:text-slate-200 '>{new Date(employee.hiringDate).toLocaleDateString('es-VE', { timeZone: 'UTC' })}</span>
          </div>
          <hr className='h-px border-0 dark:bg-gray-700 my-1 bg-slate-300' />

          <div className='ml-2 md:grid grid-cols-2 text-base'>
            <label className='font-medium text-gray-950 dark:text-slate-300'>Años de Servicio</label>
            <span className='block md:text-end dark:text-slate-200 '>{yearsOfService}</span>
          </div>
          <hr className='h-px border-0 dark:bg-gray-700 my-1 bg-slate-300' />

          <div className='ml-2 md:grid grid-cols-2 text-base'>
            <label className='font-medium text-gray-950 dark:text-slate-300'>Departamento</label>
            <span className='block md:text-end dark:text-slate-200 '>{employee.department}</span>
          </div>
          <hr className='h-px border-0 dark:bg-gray-700 my-1 bg-slate-300' />

          <div className='ml-2 md:grid grid-cols-2 text-base'>
            <label className='font-medium text-gray-950 dark:text-slate-300'>Cargo</label>
            <span className='block md:text-end dark:text-slate-200 '>{employee.position}</span>
          </div>
          <hr className='h-px border-0 dark:bg-gray-700 my-1 bg-slate-300' />

          <div className='ml-2 md:grid grid-cols-2 text-base'>
            <label className='font-medium text-gray-950 dark:text-slate-300'>Salario Base Mensual</label>
            <div>
              <span className='block md:text-end dark:text-slate-200 '>
                {(parseFloat(employee.baseSalary.$numberDecimal * 100) / 100).toFixed(2)}
                <span className='font-bold opacity-50 ml-2 select-none'>BsS.</span>
                <br />
                <span className='italic opacity-50'>Equivalente a: </span>
                <br />
                {rates?._dolar && <span>{`${parseFloat((employee?.baseSalary.$numberDecimal / rates?._dolar * 100) / 100).toFixed(2)}`} <FaDollarSign className='inline ml-1 mb-0.5 opacity-50' /></span>}
              </span>
            </div>
          </div>
          <hr className='h-px border-0 dark:bg-gray-700 my-1 bg-slate-300' />

          <div className='ml-2 md:grid grid-cols-2 text-base'>
            <label className='font-medium text-gray-950 dark:text-slate-300'>Salario Base Diario</label>
            <span className='block md:text-end dark:text-slate-200 '>{parseFloat(dailySalary).toFixed(2)}
              <span className='font-bold opacity-50 ml-2 select-none'>BsS.</span>
            </span>

          </div>
          <hr className='h-px border-0 dark:bg-gray-700 my-1 bg-slate-300' />

          <div className='ml-2 md:grid grid-cols-2 text-base'>
            <label className='font-medium text-gray-950 dark:text-slate-300'>Salario Integral Mensual</label>
            <div>
              <span className='block md:text-end dark:text-slate-200 '>
                {`${integralMonthlySalary}` || ''}
                <span className='font-bold opacity-50 ml-2 select-none'>BsS.</span>

              </span>

            </div>
          </div>
          <hr className='h-px border-0 dark:bg-gray-700 my-1 bg-slate-300' />

          <div className='ml-2 md:grid grid-cols-2 text-base'>
            <label className='font-medium text-gray-950 dark:text-slate-300'>Frecuencia de Pagos</label>
            <span className='block md:text-end dark:text-slate-200 '>{employee.payFrequency}</span>
          </div>
          <hr className='h-px border-0 dark:bg-gray-700 my-1 bg-slate-300' />

        </div> //eslint-disable-line

        }

        </div>

        {/* Bloque PAGO DEL MES */}
        <div id='worker-container' className='bg-slate-50 dark:bg-slate-800 dark:border-2 border-slate-600 shadow-lg rounded-md w-full max-w-xl overflow-auto max-h-[32rem] dark:text-slate-50 '>
          <h2 className='text-lg font-semibold px-4 py-2 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 sticky top-0 z-10 flex justify-between'>Pago del Mes

            <Button color='blue' className='[&>*]:gap-2 h-8 mt-4 [&>*]:items-center w-12'>
              <PDFDownloadLink
                className='flex gap-2' document={<PDFpayment data={
              {
                firstName: employee?.firstName,
                lastName: employee?.lastName,
                id: employee?.idDocument,
                payFrequency: employee?.payFrequency,
                retentionTotal: deductions?.retentionTotal,
                paroTotal: deductions?.paroTotal,
                LPHtotal: deductions?.LPHtotal,
                unjustifiedAbsences: absentDays,
                monthlyTotal: deductions?.monthlyTotal,
                baseSalary: employee?.baseSalary.$numberDecimal
              }
            } />} fileName= {`Pago del Mes`}> {/* eslint-disable-line */}
                <FaDownload />
              </PDFDownloadLink>
            </Button>
          </h2>
          {
      isLoading
        ? <Spinner />

        : <div className='mx-4 mb-4 '>

          <div>
            <h3 className='font-bold'>Frecuencia de Pagos: </h3>
            <p className='ml-2'>{employee.payFrequency}</p>
          </div>

          <hr className='h-px border-0 dark:bg-gray-700 bg-slate-300' />

          <div className='mt-4'>
            <h3 className='font-bold'>Proporción de quincenas:</h3>
            <p className='ml-2 flex justify-between mr-8'>El 15 del mes:
              <span>{employee.payFrequency === 'Mensual' ? '0%' : '50%'}</span>
            </p>
            <p className='ml-2 flex justify-between mr-8'>El 30 del mes:
              <span>{employee.payFrequency === 'Mensual' ? '100%' : '50%'}</span>
            </p>
          </div>

          <div className='mt-4'>
            <h3 className='ml-2 flex justify-between mr-8'>Monto del Sueldo el 15:
              <span>{employee.payFrequency === 'Mensual' ? '0' : parseFloat(employee?.baseSalary.$numberDecimal / 2).toFixed(2)}
                <span className='font-bold opacity-50 select-none ml-2'>BsS.</span>
              </span>
            </h3>

            <h3 className='ml-2 flex justify-between mr-8'>Monto del Sueldo el 30:
              <span>{employee.payFrequency === 'Mensual' ? parseFloat(employee?.baseSalary.$numberDecimal).toFixed(2) : parseFloat(employee?.baseSalary.$numberDecimal / 2).toFixed(2)}
                <span className='font-bold opacity-50 select-none ml-2'>BsS.</span>
              </span>
            </h3>
          </div>

          <hr className='h-px border-0 dark:bg-gray-700 bg-slate-300' />

          <div>
            <h3 className='font-bold mt-4'>Deducciones:</h3>
            <p className='ml-2 flex justify-between mr-8'>Retención del Seguro Social:
              <span className='text-red-700 dark:text-red-500'>-{deductions.retentionTotal}
                <span className='font-bold opacity-50 select-none ml-2'>BsS.</span>
              </span>
            </p>
            <p className='ml-2 flex justify-between mr-8'>Paro Forzoso:
              <span className='text-red-700 dark:text-red-500'>-{deductions.paroTotal}
                <span className='font-bold opacity-50 select-none ml-2'>BsS.</span>
              </span>
            </p>
            <p className='ml-2 flex justify-between mr-8'>Ley de Política Habitacional:
              <span className='text-red-700 dark:text-red-500'>-{deductions.LPHtotal}
                <span className='font-bold opacity-50 select-none ml-2'>BsS.</span>
              </span>
            </p>
            <p className='ml-2 flex justify-between mr-8'>Bajas Injustificadas ({absentDays}):
              <span className='text-red-700 dark:text-red-500'>-{(employee?.baseSalary.$numberDecimal / 30) * absentDays || 0}
                <span className='font-bold opacity-50 select-none ml-2'>BsS.</span>
              </span>
            </p>
          </div>

          <hr className='h-px border-0 dark:bg-gray-700 bg-slate-300' />

          <div className='mt-8'>
            <h3 className='ml-2 flex justify-between mr-8 font-bold'>Total de Sueldo el 30:
              <span className='font-normal'>{employee.payFrequency === 'Mensual' ? parseFloat(employee?.baseSalary.$numberDecimal - deductions.monthlyTotal - ((employee?.baseSalary.$numberDecimal / 30) * absentDays)) : parseFloat((employee?.baseSalary.$numberDecimal / 2) - deductions.monthlyTotal - ((employee?.baseSalary.$numberDecimal / 30) * absentDays))}
                <span className='font-bold opacity-50 select-none ml-2'>BsS.</span>
              </span>
            </h3>
          </div>

          <hr className='h-0.5 ml-96 border-0 dark:bg-gray-700 bg-slate-300' />

        </div> //eslint-disable-line

        }

        </div>

        {/* Bloque Utilidades */}
        <div id='worker-container' className='bg-slate-50 dark:bg-slate-800 dark:border-2 border-slate-600 shadow-lg  rounded-md w-full max-w-xl overflow-y-auto overflow-hidden max-h-[32rem] flex-grow'>
          <h2 className='text-lg flex justify-between font-semibold  dark:text-slate-200 bg-slate-50 dark:bg-slate-800 px-4 py-2 sticky top-0 z-10'>Cálculo de Utilidades <span className='font-bold text-sm'>Año {dayjs().year()}</span></h2>
          {
      isLoading
        ? <Spinner />

        : <div className='mx-4 mb-4 dark:text-white'>

          <h3 className='font-semibold flex justify-between mx-8 mb-2'>Días de utilidades: <span className='font-normal'>{employee?.utilsDays}</span></h3>
          <Table className='[&_td]:py-2 ' striped hoverable>
            <Table.Head>
              <Table.HeadCell>#</Table.HeadCell>
              <Table.HeadCell>Mes</Table.HeadCell>
              <Table.HeadCell>Salario Base</Table.HeadCell>
              <Table.HeadCell>Alicuota</Table.HeadCell>

              <Table.HeadCell />
            </Table.Head>
            <Table.Body>

              <TableRow>
                <TableCell>1</TableCell>
                <TableCell>Enero</TableCell>
                <TableCell>
                  <div className='relative h-fit'>
                    <TextInput id='' value={utilsMonthSalary.jan} name='jan' onChange={handleUtilsChange} className='[&_input]:pr-9 [&_input]:text-right [&_input]:h-8 [&_input]:w-32' />
                    <span className='font-bold opacity-50 select-none absolute right-1 ml-4 -mt-[1.6rem] '>BsS.</span>
                  </div>
                </TableCell>
                <TableCell>{utilsAliquot.jan}<span className='font-bold opacity-50 select-none ml-2'>BsS.</span></TableCell>
                <TableCell>{dayjs(employee?.hiringDate).month() + 1 === 1 ? <FaCheck /> : ''}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell>2</TableCell>
                <TableCell>Febrero</TableCell>
                <TableCell>
                  <div className='relative h-fit'>
                    <TextInput id='' value={utilsMonthSalary.feb} name='feb' onChange={handleUtilsChange} className='[&_input]:pr-9 [&_input]:text-right [&_input]:h-8 [&_input]:w-32' />
                    <span className='font-bold opacity-50 select-none absolute right-1 ml-4 -mt-[1.6rem] '>BsS.</span>
                  </div>
                </TableCell>
                <TableCell>{utilsAliquot.feb}<span className='font-bold opacity-50 select-none ml-2'>BsS.</span></TableCell>
                <TableCell>{dayjs(employee?.hiringDate).month() + 1 === 2 ? <FaCheck /> : ''}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell>3</TableCell>
                <TableCell>Marzo</TableCell>
                <TableCell>
                  <div className='relative h-fit'>
                    <TextInput id='' value={utilsMonthSalary.mar} name='mar' onChange={handleUtilsChange} className='[&_input]:pr-9 [&_input]:text-right [&_input]:h-8 [&_input]:w-32' />
                    <span className='font-bold opacity-50 select-none absolute right-1 ml-4 -mt-[1.6rem] '>BsS.</span>
                  </div>
                </TableCell>
                <TableCell>{utilsAliquot.mar}<span className='font-bold opacity-50 select-none ml-2'>BsS.</span></TableCell>
                <TableCell>{dayjs(employee?.hiringDate).month() + 1 === 3 ? <FaCheck /> : ''}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell>4</TableCell>
                <TableCell>Abril</TableCell>
                <TableCell>
                  <div className='relative h-fit'>
                    <TextInput id='' value={utilsMonthSalary.apr} name='apr' onChange={handleUtilsChange} className='[&_input]:pr-9 [&_input]:text-right [&_input]:h-8 [&_input]:w-32' />
                    <span className='font-bold opacity-50 select-none absolute right-1 ml-4 -mt-[1.6rem] '>BsS.</span>
                  </div>
                </TableCell>
                <TableCell>{utilsAliquot.apr}<span className='font-bold opacity-50 select-none ml-2'>BsS.</span></TableCell>
                <TableCell>{dayjs(employee?.hiringDate).month() + 1 === 4 ? <FaCheck /> : ''}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell>5</TableCell>
                <TableCell>Mayo</TableCell>
                <TableCell>
                  <div className='relative h-fit'>
                    <TextInput id='' value={utilsMonthSalary.may} name='may' onChange={handleUtilsChange} className='[&_input]:pr-9 [&_input]:text-right [&_input]:h-8 [&_input]:w-32' />
                    <span className='font-bold opacity-50 select-none absolute right-1 ml-4 -mt-[1.6rem] '>BsS.</span>
                  </div>
                </TableCell>
                <TableCell>{utilsAliquot.may}<span className='font-bold opacity-50 select-none ml-2'>BsS.</span></TableCell>
                <TableCell>{dayjs(employee?.hiringDate).month() + 1 === 5 ? <FaCheck /> : ''}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell>6</TableCell>
                <TableCell>Junio</TableCell>
                <TableCell>
                  <div className='relative h-fit'>
                    <TextInput id='' value={utilsMonthSalary.jun} name='jun' onChange={handleUtilsChange} className='[&_input]:pr-9 [&_input]:text-right [&_input]:h-8 [&_input]:w-32' />
                    <span className='font-bold opacity-50 select-none absolute right-1 ml-4 -mt-[1.6rem] '>BsS.</span>
                  </div>
                </TableCell>
                <TableCell>{utilsAliquot.jun}<span className='font-bold opacity-50 select-none ml-2'>BsS.</span></TableCell>
                <TableCell>{dayjs(employee?.hiringDate).month() + 1 === 6 ? <FaCheck /> : ''}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell>7</TableCell>
                <TableCell>Julio</TableCell>
                <TableCell>
                  <div className='relative h-fit'>
                    <TextInput id='' value={utilsMonthSalary.jul} name='jul' onChange={handleUtilsChange} className='[&_input]:pr-9 [&_input]:text-right [&_input]:h-8 [&_input]:w-32' />
                    <span className='font-bold opacity-50 select-none absolute right-1 ml-4 -mt-[1.6rem] '>BsS.</span>
                  </div>
                </TableCell>
                <TableCell>{utilsAliquot.jul}<span className='font-bold opacity-50 select-none ml-2'>BsS.</span></TableCell>
                <TableCell>{dayjs(employee?.hiringDate).month() + 1 === 7 ? <FaCheck /> : ''}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell>8</TableCell>
                <TableCell>Agosto</TableCell>
                <TableCell>
                  <div className='relative h-fit'>
                    <TextInput id='' value={utilsMonthSalary.aug} name='aug' onChange={handleUtilsChange} className='[&_input]:pr-9 [&_input]:text-right [&_input]:h-8 [&_input]:w-32' />
                    <span className='font-bold opacity-50 select-none absolute right-1 ml-4 -mt-[1.6rem] '>BsS.</span>
                  </div>
                </TableCell>
                <TableCell>{utilsAliquot.aug}<span className='font-bold opacity-50 select-none ml-2'>BsS.</span></TableCell>
                <TableCell>{dayjs(employee?.hiringDate).month() + 1 === 8 ? <FaCheck /> : ''}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell>9</TableCell>
                <TableCell>Septiembre</TableCell>
                <TableCell>
                  <div className='relative h-fit'>
                    <TextInput id='' value={utilsMonthSalary.sep} name='sep' onChange={handleUtilsChange} className='[&_input]:pr-9 [&_input]:text-right [&_input]:h-8 [&_input]:w-32' />
                    <span className='font-bold opacity-50 select-none absolute right-1 ml-4 -mt-[1.6rem] '>BsS.</span>
                  </div>
                </TableCell>
                <TableCell>{utilsAliquot.sep}<span className='font-bold opacity-50 select-none ml-2'>BsS.</span></TableCell>
                <TableCell>{dayjs(employee?.hiringDate).month() + 1 === 9 ? <FaCheck /> : ''}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell>10</TableCell>
                <TableCell>Octubre</TableCell>
                <TableCell>
                  <div className='relative h-fit'>
                    <TextInput id='' value={utilsMonthSalary.oct} name='oct' onChange={handleUtilsChange} className='[&_input]:pr-9 [&_input]:text-right [&_input]:h-8 [&_input]:w-32' />
                    <span className='font-bold opacity-50 select-none absolute right-1 ml-4 -mt-[1.6rem] '>BsS.</span>
                  </div>
                </TableCell>
                <TableCell>{utilsAliquot.oct}<span className='font-bold opacity-50 select-none ml-2'>BsS.</span></TableCell>
                <TableCell>{dayjs(employee?.hiringDate).month() + 1 === 10 ? <FaCheck /> : ''}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell>11</TableCell>
                <TableCell>Noviembre</TableCell>
                <TableCell>
                  <div className='relative h-fit'>
                    <TextInput id='' value={utilsMonthSalary.nov} name='nov' onChange={handleUtilsChange} className='[&_input]:pr-9 [&_input]:text-right [&_input]:h-8 [&_input]:w-32' />
                    <span className='font-bold opacity-50 select-none absolute right-1 ml-4 -mt-[1.6rem] '>BsS.</span>
                  </div>
                </TableCell>
                <TableCell>{utilsAliquot.nov}<span className='font-bold opacity-50 select-none ml-2'>BsS.</span></TableCell>
                <TableCell>{dayjs(employee?.hiringDate).month() + 1 === 11 ? <FaCheck /> : ''}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell>12</TableCell>
                <TableCell>Diciembre</TableCell>
                <TableCell>
                  <div className='relative h-fit'>
                    <TextInput id='' value={utilsMonthSalary.dec} name='dec' onChange={handleUtilsChange} className='[&_input]:pr-9 [&_input]:text-right [&_input]:h-8 [&_input]:w-32' />
                    <span className='font-bold opacity-50 select-none absolute right-1 ml-4 -mt-[1.6rem] '>BsS.</span>
                  </div>
                </TableCell>
                <TableCell>{utilsAliquot.dec}<span className='font-bold opacity-50 select-none ml-2'>BsS.</span></TableCell>
                <TableCell>{dayjs(employee?.hiringDate).month() + 1 === 12 ? <FaCheck /> : ''}</TableCell>
              </TableRow>

            </Table.Body>
          </Table>
          <div className='text-xs flex gap-4 mt-4'>
            <FaCheck />
            En este mes nace su derecho a vacionaciones, recuerde incluir el monto del bono vacacional a su sueldo. Art 192 LOTTT
          </div>
          <div className='flex justify-between mt-6'>
            <span className='font-bold'>Total de Utilidades:</span>
            <span>
              {Object.values(utilsAliquot).reduce((accumulator, value) => {
                return accumulator + parseFloat(value || 0)
              }, 0).toFixed(2)}
              <span className='font-bold opacity-50 select-none ml-2'>BsS.</span>
            </span>
          </div>
          <hr className='h-px border-0 dark:bg-gray-700 my-1 bg-slate-300' />

          <div className='mt-6'>
            <h3 className='font-bold'>Deducciones</h3>
            <div className='flex justify-between'>
              <p className='ml-4'>INCES <span className='ml-6 text-blue-600 dark:text-blue-300 font-semibold'>0.50%</span></p>
              <p>
                {((Object.values(utilsAliquot).reduce((accumulator, value) => {
                  return accumulator + parseFloat(value || 0)
                }, 0)) * 0.005).toFixed(2)}
                <span className='font-bold opacity-50 select-none ml-2'>BsS.</span>
              </p>
            </div>
          </div>

          <hr className='h-px border-0 dark:bg-gray-700 my-1 bg-slate-300' />

          <div className='mt-6 flex justify-between'>
            <h3 className='font-bold'>Saldo total:</h3>
            <span> {(Object.values(utilsAliquot).reduce((accumulator, value) => { return accumulator + parseFloat(value || 0) }, 0) - ((Object.values(utilsAliquot).reduce((acc, val) => { return acc + parseFloat(val || 0) }, 0)) * 0.005)).toFixed(2)} <span className='font-bold opacity-50 select-none ml-2'>BsS.</span> </span>

          </div>

        </div> //eslint-disable-line  

        }

        </div>

        {/* Bloque Vacaciones */}
        <div id='worker-container' className='bg-slate-50 dark:bg-slate-800 dark:border-2 border-slate-600 shadow-lg  rounded-md w-full max-w-xl overflow-auto max-h-[32rem] flex-shrink'>
          <h2 className='flex justify-between text-lg font-semibold dark:text-slate-200 bg-slate-50 dark:bg-slate-800 sticky px-4 py-2 top-0 z-10'>Vacaciones <span className='font-bold text-sm'>Período {dayjs().year()} - {dayjs().add(1, 'year').year()}</span></h2>
          {
      isLoading
        ? <Spinner />

        : <div className='mx-4 mb-4 dark:text-white'>
          <h3 className='font-semibold flex justify-center mb-4 bg-slate-100 dark:bg-slate-700 py-1 rounded-full'>Días de Disfrute: </h3>
          <div>
            <h3 className='font-semibold flex justify-between mx-8'>Días de Disfrute:
              <span>{employee?.vacationDaysBase} Hábiles</span>
            </h3>

            <hr className='h-px border-0 dark:bg-gray-700 my-1 mx-6 bg-slate-200' />

            <h3 className='font-semibold flex justify-between mx-8'>Días por años de servicio:
              <span>{yearsOfService >= 20 ? 20 : yearsOfService} Hábiles</span>
            </h3>
            <hr className='h-px border-0 dark:bg-gray-700 my-1 mx-6 bg-slate-200' />

            <h3 className='font-semibold flex justify-between mx-8'>Días Totales:
              <span>{vacationDays} Hábiles</span>
            </h3>
            <hr className='h-px border-0 dark:bg-gray-700 my-1 mx-6 bg-slate-200' />

          </div>

          <h3 className='font-semibold flex justify-center my-4 bg-slate-100 dark:bg-slate-700 py-1 rounded-full'>Bono Vacacional </h3>
          <div>
            <div className='flex justify-between mx-8'>
              <h3 className='font-semibold  '>Días de Bono Base</h3>
              <div>
                <input
                  name='vacationBonusDays'
                  type='number'
                  min={0}
                  max={20}
                  className='placeholder-gray-900 dark:border-slate-800 dark:border-opacity-70 placeholder-opacity-30 w-12 h-4 text-sm border border-gray-300 dark:text-slate-200 dark:bg-slate-500 dark:placeholder-slate-50 dark:placeholder-opacity-40 text-right px-2 py-3 rounded-md outline-blue-600'
                  value={vacations.vacationBonusDays}
                  onChange={handleVacationsChange}
                />
                <span className='ml-4 font-semibold'>Hábiles</span>
              </div>

            </div>

            <hr className='h-px border-0 dark:bg-gray-700 my-1 mx-6 bg-slate-200' />

            <h3 className='font-semibold flex justify-between mx-8'>Días por años de servicio:
              <span>{yearsOfService >= 20 ? 20 : yearsOfService} Hábiles</span>
            </h3>
            <hr className='h-px border-0 dark:bg-gray-700 my-1 mx-6 bg-slate-200' />

            <h3 className='font-semibold flex justify-between mx-8'>Días Totales:
              <span>{parseInt(vacations.vacationBonusDays) + parseInt(yearsOfService)} Hábiles</span>
            </h3>

            <hr className='h-px border-0 dark:bg-gray-700 my-1 mx-6 bg-slate-200' />

          </div>

          <h3 className='font-semibold flex justify-center my-4 bg-slate-100 dark:bg-slate-700 py-1 rounded-full'>Salario Base para el Cálculo: </h3>
          <div>

            <h3 className='font-semibold flex justify-between mx-8'>{vacations.thirdMonth}
              <div className='relative '>
                <TextInput id='' value={vacations.thirdMonthValue} name='thirdMonthValue' onChange={handleVacationsChange} className='[&_input]:pr-10 [&_input]:text-right [&_input]:h-4 [&_input]:w-32' type='number' />
                <span className='font-bold opacity-50 select-none absolute right-2 -mt-[1.1rem] text-xs'>BsS.</span>
              </div>
            </h3>

            <hr className='h-px border-0 dark:bg-gray-700 my-1 mx-6 bg-slate-200' />

            <h3 className='font-semibold flex justify-between mx-8'>{vacations.secondMonth}
              <div className='relative '>
                <TextInput id='' value={vacations.secondMonthValue} name='secondMonthValue' onChange={handleVacationsChange} className='[&_input]:pr-10 [&_input]:text-right [&_input]:h-4 [&_input]:w-32' type='number' />
                <span className='font-bold opacity-50 select-none absolute right-2 -mt-[1.1rem] text-xs'>BsS.</span>
              </div>
            </h3>

            <hr className='h-px border-0 dark:bg-gray-700 my-1 mx-6 bg-slate-200' />

            <h3 className='font-semibold flex justify-between mx-8'>{vacations.firstMonth}
              <div className='relative '>
                <TextInput id='' value={vacations.firstMonthValue} name='firstMonthValue' onChange={handleVacationsChange} className='[&_input]:pr-10 [&_input]:text-right [&_input]:h-4 [&_input]:w-32' type='number' />
                <span className='font-bold opacity-50 select-none absolute right-2 -mt-[1.1rem] text-xs'>BsS.</span>
              </div>
            </h3>

            <hr className='h-px border-0 dark:bg-gray-700 my-1 mx-6 bg-slate-200' />

            <h3 className='font-semibold flex justify-end gap-16 mx-8 mt-4'>Salario Base para el cálculo:
              <p>
                {
                isNaN(vacations.averageVacationSalary) ? 0 : vacations.averageVacationSalary
                }
                <span className='font-bold opacity-50 ml-2'>BsS.</span>
              </p>
            </h3>

            <hr className='h-px border-0 dark:bg-gray-700 mt-1 ml-32 mr-6 bg-slate-200' />
            <hr className='h-px border-0 dark:bg-gray-700  mt-0.5 ml-32 mr-6 bg-slate-200' />

          </div>

          <h3 className='font-semibold flex justify-center my-4 bg-slate-100 dark:bg-slate-700 py-1 rounded-full'>Montos de las Vacaciones: </h3>
          <div>

            <h3 className='font-semibold flex justify-between mx-8'>
              Días de Disfrute
              <div>
                <span>{isNaN(parseFloat((vacationDays * vacations.averageVacationSalary) / 30).toFixed(2)) ? 0 : parseFloat((vacationDays * vacations.averageVacationSalary) / 30).toFixed(2)}</span>
                <span className='font-bold opacity-50 select-none ml-2'>BsS.</span>
              </div>
            </h3>

            <hr className='h-px border-0 dark:bg-gray-700 my-1 mx-6 bg-slate-200' />

            <h3 className='font-semibold flex justify-between mx-8'>
              Bono Vacacional
              <div>
                <span>{parseFloat(((parseInt(vacations.vacationBonusDays) + parseInt(yearsOfService)) * vacations.averageVacationSalary) / 30 || 0).toFixed(2)}</span>
                <span className='font-bold opacity-50 select-none ml-2'>BsS.</span>
              </div>
            </h3>

            <hr className='h-px border-0 dark:bg-gray-700 my-1 mx-6 bg-slate-200' />

            <div className='font-semibold flex justify-between mx-8'>
              <h3 className='flex gap-2'>
                Días Feriados:
                <TextInput id='' value={vacations.holidays} name='holidays' onChange={handleVacationsChange} className=' [&_input]:text-center [&_input]:h-4 [&_input]:w-12' type='number' />
              </h3>
              <p>
                {isNaN(parseFloat(vacations.holidays * (vacations.averageVacationSalary / 30)).toFixed(2)) ? 0 : parseFloat(vacations.holidays * (vacations.averageVacationSalary / 30)).toFixed(2)}
                <span className='font-bold opacity-50 select-none ml-2'>BsS.</span>
              </p>
            </div>

            <hr className='h-px border-0 dark:bg-gray-700 my-1 mx-6 bg-slate-200' />

            <div className='font-semibold flex justify-between mx-8'>
              <h3 className='flex gap-2'>
                Días De Descanso:
                <TextInput id='' value={vacations.daysOff} name='daysOff' onChange={handleVacationsChange} className=' [&_input]:text-center [&_input]:h-4 [&_input]:w-12' type='number' />
              </h3>
              <p>
                {isNaN(parseFloat(vacations.daysOff * (vacations.averageVacationSalary / 30)).toFixed(2)) ? 0 : parseFloat(vacations.daysOff * (vacations.averageVacationSalary / 30)).toFixed(2)}
                <span className='font-bold opacity-50 select-none ml-2'>BsS.</span>
              </p>
            </div>

            <hr className='h-px border-0 dark:bg-gray-700 my-1 mx-6 bg-slate-200' />

            <h3 className='font-semibold flex justify-end gap-16 mx-8 mt-4'>Total devengado:
              <p>
                {
                isNaN(vacations.totalVacationsAmmount) ? 0 : vacations.totalVacationsAmmount
                }
                <span className='font-bold opacity-50 ml-2'>BsS.</span>
              </p>
            </h3>

            <hr className='h-px border-0 dark:bg-gray-700 mt-1 ml-32 mr-6 bg-slate-200' />
            <hr className='h-px border-0 dark:bg-gray-700  mt-0.5 ml-32 mr-6 bg-slate-200' />

          </div>

          <h3 className='font-semibold flex justify-between mx-8 mt-4'>
            Deducciones:
          </h3>

          <div className='font-semibold flex justify-between mx-8 '>
            <h3 className='flex gap-2'>
              Seguro Social Obligatorio
            </h3>
            <p>
              {isNaN(parseFloat(vacations.deductions.socialSecurity)) ? 0 : parseFloat(vacations.deductions.socialSecurity).toFixed(2)}
              <span className='font-bold opacity-50 select-none ml-2'>BsS.</span>
            </p>
          </div>

          <hr className='h-px border-0 dark:bg-gray-700 my-1 mx-6 bg-slate-200' />

          <div className='font-semibold flex justify-between mx-8 '>
            <h3 className='flex gap-2'>
              Paro Forzoso
            </h3>
            <p>
              {isNaN(parseFloat(vacations.deductions.forcedStop)) ? 0 : parseFloat(vacations.deductions.forcedStop).toFixed(2)}
              <span className='font-bold opacity-50 select-none ml-2'>BsS.</span>
            </p>
          </div>

          <hr className='h-px border-0 dark:bg-gray-700 my-1 mx-6 bg-slate-200' />

          <div className='font-semibold flex justify-between mx-8 '>
            <h3 className='flex gap-2'>
              Ahorro Habitacional
            </h3>
            <p>
              {isNaN(parseFloat(vacations.deductions.LPH)) ? 0 : parseFloat(vacations.deductions.LPH).toFixed(2)}
              <span className='font-bold opacity-50 select-none ml-2'>BsS.</span>
            </p>
          </div>

          <hr className='h-px border-0 dark:bg-gray-700 my-1 mx-6 bg-slate-200' />

          <h3 className='font-semibold flex justify-end gap-16 mx-8 mt-4'>Total deducciones:
            <p>
              {
                isNaN(vacations.deductions.socialSecurity + vacations.deductions.forcedStop + vacations.deductions.LPH) ? 0 : parseFloat(vacations.deductions.socialSecurity + vacations.deductions.forcedStop + vacations.deductions.LPH).toFixed(2)
                }
              <span className='font-bold opacity-50 ml-2'>BsS.</span>
            </p>
          </h3>

          <hr className='h-px border-0 dark:bg-gray-700 mt-1 ml-32 mr-6 bg-slate-200' />
          <hr className='h-px border-0 dark:bg-gray-700  mt-0.5 ml-32 mr-6 bg-slate-200' />

          <h3 className='font-semibold flex justify-end gap-16 mx-8 mt-4'>Total de Vacaciones:
            <p>
              {
                isNaN(vacations.totalVacationsAmmount - (vacations.deductions.socialSecurity + vacations.deductions.forcedStop + vacations.deductions.LPH)) ? 0 : parseFloat(vacations.totalVacationsAmmount - (vacations.deductions.socialSecurity + vacations.deductions.forcedStop + vacations.deductions.LPH)).toFixed(2)
                }
              <span className='font-bold opacity-50 ml-2'>BsS.</span>
            </p>
          </h3>

          <hr className='h-px border-0 dark:bg-gray-700 mt-1 ml-32 mr-6 bg-slate-200' />
          <hr className='h-px border-0 dark:bg-gray-700  mt-0.5 ml-32 mr-6 bg-slate-200' />

          <h3 className='font-semibold flex justify-start gap-16 mx-8 mt-8'>Meses Transcurridos:
            <p className='ml-auto'>
              {vacations.monthsPassed}
            </p>
          </h3>

          <hr className='h-px border-0 dark:bg-gray-700  mt-0.5 ml-32 mr-6 bg-slate-200' />

          <h3 className='font-semibold flex justify-start gap-16 mx-8 mt-2'>Porcentaje de vacaciones ganadas:
            <p className='ml-auto'>
              {parseFloat((vacations.monthsPassed / 12) * 100).toFixed(2)} %
            </p>
          </h3>

          <hr className='h-px border-0 dark:bg-gray-700 mt-1 ml-32 mr-6 bg-slate-200' />

          <h3 className='font-semibold flex justify-start gap-16 mx-8 mt-2'>Total de vacaciones ganadas:
            <p className='ml-auto'>
              {parseFloat((vacations.totalVacationsAmmount - (vacations.deductions.socialSecurity + vacations.deductions.forcedStop + vacations.deductions.LPH)) * (vacations.monthsPassed / 12) || 0).toFixed(2)}
              <span className='font-bold opacity-50 ml-2'>BsS.</span>
            </p>
          </h3>

          <hr className='h-px border-0 dark:bg-gray-700 mt-1 ml-32 mr-6 bg-slate-200' />
          <hr className='h-px border-0 dark:bg-gray-700  mt-0.5 ml-32 mr-6 bg-slate-200' />

        </div> //eslint-disable-line  

        }

        </div>

        {/* Bloque Prestaciones */}
        <div id='worker-container' className='bg-slate-50 dark:bg-slate-800 dark:border-2 border-slate-600 shadow-lg  rounded-md w-full md:mx-2 overflow-y-auto  max-h-[32rem] '>
          <h2 className='flex justify-between text-lg font-semibold dark:text-slate-200 bg-slate-50 dark:bg-slate-800 sticky px-4 py-2 top-0 z-10'>Prestaciones Sociales</h2>
          {
      isLoading
        ? <Spinner />

        : <div className='mx-8 mb-4 '>

          <div className='flex flex-wrap gap-6 justify-between dark:text-slate-100'>

            <div id='total' className='w-[40%] min-w-64 mx-auto md:mx-0'>
              <p className='flex justify-between'>Total de Prestaciones Ganadas:
                <span>{parseFloat(totalAliquotSum || 0).toFixed(2)}
                  <span className='font-bold opacity-50 select-none ml-2'>BsS.</span>
                </span>

              </p>

              <hr className='h-px border-0 dark:bg-gray-700 bg-slate-300' />

              <p className='flex justify-between'>Prestaciones Retiradas:
                <span>- {parseFloat(totalWithdrawSum || 0).toFixed(2)}
                  <span className='font-bold opacity-50 select-none ml-2'>BsS.</span>
                </span>
              </p>

              <hr className='h-0.5 border-0 dark:bg-gray-700 bg-slate-300' />

              <p className='flex justify-between mt-2'>Prestaciones Restantes:
                <span>{parseFloat((totalAliquotSum - totalWithdrawSum) || 0).toFixed(2)}
                  <span className='font-bold opacity-50 select-none ml-2'>BsS.</span>
                </span>
              </p>
              <hr className='h-px border-0 dark:bg-gray-700 bg-slate-300' />

              <p className='mt-6 flex ml-2 justify-between'>Cantidad Máxima Disponible:
                <span>{parseFloat(((totalAliquotSum - totalWithdrawSum) * 0.75) || 0).toFixed(2)}
                  <span className='font-bold opacity-50 select-none ml-2'>BsS.</span>
                </span>
              </p>
              <hr className='h-0.5 border-0 dark:bg-gray-700 bg-slate-300' />
            </div>

            <div id='interests' className='w-[40%] min-w-64 flex flex-col max-h-max mx-auto md:mx-0'>

              <p className='flex justify-between'>Total de intereses acumulados:
                <span>{parseFloat(totalRateSum || 0).toFixed(2)}
                  <span className='font-bold opacity-50 select-none ml-2'>BsS.</span>
                </span>
              </p>

              <hr className='h-px border-0 dark:bg-gray-700 bg-slate-300' />

              <p className='flex justify-between'>Intereses Retirados:
                <span>- {parseFloat(interestWithdrawSum || 0).toFixed(2)}
                  <span className='font-bold opacity-50 select-none ml-2'>BsS.</span>
                </span>
              </p>

              <hr className='h-px border-0 dark:bg-gray-700 bg-slate-300' />

              <p className='flex justify-between mt-auto'>Intereses Restantes:
                <span>{parseFloat((totalRateSum - interestWithdrawSum) || 0).toFixed(2)}
                  <span className='font-bold opacity-50 select-none ml-2'>BsS.</span>
                </span>
              </p>
              <hr className='h-0.5 border-0 dark:bg-gray-700 bg-slate-300' />
            </div>
          </div>

          <div className='w-full overflow-x-auto mt-6'>
            <Table className=' '>
              <TableHead>
                <TableHeadCell className='bg-slate-200'>Año</TableHeadCell>
                <TableHeadCell className='bg-slate-200'>Mes</TableHeadCell>
                <TableHeadCell className='bg-slate-200'>Alicuota</TableHeadCell>
                <TableHeadCell className='bg-slate-200'>Retiros</TableHeadCell>
                <TableHeadCell className='bg-slate-200'><a href='https://www.bcv.org.ve/sites/default/files/GEE%20-%20Tasas%20de%20Interes/1_3_18.xls' rel='noreferrer' className='text-blue-700 dark:text-blue-400 underline'>Tasa</a></TableHeadCell>
                <TableHeadCell className='bg-slate-200'>Monto</TableHeadCell>
                <TableHeadCell className='bg-slate-200'>Retiros</TableHeadCell>
              </TableHead>
              <TableBody>
                {

                benefits?.reverse().map((benefit) => (
                  <TableRow key={benefit._id}>
                    <TableCell>{benefit.date.split('-')[0]}</TableCell>
                    <TableCell>{benefit.date.split('-')[1].charAt(0).toUpperCase() + benefit.date.split('-')[1].slice(1)}</TableCell>
                    <TableCell>
                      {parseFloat(benefit.aliquot).toFixed(2)}
                      <span className='font-bold opacity-50 select-none ml-2'>BsS.</span>
                    </TableCell>

                    <TableCell className='flex gap-2'>
                      {editField?.benefitId === benefit._id && editField.field === 'totalWithdraw'
                        ? (
                          <TextInput
                            type='text'
                            name='totalWithdraw'
                            value={formData.totalWithdraw !== undefined ? formData.totalWithdraw : benefit.totalWithdraw}
                            onChange={handleChange}
                            className='[&_input]:text-right [&_input]:h-8 [&_input]:w-16'

                          />
                          )
                        : (
                          <p>
                            {parseFloat(benefit.totalWithdraw || 0).toFixed(2)}
                            <span className='font-bold opacity-50 select-none ml-2'>BsS.</span>
                          </p>
                          )}
                      <button onClick={() => {
                        if (editField?.benefitId === benefit._id && editField.field === 'totalWithdraw') {
                          handleSaveClick(benefit._id)
                          console.log(editField?.benefitId, benefit._id)
                        } else {
                          handleEditClick(benefit._id, 'totalWithdraw')
                        }
                      }}
                      >
                        {editField?.benefitId === benefit._id && editField.field === 'totalWithdraw' ? <FaFloppyDisk /> : <FaPencil />}
                      </button>
                    </TableCell>

                    <TableCell className='bg-slate-100 dark:bg-gray-700'>
                      <div className='flex gap-2'>
                        {editField?.benefitId === benefit._id && editField.field === 'rate'
                          ? (
                            <TextInput
                              type='number'
                              name='rate'
                              value={formData.rate !== undefined ? formData.rate : benefit.rate}
                              onChange={handleChange}
                              className='[&_input]:text-right [&_input]:h-8 [&_input]:w-16'
                            />
                            )
                          : (
                            <p>
                              {parseFloat(benefit.rate || 0).toFixed(2)}
                              <span className='font-bold opacity-50 select-none ml-2'>%</span>
                            </p>
                            )}
                        <button
                          onClick={() => {
                            if (editField?.benefitId === benefit._id && editField.field === 'rate') {
                              handleSaveClick(benefit._id)
                              console.log(editField?.benefitId, benefit._id)
                            } else {
                              handleEditClick(benefit._id, 'rate')
                            }
                          }}
                          className='text-blue-600'
                        >
                          {editField?.benefitId === benefit._id && editField.field === 'rate' ? <FaFloppyDisk /> : <FaPencil />}
                        </button>
                      </div>
                    </TableCell>

                    <TableCell className='bg-slate-100 dark:bg-gray-700'>
                      <div className='flex'>
                        <p> {(parseFloat(benefit.rate / 100 || 0) * parseFloat(benefit.aliquot || 0)).toFixed(2)}</p>
                        <span className='font-bold opacity-50 select-none ml-2'>BsS.</span>
                      </div>
                    </TableCell>

                    <TableCell className='gap-2 flex'>
                      {editField?.benefitId === benefit._id && editField.field === 'interestWithdraw'
                        ? (
                          <TextInput
                            type='text'
                            name='interestWithdraw'
                            value={formData.interestWithdraw !== undefined ? formData.interestWithdraw : benefit.interestWithdraw}
                            onChange={handleChange}
                            className='[&_input]:text-right [&_input]:h-8 [&_input]:w-16'
                          />
                          )
                        : (
                          <p>
                            {parseFloat(benefit.interestWithdraw || 0).toFixed(2)}
                            <span className='font-bold opacity-50 select-none ml-2'>BsS.</span>
                          </p>
                          )}
                      <button onClick={() => {
                        if (editField?.benefitId === benefit._id && editField.field === 'interestWithdraw') {
                          handleSaveClick(benefit._id)
                        } else {
                          handleEditClick(benefit._id, 'interestWithdraw')
                        }
                      }}
                      >
                        {editField?.benefitId === benefit._id && editField.field === 'interestWithdraw' ? <FaFloppyDisk /> : <FaPencil />}
                      </button>
                    </TableCell>

                  </TableRow>
                ))
              }
              </TableBody>
            </Table>
          </div>

        </div> //eslint-disable-line

        }

        </div>

        {/* Bloque Liquidación */}
        <div id='worker-container' className='bg-slate-50 dark:bg-slate-800 dark:border-2 border-slate-600 shadow-lg  rounded-md w-full max-w-2xl  overflow-auto  max-h-[32rem]  '>
          <h2 className='flex justify-between text-lg font-semibold dark:text-slate-200 bg-slate-50 dark:bg-slate-800 sticky px-4 py-2 top-0 z-10'>Liquidación</h2>
          {
      isLoading
        ? <Spinner />

        : <div className='mx-8 mb-4 dark:text-slate-100'>

          <div>
            <label htmlFor='terminationType'>Tipo de Liquidación:</label>
            <Select name='terminationType' id='terminationType' className='ml-2 mt-2' onChange={(e) => setTerminationType(e.target.value)}>
              <option value='' className='hidden'>Seleccione una opción...</option>
              <option value='renuncia'>Renuncia</option>
              <option value='despido'>Despido</option>
            </Select>
          </div>

          {
            terminationType === 'despido' &&

              <div className='mt-4'>
                <label htmlFor='terminationType'>Tipo de Despido:</label>
                <Select name='fireType' id='terminationType' className='ml-2 mt-2' onChange={(e) => setFireType(e.target.value)}>
                  <option value='' className='hidden'>Seleccione una opción...</option>
                  <option value='justificado'>Justificado</option>
                  <option value='injustificado'>Injustificado</option>
                </Select>
              </div>
          }

          <h3 className='font-bold mt-4'>Cálculos de Prestaciones para liquidación</h3>

          <h3 className='font-bold ml-2 mt-2'>Monto A</h3>

          <div className='ml-4 mt-2'>
            <h3 className='flex justify-between'>Retroactividad:
              <p>{terminationCalc.retroactivity} Año/s</p>
            </h3>

            <hr className='h-pxborder-0 dark:bg-gray-700 bg-slate-300' />

            <h3 className='flex justify-between'>Días por retroactivos (30 por año):
              <p>{terminationCalc.retroactivityDays}</p>
            </h3>

            <hr className='h-px border-0 dark:bg-gray-700 bg-slate-300' />

            <h3 className='flex justify-between'>Último Sueldo:
              <p>{employee?.baseSalary.$numberDecimal}
                <span className='font-bold opacity-50 select-none ml-2'>BsS.</span>
              </p>
            </h3>

            <hr className='h-px border-0 dark:bg-gray-700 bg-slate-300' />

            <h3 className='flex justify-between mt-4 font-semibold'>Monto de Prestaciones retroactivas:
              <p>{parseFloat(terminationCalc.retroactivityAmmount).toFixed(2)}
                <span className='font-bold opacity-50 select-none ml-2'>BsS.</span>
              </p>
            </h3>

            <hr className='h-px border-0 dark:bg-gray-700 bg-slate-300' />

          </div>

          <h3 className='font-bold ml-2 mt-2'>Monto B</h3>

          <div className='ml-4 mt-2'>

            <h3 className='flex justify-between'>Monto del Fondo de Prestaciones:
              <p>{parseFloat(terminationCalc.benefitsAmmount).toFixed(2)}
                <span className='font-bold opacity-50 select-none ml-2'>BsS.</span>
              </p>
            </h3>

            <hr className='h-px border-0 dark:bg-gray-700 bg-slate-300' />

            <h3 className='flex justify-between'>Días adicionales:
              <span>{terminationCalc.additionalDays}</span>
            </h3>

            <hr className='h-px border-0 dark:bg-gray-700 bg-slate-300' />

            <h3 className='flex justify-between'>Monto por Días adicionales:
              <p>{parseFloat(terminationCalc.additionalDaysAmmount).toFixed(2)}
                <span className='font-bold opacity-50 select-none ml-2'>BsS.</span>
              </p>
            </h3>

            <hr className='h-px border-0 dark:bg-gray-700 bg-slate-300' />

            <h3 className='flex justify-between mt-4 font-semibold'>Monto Total del Fondo de Prestaciones:
              <p>{parseFloat(terminationCalc.totalBenefitFund).toFixed(2)}
                <span className='font-bold opacity-50 select-none ml-2'>BsS.</span>
              </p>
            </h3>

            <hr className='h-px border-0 dark:bg-gray-700 bg-slate-300' />

          </div>

          <p className='text-center mt-6'>Se selecciona el monto mayor entre A y B para el pago de prestaciones.</p>
          <p className='text-center'>En este caso la opción: <span className='font-bold'>{terminationCalc.totalBenefitFund > terminationCalc.retroactivityAmmount ? 'B' : 'A'}</span></p>

          <h3 className='font-bold mt-4 mb-2'>Cálculo Total de Liquidación</h3>

          <div className='ml-4'>
            <h3 className='flex justify-between'>Utilidades:
              <p>{terminationCalc.utilities}
                <span className='font-bold opacity-50 select-none ml-2'>BsS.</span>
              </p>
            </h3>

            <hr className='h-px border-0 dark:bg-gray-700 bg-slate-300' />

            <h3 className='flex justify-between'>Vacaciones:
              <p>{terminationCalc.vacationsEarned}
                <span className='font-bold opacity-50 select-none ml-2'>BsS.</span>
              </p>
            </h3>

            <hr className='h-px border-0 dark:bg-gray-700 bg-slate-300' />

            <h3 className='flex justify-between'>Prestaciones:
              <p>{parseFloat(calculateBenefits()).toFixed(2)}
                <span className='font-bold opacity-50 select-none ml-2'>BsS.</span>
              </p>
            </h3>

            <hr className='h-px border-0 dark:bg-gray-700 bg-slate-300' />

            <h3 className='flex justify-between text-red-700 dark:text-red-500'>Retiro del Fondo de Prestaciones:
              <p>{terminationCalc.aliquotBenefitWithdraws}
                <span className='font-bold opacity-50 select-none ml-2'>BsS.</span>
              </p>
            </h3>

            <hr className='h-px border-0 dark:bg-gray-700 bg-slate-300' />

            <h3 className='flex justify-between mt-4 font-bold'>Total:
              <p>{(parseFloat(terminationCalc.vacationsEarned) + parseFloat(terminationCalc.utilities) + calculateBenefits() - parseFloat(terminationCalc.aliquotBenefitWithdraws)).toFixed(2)}
                <span className='font-bold opacity-50 select-none ml-2'>BsS.</span>
              </p>
            </h3>
          </div>

        </div> //eslint-disable-line

        }

        </div>

        {/* Bloque DEDUCCIONES */}
        <div id='worker-container' className='bg-slate-50 dark:bg-slate-800 dark:border-2 border-slate-600 shadow-lg rounded-md w-full max-w-lg overflow-auto max-h-[32rem] '>
          <h2 className='text-lg font-semibold px-4 py-2 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 sticky top-0 z-10'>Deducciones del Mes</h2>
          {
      isLoading
        ? <Spinner />

        : <div className='mx-4 mb-4 '>

          <div className='flex flex-col gap-2 ml-2 bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-md text-gray-950 dark:text-slate-300 border-2  border-slate-300 overflow-auto'>

            <h3 className='font-medium mb-2 text-gray-950 dark:text-slate-300 '>Retención del Seguro Social</h3>

            <label htmlFor='minimumSalary' className='flex justify-between items-center relative'>Salario mínimo:
              <TextInput id='minimumSalary' value={deductions.minimumSalary} name='minimumSalary' onChange={handleDeductionsChange} className='[&_input]:pr-12 [&_input]:text-right [&_input]:h-8' />
              <span className='font-bold opacity-50 select-none absolute right-2 ml-4'>BsS.</span>
            </label>

            <div className='flex justify-between'>
              <h4>Sueldo Excede 5 Salarios Mínimos</h4>
              <p>{employee?.baseSalary.$numberDecimal > (deductions.minimumSalary * 5) ? 'SI' : 'NO'}</p>
            </div>

            <label htmlFor='minimumSalary' className='flex justify-between items-center relative'>Porcentaje de Retención:
              <TextInput id='minimumSalary' value={deductions.retentionPercentage} name='retentionPercentage' onChange={handleDeductionsChange} className='[&_input]:pr-6 [&_input]:text-right [&_input]:h-8' />
              <span className='font-bold opacity-50 select-none absolute right-2 ml-4'>%</span>
            </label>

            <hr className='h-px border-0 dark:bg-gray-700 bg-slate-300' />

            <div className='flex justify-end gap-8  mt-4'>
              <h4 className='font-bold'>Descuento Mensual</h4>
              <p>{deductions.retentionTotal}
                <span className='font-bold opacity-50 select-none ml-2'>BsS.</span>
              </p>
            </div>

          </div>

          <hr className='h-px border-0 dark:bg-gray-700 my-2 bg-slate-300' />

          <div className='flex flex-col gap-2 ml-2 bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-md text-gray-950 dark:text-slate-300 border-2  border-slate-300'>
            <h3 className='font-medium mb-2 text-gray-950 dark:text-slate-300 '>Paro Forzoso</h3>

            <label htmlFor='minimumSalary' className='flex justify-between items-center relative'>Salario mínimo:
              <TextInput id='minimumSalary' value={deductions.minimumSalary} name='minimumSalary' onChange={handleDeductionsChange} className='[&_input]:pr-12 [&_input]:text-right [&_input]:h-8' />
              <span className='font-bold opacity-50 select-none absolute right-2 ml-4'>BsS.</span>
            </label>

            <div className='flex justify-between'>
              <h4>Sueldo Excede 5 Salarios Mínimos</h4>
              <p>{employee?.baseSalary.$numberDecimal > (deductions.minimumSalary * 5) ? 'SI' : 'NO'}</p>
            </div>

            <label htmlFor='minimumSalary' className='flex justify-between items-center relative'>Porcentaje de Retención:
              <TextInput id='minimumSalary' value={deductions.paroForzoso} name='paroForzoso' onChange={handleDeductionsChange} className='[&_input]:pr-6 [&_input]:text-right [&_input]:h-8' />
              <span className='font-bold opacity-50 select-none absolute right-2 ml-4'>%</span>
            </label>

            <hr className='h-px border-0 dark:bg-gray-700 bg-slate-300' />

            <div className='flex justify-end gap-8  mt-4'>
              <h4 className='font-bold'>Descuento Mensual</h4>
              <p>{deductions.paroTotal}
                <span className='font-bold opacity-50 select-none ml-2'>BsS.</span>
              </p>
            </div>

          </div>

          <hr className='h-px border-0 dark:bg-gray-700 my-2 bg-slate-300' />

          <div className='flex flex-col gap-2 ml-2 bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-md text-gray-950 dark:text-slate-300 border-2  border-slate-300'>
            <h3 className='font-medium mb-2 text-gray-950 dark:text-slate-300 '>Ley de Política Habitacional (LPH)</h3>

            <label htmlFor='minimumSalary' className='flex justify-between items-center relative'>Porcentaje de Retención:
              <TextInput id='minimumSalary' value={deductions.LPH} name='LPH' onChange={handleDeductionsChange} className='[&_input]:pr-6 [&_input]:text-right [&_input]:h-8' />
              <span className='font-bold opacity-50 select-none absolute right-2 ml-4'>%</span>
            </label>

            <hr className='h-px border-0 dark:bg-gray-700 bg-slate-300' />

            <div className='flex justify-end gap-8  mt-4'>
              <h4 className='font-bold'>Descuento Mensual</h4>
              <p>{deductions.LPHtotal}
                <span className='font-bold opacity-50 select-none ml-2'>BsS.</span>
              </p>
            </div>

          </div>

          <div className='flex justify-end gap-8  mt-4 dark:text-white'>
            <h4 className='font-bold'>Descuento Total del Mes</h4>
            <p>{deductions.monthlyTotal}
              <span className='font-bold opacity-50 select-none ml-2'>BsS.</span>
            </p>
          </div>
          <hr className='h-1 ml-56 border-0 dark:bg-gray-700 bg-slate-300' />

        </div> //eslint-disable-line

        }

        </div>

      </div>
    </>
  )
}

export default SalaryByEmployee
