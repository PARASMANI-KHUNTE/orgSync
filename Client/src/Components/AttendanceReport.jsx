import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import api from "../utils/api";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function AttendanceReport() {
    const [employees, setEmployees] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [dateFilter, setDateFilter] = useState("");
    const [view, setView] = useState("table");

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

    // Process and filter data
    const filteredRecords = attendance.flatMap(record =>
        record.checkInOut.map(entry => ({
            employeeID: employees.find(emp => emp._id === record.Employee)?.EmployeeID || "Unknown",
            name: employees.find(emp => emp._id === record.Employee)?.Name || "Unknown",
            checkIn: new Date(entry.checkIn).toLocaleString(),
            checkOut: new Date(entry.checkOut).toLocaleString(),
            hours: entry.hours,
            date: entry.date.split("T")[0]
        }))
    ).filter(entry => !dateFilter || entry.date === dateFilter)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

    // Export to Excel
    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(filteredRecords);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Attendance");
        XLSX.writeFile(wb, "Attendance_Report.xlsx");
    };

    return (
        <div className="p-6 shadow-lg rounded-xl bg-white">
            <h2 className="text-2xl font-semibold mb-4">Attendance Report</h2>

            {/* Filter and View Options */}
            <div className="flex justify-between items-center mb-4">
                <input
                    type="date"
                    className="p-2 border rounded-md w-1/3"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                />
                <select
                    className="p-2 border rounded-md"
                    value={view}
                    onChange={(e) => setView(e.target.value)}
                >
                    <option value="table">Table View</option>
                    <option value="bar">Bar Chart</option>
                    <option value="line">Line Chart</option>
                    <option value="pie">Pie Chart</option>
                </select>
                <button onClick={exportToExcel} className="p-2 bg-blue-500 text-white rounded-md">Export to Excel</button>
            </div>

            {/* Animated View */}
            <motion.div 
                key={view}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="w-full"
            >
                {view === "table" && (
                    <div className="overflow-x-auto">
                        <table className="w-full border rounded-lg">
                            <thead>
                                <tr className="bg-gray-100 text-gray-700">
                                    <th className="p-3 font-medium">Employee ID</th>
                                    <th className="p-3 font-medium">Name</th>
                                    <th className="p-3 font-medium">Check In</th>
                                    <th className="p-3 font-medium">Check Out</th>
                                    <th className="p-3 font-medium">Hours</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRecords.length > 0 ? (
                                    filteredRecords.map((record, index) => (
                                        <tr key={index} className="border-t hover:bg-gray-50">
                                            <td className="p-3">{record.employeeID}</td>
                                            <td className="p-3">{record.name}</td>
                                            <td className="p-3">{record.checkIn}</td>
                                            <td className="p-3">{record.checkOut}</td>
                                            <td className="p-3">{record.hours.toFixed(2)}</td>
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
                )}

                {/* Bar Chart */}
                {view === "bar" && (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={filteredRecords}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="hours" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                )}

                {/* Line Chart */}
                {view === "line" && (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={filteredRecords}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="hours" stroke="#8884d8" />
                        </LineChart>
                    </ResponsiveContainer>
                )}

                {/* Pie Chart */}
                {view === "pie" && (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={filteredRecords} dataKey="hours" nameKey="name" fill="#8884d8" label>
                                {filteredRecords.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </motion.div>
        </div>
    );
}
