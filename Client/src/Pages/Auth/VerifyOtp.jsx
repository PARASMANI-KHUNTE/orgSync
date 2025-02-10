import  { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import Loader from '../../Components/Loader';
import { toast } from 'react-toastify';

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { email , role } = location.state || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !otp) {
      toast.error('Email and OTP are required.');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/services/verify-otp', { email, otp });
      toast.success(response.data.message);
      if (response.data.success) {
        toast.info(response.data.message)
        navigate('/update-password', { state: { email , role } });
      } else  {
        toast.error(response.data.message)
        navigate('/');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Verify OTP</h2>
        <input
          type="text"
          placeholder="OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <button type="submit" className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700">
          {loading ? <Loader /> : 'Verify OTP'}
        </button>
      </form>
    </div>
  );
};

export default VerifyOtp;