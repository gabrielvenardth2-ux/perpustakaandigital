import React, { useState, useEffect, useMemo } from 'react';
import { User } from '../../types';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  GraduationCap,
  ShieldCheck,
  Power
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';

interface KelolaPenggunaPageProps {
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const KelolaPenggunaPage: React.FC<KelolaPenggunaPageProps> = ({ onShowToast }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'siswa' | 'guru'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'aktif' | 'nonaktif'>('all');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, [user]);

  const loadUsers = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await api.getUsers(user.user_id);
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (e) {
      console.error('Gagal mengambil daftar pengguna:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (targetUser: User) => {
    if (!user) return;
    const newStatus = targetUser.status === 'aktif' ? 'nonaktif' : 'aktif';

    // Protect self
    if (targetUser.user_id === user.user_id) {
      onShowToast('error', 'Anda tidak dapat menonaktifkan akun Anda sendiri!');
      return;
    }

    setIsUpdating(targetUser.user_id);
    try {
      const res = await api.updateUserStatus(user.user_id, targetUser.user_id, newStatus);
      if (res.success) {
        onShowToast('success', `Status ${targetUser.nama} berhasil diubah menjadi ${newStatus}.`);
        loadUsers();
      } else {
        onShowToast('error', res.message || 'Gagal mengubah status pengguna.');
      }
    } catch (err: any) {
      onShowToast('error', err.message || 'Gagal mengubah status.');
    } finally {
      setIsUpdating(null);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        u.nama.toLowerCase().includes(q) ||
        u.nis.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.kelas && u.kelas.toLowerCase().includes(q));

      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const matchStatus = statusFilter === 'all' || u.status === statusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-heading">
            Kelola Pengguna Perpustakaan
          </h2>
          <p className="text-xs text-slate-500">
            Daftar seluruh akun siswa dan guru/admin perpustakaan serta pengaturan status keaktifan
          </p>
        </div>
        <div className="text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs self-start sm:self-auto">
          Total Pengguna: <span className="text-blue-600 font-bold">{filteredUsers.length}</span> Akun
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, NIS, email, atau kelas siswa..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          />
        </div>

        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value as any)}
          className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="all">Semua Role</option>
          <option value="siswa">Hanya Siswa</option>
          <option value="guru">Hanya Guru/Admin</option>
        </select>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as any)}
          className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="all">Semua Status</option>
          <option value="aktif">Aktif</option>
          <option value="nonaktif">Nonaktif</option>
        </select>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Tidak Ada Pengguna"
          description="Tidak ditemukan pengguna dengan kriteria pencarian saat ini."
        />
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-700 font-bold border-b border-slate-200/80 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Nama & NIS</th>
                  <th className="px-4 py-3.5">Email</th>
                  <th className="px-4 py-3.5">Kelas</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Status Akun</th>
                  <th className="px-4 py-3.5 text-right">Aksi Kelola</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(u => {
                  const isCurrent = u.user_id === user?.user_id;
                  const isAktif = u.status === 'aktif';
                  const isGuru = u.role === 'guru';

                  return (
                    <tr key={u.user_id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white ${
                              isGuru ? 'bg-indigo-600' : 'bg-blue-600'
                            }`}
                          >
                            {u.nama.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{u.nama}</span>
                              {isCurrent && (
                                <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 rounded">
                                  Anda
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400">NIS: {u.nis}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-slate-700">{u.email}</td>

                      <td className="px-4 py-3.5">
                        {u.kelas ? (
                          <span className="font-medium text-slate-800">{u.kelas}</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        {isGuru ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <ShieldCheck className="w-3 h-3" /> Guru / Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <GraduationCap className="w-3 h-3" /> Siswa
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        {isAktif ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                            <CheckCircle2 className="w-3 h-3" /> Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700">
                            <XCircle className="w-3 h-3" /> Nonaktif
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={isCurrent || isUpdating === u.user_id}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                            isAktif
                              ? 'text-rose-600 hover:bg-rose-50 border border-rose-200'
                              : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                          }`}
                        >
                          <Power className="w-3 h-3" />
                          <span>{isAktif ? 'Nonaktifkan' : 'Aktifkan'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
