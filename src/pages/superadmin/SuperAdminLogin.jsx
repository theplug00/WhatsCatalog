import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2, Shield, ArrowRight, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/api/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SuperAdminLogin() {
  const [email, setEmail] = useState("official.99freaky@gmail.com");
  const [password, setPassword] = useState("Admin@360");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [debug, setDebug] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setDebug(null);
    setLoading(true);

    try {
      console.log('1. Attempting login with:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.log('2. Auth error:', error);
        throw error;
      }

      console.log('3. Auth successful. User:', data.user);
      console.log('4. User ID:', data.user.id);

      // Check if user is admin
      console.log('5. Checking admins table for user ID:', data.user.id);
      
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('id', data.user.id)
        .single();

      console.log('6. Admin query result:', { adminData, adminError });

      if (adminError) {
        console.log('7. Admin error:', adminError);
        await supabase.auth.signOut();
        setError("Access denied. Admin privileges required.");
        setLoading(false);
        setDebug({ error: adminError.message });
        return;
      }

      if (!adminData) {
        console.log('8. No admin data found');
        await supabase.auth.signOut();
        setError("Access denied. Admin privileges required.");
        setLoading(false);
        setDebug({ noAdminData: true });
        return;
      }

      console.log('9. Admin data found:', adminData);
      console.log('10. Admin role:', adminData.role);
      console.log('11. Admin is_active:', adminData.is_active);

      // Check role
      if (adminData.role !== 'super_admin' && adminData.role !== 'admin') {
        console.log('12. Invalid role:', adminData.role);
        await supabase.auth.signOut();
        setError(`Access denied. Role "${adminData.role}" does not have admin privileges.`);
        setLoading(false);
        setDebug({ invalidRole: adminData.role });
        return;
      }

      if (!adminData.is_active) {
        console.log('13. Admin inactive');
        await supabase.auth.signOut();
        setError("Admin account is deactivated.");
        setLoading(false);
        setDebug({ inactive: true });
        return;
      }

      console.log('14. Admin check passed! Redirecting...');
      navigate("/super-admin/dashboard");
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || "Login failed. Please try again.");
      setDebug({ catchError: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-[#f0f4f4] to-[#e8f5e9]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-[#0B2E2A]/5">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-extrabold font-heading text-[#0B2E2A]">
              Admin Login
            </h1>
            <p className="text-sm text-[#0B2E2A]/50 mt-1">
              Secure access to the admin dashboard
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          {debug && (
            <div className="mb-4 p-3 rounded-xl bg-gray-50 text-gray-600 text-xs font-mono overflow-auto max-h-40">
              <pre>{JSON.stringify(debug, null, 2)}</pre>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#0B2E2A] font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B2E2A]/40" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-white/50 border-[#0B2E2A]/10 focus:bg-white/70 rounded-xl"
                  placeholder="admin@business.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#0B2E2A] font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B2E2A]/40" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 bg-white/50 border-[#0B2E2A]/10 focus:bg-white/70 rounded-xl"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#0B2E2A]/40 hover:text-[#0B2E2A]/70"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  Login to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-[#0B2E2A]/40 mt-6">
            Default: admin@business.com / Admin@360
          </p>
        </div>
      </motion.div>
    </div>
  );
}