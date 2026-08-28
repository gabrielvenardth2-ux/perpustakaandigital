import React, { useState, useMemo } from 'react';
import { Borrowing } from '../../types';
import {
  History,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  BookOpen,
  User,
  Download,
  Filter
} from 'lucide-react';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';

interface RiwayatAdminPageProps {
  borrowings: Borrowing[];
  isLoading: boolean;
}

export const RiwayatAdminPage: React.FC<RiwayatAdminPageProps> = ({ borrowings, isLoading }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'dipinjam' | 'dikembalikan' | 'terlambat'>('all');

  const filtered = useMemo(() => {
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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const handleExportCSV = () => {
    if (filtered.length === 0) return;

    const headers = ['ID', 'Nama Siswa', 'NIS', 'Kelas', 'Judul Buku', 'Tgl Pinjam', 'Jatuh Tempo', 'Tgl Kembali', 'Status'];
    const rows = filtered.map(item => [
      item.borrowing_id,
      `"${item.nama_peminjam || ''}"`,
      item.nis_peminjam || '',
      item.kelas_peminjam || '',
      `"${item.judul || ''}"`,
      item.tanggal_pinjam || '',
      item.tanggal_jatuh_tempo || '',
      item.tanggal_kembali || '',
      item.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `riwayat_perpustakaan_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-heading">
            Riwayat Seluruh Transaksi Perpustakaan
          </h2>
          <p className="text-xs text-slate-500">
            Log audit dan arsip lengkap seluruh peminjaman dan pengembalian buku di sekolah
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={filtered.length === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-40 self-start sm:self-auto shadow-2xs"
        >
          <Download className="w-4 h-4" />
          <span>Ekspor CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama siswa, NIS, judul buku, atau ID transaksi..."
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
        <TableSkeleton rows={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={History}
          title="Tidak Ada Catatan Riwayat"
          description="Tidak ditemukan riwayat peminjaman buku dengan filter ini."
        />
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-700 font-bold border-b border-slate-200/80 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">ID Transaksi</th>
                  <th className="px-4 py-3.5">Siswa Peminjam</th>
                  <th className="px-4 py-3.5">Buku</th>
                  <th className="px-4 py-3.5">Tgl Pinjam</th>
                  <th className="px-4 py-3.5">Jatuh Tempo</th>
                  <th className="px-4 py-3.5">Tgl Kembali</th>
                  <th className="px-4 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(b => (
                  <tr key={b.borrowing_id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-slate-500 font-medium">
                      {b.borrowing_id}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{b.nama_peminjam || '-'}</div>
                      <div className="text-[11px] text-slate-400">
                        NIS: {b.nis_peminjam || '-'} • {b.kelas_peminjam || '-'}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-medium text-slate-900">{b.judul}</td>

                    <td className="px-4 py-3.5 whitespace-nowrap">{formatDate(b.tanggal_pinjam)}</td>

                    <td className="px-4 py-3.5 whitespace-nowrap font-medium text-slate-800">
                      {formatDate(b.tanggal_jatuh_tempo)}
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
                      {b.status === 'dikembalikan' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3" /> Dikembalikan
                        </span>
                      ) : b.status === 'terlambat' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertTriangle className="w-3 h-3" /> Terlambat
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <Clock className="w-3 h-3" /> Dipinjam
                        </span>
                      )}
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
