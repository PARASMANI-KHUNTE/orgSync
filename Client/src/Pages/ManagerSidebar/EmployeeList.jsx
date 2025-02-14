import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, X, Edit } from "lucide-react";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
const EmployeeList = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [search, setSearch] = useState("");
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState({ EmployeeID: "", Name: "", Phone: "", Address: { city: "", state: "", pincode: "" } });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await api.get("/employee/getEmployees");
        if (response.data.success) {
          setEmployees(response.data.employees || []);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get("/departments");
  
        if (response.data.success) {
          const departmentsArray = response.data.data || [];
  
          const branchId = user?.userbranchId; // Assuming it's a string
  
          if (!branchId) {
            console.warn("Branch ID is undefined, setting all departments");
            setDepartments(departmentsArray);
            return;
          }
  
          // Filter departments where branchId._id matches user.userbranchid
          const filteredDepartments = departmentsArray.filter(
            (dept) => dept.branchId?._id === branchId
          );
  
          setDepartments(filteredDepartments);
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
        setDepartments([]);
      }
    };
  
    fetchDepartments();
  }, []); // Dependency array is empty, runs only on mount

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
  };

  const handleEditClick = () => {
    if (!selectedEmployee) return;
    setEditData({ ...selectedEmployee });
    setShowEditForm(true);
  };

  const handleEditSave = async () => {
    try {
      await api.put(`/employee/updateEmployeeDetails/${selectedEmployee._id}`, editData);
      setEmployees(prev => prev.map(emp => (emp._id === selectedEmployee._id ? { ...emp, ...editData } : emp)));
      setShowEditForm(false);
      setSelectedEmployee(null);
    } catch (error) {
      console.error("Error updating employee:", error);
    }
  };
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

  const handleAssignDepartment = async () => {
    if (!selectedDepartment || !selectedEmployee) return;
    try {
      await api.post("/employee/assignDepartment", { employeeId: selectedEmployee._id, departmentId: selectedDepartment });
      setEmployees(prev => prev.map(emp => (emp._id === selectedEmployee._id ? { ...emp, assignedDepartment: selectedDepartment } : emp)));
      setShowAssignForm(false);
      setSelectedEmployee(null);
    } catch (error) {
      console.error("Error assigning department:", error);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp?.EmployeeID?.toLowerCase().includes(search.toLowerCase()) &&
    (filterDepartment ? emp.assignedDepartment === filterDepartment : true)
  );

  if (loading) return <div className="text-center">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.h1 className="text-3xl font-bold text-center mb-6">Employee List</motion.h1>
      <div className="flex justify-between mb-4">
        <input type="text" placeholder="Search by Employee ID" value={search} 
          onChange={(e) => setSearch(e.target.value)} className="p-2 border rounded" />
        <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)}
          className="p-2 border rounded">
          <option value="">All Departments</option>
          {departments.map(dept => <option key={dept._id} value={dept._id}>{dept.Name}</option>)}
        </select>
        {selectedEmployee && (
          <div className="space-x-2">
            <button onClick={() => setShowAssignForm(true)} className="bg-blue-500 text-white px-4 py-2 rounded">
              Assign Department
            </button>
            <button onClick={handleEditClick} className="bg-green-500 text-white px-4 py-2 rounded">
              Edit
            </button>
          </div>
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

      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold">Edit Employee</h2>
            <input type="text" value={editData.EmployeeID} onChange={(e) => setEditData({...editData, EmployeeID: e.target.value})} className="w-full p-2 border rounded mb-2" placeholder="Employee ID" />
            <input type="text" value={editData.Name} onChange={(e) => setEditData({...editData, Name: e.target.value})} className="w-full p-2 border rounded mb-2" placeholder="Name" />
            <input type="text" value={editData.Phone} onChange={(e) => setEditData({...editData, Phone: e.target.value})} className="w-full p-2 border rounded mb-2" placeholder="Phone" />
            <button onClick={handleEditSave} className="px-4 py-2 bg-green-500 text-white rounded">Save</button>
            <button onClick={() => setShowEditForm(false)} className="ml-2 px-4 py-2 border rounded">Cancel</button>
          </div>
        </div>
      )}

      <table className="w-full border-collapse border border-gray-300 mt-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Select</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Employee ID</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Phone</th>
            <th className="border p-2">Address</th>
            <th className="border p-2">Department</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.map(emp => (
            <tr key={emp._id} className="border" onClick={() => handleEmployeeSelect(emp)}>
              <td className="border p-2 text-center">{selectedEmployee?._id === emp._id && <Check size={14} />}</td>
              <td className="border p-2">{emp.Name}</td>
              <td className="border p-2">{emp.EmployeeID}</td>
              <td className="border p-2">{emp.Email}</td>
              <td className="border p-2">{emp.Phone}</td>
              <td className="border p-2">{emp.Address.city}, {emp.Address.state} - {emp.Address.pincode}</td>
              <td className="border p-2">{departments.find(d => d._id === emp.assignedDepartment)?.Name || 'No Department'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeList;
