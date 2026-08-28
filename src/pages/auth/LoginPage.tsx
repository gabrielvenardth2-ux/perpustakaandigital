import React, { useState } from 'react';
import {
  BookOpen,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  UserCheck,
  ShieldAlert,
  Sparkles,
  Database
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoginPageProps {
  onSwitchToRegister: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
  onOpenSetup: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSwitchToRegister,
  onShowToast,
  onOpenSetup
}) => {
  const { login, isDemoMode, apiUrl } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('Email/NIS dan kata sandi wajib diisi.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const res = await login(identifier.trim(), password);
      if (res.success) {
        onShowToast('success', res.message);
      } else {
        setErrorMessage(res.message);
        onShowToast('error', res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login gagal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Shortcut login demo untuk kemudahan pengujian
  const handleQuickLogin = (emailOrNis: string, pass: string) => {
    setIdentifier(emailOrNis);
    setPassword(pass);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Header */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/30 mb-4 ring-4 ring-blue-500/20">
          <BookOpen className="w-7 h-7" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading">
          Perpustakaan Digital
        </h2>
        <p className="mt-1 text-sm text-slate-300">
          SMA Negeri 1 • Sistem Informasi Sirkulasi Buku
        </p>

        {/* Database Mode Badge */}
        <div className="mt-3 inline-flex items-center gap-2">
          <button
            onClick={onOpenSetup}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-slate-200 backdrop-blur-md border border-white/15 transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>
              {!isDemoMode && apiUrl ? '🟢 Terhubung ke Google Sheets' : '🟡 Mode Demo Offline Aktif'}
            </span>
          </button>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-2xl rounded-3xl border border-slate-100/10 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email atau NIS Siswa
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="faiz@siswa.sch.id atau 20241001"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Memverifikasi Akun...' : 'Masuk ke Perpustakaan'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Test Buttons */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-2.5 flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Akses Cepat Pengujian Demo
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@perpustakaan.sch.id', 'admin123')}
                className="p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-900 text-left transition-colors"
              >
                <div className="text-xs font-bold flex items-center gap-1 text-indigo-700">
                  <ShieldAlert className="w-3 h-3" /> Akun Guru/Admin
                </div>
                <div className="text-[10px] text-indigo-600 truncate mt-0.5">
                  admin@perpustakaan.sch.id
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('20241001', 'password')}
                className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 text-left transition-colors"
              >
                <div className="text-xs font-bold flex items-center gap-1 text-emerald-700">
                  <UserCheck className="w-3 h-3" /> Akun Siswa (Faiz)
                </div>
                <div className="text-[10px] text-emerald-600 truncate mt-0.5">
                  NIS: 20241001
                </div>
              </button>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-5 text-center text-xs text-slate-500">
            Belum memiliki akun siswa?{' '}
            <button
              onClick={onSwitchToRegister}
              className="font-bold text-blue-600 hover:text-blue-700 underline"
            >
              Daftar Akun Baru
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
