// src/lib/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/api/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);

  // ✅ Check user auth function
  const checkUserAuth = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        setAuthError({ type: 'auth_required', message: error.message });
        setIsAuthenticated(false);
        return;
      }

      if (user) {
        setUser(user);
        setIsAuthenticated(true);
        setAuthError(null);
      } else {
        setIsAuthenticated(false);
        setAuthError({ type: 'auth_required', message: 'Please login' });
      }
    } catch (err) {
      console.error('Auth check error:', err);
      setIsAuthenticated(false);
      setAuthError({ type: 'auth_required', message: err.message });
    } finally {
      setAuthChecked(true);
      setIsLoadingAuth(false);
    }
  };

  // ✅ Get initial session
  useEffect(() => {
    const getSession = async () => {
      setIsLoadingAuth(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setAuthError({ type: 'auth_required', message: error.message });
          return;
        }

        if (session) {
          setSession(session);
          setUser(session.user);
          setIsAuthenticated(true);
        } else {
          // Check for existing session
          await checkUserAuth();
        }
      } catch (err) {
        console.error('Get session error:', err);
        setAuthError({ type: 'auth_required', message: err.message });
      } finally {
        setIsLoadingAuth(false);
        setAuthChecked(true);
      }
    };

    getSession();

    // ✅ Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN') {
          setSession(session);
          setUser(session?.user || null);
          setIsAuthenticated(true);
          setAuthError(null);
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setIsAuthenticated(false);
          setAuthError({ type: 'auth_required', message: 'Please login' });
        }
        setAuthChecked(true);
        setIsLoadingAuth(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  const value = {
    user,
    session,
    isLoadingAuth,
    isLoadingPublicSettings,
    authError,
    authChecked,
    isAuthenticated,
    checkUserAuth,  // ✅ Make sure this is exported
    navigateToLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}