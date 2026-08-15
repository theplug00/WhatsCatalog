// src/components/AdminRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/api/supabase";

export default function AdminRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        // ✅ First check - localStorage quick check
        const cachedSession = localStorage.getItem('admin_session');
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          localStorage.removeItem('admin_session');
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // ✅ If we have cached session and user, check admin status
        const { data: adminData, error } = await supabase
          .from('admins')
          .select('id, is_active')
          .eq('id', user.id)
          .single();

        if (!error && adminData && adminData.is_active) {
          localStorage.setItem('admin_session', 'true');
          setIsAdmin(true);
        } else {
          localStorage.removeItem('admin_session');
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Admin check error:', error);
        localStorage.removeItem('admin_session');
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  // ✅ Show loading only briefly
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-[#0B2E2A]/10 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return isAdmin ? children : <Navigate to="/super-admin/login" replace />;
}