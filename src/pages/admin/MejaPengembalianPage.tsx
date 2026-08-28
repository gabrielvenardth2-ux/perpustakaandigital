import React, { useState, useMemo } from 'react';
import { Borrowing } from '../../types';
import {
  RotateCcw,
  Search,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  User,
  Clock,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { EmptyState } from '../../components/EmptyState';

interface MejaPengembalianPageProps {
  borrowings: Borrowing[];
  isLoading: boolean;
  onRefresh: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const MejaPengembalianPage: React.FC<MejaPengembalianPageProps> = ({
  borrowings,
  isLoading,
  onRefresh,
  onShowToast
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoan, setSelectedLoan] = useState<Borrowing | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Hanya ambil peminjaman yang berstatus aktif: 'dipinjam' atau 'terlambat'
  const activeLoans = useMemo(() => {
    return borrowings.filter(b => b.status === 'dipinjam' || b.status === 'terlambat');
  }, [borrowings]);

  // Cari berdasarkan search term
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return activeLoans;
    const q = searchTerm.toLowerCase().trim();
    return activeLoans.filter(
      b =>
        b.borrowing_id.toLowerCase().includes(q) ||
        (b.nis_peminjam && b.nis_peminjam.toLowerCase().includes(q)) ||
        (b.nama_peminjam && b.nama_peminjam.toLowerCase().includes(q)) ||
        (b.judul && b.judul.toLowerCase().includes(q))
    );
  }, [activeLoans, searchTerm]);

  const handleSelectLoan = (loan: Borrowing) => {
    setSelectedLoan(loan);
  };

  const handleProcessReturn = async () => {
    if (!selectedLoan || !user) return;
    setIsProcessing(true);
    try {
      const res = await api.returnBook(user.user_id, selectedLoan.borrowing_id);
      if (res.success) {
        onShowToast(
          'success',
          `Buku "${selectedLoan.judul}" milik ${selectedLoan.nama_peminjam} berhasil dikembalikan!`
        );
        setSelectedLoan(null);
        setSearchTerm('');
        onRefresh();
      } else {
        onShowToast('error', res.message || 'Gagal memproses pengembalian.');
      }
    } catch (e: any) {
      onShowToast('error', e.message || 'Gagal memproses.');
    } finally {
      setIsProcessing(false);
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 font-heading">
          Meja Sirkulasi Pengembalian Cepat
        </h2>
        <p className="text-xs text-slate-500">
          Pusat pemindaian dan penerimaan buku kembali dari siswa. Stok buku akan otomatis bertambah kembali di rak.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Search & Active Loans list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Cari Transaksi Siswa (Ketik NIS / Nama Siswa / ID Pinjam)
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Contoh: 20241001 atau Faiz atau BORROW-..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 px-1">
              <span>Buku Sedang Dipinjam ({searchResults.length})</span>
              <span>Pilih salah satu untuk proses kembali</span>
            </div>

            {searchResults.length === 0 ? (
              <EmptyState
                icon={RotateCcw}
                title="Tidak Ada Buku Dipinjam yang Cocok"
                description={
                  searchTerm
                    ? 'Tidak ditemukan transaksi aktif dengan kata kunci tersebut.'
                    : 'Semua buku telah dikembalikan oleh siswa.'
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[550px] overflow-y-auto pr-1">
                {searchResults.map(item => {
                  const isSelected = selectedLoan?.borrowing_id === item.borrowing_id;
                  const isLate = item.status === 'terlambat';

                  return (
                    <div
                      key={item.borrowing_id}
                      onClick={() => handleSelectLoan(item)}
                      className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                          : isLate
                          ? 'border-rose-200 bg-rose-50/30 hover:border-rose-300'
                          : 'border-slate-200/80 bg-white hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isLate
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {isLate ? '⚠️ Terlambat' : 'Dipinjam'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          #{item.borrowing_id}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {item.judul}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {item.penulis}
                      </p>

                      <div className="mt-3 pt-2 border-t border-slate-100/80 flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-800">{item.nama_peminjam}</span>
                        <span className="text-slate-500">{item.kelas_peminjam || item.nis_peminjam}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Return Confirmation Box */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-5 sticky top-20">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-emerald-600" />
            Detail Pemeriksaan Pengembalian
          </h3>

          {!selectedLoan ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <BookOpen className="w-10 h-10 mx-auto text-slate-200 stroke-1" />
              <p className="text-xs">
                Pilih salah satu item peminjaman di sebelah kiri untuk memproses pengembalian buku siswa.
              </p>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
                <div className="text-slate-400">Peminjam:</div>
                <div className="font-bold text-slate-900 text-sm">{selectedLoan.nama_peminjam}</div>
                <div className="text-slate-600">
                  NIS: <span className="font-mono font-medium">{selectedLoan.nis_peminjam}</span> • Kelas:{' '}
                  <strong>{selectedLoan.kelas_peminjam || '-'}</strong>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
                <div className="text-slate-400">Buku yang Dikembalikan:</div>
                <div className="font-bold text-slate-900 text-sm leading-snug">{selectedLoan.judul}</div>
                <div className="text-slate-600">Penulis: {selectedLoan.penulis}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400">Tgl Pinjam:</span>
                  <div className="font-semibold text-slate-800">
                    {formatDate(selectedLoan.tanggal_pinjam)}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400">Jatuh Tempo:</span>
                  <div className={`font-semibold ${selectedLoan.status === 'terlambat' ? 'text-rose-600' : 'text-slate-800'}`}>
                    {formatDate(selectedLoan.tanggal_jatuh_tempo)}
                  </div>
                </div>
              </div>

              {selectedLoan.status === 'terlambat' && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>
                    Peminjaman buku ini telah melewati tanggal jatuh tempo. Harap periksa kondisi fisik buku sebelum konfirmasi.
                  </span>
                </div>
              )}

              <button
                onClick={handleProcessReturn}
                disabled={isProcessing}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isProcessing ? 'Memperbarui Database...' : 'Konfirmasi Pengembalian & Tambah Stok'}
                </span>
              </button>

              <button
                onClick={() => setSelectedLoan(null)}
                disabled={isProcessing}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 text-center"
              >
                Batalkan Pilihan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
