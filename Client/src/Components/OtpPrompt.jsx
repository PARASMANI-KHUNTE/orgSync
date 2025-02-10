import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../utils/api";

const OtpPrompt = () => {
  const [otp, setOtp] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { email, id } = location.state || {};

  const handelDeleteFun = async () => {

    if (!otp || otp.length !== 4) {
      toast.error("Please enter a valid 4-digit OTP.");
      return;
    }

    try {
   
      const verifyOtpResponse = await api.post("employers/verifyOtp", {
        email,
        otp,
      });


      if (!verifyOtpResponse.data.success) {
        toast.error("Invalid OTP. Please try again.");
        return;
      }

      const deleteAccountResponse = await api.delete(`employers/${id}`);


      if (deleteAccountResponse.status === 200) {
        localStorage.removeItem("token");
        toast.success("Your account has been deleted successfully.");
        navigate("/");
      } else {
        toast.error("Failed to delete the account. Please try again.");
      }
    } catch (error) {
      console.log(`Error - ${error}`)
      toast.error("An error occurred. Please try again later.");
    }
  };

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white p-6 rounded-lg shadow-lg w-80 text-center"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <h2 className="text-lg font-semibold mb-2">Enter OTP</h2>
        <p className="text-gray-600 text-sm mb-4">
          Please enter the OTP sent to <strong>{email}</strong>
        </p>

        <input
          type="text"
          value={otp}
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d*$/.test(value) && value.length <= 6) {
              setOtp(value);
            }
          }}
          className="border p-2 w-full rounded text-center text-lg tracking-widest"
          maxLength={4}
          placeholder="••••"
        />

        <div className="flex justify-between mt-4">
          <motion.button
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-all"
            onClick={() => navigate("/client-panel")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Cancel
          </motion.button>

          <motion.button
            className={`px-4 py-2 text-white rounded transition-all ${
              otp.length === 4 ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400"
            }`}
            onClick={handelDeleteFun}
            disabled={otp.length !== 4}
            whileHover={{ scale: otp.length === 4 ? 1.05 : 1 }}
            whileTap={{ scale: otp.length === 4 ? 0.95 : 1 }}
          >
            Submit
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OtpPrompt;
