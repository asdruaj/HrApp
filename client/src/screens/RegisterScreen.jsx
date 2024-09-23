import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setRegister } from '../state/index.js'
import { useRegisterMutation, useGetTokenDataQuery } from '../state/authApiSlice.js'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import { Button } from 'flowbite-react'
import { FaArrowRight, FaBuildingUser, FaCloudArrowUp, FaEnvelope, FaEyeLowVision, FaHelmetSafety, FaUser, FaX } from 'react-icons/fa6'

const RegisterScreen = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { token } = useParams()
  const { data: tokenData, isSuccess, isError } = useGetTokenDataQuery(token)

  const [register, { isLoading }] = useRegisterMutation()

  const { user } = useSelector((state) => state.auth)

  const [formData, setformData] = useState({
    firstName: '',
    lastName: '',
    position: '',
    department: '',
    email: '',
    password: '',
    picturePath: ''
  })

  const [myFile, setMyFile] = useState([])

  const onDrop = useCallback(acceptedFiles => {
    setMyFile(acceptedFiles)
  }, [myFile])

  const removeFile = () => {
    setMyFile([])
  }
  const { getRootProps, getInputProps } = useDropzone({ onDrop, multiple: false })

  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [navigate, user])

  useEffect(() => {
    const fetchData = () => {
      try {
        if (isError) {
          navigate('/404')
          console.log(isError)
        }
        if (isSuccess) {
          const { position, department } = tokenData
          setformData(prev => ({ ...prev, position, department }))
        }
      } catch (err) {
        console.log(err)
      }
    }
    fetchData()
  }, [isSuccess, isError])

  const handleInputChange = (e) => {
    const { name, value } = e.target

    setformData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const submitHandler = async (e) => {
    e.preventDefault()
    const postData = new FormData()
    postData.append('firstName', formData.firstName)
    postData.append('lastName', formData.lastName)
    postData.append('position', formData.position)
    postData.append('department', formData.department)
    postData.append('email', formData.email)
    postData.append('password', formData.password)
    if (myFile[0]) {
      postData.append('picture', myFile[0])
    }

    try {
      const res = await register({ token, data: postData }).unwrap()
      dispatch(setRegister({ ...res }))
      navigate('/')
    } catch (err) {
      toast.error(err?.data?.message || err.error)
      console.log(err)
    }
  }

  return (
    <div className='font-montserrat text-[#333]'>
      <div className='bg-bgRegister bg-no-repeat bg-cover h-full w-full sm:p-8 p-4 items-center'>

        <div className='bg-slate-50 rounded-xl  sm:px-6 px-4 py-8 max-w-2xl w-full shadow-[0_2px_10px_5px_rgba(0,0,0,0.3)] mx-auto'>

          <form onSubmit={submitHandler} method='post' encType='multipart/form-data'>
            <div className='mb-6'>
              <h3 className='text-3xl font-extrabold'>Nuevo Usuario</h3>
            </div>

            <div className='grid gap-4 sm:grid-cols-2'>
              <div>
                <label className='text-sm mb-2' htmlFor=''>Nombres</label>
                <div className='relative flex items-center'>
                  <input
                    name='firstName'
                    type='text'
                    required
                    className='w-full text-sm border border-gray-300 px-4 py-3 rounded-md outline-blue-600'
                    placeholder='Juan José'
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                  <FaUser className='w-[18px] h-[18px] absolute right-4 opacity-30' />
                </div>
              </div>
              <div>
                <label className='text-sm mb-2' htmlFor=''>Apellidos</label>
                <div className='relative flex items-center'>
                  <input
                    name='lastName'
                    type='text'
                    required
                    className='w-full text-sm border border-gray-300 px-4 py-3 rounded-md outline-blue-600'
                    placeholder='Perez González'
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                  <FaUser className='w-[18px] h-[18px] absolute right-4 opacity-30' />
                </div>
              </div>
            </div>

            <div className='grid gap-4 sm:grid-cols-2 mt-4'>
              <div>
                <label className='text-sm mb-2' htmlFor=''>Cargo</label>
                <div className='relative flex items-center'>
                  <input
                    name='position'
                    type='text'
                    required
                    className='w-full text-sm border border-gray-300 px-4 py-3 rounded-md outline-blue-600'
                    placeholder='Supervisor'
                    value={formData.position}
                    onChange={handleInputChange}
                  />
                  <FaHelmetSafety className='w-[18px] h-[18px] absolute right-4 opacity-30' />
                </div>
              </div>
              <div>
                <label className='text-sm mb-2' htmlFor=''>Departamento</label>
                <div className='relative flex items-center'>
                  <input
                    name='department'
                    type='text'
                    required
                    className='w-full text-sm border border-gray-300 px-4 py-3 rounded-md outline-blue-600'
                    placeholder='AIT'
                    value={formData.department}
                    onChange={handleInputChange}
                  />
                  <FaBuildingUser className='w-[18px] h-[18px] absolute right-4 opacity-30' />
                </div>
              </div>
            </div>
            <div className='mt-4'>
              <label className='text-sm mb-2 block'>Correo Electrónico</label>
              <div className='relative flex items-center'>
                <input
                  name='email'
                  type='email'
                  required
                  className='w-full text-sm border border-gray-300 px-4 py-3 rounded-md outline-blue-600'
                  placeholder='juangonzalez@email.com'
                  value={formData.email}
                  onChange={handleInputChange}
                />
                <FaEnvelope className='w-[18px] h-[18px] absolute right-4 opacity-30' />
              </div>
            </div>
            <div className='mt-4'>
              <label className='text-sm mb-2 block'>Contraseña</label>
              <div className='relative flex items-center'>
                <input
                  name='password'
                  type='password'
                  required
                  className='w-full text-sm border border-gray-300 px-4 py-3 rounded-md outline-blue-600'
                  placeholder='••••••••••'
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <FaEyeLowVision className='w-[18px] h-[18px] absolute right-4 opacity-30' />
              </div>
            </div>

            <div className='flex justify-between'>
              <label className='text-sm mb-2 mt-2 block'>Foto de Perfil
                <span className='opacity-60'> (Opcional)</span>
              </label>
              <button type='button' onClick={removeFile} className='opacity-60 self-center'><FaX /></button>
            </div>
            <div {...getRootProps()} className=' flex items-center justify-center relative'>
              <input {...getInputProps()} />
              <label htmlFor='dropzone-file' className='flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600'>
                <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                  {myFile[0] ? <img className='w-10 h-10 mb-3 rounded-full' src={URL.createObjectURL(myFile[0])} /> : <FaCloudArrowUp className='w-10 h-10 mb-3 text-gray-400' />}

                  <p className='mb-2 text-sm text-gray-500 dark:text-gray-400'><span className='font-semibold'>Click para subir tu foto</span> o arrastra y suelta un archivo</p>
                </div>

              </label>
            </div>

            <div className='mt-4'>
              <Button type='submit' className='mx-auto w-[80%] group' pill color='blue' isProcessing={isLoading ? 'true' : false}>
                Completar Registro
                {!isLoading && <FaArrowRight className='ml-2 h-4 w-4 mt-[3px] group-hover:translate-x-1 transition-all' />}
              </Button>
              <div className='flex items-center'>

                <Link to='/login' replace className='mt-4 text-center text-sm w-full hover:underline text-blue-700'>¿Ya se encuentra registrado?</Link>
              </div>
            </div>
          </form>

        </div>
      </div>
    </div>
  )
}

export default RegisterScreen
