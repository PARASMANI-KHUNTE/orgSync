
import { BrowserRouter as Router , Routes , Route } from 'react-router-dom'


import LandingPage from './Pages/LandingPage'
import AdminDashboard from './Pages/AdminDashboard'
import SetPassword from './Components/SetPassword'
import ManagerDashBoard from './Pages/ManagerDashBoard'
import LoginForm from './Pages/Auth/LoginForm'
import EmployeeDashboard from './Pages/EmployeeDashboard'
import ResetPassword from './Pages/Auth/ResetPassword'
import VerifyOtp from './Pages/Auth/VerifyOtp'
import UpdatePassword from './Pages/Auth/UpdatePassword'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<LandingPage />}/>
        <Route path='/login' element={<LoginForm />}/>
        <Route path='/dashboard' element={<AdminDashboard />}/>
        <Route path='/organization' element={<AdminDashboard />}/>
        <Route path='/employees' element={<AdminDashboard />}/>
        <Route path='/profile' element={<AdminDashboard />}/>
        <Route path='/settings' element={<AdminDashboard />}/>
        <Route path='/manager-dashboard' element={<ManagerDashBoard />}/>
        <Route path='/employee-dashboard' element={<EmployeeDashboard />}/>
        <Route path="/set-password/:token" element={<SetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/update-password" element={<UpdatePassword />} />

      </Routes>
    </Router>
  )
}

export default App