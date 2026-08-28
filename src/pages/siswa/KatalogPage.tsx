import React, { useState, useMemo } from 'react';
import { Book, Category } from '../../types';
import { BookCard } from '../../components/BookCard';
import { BookCardSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { Search, Filter, ArrowUpDown, BookOpen, Layers } from 'lucide-react';

interface KatalogPageProps {
  books: Book[];
  categories: Category[];
  isLoading: boolean;
  onSelectBook: (book: Book) => void;
  onRefresh: () => void;
}

export const KatalogPage: React.FC<KatalogPageProps> = ({
  books,
  categories,
  isLoading,
  onSelectBook,
  onRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'available'>('all');
  const [sortBy, setSortBy] = useState<'terbaru' | 'judul-asc' | 'stok-desc'>('terbaru');

  // Filter & Search logic
  const filteredBooks = useMemo(() => {
    return books
      .filter(book => {
        // Search by title, author, isbn
        const q = searchQuery.toLowerCase().trim();
        const matchSearch =
          !q ||
          book.judul.toLowerCase().includes(q) ||
          book.penulis.toLowerCase().includes(q) ||
          (book.penerbit && book.penerbit.toLowerCase().includes(q)) ||
          (book.isbn && book.isbn.toLowerCase().includes(q));

        // Filter category
        const matchCategory =
          selectedCategory === 'all' ||
          book.kategori.toLowerCase() === selectedCategory.toLowerCase();

        // Filter stock
        const matchStock = stockFilter === 'all' || book.stok_tersedia > 0;

        return matchSearch && matchCategory && matchStock;
      })
      .sort((a, b) => {
        if (sortBy === 'judul-asc') {
          return a.judul.localeCompare(b.judul);
        }
        if (sortBy === 'stok-desc') {
          return b.stok_tersedia - a.stok_tersedia;
        }
        // default: terbaru
        return (b.created_at || '').localeCompare(a.created_at || '');
      });
  }, [books, searchQuery, selectedCategory, stockFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-heading">
            Katalog Buku Perpustakaan
          </h2>
          <p className="text-xs text-slate-500">
            Temukan buku referensi, pelajaran, ensiklopedia, dan novel favorit Anda
          </p>
        </div>
        <div className="text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs self-start sm:self-auto">
          Total: <span className="text-blue-600 font-bold">{filteredBooks.length}</span> dari {books.length} Buku
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari judul buku, nama penulis, penerbit, atau ISBN..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Hapus
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2">
            {/* Stock Switch */}
            <select
              value={stockFilter}
              onChange={e => setStockFilter(e.target.value as any)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Semua Status Stok</option>
              <option value="available">Hanya Stok Tersedia</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="terbaru">Terbaru</option>
              <option value="judul-asc">Judul A - Z</option>
              <option value="stok-desc">Stok Terbanyak</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Kategori
          </button>
          {categories.map(cat => (
            <button
              key={cat.category_id}
              onClick={() => setSelectedCategory(cat.nama_kategori)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory.toLowerCase() === cat.nama_kategori.toLowerCase()
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.nama_kategori}
            </button>
          ))}
        </div>
      </div>

      {/* Book Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredBooks.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Tidak Ada Buku Ditemukan"
          description={
            searchQuery || selectedCategory !== 'all'
              ? 'Tidak ada buku yang sesuai dengan kata kunci atau filter pencarian Anda. Coba kata kunci lain.'
              : 'Katalog perpustakaan saat ini masih belum memiliki daftar buku.'
          }
          actionText={searchQuery || selectedCategory !== 'all' ? 'Reset Pencarian' : undefined}
          onAction={() => {
            setSearchQuery('');
            setSelectedCategory('all');
            setStockFilter('all');
          }}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredBooks.map(book => (
            <BookCard
              key={book.book_id}
              book={book}
              onSelect={onSelectBook}
            />
          ))}
        </div>
      )}
    </div>
  );
};
