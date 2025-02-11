import { useState } from "react";
import { motion } from "framer-motion";
import {  FaUser } from "react-icons/fa";
import { RiDashboardFill, RiBuilding2Fill, RiOrganizationChart, RiUser3Fill, RiLogoutBoxFill, RiMenu3Fill } from "react-icons/ri";
import Dashboard from "./ManagerSidebar/Dashboard"
import EmployeeList from './ManagerSidebar/EmployeeList'
import Attendence from './ManagerSidebar/Attendance'
import Profile from "./SideBarPages/Profile";
import Report from "./ManagerSidebar/Report";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Departments from "./ManagerSidebar/Departments";
import Employee from "./ManagerSidebar/Employee";
const ManagerDashBoard = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
  const [activeComponent, setActiveComponent] = useState("Dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { name: "Dashboard", icon:<RiDashboardFill /> },
    { name: "Attendence", icon: <RiBuilding2Fill /> },
    { name: "Department", icon: <RiOrganizationChart /> },
    { name: "Report", icon: <RiOrganizationChart /> },
    { name: "Add Employee", icon: <RiUser3Fill /> },
    { name: "EmployeeList", icon: <RiUser3Fill /> },
    { name: "Profile", icon: <FaUser /> },
  ];

  const handleLogout = () => {
    logout()
    localStorage.removeItem("token");
    navigate('/')
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
  {/* Sidebar */}
  <motion.div
    animate={{ width: isSidebarOpen ? "250px" : "70px" }}
    className="bg-gray-900 text-white min-h-screen flex flex-col p-4 shadow-lg fixed md:relative"
  >
    {/* Toggle Button */}
    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="mb-6 text-xl">
      <RiMenu3Fill />
    </button>

    {/* Sidebar Menu */}
    <nav className="flex flex-col space-y-4 flex-1">
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

    {/* Logout Button (Sticky at Bottom) */}
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
  <div
    className={`flex-1 p-6 transition-all min-h-screen ml-${isSidebarOpen ? "[250px]" : "[70px]"}`}
  > 
    {activeComponent === "Dashboard" && <Dashboard />}
    {activeComponent === "Attendence" && <Attendence />}
    {activeComponent === "Department" && <Departments />}
    {activeComponent === "Add Employee" && <Employee />}
    {activeComponent === "EmployeeList" && <EmployeeList />}
    {activeComponent === "Report" && <Report />}
    {activeComponent === "Profile" && <Profile />}
  </div>
</div>

  );
};

export default ManagerDashBoard;
