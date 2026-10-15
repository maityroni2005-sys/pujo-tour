import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext();

const DEMO_ADMIN = {
  id: 'usr-admin-001',
  email: 'admin@utsavroute.in',
  full_name: 'Anirban Mukherjee (Chief Puja Officer)',
  role: 'admin',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
};

const DEMO_USER = {
  id: 'usr-pandal-hopper-101',
  email: 'sourav.ganguly@utsavroute.in',
  full_name: 'Sourav Roy (Pandal Hopper)',
  role: 'user',
  avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('utsav_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEMO_USER;
      }
    }
    return DEMO_USER;
  });

  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('utsav_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('utsav_user');
    }
  }, [currentUser]);

  // Check Supabase session if configured
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const checkSession = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Fetch profile for role
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          setCurrentUser({
            id: session.user.id,
            email: session.user.email,
            full_name: profile?.full_name || session.user.user_metadata?.full_name || 'Puja Enthusiast',
            role: profile?.role || 'user',
            avatar_url: profile?.avatar_url || '',
          });
        }
      } catch (err) {
        console.warn('Supabase auth check error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setCurrentUser({
          id: session.user.id,
          email: session.user.email,
          full_name: profile?.full_name || 'Puja Enthusiast',
          role: profile?.role || 'user',
          avatar_url: profile?.avatar_url || '',
        });
      } else {
        // Fallback to demo user if signed out
        setCurrentUser(DEMO_USER);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const loginWithSupabase = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return { success: true, user: data.user };
      } else {
        // Local simulation: Check if email indicates admin
        const isAdmin = email.toLowerCase().includes('admin');
        const userObj = {
          id: `usr-${Date.now()}`,
          email,
          full_name: isAdmin ? 'Admin Controller' : email.split('@')[0],
          role: isAdmin ? 'admin' : 'user',
          avatar_url: isAdmin ? DEMO_ADMIN.avatar_url : DEMO_USER.avatar_url,
        };
        setCurrentUser(userObj);
        return { success: true, user: userObj };
      }
    } catch (err) {
      setAuthError(err.message || 'Login failed');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const signUpWithSupabase = async (email, password, fullName, role = 'user') => {
    setLoading(true);
    setAuthError(null);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, role },
          },
        });
        if (error) throw error;
        return { success: true, user: data.user };
      } else {
        const userObj = {
          id: `usr-${Date.now()}`,
          email,
          full_name: fullName || email.split('@')[0],
          role,
          avatar_url: DEMO_USER.avatar_url,
        };
        setCurrentUser(userObj);
        return { success: true, user: userObj };
      }
    } catch (err) {
      setAuthError(err.message || 'Signup failed');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
  };

  // Quick 1-click toggle between Admin & Regular User for test & demonstration
  const switchDemoRole = (role) => {
    if (role === 'admin') {
      setCurrentUser(DEMO_ADMIN);
    } else {
      setCurrentUser(DEMO_USER);
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        loading,
        authError,
        loginWithSupabase,
        signUpWithSupabase,
        logout,
        switchDemoRole,
        setCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
