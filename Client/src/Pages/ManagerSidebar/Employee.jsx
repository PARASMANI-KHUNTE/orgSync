// import { useNavigate } from "react-router-dom";
import  { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import { toast } from 'react-toastify';
import api from "../../utils/api";
import * as tf from '@tensorflow/tfjs';
import FaceDetection from "../../Components/FaceDetection";
const Employee= () => {
  const [currentStep, setCurrentStep] = useState(1);
  const handleNext = () => {

    setCurrentStep((prevStep) => prevStep + 1);
  };
  const [newEmployee,setNewEmployee] = useState(null)
  const handelAddEmployee = async ()=>{
    if(newEmployee){
      setNewEmployee(false)
    }else{
      setNewEmployee(true)
    }
    
  }
   
  
    const sendEmbeddingToBackend = async (embedding) => {
        try {
          console.log("trying to send data",embedding)
          const response = await api.post("/employee/checkFace", { embedding 
          });
          console.log("Face embedding sent successfully:", response.data);
         if (response.data.success == true){
            handleNext()
            setCapturedImage(null)
            toast.success(response.data.message)
          }else{
            toast.error(`Face Already Exist`)
            setCapturedImage(null)
          }
           // Store employeeId
        } catch (error) {
          console.error("Error sending embedding:", error);
        }
      };
  

  return (
 <>
   <div className="flex flex-col gap-2  p-6 rounded-lg shadow-lg">
   <div className="bg-white p-6 rounded-lg shadow-lg">
      <nav className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Add Employee </h2>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-all"
          onClick={handelAddEmployee}
        >
          Add Employee
        </button>
      </nav>
      <p className="text-gray-600">Manage your employees here.</p>
    </div>
  { newEmployee && 
     <FaceDetection />
  }

   </div>
    
 </>
  );
};

export default Employee;

