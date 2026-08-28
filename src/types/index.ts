export type UserRole = 'siswa' | 'guru';
export type UserStatus = 'aktif' | 'nonaktif';
export type BorrowingStatus = 'dipinjam' | 'dikembalikan' | 'terlambat';

export interface User {
  user_id: string;
  nama: string;
  nis: string;
  email: string;
  role: UserRole;
  kelas: string;
  status: UserStatus;
  created_at: string;
}

export interface Book {
  book_id: string;
  judul: string;
  penulis: string;
  penerbit: string;
  tahun: number | string;
  kategori: string;
  isbn: string;
  deskripsi: string;
  cover_url: string;
  stok_total: number;
  stok_tersedia: number;
  created_at?: string;
}

export interface Borrowing {
  borrowing_id: string;
  user_id: string;
  book_id: string;
  tanggal_pinjam: string;
  tanggal_jatuh_tempo: string;
  tanggal_kembali: string;
  status: BorrowingStatus;
  // Enriched fields
  judul?: string;
  penulis?: string;
  cover_url?: string;
  kategori?: string;
  nama_peminjam?: string;
  nis_peminjam?: string;
  kelas_peminjam?: string;
}

export interface Category {
  category_id: string;
  nama_kategori: string;
}

export interface LibrarySettings {
  durasi_peminjaman: number;
  maksimal_peminjaman: number;
}

export interface DashboardStatsAdmin {
  total_buku: number;
  total_eksemplar: number;
  total_pengguna: number;
  total_dipinjam: number;
  total_terlambat: number;
  total_tersedia: number;
  kategori_distribution: { kategori: string; count: number }[];
  peminjaman_per_bulan: { bulan: string; jumlah: number }[];
  peminjaman_terbaru: Borrowing[];
}

export interface DashboardStatsSiswa {
  sedang_dipinjam_count: number;
  tersedia_count: number;
  maksimal_pinjam: number;
  terlambat_count: number;
  jatuh_tempo_terdekat: string | null;
  buku_dipinjam: Borrowing[];
  rekomendasi_buku: Book[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface AuthSession {
  user: User;
  token: string;
}
