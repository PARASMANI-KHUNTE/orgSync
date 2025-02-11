import { useState } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import api from "../../utils/api";
import FaceDetection from "../../Components/FaceDetection";

const Attendance = () => {
  const [embeddings, setEmbeddings] = useState(null);

  const handleFaceDetected = (embeddingData) => {
    if (embeddingData) {
      setEmbeddings(embeddingData);
      toast.success("Face detected successfully! Proceeding to attendance.");
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
      <p className="text-gray-600 text-center mb-6">
        Scan your face to mark attendance.
      </p>

      {/* Face Detection Component */}
      <div className="flex justify-center mb-6">
        <FaceDetection setEmbeddings={handleFaceDetected} />
      </div>

      {/* Show Buttons only when embeddings exist */}
      {embeddings && (
        <motion.div
          className="flex justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
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
        </motion.div>
      )}
    </motion.div>
  );
};

export default Attendance;
