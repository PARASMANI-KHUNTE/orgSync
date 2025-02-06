import React, { useRef, useEffect } from "react";
import * as faceapi from "face-api.js";

const FaceRecognition = ({ onFaceCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
    };

    loadModels();
  }, []);

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => console.error(err));
  };

  const captureFace = async () => {
    if (videoRef.current) {
      const detections = await faceapi.detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks().withFaceDescriptor();

      if (detections) {
        onFaceCapture(detections.descriptor);
      }
    }
  };

  return (
    <div>
      <video ref={videoRef} autoPlay muted></video>
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
      <button onClick={startVideo}>Start Camera</button>
      <button onClick={captureFace}>Capture Face</button>
    </div>
  );
};

export default FaceRecognition;