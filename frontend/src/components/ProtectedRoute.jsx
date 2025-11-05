import React from "react";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <div className="unauthorized">Please login first.</div>;
  }
  return children;
}
