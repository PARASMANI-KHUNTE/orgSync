import { useRef, useState, useEffect } from "react";
import * as faceapi from "face-api.js";
import { toast } from "react-toastify";

const FaceDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [isStreamActive, setIsStreamActive] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoading(true);
        const MODEL_URL = "/weights";
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        
        toast.success("Models loaded successfully!");
      } catch (error) {
        toast.error("Error loading models. Please refresh the page.");
        console.error("Error loading models:", error);
      } finally {
        setLoading(false);
      }
    };

    loadModels();

    // Cleanup function
    return () => {
      stopVideo();
    };
  }, []);

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640,
          height: 480,
          facingMode: "user"
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreamActive(true);
        toast.success("Camera started!");
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error(
        error.name === "NotAllowedError" 
          ? "Camera access denied. Please enable camera permissions."
          : "Error starting camera. Please try again."
      );
    }
  };

  const stopVideo = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      streamRef.current = null;
      setIsStreamActive(false);
      
      // Clear canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
      
      toast.info("Camera stopped");
    }
  };

  const detectFace = async () => {
    if (!videoRef.current || !isStreamActive) {
      toast.warning("Please start the camera first!");
      return;
    }

    try {
      const detections = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detections) {
        drawDetection(detections);
        await sendEmbedding(detections.descriptor);
      } else {
        toast.warning("No face detected. Please ensure your face is visible.");
      }
    } catch (error) {
      console.error("Error detecting face:", error);
      toast.error("Error during face detection");
    }
  };

  const drawDetection = (detection) => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const displaySize = {
      width: videoRef.current.videoWidth,
      height: videoRef.current.videoHeight
    };

    // Match canvas size to video
    canvas.width = displaySize.width;
    canvas.height = displaySize.height;

    // Clear previous drawings
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw new detections
    const resizedDetection = faceapi.resizeResults(detection, displaySize);
    faceapi.draw.drawDetections(canvas, resizedDetection);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetection);
  };

  const sendEmbedding = async (embedding) => {
    try {
      const response = await fetch("/api/save-face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embedding: Array.from(embedding) })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      toast.success("Face embedding saved successfully!");
    } catch (error) {
      console.error("Error sending embedding:", error);
      toast.error("Failed to save face embedding");
    }
  };

  return (
    <div className="flex flex-col items-center p-4 space-y-6">
      <h1 className="text-2xl font-bold">Face Detection</h1>
      
      {loading ? (
        <div className="text-center py-4">
          <p className="text-gray-600">Loading models...</p>
        </div>
      ) : (
        <>
          <div className="relative w-[640px] h-[480px] bg-gray-100 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
            />
          </div>

          <div className="flex space-x-4">
            {!isStreamActive ? (
              <button
                onClick={startVideo}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors"
                disabled={loading}
              >
                Start Camera
              </button>
            ) : (
              <button
                onClick={stopVideo}
                className="px-6 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition-colors"
              >
                Stop Camera
              </button>
            )}

            <button
              onClick={detectFace}
              className="px-6 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition-colors"
              disabled={!isStreamActive}
            >
              Detect Face
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default FaceDetection;