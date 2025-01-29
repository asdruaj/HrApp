import { Button, Spinner } from 'flowbite-react'
import React, { useState, useEffect } from 'react'
import { FaClipboardList, FaMagnifyingGlass } from 'react-icons/fa6'
import EmployeeCard from '../components/EmployeeCard'
import { useGetEmployeesQuery } from '../state/employeesApiSlice'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import { useGetAllAbsenteeismsQuery } from '../state/absenteeismApiSlice'
import { PDFDownloadLink } from '@react-pdf/renderer'
import PDFtxt from '../components/PDFtxt'

dayjs.extend(utc)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

const SalaryScreen = () => {
  const { data: employees, isLoading } = useGetEmployeesQuery()
  const { data: absenteeism } = useGetAllAbsenteeismsQuery()

  const [filter, setFilter] = useState('')

  const filteredEmployees = employees?.filter((employee) =>
    employee?.firstName?.toLowerCase().includes(filter?.toLowerCase()) ||
    employee?.lastName?.toLowerCase().includes(filter?.toLowerCase()) ||
    employee?.department?.toLowerCase().includes(filter?.toLowerCase()) ||
    employee?.position?.toLowerCase().includes(filter?.toLowerCase()) ||
    employee?.idDocument?.toLowerCase().includes(filter?.toLowerCase())
  )

  const [events, setEvents] = useState([])

  const [txtData, setTxtData] = useState([])

  const generateTxt = () => {
    const paymentData = employees?.map((employee) => {
      const dailySalary = employee && employee?.baseSalary.$numberDecimal / 30

      const minimumSalary = 180
      const retentionPercentage = 4
      const paroForzoso = 0.5
      const LPH = 1

      const retentionTotal = employee?.baseSalary.$numberDecimal > (minimumSalary * 5) ? parseFloat((minimumSalary * 5) * (retentionPercentage / 100)).toFixed(2) : parseFloat(employee?.baseSalary.$numberDecimal * (retentionPercentage / 100)).toFixed(2)

      const paroTotal = employee?.baseSalary.$numberDecimal > (minimumSalary * 5) ? parseFloat((minimumSalary * 5) * (paroForzoso / 100)).toFixed(2) : parseFloat(employee?.baseSalary.$numberDecimal * (paroForzoso / 100)).toFixed(2)

      const LPHtotal = parseFloat(employee?.baseSalary.$numberDecimal * (LPH / 100)).toFixed(2)

      const monthlyTotal = parseFloat(parseFloat(paroTotal) + parseFloat(LPHtotal) + parseFloat(retentionTotal)).toFixed(2)

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

            return item.employee._id === employee?._id && dayjs(dateString).isSameOrAfter(startDate) && dayjs(dateString).isSameOrBefore(endDate)
          })

          if (!hasPermit && isAbsent && !isWeekend(dateString)) {
            absentDays.push(dateString)
          }
          currentDate = currentDate.add(1, 'day')
        }
        return absentDays
      }

      const startDate = dayjs.utc().startOf('month').format('YYYY-MM-DD')
      const endDate = dayjs.utc().format('YYYY-MM-DD')

      const verifyAmmount = () => {
        const today = dayjs().date()

        const firstHalfAmmount = parseFloat(employee?.baseSalary.$numberDecimal / 2).toFixed(2)

        const secondHalfAmmount = (parseFloat(employee?.baseSalary.$numberDecimal / 2).toFixed(2) - parseFloat(monthlyTotal) - parseFloat(getAbsentDays(events, startDate, endDate).length * dailySalary))

        const fullAmmount = (parseFloat(employee?.baseSalary.$numberDecimal).toFixed(2) - parseFloat(monthlyTotal) - parseFloat(getAbsentDays(events, startDate, endDate).length * dailySalary))

        if (employee.payFrequency === 'Mensual' && (today >= 1 && today <= 15)) {
          return 0
        } else if (employee.payFrequency === 'Mensual' && (today > 15 && today <= 30)) {
          return fullAmmount
        } else if (employee.payFrequency === 'Quincenal' && (today >= 1 && today <= 15)) {
          return firstHalfAmmount
        } else if (employee.payFrequency === 'Quincenal' && (today > 15 && today <= 30)) {
          return secondHalfAmmount
        }
      }
      return {
        id: employee.idDocument,
        accNumber: employee.accountNumber,
        ammount: verifyAmmount()
      }
    })

    setTxtData(paymentData)

    console.log(txtData)
  }

  useEffect(() => {
    generateTxt()
  }, [isLoading])

  return (
    <>
      <div id='banner' className='w-full mt-[-4rem] bg-employeeBanner dark:bg-darkEmployeeBanner h-72 z-[-999] relative'>

        <div className='absolute w-full bottom-[-1rem] h-16 bg-slate-200 dark:bg-gray-950 ml-[-1rem] blur-md' />

      </div>
      <div className='mt-[-13rem] font-montserrat mb-8 px-4  '>

        <div className='relative flex items-center w-[91%] mx-auto [&>button]:absolute [&>button]:right-4'>
          <input
            type='text'
            className='placeholder-gray-900 dark:border-slate-800 dark:border-opacity-70 placeholder-opacity-30 w-full text-sm border border-gray-300 dark:text-slate-200 dark:bg-slate-700 dark:placeholder-slate-50 dark:placeholder-opacity-40 px-4 py-3 rounded-md outline-blue-600 pl-10'
            placeholder='Nombre, documento de identidad, departamento, cargo...'
            onChange={(e) => setFilter(e.target.value)}
          />
          <FaMagnifyingGlass className='w-[18px] h-[18px] absolute left-4 opacity-70' />

        </div>

        <div className='flex justify-between pr-14'>

          <h1 className='dark:text-slate-200 bg-slate-50 dark:bg-gray-700 w-fit py-2 px-4 rounded-md font-semibold text-lg mt-4 ml-4 md:ml-14'>{isLoading ? 'Registros encontrados:' : `${filteredEmployees.length} Registros Encontrados:`}</h1>

          {
            txtData &&
              <Button color='blue' className='[&>*]:gap-2 h-8 mt-4 [&>*]:items-center w-36'>
            <PDFDownloadLink className='flex gap-2' document={<PDFtxt data={txtData} />} fileName= {`txt`}> {/* eslint-disable-line */}
              <FaClipboardList />
              <span>Generar txt</span>
            </PDFDownloadLink>
              </Button>
          }

        </div>

        <div>

          {
        isLoading
          ? <Spinner className='mx-auto block' size='xl' />
          : <div className='[&>*]:mx-auto mt-4  w-full sm:grid grid-cols-responsive-sm md:grid-cols-responsive gap-4 '>
            {
             filteredEmployees.length > 0
               ? filteredEmployees?.reverse().map(item => (

                 <EmployeeCard
                   key={item._id}
                   avatar={item.picturePath}
                   firstName={item.firstName}
                   lastName={item.lastName}
                   idDocument={item.idDocument}
                   department={item.department}
                   position={item.position}
                   id={item._id}
                   salaryCalc
                 />
               ))
               : !filter && <h2>Oops! no hay ningún empleado registrado en este momento.</h2>

            }
          </div> //eslint-disable-line
        }
        </div>
      </div>
    </>
  )
}

export default SalaryScreen
