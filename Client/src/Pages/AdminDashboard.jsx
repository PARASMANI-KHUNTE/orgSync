import { useState } from "react";
import { motion } from "framer-motion";
import { FaBars, FaUser, FaBuilding, FaUsers, FaCog, FaSignOutAlt } from "react-icons/fa";
import { RiDashboardFill, RiBuilding2Fill, RiOrganizationChart, RiUser3Fill, RiSettings3Fill, RiLogoutBoxFill, RiMenu3Fill } from "react-icons/ri";
import Dashboard from "./SideBarPages/Dashboard"
import Branch from "./SideBarPages/Branch";
import Organization from "./SideBarPages/Organization";
import Employees from "./SideBarPages/Employees";
import Profile from "./SideBarPages/Profile";
import Settings from "./SideBarPages/Settings";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
const AdminDashboard = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
  const [activeComponent, setActiveComponent] = useState("Dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { name: "Dashboard", icon:<RiDashboardFill /> },
    { name: "Branch", icon: <RiBuilding2Fill /> },
    { name: "Organization", icon: <RiOrganizationChart /> },
    { name: "Employees", icon: <RiUser3Fill /> },
    { name: "Profile", icon: <FaUser /> },
    { name: "Settings", icon: <RiSettings3Fill /> },
  ];

  const handleLogout = () => {
    logout()
    localStorage.removeItem("token");
    navigate('/')
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <motion.div
        animate={{ width: isSidebarOpen ? "250px" : "70px" }}
        className="bg-gray-900 text-white h-full flex flex-col p-4 shadow-lg fixed md:relative"
      >
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="mb-6 text-xl">
          <RiMenu3Fill />
        </button>

        <nav className="flex flex-col space-y-4">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveComponent(item.name)}
              className={`flex items-center p-3 rounded-lg transition duration-200 ease-in-out w-full ${
                activeComponent === item.name ? "bg-blue-500" : "hover:bg-gray-700"
              }`}
            >
              <span className="text-lg mr-4">{item.icon}</span>
              {isSidebarOpen && <span>{item.name}</span>}
            </button>
          ))}
        </nav>

        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center p-3 w-full rounded-lg bg-red-600 hover:bg-red-700 transition"
          >
            <RiLogoutBoxFill className="mr-4" />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className={`flex-1 p-6 ml-[${isSidebarOpen ? "250px" : "70px"}] transition-all`}> 
        {activeComponent === "Dashboard" && <Dashboard />}
        {activeComponent === "Branch" && <Branch />}
        {activeComponent === "Organization" && <Organization />}
        {activeComponent === "Employees" && <Employees />}
        {activeComponent === "Profile" && <Profile />}
        {activeComponent === "Settings" && <Settings />}
      </div>
    </div>
  );
};

export default AdminDashboard;
