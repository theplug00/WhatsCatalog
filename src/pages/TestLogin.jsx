// /src/pages/TestLogin.jsx
import React, { useState } from "react";
import { supabase } from "@/api/supabase";

export default function TestLogin() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    try {
      // Step 1: Login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@business.com',
        password: 'Admin@360'
      });
      
      if (error) {
        setResult({ step: 'Login failed', error: error.message });
        setLoading(false);
        return;
      }

      // Step 2: Check admin
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('id', data.user.id)
        .single();

      setResult({
        step: 'Done',
        user: data.user,
        adminData: adminData,
        adminError: adminError?.message || null
      });
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test Login</h1>
      <button 
        onClick={testLogin} 
        disabled={loading}
        className="bg-primary text-white px-4 py-2 rounded"
      >
        {loading ? 'Testing...' : 'Test Login'}
      </button>
      {result && (
        <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto max-h-96">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}