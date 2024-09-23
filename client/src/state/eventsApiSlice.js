import { apiSlice } from './apiSlice'
import { EVENTS_BASE_URL } from '../utils/const.js'

export const eventApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    saveEvent: builder.mutation({
      query: (data) => ({
        url: `${EVENTS_BASE_URL}/save`,
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Event']
    }),

    deleteEvent: builder.mutation({
      query: (id) => ({
        url: `${EVENTS_BASE_URL}/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Event']
    }),

    editEvent: builder.mutation({
      query: ({ data, id }) => ({
        url: `${EVENTS_BASE_URL}/${id}`,
        method: 'PATCH',
        body: data
      }),
      invalidatesTags: ['Event']
    }),

    getAllEvents: builder.query({
      query: () => ({
        url: `${EVENTS_BASE_URL}/`,
        method: 'GET'
      }),
      providesTags: ['Event']
    }),

    getEvent: builder.query({
      query: (id) => ({
        url: `${EVENTS_BASE_URL}/${id}`,
        method: 'GET'
      })
    })

  })
})

export const {
  useSaveEventMutation,
  useGetAllEventsQuery,
  useLazyGetEventQuery,
  useDeleteEventMutation,
  useEditEventMutation

} = eventApiSlice
