import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { Building2, Loader2, MapPin, Plus, Edit2 } from "lucide-react";

const OrganizationForm = ({ onSubmit, initialData, submitText, onCancel }) => {
  const [formData, setFormData] = useState({
    Name: initialData?.Name || "",
    Location: initialData?.Location || ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="space-y-6">
        <div>
          <label htmlFor="Name" className="block text-sm font-medium text-gray-700">
            Organization Name
          </label>
          <input
            type="text"
            id="Name"
            name="Name"
            required
            value={formData.Name}
            onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="Location" className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            type="text"
            id="Location"
            name="Location"
            required
            value={formData.Location}
            onChange={(e) => setFormData({ ...formData, Location: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex space-x-4">
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 disabled:bg-blue-400"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {submitText === "Update" ? "Updating..." : "Creating..."}
              </span>
            ) : (
              submitText
            )}
          </motion.button>
          <motion.button
            type="button"
            onClick={onCancel}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
          >
            Cancel
          </motion.button>
        </div>
      </div>
    </motion.form>
  );
};

const Organization = () => {
  const { user } = useAuth();
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchOrganization();
  }, [user?.userId]);

  const fetchOrganization = async () => {
    try {
      if (!user?.userId) return;
      const response = await api.get(`/org/getOrg?userId=${user.userId}`);
      if (response.data.success) {
        setOrganization(response.data.organization);
      }
    } catch (error) {
      toast.info("Create your organization first");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData) => {
    try {
      const response = await api.post("/org/addOrganization",{  Name: formData.Name,
        Location: formData.Location} );
      if (response.data.success) {
        toast.success("Organization created successfully!");
        await fetchOrganization();
        setShowForm(false);
      }
    } catch (error) {
      toast.info(error.response?.data?.message || "Failed to create organization");
      throw error;
    }
  };

  const handleUpdate = async (formData) => {
    try {
      const response = await api.put("/org/updateOrg", {
        orgId: organization._id,
        ...formData,
      });
      if (response.data.success) {
        toast.success("Organization updated successfully!");
        setOrganization(response.data.organization);
        setIsEditing(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update organization");
      throw error;
    }
  };

  if (loading && !organization) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800">Organization</h1>
        <p className="text-gray-600 mt-2">
          Manage your organization details and settings
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {organization && !isEditing ? (
          <motion.div
            key="org-details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {organization.Name}
                  </h2>
                  <div className="flex items-center mt-2 text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{organization.Location}</span>
                  </div>
                </div>
              </div>
              <motion.button
                onClick={() => setIsEditing(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
              >
                <Edit2 className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        ) : isEditing ? (
          <OrganizationForm
            onSubmit={handleUpdate}
            initialData={organization}
            submitText="Update"
            onCancel={() => setIsEditing(false)}
          />
        ) : !showForm ? (
          <motion.div
            key="create-prompt"
            className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-100"
            whileHover={{ scale: 1.02 }}
          >
            <Building2 className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No Organization Found
            </h3>
            <p className="mt-2 text-gray-600">
              Create an organization to get started
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Organization
            </button>
          </motion.div>
        ) : (
          <OrganizationForm
            onSubmit={handleCreate}
            initialData={null}
            submitText="Create Organization"
            onCancel={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Organization;