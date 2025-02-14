import { useState } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import api from "../../utils/api";
import FaceDetection from "../../Components/FaceDetection";

const Attendance = () => {
  const [embeddings, setEmbeddings] = useState(null);
  const [employee,setEmployee] = useState(null)
 const [data,setData] = useState(null)
  const handelAreadyFace = (employee)=>{
    if(employee){
      setEmployee(employee)
      fetchDepartment(employee)
      console.log(employee)
    }
  }

  const fetchDepartment = async (employee) => {
    if (!employee || !employee.assignedDepartment) {
        console.error("Invalid employee data or missing department ID");
        return;
    }

    try {
        console.log("Fetching department for ID:", employee.assignedDepartment);
        const response = await api.get(`/departments/${employee.assignedDepartment}`); // Using path param

        if (response.data.success) {
          setData(response.data.data || null);
        
        } else {
            console.error("Failed to fetch department:", response.data.message);
            setData(null);
        }
    } catch (error) {
        console.error("Error fetching department:", error.message);
        setData(null);
    }
};

  
 

  const handleFaceDetected = (embeddingData) => {
    if (embeddingData) {
      setEmbeddings(embeddingData);
      if(employee){
        toast.success(`${employee.Name}`)
      }
    } else {
      toast.error("Face detection failed. Please try again.");
    }
  };

  const handleAttendance = async (action) => {
    if (!embeddings) {
      toast.info("Please capture your face first.");
      return;
    }

    try {
      const response = await api.post(`/attendence${action}`, {
        embedding: embeddings,
      });

      toast.success(response.data.message);
      setEmbeddings(null); // Clear embeddings after successful attendance
    } catch (error) {
      toast.error("Error processing attendance. Please try again.");
      console.error(`Error sending embedding for ${action}:`, error);
    }
  };

  return (
    <motion.div
      className="bg-white p-6 rounded-2xl shadow-lg max-w-md mx-auto mt-10"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-4">
        Attendance
      </h2>
 

      {/* Face Detection Component */}
     {!embeddings && ( <div className="flex justify-center mb-6">
        <FaceDetection setEmbeddings={handleFaceDetected} setEmployee={handelAreadyFace} />
      </div>)}

      {/* Show Buttons only when embeddings exist */}
      {embeddings && (
        <motion.div
          className="flex justify-between flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
        {employee && (
  <div className="flex flex-col p-3">
    <h1 className="text-2xl font-bold">Welcome!</h1> 
    <p className="text-2xl">{employee.Name}</p>
    <p className="text-sm">{employee.Email}</p>
    <p className="text-violet-500">{employee.EmployeeID}</p>
    {data && data.Name ? <p>{data.Name}</p> : <p>No department found</p>}

  </div>
)}


         <div className="flex ">
         <motion.button
            onClick={() => handleAttendance("/Checkin")}
            className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-lg shadow-md w-full mx-1"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Check In
          </motion.button>
          <motion.button
            onClick={() => handleAttendance("/CheckOut")}
            className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg shadow-md w-full mx-1"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Check Out
          </motion.button>
         </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Attendance;
