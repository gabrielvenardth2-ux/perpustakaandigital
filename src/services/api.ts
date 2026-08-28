import {
  User,
  Book,
  Borrowing,
  Category,
  LibrarySettings,
  DashboardStatsAdmin,
  DashboardStatsSiswa,
  ApiResponse
} from '../types';
import {
  INITIAL_BOOKS,
  INITIAL_USERS,
  INITIAL_BORROWINGS,
  INITIAL_CATEGORIES,
  INITIAL_SETTINGS
} from './mockData';

// Kunci penyimpanan lokal untuk demo / fallback
const STORAGE_KEYS = {
  USERS: 'perpus_demo_users',
  BOOKS: 'perpus_demo_books',
  BORROWINGS: 'perpus_demo_borrowings',
  CATEGORIES: 'perpus_demo_categories',
  SETTINGS: 'perpus_demo_settings',
  CUSTOM_API_URL: 'perpustakaan_api_url',
  USE_SIMULATION: 'perpustakaan_use_simulation'
};

/**
 * Mendapatkan URL API aktif dari env atau localStorage
 */
export function getActiveApiUrl(): string {
  if (typeof window === 'undefined') return '';
  const custom = localStorage.getItem(STORAGE_KEYS.CUSTOM_API_URL);
  if (custom && custom.trim() !== '') {
    return custom.trim();
  }
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim() !== '' && !envUrl.includes('YOUR_GOOGLE_APPS_SCRIPT')) {
    return envUrl.trim();
  }
  return '';
}

/**
 * Menyimpan custom URL ke localStorage
 */
export function setCustomApiUrl(url: string): void {
  if (url && url.trim() !== '') {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_API_URL, url.trim());
  } else {
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_API_URL);
  }
}

/**
 * Cek apakah aplikasi menggunakan mode simulasi
 */
export function isUsingSimulation(): boolean {
  const activeUrl = getActiveApiUrl();
  if (!activeUrl) return true; // Jika URL belum diisi, otomatis pakai simulasi
  return localStorage.getItem(STORAGE_KEYS.USE_SIMULATION) === 'true';
}

export function setSimulationMode(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEYS.USE_SIMULATION, enabled ? 'true' : 'false');
}

/**
 * Inisialisasi data localStorage untuk simulasi offline
 */
function initMockStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BOOKS)) {
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(INITIAL_BOOKS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BORROWINGS)) {
    localStorage.setItem(STORAGE_KEYS.BORROWINGS, JSON.stringify(INITIAL_BORROWINGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
  }
}

function getStoredMock<T>(key: string, defaultVal: T): T {
  initMockStorage();
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function setStoredMock<T>(key: string, val: T): void {
  localStorage.setItem(key, JSON.stringify(val));
}

/**
 * Format tanggal YYYY-MM-DD
 */
function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Pengiriman HTTP ke Google Apps Script Web App
 */
async function callGasApi<T>(action: string, payload: any = {}, method: 'GET' | 'POST' = 'POST'): Promise<ApiResponse<T>> {
  const apiUrl = getActiveApiUrl();

  if (!apiUrl) {
    throw new Error('URL Google Apps Script belum diatur. Silakan atur VITE_API_URL.');
  }

  try {
    let res: Response;
    if (method === 'GET') {
      const urlObj = new URL(apiUrl);
      urlObj.searchParams.set('action', action);
      Object.keys(payload).forEach(k => {
        if (payload[k] !== undefined && payload[k] !== null) {
          urlObj.searchParams.set(k, String(payload[k]));
        }
      });
      res = await fetch(urlObj.toString(), {
        method: 'GET',
        mode: 'cors'
      });
    } else {
      // POST ke Google Apps Script:
      // Gunakan Content-Type text/plain agar tidak memicu preflight CORS OPTIONS yang sering diblok oleh Apps Script
      const bodyData = JSON.stringify({ action, ...payload });
      res = await fetch(apiUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: bodyData
      });
    }

    if (!res.ok) {
      throw new Error(`Server Google Apps Script merespons dengan status ${res.status}`);
    }

    const json = await res.json();
    return json as ApiResponse<T>;
  } catch (err: any) {
    console.error(`[API Error - ${action}]:`, err);
    let friendlyMessage = 'Gagal terhubung ke Google Apps Script. Periksa koneksi internet atau URL Web App.';
    if (err.message) {
      friendlyMessage = err.message;
    }
    return {
      success: false,
      message: friendlyMessage
    };
  }
}

/**
 * ============================================================================
 * EXPORTED API SERVICE
 * ============================================================================
 */
export const api = {
  /**
   * Test koneksi ke Web App
   */
  async testConnection(customUrl?: string): Promise<ApiResponse<any>> {
    const urlToTest = customUrl || getActiveApiUrl();
    if (!urlToTest) {
      return { success: false, message: 'URL Web App kosong.' };
    }
    try {
      const urlObj = new URL(urlToTest);
      urlObj.searchParams.set('action', 'ping');
      const res = await fetch(urlObj.toString(), { method: 'GET', mode: 'cors' });
      if (!res.ok) {
        return { success: false, message: `Status HTTP ${res.status}` };
      }
      const data = await res.json();
      return data;
    } catch (e: any) {
      return { success: false, message: e.message || 'Koneksi gagal' };
    }
  },

  /**
   * Inisialisasi Database Google Sheets
   */
  async initializeDatabase(): Promise<ApiResponse<any>> {
    if (!isUsingSimulation()) {
      return await callGasApi('initializeDatabase', {}, 'POST');
    }
    initMockStorage();
    return {
      success: true,
      message: 'Database simulasi lokal berhasil diinisialisasi.',
      data: { defaultAdminEmail: 'admin@perpustakaan.sch.id', defaultAdminPassword: 'admin123' }
    };
  },

  /**
   * Login
   */
  async login(identifier: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    if (!isUsingSimulation()) {
      return await callGasApi('login', { identifier, password }, 'POST');
    }

    // Simulasi Login
    const users = getStoredMock<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    const cleanId = identifier.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === cleanId || u.nis.toLowerCase() === cleanId);

    if (!user) {
      return { success: false, message: 'Akun tidak ditemukan. Periksa Email atau NIS Anda.' };
    }

    // Password check sederhana untuk simulasi ('admin123' untuk admin, atau sembarang password >= 4 karakter untuk siswa)
    if (user.role === 'guru' && password !== 'admin123' && password !== 'password') {
      return { success: false, message: 'Kata sandi salah. Gunakan: admin123' };
    }

    if (user.status !== 'aktif') {
      return { success: false, message: 'Akun Anda berstatus nonaktif. Silakan hubungi Guru / Admin.' };
    }

    const token = `mock-token-${user.user_id}-${Date.now()}`;
    return {
      success: true,
      message: `Login berhasil. Selamat datang, ${user.nama}!`,
      data: { user, token }
    };
  },

  /**
   * Registrasi Siswa
   */
  async register(data: { nama: string; nis: string; email: string; password: string; kelas: string }): Promise<ApiResponse<any>> {
    if (!isUsingSimulation()) {
      return await callGasApi('register', data, 'POST');
    }

    // Simulasi Register
    const users = getStoredMock<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    const emailLower = data.email.trim().toLowerCase();

    if (users.some(u => u.email.toLowerCase() === emailLower)) {
      return { success: false, message: 'Email sudah terdaftar. Gunakan email lain.' };
    }
    if (users.some(u => u.nis === data.nis.trim())) {
      return { success: false, message: 'NIS sudah terdaftar dalam sistem perpustakaan.' };
    }

    const newUser: User = {
      user_id: `USR-SISWA-${Date.now()}`,
      nama: data.nama.trim(),
      nis: data.nis.trim(),
      email: emailLower,
      role: 'siswa', // KEAMANAN: Selalu 'siswa'
      kelas: data.kelas.trim(),
      status: 'aktif',
      created_at: getTodayString()
    };

    users.push(newUser);
    setStoredMock(STORAGE_KEYS.USERS, users);

    return {
      success: true,
      message: 'Pendaftaran akun Siswa berhasil! Silakan masuk.',
      data: { user_id: newUser.user_id, nama: newUser.nama }
    };
  },

  /**
   * Mengambil Katalog Buku
   */
  async getBooks(): Promise<ApiResponse<Book[]>> {
    if (!isUsingSimulation()) {
      return await callGasApi<Book[]>('getBooks', {}, 'GET');
    }
    const books = getStoredMock<Book[]>(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
    return { success: true, message: 'Berhasil mengambil katalog buku', data: books };
  },

  /**
   * Mengambil Detail Buku
   */
  async getBook(bookId: string): Promise<ApiResponse<Book>> {
    if (!isUsingSimulation()) {
      return await callGasApi<Book>('getBook', { book_id: bookId }, 'GET');
    }
    const books = getStoredMock<Book[]>(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
    const book = books.find(b => b.book_id === bookId);
    if (!book) return { success: false, message: 'Buku tidak ditemukan' };
    return { success: true, message: 'Berhasil', data: book };
  },

  /**
   * Tambah Buku (Admin / Guru)
   */
  async addBook(adminUserId: string, bookData: Omit<Book, 'book_id' | 'created_at'>): Promise<ApiResponse<any>> {
    if (!isUsingSimulation()) {
      return await callGasApi('addBook', { admin_user_id: adminUserId, ...bookData }, 'POST');
    }

    // Simulasi Tambah Buku
    const users = getStoredMock<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    const admin = users.find(u => u.user_id === adminUserId && u.role === 'guru');
    if (!admin) {
      return { success: false, message: 'Akses ditolak: Hanya Guru / Admin yang dapat menambah buku.' };
    }

    const books = getStoredMock<Book[]>(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
    const newBook: Book = {
      ...bookData,
      book_id: `BK-${Date.now().toString().slice(-6)}`,
      stok_tersedia: bookData.stok_total,
      created_at: getTodayString()
    };
    books.unshift(newBook);
    setStoredMock(STORAGE_KEYS.BOOKS, books);

    return { success: true, message: 'Buku berhasil ditambahkan ke katalog perpustakaan!', data: newBook };
  },

  /**
   * Update Buku (Admin / Guru)
   */
  async updateBook(adminUserId: string, book: Book): Promise<ApiResponse<any>> {
    if (!isUsingSimulation()) {
      return await callGasApi('updateBook', { admin_user_id: adminUserId, ...book }, 'POST');
    }

    const users = getStoredMock<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    const admin = users.find(u => u.user_id === adminUserId && u.role === 'guru');
    if (!admin) {
      return { success: false, message: 'Akses ditolak: Hanya Guru / Admin yang dapat mengedit buku.' };
    }

    const books = getStoredMock<Book[]>(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
    const idx = books.findIndex(b => b.book_id === book.book_id);
    if (idx === -1) {
      return { success: false, message: 'Buku tidak ditemukan' };
    }

    books[idx] = { ...book };
    setStoredMock(STORAGE_KEYS.BOOKS, books);

    return { success: true, message: 'Data buku berhasil diperbarui!' };
  },

  /**
   * Hapus Buku (Admin / Guru)
   */
  async deleteBook(adminUserId: string, bookId: string): Promise<ApiResponse<any>> {
    if (!isUsingSimulation()) {
      return await callGasApi('deleteBook', { admin_user_id: adminUserId, book_id: bookId }, 'POST');
    }

    const users = getStoredMock<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    const admin = users.find(u => u.user_id === adminUserId && u.role === 'guru');
    if (!admin) {
      return { success: false, message: 'Akses ditolak: Hanya Guru / Admin yang dapat menghapus buku.' };
    }

    const borrowings = getStoredMock<Borrowing[]>(STORAGE_KEYS.BORROWINGS, INITIAL_BORROWINGS);
    const isActivelyBorrowed = borrowings.some(br => br.book_id === bookId && br.status === 'dipinjam');
    if (isActivelyBorrowed) {
      return {
        success: false,
        message: 'Buku tidak dapat dihapus karena masih ada siswa yang sedang meminjam buku ini.'
      };
    }

    let books = getStoredMock<Book[]>(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
    books = books.filter(b => b.book_id !== bookId);
    setStoredMock(STORAGE_KEYS.BOOKS, books);

    return { success: true, message: 'Buku berhasil dihapus dari perpustakaan.' };
  },

  /**
   * Pinjam Buku (Siswa)
   */
  async borrowBook(userId: string, bookId: string): Promise<ApiResponse<any>> {
    if (!isUsingSimulation()) {
      return await callGasApi('borrowBook', { user_id: userId, book_id: bookId }, 'POST');
    }

    // Simulasi Peminjaman
    const users = getStoredMock<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    const user = users.find(u => u.user_id === userId);
    if (!user || user.status !== 'aktif') {
      return { success: false, message: 'Akun Anda tidak aktif atau tidak ditemukan.' };
    }

    const books = getStoredMock<Book[]>(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
    const book = books.find(b => b.book_id === bookId);
    if (!book) {
      return { success: false, message: 'Buku tidak ditemukan.' };
    }
    if (book.stok_tersedia <= 0) {
      return { success: false, message: 'Stok buku ini sedang habis.' };
    }

    const borrowings = getStoredMock<Borrowing[]>(STORAGE_KEYS.BORROWINGS, INITIAL_BORROWINGS);
    const settings = getStoredMock<LibrarySettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);

    const activeUserLoans = borrowings.filter(br => br.user_id === userId && br.status === 'dipinjam');
    if (activeUserLoans.length >= settings.maksimal_peminjaman) {
      return {
        success: false,
        message: `Anda sudah mencapai batas maksimal peminjaman (${settings.maksimal_peminjaman} buku). Kembalikan buku sebelumnya terlebih dahulu.`
      };
    }

    if (activeUserLoans.some(br => br.book_id === bookId)) {
      return { success: false, message: 'Anda sedang meminjam buku yang sama.' };
    }

    const today = new Date();
    const todayStr = getTodayString();
    const dueDate = new Date(today.getTime() + settings.durasi_peminjaman * 24 * 60 * 60 * 1000);
    const dueDateStr = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`;

    const newBorrowing: Borrowing = {
      borrowing_id: `BRW-${Date.now().toString().slice(-6)}`,
      user_id: userId,
      book_id: bookId,
      tanggal_pinjam: todayStr,
      tanggal_jatuh_tempo: dueDateStr,
      tanggal_kembali: '',
      status: 'dipinjam',
      judul: book.judul,
      penulis: book.penulis,
      cover_url: book.cover_url,
      nama_peminjam: user.nama,
      nis_peminjam: user.nis,
      kelas_peminjam: user.kelas
    };

    borrowings.unshift(newBorrowing);
    setStoredMock(STORAGE_KEYS.BORROWINGS, borrowings);

    // Kurangi stok buku
    book.stok_tersedia -= 1;
    setStoredMock(STORAGE_KEYS.BOOKS, books);

    return {
      success: true,
      message: `Buku "${book.judul}" berhasil dipinjam! Batas pengembalian: ${dueDateStr}`,
      data: newBorrowing
    };
  },

  /**
   * Peminjaman Saya (Siswa)
   */
  async getMyBorrowings(userId: string): Promise<ApiResponse<Borrowing[]>> {
    if (!isUsingSimulation()) {
      return await callGasApi<Borrowing[]>('getMyBorrowings', { user_id: userId }, 'GET');
    }

    const borrowings = getStoredMock<Borrowing[]>(STORAGE_KEYS.BORROWINGS, INITIAL_BORROWINGS);
    const books = getStoredMock<Book[]>(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
    const bookMap = new Map(books.map(b => [b.book_id, b]));
    const todayStr = getTodayString();

    const myLoans = borrowings
      .filter(br => br.user_id === userId)
      .map(br => {
        const b = bookMap.get(br.book_id);
        const item = { ...br };
        if (b) {
          item.judul = item.judul || b.judul;
          item.penulis = item.penulis || b.penulis;
          item.cover_url = item.cover_url || b.cover_url;
          item.kategori = item.kategori || b.kategori;
        }
        if (item.status === 'dipinjam' && item.tanggal_jatuh_tempo && todayStr > item.tanggal_jatuh_tempo) {
          item.status = 'terlambat';
        }
        return item;
      });

    return { success: true, message: 'Berhasil', data: myLoans };
  },

  /**
   * Seluruh Transaksi Peminjaman (Admin / Guru)
   */
  async getAllBorrowings(adminUserId: string): Promise<ApiResponse<Borrowing[]>> {
    if (!isUsingSimulation()) {
      return await callGasApi<Borrowing[]>('getAllBorrowings', { admin_user_id: adminUserId }, 'GET');
    }

    const borrowings = getStoredMock<Borrowing[]>(STORAGE_KEYS.BORROWINGS, INITIAL_BORROWINGS);
    const books = getStoredMock<Book[]>(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
    const users = getStoredMock<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);

    const bookMap = new Map(books.map(b => [b.book_id, b]));
    const userMap = new Map(users.map(u => [u.user_id, u]));
    const todayStr = getTodayString();

    const enriched = borrowings.map(br => {
      const b = bookMap.get(br.book_id);
      const u = userMap.get(br.user_id);
      const item = { ...br };
      if (b) {
        item.judul = item.judul || b.judul;
        item.penulis = item.penulis || b.penulis;
        item.cover_url = item.cover_url || b.cover_url;
      }
      if (u) {
        item.nama_peminjam = item.nama_peminjam || u.nama;
        item.nis_peminjam = item.nis_peminjam || u.nis;
        item.kelas_peminjam = item.kelas_peminjam || u.kelas;
      }
      if (item.status === 'dipinjam' && item.tanggal_jatuh_tempo && todayStr > item.tanggal_jatuh_tempo) {
        item.status = 'terlambat';
      }
      return item;
    });

    return { success: true, message: 'Berhasil', data: enriched };
  },

  /**
   * Proses Pengembalian Buku (Admin / Guru)
   */
  async returnBook(adminUserId: string, borrowingId: string): Promise<ApiResponse<any>> {
    if (!isUsingSimulation()) {
      return await callGasApi('returnBook', { admin_user_id: adminUserId, borrowing_id: borrowingId }, 'POST');
    }

    const users = getStoredMock<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    const admin = users.find(u => u.user_id === adminUserId && u.role === 'guru');
    if (!admin) {
      return { success: false, message: 'Akses ditolak: Hanya Guru / Admin yang dapat memproses pengembalian.' };
    }

    const borrowings = getStoredMock<Borrowing[]>(STORAGE_KEYS.BORROWINGS, INITIAL_BORROWINGS);
    const tx = borrowings.find(b => b.borrowing_id === borrowingId);
    if (!tx) {
      return { success: false, message: 'Transaksi peminjaman tidak ditemukan.' };
    }
    if (tx.status === 'dikembalikan') {
      return { success: false, message: 'Transaksi ini sudah pernah dikembalikan sebelumnya.' };
    }

    const todayStr = getTodayString();
    tx.status = 'dikembalikan';
    tx.tanggal_kembali = todayStr;
    setStoredMock(STORAGE_KEYS.BORROWINGS, borrowings);

    // Kembalikan stok buku
    const books = getStoredMock<Book[]>(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
    const book = books.find(b => b.book_id === tx.book_id);
    if (book) {
      book.stok_tersedia = Math.min(book.stok_total, book.stok_tersedia + 1);
      setStoredMock(STORAGE_KEYS.BOOKS, books);
    }

    return {
      success: true,
      message: 'Buku berhasil dikembalikan! Stok perpustakaan telah bertambah.',
      data: { borrowing_id: borrowingId, tanggal_kembali: todayStr }
    };
  },

  /**
   * Mengambil Daftar Seluruh Pengguna (Admin)
   */
  async getUsers(adminUserId: string): Promise<ApiResponse<User[]>> {
    if (!isUsingSimulation()) {
      return await callGasApi<User[]>('getUsers', { admin_user_id: adminUserId }, 'GET');
    }
    const users = getStoredMock<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    return { success: true, message: 'Berhasil', data: users };
  },

  /**
   * Ubah Status Pengguna (Aktif / Nonaktif)
   */
  async updateUserStatus(adminUserId: string, targetUserId: string, status: 'aktif' | 'nonaktif'): Promise<ApiResponse<any>> {
    if (!isUsingSimulation()) {
      return await callGasApi('updateUserStatus', {
        admin_user_id: adminUserId,
        target_user_id: targetUserId,
        status
      }, 'POST');
    }

    const users = getStoredMock<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    const admin = users.find(u => u.user_id === adminUserId && u.role === 'guru');
    if (!admin) {
      return { success: false, message: 'Akses ditolak.' };
    }

    const target = users.find(u => u.user_id === targetUserId);
    if (!target) {
      return { success: false, message: 'Pengguna tidak ditemukan.' };
    }

    target.status = status;
    setStoredMock(STORAGE_KEYS.USERS, users);

    return { success: true, message: `Status akun pengguna berhasil diubah menjadi ${status}.` };
  },

  /**
   * Mengambil Statistik Dashboard
   */
  async getDashboardStatsAdmin(adminUserId: string): Promise<ApiResponse<DashboardStatsAdmin>> {
    if (!isUsingSimulation()) {
      return await callGasApi<DashboardStatsAdmin>('getDashboardStats', { admin_user_id: adminUserId }, 'GET');
    }

    const books = getStoredMock<Book[]>(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
    const users = getStoredMock<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    const borrowings = getStoredMock<Borrowing[]>(STORAGE_KEYS.BORROWINGS, INITIAL_BORROWINGS);
    const todayStr = getTodayString();

    let totalEksemplar = 0;
    let totalTersedia = 0;
    const catMap: Record<string, number> = {};

    books.forEach(b => {
      totalEksemplar += b.stok_total;
      totalTersedia += b.stok_tersedia;
      catMap[b.kategori] = (catMap[b.kategori] || 0) + 1;
    });

    let totalDipinjam = 0;
    let totalTerlambat = 0;

    borrowings.forEach(br => {
      if (br.status === 'dipinjam') {
        totalDipinjam++;
        if (br.tanggal_jatuh_tempo && todayStr > br.tanggal_jatuh_tempo) {
          totalTerlambat++;
        }
      }
    });

    return {
      success: true,
      message: 'Berhasil',
      data: {
        total_buku: books.length,
        total_eksemplar: totalEksemplar,
        total_pengguna: users.length,
        total_dipinjam: totalDipinjam,
        total_terlambat: totalTerlambat,
        total_tersedia: totalTersedia,
        kategori_distribution: Object.entries(catMap).map(([kategori, count]) => ({ kategori, count })),
        peminjaman_per_bulan: [
          { bulan: 'Jan', jumlah: 14 },
          { bulan: 'Feb', jumlah: 22 },
          { bulan: 'Mar', jumlah: 18 },
          { bulan: 'Apr', jumlah: 25 },
          { bulan: 'Mei', jumlah: 31 },
          { bulan: 'Jun', jumlah: 28 }
        ],
        peminjaman_terbaru: borrowings.slice(0, 5)
      }
    };
  },

  async getDashboardStatsSiswa(userId: string): Promise<ApiResponse<DashboardStatsSiswa>> {
    if (!isUsingSimulation()) {
      return await callGasApi<DashboardStatsSiswa>('getDashboardStats', { user_id: userId }, 'GET');
    }

    const books = getStoredMock<Book[]>(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
    const borrowings = getStoredMock<Borrowing[]>(STORAGE_KEYS.BORROWINGS, INITIAL_BORROWINGS);
    const settings = getStoredMock<LibrarySettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    const todayStr = getTodayString();

    const myLoans = borrowings.filter(br => br.user_id === userId && br.status === 'dipinjam');
    let terlambat = 0;
    let nearest: string | null = null;

    myLoans.forEach(l => {
      if (l.tanggal_jatuh_tempo && todayStr > l.tanggal_jatuh_tempo) terlambat++;
      if (l.tanggal_jatuh_tempo && (!nearest || l.tanggal_jatuh_tempo < nearest)) {
        nearest = l.tanggal_jatuh_tempo;
      }
    });

    const totalTersedia = books.reduce((acc, b) => acc + b.stok_tersedia, 0);

    return {
      success: true,
      message: 'Berhasil',
      data: {
        sedang_dipinjam_count: myLoans.length,
        tersedia_count: totalTersedia,
        maksimal_pinjam: settings.maksimal_peminjaman,
        terlambat_count: terlambat,
        jatuh_tempo_terdekat: nearest,
        buku_dipinjam: myLoans,
        rekomendasi_buku: books.slice(0, 4)
      }
    };
  },

  /**
   * Kategori Buku
   */
  async getCategories(): Promise<ApiResponse<Category[]>> {
    if (!isUsingSimulation()) {
      return await callGasApi<Category[]>('getCategories', {}, 'GET');
    }
    const cats = getStoredMock<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    return { success: true, message: 'Berhasil', data: cats };
  },

  /**
   * Pengaturan Perpustakaan
   */
  async getSettings(): Promise<ApiResponse<LibrarySettings>> {
    if (!isUsingSimulation()) {
      return await callGasApi<LibrarySettings>('getSettings', {}, 'GET');
    }
    const settings = getStoredMock<LibrarySettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    return { success: true, message: 'Berhasil', data: settings };
  },

  async updateSettings(adminUserId: string, settings: Partial<LibrarySettings>): Promise<ApiResponse<any>> {
    if (!isUsingSimulation()) {
      return await callGasApi('updateSettings', { admin_user_id: adminUserId, ...settings }, 'POST');
    }
    const current = getStoredMock<LibrarySettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    const updated = { ...current, ...settings };
    setStoredMock(STORAGE_KEYS.SETTINGS, updated);
    return { success: true, message: 'Pengaturan perpustakaan berhasil diperbarui!' };
  }
};
