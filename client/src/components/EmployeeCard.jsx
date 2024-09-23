import { Avatar, Card, Dropdown, Spinner } from 'flowbite-react'
import { FaCircleUser } from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom'
import { useDeleteEmployeeMutation } from '../state/employeesApiSlice'

const EmployeeCard = ({ id, avatar, firstName, lastName, idDocument, department, position, salaryCalc = false }) => {
  const [deleteEmployee, { isLoading }] = useDeleteEmployeeMutation()
  const navigate = useNavigate()

  const handleClick = (e, salaryCalc) => {
    e.stopPropagation()
    if (salaryCalc === false) {
      navigate(`/employee/${id}`)
    } else {
      navigate(`/salary/${id}`)
    }
  }

  return (
    <div className='relative w-fit'>
      <div className='right-4 top-4 absolute flex justify-between [&>button>svg]:dark:text-white [&>button>svg]:hover:scale-125 [&>button>svg]:hover:transition-all'>
        {isLoading && <Spinner color='failure' />}
        {
          !salaryCalc &&
            <Dropdown inline label=''>
              <Dropdown.Item>
                <a
                  href={`/employees/edit/${id}`}
                  className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white'
                >
                  Editar
                </a>
              </Dropdown.Item>
              <Dropdown.Item>
                <span
                  onClick={() => deleteEmployee(id)}
                  className='block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white'
                >
                  Eliminar
                </span>
              </Dropdown.Item>
            </Dropdown>
        }
      </div>
      <Card onClick={(e) => handleClick(e, salaryCalc)} className='w-80 mb-4 md:mt-0 min-h-40 cursor-pointer hover:bg-slate-100 transition-colors [&>div]:p-2 [&>div]:h-fit [&>div]:mt-8 '>

        <div className='flex items-center gap-4'>
          <div className='w-28'>

            <Avatar
              alt='image'
              size='lg'
              img={avatar ? `/employeesFiles/${avatar}` : FaCircleUser}
              rounded
              className='dark:text-slate-200'
            />
          </div>

          <div className='w-48 min-w-0  [&_*]:hover:whitespace-normal [&_*]:hover:overflow-visible'>
            <h5 className='mb-1 text-xl pr-4 font-medium text-gray-900 dark:text-white truncate min-w-0 '>{`${firstName} ${lastName}`}</h5>
            <p className='text-sm text-gray-500 dark:text-gray-400'>{idDocument}</p>
            <p className='text-sm text-gray-500 dark:text-gray-400 truncate min-w-0 '>{`${department} - ${position}`}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default EmployeeCard
