import React, { useState } from 'react';
import { Book as BookType } from '../types';
import {
  X,
  BookOpen,
  Calendar,
  Building,
  Bookmark,
  Hash,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface BookDetailModalProps {
  book: BookType | null;
  isOpen: boolean;
  onClose: () => void;
  onBorrow: (bookId: string) => Promise<boolean>;
  isBorrowing: boolean;
  canBorrow: boolean;
  borrowLimitReason?: string;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  isOpen,
  onClose,
  onBorrow,
  isBorrowing,
  canBorrow,
  borrowLimitReason
}) => {
  const { user } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!isOpen || !book) return null;

  const isAvailable = book.stok_tersedia > 0;
  const isSiswa = user?.role === 'siswa';

  // Hitung tanggal jatuh tempo estimasi (7 hari dari sekarang)
  const today = new Date();
  const dueDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const dueDateFormatted = dueDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handleConfirmBorrow = async () => {
    const success = await onBorrow(book.book_id);
    if (success) {
      setShowConfirm(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 my-auto overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
              {book.kategori}
            </span>
            <span className="text-xs text-slate-400 font-mono">#{book.book_id}</span>
          </div>
          <button
            onClick={() => {
              setShowConfirm(false);
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          <div className="flex flex-col sm:flex-row gap-5">
            {/* Cover Image */}
            <div className="w-full sm:w-44 h-60 sm:h-64 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/60 shadow-xs">
              {book.cover_url && !imgError ? (
                <img
                  src={book.cover_url}
                  alt={book.judul}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-slate-400 text-center">
                  <BookOpen className="w-12 h-12 mb-2 text-slate-300 stroke-1" />
                  <span className="text-xs font-medium text-slate-500">Tidak ada gambar</span>
                </div>
              )}
            </div>

            {/* Book Meta Details */}
            <div className="flex-1 space-y-3">
              <h2 className="text-xl font-bold text-slate-900 leading-tight">
                {book.judul}
              </h2>
              <div className="text-sm font-semibold text-blue-600">
                Oleh: {book.penulis}
              </div>

              {/* Status Badge */}
              <div className="pt-1">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    isAvailable
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  {isAvailable
                    ? `Tersedia ${book.stok_tersedia} dari ${book.stok_total} eksemplar`
                    : 'Stok Habis / Tidak Tersedia'}
                </span>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 flex items-center gap-1 mb-0.5">
                    <Building className="w-3.5 h-3.5" /> Penerbit
                  </div>
                  <div className="font-semibold text-slate-800 truncate">{book.penerbit || '-'}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 flex items-center gap-1 mb-0.5">
                    <Calendar className="w-3.5 h-3.5" /> Tahun Terbit
                  </div>
                  <div className="font-semibold text-slate-800">{book.tahun || '-'}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 flex items-center gap-1 mb-0.5">
                    <Hash className="w-3.5 h-3.5" /> ISBN
                  </div>
                  <div className="font-mono text-slate-800 truncate">{book.isbn || '-'}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 flex items-center gap-1 mb-0.5">
                    <Layers className="w-3.5 h-3.5" /> Total Stok
                  </div>
                  <div className="font-semibold text-slate-800">{book.stok_total} Eksemplar</div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Sinopsis / Deskripsi Buku
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 whitespace-pre-line">
              {book.deskripsi || 'Belum ada deskripsi untuk buku ini.'}
            </p>
          </div>

          {/* Confirmation Box (if active) */}
          {showConfirm && (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 space-y-3 animate-in fade-in zoom-in-95">
              <div className="flex items-start gap-2.5">
                <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold">Konfirmasi Peminjaman Buku</h4>
                  <p className="text-xs text-blue-800 mt-1 leading-relaxed">
                    Anda akan meminjam buku <strong>&ldquo;{book.judul}&rdquo;</strong> dengan durasi <strong>7 hari</strong>.
                    Batas waktu pengembalian buku adalah <strong>{dueDateFormatted}</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-blue-200/60">
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={isBorrowing}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmBorrow}
                  disabled={isBorrowing}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  {isBorrowing ? 'Memproses...' : 'Ya, Pinjam Sekarang'}
                </button>
              </div>
            </div>
          )}

          {/* Warning notice if cannot borrow */}
          {!canBorrow && isSiswa && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{borrowLimitReason || 'Anda tidak dapat meminjam buku ini saat ini.'}</span>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              setShowConfirm(false);
              onClose();
            }}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Tutup
          </button>

          {isSiswa && !showConfirm && (
            <button
              onClick={() => setShowConfirm(true)}
              disabled={!isAvailable || !canBorrow || isBorrowing}
              className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-xs ${
                !isAvailable || !canBorrow
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              {!isAvailable
                ? 'Stok Tidak Tersedia'
                : !canBorrow
                ? 'Batas Pinjam Tercapai'
                : 'Pinjam Buku Ini'}
            </button>
          )}

          {!isSiswa && (
            <span className="text-xs text-slate-500 italic">
              Mode Guru / Admin: Anda dapat mengelola stok buku di menu Kelola Buku.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
