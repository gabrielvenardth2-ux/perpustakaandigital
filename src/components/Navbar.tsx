import React from 'react';
import {
  BookOpen,
  Settings,
  LogOut,
  User,
  Menu,
  Database,
  GraduationCap,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenSetup: () => void;
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSetup, onToggleSidebar }) => {
  const { user, logout, isDemoMode, apiUrl } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Mobile menu toggle + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-900 leading-tight">
                Perpustakaan Digital
              </h1>
              <p className="text-xs text-slate-500 font-medium">SMA Negeri 1</p>
            </div>
          </div>
        </div>

        {/* Center: Database Connection Badge */}
        <div className="hidden sm:flex items-center">
          <button
            onClick={onOpenSetup}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              !isDemoMode && apiUrl
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
            }`}
            title="Klik untuk konfigurasi Google Sheets & Apps Script"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                !isDemoMode && apiUrl ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
              }`}
            />
            <Database className="w-3.5 h-3.5" />
            <span>{!isDemoMode && apiUrl ? 'Google Sheets Terhubung' : 'Mode Demo Offline'}</span>
          </button>
        </div>

        {/* Right: User profile and actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenSetup}
            className="p-2 text-slate-600 hover:text-blue-600 rounded-xl hover:bg-slate-100 transition-colors"
            title="Pengaturan API & Google Sheets"
          >
            <Settings className="w-4 h-4" />
          </button>

          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center font-bold text-xs uppercase">
                  {user.nama.slice(0, 2)}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-slate-900 truncate max-w-[140px]">
                    {user.nama}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    {user.role === 'guru' ? (
                      <span className="text-indigo-600 font-semibold flex items-center gap-0.5">
                        <ShieldAlert className="w-3 h-3" /> Guru/Admin
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                        <GraduationCap className="w-3 h-3" /> {user.kelas || 'Siswa'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors ml-1"
                title="Keluar (Logout)"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
