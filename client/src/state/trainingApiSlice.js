import { apiSlice } from './apiSlice'
import { TRAINING_BASE_URL } from '../utils/const.js'

export const trainingApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    saveTraining: builder.mutation({
      query: (data) => ({
        url: `${TRAINING_BASE_URL}/save`,
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Training']
    }),

    deleteTraining: builder.mutation({
      query: (id) => ({
        url: `${TRAINING_BASE_URL}/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Training']
    }),

    editTraining: builder.mutation({
      query: ({ data, id }) => ({
        url: `${TRAINING_BASE_URL}/${id}`,
        method: 'PATCH',
        body: data
      }),
      invalidatesTags: ['Training']
    }),

    getAllTrainings: builder.query({
      query: () => ({
        url: `${TRAINING_BASE_URL}/`,
        method: 'GET'
      }),
      providesTags: ['Training']
    }),

    getTraining: builder.query({
      query: (id) => ({
        url: `${TRAINING_BASE_URL}/${id}`,
        method: 'GET'
      })
    })

  })
})

export const {
  useSaveTrainingMutation,
  useGetAllTrainingsQuery,
  useLazyGetTrainingQuery,
  useDeleteTrainingMutation,
  useEditTrainingMutation

} = trainingApiSlice
