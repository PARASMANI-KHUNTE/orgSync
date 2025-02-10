import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import Loader from '../../Components/Loader';
import { toast } from 'react-toastify';

const UpdatePassword = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { email, role } = location.state || {};
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call based on role
    try {
      let endpoint = "";
      switch (role) {
        case "admin":
          endpoint = "/superAdmin/updatePassword";
          break;
        case "manager":
          endpoint = "/BranchManager/updatePassword";
          break;
        case "employee":
          endpoint = "/Employee/updatePassword";
          break;
        default:
          throw new Error("Invalid role");
      }

      const response = await api.put(endpoint, { email, password });
  

      if (response.data.success) {
        toast.success(response.data.message);
        navigate('/login');
       
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


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Update Password</h2>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <button type="submit" className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700">
          {loading ? <Loader /> : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

export default UpdatePassword;