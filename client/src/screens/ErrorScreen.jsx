import React from 'react'
import { useRouteError } from 'react-router-dom'

const ErrorScreen = () => {
  const error = useRouteError()
  return (
    <div id='error-page' className='grid place-items-center h-full'>
      <h1 className='text-8xl font-bold'>Oops!</h1>
      <h3 className='text-2xl font-bold'>Lo siento, un error inesperado a ocurrido.</h3>
      <p className='text-center'>
        <i>{error.status}</i><br />
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
  )
}

export default ErrorScreen
