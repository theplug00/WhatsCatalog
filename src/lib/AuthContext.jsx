import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from './supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        setIsLoadingAuth(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
          // Fetch user profile or app settings here if needed
          // setAppPublicSettings(await fetchAppSettings(session.user.id));
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Session check failed:', error);
        setAuthError({
          type: 'auth_required',
          message: 'Authentication required'
        });
      } finally {
        setIsLoadingAuth(false);
        setIsLoadingPublicSettings(false);
        setAuthChecked(true);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
        setAuthError(null);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoadingAuth(false);
      setAuthChecked(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      setUser(data.user);
      setIsAuthenticated(true);
      setAuthChecked(true);
      return data;
    } catch (error) {
      setAuthError({
        type: 'auth_required',
        message: error.message || 'Login failed'
      });
      throw error;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const register = async (email, password, metadata = {}) => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) throw error;

      setUser(data.user);
      setIsAuthenticated(true);
      setAuthChecked(true);
      return data;
    } catch (error) {
      setAuthError({
        type: 'registration_failed',
        message: error.message || 'Registration failed'
      });
      throw error;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = async (shouldRedirect = true) => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      setAuthError(null);
      
      if (shouldRedirect) {
        window.location.href = '/vendor/login';
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/vendor/login';
  };

  // Helper to fetch app public settings (mocked for now)
  const fetchAppPublicSettings = async (userId) => {
    try {
      // Replace with your actual API call
      // This is a placeholder
      return { id: 'app-1', public_settings: {} };
    } catch (error) {
      console.error('Failed to fetch app settings:', error);
      return null;
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoadingAuth,
    isLoadingPublicSettings,
    authError,
    appPublicSettings,
    authChecked,
    login,
    register,
    logout,
    navigateToLogin,
    // Keep these for compatibility with existing code
    checkUserAuth: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsAuthenticated(!!user);
      return user;
    },
    checkAppState: async () => {
      // Just check session state
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setIsAuthenticated(!!session?.user);
      setIsLoadingPublicSettings(false);
      setAuthChecked(true);
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};