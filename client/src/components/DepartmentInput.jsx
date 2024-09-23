import { Select } from 'flowbite-react'
import React from 'react'

const DepartmentInput = ({ department, handleChange, type = 'select', ...rest }) => {
  const departments = ['Operaciones Marítimas', 'Talento Humano', 'Servicios Logísticos', 'SIHO-A', 'Proyectos Tecnológicos', 'Ingeniería y Construcción', 'Operaciones Terrestres', 'Automatización, Informática y Telecomunicaciones', 'Mantenimiento']
  return (
    <>
      {type === 'select' &&
        <div className='row-start-7 col-start-1 row-span-1 col-span-5 md:mt-0 mt-1'>
          <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Departamento</label>
          <Select name='department' value={department} onChange={handleChange} className='[&_select]:bg-white [&_select]:dark:bg-slate-500' {...rest}>
            <option value='' hidden>Seleccione una opción...</option>
            {departments.map((department, i) => (
              <option key={i} value={department}>{department}</option>
            ))}
          </Select>
        </div>}

      {type === 'checkbox' &&
        <div>
          {departments.map((item) => (
            <div key={item} className='mb-2 flex gap-2 items-center text-sm'>
              <input
                type='checkbox'
                value={item}
                onChange={handleChange}
                checked={department?.includes(item) || false}
                id={item}
                name='departments '

              />
              <label htmlFor={item}>{item}</label>
            </div>
          ))}
        </div>}
    </>

  )
}

export default DepartmentInput
