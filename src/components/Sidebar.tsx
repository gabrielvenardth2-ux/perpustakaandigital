import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  BookmarkCheck,
  History,
  User,
  Users,
  BookMarked,
  RotateCcw,
  LogOut,
  X,
  GraduationCap,
  ShieldCheck,
  Sliders
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type ActivePage =
  | 'siswa-dashboard'
  | 'siswa-katalog'
  | 'siswa-peminjaman'
  | 'siswa-riwayat'
  | 'siswa-profil'
  | 'admin-dashboard'
  | 'admin-buku'
  | 'admin-pengguna'
  | 'admin-peminjaman'
  | 'admin-pengembalian'
  | 'admin-riwayat';

interface SidebarProps {
  activePage: ActivePage;
  onSelectPage: (page: ActivePage) => void;
  isOpen: boolean;
  onClose: () => void;
  activeLoansCount?: number;
  overdueCount?: number;
}

interface NavItem {
  id: ActivePage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  badgeAlert?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onSelectPage,
  isOpen,
  onClose,
  activeLoansCount = 0,
  overdueCount = 0
}) => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'guru';

  const siswaNavItems: NavItem[] = [
    {
      id: 'siswa-dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'siswa-katalog',
      label: 'Katalog Buku',
      icon: BookOpen
    },
    {
      id: 'siswa-peminjaman',
      label: 'Peminjaman Saya',
      icon: BookmarkCheck,
      badge: activeLoansCount > 0 ? activeLoansCount : undefined,
      badgeAlert: overdueCount > 0
    },
    {
      id: 'siswa-riwayat',
      label: 'Riwayat Peminjaman',
      icon: History
    },
    {
      id: 'siswa-profil',
      label: 'Profil Siswa',
      icon: User
    }
  ];

  const adminNavItems: NavItem[] = [
    {
      id: 'admin-dashboard',
      label: 'Dashboard Admin',
      icon: LayoutDashboard
    },
    {
      id: 'admin-buku',
      label: 'Kelola Buku',
      icon: BookMarked
    },
    {
      id: 'admin-pengguna',
      label: 'Kelola Pengguna',
      icon: Users
    },
    {
      id: 'admin-peminjaman',
      label: 'Peminjaman',
      icon: BookmarkCheck
    },
    {
      id: 'admin-pengembalian',
      label: 'Meja Pengembalian',
      icon: RotateCcw
    },
    {
      id: 'admin-riwayat',
      label: 'Riwayat Transaksi',
      icon: History
    }
  ];

  const navItems = isAdmin ? adminNavItems : siswaNavItems;

  const handleNavClick = (pageId: ActivePage) => {
    onSelectPage(pageId);
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 md:translate-x-0 md:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header for mobile drawer */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between md:hidden">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
            <BookOpen className="w-4 h-4 text-blue-600" />
            Menu Navigasi
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Identity Chip */}
        {user && (
          <div className="p-4 mx-3 mt-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white ${
              isAdmin ? 'bg-indigo-600' : 'bg-blue-600'
            }`}>
              {isAdmin ? <ShieldCheck className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">{user.nama}</div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <span className="truncate">{isAdmin ? 'Guru / Admin' : `NIS: ${user.nis}`}</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation links */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {isAdmin ? 'Menu Administrasi' : 'Menu Perpustakaan'}
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.badgeAlert
                        ? 'bg-rose-500 text-white animate-pulse'
                        : isActive
                        ? 'bg-blue-800 text-white'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Logout */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>
    </>
  );
};
