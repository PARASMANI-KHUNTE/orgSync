
import { BrowserRouter as Router , Routes , Route } from 'react-router-dom'


import LandingPage from './Pages/LandingPage'
import AdminLogin from './Pages/Auth/AdminLogin'
import BranchManager from './Pages/Auth/BranchManager'
import EmployeeLogin from './Pages/Auth/EmployeeLogin'
import AdminDashboard from './Pages/AdminDashboard'
import SetPassword from './Components/SetPassword'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<LandingPage />}/>
        <Route path='/login-admin' element={<AdminLogin />}/>
        <Route path='/login-branch' element={<BranchManager />}/>
        <Route path='/login-employee' element={<EmployeeLogin />}/>
        <Route path='/dashboard' element={<AdminDashboard />}/>
        <Route path='/organization' element={<AdminDashboard />}/>
        <Route path='/employees' element={<AdminDashboard />}/>
        <Route path='/profile' element={<AdminDashboard />}/>
        <Route path='/settings' element={<AdminDashboard />}/>
        <Route path="/set-password/:token" element={<SetPassword />} />

      </Routes>
    </Router>
  )
}

export default App