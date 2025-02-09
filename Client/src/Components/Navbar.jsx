import { Link } from "react-router-dom";
import {
  FaSignInAlt,
  FaUserPlus,
  FaBars,
} from "react-icons/fa";
import { useState } from "react";
const Navbar = () => {
      const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <>
     {/* Navbar */}
     <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
           <Link to={'/'}> OrgSync</Link>
          </div>
          {/* Hamburger Menu for Mobile */}
          <button
            className="text-gray-600 hover:text-blue-500 md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <FaBars className="text-2xl" />
          </button>
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6">
            <Link
              to={'/login'}
              className="text-gray-600 hover:text-blue-500 transition duration-300 flex items-center"
            >
              <FaSignInAlt className="mr-2" /> Login 
            </Link>
          </div>
        </div>
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-md">
            <Link
              to={'/login'}
              className="block px-6 py-2 text-gray-600 hover:text-blue-500"
            >
              <FaSignInAlt className="inline-block mr-2" /> Login
            </Link>

          </div>
        )}
      </nav>
    </>
  )
}

export default Navbar
