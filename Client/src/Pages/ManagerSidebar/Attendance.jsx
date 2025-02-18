import { useState } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import api from "../../utils/api";
import AttendenceFace from "../../Components/AttendenceFace";

const Attendance = () => {
  const [mode, setMode] = useState(null); // 'checkin' or 'checkout'
  const [embeddings, setEmbeddings] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [department, setDepartment] = useState(null);

  const handleRecognizedFace = async (recognizedEmployee) => {
    if (recognizedEmployee) {
      setEmployee(recognizedEmployee);
      await fetchDepartment(recognizedEmployee);
      toast.success(`Welcome, ${recognizedEmployee.Name}!`);
      
      if (mode) {  // Ensure mode is set
        handleAttendance(mode);
      }
    }else{
      console.log("Embedings not found")
    }
  };


  // Fetch department details
  const fetchDepartment = async (employee) => {
    if (!employee?.assignedDepartment) return;

    try {
      const response = await api.get(`/departments/${employee.assignedDepartment}`);
      if (response.data.success) {
        setDepartment(response.data.data || null);
      } else {
        setDepartment(null);
      }
    } catch (error) {
      console.error("Error fetching department:", error);
      setDepartment(null);
    }
  };

  const handleAttendance = async (action) => { 
    try {
      console.log("Sending API request to:", `/api/attendence/${action}`);
      const response = await api.post(`/attendence/${action}`, {
        embedding: embeddings,
      });
      console.log("API Response:", response);
      toast.success(response.data.message);
    } catch (error) {
      console.error("API Error:", error.response?.data || error);
      toast.error("Error processing attendance. Please try again.");
    }
  };
  const handleFaceDetected = (embeddingData) => {
    console.log(embeddingData)
    if (embeddingData) {
      setEmbeddings(embeddingData);
    
      toast.success("Face detected successfully! Proceeding to Attendence.");
    } else {
      toast.error("Face detection failed. Please try again.");
    }
  };


  return (
    <motion.div
      className="bg-white p-6 rounded-2xl shadow-lg max-w-md mx-auto mt-10"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-4">Attendance</h2>

      {/* Buttons to Start Face Detection */}
      {!mode && (
        <div className="flex gap-4 justify-center mb-6">
          <motion.button
            onClick={() => setMode("Checkin")}
            className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-lg shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Check-In
          </motion.button>
          <motion.button
            onClick={() => setMode("CheckOut")}
            className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Check-Out
          </motion.button>
        </div>
      )}

      {/* Face Detection Component */}
      {mode && !embeddings && (
        <div className="flex justify-center mb-6">
          <AttendenceFace setEmbeddings={handleFaceDetected} setEmployee={handleRecognizedFace} />
        </div>
      )}

      {/* Show Details & Buttons After Recognition */}
      {embeddings && employee && (
        <motion.div
          className="flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-3">
            <h1 className="text-2xl font-bold">Welcome!</h1>
            <p className="text-xl">{employee.Name}</p>
            <p className="text-sm">{employee.Email}</p>
            <p className="text-violet-500">{employee.EmployeeID}</p>
            {department ? <p>{department.Name}</p> : <p>No department found</p>}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Attendance;
