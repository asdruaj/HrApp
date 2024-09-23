import { apiSlice } from './apiSlice'
import { USERS_BASE_URL } from '../utils/const.js'

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => ({
        url: `${USERS_BASE_URL}/all`,
        method: 'GET'
      }),
      providesTags: ['User']
    }),
    getUser: builder.query({
      query: (id) => ({
        url: `${USERS_BASE_URL}/${id}`,
        method: 'GET'
      })
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `${USERS_BASE_URL}/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['User']
    }),
    updateUser: builder.mutation({
      query: ({ id, data }) => ({
        url: `${USERS_BASE_URL}/${id}`,
        method: 'PATCH',
        body: data
      }),
      invalidatesTags: ['User']
    })
  })
})

export const {
  useGetUsersQuery,
  useLazyGetUserQuery,
  useDeleteUserMutation,
  useUpdateUserMutation
} = authApiSlice
