import { Avatar, Button, Card, Modal, Spinner } from 'flowbite-react'
import React, { useEffect, useRef, useState } from 'react'
import { FaBuildingUser, FaCircle, FaCircleUser, FaMagnifyingGlass, FaPeopleGroup, FaPlus, FaTrashCan, FaUser, FaUserGroup } from 'react-icons/fa6'
import FormInput from '../components/FormInput'
import DepartmentInput from '../components/DepartmentInput'
import { toast, Toaster } from 'sonner'

import DataTable from 'react-data-table-component'
import { useDeleteTrainingMutation, useEditTrainingMutation, useGetAllTrainingsQuery, useLazyGetTrainingQuery, useSaveTrainingMutation } from '../state/trainingApiSlice'
import { useGetEmployeesQuery, useSaveTrainingToUserMutation } from '../state/employeesApiSlice'
import dayjs from 'dayjs'
import 'dayjs/locale/es'

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

const TrainingScreen = () => {
  const [selectedId, setSelectedId] = useState(null)
  const { data, isLoading, isFetching } = useGetAllTrainingsQuery()
  const { data: employees } = useGetEmployeesQuery()
  const [getTraining, { isLoading: isTrainingLoading, isFetching: isTrainingFetching }] = useLazyGetTrainingQuery({ id: selectedId })
  const [saveTraining, { isLoading: isSaveLoading }] = useSaveTrainingMutation()
  const [saveTrainingToUser] = useSaveTrainingToUserMutation()
  const [deleteTraining, { isLoading: isDeleting }] = useDeleteTrainingMutation()
  const [updateTraining, { isLoading: isUpdating }] = useEditTrainingMutation()

  const [filter, setFilter] = useState('')

  const filteredData = data?.filter((item) =>
    item?.courseName?.toLowerCase().includes(filter?.toLowerCase()) ||
    item?.instructor?.toLowerCase().includes(filter?.toLowerCase()) ||
    item?.status?.toLowerCase().includes(filter?.toLowerCase()) ||
    item?.location?.toLowerCase().includes(filter?.toLowerCase()) ||
    item?.status?.toLowerCase().includes(filter?.toLowerCase())
  )

  const handleFilterInput = (e) => {
    const { value } = e.target
    setFilter(value)
  }

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
    },

    {
      name: 'Estado',
      selector: row => row.status,
      cell: (row) => {
        if (row.status === 'Pendiente') return <span className='flex gap-2 h-full items-center '><FaCircle className='text-amber-600 opacity-70 w-2 h-2' />Pendiente</span>
        if (row.status === 'Finalizado') return <span className='flex gap-2 h-full items-center '><FaCircle className='text-green-600 opacity-70 w-2 h-2' />Finalizado</span>
        if (row.status === 'Cancelado') return <span className='flex gap-2 h-full items-center'><FaCircle className='text-red-600 opacity-70 w-2 h-2' />Cancelado</span>
      }
    },
    {
      name: 'Ubicación',
      selector: row => row.location,
      sortable: true,
      wrap: true

    },
    {
      name: 'Capacidad',
      selector: row => row.capacity,
      center: true,
      width: '5rem'
    },
    {
      name: 'Asistencia',
      selector: row => row._id,
      cell: (row) => {
        return <button className='bg-blue-500 hover:bg-blue-700 transition-colors p-1 rounded-full' onClick={() => handleOpenAssistModal(row._id)}><FaPeopleGroup className='h-5 w-5' /></button>
      },
      button: 'true'
    },

    {
      name: '',
      cell: row => <button disabled={isDeleting} onClick={() => deleteTraining(row._id)} className='hover:text-red-800 mr-2 transition-all'>{isDeleting ? <Spinner /> : <FaTrashCan className='w-4 h-4' id={row._id} />}</button>,
      button: 'true',
      width: '3rem'
    }
  ]

  const [formData, setFormData] = useState({
    courseName: '',
    instructor: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    departments: [],
    status: 'Pendiente',
    location: '',
    capacity: ''
  })

  const clearInputs = () => {
    setFormData({
      courseName: '',
      instructor: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      departments: [],
      status: 'Pendiente',
      location: '',
      capacity: ''
    })

    if (selectedId) {
      setSelectedId(null)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prevData) => {
      if (type === 'checkbox') {
        const departments = prevData.departments || []
        const updatedDepartments = checked
          ? [...departments, value]
          : departments.filter((dept) => dept !== value)
        return { ...prevData, departments: updatedDepartments }
      } else {
        return { ...prevData, [name]: value }
      }
    })
    console.log(formData)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (selectedId) {
        const res = await updateTraining({ data: formData, id: selectedId }).unwrap()
        toast.success('Curso actualizado correctamente', { position: 'bottom-right' })
        clearInputs()
        setIsModalOpen(false)
        console.log(res)
      } else {
        const res = await saveTraining(formData).unwrap()
        toast.success('Curso registrado correctamente', { position: 'bottom-right' })
        clearInputs()
        setIsModalOpen(false)
        console.log(res)
      }
    } catch (err) {
      toast.error(err?.data?.message || err.error)
      console.log(err)
    }
  }

  const handleAttendanceSubmit = async (e) => {
    e.preventDefault()

    try {
      await updateTraining({ data: { attendance: employeeIds }, id: selectedId }).unwrap()
      const res = await saveTrainingToUser({ data: { userIds: employeeIds }, id: selectedId }).unwrap()
      console.log(res)
      toast.success('Asistencias guardadas correctamente', { position: 'bottom-right' })
    } catch (err) {
      toast.error(err?.data?.message || err.error)
      console.log(err)
    }
  }

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAssistModalOpen, setIsAssistModalOpen] = useState(false)

  const handleOpenModal = async (id) => {
    try {
      setIsModalOpen(true)
      setSelectedId(id)
      const data = await getTraining(id).unwrap()
      setFormData({
        courseName: data.courseName,
        instructor: data.instructor,
        description: data.description,
        startDate: new Date(data.startDate).toISOString().split('T')[0],
        endDate: new Date(data.endDate).toISOString().split('T')[0],
        departments: data.departments,
        status: data.status,
        location: data.location,
        capacity: data.capacity
      })
      console.log(formData)
    } catch (error) {
      console.log(error)
    }
  }

  const [trainingDepartments, setTrainingDepartments] = useState([])

  const handleOpenAssistModal = async (id) => {
    try {
      setIsAssistModalOpen(true)
      setSelectedId(id)
      const data = await getTraining(id).unwrap()
      setTrainingDepartments(data.departments)
      setEmployeeIds(data.attendance)
      console.log(employeeIds)
    } catch (error) {
      console.log(error)
    }
  }

  const employeesByDepartment = employees?.filter(item => {
    return trainingDepartments.includes(item.department)
  })

  const handleCloseAssistModal = () => {
    setIsAssistModalOpen(false)
    setEmployeeIds([])
    setSelectedId(null)
  }
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedId(null)
    clearInputs()
  }

  const DateRefStart = useRef()
  const DateRefEnd = useRef()

  const [employeeIds, setEmployeeIds] = useState([])

  const handleEmployeeClick = (id) => {
    if (employeeIds?.includes(id)) {
      setEmployeeIds(employeeIds.filter((item) => item !== id))
      console.log('Elemento Eliminado', employeeIds)
    } else {
      setEmployeeIds(prev => [...prev, id])
      console.log('Elemento añadido', employeeIds)
    }
  }

  useEffect(() => {
    if (data) {
      const updateStatus = async () => {
        for (const training of data) {
          if (dayjs(training.endDate).isBefore(dayjs()) && training.status !== 'Cancelado') {
            const res = await updateTraining({ data: { status: 'Finalizado' }, id: training._id }).unwrap()
            console.log(res)
          } else if (dayjs(training.endDate).isAfter(dayjs()) && training.status !== 'Cancelado') {
            const res = await updateTraining({ data: { status: 'Pendiente' }, id: training._id }).unwrap()
            console.log(res)
          }
        }
      }

      updateStatus()
    }
  }, [data])

  return (
    <>

      <div id='banner' className='w-full mt-[-4rem] bg-employeeBanner dark:bg-darkEmployeeBanner h-72 z-[-999] relative'>

        <div className='absolute w-full bottom-[-1rem] h-16 bg-slate-200 dark:bg-gray-950 ml-[-1rem] blur-md' />

      </div>
      <div className='mt-[-13rem] font-montserrat mb-8 px-16 '>

        <div className='flex-col md:flex-row flex gap-2'>

          <div className='flex justify-center md:block'>
            <Button onClick={() => setIsModalOpen(true)} color='blue' className='[&>*]:gap-2 [&>*]:items-center w-48 '>
              <FaPlus />
              <span>Nuevo Registro</span>
            </Button>
          </div>

          <div className='relative flex items-center w-full [&>button]:absolute [&>button]:right-4'>
            <input
              type='text'
              className='placeholder-gray-900 dark:border-slate-800 dark:border-opacity-70 placeholder-opacity-30 w-full text-sm border border-gray-300 dark:text-slate-200 dark:bg-slate-700 dark:placeholder-slate-50 dark:placeholder-opacity-40 px-4 py-3 rounded-md outline-blue-600 pl-10'
              placeholder='Nombre, documento de identidad, departamento, cargo...'
              onChange={handleFilterInput}
            />
            <FaMagnifyingGlass className='w-[18px] h-[18px] absolute left-4 opacity-70' />
          </div>

        </div>

      </div>

      {
        (isLoading) && <div className='fixed h-[calc(100dvh-70%)] md:h-[calc(100dvh-50%)] w-full grid place-items-center'><Spinner className='md:w-36 md:h-36  w-24 h-24' /></div>
    }
      {
        (!isLoading || !isFetching) &&
          <div className='font-montserrat -mt-4 w-[90%] md:w-[90%] mx-auto overflow-x-auto mb-4 rounded-t-2xl shadow-lg [&_.rdt\_Pagination]:dark:bg-gray-800 [&_.rdt\_Pagination]:dark:text-slate-50 [&_.rdt\_Pagination]:rounded-b-2xl [&_.rdt\_Pagination_div>svg]:hidden [&_.rdt\_Pagination>div>button]:border-yellow-50'>
            <DataTable
              className='[&_.rdt\_TableHeadRow]:text-base [&_.rdt\_TableHeadRow]:font-semibold [&_.rdt\_TableHeadRow]:dark:text-slate-50 [&_.rdt\_TableHead]:rounded-2xl [&_.rdt\_TableHeadRow]:dark:bg-gray-800 [&_.rdt\_TableRow]:dark:bg-slate-700 [&_.rdt\_TableRow]:dark:text-slate-50  '
              columns={columns}
              data={filteredData}
              onRowClicked={row => handleOpenModal(row._id)}
              pagination
              keyField={data._id}
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
          </div>
      }

      <Modal dismissible show={isAssistModalOpen} onClose={handleCloseAssistModal} theme={customTheme} className='overflow-y-auto' size='4xl'>

        <Modal.Header>Asistencias: {selectedId}</Modal.Header>
        <form onSubmit={handleAttendanceSubmit} className='font-montserrat toptext-[#333] h-fit overflow-y-auto'>

          <Modal.Body>
            <div className='grid grid-cols-responsive mx-auto place-items-center'>
              {
                  employeesByDepartment?.map(employee => (
                    <Card key={employee?._id} className={`w-80 mb-4 md:mt-0 min-h-40 cursor-pointer hover:!bg-slate-100 hover:dark:!bg-slate-700 transition-colors [&>div]:p-2 [&>div]:h-fit [&>div]:mt-8 ${employeeIds?.includes(employee?._id) ? 'dark:!bg-slate-700 border !border-blue-500 !bg-slate-200' : ''}`} onClick={() => handleEmployeeClick(employee?._id)}>

                      <div className='flex items-center gap-4'>
                        <div className='w-28'>

                          <Avatar
                            alt='image'
                            size='lg'
                            img={employee?.picturePath ? `/employeesFiles/${employee?.picturePath}` : FaCircleUser}
                            rounded
                            className='dark:text-slate-200'
                          />
                        </div>

                        <div className='w-48 min-w-0  [&_*]:hover:whitespace-normal [&_*]:hover:overflow-visible'>
                          <h5 className='mb-1 text-xl pr-4 font-medium text-gray-900 dark:text-white truncate min-w-0 '>{`${employee?.firstName} ${employee?.lastName}`}</h5>
                          <p className='text-sm text-gray-500 dark:text-gray-400'>{employee?.idDocument}</p>
                          <p className='text-sm text-gray-500 dark:text-gray-400 truncate min-w-0 '>{`${employee?.department} - ${employee?.position}`}</p>
                        </div>
                      </div>
                    </Card>
                  ))
                }
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Button type='submit' color='blue' className='block mx-auto'>Guardar</Button>
          </Modal.Footer>
        </form>
        <Toaster richColors />
      </Modal>

      <Modal dismissible show={isModalOpen} onClose={handleCloseModal} theme={customTheme}>

        <Modal.Header>{selectedId ? 'Editar Curso' : 'Nuevo Curso'}</Modal.Header>
        <form onSubmit={handleSubmit} className='font-montserrat toptext-[#333]'>
          {
          (isTrainingLoading || isTrainingFetching)
            ? <Spinner className='w-16 my-24 h-16 block mx-auto' />
            : <Modal.Body className='bg-slate-50 dark:bg-slate-700'>

              <div>
                <div>
                  <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Título</label>
                  <FormInput handleInputChange={handleInputChange} value={formData.courseName} name='courseName' Icon={FaUserGroup} placeholder='' className='mb-4' />
                </div>

                <div>
                  <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Instructor</label>
                  <FormInput handleInputChange={handleInputChange} value={formData.instructor} name='instructor' Icon={FaUser} placeholder='' className='mb-4' />
                </div>
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
                    name='startDate'
                    type='date'
                    required
                    className='w-full text-sm border border-gray-300 dark:border-slate-800 dark:border-opacity-70 dark:text-slate-200 dark:bg-slate-500 dark:placeholder-slate-50 dark:placeholder-opacity-40 py-3 rounded-md outline-blue-600'
                    onClick={() => DateRefStart.current.showPicker()}
                    ref={DateRefStart}
                    onChange={handleInputChange}
                    value={formData.startDate}
                  />
                </div>
              </div>

              <div className='row-start-6 col-start-1 row-span-1 col-span-5 md:mt-0 mt-1'>
                <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Hasta:</label>
                <div className='relative flex items-center mb-2'>
                  <input
                    name='endDate'
                    type='date'
                    required
                    className='w-full text-sm border border-gray-300 dark:border-slate-800 dark:border-opacity-70 dark:text-slate-200 dark:bg-slate-500 dark:placeholder-slate-50 dark:placeholder-opacity-40 py-3 rounded-md outline-blue-600'
                    onClick={() => DateRefEnd.current.showPicker()}
                    ref={DateRefEnd}
                    onChange={handleInputChange}
                    value={formData.endDate}
                  />
                </div>
              </div>

              <div className='row-start-7 col-start-1 row-span-1 col-span-5 md:mt-0 mt-1'>
                <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Ubicación</label>
                <FormInput handleInputChange={handleInputChange} value={formData.location} name='location' Icon={FaBuildingUser} placeholder='' className='mb-2' />
              </div>

              <div className='row-start-9 col-start-1 row-span-1 col-span-5 md:mt-0 mt-1'>
                <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Capacidad</label>
                <div className='relative flex items-center'>
                  <input
                    name='capacity'
                    type='number'
                    min='0'
                    required
                    className='placeholder-gray-900 placeholder-opacity-30 dark:border-slate-800 dark:border-opacity-70 w-full text-sm border border-gray-300 dark:text-slate-200 dark:bg-slate-500 dark:placeholder-slate-50 dark:placeholder-opacity-40 px-4 py-3 rounded-md outline-blue-600 appearance-none pl-6'
                    onChange={handleInputChange}
                    value={formData.capacity}
                  />
                </div>
              </div>

              <div className='my-2'>
                <label className='text-sm mb-2 dark:text-slate-200 mt-4' htmlFor=''>Destinado a:</label>
                <DepartmentInput type='checkbox' department={formData.departments} handleChange={handleInputChange} />
              </div>

              {
                    selectedId &&
                      <div className='row-start-10 col-start-1 row-span-1 col-span-5 md:mt-0 mt-1'>
                        <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Estado</label>
                        <div className='relative flex items-center'>

                          <select
                            name='status'
                            type='text'
                            required
                            className='w-full text-sm border border-gray-300 dark:border-slate-800 dark:border-opacity-70 dark:text-slate-200 dark:bg-slate-500 dark:placeholder-slate-50 dark:placeholder-opacity-40 px-4 py-3 rounded-md outline-blue-600'
                            onChange={handleInputChange}
                            value={formData.status}
                          >
                            <option className='hidden' value=''>Seleccione una opción...</option>
                            <option value='Pendiente'>Pendiente</option>
                            <option value='Finalizado'>Finalizado</option>
                            <option value='Cancelado'>Cancelado</option>
                          </select>
                        </div>
                      </div>
                  }

            </Modal.Body> //eslint-disable-line
            }
          <Modal.Footer>
            <Button type='submit' color='blue' className='block mx-auto' isProcessing={isSaveLoading || isUpdating ? 'true' : false}>{selectedId ? 'Editar' : 'Añadir'}</Button>
          </Modal.Footer>
        </form>
      </Modal>

    </>
  )
}

export default TrainingScreen
