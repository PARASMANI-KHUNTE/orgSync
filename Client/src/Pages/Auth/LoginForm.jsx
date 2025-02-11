import  { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from '../../utils/api'
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
const LoginForm = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("admin"); // Default role
  const [loading, setLoading] = useState(false);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call based on role
    try {
      let endpoint = "";
      switch (role) {
        case "admin":
          endpoint = "/superAdmin/login";
          break;
        case "manager":
          endpoint = "/BranchManager/Login";
          break;
        case "employee":
          endpoint = "/Employee/login";
          break;
        default:
          throw new Error("Invalid role");
      }

      const response = await api.post(endpoint,{
        Email: email,
        Password: password,
      })

      if (response.data.success) {
        login(response.data.token);
        localStorage.setItem("token", response.data.token);
        toast.success(response.data.message);
        if(role == "admin"){
            setTimeout(() => {
                navigate("/dashboard") // Redirect to Dashboard
              }, 1000);
        }else if(role == "manager"){
            setTimeout(() => {
                navigate("/manager-dashboard") // Redirect to Dashboard
              }, 1000);
        }else {
            setTimeout(() => {
                navigate("/employee-dashboard") // Redirect to Dashboard
              }, 1000);
        }
       
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

  // Handle forgot password
  const handleForgotPassword = () => {
    navigate('/reset-password')
    toast.info("Redirecting to forgot password page...");
    // Redirect to forgot password page
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500"
    >
      <motion.form
        whileHover={{ scale: 1.02 }}
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-2xl font-bold text-center text-gray-800 mb-6"
        >
          Login
        </motion.h2>

        {/* Email Field */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-4"
        >
          <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </motion.div>

        {/* Password Field */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-4"
        >
          <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 px-3 py-2 text-sm text-purple-600 hover:text-purple-700"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </motion.div>

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

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition duration-300"
        >
          {loading ? "Logging in..." : "Login"}
        </motion.button>

        {/* Forgot Password Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="mt-4 text-center"
        >
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-purple-600 hover:text-purple-700 underline"
          >
            Forgot Password?
          </button>
        </motion.div>
      </motion.form>
    </motion.div>
  );
};

export default LoginForm;