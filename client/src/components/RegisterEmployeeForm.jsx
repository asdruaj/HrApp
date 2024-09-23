import { Avatar, Button, Modal, Select, Table } from 'flowbite-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { FaArrowRight, FaAt, FaCircleUser, FaCity, FaCloudArrowUp, FaHeartPulse, FaIdCard, FaMoneyBillTransfer, FaSquarePhone, FaTrashCan, FaUmbrellaBeach, FaUser, FaX } from 'react-icons/fa6'
import { toast, Toaster } from 'sonner'
import { useCreateEmployeeMutation, useEditEmployeeMutation, useGetEmployeeeQuery } from '../state/employeesApiSlice'
import FormInput from './FormInput.jsx'
import { useLocation } from 'react-router-dom'
import PositionInput from './PositionInput.jsx'
import DepartmentInput from './DepartmentInput.jsx'

document.addEventListener('wheel', function (event) {
  if (document.activeElement.type === 'number') {
    document.activeElement.blur()
  }
})

const RegisterEmployeeForm = ({ updateId }) => {
  const location = useLocation()

  const [documents, setDocuments] = useState([])
  const [formData, setformData] = useState({
    firstName: '',
    lastName: '',
    idPrefix: '',
    idDocument: '',
    address: '',
    phoneNumber: '',
    email: '',
    hiringDate: new Date().toISOString().split('T')[0],
    department: '',
    position: '',
    baseSalary: '',
    payFrequency: '',
    accountNumber: '',
    picturePath: null,
    dependents: [],
    bonuses: [],
    vacationDaysBase: 15,
    vacationDays: 0,
    sickDays: '',
    utilsDays: ''
  })

  const clearInputs = () => {
    setformData({
      firstName: '',
      lastName: '',
      idPrefix: '',
      idDocument: '',
      address: '',
      phoneNumber: '',
      email: '',
      hiringDate: new Date().toISOString().split('T')[0],
      department: '',
      position: '',
      baseSalary: '',
      payFrequency: '',
      accountNumber: '',
      picturePath: null,
      dependents: [],
      bonuses: [],
      vacationDaysBase: 15,
      vacationDays: 0,
      sickDays: '',
      utilsDays: ''
    })
    setDocuments([])
  }
  const [createEmployee, { isLoading }] = useCreateEmployeeMutation()
  const [updateEmployee, { isLoading: isLoadingUpdate }] = useEditEmployeeMutation()
  const { data: employee, isLoading: isLoadingEmployee } = useGetEmployeeeQuery(updateId)

  useEffect(() => {
    if (employee && !isLoadingEmployee) {
      setDocuments(employee.documents)
      setformData(employee)
      setformData(prev => ({ ...prev, idPrefix: employee.idDocument.split('-')[0], idDocument: employee.idDocument.split('-')[1], baseSalary: employee.baseSalary.$numberDecimal, hiringDate: employee.hiringDate.split('T')[0], dependents: employee.dependents.length > 0 ? employee.dependents : [] }))
      console.log(employee)
      console.log(documents, employee.documents)
    }
  }, [isLoadingEmployee])

  // Registro desde reclutamiento
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const employee = searchParams.has('_id')
      ? Object.fromEntries(searchParams.entries())
      : null
    if (employee) {
      setformData(prev => ({ ...prev, firstName: employee?.firstName, lastName: employee?.lastName, idPrefix: employee.idDocument.split('-')[0], idDocument: employee?.idDocument.split('-')[1], department: employee?.department, position: employee?.position }))
    }
  }, [])

  const [isModalOpen, setIsModalOpen] = useState(false)

  const [dependentsForm, setDependentsForm] = useState({
    relationship: '',
    name: '',
    idPrefix: '',
    idDocument: '',
    birthday: null
  })

  const handleDependentsFormChange = (e) => {
    const { name, value } = e.target

    setDependentsForm(prev => ({ ...prev, [name]: value }))

    console.log(dependentsForm)
  }

  const handleDependentsClick = (e) => {
    e.preventDefault()

    // Ensure formData.dependents is extensible
    if (!Object.isExtensible(formData.dependents)) {
      formData.dependents = [...formData.dependents]
    }

    formData.dependents.push({
      relationship: dependentsForm.relationship,
      name: dependentsForm.name,
      idDocument: `${dependentsForm.idPrefix}-${dependentsForm.idDocument}`,
      birthday: dependentsForm.birthday
    })

    setDependentsForm({
      relationship: '',
      name: '',
      idPrefix: '',
      idDocument: '',
      birthday: null
    })

    toast.success('Familiar añadido con éxito', { position: 'bottom-right' })
  }

  const handleDependentsDelete = (id) => {
    const newArray = formData.dependents.filter(item => item.idDocument !== id)
    setformData(prev => ({ ...prev, dependents: newArray }))
  }

  const handleInputChange = (e) => {
    const { name, value, files, type } = e.target

    const newValue = type === 'file' ? files[0] : value

    setformData((prev) => ({
      ...prev,
      [name]: newValue
    }))

    console.log(formData)
  }

  const handleBlur = (e) => {
    const { name, value } = e.target

    const newValue = name === 'baseSalary' ? (Math.round(value * 100) / 100).toFixed(2) : value

    setformData((prev) => ({
      ...prev,
      [name]: newValue
    }))

    console.log(formData)
  }

  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    if (fileRejections.length > 0 || (documents.length + acceptedFiles.length) > 5) {
      toast.error('Número máximo de archivos excedidos.')
    } else {
      setDocuments(prev => [...prev, ...acceptedFiles])
    }
    console.log(documents)
  }, [documents])

  const removeFile = () => {
    setDocuments([])
  }
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt'],
      'application/epub+zip': ['.epub, .pub'],
      'image/jpeg': ['.jpg', '.jepg'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/vnd.rar': ['.rar'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']

    },
    maxFiles: 5
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    const postData = new FormData()
    postData.append('firstName', formData.firstName)
    postData.append('lastName', formData.lastName)
    postData.append('idDocument', `${formData.idPrefix}-${formData.idDocument}`)
    postData.append('address', formData.address)
    postData.append('phoneNumber', formData.phoneNumber)
    postData.append('email', formData.email)
    postData.append('hiringDate', formData.hiringDate)
    postData.append('department', formData.department)
    postData.append('position', formData.position)
    postData.append('baseSalary', formData.baseSalary)
    postData.append('payFrequency', formData.payFrequency)
    postData.append('accountNumber', formData.accountNumber)
    formData.picturePath && formData.picturePath instanceof File && postData.append('employeePicture', formData.picturePath)

    postData.append('dependents', JSON.stringify(formData.dependents))

    postData.append('bonuses', formData.bonuses)
    postData.append('vacationDaysBase', formData.vacationDaysBase)
    postData.append('vacationDays', formData.vacationDays)
    postData.append('sickDays', formData.sickDays)
    postData.append('utilsDays', formData.utilsDays)

    if (documents.length > 0) {
      documents.forEach((file) => {
        if (file instanceof File) {
          postData.append('employeeDocuments', file)
        }
      })
    }

    try {
      if (updateId) {
        const res = await updateEmployee({ id: updateId, data: postData }).unwrap()
        toast.success('Empleado actualizado correctamente', { position: 'bottom-right' })
        clearInputs()
        console.log(res)
      } else {
        const res = await createEmployee(postData).unwrap()
        toast.success('Empleado registrado correctamente', { position: 'bottom-right' })
        clearInputs()
        console.log(res)
      }
    } catch (err) {
      toast.error(err?.data?.message || err.error)
      console.log(err)
    }
  }

  const hiringDateRef = useRef()

  const onDateClick = () => {
    hiringDateRef.current.showPicker()
  }

  const idDocumentRef = useRef()

  return (
    <>
      <div id='banner' className='w-full mt-[-4rem] bg-employeeBanner dark:bg-darkEmployeeBanner h-72 z-[-999] relative'>

        <div className='absolute w-full bottom-[-1rem] h-16 bg-slate-200 dark:bg-gray-950 ml-[-1rem] blur-md' />

      </div>
      <form onSubmit={handleSubmit} className='mt-[-12rem] mb-4 p-4 bg-slate-50 max-w-2xl shadow-xl md:mx-auto mx-4 rounded-lg dark:bg-slate-700'>

        <div className='md:grid grid-cols-4  gap-2'>

          <div className='min-w-fit row-start-1 col-start-1 row-span-2 col-span-1 grid place-items-center md:mx-0 md:mb-4'>
            <Avatar
              alt='User Picture' img={(formData.picturePath && formData.picturePath instanceof File && URL.createObjectURL(formData.picturePath)) || (formData.picturePath && `/employeesFiles/${formData.picturePath}`) || FaCircleUser} className='block mb-6 dark:text-slate-100' size='lg' bordered rounded
            />
            <label htmlFor='pictureInput' className='p-2 md:absolute md:translate-y-14 bg-blue-700 rounded-md text-white font-semibold text-sm hover:bg-blue-800 transition-colors cursor-pointer'>Seleccionar Archivo</label>
            <input onChange={handleInputChange} name='picturePath' id='pictureInput' type='file' className='hidden' accept='image/*' />
          </div>

          <div className='grid gap-2 md:grid-cols-2 w-full h-fit row-start-1 col-start-2 row-span-1 col-span-4'>

            <div>
              <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Nombres</label>
              <FormInput handleInputChange={handleInputChange} value={formData.firstName} name='firstName' Icon={FaUser} placeholder='John' required />
            </div>

            <div>
              <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Apellidos</label>
              <FormInput handleInputChange={handleInputChange} value={formData.lastName} name='lastName' Icon={FaUser} placeholder='Doe' required />
            </div>

          </div>

          <div className='row-start-2 col-start-2 row-span-1 col-span-4 md:mt-0 mt-1'>
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
                  } else {
                    idDocumentRef.current.value += event.key
                  }
                }}
                maxLength='9'
                pattern='[0-9]+'
                required
              />

            </div>
          </div>

          <div className='row-start-3 col-start-1 row-span-1 col-span-5 md:mt-0 mt-1'>
            <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Dirección</label>
            <FormInput handleInputChange={handleInputChange} value={formData.address} name='address' Icon={FaCity} placeholder='Barcelona 6001, Anzoátegui' required />
          </div>

          <div className='row-start-4 col-start-1 row-span-1 col-span-5 md:mt-0 mt-1'>
            <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Teléfono</label>
            <FormInput handleInputChange={handleInputChange} value={formData.phoneNumber} name='phoneNumber' Icon={FaSquarePhone} type='number' placeholder='04241234567' required />
          </div>

          <div className='row-start-5 col-start-1 row-span-1 col-span-5 md:mt-0 mt-1'>
            <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Correo Electrónico</label>
            <FormInput handleInputChange={handleInputChange} value={formData.email} name='email' Icon={FaAt} placeholder='johndoe@email.com' required />
          </div>

          <div className='row-start-6 col-start-1 row-span-1 col-span-5 md:mt-0 mt-1'>
            <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Día de Contratación</label>
            <div className='relative flex items-center'>
              <input
                name='hiringDate'
                type='date'
                required
                className='w-full text-sm border dark:border-slate-800 dark:border-opacity-70 border-gray-300 dark:text-slate-200 dark:bg-slate-500 dark:placeholder-slate-50 dark:placeholder-opacity-40 py-3 rounded-md outline-blue-600'
                onChange={handleInputChange}
                onClick={onDateClick}
                ref={hiringDateRef}
                value={formData.hiringDate}
              />
            </div>
          </div>

          <DepartmentInput department={formData.department} handleChange={handleInputChange} />
          <PositionInput position={formData.position} department={formData.department} handleChange={handleInputChange} />

          <div className='row-start-9 col-start-1 row-span-1 col-span-5 md:mt-0 mt-1'>
            <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Salario Base</label>
            <div className='relative flex items-center'>
              <input
                name='baseSalary'
                type='number'
                min='0'
                step='any'
                required
                className='placeholder-gray-900 placeholder-opacity-30 dark:border-slate-800 dark:border-opacity-70 w-full text-sm border border-gray-300 dark:text-slate-200 dark:bg-slate-500 dark:placeholder-slate-50 dark:placeholder-opacity-40 px-4 py-3 rounded-md outline-blue-600 appearance-none pl-10'
                placeholder='300.00'
                onChange={handleInputChange}
                value={formData.baseSalary}
                onBlur={handleBlur}
              />
              <span className='w-[20px] h-[20px] absolute left-1 top-3 opacity-30 font-bold'>BsS.</span>
            </div>
          </div>

          <div className='row-start-10 col-start-1 row-span-1 col-span-4 md:mt-0 mt-1'>
            <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Número de Cuenta</label>

            <FormInput
              handleInputChange={handleInputChange} value={formData.accountNumber} name='accountNumber' Icon={FaIdCard} placeholder='01020418610000067522' className='w-full' innerRef={idDocumentRef} onKeyPress={(event) => {
                if (!/[0-9]/.test(event.key)) {
                  event.preventDefault()
                }
              }}
              pattern='\d{20,20}'
            />

          </div>

          <div className='row-start-11 col-start-1 row-span-1 col-span-5 md:mt-0 mt-1'>
            <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Frecuencia de Pagos</label>
            <div className='relative flex items-center'>
              <select
                name='payFrequency'
                type='text'
                required
                className='w-full text-sm border border-gray-300 dark:border-slate-800 dark:border-opacity-70 dark:text-slate-200 dark:bg-slate-500 dark:placeholder-slate-50 dark:placeholder-opacity-40 px-4 py-3 rounded-md outline-blue-600'
                onChange={handleInputChange}
                value={formData.payFrequency}
              >
                <option className='hidden' value=''>Seleccione una opción...</option>
                <option value='Mensual'>Mensual</option>
                <option value='Quincenal'>Quincenal</option>
              </select>
            </div>
          </div>

          <div className='row-start-12 col-start-1 row-span-1 col-span-5 md:mt-0 mt-1'>
            <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Dependientes</label>

            {
            formData.dependents.length > 0 &&
              <div className='overflow-y-auto mb-4'>

                <Table>
                  <Table.Head className='normal-case'>
                    <Table.HeadCell>Parentesco</Table.HeadCell>
                    <Table.HeadCell>Nombre</Table.HeadCell>
                    <Table.HeadCell>Documento de Identidad</Table.HeadCell>
                    <Table.HeadCell>Día De Nacimiento</Table.HeadCell>
                    <Table.HeadCell>
                      <span className='sr-only'>Acciones</span>
                    </Table.HeadCell>
                  </Table.Head>
                  <Table.Body>
                    {
                    formData.dependents.map((item) => (
                      <Table.Row key={item.idDocument} className='bg-white dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-slate-700'>
                        <Table.Cell>
                          {item.relationship}
                        </Table.Cell>
                        <Table.Cell>{item.name}</Table.Cell>
                        <Table.Cell className='uppercase'>{item.idDocument}</Table.Cell>
                        <Table.Cell>{new Date(item.birthday).toLocaleDateString()}</Table.Cell>
                        <Table.Cell className='flex gap-4 lg:justify-between'>

                          <button type='button' onClick={() => handleDependentsDelete(item.idDocument)} className='hover:text-slate-900 dark:hover:text-white transition-all duration-200'>
                            <FaTrashCan />
                          </button>

                        </Table.Cell>
                      </Table.Row>
                    ))
              }
                  </Table.Body>
                </Table>
              </div>
            }
            <div className='relative flex items-center'>
              <button
                color='blue'
                type='button'
                className='w-52 p-2 mx-auto bg-blue-700 rounded-md text-white font-semibold text-sm hover:bg-blue-800 transition-colors'
                onClick={() => setIsModalOpen(true)}
              >Añadir Familiar
              </button>

            </div>
          </div>

          <div className='row-start-15 col-start-1 row-span-1 col-span-5 md:mt-0 mt-1'>
            <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Bajas por Enfermedad Disponibles (días)</label>
            <div className='relative flex items-center'>
              <input
                name='sickDays'
                type='number'
                min='0'
                step='any'
                required
                className='placeholder-gray-900 placeholder-opacity-30 dark:border-slate-800 dark:border-opacity-70 w-full text-sm border border-gray-300 dark:text-slate-200 dark:bg-slate-500 dark:placeholder-slate-50 dark:placeholder-opacity-40 px-4 py-3 rounded-md outline-blue-600 appearance-none pl-6'
                placeholder='30'
                onChange={handleInputChange}
                value={formData.sickDays}
              />
              <FaHeartPulse className='w-[18px] h-[18px] absolute right-4 opacity-30' />
            </div>
          </div>

          <div className='row-start-16 col-start-1 row-span-1 col-span-5 md:mt-0 mt-1'>
            <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Días de Vacaciones Base</label>
            <div className='relative flex items-center'>
              <input
                name='vacationDaysBase'
                type='number'
                min='15'
                step='any'
                className='placeholder-gray-900 placeholder-opacity-30 dark:border-slate-800 dark:border-opacity-70 w-full text-sm border border-gray-300 dark:text-slate-200 dark:bg-slate-500 dark:placeholder-slate-50 dark:placeholder-opacity-40 px-4 py-3 rounded-md outline-blue-600 appearance-none pl-6'
                placeholder='15'
                onChange={handleInputChange}
                value={formData.vacationDaysBase}
              />
              <FaUmbrellaBeach className='w-[18px] h-[18px] absolute right-4 opacity-30' />
            </div>
          </div>

          <div className='row-start-17 col-start-1 row-span-1 col-span-5 md:mt-0 mt-1'>
            <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Días de Vacaciones Disponibles</label>
            <div className='relative flex items-center'>
              <input
                name='vacationDays'
                type='number'
                min='0'
                step='any'
                className='placeholder-gray-900 placeholder-opacity-30 dark:border-slate-800 dark:border-opacity-70 w-full text-sm border border-gray-300 dark:text-slate-200 dark:bg-slate-500 dark:placeholder-slate-50 dark:placeholder-opacity-40 px-4 py-3 rounded-md outline-blue-600 appearance-none pl-6'
                placeholder='0'
                onChange={handleInputChange}
                value={formData.vacationDays}
              />
              <FaUmbrellaBeach className='w-[18px] h-[18px] absolute right-4 opacity-30' />
            </div>
          </div>

          <div className='row-start-18 col-start-1 row-span-1 col-span-5 md:mt-0 mt-1'>
            <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Días Correspondientes a Pago de Utilidades</label>
            <div className='relative flex items-center'>
              <input
                name='utilsDays'
                type='number'
                min='0'
                step='any'
                required
                className='placeholder-gray-900 dark:border-slate-800 dark:border-opacity-70 placeholder-opacity-30 w-full text-sm border border-gray-300 dark:text-slate-200 dark:bg-slate-500 dark:placeholder-slate-50 dark:placeholder-opacity-40 px-4 py-3 rounded-md outline-blue-600 appearance-none pl-6'
                placeholder='30'
                onChange={handleInputChange}
                value={formData.utilsDays}
              />
              <FaMoneyBillTransfer className='w-[18px] h-[18px] absolute right-4 opacity-30' />
            </div>
          </div>

          <div className='row-start-19 col-start-1 row-span-1 col-span-5 md:mt-0 mt-1 flex justify-between'>
            <label className='text-sm  mt-2 dark:text-slate-200 block'>Documentos</label>

            <button type='button' onClick={removeFile} className='opacity-60 self-center dark:text-slate-200'><FaX /></button>
          </div>

          <div className='row-start-20 col-span-4'>
            <ul className='list-disc list-inside'>
              {documents.length > 0 && documents.map((file, index) => (
                <li className='min-w-0 truncate select-none font-mono font-extralight italic text-gray-500 mb-1 dark:text-slate-200' key={index}>{file.path || file}</li>
              ))}
            </ul>
          </div>

          <div {...getRootProps()} className=' flex items-center justify-center relative col-span-4'>
            <input {...getInputProps()} />
            <label htmlFor='dropzone-file' className='flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-600 hover:bg-gray-100 dark:border-gray-500 dark:hover:border-gray-400 p-4 dark:hover:bg-gray-500 transition-all '>
              <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                <FaCloudArrowUp className='w-10 h-10 mb-3 translate-y-4 text-gray-400' />

                <p className='mb-2 text-sm text-gray-500 dark:text-gray-400'><span className='font-semibold'>Click para subir un documento</span> o arrastra y suelta un archivo</p>
                <p className='mb-2 text-sm text-gray-500 dark:text-gray-400'>(5 archivos max.)</p>
              </div>

            </label>
          </div>

        </div>

        <Button type='submit' className='mx-auto mt-4 w-[50%] group' pill color='blue' isProcessing={isLoading || isLoadingUpdate ? 'true' : false}>
          Guardar Registro
          {(!isLoading || !isLoadingUpdate) && <FaArrowRight className='ml-2 h-4 w-4 mt-[3px] group-hover:translate-x-1 transition-all' />}
        </Button>
      </form>

      <Modal dismissible show={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Modal.Header>Dependientes</Modal.Header>
        <form onSubmit={handleDependentsClick} className='font-montserrat text-[#333]'>
          <Modal.Body className='bg-slate-50 dark:bg-slate-700'>

            <div>
              <div>
                <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Parentesco</label>
                <Select className='w-32' name='relationship' onChange={handleDependentsFormChange} value={dependentsForm.relationship} required>
                  <option value='' className='hidden'>Seleccione una opción...</option>
                  <option value='Hijo/a'>Hijo/a</option>
                  <option value='Cónyuge'>Cónyuge</option>
                  <option value='Padre'>Padre</option>
                  <option value='Madre'>Madre</option>
                  <option value='Otros'>Otros</option>
                </Select>
              </div>

              <div>
                <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Nombre y Apellido</label>
                <FormInput handleInputChange={handleDependentsFormChange} value={dependentsForm.name} name='name' Icon={FaUser} placeholder='John Doe' className='mb-4' required />
              </div>
            </div>

            <div>
              <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Documento de Identidad</label>
              <div className='flex gap-2'>

                <Select className='w-32' name='idPrefix' onChange={handleDependentsFormChange} value={dependentsForm.idPrefix} required>
                  <option value='' className='hidden'>...</option>
                  <option value='V'>V</option>
                  <option value='J'>J</option>
                  <option value='E'>E</option>
                </Select>

                <FormInput
                  handleInputChange={handleDependentsFormChange} value={dependentsForm.idDocument} name='idDocument' Icon={FaIdCard} placeholder='V12345678' className='w-full' innerRef={idDocumentRef} onKeyPress={(event) => {
                    if (!/[0-9]/.test(event.key)) {
                      event.preventDefault()
                    }
                  }}
                  maxLength='9'
                  required
                />

              </div>
            </div>

            <div className='row-start-6 col-start-1 row-span-1 col-span-5 md:mt-0 mt-1'>
              <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Día de Nacimiento</label>
              <div className='relative flex items-center'>
                <input
                  name='birthday'
                  type='date'
                  required
                  className='w-full text-sm border border-gray-300 dark:border-slate-800 dark:border-opacity-70 dark:text-slate-200 dark:bg-slate-500 dark:placeholder-slate-50 dark:placeholder-opacity-40 py-3 rounded-md outline-blue-600'
                  onClick={onDateClick}
                  ref={hiringDateRef}
                  defaultValue={dependentsForm.birthday}
                  onChange={handleDependentsFormChange}
                />
              </div>
            </div>

          </Modal.Body>
          <Modal.Footer>
            <Button type='submit' color='blue' className='block mx-auto'>Añadir</Button>
          </Modal.Footer>
        </form>
        <Toaster richColors />
      </Modal>
    </>
  )
}

export default RegisterEmployeeForm
