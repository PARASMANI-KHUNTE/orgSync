import  { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Loader from '../../Components/Loader';
import { toast } from 'react-toastify';
import { motion } from "framer-motion";
const ResetPassword = () => {
  const [role, setRole] = useState("admin"); // Default role
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();




  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call based on role
    try {
      let endpoint = "";
      switch (role) {
        case "admin":
          endpoint = "/superAdmin/reset-password";
          break;
        case "manager":
          endpoint = "/BranchManager/reset-password";
          break;
        case "employee":
          endpoint = "/Empoloyee/reset-password";
          break;
        default:
          throw new Error("Invalid role");
      }

      const response = await api.post(endpoint,{
         email
      })

      if (response.data.success) {
        toast.success(response.data.message);
        navigate('/verify-otp', { state: { email , role} });
       
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   try {
  //     const response = await api.post('users/reset-password', { email });
  //     toast.success(response.data.message);
  //     navigate('/verify-otp', { state: { email, context: 'resetpassword' } });
  //   } catch (error) {
  //     console.error(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
          {/* Role Selection */}
          <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mb-6"
        >
          <label htmlFor="role" className="block text-gray-700 font-medium mb-1">
            Role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
          </select>
        </motion.div>
        <button type="submit" className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700">
          {loading ? <Loader /> : 'Reset Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;