import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Borrowing } from '../../types';
import {
  User,
  GraduationCap,
  Mail,
  Hash,
  CheckCircle2,
  Calendar,
  BookmarkCheck,
  History,
  ShieldCheck
} from 'lucide-react';

interface ProfilSiswaPageProps {
  borrowings: Borrowing[];
}

export const ProfilSiswaPage: React.FC<ProfilSiswaPageProps> = ({ borrowings }) => {
  const { user } = useAuth();

  if (!user) return null;

  const totalPinjam = borrowings.length;
  const aktifPinjam = borrowings.filter(b => b.status === 'dipinjam' || b.status === 'terlambat').length;
  const selesaiPinjam = borrowings.filter(b => b.status === 'dikembalikan').length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 font-heading">
          Profil Siswa
        </h2>
        <p className="text-xs text-slate-500">
          Informasi kartu keanggotaan perpustakaan digital Anda
        </p>
      </div>

      {/* Student Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-2xl shadow-lg border-2 border-white/20">
            {user.nama.slice(0, 2).toUpperCase()}
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Anggota Aktif Perpustakaan</span>
            </div>
            <h3 className="text-2xl font-bold font-heading">{user.nama}</h3>
            <p className="text-xs text-slate-300 flex items-center gap-2">
              <span>Kelas: <strong>{user.kelas || '-'}</strong></span>
              <span>•</span>
              <span>NIS: <strong className="font-mono">{user.nis}</strong></span>
            </p>
          </div>
        </div>

        {/* Card Details Grid */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400">Alamat Email</span>
            <div className="font-semibold text-slate-200 truncate">{user.email}</div>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400">ID Anggota</span>
            <div className="font-mono font-semibold text-slate-200">{user.user_id}</div>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400">Tanggal Terdaftar</span>
            <div className="font-semibold text-slate-200">{user.created_at || '2026'}</div>
          </div>
        </div>
      </div>

      {/* Borrowing Statistics for Student */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <History className="w-4 h-4 text-blue-600" />
          Statistik Peminjaman Anda
        </h4>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-2xl font-bold text-slate-900 font-heading">{totalPinjam}</div>
            <div className="text-[11px] text-slate-500 mt-1">Total Peminjaman</div>
          </div>
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-blue-900">
            <div className="text-2xl font-bold text-blue-700 font-heading">{aktifPinjam}</div>
            <div className="text-[11px] text-blue-600 mt-1">Sedang Dipinjam</div>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100 text-emerald-900">
            <div className="text-2xl font-bold text-emerald-700 font-heading">{selesaiPinjam}</div>
            <div className="text-[11px] text-emerald-600 mt-1">Sudah Dikembalikan</div>
          </div>
        </div>
      </div>

      {/* Library Terms */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
        <div className="font-bold text-slate-800 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          Ketentuan Peminjaman Perpustakaan:
        </div>
        <ul className="list-disc list-inside space-y-1 text-slate-500 pl-1">
          <li>Maksimal peminjaman bersamaan adalah 3 (tiga) buku.</li>
          <li>Durasi standar peminjaman adalah 7 (tujuh) hari kalender.</li>
          <li>Buku wajib dirawat dengan baik dan tidak dicoret/rusak.</li>
          <li>Keterlambatan pengembalian dapat membatasi hak peminjaman selanjutnya.</li>
        </ul>
      </div>
    </div>
  );
};
