import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useLoginMutation } from '../state/authApiSlice.js'
import { setLogin } from '../state/index.js'
import { Toaster, toast } from 'sonner'
import { Button } from 'flowbite-react'
import { FaArrowRight } from 'react-icons/fa6'

const LoginScreen = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [login, { isLoading }] = useLoginMutation()
  const { user } = useSelector((state) => state.auth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [navigate, user])

  const submitHandler = async (e) => {
    e.preventDefault()
    try {
      const res = await login({ email, password }).unwrap()

      dispatch(setLogin({ ...res }))
      navigate('/')
    } catch (err) {
      toast.error(err?.data?.message || err.error)
    }
  }

  return (
    <div className='font-montserrat text-[#333]'>
      <div className='grid lg:grid-cols-2 gap-4 bg-bgLogin bg-no-repeat bg-cover fixed h-full w-full sm:p-8 p-4 items-center'>
        <div className='max-lg:hidden'>
          <img src='logo.webp' alt='logo' className='w-32 fixed top-24' />

          <div className='max-w-lg px-6 max-lg:hidden'>
            <h3 className='text-3xl font-semibold text-white'>Gestión de Personal</h3>
            <p className='text-base mt-4 text-white'>¡Bienvenido/a al portal de gestión de personal! <br />
              Accede a todas las herramientas y recursos necesarios para administrar eficientemente el talento de la empresa.
            </p>
          </div>
        </div>
        <div className='bg-slate-50 my-4 rounded-xl sm:px-6 px-4 py-8 max-w-md w-full h-max shadow-[0_2px_10px_5px_rgba(0,0,0,0.3)] max-lg:mx-auto'>
          <form onSubmit={submitHandler} method='post'>
            <div className='mb-10'>
              <h3 className='text-3xl font-extrabold'>Iniciar Sesión</h3>
            </div>

            <div>
              <label className='text-sm mb-2 block'>Correo Electrónico</label>
              <div className='relative flex items-center'>
                <input
                  name='email'
                  type='email'
                  required
                  className='w-full text-sm border border-gray-300 px-4 py-3 rounded-md outline-blue-600'
                  placeholder='useremail@email.com'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <svg xmlns='http://www.w3.org/2000/svg' fill='#bbb' stroke='#bbb' className='w-[18px] h-[18px] absolute right-4' viewBox='0 0 24 24'>
                  <circle cx='10' cy='7' r='6' data-original='#000000' />
                  <path d='M14 15H6a5 5 0 0 0-5 5 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 5 5 0 0 0-5-5zm8-4h-2.59l.3-.29a1 1 0 0 0-1.42-1.42l-2 2a1 1 0 0 0 0 1.42l2 2a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42l-.3-.29H22a1 1 0 0 0 0-2z' data-original='#000000' />
                </svg>
              </div>
            </div>
            <div className='mt-6'>
              <label className='text-sm mb-2 block'>Contraseña</label>
              <div className='relative flex items-center'>
                <input
                  name='password'
                  type='password'
                  required
                  className='w-full text-sm border border-gray-300 px-4 py-3 rounded-md outline-blue-600'
                  placeholder='••••••••••'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <svg xmlns='http://www.w3.org/2000/svg' fill='#bbb' stroke='#bbb' className='w-[18px] h-[18px] absolute right-4 cursor-pointer' viewBox='0 0 128 128'>
                  <path d='M64 104C22.127 104 1.367 67.496.504 65.943a4 4 0 0 1 0-3.887C1.367 60.504 22.127 24 64 24s62.633 36.504 63.496 38.057a4 4 0 0 1 0 3.887C126.633 67.496 105.873 104 64 104zM8.707 63.994C13.465 71.205 32.146 96 64 96c31.955 0 50.553-24.775 55.293-31.994C114.535 56.795 95.854 32 64 32 32.045 32 13.447 56.775 8.707 63.994zM64 88c-13.234 0-24-10.766-24-24s10.766-24 24-24 24 10.766 24 24-10.766 24-24 24zm0-40c-8.822 0-16 7.178-16 16s7.178 16 16 16 16-7.178 16-16-7.178-16-16-16z' data-original='#000000' />
                </svg>
              </div>
            </div>
            <div className='mt-4 text-right mb-[-1rem]'>
              <a className='text-blue-600 text-sm font-semibold hover:underline'>
                ¿Olvidó su Contraseña?
              </a>
            </div>
            <div className='mt-6'>
              <Button type='submit' className='mx-auto w-[80%]' pill color='blue' isProcessing={isLoading ? 'true' : false}>
                Iniciar Sesión
                {!isLoading && <FaArrowRight className='ml-2 h-4 w-4 mt-[3px]' />}
              </Button>
            </div>
          </form>
        </div>
      </div>
      <Toaster position='top-right' richColors />
    </div>
  )
}

export default LoginScreen
