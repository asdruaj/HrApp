import { useDeleteUserMutation, useGetUsersQuery, useLazyGetUserQuery, useUpdateUserMutation } from '../state/userApiSlice'
import { Button, Modal, Spinner, Table } from 'flowbite-react'
import { useEffect, useState } from 'react'
import { FaCheck, FaPencil, FaTrashCan } from 'react-icons/fa6'

const UsersScreen = () => {
  const [openModal, setOpenModal] = useState(false)
  const [selectedId, setSelectedId] = useState('')

  const [getUser, { isLoading: isUserLoading, isFetching: isUserFetching }] = useLazyGetUserQuery({ id: selectedId })
  const [deleteUser, { isLoading: isDeleteLoading }] = useDeleteUserMutation()
  const { data, isLoading, isFetching } = useGetUsersQuery()
  const [editUser, { isLoading: isEditLoading }] = useUpdateUserMutation()

  const [modalForm, setModalForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    position: '',
    adminPrivilege: false,
    hrPrivilege: false
  })

  const handleCloseModal = () => {
    setOpenModal(false)
    setModalForm({
      firstName: '',
      lastName: '',
      email: '',
      department: '',
      position: '',
      adminPrivilege: false,
      hrPrivilege: false
    })
  }

  const handleOpenModal = async (id) => {
    try {
      setOpenModal(true)
      setSelectedId(id)
      const data = await getUser(id).unwrap()
      setModalForm(data)
      console.log(data)
    } catch (error) {
      console.log(error)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    const newValue = type === 'checkbox' ? checked : value
    setModalForm(prev => ({ ...prev, [name]: newValue }))
  }

  useEffect(() => {
    console.log(modalForm)
  }, [modalForm])

  const handleDelete = async (id) => {
    const res = await deleteUser(id).unwrap()
    console.log(res)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    const postData = new FormData()
    postData.append('firstName', modalForm.firstName)
    postData.append('lastName', modalForm.lastName)
    postData.append('position', modalForm.position)
    postData.append('department', modalForm.department)
    postData.append('email', modalForm.email)
    postData.append('adminPrivilege', modalForm.adminPrivilege)
    postData.append('hrPrivilege', modalForm.hrPrivilege)

    try {
      const res = await editUser({ id: selectedId, data: Object.fromEntries(postData) }).unwrap()
      if (!isEditLoading) setOpenModal(false)
      console.log(res)
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <>
      {
        (isLoading) && <Spinner />
    }
      {
        (!isLoading || !isFetching) &&
          <div className='mt-4 w-[90%] md:w-[80%] mx-auto overflow-x-auto'>
            <Table>
              <Table.Head>
                <Table.HeadCell>Nombre</Table.HeadCell>
                <Table.HeadCell>E-mail</Table.HeadCell>
                <Table.HeadCell>Departamento</Table.HeadCell>
                <Table.HeadCell>Cargo</Table.HeadCell>
                <Table.HeadCell id='admin'>Admin.</Table.HeadCell>
                <Table.HeadCell>RRHH</Table.HeadCell>
                <Table.HeadCell>
                  <span className='sr-only'>Eliminar</span>
                </Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {
                    data.map((item) => (
                      <Table.Row key={item._id} className='bg-white dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-slate-700'>
                        <Table.Cell className='whitespace-nowrap font-medium text-gray-900 dark:text-white'>
                          {`${item.firstName} ${item.lastName}`}
                        </Table.Cell>
                        <Table.Cell>{item.email}</Table.Cell>
                        <Table.Cell>{item.department}</Table.Cell>
                        <Table.Cell>{item.position}</Table.Cell>
                        <Table.Cell id='admincell'>{item.adminPrivilege ? <FaCheck /> : ''}</Table.Cell>
                        <Table.Cell>{item.hrPrivilege ? <FaCheck /> : ''}</Table.Cell>
                        <Table.Cell className='flex gap-4 lg:justify-between'>

                          <button type='button' onClick={() => handleDelete(item._id)} className='hover:text-slate-900 dark:hover:text-white transition-all duration-200'>
                            {isDeleteLoading ? <Spinner /> : <FaTrashCan />}
                          </button>

                          <button onClick={() => handleOpenModal(item._id)} type='button' className='hover:text-slate-900 dark:hover:text-white transition-all duration-200'>
                            <FaPencil />
                          </button>
                        </Table.Cell>
                      </Table.Row>
                    ))
              }
              </Table.Body>
            </Table>
          </div>
      }

      <Modal dismissible show={openModal} onClose={handleCloseModal}>
        <Modal.Header>Editar Usuario</Modal.Header>
        <form onSubmit={handleEditSubmit} method='post' encType='multipart/form-data' className='font-montserrat text-[#333]'>
          {
            (isUserLoading || isUserFetching)
              ? <Spinner className='w-16 my-12 h-16 block mx-auto' />
              : <Modal.Body className='bg-slate-50 dark:bg-slate-700'>

                <div className='grid gap-4 sm:grid-cols-2'>
                  <div>
                    <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Nombres</label>
                    <div className='relative flex items-center'>
                      <input
                        name='firstName'
                        type='text'
                        required
                        className='w-full text-sm border border-gray-300 dark:border-slate-800 dark:border-opacity-70 dark:text-slate-200 dark:bg-slate-600 dark:placeholder-slate-50 dark:placeholder-opacity-40 px-4 py-3 rounded-md outline-blue-600 mb-4'
                        placeholder='Gerente'
                        onChange={handleChange}
                        value={modalForm.firstName}
                      />
                    </div>
                  </div>
                  <div>

                    <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Apellidos</label>
                    <div className='relative flex items-center'>
                      <input
                        name='lastName'
                        type='text'
                        required
                        className='w-full text-sm border border-gray-300 dark:border-slate-800 dark:border-opacity-70 dark:text-slate-200 dark:bg-slate-600 dark:placeholder-slate-50 dark:placeholder-opacity-40 px-4 py-3 rounded-md outline-blue-600 mb-4'
                        placeholder='AIT'
                        onChange={handleChange}
                        value={modalForm.lastName}
                      />
                    </div>
                  </div>
                </div>

                <div className='grid gap-4 sm:grid-cols-2'>
                  <div>
                    <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Cargo</label>
                    <div className='relative flex items-center'>
                      <input
                        name='position'
                        type='text'
                        required
                        className='w-full text-sm border border-gray-300 dark:border-slate-800 dark:border-opacity-70 dark:text-slate-200 dark:bg-slate-600 dark:placeholder-slate-50 dark:placeholder-opacity-40 px-4 py-3 rounded-md outline-blue-600 mb-4'
                        placeholder='Gerente'
                        onChange={handleChange}
                        value={modalForm.position}
                      />
                    </div>
                  </div>
                  <div>

                    <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Departamento</label>
                    <div className='relative flex items-center'>
                      <input
                        name='department'
                        type='text'
                        required
                        className='w-full text-sm border border-gray-300 dark:border-slate-800 dark:border-opacity-70 dark:text-slate-200 dark:bg-slate-600 dark:placeholder-slate-50 dark:placeholder-opacity-40 px-4 py-3 rounded-md outline-blue-600 mb-4'
                        placeholder='AIT'
                        onChange={handleChange}
                        value={modalForm.department}
                      />
                    </div>
                  </div>
                </div>

                <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>E-mail</label>
                <div className='relative flex items-center'>
                  <input
                    name='email'
                    type='text'
                    required
                    className='w-full text-sm border border-gray-300 dark:border-slate-800 dark:border-opacity-70 dark:text-slate-200 dark:bg-slate-600 dark:placeholder-slate-50 dark:placeholder-opacity-40 px-4 py-3 rounded-md outline-blue-600 mb-4'
                    placeholder='AIT'
                    onChange={handleChange}
                    value={modalForm.email}
                  />
                </div>

                <div className='select-none'>
                  <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Permisos</label>
                  <div className='relative flex items-center'>
                    <input
                      id='adminPrivilege'
                      name='adminPrivilege'
                      type='checkbox'
                      className='text-sm border border-gray-700 rounded-md outline-blue-600'
                      checked={modalForm.adminPrivilege}
                      onChange={handleChange}
                    />
                    <label htmlFor='adminPrivilege' className='text-sm ml-4 dark:text-slate-200'>Administrador</label>
                  </div>

                  <div className='relative flex items-center mt-2'>
                    <input
                      id='hrPrivilege'
                      name='hrPrivilege'
                      type='checkbox'
                      className='text-sm border border-gray-700 rounded-md outline-blue-600'
                      checked={modalForm.hrPrivilege}
                      onChange={handleChange}
                    />
                    <label htmlFor='hrPrivilege' className='text-sm ml-4 dark:text-slate-200'>Recursos Humanos</label>
                  </div>
                </div>

                </Modal.Body> // eslint-disable-line
        }
          <Modal.Footer>
            <Button type='submit' color='blue' className='block mx-auto'>{isEditLoading && <Spinner className='mr-4' />}Aceptar</Button>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  )
}

export default UsersScreen
