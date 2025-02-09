
import { BrowserRouter as Router , Routes , Route } from 'react-router-dom'


import LandingPage from './Pages/LandingPage'
import AdminDashboard from './Pages/AdminDashboard'
import SetPassword from './Components/SetPassword'
import ManagerDashBoard from './Pages/ManagerDashBoard'
import LoginForm from './Pages/Auth/LoginForm'
import EmployeeDashboard from './Pages/EmployeeDashboard'

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

      </Routes>
    </Router>
  )
}

export default App