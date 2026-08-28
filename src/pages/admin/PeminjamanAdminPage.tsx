import React, { useState, useMemo } from 'react';
import { Borrowing } from '../../types';
import {
  BookmarkCheck,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  User,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';

interface PeminjamanAdminPageProps {
  borrowings: Borrowing[];
  isLoading: boolean;
  onRefresh: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const PeminjamanAdminPage: React.FC<PeminjamanAdminPageProps> = ({
  borrowings,
  isLoading,
  onRefresh,
  onShowToast
}) => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'dipinjam' | 'dikembalikan' | 'terlambat'>('all');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const filteredBorrowings = useMemo(() => {
    return borrowings.filter(b => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        b.borrowing_id.toLowerCase().includes(q) ||
        (b.nama_peminjam && b.nama_peminjam.toLowerCase().includes(q)) ||
        (b.nis_peminjam && b.nis_peminjam.toLowerCase().includes(q)) ||
        (b.judul && b.judul.toLowerCase().includes(q));

      const matchStatus = statusFilter === 'all' || b.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [borrowings, search, statusFilter]);

  const handleReturnBook = async (item: Borrowing) => {
    if (!user) return;
    const confirm = window.confirm(
      `Konfirmasi pengembalian buku "${item.judul}" oleh ${item.nama_peminjam}?\nStok buku akan otomatis ditambahkan kembali ke rak perpustakaan.`
    );
    if (!confirm) return;

    setIsProcessing(item.borrowing_id);
    try {
      const res = await api.returnBook(user.user_id, item.borrowing_id);
      if (res.success) {
        onShowToast('success', `Buku "${item.judul}" berhasil dikembalikan! Stok telah diperbarui.`);
        onRefresh();
      } else {
        onShowToast('error', res.message || 'Gagal memproses pengembalian buku.');
      }
    } catch (err: any) {
      onShowToast('error', err.message || 'Gagal mengembalikan buku.');
    } finally {
      setIsProcessing(null);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-heading">
            Data Sirkulasi & Peminjaman Buku
          </h2>
          <p className="text-xs text-slate-500">
            Daftar seluruh transaksi peminjaman siswa, pantau status keterlambatan, dan proses pengembalian
          </p>
        </div>
        <div className="text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs self-start sm:self-auto">
          Total Transaksi: <span className="text-blue-600 font-bold">{filteredBorrowings.length}</span> Catatan
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari ID transaksi, nama peminjam, NIS, atau judul buku..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as any)}
          className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="all">Semua Status Sirkulasi</option>
          <option value="dipinjam">Sedang Dipinjam</option>
          <option value="terlambat">Terlambat (Lewat Waktu)</option>
          <option value="dikembalikan">Sudah Dikembalikan</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : filteredBorrowings.length === 0 ? (
        <EmptyState
          icon={BookmarkCheck}
          title="Tidak Ada Data Peminjaman"
          description="Tidak ditemukan catatan peminjaman sesuai filter ini."
        />
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-700 font-bold border-b border-slate-200/80 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">ID & Siswa Peminjam</th>
                  <th className="px-4 py-3.5">Buku Dipinjam</th>
                  <th className="px-4 py-3.5">Tgl Pinjam</th>
                  <th className="px-4 py-3.5">Jatuh Tempo</th>
                  <th className="px-4 py-3.5">Tgl Kembali</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Aksi Sirkulasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBorrowings.map(b => {
                  const isLate = b.status === 'terlambat';
                  const isReturned = b.status === 'dikembalikan';

                  return (
                    <tr key={b.borrowing_id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{b.nama_peminjam || 'Siswa'}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono">NIS: {b.nis_peminjam || '-'}</span>
                          {b.kelas_peminjam && (
                            <>
                              <span>•</span>
                              <span>{b.kelas_peminjam}</span>
                            </>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 mt-1">
                          Ref: #{b.borrowing_id}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-10 bg-slate-100 rounded-md overflow-hidden shrink-0 border border-slate-200">
                            {b.cover_url ? (
                              <img src={b.cover_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <BookOpen className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 leading-snug line-clamp-1">{b.judul}</div>
                            <div className="text-[11px] text-slate-400">{b.penulis}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {formatDate(b.tanggal_pinjam)}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`font-semibold ${isLate ? 'text-rose-600' : 'text-slate-800'}`}>
                          {formatDate(b.tanggal_jatuh_tempo)}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {b.tanggal_kembali ? (
                          <span className="text-emerald-700 font-medium">
                            {formatDate(b.tanggal_kembali)}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Belum kembali</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {isReturned ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="w-3 h-3" /> Dikembalikan
                          </span>
                        ) : isLate ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                            <AlertTriangle className="w-3 h-3" /> Terlambat
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <Clock className="w-3 h-3" /> Dipinjam
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        {!isReturned ? (
                          <button
                            onClick={() => handleReturnBook(b)}
                            disabled={isProcessing === b.borrowing_id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs active:scale-95 disabled:opacity-50"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>
                              {isProcessing === b.borrowing_id ? 'Memproses...' : 'Proses Pengembalian'}
                            </span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Selesai</span>
                        )}
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
