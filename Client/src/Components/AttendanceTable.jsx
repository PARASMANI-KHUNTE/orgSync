import { useState, useEffect } from "react";
import api from "../utils/api";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react"; // Icons

export default function AttendanceTable() {
    const [employees, setEmployees] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0]); // Default to today

    useEffect(() => {
        async function fetchEmployees() {
            try {
                const response = await api.get("/employee/getEmployees");
                if (response.data.success) {
                    setEmployees(response.data.employees);
                    fetchAttendance(response.data.employees.map(emp => emp._id));
                }
            } catch (error) {
                console.error("Error fetching employees", error);
            }
        }

        async function fetchAttendance(employeeIds) {
            try {
                const attendanceRecords = await Promise.all(
                    employeeIds.map(async (id) => {
                        const response = await api.get(`/attendence/getAttendence?id=${id}`);
                    
                        return response.data.success ? response.data.AttendanceRecord : null;
                    })
                );
                setAttendance(attendanceRecords.filter(record => record));
            } catch (error) {
                console.error("Error fetching attendance records", error);
            }
        }

        fetchEmployees();
    }, []);

    // Filtering & Deduplicating records
    const filteredRecords = attendance.flatMap(record => 
        Array.from(new Map(record.checkInOut.map(entry => [entry.checkIn, entry])).values()) // Remove duplicate check-ins
        .map(entry => ({
            employeeID: employees.find(emp => emp._id === record.Employee)?.EmployeeID || "Unknown",
            name: employees.find(emp => emp._id === record.Employee)?.Name || "Unknown",
            checkIn: entry.checkIn,
            checkOut: entry.checkOut,
            formattedHours: entry.formattedHours,
            date: entry.date.split("T")[0]
        }))
    )
    .filter(entry => entry.date === dateFilter) // Show only selected date
    .sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="p-6 shadow-lg rounded-xl bg-white">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Employee Attendance</h2>
            <div className="flex items-center gap-3 mb-4">
                <label className="text-gray-700 font-medium">Filter by Date:</label>
                <input
                    type="date"
                    className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                />
            </div>
            <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 rounded-lg shadow-md">
                    <thead className="bg-blue-500 text-white text-left">
                        <tr>
                            <th className="p-3">Employee ID</th>
                            <th className="p-3">Name</th>
                            <th className="p-3 text-center">Check In</th>
                            <th className="p-3 text-center">Check Out</th>
                            <th className="p-3 text-center">Working Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRecords.length > 0 ? (
                            filteredRecords.map((record, index) => (
                                <tr key={index} className="border-t hover:bg-gray-50">
                                    <td className="p-3 whitespace-nowrap">{record.employeeID}</td>
                                    <td className="p-3 whitespace-nowrap">{record.name}</td>
                                    <td className="p-3 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <CheckCircle className="text-green-500 w-5 h-5" />
                                            {new Date(record.checkIn).toLocaleTimeString()}
                                        </div>
                                    </td>
                                    <td className="p-3 whitespace-nowrap text-center">
                                        {record.checkOut ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <XCircle className="text-red-500 w-5 h-5" />
                                                {new Date(record.checkOut).toLocaleTimeString()}
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center gap-2 text-gray-500">
                                                <AlertTriangle className="text-yellow-500 w-5 h-5" />
                                                <span>Pending</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-3 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Clock className="text-blue-500 w-5 h-5" />
                                            {record.formattedHours ? record.formattedHours : "0.00"}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center p-4 text-gray-500">
                                    No attendance records found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
