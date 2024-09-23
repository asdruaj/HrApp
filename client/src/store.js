import authReducer from './state'
import bcvReducer from './state/bcvSlice.js'
import { configureStore } from '@reduxjs/toolkit'
import { apiSlice } from './state/apiSlice.js'

import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'

const persistConfig = { key: 'root', storage, version: 1 }

const persistedReducer = persistReducer(persistConfig, authReducer)
const persistedBcvReducer = persistReducer(persistConfig, bcvReducer)

export const store = configureStore({
  reducer: {
    auth: persistedReducer,
    bcv: persistedBcvReducer,
    [apiSlice.reducerPath]: apiSlice.reducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: {
      ignoreActions: [
        FLUSH,
        REHYDRATE,
        PAUSE,
        PERSIST,
        PURGE,
        REGISTER
      ]
    }
  }).concat(apiSlice.middleware),
  devTools: true
})
