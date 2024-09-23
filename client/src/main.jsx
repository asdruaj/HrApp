import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider
} from 'react-router-dom'
import App from './App.jsx'
import './index.css'

import { Provider } from 'react-redux'
import { store } from './store.js'
import { PersistGate } from 'redux-persist/integration/react'
import { persistStore } from 'redux-persist'

import LoginScreen from './screens/LoginScreen.jsx'
import RegisterScreen from './screens/RegisterScreen.jsx'
import ErrorScreen from './screens/ErrorScreen.jsx'
import DashboardScreen from './screens/DashboardScreen.jsx'
import EmployeesScreen from './screens/EmployeesScreen.jsx'
import RecruitmentScreen from './screens/RecruitmentScreen.jsx'
import SalaryScreen from './screens/SalaryScreen.jsx'
import SalaryByEmployee from './screens/SalaryByEmployee.jsx'
import EventsScreen from './screens/EventsScreen.jsx'
import AbsenteeismScreen from './screens/AbsenteeismScreen.jsx'
import TrainingScreen from './screens/TrainingScreen.jsx'
import FeedbackScreen from './screens/FeedbackScreen.jsx'
import ProfileScreen from './screens/ProfileScreen.jsx'
import PrivateRoute from './components/PrivateRoute.jsx'
import UsersScreen from './screens/UsersScreen.jsx'
import EmployeeRegister from './screens/EmployeeRegister.jsx'
import EmployeeScreen from './screens/EmployeeScreen.jsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path='/' errorElement={<ErrorScreen />} element={<App />}>
        <Route element={<PrivateRoute />}>
          <Route index path='/' element={<DashboardScreen />} />
          <Route path='/employees' element={<EmployeesScreen />} />
          <Route path='/employee/:id' element={<EmployeeScreen />} />
          <Route path='/employees/new' element={<EmployeeRegister />} />
          <Route path='/employees/edit/:id' element={<EmployeeRegister />} />
          <Route path='/recruitment' element={<RecruitmentScreen />} />
          <Route path='/salary' element={<SalaryScreen />} />
          <Route path='/salary/:id' element={<SalaryByEmployee />} />
          <Route path='/calendar/events' element={<EventsScreen />} />
          <Route path='/calendar/absenteeism' element={<AbsenteeismScreen />} />
          <Route path='/training' element={<TrainingScreen />} />
          <Route path='/feedback' element={<FeedbackScreen />} />
          <Route path='/profile' element={<ProfileScreen />} />
          <Route path='/users' element={<UsersScreen />} />
        </Route>
      </Route>
      <Route path='/login' element={<LoginScreen />} />
      <Route path='/register/:token' element={<RegisterScreen />} errorElement={<errorElement />} />
    </>
  )
)

ReactDOM.createRoot(document.getElementById('root')).render(

  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistStore(store)}>

        <RouterProvider router={router} />
      </PersistGate>
    </Provider>
  </React.StrictMode>

)
