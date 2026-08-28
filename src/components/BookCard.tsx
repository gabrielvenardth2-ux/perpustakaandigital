import React, { useState } from 'react';
import { Book as BookType } from '../types';
import { BookOpen, User, Tag } from 'lucide-react';

interface BookCardProps {
  book: BookType;
  onSelect: (book: BookType) => void;
  onQuickBorrow?: (book: BookType) => void;
  isBorrowing?: boolean;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onSelect,
  onQuickBorrow,
  isBorrowing = false
}) => {
  const [imgError, setImgError] = useState(false);
  const isAvailable = book.stok_tersedia > 0;

  return (
    <div
      onClick={() => onSelect(book)}
      className="group bg-white rounded-2xl border border-slate-200/80 p-3.5 hover:border-blue-400 hover:shadow-md transition-all duration-200 flex flex-col cursor-pointer"
    >
      {/* Cover Image Container */}
      <div className="relative w-full h-48 sm:h-56 rounded-xl overflow-hidden bg-slate-100 mb-3 flex items-center justify-center">
        {book.cover_url && !imgError ? (
          <img
            src={book.cover_url}
            alt={book.judul}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
            <BookOpen className="w-10 h-10 mb-2 stroke-1 text-slate-300" />
            <span className="text-xs font-semibold text-slate-500 line-clamp-2 px-2">
              {book.judul}
            </span>
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-2.5 left-2.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900/70 text-white backdrop-blur-md shadow-2xs">
            <Tag className="w-2.5 h-2.5" />
            {book.kategori}
          </span>
        </div>

        {/* Stock status pill */}
        <div className="absolute bottom-2.5 right-2.5">
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold shadow-2xs backdrop-blur-md ${
              isAvailable
                ? 'bg-emerald-500/90 text-white'
                : 'bg-rose-500/90 text-white'
            }`}
          >
            {isAvailable ? `Tersedia (${book.stok_tersedia})` : 'Tidak tersedia'}
          </span>
        </div>
      </div>

      {/* Book Metadata */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-1">
            {book.judul}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
            <User className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{book.penulis}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
          <span className="text-[11px] text-slate-400 font-medium">
            Tahun {book.tahun}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(book);
            }}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Detail &gt;
          </button>
        </div>
      </div>
    </div>
  );
};
