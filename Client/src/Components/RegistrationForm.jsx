import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import api from "../utils/api";

const RegistrationForm = ({ embeddings  , setForm }) => {
  const [formData, setFormData] = useState({
    EmployeeID: "",
    Name: "",
    Email: "",
    Phone: "",
    Address: { city: "", state: "", pincode: "" },
    Password: "",
  });
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1: Form, 2: OTP, 3: Password

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("Address.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({ ...prev, Address: { ...prev.Address, [key]: value } }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const checkData = async () => {
    try {
      console.log(formData)
      const response = await api.get("employee/checkdata", { params: formData });
 
      if (!response.data.exists) {
        await api.post('/services/sendOtp',{ email : formData.Email});
        setStep(2);
        toast.success("OTP sent to email!");
      } else {
        toast.error("Employee already exists!");
      }
    } catch (error) {
      toast.error("Error checking data!");
    }
  };

  const verifyOtp = async () => {
    try {
      const response = await api.post('/services/verify-otp',{email : formData.Email, otp});
      if (response.data.success) {
        setStep(3);
        toast.success("OTP Verified! Set your password.");
      } else {
        toast.error("Invalid OTP!");
      }
    } catch (error) {
      toast.error("OTP verification failed!");
    }
  };

  const handleSignup = async () => {
    try {
      const finalData = { ...formData, FaceEmbeddings: embeddings.map(num => parseFloat(num)) };
      await api.post("/employee/Signup", finalData);
      toast.success("Employee registered successfully!");
      setFormData(false)
      handleRegistrationSuccess()
    } catch (error) {
      toast.error("Signup failed!");
    }
  };

  const handleRegistrationSuccess = () => {
    setForm(false);  // This will hide the form
  };
  

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md mx-auto border border-gray-100"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {step === 1 && (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Register Employee</h2>
            <div className="space-y-4">
              <input
                name="EmployeeID"
                placeholder="Employee ID"
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-gray-600 placeholder-gray-400"
              />
              <input
                name="Name"
                placeholder="Full Name"
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-gray-600 placeholder-gray-400"
              />
              <input
                name="Email"
                placeholder="Email"
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-gray-600 placeholder-gray-400"
              />
              <input
                name="Phone"
                placeholder="Phone"
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-gray-600 placeholder-gray-400"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="Address.city"
                  placeholder="City"
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-gray-600 placeholder-gray-400"
                />
                <input
                  name="Address.state"
                  placeholder="State"
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-gray-600 placeholder-gray-400"
                />
              </div>
              <input
                name="Address.pincode"
                placeholder="Pincode"
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-gray-600 placeholder-gray-400"
              />
              <button
                onClick={checkData}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                Next
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Verify OTP</h2>
            <div className="space-y-4">
              <input
                name="otp"
                placeholder="Enter OTP"
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-gray-600 placeholder-gray-400"
              />
              <button
                onClick={verifyOtp}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                Verify
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Set Password</h2>
            <div className="space-y-4">
              <input
                name="Password"
                placeholder="Password"
                type="password"
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-gray-600 placeholder-gray-400"
              />
              <button
                onClick={handleSignup}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                Register
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default RegistrationForm;