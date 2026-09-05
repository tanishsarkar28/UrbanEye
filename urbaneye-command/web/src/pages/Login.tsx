import React, { useState } from 'react';
import { Shield, Lock, Mail, AlertCircle, Loader2, UserCheck } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User, token: string) => void;
  onBack?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onBack }) => {
  const [email, setEmail] = useState('head.kapurthala@urbaneye.gov.in');
  const [password, setPassword] = useState('UrbanEye@2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.login(email.trim(), password);
      localStorage.setItem('urbaneye_token', res.token);
      onLoginSuccess(res.user, res.token);
    } catch (err: any) {
      setError(err.message || 'Invalid government credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setTestAccount = (testEmail: string) => {
    setEmail(testEmail);
    setPassword('UrbanEye@2026');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#07162c] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {onBack && (
          <div className="mb-4">
            <button
              type="button"
              onClick={onBack}
              className="text-xs text-slate-400 hover:text-white flex items-center space-x-1.5 transition px-2 py-1 rounded hover:bg-slate-800/50"
            >
              <span>← Back to Overview</span>
            </button>
          </div>
        )}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-lg">
            <Shield className="w-8 h-8 text-amber-400" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-extrabold text-white tracking-tight">
          UrbanEye Command Portal
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Government Road Intelligence & Bus Edge-AI Platform
        </p>
        <div className="mt-2 text-center">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-400/10 text-amber-300 border border-amber-400/20">
            Authorized Personnel Only
          </span>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-xl sm:px-10 border border-slate-200">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-800 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>Official Government Email</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="officer@urbaneye.gov.in"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Password</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-xs font-bold rounded-md text-white bg-[#0b2545] hover:bg-[#134074] focus:outline-none transition shadow-sm flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Access Command Center</span>
              )}
            </button>
          </form>

          {/* Evaluator Quick Access Credentials */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center">
              <UserCheck className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Quick Persona Switcher (Testing):
            </div>
            <div className="grid grid-cols-1 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setTestAccount('head.kapurthala@urbaneye.gov.in')}
                className={`text-left px-2.5 py-1.5 rounded border transition flex items-center justify-between ${
                  email === 'head.kapurthala@urbaneye.gov.in'
                    ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold ring-1 ring-amber-400'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>★ District Head (Kapurthala / LPU Demo)</span>
                <span className="text-[10px] text-amber-700 font-bold">LIVE DEMO</span>
              </button>

              <button
                type="button"
                onClick={() => setTestAccount('head.jalandhar@urbaneye.gov.in')}
                className={`text-left px-2.5 py-1.5 rounded border transition flex items-center justify-between ${
                  email === 'head.jalandhar@urbaneye.gov.in'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>District Head (Jalandhar)</span>
                <span className="text-[10px] text-slate-400">Scoped</span>
              </button>

              <button
                type="button"
                onClick={() => setTestAccount('admin.pb@urbaneye.gov.in')}
                className={`text-left px-2.5 py-1.5 rounded border transition flex items-center justify-between ${
                  email === 'admin.pb@urbaneye.gov.in'
                    ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>State Admin (Punjab)</span>
                <span className="text-[10px] text-slate-400">State View</span>
              </button>

              <button
                type="button"
                onClick={() => setTestAccount('head.mumbai@urbaneye.gov.in')}
                className={`text-left px-2.5 py-1.5 rounded border transition flex items-center justify-between ${
                  email === 'head.mumbai@urbaneye.gov.in'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>District Head (Mumbai Suburban)</span>
                <span className="text-[10px] text-slate-400">Scoped</span>
              </button>

              <button
                type="button"
                onClick={() => setTestAccount('head.bengaluru@urbaneye.gov.in')}
                className={`text-left px-2.5 py-1.5 rounded border transition flex items-center justify-between ${
                  email === 'head.bengaluru@urbaneye.gov.in'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>District Head (Bengaluru Urban)</span>
                <span className="text-[10px] text-slate-400">Scoped</span>
              </button>

              <button
                type="button"
                onClick={() => setTestAccount('admin.mh@urbaneye.gov.in')}
                className={`text-left px-2.5 py-1.5 rounded border transition flex items-center justify-between ${
                  email === 'admin.mh@urbaneye.gov.in'
                    ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>State Admin (Maharashtra)</span>
                <span className="text-[10px] text-slate-400">State View</span>
              </button>

              <button
                type="button"
                onClick={() => setTestAccount('admin@urbaneye.gov.in')}
                className={`text-left px-2.5 py-1.5 rounded border transition flex items-center justify-between ${
                  email === 'admin@urbaneye.gov.in'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>National Admin (All India)</span>
                <span className="text-[10px] text-slate-400">Full Access</span>
              </button>
            </div>
            <div className="mt-2 text-[10px] text-slate-400 text-center">
              Password for all seeded accounts: <code className="font-mono text-slate-600">UrbanEye@2026</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
