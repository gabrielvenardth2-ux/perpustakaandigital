import React, { useState, useMemo } from 'react';
import { Book, Category } from '../../types';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Layers,
  BookOpen,
  X,
  AlertTriangle,
  Check,
  Tag,
  Calendar,
  Building,
  Hash,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';

interface KelolaBukuPageProps {
  books: Book[];
  categories: Category[];
  isLoading: boolean;
  onRefresh: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const KelolaBukuPage: React.FC<KelolaBukuPageProps> = ({
  books,
  categories,
  isLoading,
  onRefresh,
  onShowToast
}) => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBookId, setCurrentBookId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    judul: '',
    penulis: '',
    penerbit: '',
    tahun: new Date().getFullYear().toString(),
    isbn: '',
    kategori: 'Pelajaran',
    deskripsi: '',
    cover_url: '',
    stok_total: 5,
    stok_tersedia: 5
  });

  // Delete Confirm State
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered Books
  const filteredBooks = useMemo(() => {
    return books.filter(b => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        b.judul.toLowerCase().includes(q) ||
        b.penulis.toLowerCase().includes(q) ||
        (b.isbn && b.isbn.toLowerCase().includes(q));
      const matchCategory =
        selectedCategory === 'all' ||
        b.kategori.toLowerCase() === selectedCategory.toLowerCase();
      return matchSearch && matchCategory;
    });
  }, [books, search, selectedCategory]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentBookId(null);
    setFormData({
      judul: '',
      penulis: '',
      penerbit: '',
      tahun: new Date().getFullYear().toString(),
      isbn: '',
      kategori: categories.length > 0 ? categories[0].nama_kategori : 'Pelajaran',
      deskripsi: '',
      cover_url: '',
      stok_total: 5,
      stok_tersedia: 5
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: Book) => {
    setIsEditing(true);
    setCurrentBookId(b.book_id);
    setFormData({
      judul: b.judul,
      penulis: b.penulis,
      penerbit: b.penerbit || '',
      tahun: b.tahun || '',
      isbn: b.isbn || '',
      kategori: b.kategori || 'Umum',
      deskripsi: b.deskripsi || '',
      cover_url: b.cover_url || '',
      stok_total: b.stok_total,
      stok_tersedia: b.stok_tersedia
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.judul.trim() || !formData.penulis.trim()) {
      onShowToast('error', 'Judul buku dan penulis wajib diisi.');
      return;
    }

    const stokTotal = Number(formData.stok_total);
    const stokTersedia = Number(formData.stok_tersedia);

    if (stokTotal < 0 || stokTersedia < 0) {
      onShowToast('error', 'Stok tidak boleh negatif.');
      return;
    }

    // Validasi Section 15: stok_tersedia tidak boleh melebihi stok_total
    if (stokTersedia > stokTotal) {
      onShowToast('error', 'Stok tersedia tidak boleh melebihi stok total.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && currentBookId) {
        const res = await api.updateBook(user.user_id, {
          book_id: currentBookId,
          ...formData,
          stok_total: stokTotal,
          stok_tersedia: stokTersedia
        });
        if (res.success) {
          onShowToast('success', 'Buku berhasil diperbarui!');
          setIsModalOpen(false);
          onRefresh();
        } else {
          onShowToast('error', res.message || 'Gagal memperbarui buku.');
        }
      } else {
        const res = await api.addBook(user.user_id, {
          ...formData,
          stok_total: stokTotal,
          stok_tersedia: stokTersedia
        });
        if (res.success) {
          onShowToast('success', 'Buku baru berhasil ditambahkan!');
          setIsModalOpen(false);
          onRefresh();
        } else {
          onShowToast('error', res.message || 'Gagal menambah buku.');
        }
      }
    } catch (err: any) {
      onShowToast('error', err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBook = async () => {
    if (!bookToDelete || !user) return;
    setIsDeleting(true);
    try {
      const res = await api.deleteBook(user.user_id, bookToDelete.book_id);
      if (res.success) {
        onShowToast('success', 'Buku berhasil dihapus dari sistem.');
        setBookToDelete(null);
        onRefresh();
      } else {
        // Jika ada pinjaman aktif, backend akan mengembalikan pesan pencegahan
        onShowToast('error', res.message || 'Gagal menghapus buku.');
      }
    } catch (err: any) {
      onShowToast('error', err.message || 'Gagal menghapus buku.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-heading">
            Kelola Inventaris Buku
          </h2>
          <p className="text-xs text-slate-500">
            Tambah, edit metadata, sesuaikan stok, dan kelola katalog buku perpustakaan
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Buku Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari judul, penulis, ISBN..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="all">Semua Kategori</option>
          {categories.map(c => (
            <option key={c.category_id} value={c.nama_kategori}>
              {c.nama_kategori}
            </option>
          ))}
        </select>
      </div>

      {/* Book Management Table */}
      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : filteredBooks.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Tidak Ada Buku"
          description="Buku tidak ditemukan dengan kriteria pencarian ini."
          actionText="Tambah Buku Pertama"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-700 font-bold border-b border-slate-200/80 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Cover & Judul</th>
                  <th className="px-4 py-3.5">Penulis & Penerbit</th>
                  <th className="px-4 py-3.5">Kategori</th>
                  <th className="px-4 py-3.5 text-center">Stok (Tersedia / Total)</th>
                  <th className="px-4 py-3.5">ISBN</th>
                  <th className="px-4 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBooks.map(b => {
                  const isAvailable = b.stok_tersedia > 0;
                  return (
                    <tr key={b.book_id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-14 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-200/60">
                            {b.cover_url ? (
                              <img src={b.cover_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <BookOpen className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 line-clamp-1">{b.judul}</div>
                            <div className="text-[11px] text-slate-400 font-mono">#{b.book_id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-800">{b.penulis}</div>
                        <div className="text-[11px] text-slate-400">
                          {b.penerbit || '-'} {b.tahun ? `(${b.tahun})` : ''}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700">
                          {b.kategori}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            isAvailable
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {b.stok_tersedia} / {b.stok_total}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[11px] text-slate-500">
                        {b.isbn || '-'}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(b)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Buku"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setBookToDelete(b)}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Buku"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Book Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 my-auto overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 font-heading">
                {isEditing ? 'Edit Informasi Buku' : 'Tambah Buku Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Judul Buku *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Laskar Pelangi"
                  value={formData.judul}
                  onChange={e => setFormData({ ...formData, judul: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Penulis / Pengarang *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Andrea Hirata"
                    value={formData.penulis}
                    onChange={e => setFormData({ ...formData, penulis: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Kategori Buku *
                  </label>
                  <select
                    value={formData.kategori}
                    onChange={e => setFormData({ ...formData, kategori: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  >
                    {categories.map(c => (
                      <option key={c.category_id} value={c.nama_kategori}>
                        {c.nama_kategori}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Penerbit
                  </label>
                  <input
                    type="text"
                    placeholder="Bentang Pustaka"
                    value={formData.penerbit}
                    onChange={e => setFormData({ ...formData, penerbit: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tahun Terbit
                  </label>
                  <input
                    type="text"
                    placeholder="2023"
                    value={formData.tahun}
                    onChange={e => setFormData({ ...formData, tahun: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    ISBN
                  </label>
                  <input
                    type="text"
                    placeholder="978-602-..."
                    value={formData.isbn}
                    onChange={e => setFormData({ ...formData, isbn: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 font-mono"
                  />
                </div>
              </div>

              {/* Stok Management Grid */}
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">
                    Stok Total (Eksemplar) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stok_total}
                    onChange={e => {
                      const val = parseInt(e.target.value) || 0;
                      setFormData({
                        ...formData,
                        stok_total: val,
                        // If adding new book, sync available stock automatically
                        stok_tersedia: !isEditing ? val : Math.min(formData.stok_tersedia, val)
                      });
                    }}
                    className="w-full px-3.5 py-2 bg-white border border-blue-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">
                    Stok Tersedia di Rak *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={formData.stok_total}
                    required
                    value={formData.stok_tersedia}
                    onChange={e =>
                      setFormData({ ...formData, stok_tersedia: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2 bg-white border border-blue-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-blue-700">Maksimal: {formData.stok_total}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  URL Sampul Buku (Cover Image)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={formData.cover_url}
                    onChange={e => setFormData({ ...formData, cover_url: e.target.value })}
                    className="w-full pl-3.5 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <ImageIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Sinopsis / Deskripsi Buku
                </label>
                <textarea
                  rows={3}
                  placeholder="Ringkasan atau sinopsis buku..."
                  value={formData.deskripsi}
                  onChange={e => setFormData({ ...formData, deskripsi: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  {isSubmitting
                    ? 'Menyimpan...'
                    : isEditing
                    ? 'Simpan Perubahan'
                    : 'Tambah Buku Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal with Active Loan Protection */}
      {bookToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Konfirmasi Hapus Buku</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus buku <strong>&ldquo;{bookToDelete.judul}&rdquo;</strong>?
              Sistem akan memverifikasi bahwa tidak ada siswa yang sedang meminjam buku ini sebelum menghapusnya.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setBookToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteBook}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
              >
                {isDeleting ? 'Memeriksa & Menghapus...' : 'Ya, Hapus Buku'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
