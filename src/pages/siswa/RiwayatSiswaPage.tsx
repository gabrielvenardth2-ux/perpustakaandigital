import React, { useState, useMemo } from 'react';
import { Borrowing } from '../../types';
import { History, Search, Filter, BookOpen, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';

interface RiwayatSiswaPageProps {
  borrowings: Borrowing[];
  isLoading: boolean;
}

export const RiwayatSiswaPage: React.FC<RiwayatSiswaPageProps> = ({ borrowings, isLoading }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'dipinjam' | 'dikembalikan' | 'terlambat'>('all');

  const filtered = useMemo(() => {
    return borrowings.filter(item => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        (item.judul && item.judul.toLowerCase().includes(q)) ||
        (item.penulis && item.penulis.toLowerCase().includes(q)) ||
        item.borrowing_id.toLowerCase().includes(q);

      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [borrowings, search, statusFilter]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'dikembalikan':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" /> Dikembalikan
          </span>
        );
      case 'terlambat':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5" /> Terlambat
          </span>
        );
      case 'dipinjam':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5" /> Dipinjam
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-heading">
            Riwayat Peminjaman Buku
          </h2>
          <p className="text-xs text-slate-500">
            Arsip seluruh transaksi peminjaman dan pengembalian buku Anda
          </p>
        </div>
        <div className="text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs self-start sm:self-auto">
          Total Rekam: <span className="text-blue-600 font-bold">{filtered.length}</span> Transaksi
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari judul buku, penulis, atau ID transaksi..."
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
          <option value="all">Semua Status</option>
          <option value="dipinjam">Sedang Dipinjam</option>
          <option value="dikembalikan">Sudah Dikembalikan</option>
          <option value="terlambat">Terlambat</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={History}
          title="Tidak Ada Riwayat"
          description={
            search || statusFilter !== 'all'
              ? 'Tidak ditemukan riwayat peminjaman dengan filter ini.'
              : 'Anda belum memiliki riwayat peminjaman buku di perpustakaan.'
          }
        />
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-700 font-bold border-b border-slate-200/80 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">ID Transaksi</th>
                  <th className="px-4 py-3.5">Buku</th>
                  <th className="px-4 py-3.5">Tanggal Pinjam</th>
                  <th className="px-4 py-3.5">Jatuh Tempo</th>
                  <th className="px-4 py-3.5">Tanggal Kembali</th>
                  <th className="px-4 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(item => (
                  <tr key={item.borrowing_id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-slate-500 font-medium">
                      {item.borrowing_id}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-10 bg-slate-100 rounded-md overflow-hidden shrink-0 border border-slate-200/60">
                          {item.cover_url ? (
                            <img src={item.cover_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <BookOpen className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 leading-snug">{item.judul}</div>
                          <div className="text-[11px] text-slate-400">{item.penulis}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {formatDate(item.tanggal_pinjam)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap font-medium text-slate-800">
                      {formatDate(item.tanggal_jatuh_tempo)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {item.tanggal_kembali ? (
                        <span className="text-emerald-700 font-medium">{formatDate(item.tanggal_kembali)}</span>
                      ) : (
                        <span className="text-slate-400 italic">Belum dikembalikan</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {renderStatusBadge(item.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
