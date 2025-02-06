import { useState } from "react";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import api from '../../utils/api'
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
export default function AdminLogin() {
    const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/superAdmin/login", {
        Email: email,
        Password: password,
      });

      if (response.data.success) {
        login(response.data.token);
        localStorage.setItem("token", response.data.token);
        toast.success(response.data.message);
        setTimeout(() => {
          navigate("/dashboard") // Redirect to Dashboard
        }, 1000);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Login Failed:", error);
      toast.error(error.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex justify-center items-center bg-gradient-to-br from-blue-600 to-purple-800">
      {/* Blur Background */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-lg"></div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 bg-white/20 backdrop-blur-xl shadow-lg rounded-2xl p-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Admin Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-white text-sm font-medium">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-3 bg-white/30 text-white placeholder-white/70 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-white text-sm font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 p-3 bg-white/30 text-white placeholder-white/70 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-4 flex items-center text-white/80"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg shadow-lg transition-all duration-300 hover:bg-purple-700 focus:ring-4 focus:ring-purple-300"
          >
            {loading ? "Logging in..." : "Login"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
