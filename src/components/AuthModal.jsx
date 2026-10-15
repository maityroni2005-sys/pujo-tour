import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal = ({ onClose }) => {
  const { 
    currentUser, 
    loginWithSupabase, 
    signUpWithSupabase, 
    logout, 
    switchDemoRole, 
    loading, 
    authError 
  } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('user');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'login') {
      const res = await loginWithSupabase(email, password);
      if (res.success) onClose();
    } else {
      const res = await signUpWithSupabase(email, password, fullName, role);
      if (res.success) onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-stone-900 border border-amber-500/30 rounded-3xl shadow-2xl p-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-stone-800 text-stone-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 p-0.5">
            <div className="w-full h-full bg-stone-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-black text-stone-100 font-display">
              {currentUser ? 'My UtsavRoute Account' : mode === 'login' ? 'Sign In to UtsavRoute' : 'Create Account'}
            </h3>
            <p className="text-[11px] text-stone-400">
              Role-Based Access Control (RBAC) System
            </p>
          </div>
        </div>

        {authError && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {currentUser ? (
          /* Logged In View */
          <div className="space-y-4 pt-2">
            <div className="bg-stone-950/80 p-4 rounded-2xl border border-stone-800 flex items-center gap-3">
              <img
                src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                alt="Avatar"
                className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/40"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-stone-100 truncate">
                  {currentUser.full_name}
                </h4>
                <p className="text-xs text-stone-400 truncate">{currentUser.email}</p>
                <span className={`inline-block mt-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                  currentUser.role === 'admin' ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-300'
                }`}>
                  {currentUser.role === 'admin' ? '🛡️ Admin / Police Controller' : '🚶 Regular Puja Visitor'}
                </span>
              </div>
            </div>

            <div className="bg-stone-950/50 p-3 rounded-xl border border-stone-800/80 text-xs text-stone-400 space-y-1.5">
              <div className="font-bold text-stone-300">Quick Role Switch (Demo Mode):</div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => switchDemoRole('user')}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold border transition-colors ${
                    currentUser.role === 'user'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white'
                  }`}
                >
                  Visitor Account
                </button>
                <button
                  type="button"
                  onClick={() => switchDemoRole('admin')}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                    currentUser.role === 'admin'
                      ? 'bg-amber-500 text-stone-950 border-amber-400'
                      : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-amber-400'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin Account
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          /* Login / Signup Form */
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {mode === 'signup' && (
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Sourav Mukherjee"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-stone-300 block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-300 block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">
                  Account Role (RBAC)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('user')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      role === 'user'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-stone-950 border-stone-800 text-stone-400'
                    }`}
                  >
                    Visitor
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      role === 'admin'
                        ? 'bg-amber-500 border-amber-400 text-stone-950'
                        : 'bg-stone-950 border-stone-800 text-stone-400'
                    }`}
                  >
                    Admin / Police
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-700 to-amber-600 hover:brightness-110 text-white font-bold text-xs shadow transition-all"
            >
              {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Create Free Account'}
            </button>

            {/* Quick Demo Pre-filled Credentials */}
            <div className="pt-2 border-t border-stone-800 text-center">
              <span className="text-[11px] text-stone-400 block mb-2 font-medium">
                Or jump right in with 1-click Demo credentials:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    switchDemoRole('admin');
                    onClose();
                  }}
                  className="py-1.5 px-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <ShieldCheck className="w-3 h-3" /> Demo Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    switchDemoRole('user');
                    onClose();
                  }}
                  className="py-1.5 px-2 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 text-[11px] font-bold rounded-lg transition-colors"
                >
                  Demo Visitor
                </button>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-xs text-amber-400 hover:underline"
              >
                {mode === 'login'
                  ? "Don't have an account? Sign up"
                  : 'Already registered? Sign in'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
