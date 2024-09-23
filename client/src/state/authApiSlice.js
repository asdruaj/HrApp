import { apiSlice } from './apiSlice'
import { AUTH_BASE_URL } from '../utils/const.js'

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: `${AUTH_BASE_URL}/login`,
        method: 'POST',
        body: data
      })
    }),
    register: builder.mutation({
      query: ({ token, data }) => ({
        url: `${AUTH_BASE_URL}/register/${token}`,
        method: 'POST',
        body: data,
        formData: true

      })
    }),
    getTokenData: builder.query({
      query: (token) => ({
        url: `${AUTH_BASE_URL}/linkTokenData/${token}`,
        method: 'GET'
      })
    }),
    generateLink: builder.mutation({
      query: (data) => ({
        url: `${AUTH_BASE_URL}/generate-templink`,
        method: 'POST',
        body: data,
        formData: true

      })
    }),
    logout: builder.mutation({
      query: () => ({
        url: `${AUTH_BASE_URL}/logout`,
        method: 'POST'
      })
    }),
    verifyLogin: builder.mutation({
      query: () => ({
        url: `${AUTH_BASE_URL}/verifyToken`,
        method: 'POST'
      })
    })
  })
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetTokenDataQuery,
  useGenerateLinkMutation,
  useLogoutMutation,
  useVerifyLoginMutation
} = userApiSlice
