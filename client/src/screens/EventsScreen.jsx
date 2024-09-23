import { Calendar, dayjsLocalizer } from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import { useDeleteEventMutation, useEditEventMutation, useGetAllEventsQuery, useLazyGetEventQuery, useSaveEventMutation } from '../state/eventsApiSlice'
import { Button, Modal, Spinner } from 'flowbite-react'
import { useRef, useState } from 'react'
import FormInput from '../components/FormInput'
import { toast, Toaster } from 'sonner'

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

const EventsScreen = () => {
  const [selectedId, setSelectedId] = useState(null)

  const { data, isLoading } = useGetAllEventsQuery()
  const [getEvent, { isLoading: isEventLoading, isFetching: isEventFetching }] = useLazyGetEventQuery({ id: selectedId })
  const [saveEvent, { isLoading: isSaveLoading }] = useSaveEventMutation()
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation()
  const [updateEvent, { isLoading: isUpdating }] = useEditEventMutation()

  const [isModalOpen, setIsModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
    title: '',
    description: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const clearInputs = () => {
    setFormData({
      start: new Date().toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
      title: '',
      description: ''
    })

    if (selectedId) {
      setSelectedId(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (selectedId) {
        if (new Date(formData.start) > new Date(formData.end)) return toast.error('La fecha de inicio no puede ser inferior a la fecha de finalización', { position: 'bottom-right' })
        const res = await updateEvent({ data: formData, id: selectedId }).unwrap()
        toast.success('Evento actualizado correctamente', { position: 'bottom-right' })
        clearInputs()
        setIsModalOpen(false)
        console.log(res)
      } else {
        if (new Date(formData.start) > new Date(formData.end)) return toast.error('La fecha de inicio no puede ser inferior a la fecha de finalización', { position: 'bottom-right' })
        const res = await saveEvent(formData).unwrap()
        toast.success('Evento registrado correctamente', { position: 'bottom-right' })
        clearInputs()
        setIsModalOpen(false)
        console.log(res)
      }
    } catch (err) {
      toast.error(err?.data?.message || err.error)
      console.log(err)
    }
  }

  const handleDeleteEvent = async (id) => {
    try {
      await deleteEvent(id)
      clearInputs()
      setIsModalOpen(false)
      toast.success('Evento eliminado correctamente', { position: 'bottom-right' })
    } catch (err) {
      toast.error(err?.data?.message || err.error)
      console.log(err)
    }
  }

  const handleEventClick = async (id) => {
    try {
      setIsModalOpen(true)
      setSelectedId(id)
      const data = await getEvent(id).unwrap()
      setFormData({
        start: new Date(data.start).toISOString().split('T')[0],
        end: new Date(data.end).toISOString().split('T')[0],
        title: data.title,
        description: data.description
      })
      console.log(formData)
    } catch (error) {
      console.log(error)
    }
  }

  const handleSlotClick = (date) => {
    setIsModalOpen(true)
    setFormData(prev => ({ ...prev, start: new Date(date).toISOString().split('T')[0], end: new Date(date).toISOString().split('T')[0] }))
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedId(null)
    clearInputs()
  }

  const DateRefStart = useRef()
  const DateRefEnd = useRef()

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
      title: event.title
    }
  ))

  const components = {
    event: props => {
      return (
        <div className='rounded-xl px-1  flex gap-1 place-items-center text-sm bg-blue-600'>

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
        <div className='shadow-lg grow-0 bg-slate-50 dark:bg-slate-700 py-2 px-4 rounded-lg h-fit md:w-64  text-base dark:text-slate-100 '><span className='text-lg text-slate-700 opacity-70 dark:text-slate-50 font-bold'>¿Cómo utilizar el calendario? <br /> </span><span className='opacity-70'>Para asignar un evento, haga click en cualquier celda disponible y llene el formulario.</span></div>

        <div className='grow mt-4 max-w-4xl md:mt-0 h-full shadow-xl  bg-slate-50 dark:bg-slate-700 dark:text-slate-50 px-4 py-6 rounded-xl  mx-auto [&_.rbc-today]:dark:bg-green-200 [&_.rbc-today]:dark:opacity-50 [&_.rbc-off-range]:dark:bg-slate-500 [&_.rbc-off-range-bg]:dark:bg-slate-500 [&_.rbc-off-range]:dark:opacity-50 [&_.rbc-off-range-bg]:dark:opacity-50 [&_:not(.rbc-active)]:dark:text-white [&_.rbc-toolbar-label]:font-bold [&_.rbc-toolbar-label]:my-4 [&_.rbc-toolbar-label]:uppercase [&_.rbc-show-more]:dark:bg-slate-700 [&_.rbc-show-more]:text-xs [&_.rbc-show-more]:-mt-1 [&_.rbc-show-more]:!bg-transparent  [&_.rbc-event]:bg-transparent [&_.rbc-selected]:!bg-transparent'>

          {
            isLoading && <div className='w-full h-full grid place-items-center'><Spinner className='w-24 h-24' /></div>
              ? <div className='w-full h-full grid place-items-center'><Spinner className='w-24 h-24' /></div>
              : <Calendar
                  localizer={localizer}
                  selectable='true'
                  onSelectSlot={(slot) => handleSlotClick(slot.start)}
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

        <Modal.Header>{selectedId ? 'Editar Evento' : 'Nuevo Evento'}</Modal.Header>
        <form onSubmit={handleSubmit} className='font-montserrat toptext-[#333]'>

          {
    (isEventLoading || isEventFetching)
      ? <Spinner className='w-16 my-24 h-16 block mx-auto' />
      : <Modal.Body className='bg-slate-50 dark:bg-slate-700'>

        <div>
          <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Título</label>
          <FormInput handleInputChange={handleInputChange} value={formData.title} name='title' placeholder='' className='mb-4' />
        </div>

        <div>
          <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Descripción</label>
          <div className='relative flex items-center mb-4'>
            <textarea
              name='description'
              className='uppercase placeholder-gray-900 placeholder-opacity-30 dark:border-slate-800 dark:border-opacity-70 w-full text-sm border border-gray-300 dark:text-slate-200 dark:bg-slate-500 dark:placeholder-slate-50 dark:placeholder-opacity-40 px-4 py-3 rounded-md outline-blue-600 resize-none'
              rows='10'
              placeholder=''
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>
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

    </Modal.Body> //eslint-disable-line
    }
          <Modal.Footer>
            <div className='flex w-full justify-center gap-4'>
              <Button type='submit' color='blue' className='w-32' isProcessing={isSaveLoading || isUpdating ? 'true' : false}>{selectedId ? 'Editar' : 'Añadir'}</Button>
              {
                selectedId && <Button onClick={() => handleDeleteEvent(selectedId)} type='button' color='failure' className='w-32' isProcessing={isDeleting ? 'true' : false}>Eliminar</Button>
              }

            </div>
          </Modal.Footer>
        </form>
        <Toaster richColors position='bottom-right' />
      </Modal>

    </>
  )
}

export default EventsScreen
