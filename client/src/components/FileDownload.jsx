import { BsFileEarmarkFill, BsFileExcelFill, BsFilePdfFill, BsFileWordFill, BsFillFilePptFill, BsImage } from 'react-icons/bs'

const FileDownload = ({ file }) => {
  const chooseFileIcon = (file) => {
    if (file?.split('.')[1] === 'pdf') return <BsFilePdfFill className='w-12 h-12 mx-auto dark:text-slate-200' />
    if (file?.split('.')[1] === 'doc' || file?.split('.')[1] === 'docx') return <BsFileWordFill className='w-12 h-12 mx-auto dark:text-slate-200' />
    if (file?.split('.')[1] === 'ppt' || file?.split('.')[1] === 'pptx') return <BsFillFilePptFill className='w-12 h-12 mx-auto dark:text-slate-200' />
    if (file?.split('.')[1] === 'xls' || file?.split('.')[1] === 'xlsx') return <BsFileExcelFill className='w-12 h-12 mx-auto dark:text-slate-200' />
    if (file?.split('.')[1] === 'jpg' || file?.split('.')[1] === 'jpeg' || file?.split('.')[1] === 'png') return <BsImage className='w-12 h-12 mx-auto dark:text-slate-200' />

    return <BsFileEarmarkFill className='w-12 h-12 mx-auto dark:text-slate-200' />
  }

  return (
    <a href={`/employeesFiles/${file}`} className='w-36 grid grid-rows-2 place-items-center [&_span]:hover:overflow-clip [&_span]:hover:whitespace-normal' download={file?.split('_').slice(2).join('_')}>
      {chooseFileIcon(file)}
      <span className='mt-2  dark:text-slate-200 max-w-36 truncate  break-all'>{file?.split('_').slice(2).join('_')}</span>
    </a>
  )
}

export default FileDownload
