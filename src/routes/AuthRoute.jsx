import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

// Simple black loader component
const Loader = () => (
  <div className="flex space-x-2">
    <div className="w-3 h-3 rounded-full bg-black animate-pulse"></div>
    <div
      className="w-3 h-3 rounded-full bg-black animate-pulse"
      style={{ animationDelay: "0.2s" }}
    ></div>
    <div
      className="w-3 h-3 rounded-full bg-black animate-pulse"
      style={{ animationDelay: "0.4s" }}
    ></div>
  </div>
);

// Shows loader before redirect
const AuthRedirect = ({ to }) => {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return showLoader ? (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <Loader />
    </div>
  ) : (
    <Navigate to={to} replace />
  );
};

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const authData = localStorage.getItem("auth");

  if (!token || !authData) {
    return <AuthRedirect to="/" />;
  }

  return children;
};

// Blocks auth pages if already logged in
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const authData = localStorage.getItem("auth");

  if (token && authData) {
    return <AuthRedirect to="/dashboard/user" />;
  }

  return children;
};

export { PrivateRoute, PublicRoute };
