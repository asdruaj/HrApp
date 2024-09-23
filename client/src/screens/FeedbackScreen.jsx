import { Button, Modal, Spinner } from 'flowbite-react'
import React, { useRef, useState } from 'react'
import { FaCircle, FaMagnifyingGlass, FaPlus, FaTrashCan, FaUserGroup } from 'react-icons/fa6'
import FormInput from '../components/FormInput'
import { toast } from 'sonner'
import DataTable from 'react-data-table-component'
import { useDeleteFeedbackMutation, useEditFeedbackMutation, useGetAllFeedbacksQuery, useLazyGetFeedbackQuery, useSaveFeedbackMutation } from '../state/feedbackApiSlice'
import { useSelector } from 'react-redux'

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

const FeedbackScreen = () => {
  const { user } = useSelector((state) => state.auth)
  const [selectedId, setSelectedId] = useState(null)
  const { data, isLoading, isFetching } = useGetAllFeedbacksQuery()
  const [getFeedback, { isLoading: isFeedbackLoading, isFetching: isFeedbackFetching }] = useLazyGetFeedbackQuery({ id: selectedId })
  const [saveFeedback, { isLoading: isSaveLoading }] = useSaveFeedbackMutation()
  const [deleteFeedback, { isLoading: isDeleting }] = useDeleteFeedbackMutation()
  const [updateFeedback, { isLoading: isUpdating }] = useEditFeedbackMutation()

  const [filter, setFilter] = useState('')

  const filteredData = data?.filter((item) =>
    item?.reportTitle?.toLowerCase().includes(filter?.toLowerCase()) ||
    item?.status?.toLowerCase().includes(filter?.toLowerCase())
  )

  const handleFilterInput = (e) => {
    const { value } = e.target
    setFilter(value)
  }

  const columns = [
    {
      name: 'Creado por: ',
      selector: row => row.createdBy,
      sortable: true,
      wrap: true,
      format: row => <h2 className='font-semibold'>{`${row.createdBy?.firstName} ${row.createdBy?.lastName}`}</h2>
    },
    {
      name: 'Últimos cambios por: ',
      selector: row => row.latestChangeBy,
      sortable: true,
      wrap: true,
      format: row => <h2 className='font-semibold'>{row.latestChangeBy ? `${row.latestChangeBy?.firstName} ${row.latestChangeBy?.lastName}` : ''}</h2>
    },

    {
      name: 'Título',
      selector: row => row.reportTitle,
      sortable: true,
      wrap: true

    },
    {
      name: 'Plazo',
      selector: row => row.dueDate,
      format: row => new Date(row.dueDate).toLocaleDateString('es-VE', { timeZone: 'UTC' }),
      sortable: true
    },

    {
      name: 'Estado',
      selector: row => row.status,
      cell: (row) => {
        if (row.status === 'Pendiente') return <span className='flex gap-2 h-full items-center '><FaCircle className='text-amber-600 opacity-70 w-2 h-2' />Pendiente</span>
        if (row.status === 'Completado') return <span className='flex gap-2 h-full items-center '><FaCircle className='text-green-600 opacity-70 w-2 h-2' />Completado</span>
        if (row.status === 'Cancelado') return <span className='flex gap-2 h-full items-center'><FaCircle className='text-red-600 opacity-70 w-2 h-2' />Cancelado</span>
      }
    },

    {
      name: '',
      cell: row => <button disabled={isDeleting} onClick={() => deleteFeedback(row._id)} className='hover:text-red-800 mr-2 transition-all'>{isDeleting ? <Spinner /> : <FaTrashCan className='w-4 h-4' id={row._id} />}</button>,
      button: 'true',
      width: '3rem'
    }
  ]

  const [formData, setFormData] = useState({
    createdBy: '',
    latestChangeBy: '',
    reportTitle: '',
    descriptionRequest: '',
    dueDate: new Date().toISOString().split('T')[0],
    report: '',
    observations: '',
    status: ''
  })

  const clearInputs = () => {
    setFormData({
      createdBy: '',
      latestChangeBy: '',
      reportTitle: '',
      descriptionRequest: '',
      dueDate: new Date().toISOString().split('T')[0],
      report: '',
      observations: '',
      status: ''
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))

    console.log(formData)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (selectedId) {
        const res = await updateFeedback({
          data: {
            latestChangeBy: user._id,
            reportTitle: formData.reportTitle,
            dueDate: new Date(formData.dueDate),
            report: formData.report,
            observations: formData.observations,
            status: formData.status
          },
          id: selectedId
        }).unwrap()
        toast.success('Reporte enviado correctamente', { position: 'bottom-right' })
        clearInputs()
        setIsModalOpen(false)
        console.log(res)
      } else {
        const res = await saveFeedback({
          createdBy: user._id,
          reportTitle: formData.reportTitle,
          dueDate: new Date(formData.dueDate),
          descriptionRequest: formData.descriptionRequest
        }).unwrap()
        toast.success('Reporte solicitado correctamente', { position: 'bottom-right' })
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
      const data = await getFeedback(id).unwrap()
      setFormData({
        createdBy: `${data.createdBy.firstName} ${data.createdBy.lastName}`,
        latestChangeBy: data.latestChangeBy ? `${data.latestChangeBy?.firstName} ${data.latestChangeBy?.lastName}` : '',
        reportTitle: data.reportTitle,
        descriptionRequest: data.descriptionRequest,
        dueDate: new Date(data.dueDate).toISOString().split('T')[0],
        report: data.report,
        observations: data.observations,
        status: data.status
      })
      console.log(formData)
      console.log(data)
    } catch (error) {
      console.log(error)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedId(null)
    clearInputs()
  }
  const DateRef = useRef()

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
              <span>Nueva Solicitud</span>
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
          <div className='font-montserrat -mt-4 w-[90%] md:w-[90%] mx-auto overflow-x-auto mb-4 [&_.rdt\_TableHeader]:rounded-t-2xl [&_.rdt\_TableHeader]:dark:bg-gray-800 [&_.rdt\_TableHeader]:dark:text-slate-50 shadow-lg [&_.rdt\_Pagination]:dark:bg-gray-800 [&_.rdt\_Pagination]:dark:text-slate-50 [&_.rdt\_Pagination]:rounded-b-2xl [&_.rdt\_Pagination_div>svg]:hidden [&_.rdt\_Pagination>div>button]:border-yellow-50'>
            <DataTable
              title='Reportes'
              className='[&_.rdt\_TableHeadRow]:text-base [&_.rdt\_TableHeadRow]:font-semibold [&_.rdt\_TableHeadRow]:dark:text-slate-50  [&_.rdt\_TableHeadRow]:dark:bg-gray-800 [&_.rdt\_TableRow]:dark:bg-slate-700 [&_.rdt\_TableRow]:dark:text-slate-50  '
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

        <Modal.Header>{selectedId ? 'Llenar Reporte' : 'Nueva Solicitud'}</Modal.Header>
        <form onSubmit={handleSubmit} className='font-montserrat toptext-[#333]'>
          {
          (isFeedbackLoading || isFeedbackFetching)
            ? <Spinner className='w-16 my-24 h-16 block mx-auto' />
            : <Modal.Body className='bg-slate-50 dark:bg-slate-700'>

              <div>
                {selectedId && <label className='text-sm mb-2 dark:text-slate-200 block' htmlFor=''>Creado por: {formData.createdBy}</label>}

                {formData.latestChangeBy && <label className='text-sm mb-2 dark:text-slate-200 block' htmlFor=''>Últimos cambios por: {formData.latestChangeBy}</label>}

                <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Título</label>
                <FormInput readonly={!!selectedId} handleInputChange={handleInputChange} value={formData.reportTitle} name='reportTitle' Icon={FaUserGroup} placeholder='' className='mb-4' />
              </div>

              <div>
                <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Descripción de la Solicitud</label>
                <div className='relative flex items-center mb-4'>
                  <textarea
                    name='descriptionRequest'
                    readOnly={!!selectedId}
                    className=' placeholder-gray-900 placeholder-opacity-30 dark:border-slate-800 dark:border-opacity-70 w-full text-sm border border-gray-300 dark:text-slate-200 dark:bg-slate-500 dark:placeholder-slate-50 dark:placeholder-opacity-40 px-4 py-3 rounded-md outline-blue-600 resize-none'
                    rows='10'
                    placeholder=''
                    value={formData.descriptionRequest}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className='row-start-6 col-start-1 row-span-1 col-span-5 md:mt-0 mt-1'>
                <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Fecha de Entrega:</label>
                <div className='relative flex items-center mb-2'>
                  <input
                    readOnly={!!selectedId}
                    name='dueDate'
                    type='date'
                    required
                    className='w-full text-sm border border-gray-300 dark:border-slate-800 dark:border-opacity-70 dark:text-slate-200 dark:bg-slate-500 dark:placeholder-slate-50 dark:placeholder-opacity-40 py-3 rounded-md outline-blue-600'
                    onClick={() => DateRef.current.showPicker()}
                    ref={DateRef}
                    onChange={handleInputChange}
                    value={formData.dueDate}
                  />
                </div>
              </div>

              {
                selectedId &&
                  <>
                    <div>
                      <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Reporte</label>
                      <div className='relative flex items-center mb-4'>
                        <textarea
                          name='report'
                          className='uppercase placeholder-gray-900 placeholder-opacity-30 dark:border-slate-800 dark:border-opacity-70 w-full text-sm border border-gray-300 dark:text-slate-200 dark:bg-slate-500 dark:placeholder-slate-50 dark:placeholder-opacity-40 px-4 py-3 rounded-md outline-blue-600 resize-none'
                          rows='10'
                          placeholder=''
                          value={formData.report}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div>
                      <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Observaciones</label>
                      <div className='relative flex items-center mb-4'>
                        <textarea
                          name='observations'
                          className='uppercase placeholder-gray-900 placeholder-opacity-30 dark:border-slate-800 dark:border-opacity-70 w-full text-sm border border-gray-300 dark:text-slate-200 dark:bg-slate-500 dark:placeholder-slate-50 dark:placeholder-opacity-40 px-4 py-3 rounded-md outline-blue-600 resize-none'
                          rows='7'
                          placeholder=''
                          value={formData.observations}
                          onChange={handleInputChange}
                        />
                      </div>
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
                          <option value='Completado'>Completado</option>
                        </select>
                      </div>
                    </div>
                  </> //

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

export default FeedbackScreen
