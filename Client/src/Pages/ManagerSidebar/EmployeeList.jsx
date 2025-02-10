import { useEffect, useState } from "react";
import api from "../../utils/api";
import { jwtDecode } from "jwt-decode";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [employerId, setEmployerId] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [departments, setDepartments] = useState([]);
  // Map employeeId to personal data (name, email, phone)
  const [userDataMap, setUserDataMap] = useState({});

  // States for inline editing
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [editedData, setEditedData] = useState({
    task: "",
    shift: "",
    department: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setEmployerId(decoded.userId);
    }
  }, []);

  // Fetch employees when employerId is available
  useEffect(() => {
    if (!employerId) return;

    const fetchEmployees = async () => {
      try {
        console.log("Fetching employees for employerId:", employerId);
        const response = await api.post(
          "/employers/getEmployees",
          { id: employerId },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        console.log("API Response:", response.data);

        const employeeData = response.data.employees;
        setEmployees(
          employeeData && typeof employeeData === "object"
            ? [employeeData]
            : []
        );
      } catch (error) {
        console.error("Error fetching employees:", error);
        setEmployees([]);
      }
    };

    fetchEmployees();
  }, [employerId]);

  // Fetch departments for the logged in employer
  useEffect(() => {
    if (!employerId) return;

    const fetchDepartments = async () => {
      try {
        const response = await api.post(
          "/employers/getDepartment",
          { id: employerId },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setDepartments(response.data.departments || []);
      } catch (error) {
        console.error("Error fetching departments:", error);
        setDepartments([]);
      }
    };

    fetchDepartments();
  }, [employerId]);

  // For every employee, fetch their personal details using employeeId
  useEffect(() => {
    const fetchUserDataForEmployees = async () => {
      const newMap = {};
      await Promise.all(
        employees.map(async (emp) => {
          try {
            const response = await api.post(
              "/users/getEmployeePersnalData",
              { employeeId: emp._id },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );
            if (response.data.success) {
              newMap[emp._id] = response.data.data;
            }
          } catch (error) {
            console.error(
              "Error fetching personal data for employee",
              emp._id,
              error
            );
          }
        })
      );
      setUserDataMap(newMap);
    };

    if (employees.length > 0) {
      fetchUserDataForEmployees();
    }
  }, [employees]);

  // Filter employees by the selected date (if provided)
  const filteredEmployees = employees.filter((emp) =>
    !filterDate ||
    (emp.checkInOut &&
      emp.checkInOut.some(
        (entry) =>
          new Date(entry.date).toISOString().split("T")[0] === filterDate
      ))
  );

  // Trigger edit mode and pre-populate with current values
  const handleEditClick = (employee) => {
    setEditingEmployeeId(employee._id);
    setEditedData({
      task: employee.tasks ? employee.tasks.join(", ") : "",
      shift: employee.shift || "",
      department: employee.department || "",
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingEmployeeId(null);
    setEditedData({
      task: "",
      shift: "",
      department: "",
    });
  };

  // Handle change for input fields during editing
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Save updated values to the DB via the submit-registration endpoint
  const handleSave = async (employeeId) => {
    try {
      const response = await api.post(
        "/employers/submit-registration",
        {
          formSData: {
            task: editedData.task, // The backend expects "task"
            shift: editedData.shift,
            department: editedData.department,
          },
          employeeId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Update response:", response.data);
      if (response.data.success) {
        // Update local state so the UI reflects the changes
        setEmployees((prevEmployees) =>
          prevEmployees.map((emp) => {
            if (emp._id === employeeId) {
              return {
                ...emp,
                tasks: editedData.task.split(",").map((item) => item.trim()),
                shift: editedData.shift,
                department: editedData.department,
              };
            }
            return emp;
          })
        );
        setEditingEmployeeId(null);
        setEditedData({
          task: "",
          shift: "",
          department: "",
        });
      } else {
        console.error("Failed to update employee:", response.data.message);
      }
    } catch (error) {
      console.error("Error updating employee:", error);
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center sm:text-left">
        Employee List
      </h2>
      <nav className="mb-4 p-4 bg-gray-100 rounded-lg flex flex-col sm:flex-row items-center gap-4">
        <label className="font-semibold">Filter by Date:</label>
        <input
          type="date"
          className="border p-2 rounded w-full sm:w-auto"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
      </nav>

      <div className="overflow-x-auto">
        <table className="w-full bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <th className="p-3 border text-left">Employer ID</th>
              <th className="p-3 border text-left">Employee ID</th>
              <th className="p-3 border text-left">Name</th>
              <th className="p-3 border text-left">Email</th>
              <th className="p-3 border text-left">Phone</th>
              <th className="p-3 border text-left">Task</th>
              <th className="p-3 border text-left">Shift</th>
              <th className="p-3 border text-left">Department</th>
              <th className="p-3 border text-left">Latest Check-in</th>
              <th className="p-3 border text-left">Latest Check-out</th>
              {/* NEW Hours column */}
              <th className="p-3 border text-left">Hours</th>
              <th className="p-3 border text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp) => {
                const personalData = userDataMap[emp._id];
                // Grab the last checkInOut entry (if any) to display times & hours
                const latestEntry =
                  emp.checkInOut && emp.checkInOut.length > 0
                    ? emp.checkInOut[emp.checkInOut.length - 1]
                    : null;

                return (
                  <tr key={emp._id} className="border-b hover:bg-gray-50">
                    <td className="p-3 border">{emp.employer}</td>
                    <td className="p-3 border">{emp._id}</td>
                    <td className="p-3 border">
                      {personalData ? personalData.name : "Loading..."}
                    </td>
                    <td className="p-3 border">
                      {personalData ? personalData.email : "Loading..."}
                    </td>
                    <td className="p-3 border">
                      {personalData ? personalData.phone : "Loading..."}
                    </td>
                    <td className="p-3 border">
                      {editingEmployeeId === emp._id ? (
                        <input
                          type="text"
                          name="task"
                          value={editedData.task}
                          onChange={handleInputChange}
                          className="border p-1 rounded w-full"
                        />
                      ) : (
                        emp.tasks.join(", ")
                      )}
                    </td>
                    <td className="p-3 border">
                      {editingEmployeeId === emp._id ? (
                        <select
                          name="shift"
                          value={editedData.shift}
                          onChange={handleInputChange}
                          className="border p-1 rounded w-full"
                        >
                          <option value="">Select Shift</option>
                          <option value="day">Day</option>
                          <option value="afternoon">Afternoon</option>
                          <option value="night">Night</option>
                        </select>
                      ) : (
                        emp.shift
                      )}
                    </td>
                    <td className="p-3 border">
                      {editingEmployeeId === emp._id ? (
                        <select
                          name="department"
                          value={editedData.department}
                          onChange={handleInputChange}
                          className="border p-1 rounded w-full"
                        >
                          <option value="">Select Department</option>
                          {departments.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      ) : (
                        emp.department
                      )}
                    </td>
                    <td className="p-3 border">
                      {latestEntry
                        ? new Date(latestEntry.checkIn).toLocaleTimeString()
                        : "N/A"}
                    </td>
                    <td className="p-3 border">
                      {latestEntry && latestEntry.checkOut
                        ? new Date(latestEntry.checkOut).toLocaleTimeString()
                        : "N/A"}
                    </td>
                    {/* Display the hours from the latest entry (if any) */}
                    <td className="p-3 border">
                      {latestEntry && latestEntry.hours
                        ? latestEntry.hours
                        : "N/A"}
                    </td>
                    <td className="p-3 border">
                      {editingEmployeeId === emp._id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSave(emp._id)}
                            className="bg-green-500 text-white px-3 py-1 rounded"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="bg-red-500 text-white px-3 py-1 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditClick(emp)}
                          className="bg-blue-500 text-white px-3 py-1 rounded"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="12" className="p-4 text-center text-gray-500">
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeList;
