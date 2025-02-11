import { useState } from "react";
import { motion } from "framer-motion";
import { FaUser } from "react-icons/fa";
import { RiDashboardFill, RiLogoutBoxFill, RiMenu3Fill } from "react-icons/ri";
import Dashboard from "./EmployeeSidebar/Dashboard";
import Profile from "./EmployeeSidebar/Profile";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeComponent, setActiveComponent] = useState("Dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { name: "Dashboard", icon: <RiDashboardFill /> },
    { name: "Profile", icon: <FaUser /> },
  ];

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-900">
      {/* Sidebar */}
      <motion.div
        animate={{ width: isSidebarOpen ? "260px" : "80px" }}
        className="fixed md:relative h-full bg-white/20 dark:bg-gray-800/40 backdrop-blur-md text-white shadow-lg flex flex-col p-4 z-50 transition-all duration-300 rounded-r-lg"
      >
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="mb-6 text-2xl text-gray-100 hover:text-blue-400 transition"
        >
          <RiMenu3Fill />
        </button>

        {/* Navigation Menu */}
        <nav className="flex flex-col space-y-4 flex-grow">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveComponent(item.name)}
              className={`flex items-center p-3 rounded-lg transition-all duration-200 ease-in-out w-full ${
                activeComponent === item.name
                  ? "bg-blue-500 shadow-lg"
                  : "hover:bg-gray-600/40"
              }`}
            >
              <span className="text-lg mr-4">{item.icon}</span>
              {isSidebarOpen && <span>{item.name}</span>}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center p-3 w-full rounded-lg bg-red-500 hover:bg-red-600 transition-all duration-200 shadow-md"
          >
            <RiLogoutBoxFill className="mr-2 text-3xl" />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div
        className={`flex-1 p-6 transition-all duration-300 ${
          isSidebarOpen ? "ml-[260px]" : "ml-[80px]"
        }`}
      >
        {activeComponent === "Dashboard" && <Dashboard />}
        {activeComponent === "Profile" && <Profile />}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
