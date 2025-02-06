import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

// Create context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Function to get user from token
  const loadUserFromToken = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        setUser(decodedUser); // Save user payload
      } catch (error) {
        console.error("Invalid token:", error);
        logout(); // If token is invalid, clear it
      }
    }
  };

  // Function to log in
  const login = (token) => {
    localStorage.setItem("token", token);
    loadUserFromToken();
  };

  // Function to log out
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // Load user on mount
  useEffect(() => {
    loadUserFromToken();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = () => useContext(AuthContext);