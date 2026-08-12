// src/components/ProtectedRoute.jsx
import React, { useEffect } from "react";  // ✅ Added useEffect
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";

export default function ProtectedRoute({ children, unauthenticatedElement }) {
  const { 
    isAuthenticated, 
    isLoadingAuth, 
    authChecked, 
    authError, 
    checkUserAuth 
  } = useAuth();

  // ✅ useEffect to check auth
  useEffect(() => {
    if (!authChecked && !isLoadingAuth) {
      checkUserAuth();
    }
  }, [authChecked, isLoadingAuth, checkUserAuth]);

  // If still loading, show loading spinner
  if (isLoadingAuth || !authChecked) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  // If error, redirect to login
  if (authError || !isAuthenticated) {
    return unauthenticatedElement || <Navigate to="/login" replace />;
  }

  // If authenticated, render children
  return children;
}