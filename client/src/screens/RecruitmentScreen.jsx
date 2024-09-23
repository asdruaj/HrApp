import { Button, FileInput, Modal, Select, Spinner } from 'flowbite-react'
import React, { useRef, useState } from 'react'
import { FaCircle, FaEnvelope, FaHelmetSafety, FaIdCard, FaMagnifyingGlass, FaPlus, FaTrashCan, FaUser, FaUserGroup } from 'react-icons/fa6'
import FormInput from '../components/FormInput'
import { toast } from 'sonner'
import { useDeleteRecruitmentMutation, useEditRecruitmentMutation, useGetAllRecruitmentsQuery, useLazyGetRecruitmentQuery, useSaveRecruitmentMutation } from '../state/recruitmentApiSlice'
import { BsFilePdfFill } from 'react-icons/bs'
import DataTable from 'react-data-table-component'
import { useNavigate } from 'react-router-dom'
import PositionInput from '../components/PositionInput'
import DepartmentInput from '../components/DepartmentInput'
import PDF from '../components/PDF'
import { PDFDownloadLink } from '@react-pdf/renderer'

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

const RecruitmentScreen = () => {
  const [selectedId, setSelectedId] = useState(null)
  const { data, isLoading, isFetching } = useGetAllRecruitmentsQuery()
  const [getRecruitment, { isLoading: isRecruitmentLoading, isFetching: isRecruitmentFetching }] = useLazyGetRecruitmentQuery({ id: selectedId })
  const [saveRecruitment, { isLoading: isSaveLoading }] = useSaveRecruitmentMutation()
  const [deleteRecruitment, { isLoading: isDeletingRecruitment }] = useDeleteRecruitmentMutation()
  const [updateRecruitment, { isLoading: isUpdatingRecruitment }] = useEditRecruitmentMutation()

  const navigate = useNavigate()

  const [filter, setFilter] = useState('')

  const filteredData = data?.filter((item) =>
    item?.firstName?.toLowerCase().includes(filter?.toLowerCase()) ||
    item?.lastName?.toLowerCase().includes(filter?.toLowerCase()) ||
    item?.department?.toLowerCase().includes(filter?.toLowerCase()) ||
    item?.position?.toLowerCase().includes(filter?.toLowerCase()) ||
    item?.status?.toLowerCase().includes(filter?.toLowerCase()) ||
    item?.idDocument?.toLowerCase().includes(filter?.toLowerCase())
  )

  const handleFilterInput = (e) => {
    const { value } = e.target
    setFilter(value)
  }

  const columns = [
    {
      name: 'Nombre',
      selector: row => `${row.firstName} ${row.lastName}`,
      sortable: true,
      wrap: true,
      format: row => <h2 className='font-semibold'>{row.firstName} {row.lastName}</h2>
    },

    {
      name: 'Documento de Identidad',
      selector: row => row.idDocument

    },
    {
      name: 'Departamento',
      selector: row => row.department,
      sortable: true,
      wrap: true
    },
    {
      name: 'Cargo',
      selector: row => row.position,
      sortable: true,
      wrap: true
    },
    {
      name: 'Fecha de Entrevista',
      selector: row => row.interviewDate,
      format: row => new Date(row.interviewDate).toLocaleDateString('es-VE', { timeZone: 'UTC' }),
      sortable: true
    },
    {
      name: 'Entrevistador',
      selector: row => row.interviewer,
      sortable: true
    },
    {
      name: 'Estado',
      selector: row => row.status,
      cell: (row) => {
        if (row.status === 'Pendiente') return <span className='flex gap-2 h-full items-center '><FaCircle className='text-amber-600 opacity-70 w-2 h-2' />Pendiente</span>
        if (row.status === 'Aprobado') return <span className='flex gap-2 h-full items-center '><FaCircle className='text-green-600 opacity-70 w-2 h-2' />Aprobado</span>
        if (row.status === 'Denegado') return <span className='flex gap-2 h-full items-center'><FaCircle className='text-red-600 opacity-70 w-2 h-2' />Denegado</span>
      }
    },
    {
      name: 'CV',
      selector: row => row.cvPath,
      cell: row => row.cvPath ? <a href={`/employeesFiles/${row.cvPath}`} download={row.cvPath?.split('_').slice(2).join('_')}><BsFilePdfFill className='h-4 w-4 hover:opacity-50 transition-opacity' /></a> : '',
      button: 'true',
      width: '2rem'

    },
    {
      name: '',
      cell: row => row.status === 'Aprobado' &&
        <PDFDownloadLink document={<PDF data={row} />} fileName= {`carta-de-solicitud_${row.firstName} ${row.lastName}`}> {/* eslint-disable-line */}
          <button><FaEnvelope /></button>
        </PDFDownloadLink>,
      button: 'true',
      width: '2rem'
    },
    {
      name: '',
      cell: row => <button disabled={isDeletingRecruitment} onClick={() => deleteRecruitment(row._id)} className='hover:text-red-800 mr-2 transition-all'>{isDeletingRecruitment ? <Spinner /> : <FaTrashCan className='w-4 h-4' id={row._id} />}</button>,
      button: 'true',
      width: '2rem'
    }
  ]

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    idPrefix: '',
    idDocument: '',
    department: '',
    position: '',
    interviewDate: new Date().toISOString().split('T')[0],
    interviewer: '',
    status: '',
    cvPath: null
  })

  const clearInputs = () => {
    setFormData({
      firstName: '',
      lastName: '',
      idPrefix: '',
      idDocument: '',
      department: '',
      position: '',
      interviewDate: new Date().toISOString().split('T')[0],
      interviewer: '',
      status: '',
      cvPath: null
    })
  }

  const handleInputChange = (e) => {
    const { name, value, files, type } = e.target

    const newValue = type === 'file' ? files[0] : value

    setFormData((prev) => ({
      ...prev,
      [name]: newValue
    }))

    console.log(formData)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const postData = new FormData()
    postData.append('firstName', formData.firstName)
    postData.append('lastName', formData.lastName)
    postData.append('idDocument', `${formData.idPrefix}-${formData.idDocument}`)
    postData.append('interviewDate', formData.interviewDate)
    postData.append('department', formData.department)
    postData.append('position', formData.position)
    postData.append('baseSalary', formData.baseSalary)
    postData.append('payFrequency', formData.payFrequency)
    postData.append('interviewer', formData.interviewer)
    postData.append('status', formData.status)
    formData.cvPath && formData.cvPath instanceof File && postData.append('cv', formData.cvPath)

    try {
      if (selectedId) {
        const res = await updateRecruitment({ data: postData, id: selectedId }).unwrap()

        if (res.status === 'Aprobado') {
          const queryString = new URLSearchParams(res).toString()
          toast.success('Aplicante actualizado correctamente. ¿Desea registrarlo en "Empleados"?',
            {
              position: 'bottom-right',
              action: {
                label: 'Si',
                onClick: () => navigate(`/employees/new?${queryString}`)
              },
              cancel: {
                label: 'No'
              }
            })
        } else {
          toast.success('Aplicante actualizado correctamente', { position: 'bottom-right' })
        }
        clearInputs()
        setIsModalOpen(false)
        console.log(res)
      } else {
        const res = await saveRecruitment(postData).unwrap()
        toast.success('Aplicante registrado correctamente', { position: 'bottom-right' })
        clearInputs()
        setIsModalOpen(false)
        console.log(res)
      }
    } catch (err) {
      toast.error(err?.data?.message || err.error)
      console.log(err)
    }
  }

  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenModal = async (id) => {
    try {
      setIsModalOpen(true)
      setSelectedId(id)
      const data = await getRecruitment(id).unwrap()
      setFormData({
        firstName: data.firstName,
        lastName: data.lastName,
        idPrefix: data.idDocument.split('-')[0],
        idDocument: data.idDocument.split('-')[1],
        department: data.department,
        position: data.position,
        interviewDate: new Date(data.interviewDate).toISOString().split('T')[0],
        interviewer: data.interviewer,
        status: data.status
      })
      console.log(formData)
    } catch (error) {
      console.log(error)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedId(null)
    setFormData({
      firstName: '',
      lastName: '',
      idDocument: '',
      department: '',
      position: '',
      interviewDate: new Date().toISOString().split('T')[0],
      interviewer: '',
      status: '',
      cvPath: null
    })
  }

  const DateRef = useRef()
  const idDocumentRef = useRef()

  const onDateClick = () => {
    DateRef.current.showPicker()
  }

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

      <Modal dismissible show={isModalOpen} onClose={handleCloseModal} theme={customTheme}>

        <Modal.Header>{selectedId ? 'Editar Aplicante' : 'Nuevo Aplicante'}</Modal.Header>
        <form onSubmit={handleSubmit} className='font-montserrat toptext-[#333]'>
          {
          (isRecruitmentLoading || isRecruitmentFetching)
            ? <Spinner className='w-16 my-24 h-16 block mx-auto' />
            : <Modal.Body className='bg-slate-50 dark:bg-slate-700'>

              <div>
                <div>
                  <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Nombres</label>
                  <FormInput handleInputChange={handleInputChange} value={formData.firstName} name='firstName' Icon={FaUserGroup} placeholder='Hijo' className='mb-4' />
                </div>

                <div>
                  <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Apellidos</label>
                  <FormInput handleInputChange={handleInputChange} value={formData.lastName} name='lastName' Icon={FaUser} placeholder='John Doe' className='mb-4' />
                </div>
              </div>

              <div>
                <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Documento de Identidad</label>
                <div className='flex gap-2'>

                  <Select className='w-32' name='idPrefix' onChange={handleInputChange} value={formData.idPrefix} required>
                    <option value='' className='hidden'>...</option>
                    <option value='V'>V</option>
                    <option value='J'>J</option>
                    <option value='E'>E</option>
                  </Select>

                  <FormInput
                    handleInputChange={handleInputChange} value={formData.idDocument} name='idDocument' Icon={FaIdCard} placeholder='V12345678' className='w-full' innerRef={idDocumentRef} onKeyPress={(event) => {
                      if (!/[0-9]/.test(event.key)) {
                        event.preventDefault()
                      }
                    }}
                    maxLength='9'
                  />

                </div>
              </div>

              <DepartmentInput department={formData.department} handleChange={handleInputChange} />
              <PositionInput position={formData.position} department={formData.department} handleChange={handleInputChange} />

              <div className='row-start-6 col-start-1 row-span-1 col-span-5 md:mt-0 mt-1'>
                <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Fecha de Entrevista</label>
                <div className='relative flex items-center mb-2'>
                  <input
                    name='interviewDate'
                    type='date'
                    required
                    className='w-full text-sm border border-gray-300 dark:border-slate-800 dark:border-opacity-70 dark:text-slate-200 dark:bg-slate-500 dark:placeholder-slate-50 dark:placeholder-opacity-40 py-3 rounded-md outline-blue-600'
                    onClick={onDateClick}
                    ref={DateRef}
                    onChange={handleInputChange}
                    value={formData.interviewDate}
                  />
                </div>
              </div>

              <div className='row-start-8 col-start-1 row-span-1 col-span-5 md:mt-0 mt-1'>
                <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Entrevistador</label>
                <FormInput handleInputChange={handleInputChange} value={formData.interviewer} name='interviewer' Icon={FaHelmetSafety} placeholder='Supervisor' className='mb-2' />
              </div>

              <div className='row-start-8 col-start-1 row-span-1 col-span-5 md:mt-0 mt-1'>
                <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Currículum Vitae</label>
                <FileInput name='cvPath' className='mb-2' onChange={handleInputChange} />
              </div>

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
                    <option value='Aprobado'>Aprobado</option>
                    <option value='Denegado'>Denegado</option>
                  </select>
                </div>
              </div>

            </Modal.Body> //eslint-disable-line
            }
          <Modal.Footer>
            <Button type='submit' color='blue' className='block mx-auto' isProcessing={isSaveLoading || isUpdatingRecruitment ? 'true' : false}>{selectedId ? 'Editar' : 'Añadir'}</Button>
          </Modal.Footer>
        </form>
      </Modal>

    </>
  )
}

export default RecruitmentScreen
