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
      className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {step === 1 && (
        <>
          <h2 className="text-xl font-semibold mb-4">Register Employee</h2>
          <input name="EmployeeID" placeholder="Employee ID" onChange={handleChange} className="input" />
          <input name="Name" placeholder="Full Name" onChange={handleChange} className="input" />
          <input name="Email" placeholder="Email" onChange={handleChange} className="input" />
          <input name="Phone" placeholder="Phone" onChange={handleChange} className="input" />
          <input name="Address.city" placeholder="City" onChange={handleChange} className="input" />
          <input name="Address.state" placeholder="State" onChange={handleChange} className="input" />
          <input name="Address.pincode" placeholder="Pincode" onChange={handleChange} className="input" />
          <button onClick={checkData} className="btn-primary">Next</button>
        </>
      )}

      {step === 2 && (
        <>
          <h2 className="text-xl font-semibold mb-4">Verify OTP</h2>
          <input name="otp" placeholder="Enter OTP" onChange={(e) => setOtp(e.target.value)} className="input" />
          <button onClick={verifyOtp} className="btn-primary">Verify</button>
        </>
      )}

      {step === 3 && (
        <>
          <h2 className="text-xl font-semibold mb-4">Set Password</h2>
          <input name="Password" placeholder="Password" type="password" onChange={handleChange} className="input" />
          <button onClick={handleSignup} className="btn-primary">Register</button>
        </>
      )}
    </motion.div>
  );
};

export default RegistrationForm;