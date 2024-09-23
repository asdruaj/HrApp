import React, { useEffect, useState } from 'react'
import { useGetEmployeeeQuery } from '../state/employeesApiSlice'
import { useNavigate, useParams } from 'react-router-dom'
import { Avatar, Spinner, Table, TableBody, TableRow } from 'flowbite-react'
import { FaCircleUser, FaDollarSign, FaPencil } from 'react-icons/fa6'
import FileDownload from '../components/FileDownload'
import { useSelector } from 'react-redux'
import DataTable from 'react-data-table-component'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Calendar, dayjsLocalizer } from 'react-big-calendar'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import { toast } from 'sonner'

dayjs.locale('es')

const columns = [
  {
    name: 'Título',
    selector: row => row.courseName,
    sortable: true,
    wrap: true,
    format: row => <h2 className='font-semibold'>{row.courseName}</h2>
  },

  {
    name: 'Instructor',
    selector: row => row.instructor,
    sortable: true,
    wrap: true

  },
  {
    name: 'Desde:',
    selector: row => row.startDate,
    format: row => new Date(row.startDate).toLocaleDateString('es-VE', { timeZone: 'UTC' }),
    sortable: true
  },
  {
    name: 'Hasta:',
    selector: row => row.endDate,
    format: row => new Date(row.endDate).toLocaleDateString('es-VE', { timeZone: 'UTC' }),
    sortable: true
  }

]

const EmployeeScreen = () => {
  const { id } = useParams()
  const { data: employee, isLoading } = useGetEmployeeeQuery(id)
  const { rates } = useSelector(state => state.bcv)
  const navigate = useNavigate()
  const [events, setEvents] = useState([])

  const localizer = dayjsLocalizer(dayjs)
  const messages = {
    allDay: 'Todo el día',
    previous: 'Anterior',
    next: 'Siguiente',
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    agenda: 'Agenda',
    date: 'Fecha',
    time: 'Hora',
    event: 'Evento',
    showMore: (count) => '+' + count + ' más'
  }

  useEffect(() => {
    const fetchEvents = async () => {
      const response = await fetch('/api/mocks')
      const mockData = await response.json()
      const employeeData = mockData.find(person => person.idDocument === employee?.idDocument)
      if (employeeData) {
        const newEvents = employeeData.attendance.map(day => {
          const entryTime = new Date(day.entry).toLocaleTimeString('es-VE')
          const exitTime = new Date(day.exit).toLocaleTimeString('es-VE')
          return {
            title: `Entrada: ${entryTime}, Salida: ${exitTime}`,
            start: new Date(day.entry),
            end: new Date(day.exit)
          }
        })
        setEvents(newEvents)
      }
    }

    fetchEvents()
  }, [employee])

  const components = {
    event: props => {
      return (
        <div className='rounded-xl px-1  flex gap-1 place-items-center text-sm bg-green-600'>

          <p className='truncate min-w-0 '>{props.title}</p>
        </div>
      )
    }
  }

  return (
    <>
      {
        isLoading
          ? <div className='grid h-screen place-items-center'>
            <Spinner size='' className='h-20 w-20' />
            </div> //eslint-disable-line

          : <>
            <div id='banner' className='w-full mt-[-4rem] bg-employeeBanner dark:bg-darkEmployeeBanner h-72 z-[-999] relative'>

              <div className='absolute w-full bottom-[-1rem] h-16 bg-slate-200 dark:bg-gray-950 ml-[-1rem] blur-md' />

            </div>

            <div id='info-card' className='w-[90%] md:w-[50%] bg-slate-100 dark:bg-slate-800 shadow-2xl rounded-xl mb-6 mx-auto mt-[-11rem] pb-4'>
              <div className='relative'>
                <Avatar
                  alt='image'
                  img={employee.picturePath ? `/employeesFiles/${employee.picturePath}` : FaCircleUser}
                  rounded
                  className='dark:text-slate-100 [&_img]:shadow-2xl [&_img]:border-2 [&_img]:border-slate-100 [&_img]:dark:border-slate-700 [&_svg]:bg-slate-100 [&_svg]:dark:bg-gray-950 [&_*]:!w-24 [&_*]:!h-24 [&_*]:md:!w-32 [&_*]:md:!h-32 absolute top-[-3rem]  w-full'
                />
                <button onClick={() => navigate(`/employees/edit/${id}`)} className='bg-blue-600 px-2 py-1 rounded-full w-fit h-fit absolute md:right-4 md:top-4 right-2 top-2 flex gap-2 hover:bg-blue-800 transition-all'>
                  <FaPencil className='mt-0.5 text-slate-100' />
                  <span className='text-slate-100 text-sm hidden md:block'>Editar</span>
                </button>

              </div>

              <div />
              <div className='mx-4 mt-4 mb-4 pt-16 md:pt-24'>

                <div className='mx-auto mb-4 flex-col flex font-montserrat h-fit align-middle dark:text-slate-200 '>
                  <span className='mx-auto text-xl md:text-2xl font-semibold text-center'>{employee.firstName} {employee.lastName}</span>

                </div>

                <h2 className='text-lg font-semibold mb-4 dark:text-slate-200'>Datos Personales</h2>

                <div className='ml-2 md:grid grid-cols-2 text-base'>
                  <label className='font-medium text-gray-950 dark:text-slate-300'>Documento de Identidad</label>
                  <span className='block md:text-end dark:text-slate-200'>{employee.idDocument}</span>
                </div>
                <hr className='h-px border-0 dark:bg-gray-700 my-1 bg-slate-300' />

                <div className='ml-2 md:grid grid-cols-2 text-base'>
                  <label className='font-medium text-gray-950 dark:text-slate-300'>Número telefónico</label>
                  <span className='block md:text-end dark:text-slate-200 '>{employee.phoneNumber}</span>
                </div>
                <hr className='h-px border-0 dark:bg-gray-700 my-1 bg-slate-300' />
                <div className='ml-2 md:grid grid-cols-2 text-base'>
                  <label className='font-medium text-gray-950 dark:text-slate-300'>Correo Electrónico</label>
                  <span className='block md:text-end dark:text-slate-200 break-words'>{employee.email}</span>
                </div>
                <hr className='h-px border-0 dark:bg-gray-700 my-1 bg-slate-300' />
                <div className='ml-2 md:grid grid-cols-2 text-base'>
                  <label className='font-medium text-gray-950 dark:text-slate-300 '>Dirección</label>
                  <span className='block md:text-end dark:text-slate-200 '>{employee.address}</span>
                </div>
                <hr className='h-px border-0 dark:bg-gray-700 my-1 bg-slate-300' />

                <div className='ml-2 text-base overflow-x-auto [&>div]:mt-2'>
                  <label className='font-medium text-gray-950 dark:text-slate-300'>Dependientes</label>
                  {
                    employee.dependents.length > 0 &&
                      <Table>
                        <Table.Head className=''>
                          <Table.HeadCell>Parentesco</Table.HeadCell>
                          <Table.HeadCell>Nombre</Table.HeadCell>
                          <Table.HeadCell>ID</Table.HeadCell>
                          <Table.HeadCell>Fecha de Nacimiento</Table.HeadCell>
                        </Table.Head>
                        <TableBody>
                          {
                            employee?.dependents?.map(item => (
                              <TableRow key={item.idDocument}>
                                <Table.Cell>{item.relationship}</Table.Cell>
                                <Table.Cell>{item.name}</Table.Cell>
                                <Table.Cell>{item.idDocument}</Table.Cell>
                                <Table.Cell>{new Date(item.birthday).toLocaleDateString('es-VE', { timeZone: 'UTC' })}</Table.Cell>
                              </TableRow>
                            ))
                          }
                        </TableBody>
                      </Table>
                  }

                </div>
                <hr className='h-px border-0 dark:bg-gray-700 my-1 bg-slate-300' />

              </div>

            </div>

            <div id='info-card' className='w-[90%] md:w-[50%] bg-slate-100 dark:bg-slate-800 shadow-2xl rounded-xl mb-6 mx-auto pt-2 pb-4'>

              <div />

              <div className='mx-4 mt-4 mb-4'>

                <h2 className='text-lg font-semibold mb-4 dark:text-slate-200'>Datos Laborales</h2>

                <div className='ml-2 md:grid grid-cols-2 text-base'>
                  <label className='font-medium text-gray-950 dark:text-slate-300'>Fecha de Contratación</label>
                  <span className='block md:text-end dark:text-slate-200 '>{new Date(employee.hiringDate).toLocaleDateString('es-VE', { timeZone: 'UTC' })}</span>
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
                  <label className='font-medium text-gray-950 dark:text-slate-300'>Salario Base</label>
                  <div>
                    <span className='block md:text-end dark:text-slate-200 '>
                      {(parseFloat(employee.baseSalary.$numberDecimal * 100) / 100).toFixed(2)}
                      <span className='font-bold opacity-50 ml-2 select-none'>BsS.</span>
                      <br />
                      <span className='italic opacity-50'>Equivalente a: </span>
                      <br />
                      {rates?._dolar && <span>{`${parseFloat((employee.baseSalary.$numberDecimal / rates?._dolar * 100) / 100).toFixed(2)}`} <FaDollarSign className='inline ml-1 mb-0.5 opacity-50' /> </span>}
                    </span>

                  </div>
                </div>
                <hr className='h-px border-0 dark:bg-gray-700 my-1 bg-slate-300' />

                <div className='ml-2 md:grid grid-cols-2 text-base'>
                  <label className='font-medium text-gray-950 dark:text-slate-300'>Número de Cuenta</label>
                  <div>
                    <span className='block md:text-end dark:text-slate-200 '>
                      {employee.accountNumber}
                    </span>

                  </div>
                </div>
                <hr className='h-px border-0 dark:bg-gray-700 my-1 bg-slate-300' />

                <div className='ml-2 md:grid grid-cols-2 text-base'>
                  <label className='font-medium text-gray-950 dark:text-slate-300'>Frecuencia de Pagos</label>
                  <span className='block md:text-end dark:text-slate-200 '>{employee.payFrequency}</span>
                </div>
                <hr className='h-px border-0 dark:bg-gray-700 my-1 bg-slate-300' />

                <div className='ml-2 md:grid grid-cols-2 text-base'>
                  <label className='font-medium text-gray-950 dark:text-slate-300'>Bajas por Enfermedad Disponibles (días)</label>
                  <span className='block md:text-end dark:text-slate-200 '>{employee.sickDays}</span>
                </div>
                <hr className='h-px border-0 dark:bg-gray-700 my-1 bg-slate-300' />

                <div className='ml-2 md:grid grid-cols-2 text-base'>
                  <label className='font-medium text-gray-950 dark:text-slate-300'>Días de Vacaciones Base</label>
                  <span className='block md:text-end dark:text-slate-200 '>{employee.vacationDaysBase}</span>
                </div>
                <hr className='h-px border-0 dark:bg-gray-700 my-1 bg-slate-300' />

                <div className='ml-2 md:grid grid-cols-2 text-base'>
                  <label className='font-medium text-gray-950 dark:text-slate-300'>Días de Vacaciones Disponibles</label>
                  <span className='block md:text-end dark:text-slate-200 '>{employee.vacationDays}</span>
                </div>
                <hr className='h-px border-0 dark:bg-gray-700 my-1 bg-slate-300' />

                <div className='ml-2 md:grid grid-cols-2 text-base'>
                  <label className='font-medium text-gray-950 dark:text-slate-300'>Días Correspondientes a Pago de Utilidades</label>
                  <span className='block md:text-end dark:text-slate-200 '>{employee.utilsDays}</span>
                </div>
                <hr className='h-px border-0 dark:bg-gray-700 my-1 bg-slate-300' />

              </div>

            </div>

            <div id='info-card' className='w-[90%] md:w-[50%] bg-slate-100 dark:bg-slate-800 shadow-2xl rounded-xl mb-6 mx-auto pt-2 pb-4 '>

              <h2 className='text-lg font-semibold mb-4 dark:text-slate-200 mt-4 mx-4'>Documentos</h2>

              <div id='grid' className='px-10 pb-2 grid gap-12 grid-cols-[repeat(auto-fit,minmax(100px,1fr))] place-items-center'>
                {
                    employee?.documents?.map((document, i) => (
                      <FileDownload key={i} file={document} />
                    ))
                  }
              </div>
            </div>

            <div id='info-card' className='w-[90%] md:w-[50%] bg-slate-100 dark:bg-slate-800 shadow-2xl rounded-xl mb-6 mx-auto pt-2 pb-4 '>

              <h2 className='text-lg font-semibold mb-4 dark:text-slate-200 mt-4 mx-4'>Cursos Proporcionados por la Empresa</h2>

              {employee.courses &&
                <div className='mt-4 font-montserrat  w-[90%] md:w-[90%] mx-auto overflow-x-auto mb-4 rounded-t-2xl shadow-lg [&_.rdt\_Pagination]:dark:bg-gray-800 [&_.rdt\_Pagination]:dark:text-slate-50 [&_.rdt\_Pagination]:rounded-b-2xl [&_.rdt\_Pagination_div>svg]:hidden [&_.rdt\_Pagination>div>button]:border-yellow-50'>
                  <DataTable
                    className='[&_.rdt\_TableHeadRow]:text-base [&_.rdt\_TableHeadRow]:font-semibold [&_.rdt\_TableHeadRow]:dark:text-slate-50 [&_.rdt\_TableHead]:rounded-2xl [&_.rdt\_TableHeadRow]:dark:bg-gray-800 [&_.rdt\_TableRow]:dark:bg-slate-700 [&_.rdt\_TableRow]:dark:text-slate-50  '
                    columns={columns}
                    data={employee?.courses}
                    pagination
                    keyField={employee?.courses._id}
                    highlightOnHover
                    persistTableHead
                    striped
                    paginationComponentOptions={{
                      rowsPerPageText: 'Filas por página',
                      rangeSeparatorText: 'de',
                      selectAllRowsItem: true,
                      selectAllRowsItemText: 'Todos'
                    }}
                    noDataComponent={<div className='bg-slate-50 dark:bg-slate-700 dark:text-slate-50 w-full h-24 font-semibold text-center pt-7 text-2xl'>No hay datos para mostrar</div>}
                  />
                </div>}
            </div>

            <div id='info-card' className='w-[90%] md:w-[50%] bg-slate-100 dark:bg-slate-800 shadow-2xl rounded-xl mb-16 mx-auto pt-2 pb-4 h-[500px]'>

              <h2 className='text-lg font-semibold mb-4 dark:text-slate-200 mt-4 mx-4'>Registro de Asistencias</h2>
              <div className='grow mt-4 max-w-4xl md:mt-0 h-full shadow-xl  bg-slate-50 dark:bg-slate-700 dark:text-slate-50 px-4 py-6 rounded-xl  mx-auto [&_.rbc-today]:dark:bg-green-200 [&_.rbc-today]:dark:opacity-50 [&_.rbc-off-range]:dark:bg-slate-500 [&_.rbc-off-range-bg]:dark:bg-slate-500 [&_.rbc-off-range]:dark:opacity-50 [&_.rbc-off-range-bg]:dark:opacity-50 [&_:not(.rbc-active)]:dark:text-white [&_.rbc-toolbar-label]:font-bold [&_.rbc-toolbar-label]:my-4 [&_.rbc-toolbar-label]:uppercase [&_.rbc-show-more]:dark:bg-slate-700 [&_.rbc-show-more]:text-xs [&_.rbc-show-more]:-mt-1 [&_.rbc-show-more]:!bg-transparent  [&_.rbc-event]:bg-transparent [&_.rbc-selected]:!bg-transparent'>

                <Calendar
                  localizer={localizer}
                  views={['month']}
                  messages={messages}
                  formats={{
                    monthHeaderFormat: date => {
                      return dayjs(date).format('dddd - DD/MM/YYYY')
                    }
                  }}
                  events={events}
                  popup
                  onSelectEvent={(event) => toast.info(`Entrada: ${new Date(event.start).toLocaleTimeString('es-VE')} |  Salida:  ${new Date(event.end).toLocaleTimeString('es-VE')}`, { position: 'bottom-right' })}
                  components={components}

                />
              </div>
            </div>
            </> //eslint-disable-line
      }

    </>

  )
}

export default EmployeeScreen
