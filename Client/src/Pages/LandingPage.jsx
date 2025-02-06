import { motion } from "framer-motion";

import {

  FaChartLine,
  FaUsers,
  FaFileExport,

} from "react-icons/fa";
import Navbar from "../Components/Navbar";
const LandingPage = () => {

  return (
    <div className="bg-white text-gray-900 font-sans overflow-hidden">
      {/* Abstract Shapes */}
      <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden">
        {/* Animated Gradient Circles */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
          className="absolute w-96 h-96 bg-gradient-to-r from-blue-400 via-purple-300 to-pink-400 rounded-full blur-3xl -top-20 -left-20"
        ></motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", delay: 1 }}
          className="absolute w-96 h-96 bg-gradient-to-r from-purple-400 via-pink-300 to-blue-400 rounded-full blur-3xl -bottom-20 -right-20"
        ></motion.div>
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="h-screen flex items-center justify-center relative z-10">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
              Revolutionize Employee Attendance Tracking
            </h1>
            <p className="text-lg md:text-xl text-gray-700">
              FaceTrack uses advanced facial recognition to automate attendance and
              generate detailed reports.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition duration-300"
            >
              Get Started
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      
      <section className="py-20 bg-gray-100 relative z-10">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 mb-6">
              About FaceTrack
            </h2>
            <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto">
              FaceTrack is a cutting-edge solution for managing employee attendance. It
              uses facial recognition technology to track attendance automatically and
              provides employers with tools to manage and generate detailed reports.
            </p>
          </motion.div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white p-6 rounded-lg shadow-lg text-center relative overflow-hidden"
            >
              <div className="absolute w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 -top-12 -right-12"></div>
              <FaChartLine className="text-4xl text-blue-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-blue-500 mb-2">Real-Time Tracking</h3>
              <p className="text-gray-700">
                Track employee attendance in real-time using facial recognition.
              </p>
            </motion.div>
            {/* Feature 2 */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white p-6 rounded-lg shadow-lg text-center relative overflow-hidden"
            >
              <div className="absolute w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20 -top-12 -right-12"></div>
              <FaUsers className="text-4xl text-blue-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-blue-500 mb-2">Employee Management</h3>
              <p className="text-gray-700">
                Easily manage employee profiles and attendance records.
              </p>
            </motion.div>
            {/* Feature 3 */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white p-6 rounded-lg shadow-lg text-center relative overflow-hidden"
            >
              <div className="absolute w-24 h-24 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full opacity-20 -top-12 -right-12"></div>
              <FaFileExport className="text-4xl text-blue-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-blue-500 mb-2">Generate Reports</h3>
              <p className="text-gray-700">
                Export detailed attendance reports for payroll and analysis.
              </p>
            </motion.div>
          </div>
        </div>
      </section> 

      {/* Footer */}
      <footer className="bg-gray-200 py-10 relative z-10">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-700">
            &copy; {new Date().getFullYear()} FaceTrack. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
