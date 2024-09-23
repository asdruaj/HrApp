import { Clipboard } from 'flowbite-react'

const ClipboardInput = ({ value }) => {
  return (
    <div className='grid w-full max-w-[80%] mt-4 mx-auto'>
      <div className='relative'>
        <label htmlFor='npm-install' className='sr-only'>
          Label
        </label>
        <input
          id='npm-install'
          type='text'
          className='col-span-6 block w-full rounded-lg border border-gray-300 bg-gray-50 px-2.5 py-4 text-sm text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500'
          value={value}
          disabled
          readOnly
        />
        <Clipboard.WithIcon className='bg-slate-100 h-[calc(100%-2px)] right-[1px] w-12' id='clipboard' valueToCopy={value} type='button' />
      </div>
    </div>
  )
}

export default ClipboardInput
