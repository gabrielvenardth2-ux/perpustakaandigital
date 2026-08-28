import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  BookmarkCheck,
  Clock,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Calendar,
  Layers,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Book, Borrowing, DashboardStatsSiswa } from '../../types';
import { BookCard } from '../../components/BookCard';
import { StatsCardSkeleton, BookCardSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';

interface SiswaDashboardProps {
  onNavigateKatalog: () => void;
  onNavigatePeminjaman: () => void;
  onSelectBook: (book: Book) => void;
}

export const SiswaDashboard: React.FC<SiswaDashboardProps> = ({
  onNavigateKatalog,
  onNavigatePeminjaman,
  onSelectBook
}) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStatsSiswa | null>(null);
  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [myActiveLoans, setMyActiveLoans] = useState<Borrowing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [statsRes, booksRes, loansRes] = await Promise.all([
        api.getDashboardStatsSiswa(user.user_id),
        api.getBooks(),
        api.getMyBorrowings(user.user_id)
      ]);

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
      if (booksRes.success && booksRes.data) {
        setRecentBooks(booksRes.data.slice(0, 4));
      }
      if (loansRes.success && loansRes.data) {
        const active = loansRes.data.filter(l => l.status === 'dipinjam' || l.status === 'terlambat');
        setMyActiveLoans(active);
      }
    } catch (err) {
      console.error('Gagal memuat dashboard siswa:', err);
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

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-900/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md border border-white/20">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Siswa SMAN 1 • {user?.kelas || 'Kelas Siswa'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading">
            Selamat Datang, {user?.nama}!
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
            Perpustakaan digital menyediakan ratusan referensi buku mata pelajaran dan sastra. Pinjam buku dengan mudah dan pantau batas waktu pengembalian Anda.
          </p>
        </div>

        <button
          onClick={onNavigateKatalog}
          className="px-5 py-3 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shadow-lg transition-all flex items-center gap-2 shrink-0 active:scale-95"
        >
          <BookOpen className="w-4 h-4" />
          <span>Jelajahi Katalog Buku</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {isLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Buku Dipinjam</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <BookmarkCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900 font-heading">
                  {myActiveLoans.length}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Maksimal kuota: {stats?.maksimal_pinjam || 3} buku
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Buku Tersedia</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900 font-heading">
                  {stats?.tersedia_count ?? 0}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Siap dipinjam sekarang</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Jatuh Tempo Terdekat</span>
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-sm sm:text-base font-bold text-slate-800 truncate">
                  {stats?.jatuh_tempo_terdekat ? formatDate(stats.jatuh_tempo_terdekat) : 'Tidak ada pinjaman'}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Harap tepat waktu</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Status Terlambat</span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  (stats?.terlambat_count ?? 0) > 0
                    ? 'bg-rose-50 text-rose-600'
                    : 'bg-slate-50 text-slate-400'
                }`}>
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className={`text-2xl font-bold font-heading ${
                  (stats?.terlambat_count ?? 0) > 0 ? 'text-rose-600' : 'text-slate-800'
                }`}>
                  {stats?.terlambat_count ?? 0}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {(stats?.terlambat_count ?? 0) > 0 ? 'Perlu segera dikembalikan' : 'Status aman'}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Section: Buku Sedang Dipinjam */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              Buku yang Sedang Anda Pinjam ({myActiveLoans.length})
            </h3>
          </div>
          {myActiveLoans.length > 0 && (
            <button
              onClick={onNavigatePeminjaman}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Lihat Semua &gt;
            </button>
          )}
        </div>

        {myActiveLoans.length === 0 ? (
          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl text-center space-y-2">
            <BookmarkCheck className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-medium text-slate-500">
              Anda belum meminjam buku saat ini. Silakan cari buku di katalog untuk dipinjam!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {myActiveLoans.map(loan => {
              const isLate = loan.status === 'terlambat';
              return (
                <div
                  key={loan.borrowing_id}
                  className={`p-4 rounded-2xl border bg-white flex items-start gap-3.5 shadow-2xs ${
                    isLate ? 'border-rose-300 ring-1 ring-rose-300/50' : 'border-slate-200/80'
                  }`}
                >
                  <div className="w-16 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                    {loan.cover_url ? (
                      <img src={loan.cover_url} alt={loan.judul} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <BookOpen className="w-6 h-6 stroke-1" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isLate
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {isLate ? '⚠️ Terlambat' : 'Dipinjam'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        #{loan.borrowing_id}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {loan.judul}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {loan.penulis}
                    </p>

                    <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] flex items-center justify-between text-slate-600">
                      <span>Batas Kembali:</span>
                      <span className={`font-bold ${isLate ? 'text-rose-600' : 'text-slate-800'}`}>
                        {formatDate(loan.tanggal_jatuh_tempo)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section: Rekomendasi Buku Terbaru */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900">
              Koleksi Buku Rekomendasi & Terbaru
            </h3>
          </div>
          <button
            onClick={onNavigateKatalog}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            Lihat Semua Katalog &gt;
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <BookCardSkeleton />
            <BookCardSkeleton />
            <BookCardSkeleton />
            <BookCardSkeleton />
          </div>
        ) : recentBooks.length === 0 ? (
          <EmptyState
            title="Katalog Masih Kosong"
            description="Belum ada buku yang tersedia di perpustakaan."
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recentBooks.map(book => (
              <BookCard
                key={book.book_id}
                book={book}
                onSelect={onSelectBook}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
