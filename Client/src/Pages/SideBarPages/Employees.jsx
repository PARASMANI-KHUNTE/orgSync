import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Edit2, Trash2, X, Send, Check, AlertCircle } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from "../../context/AuthContext"; // Adjust the import path as needed
import { toast } from 'react-toastify';
const EmployeeModal = ({ isOpen, onClose, onSubmit, editingEmployee, loading }) => {
  const [formData, setFormData] = useState({
    EmployeeID: '',
    Name: '',
    Email: '',
    Phone: ''
  });

  useEffect(() => {
    if (editingEmployee) {
      setFormData({
        EmployeeID: editingEmployee.EmployeeID,
        Name: editingEmployee.Name,
        Email: editingEmployee.Email,
        Phone: editingEmployee.Phone
      });
    } else {
      setFormData({
        EmployeeID: '',
        Name: '',
        Email: '',
        Phone: ''
      });
    }
  }, [editingEmployee]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {editingEmployee ? 'Edit Branch Manager' : 'Add Branch Manager'}
              </h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-2">Employee ID</label>
                <input
                  type="text"
                  value={formData.EmployeeID}
                  onChange={(e) => setFormData({ ...formData, EmployeeID: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block mb-2">Name</label>
                <input
                  type="text"
                  value={formData.Name}
                  onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block mb-2">Email</label>
                <input
                  type="email"
                  value={formData.Email}
                  onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.Phone}
                  onChange={(e) => setFormData({ ...formData, Phone: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {loading ? 'Processing...' : editingEmployee ? 'Update' : 'Add Manager'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const AssignBranchModal = ({ isOpen, onClose, onSubmit, managerId, loading }) => {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await api.get('/branch/getBranches');
        if (response.data.success) {
          setBranches(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };

    fetchBranches();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(managerId, selectedBranch);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Assign Branch</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-2">Select Branch</label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  required
                >
                  <option value="">Select a branch</option>
                  {branches.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.Name}
                    </option>
                  ))}
                </select>
              </div>
              <button 
                type="submit"
                disabled={loading || !selectedBranch}
                className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
              >
                {loading ? 'Processing...' : 'Assign Branch'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Employees = () => {
  const { user } = useAuth();
  const [managers, setManagers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedManagerId, setSelectedManagerId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchManagers = async () => {
    try {
      setLoading(true);
      let AdminId = user.userId;
      
      // Changed to POST since we need to send data in body
      const response = await api.post('/BranchManager/get', { AdminId });
      
      if (response.data.success) {
        setManagers(response.data.BranchManagers);
      }
    } catch (err) {
      setError('Failed to fetch managers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError('');
      let AdminId = user.userId;
      const handler = editingEmployee
        ? () => api.put('/branchManager/update', { ...formData, BmId: editingEmployee._id })
        : () => api.post('/branchManager/add', {EmployeeID : formData.EmployeeID , Name :  formData.Name , Email :  formData.Email , Phone :  formData.Phone, AdminId});
      
      const response = await handler();
      if (response.data.success) {
        fetchManagers();
        handleCloseModal();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this manager?')) {
      try {
        setLoading(true);
        const response = await api.delete('/branchManager/remove', { 
          data: { _id: id }  // Changed to match MongoDB's _id field
        });
        if (response.data.success) {
          fetchManagers();
        }
      } catch (err) {
        setError('Deletion failed');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSendVerification = async (id) => {
    try {
      setLoading(true);
      const response = await api.post('/branchManager/sendlink', { id });
      if (response.data.success) {
        toast.success("Account verification link has been sent")
      }
    } catch (err) {
      setError('Failed to send verification link');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignBranch = async (managerId, branchId) => {
    try {
      setLoading(true);
      const response = await api.put('/branchManager/assign', { 
        BmId: managerId,
        branchId 
      });
      if (response.data.success) {
        fetchManagers();
        setIsAssignModalOpen(false);
      }
    } catch (err) {
      setError('Failed to assign branch');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Branch Managers</h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusCircle size={20} />
            Add Manager
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {managers.map((manager) => (
              <motion.div
                key={manager._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{manager.Name}</h3>
                    <p className="text-gray-600">{manager.EmployeeID}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-sm ${
                    manager.Verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {manager.Verified ? (
                      <span className="flex items-center gap-1">
                        <Check size={14} />
                        Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <AlertCircle size={14} />
                        Unverified
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Email: {manager.Email}</p>
                  <p>Phone: {manager.Phone}</p>
                  {manager.branchId && <p>Branch Assigned: Yes</p>}
                </div>

                <div className="flex justify-end space-x-2 mt-4">
                  {!manager.Verified && (
                    <button 
                      onClick={() => handleSendVerification(manager._id)}
                      className="text-blue-500 hover:bg-blue-50 p-2 rounded-full"
                    >
                      <Send size={18} />
                    </button>
                  )}
                  {manager.Verified && !manager.branchId && (
                    <button 
                      onClick={() => {
                        setSelectedManagerId(manager._id);
                        setIsAssignModalOpen(true);
                      }}
                      className="text-green-500 hover:bg-green-50 p-2 rounded-full"
                    >
                      <PlusCircle size={18} />
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setEditingEmployee(manager);
                      setIsModalOpen(true);
                    }}
                    className="text-blue-500 hover:bg-blue-50 p-2 rounded-full"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(manager._id)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-full"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <EmployeeModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          editingEmployee={editingEmployee}
          loading={loading}
        />

        <AssignBranchModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          onSubmit={handleAssignBranch}
          managerId={selectedManagerId}
          loading={loading}
        />
      </motion.div>
    </div>
  );
};

export default Employees;