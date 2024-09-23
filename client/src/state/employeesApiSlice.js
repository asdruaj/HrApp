import { apiSlice } from './apiSlice'
import { EMPLOYEES_BASE_URL } from '../utils/const.js'

export const employeesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createEmployee: builder.mutation({
      query: (data) => ({
        url: `${EMPLOYEES_BASE_URL}/save`,
        method: 'POST',
        body: data,
        formData: true
      }),
      invalidatesTags: ['Employees']
    }),
    editEmployee: builder.mutation({
      query: ({ data, id }) => ({
        url: `${EMPLOYEES_BASE_URL}/${id}`,
        method: 'PATCH',
        body: data,
        formData: true
      }),
      invalidatesTags: ['Employees']
    }),
    updateWithdrawal: builder.mutation({
      query: ({ employeeId, benefitId, data }) => ({
        url: `${EMPLOYEES_BASE_URL}/${employeeId}/socialBenefits/${benefitId}/withdraw`,
        method: 'PATCH',
        body: data
      }),
      invalidatesTags: ['Employees']
    }),

    deleteEmployee: builder.mutation({
      query: (id) => ({
        url: `${EMPLOYEES_BASE_URL}/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Employees']
    }),
    getEmployees: builder.query({
      query: () => ({
        url: `${EMPLOYEES_BASE_URL}/`,
        method: 'GET'
      }),
      providesTags: ['Employees']
    }),
    getEmployeee: builder.query({
      query: (id) => ({
        url: `${EMPLOYEES_BASE_URL}/${id}`,
        method: 'GET'
      })
    }),
    saveTrainingToUser: builder.mutation({
      query: ({ data, id }) => ({
        url: `${EMPLOYEES_BASE_URL}/saveTrainingToUser/${id}`,
        method: 'PATCH',
        body: data
      }),
      invalidatesTags: ['Employees']
    })

  })
})

export const {
  useCreateEmployeeMutation,
  useGetEmployeesQuery,
  useGetEmployeeeQuery,
  useDeleteEmployeeMutation,
  useEditEmployeeMutation,
  useLazyGetEmployeeeQuery,
  useUpdateWithdrawalMutation,
  useSaveTrainingToUserMutation

} = employeesApiSlice
