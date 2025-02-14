import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext"; // Adjust the import path as needed

const Departments = () => {
  const {user} = useAuth();
  const [departments, setDepartments] = useState([]);
  const [newDepartment, setNewDepartment] = useState("");
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [updatedDepartmentName, setUpdatedDepartmentName] = useState("");

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Fetch all departments
  const fetchDepartments = async () => {
    try {
      const response = await api.get("/departments");
  
      // Ensure departments array is correctly extracted
      const departmentsArray = Array.isArray(response.data.data) ? response.data.data : [];
  
  
      const branchId = user?.userbranchId; // Assuming this is a string (_id of branch)
  
      console.log("User Branch ID:", branchId);
      console.log("Departments Array:", departmentsArray);
  
      // Filter departments based on branchId._id
      const filteredDepartments = departmentsArray.filter(dept => {
        console.log("Checking Department:", dept.Name, "Branch ID:", dept.branchId?._id);
        return dept.branchId?._id === branchId;
      });
  
      console.log("Filtered Departments:", filteredDepartments);
  
      setDepartments(filteredDepartments);
    } catch (error) {
      console.error("Error fetching departments:", error);
      setDepartments([]);
    }
  };
  

  // Add a new department  -- working
  const handleAddDepartment = async () => {
    if (!newDepartment.trim()) return;

    try {
      const response = await api.post("/departments", { Name: newDepartment });
      setDepartments((prev) => [...prev, response.data.data]);
      setNewDepartment("");
    } catch (error) {
      console.error("Error adding department:", error);
    }
  };

  // Delete a department
const handleDeleteDepartment = async (departmentId) => {
  try {
    await api.delete(`/departments/${departmentId}`);

    // Ensure the latest state is used
    setDepartments((prevDepartments) => 
      prevDepartments.filter((dept) => dept._id !== departmentId)
    );

  } catch (error) {
    console.error("Error deleting department:", error);
  }
};


  // Update a department
  const handleEditDepartment = async () => {
    if (!updatedDepartmentName.trim() || !editingDepartment) return;

    try {
      await api.put(`/departments/${editingDepartment}`, {
        Name: updatedDepartmentName,
      });

      setDepartments(
        departments.map((dept) =>
          dept._id === editingDepartment ? { ...dept, Name: updatedDepartmentName } : dept
        )
      );

      setEditingDepartment(null);
      setUpdatedDepartmentName("");
    } catch (error) {
      console.error("Error editing department:", error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Departments</h2>
      <p className="text-gray-600 mb-6">
        Welcome to the Dashboard! Here you can view and manage your departments.
      </p>

      {/* Add Department Section */}
      <div className="mb-6">
        <input
          type="text"
          value={newDepartment}
          onChange={(e) => setNewDepartment(e.target.value)}
          placeholder="Enter new department"
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAddDepartment}
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
        >
          Add Department
        </button>
      </div>

      {/* Display Departments */}
      <div>
      {departments.map((department, index) => (
  <motion.div
    key={department._id || index} // Ensure each child has a unique key
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.1 }}
    className="flex justify-between items-center p-4 mb-2 bg-gray-50 rounded-lg shadow-sm"
  >
    {editingDepartment === department._id ? (
      <input
        type="text"
        value={updatedDepartmentName}
        onChange={(e) => setUpdatedDepartmentName(e.target.value)}
        className="px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    ) : (
      <span className="text-gray-700">{department.Name}</span>
    )}

    <div className="flex gap-2">
      {editingDepartment === department._id ? (
        <button
          onClick={handleEditDepartment}
          className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200"
        >
          Save
        </button>
      ) : (
        <button
          onClick={() => {
            setEditingDepartment(department._id);
            setUpdatedDepartmentName(department.Name);
          }}
          className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-200"
        >
          Edit
        </button>
      )}

<button
  onClick={() => handleDeleteDepartment(department._id)} // Ensure correct property
  className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
>
  Delete
</button>

    </div>
  </motion.div>
))}

      </div>
    </div>
  );
};

export default Departments;
