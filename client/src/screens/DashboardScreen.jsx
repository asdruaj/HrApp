import { useGetEmployeesQuery } from '../state/employeesApiSlice'
import { FaHelmetSafety } from 'react-icons/fa6'
import { Spinner, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from 'flowbite-react'

import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useGetAllTrainingsQuery } from '../state/trainingApiSlice'
import { useGetAllEventsQuery } from '../state/eventsApiSlice'
import dayjs from 'dayjs'

const DashboardScreen = () => {
  const { data: employees, isLoading } = useGetEmployeesQuery()

  const { data: courses, isLoading: isLoadingCourses } = useGetAllTrainingsQuery()
  const { data: events, isLoading: isLoadingEvents } = useGetAllEventsQuery()

  const eventsComing = events?.filter(event => {
    return dayjs(event.start).diff(dayjs()) > 0
  })

  const coursesComing = courses?.filter(event => {
    return dayjs(event.startDate).diff(dayjs()) > 0
  })

  const navigate = useNavigate()

  const { rates, error, isBcvLoading } = useSelector(state => state.bcv)

  return (
    <div className='mt-6 px-8 font-montserrat'>

      <div id='cards-container' className='flex gap-8 justify-center flex-wrap'>

        <div id='card' className='flex gap-4 items-center bg-slate-50  dark:bg-slate-700 dark:border-2 border-slate-600 dark:text-slate-50 min-w-fit min-h-20 w-72 px-4 py-2 rounded-md shadow-lg'>
          <img src='/bcvLogo.svg' alt='' className='w-12 h-12 dark:invert' />
          <div className='w-full'>
            <h2>Dólar hoy:</h2>
            <p className='text-center  font-bold font-mono '>{isBcvLoading ? <Spinner /> : `${rates?._dolar} BsS.` || error}

            </p>
          </div>
        </div>

        <div
          id='card'
          className='flex gap-4 text-nowrap items-center  bg-slate-50 hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer min-h-20 min-w-fit w-72 px-4 py-2 rounded-md shadow-lg  dark:bg-slate-700 dark:border-2 border-slate-600 dark:text-slate-50'
          onClick={() => navigate('/employees')}
        >

          <FaHelmetSafety className='flex-none h-10 w-10' />
          <div className='w-full'>
            <h2>N° Empleados Registrados:</h2>
            <p className='text-center font-mono font-bold '>{isLoading ? <Spinner /> : employees?.length || '0'}</p>
          </div>
        </div>

      </div>

      <div id='tables-container' className='flex gap-8 justify-center flex-wrap mt-8'>

        <div id='table' className='bg-slate-50 dark:bg-slate-700 dark:text-slate-50 rounded-md border-slate-50 border px-4 py-2 max-h-96 md:min-w-[600px] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer' onClick={() => navigate('/calendar/events')}>
          <h3 className='font-bold mb-4'>Próximos Eventos</h3>
          {eventsComing?.length <= 0 && <p>No hay datos para mostrar</p>}
          {
          isLoadingEvents
            ? <Spinner />
            : eventsComing?.length > 0 && <Table>
              <TableHead className='dark:bg-gray-800'>
                <TableHeadCell className='dark:bg-gray-800'>Título</TableHeadCell>
                <TableHeadCell className='dark:bg-gray-800'>Fecha de Inicio</TableHeadCell>
                <TableHeadCell className='dark:bg-gray-800'>Fecha de Finalización</TableHeadCell>
              </TableHead>
              <TableBody>
                {
                  eventsComing?.map(event => (
                    <TableRow key={event._id}>
                      <TableCell className='font-semibold'>{event.title}</TableCell>
                      <TableCell className='text-center'>{new Date(event.start).toLocaleDateString('es-VE', { timeZone: 'UTC' })}</TableCell>
                      <TableCell className='text-center'>{new Date(event.end).toLocaleDateString('es-VE', { timeZone: 'UTC' })}</TableCell>
                    </TableRow>
                  ))
                }
              </TableBody>
              </Table> //eslint-disable-line
          }

        </div>

        <div id='table' className='bg-slate-50 dark:bg-slate-700 dark:text-slate-50 rounded-md border-slate-50 border px-4 py-2 max-h-96 md:min-w-[600px] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer' onClick={() => navigate('/training')}>
          <h3 className='font-bold mb-4'>Próximos Cursos</h3>
          {coursesComing?.length <= 0 && <p>No hay datos para mostrar</p>}
          {
          isLoadingCourses
            ? <Spinner />
            : coursesComing?.length > 0 && <Table>
              <TableHead className='dark:bg-gray-800'>
                <TableHeadCell className='dark:bg-gray-800'>Título</TableHeadCell>
                <TableHeadCell className='dark:bg-gray-800'>Fecha de Inicio</TableHeadCell>
                <TableHeadCell className='dark:bg-gray-800'>Fecha de Finalización</TableHeadCell>
              </TableHead>
              <TableBody>
                {
                  coursesComing?.map(course => (
                    <TableRow key={course._id}>
                      <TableCell className='font-semibold'>{course.courseName}</TableCell>
                      <TableCell className='text-center'>{new Date(course.startDate).toLocaleDateString('es-VE', { timeZone: 'UTC' })}</TableCell>
                      <TableCell className='text-center'>{new Date(course.endDate).toLocaleDateString('es-VE', { timeZone: 'UTC' })}</TableCell>
                    </TableRow>
                  ))
                }
              </TableBody>
              </Table> //eslint-disable-line
          }

        </div>

      </div>

    </div>

  )
}

export default DashboardScreen
