import React, { useState } from 'react';
import {
  BookOpen,
  User,
  Hash,
  Mail,
  Lock,
  GraduationCap,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onSwitchToLogin,
  onShowToast
}) => {
  const { register } = useAuth();
  const [nama, setNama] = useState('');
  const [nis, setNis] = useState('');
  const [email, setEmail] = useState('');
  const [kelas, setKelas] = useState('X MIPA 1');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const kelasOptions = [
    'X MIPA 1', 'X MIPA 2', 'X IPS 1', 'X IPS 2',
    'XI MIPA 1', 'XI MIPA 2', 'XI IPS 1', 'XI IPS 2',
    'XII MIPA 1', 'XII MIPA 2', 'XII IPS 1', 'XII IPS 2'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !nis.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Semua kolom bertanda bintang (*) wajib diisi.');
      return;
    }

    if (password.length < 5) {
      setErrorMsg('Kata sandi minimal terdiri dari 5 karakter.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await register({
        nama: nama.trim(),
        nis: nis.trim(),
        email: email.trim(),
        password: password.trim(),
        kelas: kelas.trim()
      });

      if (res.success) {
        onShowToast('success', 'Pendaftaran berhasil! Silakan masuk dengan akun Anda.');
        onSwitchToLogin();
      } else {
        setErrorMsg(res.message);
        onShowToast('error', res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Pendaftaran gagal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/30 mb-3">
          <BookOpen className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-white font-heading">
          Pendaftaran Siswa Baru
        </h2>
        <p className="mt-1 text-xs text-slate-300">
          Buat akun perpustakaan untuk mulai meminjam buku literasi dan pelajaran
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-7 px-6 sm:px-8 shadow-2xl rounded-3xl border border-slate-100/10">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800">
                {errorMsg}
              </div>
            )}

            {/* Nama Lengkap */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nama Lengkap *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Bintang"
                  value={nama}
                  onChange={e => setNama(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
            </div>

            {/* NIS & Kelas Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  NIS Siswa *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Hash className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="2024xxxx"
                    value={nis}
                    onChange={e => setNis(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kelas *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <select
                    value={kelas}
                    onChange={e => setKelas(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  >
                    {kelasOptions.map(k => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Alamat Email *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="nama@siswa.sch.id"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Kata Sandi *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Minimal 5 karakter"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role Notice (Mandatory Security from Section 4) */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Role Terdaftar:</span>
              </div>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Siswa
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-3 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Mendaftarkan Akun...' : 'Daftar Sebagai Siswa'}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-slate-500 pt-4 border-t border-slate-100">
            Sudah memiliki akun?{' '}
            <button
              onClick={onSwitchToLogin}
              className="font-bold text-blue-600 hover:text-blue-700 underline inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Masuk ke Akun
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
