import { useParams } from 'react-router-dom'
import RegisterEmployeeForm from '../components/RegisterEmployeeForm'

const EmployeeRegister = () => {
  const { id } = useParams()

  return (
    <RegisterEmployeeForm updateId={id || null} />
  )
}

export default EmployeeRegister
