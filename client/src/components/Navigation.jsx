import { Drawer, Sidebar, Avatar, Dropdown, Navbar, SidebarItemGroup, DropdownDivider, DarkThemeToggle, Modal, Button, Spinner } from 'flowbite-react'
import { useEffect, useState } from 'react'
import {
  FaClipboardUser,
  FaUsers,
  FaCalculator,
  FaCalendar,
  FaCalendarXmark,
  FaGraduationCap,
  FaBars,
  FaCalendarDays,
  FaArrowLeft,
  FaAngleDown,
  FaCircleUser

} from 'react-icons/fa6'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useGenerateLinkMutation, useLogoutMutation } from '../state/authApiSlice'
import { setLogout } from '../state'
import { Toaster, toast } from 'sonner'
import ClipboardInput from './ClipboardInput'
import PositionInput from './PositionInput'
import DepartmentInput from './DepartmentInput'

const customSidebarTheme = {
  root: {
    base: 'h-full',
    collapsed: {
      on: 'w-16',
      off: 'w-64'
    },
    inner: 'h-full overflow-y-auto overflow-x-hidden rounded bg-slate-100 px-3 py-4 dark:bg-gray-800'
  },
  logo: {
    base: 'mb-5 mr-4 flex items-center pl-2.5',
    collapsed: {
      on: 'hidden',
      off: 'self-center whitespace-nowrap text-xl font-semibold dark:text-white'
    },
    img: 'mr-3 h-6 sm:h-7 scale-[2] mb-[-10px]'
  }
}

const Navigation = () => {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [isOpen, setIsOpen] = useState(false)
  const [openModal, setOpenModal] = useState(false)

  const [linkConfig, setLinkConfig] = useState({
    position: '',
    department: '',
    hrPrivilege: false,
    adminPrivilege: false
  })

  const [tempLinkToken, setTempLinkToken] = useState(null)

  const handleLinkConfigChange = (e) => {
    const { name, value, type, checked } = e.target

    const newValue = type === 'checkbox' ? checked : value
    setLinkConfig(prev => ({ ...prev, [name]: newValue }))
  }

  const [generateLink, { isLoading }] = useGenerateLinkMutation()

  const handleLinkSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData()

    formData.append('position', linkConfig.position)
    formData.append('department', linkConfig.department)
    formData.append('adminPrivilege', linkConfig.adminPrivilege)
    formData.append('hrPrivilege', linkConfig.hrPrivilege)

    try {
      const res = await generateLink(Object.fromEntries(formData)).unwrap()
      setTempLinkToken(res.savedToken.token)
      console.log(res)
    } catch (err) {
      toast.error(err?.data?.message || err.error)
      console.log(err)
    }
  }

  const handleClose = () => setIsOpen(!isOpen)

  const handleCloseModal = () => {
    setOpenModal(false)
    setTempLinkToken(null)
    setLinkConfig({
      position: '',
      department: '',
      hrPrivilege: false,
      adminPrivilege: false
    })
  }
  const location = useLocation()
  const [navBarTitle, setnavBarTitle] = useState('Página Principal')

  const [logout] = useLogoutMutation()

  useEffect(() => {
    if (location.pathname === '/') return setnavBarTitle('Página Principal')
    if (location.pathname.includes('employee')) return setnavBarTitle('Empleados')
    if (location.pathname === '/recruitment') return setnavBarTitle('Reclutamiento')
    if (location.pathname.includes('/salary')) return setnavBarTitle('Cálculos Salariales')
    if (location.pathname === '/calendar/events') return setnavBarTitle('Eventos')
    if (location.pathname === '/calendar/absenteeism') return setnavBarTitle('Absentismos')
    if (location.pathname === '/training') return setnavBarTitle('Capacitación')
    if (location.pathname === '/feedback') return setnavBarTitle('Desempeño')
    if (location.pathname === '/profile') return setnavBarTitle('Mi Perfil')
    if (location.pathname === '/users') return setnavBarTitle('Usuarios')
  }, [location.pathname])

  const logoutHandler = async () => {
    try {
      await logout().unwrap()
      dispatch(setLogout())
      navigate('/login')
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div className='font-raleway sticky top-1 z-[9999]'>

      <Navbar fluid className=' shadow-xl md:rounded-[2rem] md:w-[95%] md:mx-auto md:px-6 md:mt-1 bg-slate-100 dark:bg-gray-900 dark:shadow-[0_5px_15px_-8px_rgba(65,93,153,0.3)]'>
        <div className='flex'>
          <button className='md:ml-5 transition-all duration-300 hover:opacity-80 dark:text-slate-100 text-slate-950' onClick={() => setIsOpen(true)}><FaBars size={25} /></button>
          <span className='ml-4 whitespace-nowrap md:text-xl font-bold dark:text-slate-100 text-slate-950 justify-start'>{navBarTitle}</span>
        </div>
        <div className='flex '>
          <ul className='list-none h-full self-center mr-5 hidden md:flex md:gap-4 flex-nowrap'>
            <Link to='/'>
              <Navbar.Link as='div'>Inicio</Navbar.Link>
            </Link>
            <Navbar.Link href='#'>Ayuda</Navbar.Link>
          </ul>

          <DarkThemeToggle className='mr-2 focus:ring-0 hover:bg-slate-200 dark:hover:bg-slate-800 hover:scale-105 transition-all duration-200 rounded-full' />

          <Dropdown
            className='mt-1'
            arrowIcon={false}
            inline
            label={
              <div className='flex transition-all opacity-90 hover:opacity-100'>
                <Avatar alt='User settings' img={user?.picturePath ? `/avatar/${user?.picturePath}` : FaCircleUser} rounded className='dark:text-slate-100 text-slate-950' />
                <FaAngleDown className='self-center ml-1 dark:text-slate-100' />
              </div>
            }
          >
            <Dropdown.Header>
              <span className='block text-sm'>{`${user?.firstName}  ${user?.lastName}`}</span>
              <span className='block truncate text-sm font-medium'>{user?.email}</span>
            </Dropdown.Header>
            <Link to='/'>
              <Dropdown.Item>Perfil</Dropdown.Item>
            </Link>
            <DropdownDivider className='block md:hidden' />
            <Link to='/profile'>
              <Dropdown.Item className='md:hidden'>Inicio</Dropdown.Item>
            </Link>
            {
              user?.adminPrivilege &&
                <li id='adminDropdown' className=' flex w-full cursor-pointer items-center justify-start text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:bg-gray-600 dark:focus:text-white'>
                  <Dropdown label='Administrador' inline placement='left-start' arrowIcon={false}>
                    <Dropdown.Item onClick={() => setOpenModal(true)}>Generar Enlace</Dropdown.Item>
                    <Link to='/users'>
                      <Dropdown.Item>Usuarios</Dropdown.Item>
                    </Link>
                  </Dropdown>
                </li>
            }
            <Dropdown.Item className='md:hidden'>Ayuda</Dropdown.Item>
            <Dropdown.Item onClick={logoutHandler}>Cerrar Sesión</Dropdown.Item>
          </Dropdown>

        </div>

      </Navbar>

      <Drawer open={isOpen} onClose={handleClose} className='rounded-r-md bg-slate-100'>

        <Drawer.Items className='h-full'>
          <button onClick={() => setIsOpen(false)} className='left-72 absolute opacity-80 transition-all duration-300 hover:opacity-100'>
            <FaArrowLeft size={15} className='text-slate-800' />
          </button>
          <Sidebar aria-label='Sidebar with logo branding example' theme={customSidebarTheme}>
            <div className='flex items-end'>
              <Link to='/' onClick={handleClose} draggable='false'>
                <img draggable='false' src='/logo.webp' alt='MarOil logo' className='w-16 md:w-20' />
              </Link>
              <span id='sidebar-title' className='text-xl font-semibold mb-2 ml-2 dark:text-slate-100'>Menú</span>
            </div>
            <SidebarItemGroup />
            <Sidebar.Items>
              <Sidebar.ItemGroup className='flex flex-col'>
                <Link to='/employees' onClick={handleClose} draggable='false'>
                  <Sidebar.Item className='transition-all duration-300 hover:ml-1' icon={FaUsers} as='div'>
                    Empleados
                  </Sidebar.Item>
                </Link>
                <Link to='/recruitment' onClick={handleClose} draggable='false'>
                  <Sidebar.Item className='transition-all duration-300 hover:ml-1' icon={FaClipboardUser} as='div'>
                    Reclutamiento
                  </Sidebar.Item>
                </Link>
                <Link to='/salary' onClick={handleClose} draggable='false'>
                  <Sidebar.Item className='transition-all duration-300 hover:ml-1' icon={FaCalculator} as='div'>
                    Cálculos Salariales
                  </Sidebar.Item>
                </Link>
                <Sidebar.Collapse draggable='false' className='transition-all duration-300 hover:ml-1' icon={FaCalendar} label='Calendarios'>
                  <Link to='/calendar/events' onClick={handleClose} draggable='false'>
                    <Sidebar.Item className='transition-all duration-300 hover:ml-1' as='div' icon={FaCalendarDays}>Eventos</Sidebar.Item>
                  </Link>
                  <Link to='/calendar/absenteeism' onClick={handleClose} draggable='false'>
                    <Sidebar.Item className='transition-all duration-300 hover:ml-1' as='div' icon={FaCalendarXmark}>
                      Absentismos
                    </Sidebar.Item>
                  </Link>
                </Sidebar.Collapse>
                <Link to='/training' onClick={handleClose} draggable='false'>
                  <Sidebar.Item className='transition-all duration-300 hover:ml-1' as='div' icon={FaGraduationCap}>
                    Capacitación
                  </Sidebar.Item>
                </Link>

              </Sidebar.ItemGroup>
            </Sidebar.Items>
          </Sidebar>
        </Drawer.Items>
      </Drawer>

      <Modal dismissible show={openModal} onClose={handleCloseModal}>
        <Modal.Header className='dark:bg-gray-800'>Generar Enlace de Registro</Modal.Header>
        <form onSubmit={handleLinkSubmit} method='post' encType='multipart/form-data' className='font-montserrat text-[#333]'>
          <Modal.Body>

            <DepartmentInput department={linkConfig.department} handleChange={handleLinkConfigChange} />
            <PositionInput position={linkConfig.position} department={linkConfig.department} handleChange={handleLinkConfigChange} />

            <div className='select-none mt-4'>
              <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Permisos</label>
              <div className='relative flex items-center'>
                <input
                  id='adminPrivilege'
                  name='adminPrivilege'
                  type='checkbox'
                  className='text-sm border border-gray-700 rounded-md outline-blue-600'
                  value={linkConfig.adminPrivilege}
                  onChange={handleLinkConfigChange}
                />
                <label htmlFor='adminPrivilege' className='text-sm ml-4 dark:text-slate-200'>Administrador</label>
              </div>

              <div className='relative flex items-center mt-2'>
                <input
                  id='hrPrivilege'
                  name='hrPrivilege'
                  type='checkbox'
                  className='text-sm border border-gray-700 rounded-md outline-blue-600'
                  value={linkConfig.hrPrivilege}
                  onChange={handleLinkConfigChange}
                />
                <label htmlFor='hrPrivilege' className='text-sm ml-4 dark:text-slate-200'>Recursos Humanos</label>
              </div>
            </div>

            {isLoading && <Spinner className='mt-2 mx-auto block' color='info' aria-label='Info spinner example' />}
            {tempLinkToken && !isLoading && <ClipboardInput value={`${window.location.host}/register/${tempLinkToken}`} />}

          </Modal.Body>
          <Modal.Footer className='dark:bg-gray-800'>
            <Button type='submit' color='blue' className='block mx-auto'>Generar Enlace</Button>
          </Modal.Footer>
        </form>
      </Modal>
      <Toaster position='top-right' richColors />
    </div>
  )
}

export default Navigation
