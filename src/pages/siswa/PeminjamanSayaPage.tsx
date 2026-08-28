import React, { useMemo } from 'react';
import { Borrowing } from '../../types';
import {
  BookmarkCheck,
  Calendar,
  Clock,
  AlertTriangle,
  Info,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';
import { TableSkeleton } from '../../components/LoadingSkeleton';

interface PeminjamanSayaPageProps {
  borrowings: Borrowing[];
  isLoading: boolean;
  onNavigateKatalog: () => void;
}

export const PeminjamanSayaPage: React.FC<PeminjamanSayaPageProps> = ({
  borrowings,
  isLoading,
  onNavigateKatalog
}) => {
  // Hanya tampilkan yang berstatus aktif: 'dipinjam' atau 'terlambat'
  const activeLoans = useMemo(() => {
    return borrowings.filter(b => b.status === 'dipinjam' || b.status === 'terlambat');
  }, [borrowings]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  const getDaysDiff = (dueDateStr: string) => {
    if (!dueDateStr) return 0;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-heading">
            Peminjaman Aktif Saya
          </h2>
          <p className="text-xs text-slate-500">
            Daftar buku yang sedang Anda pinjam dan batas waktu pengembaliannya
          </p>
        </div>
        <div className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 self-start sm:self-auto">
          {activeLoans.length} Buku Sedang Dipinjam
        </div>
      </div>

      {/* Info notice on returning books */}
      <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3 text-xs text-blue-900 leading-relaxed">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Prosedur Pengembalian Buku:</span> Bawa buku fisik ke meja sirkulasi perpustakaan sekolah. Petugas atau Guru perpustakaan akan memproses pengembalian melalui sistem untuk memperbarui status dan mengembalikan kuota peminjaman Anda.
        </div>
      </div>

      {/* Active Borrowings Cards */}
      {isLoading ? (
        <TableSkeleton rows={4} />
      ) : activeLoans.length === 0 ? (
        <EmptyState
          icon={BookmarkCheck}
          title="Tidak Ada Buku yang Sedang Dipinjam"
          description="Saat ini Anda tidak memiliki tanggungan peminjaman buku aktif di perpustakaan."
          actionText="Cari Buku di Katalog"
          onAction={onNavigateKatalog}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeLoans.map(loan => {
            const daysLeft = getDaysDiff(loan.tanggal_jatuh_tempo);
            const isLate = loan.status === 'terlambat' || daysLeft < 0;

            return (
              <div
                key={loan.borrowing_id}
                className={`bg-white rounded-2xl p-5 border flex flex-col justify-between shadow-xs transition-all ${
                  isLate
                    ? 'border-rose-300 ring-1 ring-rose-300/40 bg-rose-50/20'
                    : 'border-slate-200/80'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        isLate
                          ? 'bg-rose-100 text-rose-800'
                          : daysLeft === 0
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isLate ? (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Terlambat ({Math.abs(daysLeft)} hari)
                        </>
                      ) : daysLeft === 0 ? (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          Jatuh Tempo Hari Ini!
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          Sisa {daysLeft} hari lagi
                        </>
                      )}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      #{loan.borrowing_id}
                    </span>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-20 h-28 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200/60 shadow-2xs">
                      {loan.cover_url ? (
                        <img
                          src={loan.cover_url}
                          alt={loan.judul}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <BookOpen className="w-8 h-8 stroke-1" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                        {loan.judul}
                      </h3>
                      <p className="text-xs text-slate-500 truncate mt-1">
                        {loan.penulis}
                      </p>

                      <div className="mt-3 space-y-1 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Tanggal Pinjam:</span>
                          <span className="font-medium">{formatDate(loan.tanggal_pinjam)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Batas Waktu:</span>
                          <span className={`font-bold ${isLate ? 'text-rose-600' : 'text-slate-800'}`}>
                            {formatDate(loan.tanggal_jatuh_tempo)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Lokasi Sirkulasi: Meja Perpustakaan Lt. 1</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
