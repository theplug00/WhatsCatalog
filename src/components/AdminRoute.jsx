import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/api/supabase";

export default function AdminRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        const { data: adminData, error } = await supabase
          .from('admins')
          .select('*')
          .eq('id', user.id)
          .single();

        // ✅ Allow both 'admin' and 'super_admin' roles
        const isAdminUser = !error && adminData !== null && 
          (adminData.role === 'super_admin' || adminData.role === 'admin') && 
          adminData.is_active === true;

        setIsAdmin(isAdminUser);
      } catch (error) {
        console.error('Admin check error:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-[#0B2E2A]/10 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return isAdmin ? children : <Navigate to="/super-admin/login" replace />;
}