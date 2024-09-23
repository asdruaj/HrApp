import { Spinner } from 'flowbite-react'
import React, { useState } from 'react'
import { FaMagnifyingGlass } from 'react-icons/fa6'
import EmployeeCard from '../components/EmployeeCard'
import { useGetEmployeesQuery } from '../state/employeesApiSlice'

const SalaryScreen = () => {
  const { data: employees, isLoading } = useGetEmployeesQuery()
  const [filter, setFilter] = useState('')

  const filteredEmployees = employees?.filter((employee) =>
    employee?.firstName?.toLowerCase().includes(filter?.toLowerCase()) ||
    employee?.lastName?.toLowerCase().includes(filter?.toLowerCase()) ||
    employee?.department?.toLowerCase().includes(filter?.toLowerCase()) ||
    employee?.position?.toLowerCase().includes(filter?.toLowerCase()) ||
    employee?.idDocument?.toLowerCase().includes(filter?.toLowerCase())
  )

  return (
    <>
      <div id='banner' className='w-full mt-[-4rem] bg-employeeBanner dark:bg-darkEmployeeBanner h-72 z-[-999] relative'>

        <div className='absolute w-full bottom-[-1rem] h-16 bg-slate-200 dark:bg-gray-950 ml-[-1rem] blur-md' />

      </div>
      <div className='mt-[-13rem] font-montserrat mb-8 px-4  '>

        <div className='relative flex items-center w-[91%] mx-auto [&>button]:absolute [&>button]:right-4'>
          <input
            type='text'
            className='placeholder-gray-900 dark:border-slate-800 dark:border-opacity-70 placeholder-opacity-30 w-full text-sm border border-gray-300 dark:text-slate-200 dark:bg-slate-700 dark:placeholder-slate-50 dark:placeholder-opacity-40 px-4 py-3 rounded-md outline-blue-600 pl-10'
            placeholder='Nombre, documento de identidad, departamento, cargo...'
            onChange={(e) => setFilter(e.target.value)}
          />
          <FaMagnifyingGlass className='w-[18px] h-[18px] absolute left-4 opacity-70' />

        </div>

        <h1 className='dark:text-slate-200 bg-slate-50 dark:bg-gray-700 w-fit py-2 px-4 rounded-md font-semibold text-lg mt-4 ml-4 md:ml-14'>{isLoading ? 'Registros encontrados:' : `${filteredEmployees.length} Registros Encontrados:`}</h1>

        <div>

          {
        isLoading
          ? <Spinner className='mx-auto block' size='xl' />
          : <div className='[&>*]:mx-auto mt-4  w-full sm:grid grid-cols-responsive-sm md:grid-cols-responsive gap-4 '>
            {
             filteredEmployees.length > 0
               ? filteredEmployees?.reverse().map(item => (

                 <EmployeeCard
                   key={item._id}
                   avatar={item.picturePath}
                   firstName={item.firstName}
                   lastName={item.lastName}
                   idDocument={item.idDocument}
                   department={item.department}
                   position={item.position}
                   id={item._id}
                   salaryCalc
                 />
               ))
               : !filter && <h2>Oops! no hay ningún empleado registrado en este momento.</h2>

            }
          </div> //eslint-disable-line
        }
        </div>
      </div>
    </>
  )
}

export default SalaryScreen
