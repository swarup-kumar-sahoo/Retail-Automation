import { Navigate } from "react-router-dom";

export default function PublicRoute({ children }) {
  const token = localStorage.getItem("token");

  // if already logged in → go to dashboard
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}