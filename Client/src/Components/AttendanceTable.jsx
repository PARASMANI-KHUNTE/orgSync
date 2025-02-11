import { useState, useEffect } from "react";
import api from "../utils/api";

export default function AttendanceTable() {
    const [employees, setEmployees] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [dateFilter, setDateFilter] = useState("");

    useEffect(() => {
        async function fetchEmployees() {
            try {
                const response = await api.get("/employee/getEmployees");
                console.log(response)
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
                        console.log(id)
                        const response = await api.get(`/attendence/getAttendence?id=${id}`);

                        console.log(response.data)
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

    const filteredRecords = attendance.flatMap(record =>
        record.checkInOut.map(entry => ({
            employeeID: employees.find(emp => emp._id === record.Employee)?.EmployeeID || "Unknown",
            name: employees.find(emp => emp._id === record.Employee)?.Name || "Unknown",
            checkIn: entry.checkIn,
            checkOut: entry.checkOut,
            hours: entry.hours,
            date: entry.date.split("T")[0]
        }))
    ).filter(entry => !dateFilter || entry.date === dateFilter)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="p-6 shadow-lg rounded-xl bg-white">
            <h2 className="text-2xl font-semibold mb-4">Employee Attendance</h2>
            <input
                type="date"
                className="mb-4 p-2 border rounded-md w-1/3"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
            />
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
                                    <td className="p-3">{new Date(record.checkIn).toLocaleString()}</td>
                                    <td className="p-3">{new Date(record.checkOut).toLocaleString()}</td>
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
        </div>
    );
}