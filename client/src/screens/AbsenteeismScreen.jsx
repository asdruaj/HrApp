import { Calendar, dayjsLocalizer } from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import { Avatar, Button, Modal, Spinner } from 'flowbite-react'
import { useRef, useState } from 'react'
import { toast, Toaster } from 'sonner'
import { useDeleteAbsenteeismMutation, useGetAllAbsenteeismsQuery, useLazyGetAbsenteeismQuery, useSaveAbsenteeismMutation } from '../state/absenteeismApiSlice'
import { useGetEmployeesQuery, useLazyGetEmployeeeQuery } from '../state/employeesApiSlice'
import { FaCircleUser, FaHeartPulse, FaUmbrellaBeach } from 'react-icons/fa6'

dayjs.locale('es')

const customTheme = {
  content: {
    base: 'relative w-full h-full p-4 ',
    inner: 'relative rounded-lg bg-white shadow dark:bg-gray-800 flex flex-col max-h-full'
  },
  body: {
    base: 'flex-1 overflow-auto p-6'
  },
  footer: {
    base: 'flex items-center space-x-2 rounded-b border-gray-200 p-4 dark:border-gray-600 bg-white dark:bg-gray-800 mb-4'
  }
}

const AbsenteeismScreen = () => {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  const { data: employees, isLoading: isLoadingEmployees } = useGetEmployeesQuery()
  const [getEmployee, { isLoading: isEmployeeLoading, isFetching: isEmployeeFetching }] = useLazyGetEmployeeeQuery({ id: selectedEmployee })

  const { data, isLoading } = useGetAllAbsenteeismsQuery()
  const [getEvent, { isLoading: isEventLoading, isFetching: isEventFetching }] = useLazyGetAbsenteeismQuery({ id: selectedEvent })
  const [saveEvent, { isLoading: isSaveLoading }] = useSaveAbsenteeismMutation()
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteAbsenteeismMutation()

  const [isModalOpen, setIsModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
    employee: '',
    reason: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectEmployee = async (id) => {
    try {
      const data = await getEmployee(id).unwrap()
      setSelectedEmployee(data)
    } catch (err) {
      toast.error(err?.data?.message || err.error)
    }
    setFormData(prev => ({ ...prev, employee: id }))

    console.log(selectedEmployee)
  }

  const clearInputs = () => {
    setFormData(prev => ({
      ...prev,
      start: new Date().toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
      reason: ''
    }))

    if (selectedEvent) {
      setSelectedEvent(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (new Date(formData.start) > new Date(formData.end)) return toast.error('La fecha de inicio no puede ser inferior a la fecha de finalización', { position: 'bottom-right' })
      const res = await saveEvent(formData).unwrap()
      toast.success('Evento registrado correctamente', { position: 'bottom-right' })
      clearInputs()
      setIsModalOpen(false)
      setSelectedEmployee(null)
      console.log(res)
    } catch (err) {
      toast.error(err?.data?.message || err.error)
      console.log(err)
    }
  }

  const handleDeleteEvent = async (id) => {
    try {
      if (confirm('¿Seguro que desea eliminar este registro?')) { //eslint-disable-line
        await deleteEvent(id)
        clearInputs()
        setIsModalOpen(false)
        toast.success('Evento eliminado correctamente', { position: 'bottom-right' })
      }
    } catch (err) {
      toast.error(err?.data?.message || err.error)
      console.log(err)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedEvent(null)
    clearInputs()
  }

  const DateRefStart = useRef()
  const DateRefEnd = useRef()

  const handleEventClick = async (id) => {
    try {
      setIsModalOpen(true)
      setSelectedEvent(id)
      const data = await getEvent(id).unwrap()
      console.log(data)
      setFormData({
        start: new Date(data.start).toISOString().split('T')[0],
        end: new Date(data.end).toISOString().split('T')[0],
        employee: `${data.employee._id}`,
        reason: data.reason
      })
      setSelectedEmployee(data.employee)
    } catch (error) {
      console.log(error)
    }
  }

  const handleSlotClick = (start, end) => {
    if (selectedEmployee !== null) {
      setIsModalOpen(true)
      setFormData(prev => ({ ...prev, start: new Date(start).toISOString().split('T')[0], end: dayjs(end).subtract(1, 'day').toISOString().split('T')[0] }))
    } else {
      toast.warning('Debe seleccionar un empleado para registrar un nuevo absentismo', { position: 'bottom-right' })
    }
  }

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

  const events = data?.map(event => (
    {
      id: event._id,
      start: dayjs(event.start).add(4, 'hour').toDate(),
      end: dayjs(event.end).add(5, 'hour').toDate(),
      title: `${event.employee?.firstName} ${event.employee?.lastName}`,
      reason: event.reason
    }
  ))

  const components = {
    event: props => {
      return (
        <div className={`rounded-xl px-1  flex gap-1 place-items-center text-sm  ${props.event.reason === 'vacation' ? 'bg-green-500' : 'bg-red-700'}`}>
          {props.event.reason === 'vacation' ? <FaUmbrellaBeach className='flex-none' /> : <FaHeartPulse className='flex-none' />}
          <p className='truncate min-w-0 '>{props.title}</p>
        </div>
      )
    }
  }

  return (
    <>

      <div id='banner' className='w-full mt-[-4rem] bg-employeeBanner dark:bg-darkEmployeeBanner h-72 z-[-999] relative'>

        <div className='absolute w-full bottom-[-1rem] h-16 bg-slate-200 dark:bg-gray-950 ml-[-1rem] blur-md' />

      </div>

      <div className='md:flex h-[85%] gap-4 md:px-16 px-8 pt-6 mb-32 md:mb-0 -mt-56'>

        <div className='shadow-lg grow-0 bg-slate-50 dark:bg-slate-700 rounded-lg h-[40dvh] md:h-[81dvh] overflow-y-auto md:w-64 text-base dark:text-slate-100 no-scrollbar'>
          <h2 className='font-bold mb-2 sticky top-0 bg-slate-100 dark:bg-gray-800 z-[10] px-4 py-2 w-full'>Empleados:</h2>
          {
            isLoadingEmployees
              ? <Spinner />
              : employees?.map(employee => (
                <div
                  className={`flex mb-4 mx-2 border-slate-200 dark:border-slate-600 border-2 rounded-xl px-4 py-2 min-w-0 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${employee._id === selectedEmployee?._id ? 'bg-slate-200 dark:bg-slate-800' : ''}`}
                  key={employee._id}
                  onClick={() => handleSelectEmployee(employee._id)}
                >
                  <Avatar
                    alt='image'
                    size='md'
                    img={employee.picturePath ? `/employeesFiles/${employee.picturePath}` : FaCircleUser}
                    rounded
                    className='dark:text-slate-200 flex-none'
                  />
                  <div className='ml-4 flex flex-col [&_*]:hover:whitespace-normal'>
                    <p className='text-sm truncate min-w-0 w-36'>{`${employee.firstName} ${employee.lastName}`}</p>
                    <p className='text-xs truncate min-w-0 w-[98%] opacity-70'>{`${employee.department} - ${employee.position}`}</p>
                  </div>
                </div>
              ))
          }

        </div>

        <div className='grow mt-4 max-w-4xl md:mt-0 h-full shadow-xl  bg-slate-50 dark:bg-slate-700 dark:text-slate-50 px-4 py-6 rounded-xl  mx-auto [&_.rbc-today]:dark:bg-green-200 [&_.rbc-today]:dark:opacity-50 [&_.rbc-off-range]:dark:bg-slate-500 [&_.rbc-off-range-bg]:dark:bg-slate-500 [&_.rbc-off-range]:dark:opacity-50 [&_.rbc-off-range-bg]:dark:opacity-50 [&_:not(.rbc-active)]:dark:text-white [&_.rbc-toolbar-label]:font-bold [&_.rbc-toolbar-label]:my-4 [&_.rbc-toolbar-label]:uppercase [&_.rbc-show-more]:dark:bg-slate-700 [&_.rbc-show-more]:text-xs [&_.rbc-show-more]:-mt-0.5  [&_.rbc-event]:bg-transparent [&_.rbc-selected]:!bg-transparent'>

          {
            isLoading && <div className='w-full h-full grid place-items-center'><Spinner className='w-24 h-24' /></div>
              ? <div className='w-full h-full grid place-items-center'><Spinner className='w-24 h-24' /></div>
              : <Calendar
                  localizer={localizer}
                  selectable='false'
                  onSelectSlot={(slot) => handleSlotClick(slot.start, slot.end)}
                  onSelectEvent={(event) => handleEventClick(event.id)}
                  views={['month']}
                  messages={messages}
                  formats={{
                    monthHeaderFormat: date => {
                      return dayjs(date).format('dddd - DD/MM/YYYY')
                    }
                  }}
                  events={events}
                  popup
                  components={components}
                />
          }

        </div>

      </div>

      <Modal dismissible show={isModalOpen} onClose={handleCloseModal} theme={customTheme}>

        <Modal.Header>{selectedEvent ? 'Editar Absentismo' : 'Nuevo Absentismo'}</Modal.Header>
        <form onSubmit={handleSubmit} className='font-montserrat toptext-[#333]'>

          {
    (isEventLoading || isEventFetching || isEmployeeFetching || isEmployeeLoading)
      ? <Spinner className='w-16 my-24 h-16 block mx-auto' />
      : <Modal.Body className='bg-slate-50 dark:bg-slate-700'>

        <div className='dark:text-slate-100'>
          <Avatar
            alt='image'
            size='lg'
            img={selectedEmployee?.picturePath ? `/employeesFiles/${selectedEmployee?.picturePath}` : FaCircleUser}
            rounded
            className='dark:text-slate-200 flex-none'
          />
          <h2 className='text-center font-bold'>{selectedEmployee?.firstName} {selectedEmployee?.lastName}</h2>
          <h3 className='text-center'>{selectedEmployee?.department} - {selectedEmployee?.position}</h3>
          <h4 className='mt-4 text-sm'><span className='font-bold'>Días de Vacaciones Disponibles:</span> {selectedEmployee?.vacationDays}</h4>
          <h4 className='text-sm mb-4'><span className='font-bold'>Bajas por enfermedad disponibles:</span> {selectedEmployee?.sickDays}</h4>
        </div>

        <div className='row-start-6 col-start-1 row-span-1 col-span-5 md:mt-0 mt-1'>
          <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Desde:</label>
          <div className='relative flex items-center mb-2'>
            <input
              name='start'
              type='date'
              required
              className='w-full text-sm border border-gray-300 dark:border-slate-800 dark:border-opacity-70 dark:text-slate-200 dark:bg-slate-500 dark:placeholder-slate-50 dark:placeholder-opacity-40 py-3 rounded-md outline-blue-600'
              onClick={() => DateRefStart.current.showPicker()}
              ref={DateRefStart}
              onChange={handleInputChange}
              value={formData.start}
            />
          </div>
        </div>

        <div className='row-start-6 col-start-1 row-span-1 col-span-5 md:mt-0 mt-1'>
          <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Hasta:</label>
          <div className='relative flex items-center mb-2'>
            <input
              name='end'
              type='date'
              required
              className='w-full text-sm border border-gray-300 dark:border-slate-800 dark:border-opacity-70 dark:text-slate-200 dark:bg-slate-500 dark:placeholder-slate-50 dark:placeholder-opacity-40 py-3 rounded-md outline-blue-600'
              onClick={() => DateRefEnd.current.showPicker()}
              ref={DateRefEnd}
              onChange={handleInputChange}
              value={formData.end}
            />
          </div>
        </div>

        <div>
          <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Razón:</label>
          <select
            name='reason'
            type='text'
            required
            className='w-full text-sm border border-gray-300 dark:border-slate-800 dark:border-opacity-70 dark:text-slate-200 dark:bg-slate-500 dark:placeholder-slate-50 dark:placeholder-opacity-40 px-4 py-3 rounded-md outline-blue-600'
            onChange={handleInputChange}
            value={formData.reason}
          >
            <option className='hidden' value=''>Seleccione una opción...</option>
            <option value='vacation'>Vacaciones</option>
            <option value='sickness'>Baja por enfermedad</option>
            <option value='motherhood'>Maternidad</option>
            <option value='fatherhood'>Paternidad</option>
            <option value='family loss'>Muerte de familiar directo (3 días min)</option>
          </select>
        </div>

    </Modal.Body> //eslint-disable-line
    }
          <Modal.Footer>
            <div className='flex w-full justify-center gap-4'>
              {
                !selectedEvent && <Button type='submit' color='blue' className='w-32' isProcessing={isSaveLoading ? 'true' : false}>Añadir</Button>
              }

              {
                selectedEvent && <Button onClick={() => handleDeleteEvent(selectedEvent)} type='button' color='failure' className='w-32' isProcessing={isDeleting ? 'true' : false}>Eliminar</Button>
              }

            </div>
          </Modal.Footer>
        </form>
        <Toaster richColors position='bottom-right' />
      </Modal>

    </>
  )
}

export default AbsenteeismScreen
