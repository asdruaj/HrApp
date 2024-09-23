import { apiSlice } from './apiSlice'
import { RECRUITMENT_BASE_URL } from '../utils/const.js'

export const recruitmentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    saveRecruitment: builder.mutation({
      query: (data) => ({
        url: `${RECRUITMENT_BASE_URL}/save`,
        method: 'POST',
        body: data,
        formData: true
      }),
      invalidatesTags: ['Recruitment']
    }),

    deleteRecruitment: builder.mutation({
      query: (id) => ({
        url: `${RECRUITMENT_BASE_URL}/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Recruitment']
    }),

    editRecruitment: builder.mutation({
      query: ({ data, id }) => ({
        url: `${RECRUITMENT_BASE_URL}/${id}`,
        method: 'PATCH',
        body: data,
        formData: true
      }),
      invalidatesTags: ['Recruitment']
    }),

    getAllRecruitments: builder.query({
      query: () => ({
        url: `${RECRUITMENT_BASE_URL}/`,
        method: 'GET'
      }),
      providesTags: ['Recruitment']
    }),

    getRecruitment: builder.query({
      query: (id) => ({
        url: `${RECRUITMENT_BASE_URL}/${id}`,
        method: 'GET'
      })
    })

  })
})

export const {
  useSaveRecruitmentMutation,
  useGetAllRecruitmentsQuery,
  useLazyGetRecruitmentQuery,
  useDeleteRecruitmentMutation,
  useEditRecruitmentMutation

} = recruitmentApiSlice
