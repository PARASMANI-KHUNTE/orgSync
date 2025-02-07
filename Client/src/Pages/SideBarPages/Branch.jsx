import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Edit2, Trash2, X } from 'lucide-react';
import api from '../../utils/api'

// API handlers
const branchAPI = {
 
  fetch: async () => {
    const response = await api.get('/branch/getBranches');
    return response.data;
  },
  
  add: async (data) => {
    const response = await api.post('/branch/addBranch', data);
    return response.data;
  },
  
  update: async (id, data ) => {
    const response = await api.put(`/branch/updateBranch`,{Name : data.Name, Location : data.Location , branchId : id });
    return response.data;
  },
  
  delete: async (id) => {
    console.log(`Id - ${id}`)
    const response = await api.delete('/branch/deleteBranch', { data: { id } });
    return response.data;
  }
};

// Modal component
const BranchModal = ({ isOpen, onClose, onSubmit, editingBranch, loading }) => {


  const [formData, setFormData] = useState({ Name: '', Location: '' });

  useEffect(() => {
    if (editingBranch) {
    
      setFormData({ Name: editingBranch.Name, Location: editingBranch.Location });
    } else {
      setFormData({ Name: '', Location: '' });
    }
  }, [editingBranch]);

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
                {editingBranch ? 'Edit Branch' : 'Add Branch'}
              </h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-2">Branch Name</label>
                <input
                  type="text"
                  value={formData.Name}
                  onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block mb-2">Location</label>
                <input
                  type="text"
                  value={formData.Location}
                  onChange={(e) => setFormData({ ...formData, Location: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {loading ? 'Processing...' : editingBranch ? 'Update' : 'Add Branch'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Main component
const Branch = () => {
  
  const [branches, setBranches] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const result = await branchAPI.fetch();
      if (result.success) {
        setBranches(result.data);
      }
    } catch (err) {
      setError('Failed to fetch branches');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError('');
      
      const handler = editingBranch
        ? () => branchAPI.update(editingBranch._id, formData)
        : () => branchAPI.add(formData);
      
      const result = await handler();
      if (result.success) {
        fetchBranches();
        handleCloseModal();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this branch?')) {
      try {
        setLoading(true);
        const result = await branchAPI.delete(id);
        if (result.success) {
          fetchBranches();
        }
      } catch (err) {
        setError('Deletion failed');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (branch) => {
    setEditingBranch(branch);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBranch(null);
    setError('');
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Branch Management</h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusCircle size={20} />
            Add Branch
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {branches.map((branch) => (
              <motion.div
                key={branch._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all"
              >
                <h3 className="text-xl font-semibold mb-2">{branch.Name}</h3>
                <p className="text-gray-600 mb-4">{branch.Location}</p>
                <div className="flex justify-end space-x-2">
                  <button 
                    onClick={() => handleEdit(branch)}
                    className="text-blue-500 hover:bg-blue-50 p-2 rounded-full"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(branch._id)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-full"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <BranchModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          editingBranch={editingBranch}
          loading={loading}
        />
      </motion.div>
    </div>
  );
};

export default Branch;