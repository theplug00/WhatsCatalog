// src/components/AdminRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/api/supabase";

export default function AdminRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          console.log('No user found');
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // ✅ Check if user is admin
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('*')
          .eq('id', user.id)
          .single();

        if (adminError || !adminData) {
          console.log('Not an admin user');
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        if (!adminData.is_active) {
          console.log('Admin account inactive');
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // ✅ User is admin
        console.log('Admin user confirmed:', adminData.email);
        setIsAdmin(true);
        setLoading(false);
      } catch (error) {
        console.error('Admin check error:', error);
        setIsAdmin(false);
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  // ✅ If still loading, show spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-[#0B2E2A]/10 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // ✅ If not admin, redirect to login (but preserve the intended URL)
  if (!isAdmin) {
    return <Navigate to="/super-admin/login" state={{ from: location }} replace />;
  }

  // ✅ Admin user - render children
  return children;
}