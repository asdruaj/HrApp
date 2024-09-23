import React from 'react'

const FormInput = ({ handleInputChange, value, Icon, name, placeholder, className, readonly, innerRef = false, type = 'text', ...rest }) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <input
        readOnly={readonly}
        name={name}
        type={type}
        className='placeholder-gray-900 dark:border-slate-800 dark:border-opacity-70 placeholder-opacity-30 w-full text-sm border border-gray-300 dark:text-slate-200 dark:bg-slate-500 dark:placeholder-slate-50 dark:placeholder-opacity-40 px-4 py-3 rounded-md outline-blue-600'
        placeholder={placeholder}
        onChange={handleInputChange}
        value={value}
        ref={innerRef || null}
        {...rest}
      />
      {
        Icon &&
          <Icon className='w-[18px] h-[18px] absolute right-4 opacity-30' />
      }
    </div>
  )
}

export default FormInput
