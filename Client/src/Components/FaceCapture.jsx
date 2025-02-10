import React, { useRef, useState, useEffect } from "react";
import * as faceapi from "face-api.js";
import { motion } from "framer-motion";
import api from "../utils/api";
import { toast } from "react-toastify";
import "@tensorflow/tfjs";


const FaceCapture = ({ handleNext, setEmployeeId }) => {
  const videoRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

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

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      detectFace();
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  const detectFace = async () => {
    if (!modelsLoaded || !videoRef.current) return;
    setInterval(async () => {
      const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
      if (detections) {
        const embedding = Array.from(detections.descriptor);
        sendEmbeddingToBackend(embedding);
      }
    }, 2000);
  };

  const sendEmbeddingToBackend = async (embedding) => {
    try {
      const response = await api.get("/employee/checkFace", { embedding, }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("Face embedding sent successfully:", response.data);
      if (response.data.success) {
        handleNext();
        setEmployeeId(response.data.employeeId);
        toast.success(response.data.message);
      } else {
        toast.error("Face Already Exists");
      }
    } catch (error) {
      console.error("Error sending embedding:", error);
    }
  };

  return (
    <div className="flex flex-col items-center p-4 space-y-4">
      <video ref={videoRef} autoPlay playsInline className="w-full max-w-md rounded-lg shadow-lg" />
      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md" onClick={startCamera}>Start Camera</motion.button>
      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-md" onClick={stopCamera}>Stop Camera</motion.button>
    </div>
  );
};

export default FaceCapture;
