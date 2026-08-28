import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Users,
  BookmarkCheck,
  AlertTriangle,
  Layers,
  RotateCcw,
  PlusCircle,
  TrendingUp,
  BarChart3,
  PieChart,
  Calendar,
  CheckCircle,
  Database,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { DashboardStatsAdmin, Borrowing } from '../../types';
import { StatsCardSkeleton, TableSkeleton } from '../../components/LoadingSkeleton';

interface AdminDashboardProps {
  onNavigateBuku: () => void;
  onNavigatePengguna: () => void;
  onNavigatePeminjaman: () => void;
  onNavigatePengembalian: () => void;
  onOpenSetup: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateBuku,
  onNavigatePengguna,
  onNavigatePeminjaman,
  onNavigatePengembalian,
  onOpenSetup,
  onShowToast
}) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStatsAdmin | null>(null);
  const [recentBorrowings, setRecentBorrowings] = useState<Borrowing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [statsRes, loansRes] = await Promise.all([
        api.getDashboardStatsAdmin(user.user_id),
        api.getAllBorrowings(user.user_id)
      ]);

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
      if (loansRes.success && loansRes.data) {
        setRecentBorrowings(loansRes.data.slice(0, 5));
      }
    } catch (e) {
      console.error('Gagal mengambil statistik admin:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  // Peminjaman terlambat yang memerlukan tindakan
  const overdueLoans = recentBorrowings.filter(b => b.status === 'terlambat');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <span>Panel Administrator Perpustakaan</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading">
            Dashboard Pengelola Perpustakaan
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Pantau sirkulasi buku, inventaris judul dan eksemplar, peminjaman aktif siswa, serta proses pengembalian buku secara real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onNavigateBuku}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 text-white active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Kelola Buku</span>
          </button>

          <button
            onClick={onNavigatePengembalian}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 font-bold text-xs text-white transition-all flex items-center gap-1.5 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Meja Pengembalian</span>
          </button>
        </div>
      </div>

      {/* 5 Main Metric Cards (Mandatory from prompt section 14) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {isLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            {/* Total Buku */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Total Judul Buku</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900 font-heading">
                  {stats?.total_buku ?? 0}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {stats?.total_eksemplar ?? 0} Total Eksemplar
                </div>
              </div>
            </div>

            {/* Total Pengguna */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Total Pengguna</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900 font-heading">
                  {stats?.total_pengguna ?? 0}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Siswa & Guru Terdaftar</div>
              </div>
            </div>

            {/* Sedang Dipinjam */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Sedang Dipinjam</span>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BookmarkCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900 font-heading">
                  {stats?.total_dipinjam ?? 0}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Transaksi aktif</div>
              </div>
            </div>

            {/* Buku Terlambat */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Buku Terlambat</span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  (stats?.total_terlambat ?? 0) > 0
                    ? 'bg-rose-50 text-rose-600'
                    : 'bg-slate-50 text-slate-400'
                }`}>
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className={`text-2xl font-bold font-heading ${
                  (stats?.total_terlambat ?? 0) > 0 ? 'text-rose-600' : 'text-slate-800'
                }`}>
                  {stats?.total_terlambat ?? 0}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Melewati jatuh tempo</div>
              </div>
            </div>

            {/* Total Tersedia */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Buku Tersedia</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900 font-heading">
                  {stats?.total_tersedia ?? 0}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Tersedia di rak</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Visual Statistics & Charts (Prompt section 14) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Category Breakdown Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Distribusi Koleksi Berdasarkan Kategori
            </h4>
            <span className="text-xs text-slate-400">Total Koleksi</span>
          </div>

          <div className="space-y-3 pt-2">
            {stats?.kategori_distribution && stats.kategori_distribution.length > 0 ? (
              stats.kategori_distribution.map((cat, idx) => {
                const maxCount = Math.max(...stats.kategori_distribution.map(c => c.count), 1);
                const percent = Math.round((cat.count / maxCount) * 100);
                return (
                  <div key={cat.kategori} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-700">
                      <span>{cat.kategori}</span>
                      <span className="font-bold text-slate-900">{cat.count} Judul</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          idx % 3 === 0
                            ? 'bg-blue-600'
                            : idx % 3 === 1
                            ? 'bg-indigo-600'
                            : 'bg-emerald-600'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">Belum ada data kategori buku</p>
            )}
          </div>
        </div>

        {/* Quick Circulation Stats */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Rasio Pemanfaatan Koleksi
            </h4>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500">Tingkat Sirkulasi:</span>
                <span className="font-bold text-slate-800">
                  {stats && stats.total_eksemplar > 0
                    ? `${Math.round((stats.total_dipinjam / stats.total_eksemplar) * 100)}%`
                    : '0%'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between text-emerald-900">
                <span className="text-emerald-700">Eksemplar di Rak:</span>
                <span className="font-bold">{stats?.total_tersedia ?? 0}</span>
              </div>

              <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 flex items-center justify-between text-rose-900">
                <span className="text-rose-700">Tingkat Keterlambatan:</span>
                <span className="font-bold">
                  {stats && stats.total_dipinjam > 0
                    ? `${Math.round((stats.total_terlambat / stats.total_dipinjam) * 100)}%`
                    : '0%'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={onNavigatePeminjaman}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Buka Seluruh Peminjaman</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            Peminjaman Terbaru
          </h4>
          <button
            onClick={onNavigatePeminjaman}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            Lihat Semua &gt;
          </button>
        </div>

        {recentBorrowings.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">Belum ada transaksi peminjaman.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200/60 uppercase text-[10px]">
                <tr>
                  <th className="px-3.5 py-2.5">ID</th>
                  <th className="px-3.5 py-2.5">Peminjam</th>
                  <th className="px-3.5 py-2.5">Judul Buku</th>
                  <th className="px-3.5 py-2.5">Tgl Pinjam</th>
                  <th className="px-3.5 py-2.5">Jatuh Tempo</th>
                  <th className="px-3.5 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentBorrowings.map(item => (
                  <tr key={item.borrowing_id} className="hover:bg-slate-50/50">
                    <td className="px-3.5 py-2.5 font-mono text-slate-400">{item.borrowing_id}</td>
                    <td className="px-3.5 py-2.5">
                      <div className="font-bold text-slate-800">{item.nama_peminjam || '-'}</div>
                      <div className="text-[10px] text-slate-400">{item.kelas_peminjam || '-'}</div>
                    </td>
                    <td className="px-3.5 py-2.5 font-medium text-slate-900">{item.judul}</td>
                    <td className="px-3.5 py-2.5">{formatDate(item.tanggal_pinjam)}</td>
                    <td className="px-3.5 py-2.5 font-medium text-slate-800">
                      {formatDate(item.tanggal_jatuh_tempo)}
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'dikembalikan'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : item.status === 'terlambat'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
