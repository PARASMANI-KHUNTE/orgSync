import  { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Edit2, Trash2, X } from 'lucide-react';

import axios from 'axios';

const Branch = () => {
  const [branches, setBranches] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ Name: '', Location: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  

  useEffect(() => {
    fetchBranches();
  }, []);

  // API Calls
  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/branch');
      if (response.data.success) {
        setBranches(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch branches');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBranch = async (branchData) => {
    try {
      const response = await axios.post('/api/branch/addBranch', branchData);
      if (response.data.success) {
        fetchBranches();
        return true;
      }
      return false;
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateBranch = async (branchId, branchData) => {
    try {
      const response = await axios.put(`/api/branch/updateBranch/${branchId}`, branchData);
      if (response.data.success) {
        fetchBranches();
        return true;
      }
      return false;
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteBranch = async (branchId) => {
    try {
      const response = await axios.delete(`/api/branch/deleteBranch/${branchId}`);
      if (response.data.success) {
        fetchBranches();
        return true;
      }
      return false;
    } catch (err) {
      throw err;
    }
  };

  // Event Handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (editingId) {
        await handleUpdateBranch(editingId, formData);
      } else {
        await handleAddBranch(formData);
      }
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this branch?')) {
      try {
        setLoading(true);
        await handleDeleteBranch(id);
      } catch (err) {
        setError('Failed to delete branch');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (branch) => {
    setFormData({ Name: branch.Name, Location: branch.Location });
    setEditingId(branch._id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ Name: '', Location: '' });
    setEditingId(null);
    setError('');
  };

  if (loading && !branches.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
        {/* Header */}
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

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Branches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {branches.map((branch) => (
              <motion.div
                key={branch._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{branch.Name}</h3>
                <p className="text-gray-600 mb-4">{branch.Location}</p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleEdit(branch)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(branch._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">
                    {editingId ? 'Edit Branch' : 'Add Branch'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Branch Name
                    </label>
                    <input
                      type="text"
                      value={formData.Name}
                      onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.Location}
                      onChange={(e) => setFormData({ ...formData, Location: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                  >
                    {loading ? 'Processing...' : editingId ? 'Update Branch' : 'Add Branch'}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Branch;