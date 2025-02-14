import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusCircle, 
  Edit2, 
  Trash2, 
  X, 
  Send, 
  Check, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import PropTypes from 'prop-types';
import api from '../../utils/api';
import { useAuth } from "../../context/AuthContext";
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
        EmployeeID: editingEmployee.EmployeeID || '',
        Name: editingEmployee.Name || '',
        Email: editingEmployee.Email || '',
        Phone: editingEmployee.Phone || ''
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
                className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
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

EmployeeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  editingEmployee: PropTypes.shape({
    _id: PropTypes.string,
    EmployeeID: PropTypes.string,
    Name: PropTypes.string,
    Email: PropTypes.string,
    Phone: PropTypes.string
  }),
  loading: PropTypes.bool.isRequired
};

EmployeeModal.defaultProps = {
  editingEmployee: null
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
        toast.error('Failed to fetch branches');
      }
    };

    if (isOpen) {
      fetchBranches();
    }
  }, [isOpen]);

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
                      {branch.Name} - {branch.Location}
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

AssignBranchModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  managerId: PropTypes.string,
  loading: PropTypes.bool.isRequired
};

AssignBranchModal.defaultProps = {
  managerId: null
};

// Manager Card Component for better organization
const ManagerCard = ({ manager, branchDetails, onEdit, onDelete, onSendVerification, onAssignBranch }) => {
  return (
    <motion.div
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
        {manager.branchId && branchDetails[manager.branchId] && (
          <div className="mt-2 p-2 bg-blue-50 rounded-lg">
            <p className="font-medium text-blue-800">Assigned Branch:</p>
            <p className="text-blue-600">{branchDetails[manager.branchId].Name}</p>
            <p className="text-blue-600">{branchDetails[manager.branchId].Location}</p>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2 mt-4">
        {!manager.Verified && (
          <button 
            onClick={() => onSendVerification(manager._id)}
            className="text-blue-500 hover:bg-blue-50 p-2 rounded-full"
            title="Send Verification"
          >
            <Send size={18} />
          </button>
        )}
        {manager.Verified && !manager.branchId && (
          <button 
            onClick={() => onAssignBranch(manager._id)}
            className="text-green-500 hover:bg-green-50 p-2 rounded-full"
            title="Assign Branch"
          >
            <PlusCircle size={18} />
          </button>
        )}
        <button 
          onClick={() => onEdit(manager)}
          className="text-blue-500 hover:bg-blue-50 p-2 rounded-full"
          title="Edit Manager"
        >
          <Edit2 size={18} />
        </button>
        <button 
          onClick={() => onDelete(manager._id)}
          className="text-red-500 hover:bg-red-50 p-2 rounded-full"
          title="Delete Manager"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </motion.div>
  );
};

ManagerCard.propTypes = {
  manager: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    Name: PropTypes.string.isRequired,
    EmployeeID: PropTypes.string.isRequired,
    Email: PropTypes.string.isRequired,
    Phone: PropTypes.string.isRequired,
    Verified: PropTypes.bool.isRequired,
    branchId: PropTypes.string
  }).isRequired,
  branchDetails: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onSendVerification: PropTypes.func.isRequired,
  onAssignBranch: PropTypes.func.isRequired
};

const Employees = () => {
  const { user } = useAuth();
  const [managers, setManagers] = useState([]);
  const [branchDetails, setBranchDetails] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedManagerId, setSelectedManagerId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchBranchDetails = async (branchIds) => {
    try {
      const details = {};
      for (const branchId of branchIds) {
        if (branchId) {
          const response = await api.get(`/branch/${branchId}`);
          if (response.data.success) {
            details[branchId] = response.data.data;
          }
        }
      }
      setBranchDetails(details);
    } catch (error) {
      console.error('Error fetching branch details:', error);
      toast.error('Failed to fetch branch details');
    }
  };

  const fetchManagers = async () => {
    try {
      setLoading(true);
      let AdminId = user.userId;
      
      const response = await api.post('/BranchManager/get', { AdminId });
      
      if (response.data.success) {
        setManagers(response.data.BranchManagers);
        const branchIds = [...new Set(response.data.BranchManagers
          .map(manager => manager.branchId)
          .filter(id => id))];
        await fetchBranchDetails(branchIds);
      }
    } catch (err) {
      setError('Failed to fetch managers');
      toast.error('Failed to fetch managers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, [user.userId]);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError('');
      let AdminId = user.userId;
      
      const handler = editingEmployee
        ? () => api.put('/branchManager/update', { ...formData, BmId: editingEmployee._id })
        : () => api.post('/branchManager/add', {
            EmployeeID: formData.EmployeeID,
            Name: formData.Name,
            Email: formData.Email,
            Phone: formData.Phone,
            AdminId
          });
      
      const response = await handler();
      console.log(response)
      if (response.data.success) {
        await fetchManagers();
        handleCloseModal();
        toast.success(editingEmployee ? 'Manager updated successfully' : 'Manager added successfully');
      }else{
        toast.info(response.data.success)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    

    if (window.confirm('Are you sure you want to delete this manager?')) {
      try {
        setLoading(true);

        const response = await api.delete(`/branchManager/remove/${id}`);
        
        if (response.data.success) {
          setManagers(prevManagers => prevManagers.filter(manager => manager._id !== id)); // Remove deleted manager
          toast.success('Manager deleted successfully');
        } else {
          toast.error('Failed to delete manager');
        }
      } catch (err) {
        setError('Deletion failed');
        toast.error('Failed to delete manager');
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
        toast.success("Account verification link has been sent");
      }
    } catch (err) {
      setError('Failed to send verification link');
      toast.error('Failed to send verification link');
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
        await fetchManagers();
        setIsAssignModalOpen(false);
        toast.success('Branch assigned successfully');
      }
    } catch (err) {
      setError('Failed to assign branch');
      toast.error('Failed to assign branch');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
    setError('');
  };

  if (loading && managers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-6 h-6 text-blue-600" />
          </motion.div>
          <span className="text-gray-600">Loading managers...</span>
        </div>
      </div>
    );
  }

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

        {managers.length === 0 && !loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No branch managers found. Add one to get started!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
  {managers.map((manager) => (
    <AnimatePresence key={manager._id}>
      <ManagerCard
        key={manager._id}
        manager={manager}
        branchDetails={branchDetails}
        onEdit={(manager) => {
          setEditingEmployee(manager);
          setIsModalOpen(true);
        }}
        onDelete={handleDelete}
        onSendVerification={handleSendVerification}
        onAssignBranch={(managerId) => {
          setSelectedManagerId(managerId);
          setIsAssignModalOpen(true);
        }}
      />
    </AnimatePresence>
  ))}
</div>
        )}

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

// Add prop types for the Auth Context
useAuth.propTypes = {
  user: PropTypes.shape({
    userId: PropTypes.string.isRequired,
  }).isRequired,
};

export default Employees;