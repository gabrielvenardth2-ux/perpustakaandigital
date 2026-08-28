import { User, Book, Borrowing, Category, LibrarySettings } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  { category_id: 'CAT-1', nama_kategori: 'Sains & Teknologi' },
  { category_id: 'CAT-2', nama_kategori: 'Sastra & Bahasa' },
  { category_id: 'CAT-3', nama_kategori: 'Sosial & Sejarah' },
  { category_id: 'CAT-4', nama_kategori: 'Matematika' },
  { category_id: 'CAT-5', nama_kategori: 'Fiksi & Novel' },
  { category_id: 'CAT-6', nama_kategori: 'Ensiklopedia & Referensi' },
  { category_id: 'CAT-7', nama_kategori: 'Pengembangan Diri' }
];

export const INITIAL_SETTINGS: LibrarySettings = {
  durasi_peminjaman: 7,
  maksimal_peminjaman: 3
};

export const INITIAL_USERS: User[] = [
  {
    user_id: 'USR-ADMIN-001',
    nama: 'Bapak Pustakawan, S.Pd',
    nis: 'GURU001',
    email: 'admin@perpustakaan.sch.id',
    role: 'guru',
    kelas: 'Staf Perpustakaan',
    status: 'aktif',
    created_at: '2026-01-10'
  },
  {
    user_id: 'USR-SISWA-001',
    nama: 'Ahmad Faiz Ramadhan',
    nis: '20241001',
    email: 'faiz@siswa.sch.id',
    role: 'siswa',
    kelas: 'XII MIPA 1',
    status: 'aktif',
    created_at: '2026-01-15'
  },
  {
    user_id: 'USR-SISWA-002',
    nama: 'Siti Nur Aisyah',
    nis: '20241002',
    email: 'siti@siswa.sch.id',
    role: 'siswa',
    kelas: 'XI IPS 2',
    status: 'aktif',
    created_at: '2026-02-01'
  }
];

export const INITIAL_BOOKS: Book[] = [
  {
    book_id: 'BK-001',
    judul: 'Laskar Pelangi',
    penulis: 'Andrea Hirata',
    penerbit: 'Bentang Pustaka',
    tahun: 2005,
    kategori: 'Fiksi & Novel',
    isbn: '978-979-3062-79-2',
    deskripsi: 'Kisah perjuangan sepuluh anak di Belitung dalam menempuh pendidikan dengan penuh semangat dan keterbatasan.',
    cover_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    stok_total: 5,
    stok_tersedia: 4,
    created_at: '2026-01-10'
  },
  {
    book_id: 'BK-002',
    judul: 'Bumi Manusia',
    penulis: 'Pramoedya Ananta Toer',
    penerbit: 'Hasta Mitra',
    tahun: 1980,
    kategori: 'Sastra & Bahasa',
    isbn: '978-979-97312-3-4',
    deskripsi: 'Karya sastra klasik tentang perjalanan Minke, seorang priyayi muda di era kolonial Belanda yang menjunjung keadilan.',
    cover_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    stok_total: 4,
    stok_tersedia: 3,
    created_at: '2026-01-10'
  },
  {
    book_id: 'BK-003',
    judul: 'Fisika untuk SMA/MA Kelas XI',
    penulis: 'Marthen Kanginan',
    penerbit: 'Erlangga',
    tahun: 2022,
    kategori: 'Sains & Teknologi',
    isbn: '978-602-298-501-1',
    deskripsi: 'Buku pelajaran fisika kurikulum terbaru mencakup kinematika, dinamika rotasi, termodinamika, dan gelombang bunyi.',
    cover_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
    stok_total: 8,
    stok_tersedia: 7,
    created_at: '2026-01-12'
  },
  {
    book_id: 'BK-004',
    judul: 'Matematika Peminatan Kelas XII',
    penulis: 'B.K. Noormandiri',
    penerbit: 'Erlangga',
    tahun: 2021,
    kategori: 'Matematika',
    isbn: '978-602-298-882-1',
    deskripsi: 'Materi komprehensif limit trigonometri, turunan fungsi trigonometri, dan distribusi probabilitas binomial.',
    cover_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
    stok_total: 6,
    stok_tersedia: 6,
    created_at: '2026-01-15'
  },
  {
    book_id: 'BK-005',
    judul: 'Sejarah Indonesia Modern 1200–2008',
    penulis: 'M.C. Ricklefs',
    penerbit: 'Serambi',
    tahun: 2008,
    kategori: 'Sosial & Sejarah',
    isbn: '978-979-024-115-2',
    deskripsi: 'Rujukan terlengkap sejarah kepulauan nusantara dari masa keemasan kesultanan, penjajahan, hingga reformasi kontemporer.',
    cover_url: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=600&q=80',
    stok_total: 3,
    stok_tersedia: 2,
    created_at: '2026-01-20'
  },
  {
    book_id: 'BK-006',
    judul: 'Atomic Habits: Perubahan Kecil Hasil Luar Biasa',
    penulis: 'James Clear',
    penerbit: 'Gramedia Pustaka Utama',
    tahun: 2019,
    kategori: 'Pengembangan Diri',
    isbn: '978-602-06-3317-6',
    deskripsi: 'Panduan praktis dan psikologis membangun kebiasaan produktif belajar dan menghilangkan prokrastinasi bagi pelajar.',
    cover_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    stok_total: 7,
    stok_tersedia: 6,
    created_at: '2026-01-22'
  },
  {
    book_id: 'BK-007',
    judul: 'Biologi Sel dan Genetika SMA',
    penulis: 'Dra. Endang Sri Mulyani',
    penerbit: 'Yudhistira',
    tahun: 2023,
    kategori: 'Sains & Teknologi',
    isbn: '978-602-445-123-9',
    deskripsi: 'Eksplorasi mendalam struktur sel eukariotik, pembelahan mitosis-meiosis, dan hukum hereditas Mendel.',
    cover_url: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=600&q=80',
    stok_total: 5,
    stok_tersedia: 5,
    created_at: '2026-02-01'
  },
  {
    book_id: 'BK-008',
    judul: 'Filosofi Teras: Stoisisme Kuno untuk Masa Kini',
    penulis: 'Henry Manampiring',
    penerbit: 'Kompas',
    tahun: 2019,
    kategori: 'Pengembangan Diri',
    isbn: '978-602-412-518-9',
    deskripsi: 'Penerapan filsafat stoisisme untuk mengendalikan emosi negatif dan menghadapi ujian hidup dengan ketenangan batin.',
    cover_url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    stok_total: 5,
    stok_tersedia: 5,
    created_at: '2026-02-05'
  }
];

export const INITIAL_BORROWINGS: Borrowing[] = [
  {
    borrowing_id: 'BRW-20260220-001',
    user_id: 'USR-SISWA-001',
    book_id: 'BK-001',
    tanggal_pinjam: '2026-08-22',
    tanggal_jatuh_tempo: '2026-08-29',
    tanggal_kembali: '',
    status: 'dipinjam',
    judul: 'Laskar Pelangi',
    penulis: 'Andrea Hirata',
    cover_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    nama_peminjam: 'Ahmad Faiz Ramadhan',
    nis_peminjam: '20241001',
    kelas_peminjam: 'XII MIPA 1'
  },
  {
    borrowing_id: 'BRW-20260215-002',
    user_id: 'USR-SISWA-001',
    book_id: 'BK-005',
    tanggal_pinjam: '2026-08-15',
    tanggal_jatuh_tempo: '2026-08-22',
    tanggal_kembali: '',
    status: 'terlambat',
    judul: 'Sejarah Indonesia Modern 1200–2008',
    penulis: 'M.C. Ricklefs',
    cover_url: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=600&q=80',
    nama_peminjam: 'Ahmad Faiz Ramadhan',
    nis_peminjam: '20241001',
    kelas_peminjam: 'XII MIPA 1'
  },
  {
    borrowing_id: 'BRW-20260210-003',
    user_id: 'USR-SISWA-002',
    book_id: 'BK-002',
    tanggal_pinjam: '2026-08-10',
    tanggal_jatuh_tempo: '2026-08-17',
    tanggal_kembali: '2026-08-16',
    status: 'dikembalikan',
    judul: 'Bumi Manusia',
    penulis: 'Pramoedya Ananta Toer',
    cover_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    nama_peminjam: 'Siti Nur Aisyah',
    nis_peminjam: '20241002',
    kelas_peminjam: 'XI IPS 2'
  }
];
