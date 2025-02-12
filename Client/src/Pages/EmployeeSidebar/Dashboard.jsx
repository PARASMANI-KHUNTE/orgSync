import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../utils/api";
import { FaClock, FaCalendarAlt } from "react-icons/fa";

const Dashboard = () => {
  const [attendance, setAttendance] = useState([]);
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await api.get(`/attendence/getAttendanceById`);

      if (response.data.success) {
        setAttendance(response.data.AttendanceRecord?.checkInOut || []);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
  };

  // Filter attendance based on selected date
  const filteredAttendance = dateFilter
    ? attendance.filter(entry => entry.date.startsWith(dateFilter))
    : attendance;

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-full mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Employee Attendance</h2>

      {/* Date Filter */}
      <div className="flex items-center space-x-2 mb-4">
        <FaCalendarAlt className="text-blue-500" />
        <input
          type="date"
          className="p-2 border rounded-md w-1/3 dark:bg-gray-800 dark:text-white"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
      </div>

      {/* Attendance List */}
      <div className="space-y-4">
        {filteredAttendance.length > 0 ? (
          filteredAttendance.map((entry, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md flex justify-between items-center"
            >
              <div>
                <p className="text-gray-800 dark:text-white font-semibold">{new Date(entry.date).toLocaleDateString()}</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Worked: {entry.hours.toFixed(2)} hours</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <FaClock className="text-green-500" />
                  <span className="text-gray-800 dark:text-white">{new Date(entry.checkIn).toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaClock className="text-red-500" />
                  <span className="text-gray-800 dark:text-white">{new Date(entry.checkOut).toLocaleTimeString()}</span>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">No attendance records found</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
