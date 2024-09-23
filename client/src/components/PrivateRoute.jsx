import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setLogout } from '../state'
import { useVerifyLoginMutation } from '../state/authApiSlice'
import { useEffect } from 'react'
import { useGetBcvQuery } from '../state/bcvApiSlice'

const PrivateRoute = () => {
  const { user } = useSelector((state) => state.auth)
  const { data: bcv, isLoading: isBcvLoading } = useGetBcvQuery()

  const location = useLocation()
  const dispatch = useDispatch()
  const [verifyToken] = useVerifyLoginMutation()
  const navigate = useNavigate()

  const verifyLogin = async () => {
    try {
      await verifyToken().unwrap()
    } catch (error) {
      if (error.status === 401) {
        dispatch(setLogout())
        navigate('/login')
      }
    }
  }

  useEffect(() => {
    verifyLogin()
  }, [user, dispatch, location.pathname])

  useEffect(() => {
    if (!isBcvLoading) console.log(bcv)
  }, [isBcvLoading])

  return user ? <Outlet /> : <Navigate to='/login' replace />
}

export default PrivateRoute
