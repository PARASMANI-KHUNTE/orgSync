// Frontend: SetPassword.jsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from "react-toastify";
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import api from '../utils/api';

const SetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const isFormValid = password.length >= 6 && confirmPassword.length >= 6 && password === confirmPassword;

  const validateAndSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.warn('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      toast.warn('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/branchManager/set-password', { token, password });

      if (response.data.success) {
        toast.success("Password set successfully. You can now login");
        navigate('/', { state: { message: 'Password set successfully. You can now login.' } });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to set password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-center mb-6">Set Your Password</h1>

        <form onSubmit={validateAndSubmit} className="space-y-4">
          <div className="relative">
            <label className="block mb-2">New Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded-lg pr-10"
              required
            />
            <button
              type="button"
              className="absolute top-9 right-3 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
            </button>
          </div>

          <div className="relative">
            <label className="block mb-2">Confirm Password</label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border rounded-lg pr-10"
              required
            />
            <button
              type="button"
              className="absolute top-9 right-3 text-gray-500"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={!isFormValid || loading}
            className={`w-full p-2 rounded-lg text-white transition-colors ${
              isFormValid ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {loading ? 'Setting Password...' : 'Set Password'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default SetPassword;
