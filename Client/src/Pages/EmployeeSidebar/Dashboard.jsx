import { useEffect, useState } from "react";
import api from "../../utils/api";

const Dashboard = () => {
  const [attendance, setAttendance] = useState([]);
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const employeeId = "67aaf84ffbf1d098d7a1347e"; // Replace with actual ID dynamically
      const response = await api.get(`/attendence/getAttendence?id=${employeeId}`);
      
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
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Employee Attendance</h2>

      {/* Date Filter */}
      <input
        type="date"
        className="mb-4 p-2 border rounded-md w-1/3"
        value={dateFilter}
        onChange={(e) => setDateFilter(e.target.value)}
      />

      {/* Attendance Table */}
      <div className="overflow-x-auto">
        <table className="w-full border rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3 font-medium">Check In</th>
              <th className="p-3 font-medium">Check Out</th>
              <th className="p-3 font-medium">Hours</th>
              <th className="p-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredAttendance.length > 0 ? (
              filteredAttendance.map((entry, index) => (
                <tr key={index} className="border-t hover:bg-gray-50">
                  <td className="p-3">{new Date(entry.checkIn).toLocaleTimeString()}</td>
                  <td className="p-3">{new Date(entry.checkOut).toLocaleTimeString()}</td>
                  <td className="p-3">{entry.hours.toFixed(2)}</td>
                  <td className="p-3">{new Date(entry.date).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center p-4 text-gray-500">
                  No attendance records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
