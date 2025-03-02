
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
import ProtectedRoute from './Components/ProtectedRoute'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<LandingPage />}/>
        <Route path='/login' element={<LoginForm />}/>
        <Route path='/dashboard' element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}/>
        <Route path='/manager-dashboard' element={<ProtectedRoute><ManagerDashBoard /></ProtectedRoute>}/>
        <Route path='/employee-dashboard' element={<ProtectedRoute><EmployeeDashboard /></ProtectedRoute>}/>
        <Route path="/set-password/:token" element={<SetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/update-password" element={<UpdatePassword />} />


      </Routes>
    </Router>
  )
}

export default App