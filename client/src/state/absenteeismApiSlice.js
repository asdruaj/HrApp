import { apiSlice } from './apiSlice'
import { ABSENTEEISM_BASE_URL } from '../utils/const.js'

export const absenteeismApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    saveAbsenteeism: builder.mutation({
      query: (data) => ({
        url: `${ABSENTEEISM_BASE_URL}/save`,
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Absenteeism', 'Employees']
    }),

    deleteAbsenteeism: builder.mutation({
      query: (id) => ({
        url: `${ABSENTEEISM_BASE_URL}/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Absenteeism']
    }),

    getAllAbsenteeisms: builder.query({
      query: () => ({
        url: `${ABSENTEEISM_BASE_URL}/`,
        method: 'GET'
      }),
      providesTags: ['Absenteeism']
    }),

    getAbsenteeism: builder.query({
      query: (id) => ({
        url: `${ABSENTEEISM_BASE_URL}/${id}`,
        method: 'GET'
      })
    })

  })
})

export const {
  useSaveAbsenteeismMutation,
  useGetAllAbsenteeismsQuery,
  useLazyGetAbsenteeismQuery,
  useDeleteAbsenteeismMutation,
  useEditAbsenteeismMutation

} = absenteeismApiSlice
