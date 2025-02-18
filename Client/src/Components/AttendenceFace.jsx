import { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import { toast } from "react-toastify";
import { FaCamera, FaTimes } from "react-icons/fa";
import api from "../utils/api";
import { motion } from "framer-motion";

const AttendanceFace = () => {
  const videoRef = useRef(null);
  const [embeddings, setEmbeddings] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [department, setDepartment] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [detectionInterval, setDetectionInterval] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/weights");
        await faceapi.nets.faceLandmark68Net.loadFromUri("/weights");
        await faceapi.nets.faceRecognitionNet.loadFromUri("/weights");
        console.log("Models loaded successfully");
        setModelsLoaded(true);
      } catch (error) {
        console.error("Error loading models:", error);
      }
    };
    loadModels();
    
  }, []);

  const resetStates = () => {
    setEmbeddings(null);
    setEmployee(null);
    setDepartment(null);
    setIsProcessing(false);
  };

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOn(true);
        startFaceDetection();
      }
    } catch (err) {
      console.error("Error starting camera:", err);
      toast.error("Could not start the camera.");
    }
  };

  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  
    if (detectionInterval) {
      clearInterval(detectionInterval);
      setDetectionInterval(null);
    }
  };

  const handleAttendance = async (embedding) => { 
    setIsProcessing(true);
    try {
      console.log("Sending API request to:", `/api/attendence/checkInOut`);
      const response = await api.post(`/attendence/checkInOut`, {
        embedding: embedding,
      });
      console.log("API Response:", response);
      toast.success(response.data.message);
      
      // Wait for 3 seconds before resetting and restarting
      setTimeout(() => {
        resetStates();
        startVideo();
      }, 13000);

    } catch (error) {
      console.error("API Error:", error.response?.data || error);
      toast.error("Error processing attendance. Please try again.");
      // If there's an error, still reset and restart after 3 seconds
      setTimeout(() => {
        resetStates();
        startVideo();
      }, 3000);
    }
  };

  const startFaceDetection = () => {
    if (!modelsLoaded) {
      toast("Face detection models are still loading. Please wait.");
      return;
    }
  
    if (!videoRef.current || !videoRef.current.srcObject) {
      console.error("Video element is not ready for detection.");
      return;
    }
  
    const interval = setInterval(async () => {
      if (isProcessing) return; // Skip detection if currently processing

      try {
        const detection = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();
  
        if (detection && detection.descriptor) {
          stopVideo();
          await sendEmbeddingToBackend(detection.descriptor);
        } else {
          console.error("No face descriptor found.");
        }
      } catch (error) {
        stopVideo();
        console.error("Error detecting face:", error);
      }
    }, 1000);
  
    setDetectionInterval(interval);
  };

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

  const sendEmbeddingToBackend = async (embedding) => {
    try {
      const response = await api.post("/employee/checkFace", { embedding });
  
      if (response.data.success) {
        setEmbeddings(embedding);
        if (response.data.employee) {
          setEmployee(response.data.employee);
          await fetchDepartment(response.data.employee);
          await handleAttendance(embedding);
        }
      } else {
        toast.error("Face not recognized.");
        // Reset and restart camera after 3 seconds if face is not recognized
        setTimeout(() => {
          resetStates();
          startVideo();
        }, 3000);
      }
    } catch (error) {
      console.error("Error sending embedding:", error);
      toast.error("Error processing face data.");
      // Reset and restart camera after 3 seconds on error
      setTimeout(() => {
        resetStates();
        startVideo();
      }, 3000);
    }
  };

  return (
    <div className="p-6 rounded-lg shadow-lg flex flex-col items-center space-y-4">
      <video ref={videoRef} autoPlay muted className="w-64 h-64 border rounded" hidden={!isCameraOn}></video>
      <div className="flex space-x-4">
        {!isCameraOn && !isProcessing ? (
          <button onClick={startVideo} className="bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2">
            <FaCamera /> Start Camera
          </button>
        ) : (
          <button onClick={stopVideo} className="bg-red-500 text-white px-4 py-2 rounded flex items-center gap-2">
            <FaTimes /> Stop Camera
          </button>
        )}
      </div>
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
    </div>
  );
};

export default AttendanceFace;