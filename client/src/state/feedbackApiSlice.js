import { apiSlice } from './apiSlice'
import { FEEDBACK_BASE_URL } from '../utils/const.js'

export const feedbackApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    saveFeedback: builder.mutation({
      query: (data) => ({
        url: `${FEEDBACK_BASE_URL}/save`,
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Feedback']
    }),

    deleteFeedback: builder.mutation({
      query: (id) => ({
        url: `${FEEDBACK_BASE_URL}/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Feedback']
    }),

    editFeedback: builder.mutation({
      query: ({ data, id }) => ({
        url: `${FEEDBACK_BASE_URL}/${id}`,
        method: 'PATCH',
        body: data
      }),
      invalidatesTags: ['Feedback']
    }),

    getAllFeedbacks: builder.query({
      query: () => ({
        url: `${FEEDBACK_BASE_URL}/`,
        method: 'GET'
      }),
      providesTags: ['Feedback']
    }),

    getFeedback: builder.query({
      query: (id) => ({
        url: `${FEEDBACK_BASE_URL}/${id}`,
        method: 'GET'
      })
    })

  })
})

export const {
  useSaveFeedbackMutation,
  useGetAllFeedbacksQuery,
  useLazyGetFeedbackQuery,
  useDeleteFeedbackMutation,
  useEditFeedbackMutation

} = feedbackApiSlice
