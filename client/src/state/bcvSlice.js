import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  rates: {},
  error: null,
  isBcvLoading: true
}

export const bcvSlice = createSlice({
  name: 'bcv',
  initialState,
  reducers: {
    setBcv: (state, action) => {
      state.isBcvLoading = true
      state.rates = action.payload
      state.isBcvLoading = false
    },
    setError: (state, action) => {
      state.isBcvLoading = true
      state.error = action.payload
      state.isBcvLoading = false
    }
  }
})

export const { setBcv, setError } = bcvSlice.actions

export default bcvSlice.reducer
