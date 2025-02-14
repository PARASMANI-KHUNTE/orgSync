import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import { Download } from "lucide-react";
import api from "../utils/api";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function AttendanceReport() {
    const [employees, setEmployees] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0]);
    const [view, setView] = useState("table");
    const [filterType, setFilterType] = useState("day");
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const chartRef = useRef(null);

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

    const getFilteredRecords = () => {
        if (!attendance.length || !employees.length) return [];
        
        const today = new Date();
        let filtered = attendance.flatMap(record =>
            record.checkInOut.map(entry => ({
                employeeID: employees.find(emp => emp._id === record.Employee)?.EmployeeID || "Unknown",
                name: employees.find(emp => emp._id === record.Employee)?.Name || "Unknown",
                checkIn: entry.checkIn ? new Date(entry.checkIn).toLocaleString() : "N/A",
                checkOut: entry.checkOut ? new Date(entry.checkOut).toLocaleString() : "N/A",
                formattedHours: entry.formattedHours || "N/A",
                hours: entry.hours || 0,
                date: new Date(entry.date).toISOString().split("T")[0]
            }))
        );

        if (filterType === "day") {
            return filtered.filter(entry => entry.date === dateFilter);
        } else if (filterType === "week") {
            const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
            return filtered.filter(entry => new Date(entry.date) >= startOfWeek);
        } else if (filterType === "month") {
            return filtered.filter(entry => entry.date.startsWith(dateFilter.substring(0, 7)));
        } else if (filterType === "employee") {
            return filtered.filter(entry => entry.employeeID === selectedEmployee);
        }

        return filtered;
    };

    const filteredRecords = getFilteredRecords();

    const getGroupedAttendance = () => {
        if (!employees.length) return [];
        
        return employees.map((emp) => {
            const records = filteredRecords.filter(record => record.employeeID === emp.EmployeeID);
            return {
                employeeID: emp.EmployeeID,
                name: emp.Name,
                totalHours: records.reduce((sum, rec) => sum + rec.hours, 0),
                formattedTotalHours: records.length > 0 ? records.map(r => r.formattedHours).join(", ") : "N/A",
                dates: records.map(r => r.date).join(", ")
            };
        });
    };

    const groupedAttendance = getGroupedAttendance();

    const downloadChart = (format = 'png') => {
        if (!chartRef.current) return;
        
        try {
            const svgElement = chartRef.current.querySelector('svg');
            if (!svgElement) return;
            
            // Create a clone of the SVG for manipulation
            const svgClone = svgElement.cloneNode(true);
            svgClone.style.backgroundColor = 'white';
            
            // Get the SVG dimensions
            const svgData = new XMLSerializer().serializeToString(svgClone);
            const svgSize = svgElement.getBoundingClientRect();
            
            // Create canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = svgSize.width;
            canvas.height = svgSize.height;
            
            // Create image from SVG
            const img = new Image();
            const blob = new Blob([svgData], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            
            img.onload = () => {
                // Draw white background
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Draw the image
                ctx.drawImage(img, 0, 0);
                
                // Convert to desired format
                let mimeType = 'image/png';
                if (format === 'jpg' || format === 'jpeg') {
                    mimeType = 'image/jpeg';
                }
                
                // Get the image data
                const imgData = canvas.toDataURL(mimeType);
                
                // Create download link
                const downloadLink = document.createElement('a');
                downloadLink.href = imgData;
                downloadLink.download = `attendance_${view}_chart.${format}`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                
                // Clean up
                URL.revokeObjectURL(url);
            };
            
            img.src = url;
            
        } catch (error) {
            console.error("Error downloading chart:", error);
        }
    };
    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(filteredRecords);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Attendance");
        XLSX.writeFile(wb, "Attendance_Report.xlsx");
    };

    const exportFilteredReport = () => {
        const ws = XLSX.utils.json_to_sheet(groupedAttendance);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Filtered_Attendance");
        XLSX.writeFile(wb, `Attendance_Report_${filterType}.xlsx`);
    };

    const ChartContainer = ({ children }) => (
        <div ref={chartRef} className="relative">
            {children}
            {view !== 'table' && (
                <div className="absolute top-0 right-0 flex gap-2">
                    <button
                        onClick={() => downloadChart('png')}
                        className="p-2 bg-blue-500 text-white rounded-md flex items-center gap-2 hover:bg-blue-600 transition-colors"
                    >
                        <Download size={16} />
                        PNG
                    </button>
                    <button
                        onClick={() => downloadChart('jpg')}
                        className="p-2 bg-blue-500 text-white rounded-md flex items-center gap-2 hover:bg-blue-600 transition-colors"
                    >
                        <Download size={16} />
                        JPG
                    </button>
                    <button
                        onClick={() => downloadChart('svg')}
                        className="p-2 bg-blue-500 text-white rounded-md flex items-center gap-2 hover:bg-blue-600 transition-colors"
                    >
                        <Download size={16} />
                        SVG
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="p-6 shadow-lg rounded-xl bg-white">
            <h2 className="text-2xl font-semibold mb-4">Attendance Report</h2>

            <div className="flex flex-wrap gap-4 items-center mb-4">
                <select
                    className="p-2 border rounded-md"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                >
                    <option value="day">Daily Report</option>
                    <option value="week">Weekly Report</option>
                    <option value="month">Monthly Report</option>
                    <option value="employee">Employee Report</option>
                </select>

                {filterType !== "employee" && (
                    <input
                        type="date"
                        className="p-2 border rounded-md"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    />
                )}

                {filterType === "employee" && (
                    <select
                        className="p-2 border rounded-md"
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                    >
                        <option value="">Select Employee</option>
                        {employees.map(emp => (
                            <option key={emp._id} value={emp.EmployeeID}>{emp.Name}</option>
                        ))}
                    </select>
                )}

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

                <button onClick={exportToExcel} className="p-2 bg-blue-500 text-white rounded-md">
                    Export to Excel
                </button>
                <button onClick={exportFilteredReport} className="p-2 bg-blue-500 text-white rounded-md">
                    Export filtered data
                </button>
            </div>

            <motion.div 
                key={view}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="w-full"
            >
                <ChartContainer>
                    {view === "table" && (
                        <div className="overflow-x-auto">
                            <table className="w-full border rounded-lg">
                                <thead className="bg-gray-100 text-gray-700">
                                    <tr>
                                        <th className="p-3">Employee ID</th>
                                        <th className="p-3">Name</th>
                                        <th className="p-3">Check In</th>
                                        <th className="p-3">Check Out</th>
                                        <th className="p-3">Working Duration</th>
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
                                                <td className="p-3">{record.formattedHours}</td>
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

                    {view === "bar" && (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={filteredRecords}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value, name) => [value + " hours", "Working Duration"]} />
                                <Legend />
                                <Bar dataKey="hours" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}

                    {view === "line" && (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={filteredRecords}>
                                <XAxis dataKey={filterType === "employee" ? "date" : "name"} />
                                <YAxis />
                                <Tooltip formatter={(value, name, props) => [
                                    props.payload.formattedHours,
                                    `Date: ${props.payload.date}`
                                ]} />
                                <Legend />
                                <Line type="monotone" dataKey="hours" stroke="#8884d8" />
                            </LineChart>
                        </ResponsiveContainer>
                    )}

                    {view === "pie" && (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie 
                                    data={filteredRecords} 
                                    dataKey="hours" 
                                    nameKey="name" 
                                    fill="#8884d8" 
                                    label={({ name, formattedHours }) => `${name}: ${formattedHours}`}
                                >
                                    {filteredRecords.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </ChartContainer>
            </motion.div>
        </div>
    );
}