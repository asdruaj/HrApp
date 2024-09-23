import * as yup from 'yup'

export const loginSchema = yup.object().shape({
  email: yup.string().email('Por favor, ingrese un correo electrónico válido').required(),
  password: yup.string().required('Por favor, ingrese una contraseña válida')
})
