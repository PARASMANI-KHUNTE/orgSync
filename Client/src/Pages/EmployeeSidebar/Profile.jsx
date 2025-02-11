import { useState } from "react";
import api from "../../utils/api";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext"; // Adjust the import path as needed
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
const Profile = () => {
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!user) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
        <p>Loading profile...</p>
      </div>
    );
  }

  const handleSendOtp = async () => {
    try {
      setLoading(true);
      const response = await api.post("/services/sendOtp", { email: user.userEmail });
      if (response.data.success) {
        setStep(2); // Set step before showing toast
        toast.success("OTP sent to your email");
      } else {
        toast.error("Failed to send OTP");
      }
    } catch (error) {
      toast.error("Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      toast.error("Please enter OTP");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/services/verify-otp", { email: user.userEmail, otp });
      if (response.data.success) {
        setStep(3); // Set step before showing toast
        toast.success("OTP verified! Enter new password.");
      } else {
        toast.error("Invalid OTP");
      }
    } catch (error) {
      toast.error("OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!password.trim()) {
      toast.error("Please enter a password");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/superadmin/update-password", {Password : password });
      if (response.data.success) {
        toast.success("Password updated successfully!");
        // Reset all states
        setStep(1);
        setPassword("");
        setOtp("");
      } else {
        toast.error("Failed to update password");
      }
    } catch (error) {
      toast.error("Error updating password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-xl border border-gray-200"
    >
      {/* Profile Header */}
      <div className="flex items-center space-x-4 mb-4">
        <FaUser className="text-blue-600 text-4xl" />
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">{user.userName}</h2>
          <p className="text-gray-500">{user.userEmployeeID}</p>
        </div>
      </div>

      {/* Profile Details */}
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <FaEnvelope className="text-blue-500 text-lg" />
          <p className="text-gray-700">{user.userEmail}</p>
        </div>

        <div className="flex items-center space-x-3">
          <FaPhone className="text-green-500 text-lg" />
          <p className="text-gray-700">{user.userPhone}</p>
        </div>

        <div className="flex items-start space-x-3">
          <FaMapMarkerAlt className="text-red-500 text-lg mt-1" />
          <div className="text-gray-700">
            <p>{user.Address.city}, {user.Address.state}</p>
            <p>Pincode: {user.Address.pincode}</p>
          </div>
        </div>
      </div>
    </motion.div>
      

      <div className="mt-6">
        {/* Progress indicator */}
        <div className="mb-6 flex justify-center">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`w-16 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`w-3 h-3 rounded-full ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          </div>
        </div>

        {/* Step 1: Update Password Button */}
        {step === 1 && (
          <motion.button
            onClick={handleSendOtp}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-blue-400"
          >
            {loading ? "Sending OTP..." : "Update Password"}
          </motion.button>
        )}

        {/* Step 2: Enter OTP */}
        {step === 2 && (
          <div>
            <label className="block text-gray-700 mb-2">Enter OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-2 border rounded-lg mb-4"
              placeholder="Enter OTP sent to your email"
              disabled={loading}
            />
            <motion.button
              onClick={handleVerifyOtp}
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-300 disabled:bg-green-400"
            >
              {loading ? "Verifying OTP..." : "Verify OTP"}
            </motion.button>
          </div>
        )}

        {/* Step 3: Enter New Password */}
        {step === 3 && (
          <div>
            <label className="block text-gray-700 mb-2">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded-lg mb-4"
                placeholder="Enter new password"
                disabled={loading}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 cursor-pointer text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            <motion.button
              onClick={handleUpdatePassword}
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition duration-300 disabled:bg-purple-400"
            >
              {loading ? "Updating Password..." : "Update Password"}
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Profile;