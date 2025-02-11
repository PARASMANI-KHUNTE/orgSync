import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import api from "../../utils/api";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await api.get("/employee/getEmployees");
        if (response.data.success) {
          // Fix: Directly use the employees array instead of wrapping it in another array
          const employeeData = response.data.employees;
          console.log(employeeData)

          // Ensure employees is always an array
          setEmployees(Array.isArray(employeeData) ? employeeData : []);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
        setEmployees([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // Fetch departments when assign form is shown
  useEffect(() => {
    if (showAssignForm) {
      const fetchDepartments = async () => {
        try {
            const response = await api.get("/departments");
            console.log("Departments API Response:", response.data); // Debugging
            const departmentData = response.data?.data || [];
            setDepartments(Array.isArray(departmentData) ? departmentData : []);
        } catch (error) {
            console.error("Error fetching departments:", error);
            setDepartments([]);
        }
    };
    
    
      fetchDepartments();
    }
  }, [showAssignForm]);

  const handleEmployeeSelect = (employeeId) => {
    setSelectedEmployees(prev => {
      if (prev.includes(employeeId)) {
        return prev.filter(id => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  };

  const handleAssignDepartment = async () => {
    if (!selectedDepartment) return;

    try {
      await Promise.all(selectedEmployees.map(employeeId => 
        api.post("/employee/assignDepartment", {
          employeeId,
          departmentId: selectedDepartment
        })
      ));

      // Reset states after successful assignment
      setSelectedEmployees([]);
      setSelectedDepartment("");
      setShowAssignForm(false);
      
      // Refresh employee list
      const response = await api.get("/employee/getEmployees");
      if (response.data.success) {
        setEmployees(response.data.employees || []);
      }
      
    } catch (error) {
      console.error("Error assigning department:", error);
    }
  };

  const filteredEmployees = employees.filter((emp) =>
    emp?.EmployeeID?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.h1
        className="text-3xl font-bold text-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Employee List
      </motion.h1>

      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Search by Employee ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-2/3 p-2 border rounded shadow-sm"
        />
        
        {selectedEmployees.length > 0 && (
          <button
            onClick={() => setShowAssignForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Assign Department ({selectedEmployees.length})
          </button>
        )}
      </div>

      {/* Department Assignment Form */}
      {showAssignForm && (
        <motion.div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className="bg-white p-6 rounded-lg shadow-lg w-96"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Assign Department</h2>
              <button 
                onClick={() => setShowAssignForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <select
  value={selectedDepartment}
  onChange={(e) => setSelectedDepartment(e.target.value)}
  className="w-full p-2 border rounded mb-4"
>
  <option value="">Select Department</option>
  {departments.map((dept) => (
    <option key={dept._id} value={dept._id}>
      {dept.Name}
    </option>
  ))}
</select>


            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowAssignForm(false)}
                className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignDepartment}
                disabled={!selectedDepartment}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {employees.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No employees found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEmployees.map((emp) => (
            <motion.div
              key={emp._id}
              className={`p-4 border rounded-lg shadow-md bg-white relative ${
                selectedEmployees.includes(emp._id) ? 'border-blue-500 ring-2 ring-blue-200' : ''
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => handleEmployeeSelect(emp._id)}
                  className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                    selectedEmployees.includes(emp._id)
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'border-gray-300 hover:border-blue-500'
                  }`}
                >
                  {selectedEmployees.includes(emp._id) && <Check size={14} />}
                </button>
              </div>

              <h2 className="text-lg font-semibold">{emp.Name}</h2>
              <p className="text-gray-600">ID: {emp.EmployeeID}</p>
              <p className="text-gray-600">Email: {emp.Email}</p>
              <p className="text-gray-600">Phone: {emp.Phone}</p>
              <p className="text-gray-600">
                Address: {emp.Address.city}, {emp.Address.state} - {emp.Address.pincode}
              </p>
              {emp.department && (
                <p className="text-gray-600 mt-2">
                  Department: {emp.department.Name}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeList;