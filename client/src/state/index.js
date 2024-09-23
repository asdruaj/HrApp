import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null,
  token: null

}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLogin: (state, action) => {
      state.user = action.payload.userObject
      state.token = action.payload.token
    },
    setRegister: (state, action) => {
      state.user = action.payload.savedUser
      state.token = action.payload.token
    },

    setLogout: (state) => {
      state.user = null
      state.token = null
    }
  }
})

export const { setLogin, setRegister, setTempLink, setLogout } = authSlice.actions

export default authSlice.reducer
