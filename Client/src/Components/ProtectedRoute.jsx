import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token"); // Get token inside function


      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const response = await api.get("/services/verify-token");
        console.log(response)

        if (response.data.success) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    verifyToken();
  }, []); // Empty dependency array - runs only once on mount

  useEffect(() => {
    if (isAuthenticated === false) {
      navigate("/"); // Redirect if not authenticated
    }
  }, [isAuthenticated, navigate]); // Runs when authentication status changes

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Show loading while verifying
  }

  return isAuthenticated ? children : null; // Prevents rendering children before redirect
};

export default ProtectedRoute;
