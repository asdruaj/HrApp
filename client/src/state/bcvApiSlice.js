import { apiSlice } from './apiSlice'
import { setBcv, setError } from './bcvSlice'

export const bcvApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBcv: builder.query({
      query: () => ({
        url: '/api/bcv',
        method: 'GET'
      }),
      async onQueryStarted (id, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(setBcv(data))
        } catch (error) {
          dispatch(setError('Error: No se pudo obtener el valor.'))
        }
      }
    })
  })
})

export const {
  useGetBcvQuery,
  useLazyGetBcvQuery
} = bcvApiSlice
