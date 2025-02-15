import { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import { toast } from "react-toastify";
import { FaCamera, FaCameraRetro, FaTimes } from "react-icons/fa";
import api from "../utils/api";

const AttendenceFace = ({ setEmbeddings , setEmployee }) => {

  //ml 


  const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
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
  
    const startVideo = () => {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setIsCameraOn(true);
          }
        })
        .catch((err) => console.error("Error starting camera:", err));
    };
  
    const stopVideo = () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
        setIsCameraOn(false);
      }
    };
  
    const captureFace = async () => {
      if (!modelsLoaded) {
        toast("Face detection models are still loading. Please wait.");
        return;
      }
      if (!videoRef.current || !canvasRef.current) return;
  
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = canvas.toDataURL("image/jpeg");
      setCapturedImage(imageData);
      
      try {
        const detection = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();
        
        if (detection) {
           await sendEmbeddingToBackend(detection.descriptor);
      
          stopVideo();
        } else {
          toast.error("No face detected. Please try again.");
        }
      } catch (error) {
        console.error("Error detecting face:", error);
        toast.error("Face detection failed. Ensure models are loaded and try again.");
      }
    };
  
    const sendEmbeddingToBackend = async (embedding) => {
        try {
          const response = await api.post("/employee/checkFace", { embedding });
          
         if (response.data.success){
            toast.info("Face Already Exist")
            setCapturedImage(null)
            if(response.data.employee){
              setEmployee(response.data.employee)
            }
            toast.info("Face Already Exist")
            stopVideo()
          }else{
            setCapturedImage(null)
            setEmbeddings(embedding)
           
            stopVideo()
          }
           // Store employeeId
        } catch (error) {
          console.error("Error sending embedding:", error);
        }
      };
  

  return (
    <>
    <div className=" p-6 rounded-lg shadow-lg flex flex-col items-center space-y-4">
     <video ref={videoRef} autoPlay muted className="w-64 h-64 border rounded" hidden={!isCameraOn}></video>
     <canvas ref={canvasRef} style={{ display: "none" }} />
     {capturedImage && <img src={capturedImage} alt="Captured face" className="w-64 h-64 border rounded" />}
     <div className="flex space-x-4">
       {!isCameraOn ? (
         <button onClick={startVideo} className="bg-green-500 text-white px-4 py-2 rounded"><FaCamera /> </button>
       ) : (
         <button onClick={stopVideo} className="bg-red-500 text-white px-4 py-2 rounded">   <FaTimes /> </button>
       )}
       <button onClick={captureFace} className="bg-blue-500 text-white px-4 py-2 rounded" disabled={!isCameraOn}>
       <FaCameraRetro />
       </button>
     </div>

   </div>
    </>
  );
};

export default AttendenceFace;
