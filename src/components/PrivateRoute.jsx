import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { currentUser, userData, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!currentUser) return <Navigate to="/login" />;

  if (allowedRoles.length > 0) {
    const userRole = userData?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return <Navigate to="/unauthorized" />;
    }
  }

  return children;
};

export default PrivateRoute;
