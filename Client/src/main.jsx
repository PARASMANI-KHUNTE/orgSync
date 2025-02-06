import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from "./context/AuthContext"; // Import the provider
import { ToastContainer} from 'react-toastify';
createRoot(document.getElementById('root')).render(
  <StrictMode>
     <AuthProvider>
    <App />
    <ToastContainer />
  </AuthProvider>
  </StrictMode>,
)
