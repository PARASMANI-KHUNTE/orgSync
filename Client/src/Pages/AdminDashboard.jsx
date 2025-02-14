import { useState } from "react";
import { motion } from "framer-motion";
import { FaUser } from "react-icons/fa";
import {
  RiBuilding2Fill,
  RiOrganizationChart,
  RiUser3Fill,

  RiLogoutBoxFill,
  RiMenu3Fill,
} from "react-icons/ri";

import Branch from "./SideBarPages/Branch";
import Organization from "./SideBarPages/Organization";
import Employees from "./SideBarPages/Employees";
import Profile from "./SideBarPages/Profile";

import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeComponent, setActiveComponent] = useState("Dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { name: "Organization", icon: <RiOrganizationChart /> },
    { name: "Branch", icon: <RiBuilding2Fill /> },
    { name: "Employees", icon: <RiUser3Fill /> },
    { name: "Profile", icon: <FaUser /> },
    
  ];

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="flex h-screen w-full bg-gray-100">
      {/* Sidebar */}
      <motion.div
        animate={{ width: isSidebarOpen ? "250px" : "70px" }}
        className="bg-gray-900 text-white h-full flex flex-col p-4 shadow-lg transition-all duration-300"
      >
        {/* Sidebar Toggle Button */}
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="mb-6 text-xl">
          <RiMenu3Fill />
        </button>

        {/* Sidebar Navigation */}
        <nav className="flex flex-col space-y-4 flex-grow">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveComponent(item.name)}
              className={`flex items-center p-3 rounded-lg transition duration-200 ease-in-out w-full ${
                activeComponent === item.name ? "bg-blue-500" : "hover:bg-gray-700"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {isSidebarOpen && <span className="ml-4">{item.name}</span>}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center p-3 w-full rounded-lg bg-red-600 hover:bg-red-700 transition"
          >
            <RiLogoutBoxFill className="text-lg" />
            {isSidebarOpen && <span className="ml-4">Logout</span>}
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 p-6 transition-all duration-300">
        {activeComponent === "Branch" && <Branch />}
        {activeComponent === "Organization" && <Organization />}
        {activeComponent === "Employees" && <Employees />}
        {activeComponent === "Profile" && <Profile />}
        
      </div>
    </div>
  );
};

export default AdminDashboard;
