import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

const DefaultFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
);

export default function ProtectedRoute({ fallback = <DefaultFallback />, unauthenticatedElement }) {
  const { user, isLoadingAuth, authChecked, authError } = useAuth();

  // ✅ Only check if user is null and auth is not loading
  useEffect(() => {
    // If auth is already checked and no user, we can redirect
    // Don't call checkUserAuth() here - it causes delays
  }, []);

  // ✅ Show loading only briefly
  if (isLoadingAuth) {
    return fallback;
  }

  // ✅ If auth is checked and no user, redirect
  if (authChecked && !user) {
    return unauthenticatedElement;
  }

  // ✅ If user exists, render children
  if (user) {
    return <Outlet />;
  }

  // ✅ Fallback loading state
  return fallback;
}