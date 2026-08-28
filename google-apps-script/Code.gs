/**
 * ============================================================================
 * PERPUSTAKAAN DIGITAL - GOOGLE APPS SCRIPT BACKEND API
 * ============================================================================
 * Petunjuk Penggunaan:
 * 1. Buat Spreadsheet baru di Google Drive (https://sheets.new).
 * 2. Buka Extensions > Apps Script (Ekstensi > Apps Script).
 * 3. Hapus semua kode default dan tempelkan seluruh kode ini.
 * 4. Ganti SPREADSHEET_ID di bawah ini dengan ID spreadsheet Anda.
 *    (Atau jika Apps Script ini dibuat langsung dari Google Sheet,
 *     biarkan SPREADSHEET_ID kosong "" untuk mendeteksi secara otomatis).
 * 5. Jalankan fungsi "initializeDatabase" sekali untuk membuat sheet & data awal.
 * 6. Klik "Deploy" > "New deployment" (Terapkan > Penerapan baru).
 * 7. Pilih tipe "Web app":
 *    - Execute as: Me (Email Anda)
 *    - Who has access: Anyone (Siapa saja)
 * 8. Salin URL Web App yang dihasilkan dan masukkan ke Vercel / .env frontend:
 *    VITE_API_URL="https://script.google.com/macros/s/AKfycb.../exec"
 * ============================================================================
 */

// GANTI DENGAN ID SPREADSHEET ANDA (Opsional jika bound script)
// Contoh: "1A2B3C4D5E6F7G8H9I0J..."
const SPREADSHEET_ID = "";

// Timezone Indonesia (WIB)
const TIMEZONE = "Asia/Jakarta";

// Nama-nama Sheet
const SHEETS = {
  USERS: "Users",
  BOOKS: "Books",
  BORROWINGS: "Borrowings",
  CATEGORIES: "Categories",
  SETTINGS: "Settings"
};

/**
 * Mendapatkan referensi Spreadsheet
 */
function getSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== "") {
    return SpreadsheetApp.openById(SPREADSHEET_ID.trim());
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Hash password menggunakan SHA-256
 */
function hashPassword(password) {
  if (!password) return "";
  const rawHash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    password,
    Utilities.Charset.UTF_8
  );
  let txtHash = "";
  for (let i = 0; i < rawHash.length; i++) {
    let hashVal = rawHash[i];
    if (hashVal < 0) hashVal += 256;
    let byteStr = hashVal.toString(16);
    if (byteStr.length === 1) byteStr = "0" + byteStr;
    txtHash += byteStr;
  }
  return txtHash;
}

/**
 * Format tanggal YYYY-MM-DD
 */
function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return Utilities.formatDate(d, TIMEZONE, "yyyy-MM-dd");
}

/**
 * Helper untuk response JSON
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Helper konversi baris sheet menjadi array of objects
 */
function sheetToObjects(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  const headers = values[0].map(h => String(h).trim());
  const rows = [];
  for (let i = 1; i < values.length; i++) {
    const rowObj = {};
    for (let j = 0; j < headers.length; j++) {
      let cellVal = values[i][j];
      if (cellVal instanceof Date) {
        cellVal = formatDate(cellVal);
      }
      rowObj[headers[j]] = cellVal;
    }
    rowObj.__rowIndex = i + 1; // simpan index baris fisik di sheet
    rows.push(rowObj);
  }
  return rows;
}

/**
 * Mendapatkan nilai pengaturan dari sheet Settings
 */
function getSettingValue(key, defaultValue) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.SETTINGS);
  if (!sheet) return defaultValue;
  const data = sheetToObjects(sheet);
  const found = data.find(item => String(item.key).trim().toLowerCase() === String(key).trim().toLowerCase());
  return found ? found.value : defaultValue;
}

/**
 * Verifikasi apakah user_id memiliki role 'guru' dan status 'aktif'
 * Keamanan backend: Frontend role tidak pernah dipercaya!
 */
function verifyAdminRole(userId) {
  if (!userId) return false;
  const ss = getSpreadsheet();
  const usersSheet = ss.getSheetByName(SHEETS.USERS);
  if (!usersSheet) return false;
  const users = sheetToObjects(usersSheet);
  const admin = users.find(u => String(u.user_id) === String(userId) && u.role === "guru" && u.status === "aktif");
  return !!admin;
}

/**
 * Verifikasi apakah user aktif
 */
function getUserById(userId) {
  if (!userId) return null;
  const ss = getSpreadsheet();
  const usersSheet = ss.getSheetByName(SHEETS.USERS);
  if (!usersSheet) return null;
  const users = sheetToObjects(usersSheet);
  const user = users.find(u => String(u.user_id) === String(userId));
  if (user) {
    const safeUser = { ...user };
    delete safeUser.password;
    delete safeUser.__rowIndex;
    return safeUser;
  }
  return null;
}

/**
 * ============================================================================
 * HTTP GET HANDLER
 * ============================================================================
 */
function doGet(e) {
  try {
    const params = e ? e.parameter : {};
    const action = params.action || "ping";

    switch (action) {
      case "ping":
        return createJsonResponse({
          success: true,
          message: "API Perpustakaan Digital Aktif",
          timestamp: new Date().toISOString()
        });

      case "getBooks":
        return handleGetBooks(params);

      case "getBook":
        return handleGetBook(params.book_id);

      case "getCategories":
        return handleGetCategories();

      case "getSettings":
        return handleGetSettings();

      case "getMyBorrowings":
        return handleGetMyBorrowings(params.user_id);

      case "getAllBorrowings":
        return handleGetAllBorrowings(params.admin_user_id);

      case "getUsers":
        return handleGetUsers(params.admin_user_id);

      case "getDashboardStats":
        return handleGetDashboardStats(params);

      case "initializeDatabase":
        return handleInitializeDatabase();

      default:
        return createJsonResponse({
          success: false,
          message: "Action GET tidak dikenali: " + action
        });
    }
  } catch (err) {
    return createJsonResponse({
      success: false,
      message: "Terjadi kesalahan server: " + err.toString()
    });
  }
}

/**
 * ============================================================================
 * HTTP POST HANDLER
 * ============================================================================
 */
function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (pErr) {
        payload = e.parameter || {};
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    const action = payload.action || (e && e.parameter && e.parameter.action);

    switch (action) {
      case "login":
        return handleLogin(payload);

      case "register":
        return handleRegister(payload);

      case "getUser":
        return handleGetUser(payload);

      case "addBook":
        return handleAddBook(payload);

      case "updateBook":
        return handleUpdateBook(payload);

      case "deleteBook":
        return handleDeleteBook(payload);

      case "borrowBook":
        return handleBorrowBook(payload);

      case "returnBook":
        return handleReturnBook(payload);

      case "updateUserStatus":
        return handleUpdateUserStatus(payload);

      case "updateSettings":
        return handleUpdateSettings(payload);

      case "initializeDatabase":
        return handleInitializeDatabase();

      default:
        return createJsonResponse({
          success: false,
          message: "Action POST tidak dikenali: " + action
        });
    }
  } catch (err) {
    return createJsonResponse({
      success: false,
      message: "Gagal memproses permintaan: " + err.toString()
    });
  }
}

/**
 * ============================================================================
 * HANDLER: AUTENTIKASI
 * ============================================================================
 */
function handleLogin(payload) {
  const identifier = (payload.identifier || payload.email || payload.nis || "").toString().trim().toLowerCase();
  const password = (payload.password || "").toString().trim();

  if (!identifier || !password) {
    return createJsonResponse({
      success: false,
      message: "Email / NIS dan password wajib diisi"
    });
  }

  const ss = getSpreadsheet();
  const usersSheet = ss.getSheetByName(SHEETS.USERS);
  if (!usersSheet) {
    return createJsonResponse({
      success: false,
      message: "Database belum diinisialisasi. Silakan hubungi administrator."
    });
  }

  const users = sheetToObjects(usersSheet);
  const passwordHash = hashPassword(password);

  const matchedUser = users.find(u => {
    const emailMatch = String(u.email || "").trim().toLowerCase() === identifier;
    const nisMatch = String(u.nis || "").trim().toLowerCase() === identifier;
    return (emailMatch || nisMatch);
  });

  if (!matchedUser) {
    return createJsonResponse({
      success: false,
      message: "Akun tidak ditemukan. Periksa kembali Email atau NIS Anda."
    });
  }

  if (String(matchedUser.password) !== passwordHash) {
    return createJsonResponse({
      success: false,
      message: "Kata sandi yang Anda masukkan salah."
    });
  }

  if (matchedUser.status !== "aktif") {
    return createJsonResponse({
      success: false,
      message: "Akun Anda berstatus nonaktif. Silakan hubungi Guru / Petugas Perpustakaan."
    });
  }

  const safeUser = {
    user_id: matchedUser.user_id,
    nama: matchedUser.nama,
    nis: matchedUser.nis,
    email: matchedUser.email,
    role: matchedUser.role,
    kelas: matchedUser.kelas,
    status: matchedUser.status,
    created_at: matchedUser.created_at
  };

  const token = Utilities.base64Encode(JSON.stringify({
    userId: safeUser.user_id,
    role: safeUser.role,
    timestamp: new Date().getTime()
  }));

  return createJsonResponse({
    success: true,
    message: "Login berhasil. Selamat datang, " + safeUser.nama + "!",
    data: {
      user: safeUser,
      token: token
    }
  });
}

function handleRegister(payload) {
  const nama = (payload.nama || "").toString().trim();
  const nis = (payload.nis || "").toString().trim();
  const email = (payload.email || "").toString().trim().toLowerCase();
  const password = (payload.password || "").toString().trim();
  const kelas = (payload.kelas || "").toString().trim();

  if (!nama || !email || !password || !nis) {
    return createJsonResponse({
      success: false,
      message: "Nama, NIS, Email, dan Password wajib diisi."
    });
  }

  const ss = getSpreadsheet();
  const usersSheet = ss.getSheetByName(SHEETS.USERS);
  if (!usersSheet) {
    return createJsonResponse({
      success: false,
      message: "Sheet Users belum dibuat."
    });
  }

  const users = sheetToObjects(usersSheet);

  // Cek duplikasi email atau NIS
  const emailExists = users.some(u => String(u.email || "").trim().toLowerCase() === email);
  if (emailExists) {
    return createJsonResponse({
      success: false,
      message: "Email sudah terdaftar. Silakan gunakan email lain atau login."
    });
  }

  const nisExists = users.some(u => String(u.nis || "").trim() === nis);
  if (nisExists) {
    return createJsonResponse({
      success: false,
      message: "NIS sudah terdaftar dalam sistem."
    });
  }

  // KEAMANAN: Role pendaftaran mandiri SELALU 'siswa'!
  const role = "siswa";
  const status = "aktif";
  const userId = "USR-" + Utilities.formatDate(new Date(), TIMEZONE, "yyMMddHHmmss") + "-" + Math.floor(Math.random() * 1000);
  const passwordHash = hashPassword(password);
  const createdAt = formatDate(new Date());

  usersSheet.appendRow([
    userId,
    nama,
    nis,
    email,
    passwordHash,
    role,
    kelas,
    status,
    createdAt
  ]);

  return createJsonResponse({
    success: true,
    message: "Pendaftaran berhasil! Silakan login dengan akun Anda.",
    data: {
      user_id: userId,
      nama: nama,
      role: role
    }
  });
}

function handleGetUser(payload) {
  const userId = payload.user_id;
  const user = getUserById(userId);
  if (!user) {
    return createJsonResponse({
      success: false,
      message: "Pengguna tidak ditemukan."
    });
  }
  return createJsonResponse({
    success: true,
    message: "Berhasil mengambil profil pengguna",
    data: user
  });
}

/**
 * ============================================================================
 * HANDLER: BUKU (CRUD)
 * ============================================================================
 */
function handleGetBooks(params) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.BOOKS);
  if (!sheet) {
    return createJsonResponse({ success: true, data: [] });
  }

  const books = sheetToObjects(sheet).map(b => {
    delete b.__rowIndex;
    b.stok_total = Number(b.stok_total) || 0;
    b.stok_tersedia = Number(b.stok_tersedia) || 0;
    return b;
  });

  return createJsonResponse({
    success: true,
    message: "Berhasil mengambil daftar buku",
    data: books
  });
}

function handleGetBook(bookId) {
  if (!bookId) {
    return createJsonResponse({ success: false, message: "ID Buku tidak valid" });
  }
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.BOOKS);
  if (!sheet) {
    return createJsonResponse({ success: false, message: "Buku tidak ditemukan" });
  }
  const books = sheetToObjects(sheet);
  const book = books.find(b => String(b.book_id) === String(bookId));
  if (!book) {
    return createJsonResponse({ success: false, message: "Buku tidak ditemukan" });
  }
  delete book.__rowIndex;
  book.stok_total = Number(book.stok_total) || 0;
  book.stok_tersedia = Number(book.stok_tersedia) || 0;

  return createJsonResponse({
    success: true,
    data: book
  });
}

function handleAddBook(payload) {
  const adminUserId = payload.admin_user_id;
  if (!verifyAdminRole(adminUserId)) {
    return createJsonResponse({
      success: false,
      message: "Akses ditolak: Hanya Guru / Admin yang dapat menambah buku."
    });
  }

  const judul = (payload.judul || "").toString().trim();
  const penulis = (payload.penulis || "").toString().trim();
  const penerbit = (payload.penerbit || "").toString().trim();
  const tahun = payload.tahun || new Date().getFullYear();
  const kategori = (payload.kategori || "Umum").toString().trim();
  const isbn = (payload.isbn || "-").toString().trim();
  const deskripsi = (payload.deskripsi || "").toString().trim();
  const coverUrl = (payload.cover_url || "").toString().trim();
  const stokTotal = parseInt(payload.stok_total, 10) || 1;

  if (!judul || !penulis) {
    return createJsonResponse({
      success: false,
      message: "Judul buku dan penulis wajib diisi."
    });
  }

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.BOOKS);
  const bookId = "BK-" + Utilities.formatDate(new Date(), TIMEZONE, "yyMMddHHmmss") + "-" + Math.floor(Math.random() * 100);
  const createdAt = formatDate(new Date());

  sheet.appendRow([
    bookId,
    judul,
    penulis,
    penerbit,
    tahun,
    kategori,
    isbn,
    deskripsi,
    coverUrl,
    stokTotal,
    stokTotal, // stok_tersedia awal sama dengan stok_total
    createdAt
  ]);

  return createJsonResponse({
    success: true,
    message: "Buku berhasil ditambahkan ke katalog.",
    data: { book_id: bookId, judul: judul }
  });
}

function handleUpdateBook(payload) {
  const adminUserId = payload.admin_user_id;
  if (!verifyAdminRole(adminUserId)) {
    return createJsonResponse({
      success: false,
      message: "Akses ditolak: Hanya Guru / Admin yang dapat mengedit buku."
    });
  }

  const bookId = payload.book_id;
  if (!bookId) {
    return createJsonResponse({ success: false, message: "ID Buku tidak valid." });
  }

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.BOOKS);
  const books = sheetToObjects(sheet);
  const existing = books.find(b => String(b.book_id) === String(bookId));

  if (!existing) {
    return createJsonResponse({ success: false, message: "Buku tidak ditemukan." });
  }

  const rowIndex = existing.__rowIndex;
  const currentStokTotal = Number(existing.stok_total) || 0;
  const currentStokTersedia = Number(existing.stok_tersedia) || 0;
  const newStokTotal = payload.stok_total !== undefined ? (parseInt(payload.stok_total, 10) || 0) : currentStokTotal;

  // Hitung penyesuaian stok tersedia jika stok total berubah
  const stokDipinjam = Math.max(0, currentStokTotal - currentStokTersedia);
  let newStokTersedia = Math.max(0, newStokTotal - stokDipinjam);
  if (payload.stok_tersedia !== undefined) {
    newStokTersedia = parseInt(payload.stok_tersedia, 10);
  }

  const updatedData = [
    bookId,
    payload.judul !== undefined ? payload.judul : existing.judul,
    payload.penulis !== undefined ? payload.penulis : existing.penulis,
    payload.penerbit !== undefined ? payload.penerbit : existing.penerbit,
    payload.tahun !== undefined ? payload.tahun : existing.tahun,
    payload.kategori !== undefined ? payload.kategori : existing.kategori,
    payload.isbn !== undefined ? payload.isbn : existing.isbn,
    payload.deskripsi !== undefined ? payload.deskripsi : existing.deskripsi,
    payload.cover_url !== undefined ? payload.cover_url : existing.cover_url,
    newStokTotal,
    newStokTersedia,
    existing.created_at || formatDate(new Date())
  ];

  sheet.getRange(rowIndex, 1, 1, updatedData.length).setValues([updatedData]);

  return createJsonResponse({
    success: true,
    message: "Data buku berhasil diperbarui."
  });
}

function handleDeleteBook(payload) {
  const adminUserId = payload.admin_user_id;
  if (!verifyAdminRole(adminUserId)) {
    return createJsonResponse({
      success: false,
      message: "Akses ditolak: Hanya Guru / Admin yang dapat menghapus buku."
    });
  }

  const bookId = payload.book_id;
  const ss = getSpreadsheet();

  // Validasi: Buku tidak boleh dihapus jika masih ada transaksi peminjaman aktif!
  const borrowingsSheet = ss.getSheetByName(SHEETS.BORROWINGS);
  if (borrowingsSheet) {
    const borrowings = sheetToObjects(borrowingsSheet);
    const hasActiveBorrow = borrowings.some(br => String(br.book_id) === String(bookId) && br.status === "dipinjam");
    if (hasActiveBorrow) {
      return createJsonResponse({
        success: false,
        message: "Buku tidak dapat dihapus karena masih ada siswa yang sedang meminjam buku ini."
      });
    }
  }

  const booksSheet = ss.getSheetByName(SHEETS.BOOKS);
  const books = sheetToObjects(booksSheet);
  const book = books.find(b => String(b.book_id) === String(bookId));

  if (!book) {
    return createJsonResponse({ success: false, message: "Buku tidak ditemukan." });
  }

  booksSheet.deleteRow(book.__rowIndex);

  return createJsonResponse({
    success: true,
    message: "Buku berhasil dihapus dari perpustakaan."
  });
}

/**
 * ============================================================================
 * HANDLER: PEMINJAMAN (BORROWINGS)
 * ============================================================================
 */
function handleBorrowBook(payload) {
  const userId = payload.user_id;
  const bookId = payload.book_id;

  if (!userId || !bookId) {
    return createJsonResponse({
      success: false,
      message: "Parameter user_id dan book_id diperlukan."
    });
  }

  const ss = getSpreadsheet();
  const usersSheet = ss.getSheetByName(SHEETS.USERS);
  const booksSheet = ss.getSheetByName(SHEETS.BOOKS);
  const borrowingsSheet = ss.getSheetByName(SHEETS.BORROWINGS);

  // 1. Cek User Valid & Aktif
  const users = sheetToObjects(usersSheet);
  const user = users.find(u => String(u.user_id) === String(userId));
  if (!user) {
    return createJsonResponse({ success: false, message: "Pengguna tidak ditemukan." });
  }
  if (user.status !== "aktif") {
    return createJsonResponse({ success: false, message: "Akun Anda nonaktif. Tidak dapat meminjam buku." });
  }

  // 2. Cek Buku & Ketersediaan Stok
  const books = sheetToObjects(booksSheet);
  const book = books.find(b => String(b.book_id) === String(bookId));
  if (!book) {
    return createJsonResponse({ success: false, message: "Buku tidak ditemukan." });
  }

  const stokTersedia = Number(book.stok_tersedia) || 0;
  if (stokTersedia <= 0) {
    return createJsonResponse({
      success: false,
      message: "Stok buku sedang kosong / tidak tersedia."
    });
  }

  // 3. Cek Batas Maksimal Peminjaman & Peminjaman Buku yang Sama
  const borrowings = sheetToObjects(borrowingsSheet);
  const activeUserBorrowings = borrowings.filter(br => String(br.user_id) === String(userId) && br.status === "dipinjam");

  const maxPinjam = parseInt(getSettingValue("maksimal_peminjaman", "3"), 10) || 3;
  if (activeUserBorrowings.length >= maxPinjam) {
    return createJsonResponse({
      success: false,
      message: "Anda telah mencapai batas maksimal peminjaman (" + maxPinjam + " buku). Silakan kembalikan buku sebelumnya terlebih dahulu."
    });
  }

  // 4. Cek apakah sudah meminjam buku yang sama
  const alreadyBorrowingSame = activeUserBorrowings.some(br => String(br.book_id) === String(bookId));
  if (alreadyBorrowingSame) {
    return createJsonResponse({
      success: false,
      message: "Anda saat ini sedang meminjam buku yang sama."
    });
  }

  // 5. Buat Transaksi Peminjaman
  const borrowingId = "BRW-" + Utilities.formatDate(new Date(), TIMEZONE, "yyMMddHHmmss") + "-" + Math.floor(Math.random() * 100);
  const now = new Date();
  const tanggalPinjam = formatDate(now);

  const durasiHari = parseInt(getSettingValue("durasi_peminjaman", "7"), 10) || 7;
  const jatuhTempoDate = new Date(now.getTime() + (durasiHari * 24 * 60 * 60 * 1000));
  const tanggalJatuhTempo = formatDate(jatuhTempoDate);
  const tanggalKembali = "";
  const status = "dipinjam";

  // Catat peminjaman di sheet Borrowings
  borrowingsSheet.appendRow([
    borrowingId,
    userId,
    bookId,
    tanggalPinjam,
    tanggalJatuhTempo,
    tanggalKembali,
    status
  ]);

  // Kurangi stok_tersedia sebanyak 1 di sheet Books
  const newStokTersedia = stokTersedia - 1;
  // Kolom stok_tersedia adalah kolom ke-11
  booksSheet.getRange(book.__rowIndex, 11).setValue(newStokTersedia);

  return createJsonResponse({
    success: true,
    message: "Buku berhasil dipinjam! Batas pengembalian: " + tanggalJatuhTempo,
    data: {
      borrowing_id: borrowingId,
      judul: book.judul,
      tanggal_pinjam: tanggalPinjam,
      tanggal_jatuh_tempo: tanggalJatuhTempo,
      durasi: durasiHari
    }
  });
}

function handleReturnBook(payload) {
  const adminUserId = payload.admin_user_id;
  if (!verifyAdminRole(adminUserId)) {
    return createJsonResponse({
      success: false,
      message: "Akses ditolak: Hanya Guru / Admin yang dapat memproses pengembalian buku."
    });
  }

  const borrowingId = payload.borrowing_id;
  if (!borrowingId) {
    return createJsonResponse({ success: false, message: "ID Peminjaman tidak valid." });
  }

  const ss = getSpreadsheet();
  const borrowingsSheet = ss.getSheetByName(SHEETS.BORROWINGS);
  const booksSheet = ss.getSheetByName(SHEETS.BOOKS);

  const borrowings = sheetToObjects(borrowingsSheet);
  const tx = borrowings.find(b => String(b.borrowing_id) === String(borrowingId));

  if (!tx) {
    return createJsonResponse({ success: false, message: "Transaksi peminjaman tidak ditemukan." });
  }

  // Mencegah stok bertambah dua kali jika sudah dikembalikan
  if (tx.status === "dikembalikan") {
    return createJsonResponse({
      success: false,
      message: "Transaksi ini sudah berstatus dikembalikan sebelumnya."
    });
  }

  const todayStr = formatDate(new Date());

  // Update sheet Borrowings: tanggal_kembali (kolom 6), status (kolom 7)
  borrowingsSheet.getRange(tx.__rowIndex, 6).setValue(todayStr);
  borrowingsSheet.getRange(tx.__rowIndex, 7).setValue("dikembalikan");

  // Tambahkan stok_tersedia sebanyak 1 di sheet Books
  const books = sheetToObjects(booksSheet);
  const book = books.find(b => String(b.book_id) === String(tx.book_id));
  if (book) {
    const curStok = Number(book.stok_tersedia) || 0;
    const maxStok = Number(book.stok_total) || 1;
    const newStok = Math.min(maxStok, curStok + 1);
    booksSheet.getRange(book.__rowIndex, 11).setValue(newStok);
  }

  return createJsonResponse({
    success: true,
    message: "Pengembalian buku berhasil diproses.",
    data: {
      borrowing_id: borrowingId,
      tanggal_kembali: todayStr
    }
  });
}

/**
 * Mendapatkan daftar riwayat peminjaman siswa
 */
function handleGetMyBorrowings(userId) {
  if (!userId) {
    return createJsonResponse({ success: false, message: "User ID diperlukan." });
  }

  const ss = getSpreadsheet();
  const borrowingsSheet = ss.getSheetByName(SHEETS.BORROWINGS);
  const booksSheet = ss.getSheetByName(SHEETS.BOOKS);

  if (!borrowingsSheet || !booksSheet) {
    return createJsonResponse({ success: true, data: [] });
  }

  const borrowings = sheetToObjects(borrowingsSheet);
  const books = sheetToObjects(booksSheet);
  const bookMap = {};
  books.forEach(b => { bookMap[String(b.book_id)] = b; });

  const todayStr = formatDate(new Date());

  const myBorrowings = borrowings
    .filter(br => String(br.user_id) === String(userId))
    .map(br => {
      delete br.__rowIndex;
      const bInfo = bookMap[String(br.book_id)] || {};
      br.judul = bInfo.judul || "Buku tidak ditemukan";
      br.penulis = bInfo.penulis || "";
      br.cover_url = bInfo.cover_url || "";
      br.kategori = bInfo.kategori || "";

      // Evaluasi status terlambat secara real-time
      if (br.status === "dipinjam" && br.tanggal_jatuh_tempo && todayStr > br.tanggal_jatuh_tempo) {
        br.status = "terlambat";
      }
      return br;
    })
    .sort((a, b) => (b.tanggal_pinjam || "").localeCompare(a.tanggal_pinjam || ""));

  return createJsonResponse({
    success: true,
    data: myBorrowings
  });
}

/**
 * Mendapatkan seluruh peminjaman untuk admin
 */
function handleGetAllBorrowings(adminUserId) {
  if (!verifyAdminRole(adminUserId)) {
    return createJsonResponse({
      success: false,
      message: "Akses ditolak: Hanya Guru / Admin yang dapat melihat seluruh peminjaman."
    });
  }

  const ss = getSpreadsheet();
  const borrowingsSheet = ss.getSheetByName(SHEETS.BORROWINGS);
  const booksSheet = ss.getSheetByName(SHEETS.BOOKS);
  const usersSheet = ss.getSheetByName(SHEETS.USERS);

  if (!borrowingsSheet) {
    return createJsonResponse({ success: true, data: [] });
  }

  const borrowings = sheetToObjects(borrowingsSheet);
  const books = sheetToObjects(booksSheet || []);
  const users = sheetToObjects(usersSheet || []);

  const bookMap = {};
  books.forEach(b => { bookMap[String(b.book_id)] = b; });

  const userMap = {};
  users.forEach(u => { userMap[String(u.user_id)] = u; });

  const todayStr = formatDate(new Date());

  const enriched = borrowings.map(br => {
    delete br.__rowIndex;
    const b = bookMap[String(br.book_id)] || {};
    const u = userMap[String(br.user_id)] || {};

    br.judul = b.judul || "Buku Dihapus";
    br.penulis = b.penulis || "";
    br.cover_url = b.cover_url || "";

    br.nama_peminjam = u.nama || "Pengguna Tidak Ditemukan";
    br.nis_peminjam = u.nis || "-";
    br.kelas_peminjam = u.kelas || "-";

    // Hitung status terlambat jika belum dikembalikan dan melewati jatuh tempo
    if (br.status === "dipinjam" && br.tanggal_jatuh_tempo && todayStr > br.tanggal_jatuh_tempo) {
      br.status = "terlambat";
    }

    return br;
  }).sort((a, b) => (b.tanggal_pinjam || "").localeCompare(a.tanggal_pinjam || ""));

  return createJsonResponse({
    success: true,
    data: enriched
  });
}

/**
 * ============================================================================
 * HANDLER: PENGGUNA (ADMIN)
 * ============================================================================
 */
function handleGetUsers(adminUserId) {
  if (!verifyAdminRole(adminUserId)) {
    return createJsonResponse({
      success: false,
      message: "Akses ditolak: Hanya Guru / Admin yang dapat melihat daftar pengguna."
    });
  }

  const ss = getSpreadsheet();
  const usersSheet = ss.getSheetByName(SHEETS.USERS);
  if (!usersSheet) return createJsonResponse({ success: true, data: [] });

  const users = sheetToObjects(usersSheet).map(u => {
    delete u.password; // KEAMANAN: Password tidak pernah dikembalikan ke admin!
    delete u.__rowIndex;
    return u;
  });

  return createJsonResponse({
    success: true,
    data: users
  });
}

function handleUpdateUserStatus(payload) {
  const adminUserId = payload.admin_user_id;
  if (!verifyAdminRole(adminUserId)) {
    return createJsonResponse({
      success: false,
      message: "Akses ditolak: Hanya Guru / Admin yang dapat mengubah status pengguna."
    });
  }

  const targetUserId = payload.target_user_id;
  const newStatus = payload.status; // 'aktif' | 'nonaktif'

  if (!targetUserId || !newStatus) {
    return createJsonResponse({ success: false, message: "Parameter tidak lengkap." });
  }

  const ss = getSpreadsheet();
  const usersSheet = ss.getSheetByName(SHEETS.USERS);
  const users = sheetToObjects(usersSheet);
  const target = users.find(u => String(u.user_id) === String(targetUserId));

  if (!target) {
    return createJsonResponse({ success: false, message: "Pengguna tidak ditemukan." });
  }

  // Kolom status ada di urutan ke-8
  usersSheet.getRange(target.__rowIndex, 8).setValue(newStatus);

  return createJsonResponse({
    success: true,
    message: "Status pengguna berhasil diubah menjadi " + newStatus + "."
  });
}

/**
 * ============================================================================
 * HANDLER: STATISTIK & PENGATURAN
 * ============================================================================
 */
function handleGetCategories() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.CATEGORIES);
  if (!sheet) return createJsonResponse({ success: true, data: [] });
  const cats = sheetToObjects(sheet).map(c => {
    delete c.__rowIndex;
    return c;
  });
  return createJsonResponse({ success: true, data: cats });
}

function handleGetSettings() {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.SETTINGS);
  const settings = {
    durasi_peminjaman: 7,
    maksimal_peminjaman: 3
  };
  if (sheet) {
    const list = sheetToObjects(sheet);
    list.forEach(item => {
      if (item.key === "durasi_peminjaman") settings.durasi_peminjaman = parseInt(item.value, 10) || 7;
      if (item.key === "maksimal_peminjaman") settings.maksimal_peminjaman = parseInt(item.value, 10) || 3;
    });
  }
  return createJsonResponse({ success: true, data: settings });
}

function handleUpdateSettings(payload) {
  const adminUserId = payload.admin_user_id;
  if (!verifyAdminRole(adminUserId)) {
    return createJsonResponse({ success: false, message: "Akses ditolak." });
  }

  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.SETTINGS);
  if (!sheet) return createJsonResponse({ success: false, message: "Sheet Settings tidak ditemukan." });

  const rows = sheetToObjects(sheet);
  if (payload.durasi_peminjaman !== undefined) {
    const r = rows.find(x => x.key === "durasi_peminjaman");
    if (r) sheet.getRange(r.__rowIndex, 2).setValue(payload.durasi_peminjaman);
  }
  if (payload.maksimal_peminjaman !== undefined) {
    const r = rows.find(x => x.key === "maksimal_peminjaman");
    if (r) sheet.getRange(r.__rowIndex, 2).setValue(payload.maksimal_peminjaman);
  }

  return createJsonResponse({ success: true, message: "Pengaturan perpustakaan berhasil diperbarui." });
}

function handleGetDashboardStats(params) {
  const ss = getSpreadsheet();
  const booksSheet = ss.getSheetByName(SHEETS.BOOKS);
  const borrowingsSheet = ss.getSheetByName(SHEETS.BORROWINGS);
  const usersSheet = ss.getSheetByName(SHEETS.USERS);

  const books = booksSheet ? sheetToObjects(booksSheet) : [];
  const borrowings = borrowingsSheet ? sheetToObjects(borrowingsSheet) : [];
  const users = usersSheet ? sheetToObjects(usersSheet) : [];

  const todayStr = formatDate(new Date());

  let totalBuku = books.length;
  let totalEksemplar = 0;
  let totalTersedia = 0;
  const katDistMap = {};

  books.forEach(b => {
    const tot = Number(b.stok_total) || 0;
    const ters = Number(b.stok_tersedia) || 0;
    totalEksemplar += tot;
    totalTersedia += ters;
    const k = b.kategori || "Lainnya";
    katDistMap[k] = (katDistMap[k] || 0) + 1;
  });

  let totalDipinjam = 0;
  let totalTerlambat = 0;

  borrowings.forEach(br => {
    if (br.status === "dipinjam") {
      totalDipinjam++;
      if (br.tanggal_jatuh_tempo && todayStr > br.tanggal_jatuh_tempo) {
        totalTerlambat++;
      }
    }
  });

  const kategoriDistribution = Object.keys(katDistMap).map(k => ({
    kategori: k,
    count: katDistMap[k]
  }));

  // Jika request dari siswa, tambahkan data spesifik siswa
  if (params.user_id) {
    const studentBorrowings = borrowings.filter(br => String(br.user_id) === String(params.user_id));
    const activeStudent = studentBorrowings.filter(br => br.status === "dipinjam");
    let studentTerlambat = 0;
    let nearestDue = null;

    activeStudent.forEach(br => {
      if (br.tanggal_jatuh_tempo && todayStr > br.tanggal_jatuh_tempo) {
        studentTerlambat++;
      }
      if (br.tanggal_jatuh_tempo) {
        if (!nearestDue || br.tanggal_jatuh_tempo < nearestDue) {
          nearestDue = br.tanggal_jatuh_tempo;
        }
      }
    });

    return createJsonResponse({
      success: true,
      data: {
        sedang_dipinjam_count: activeStudent.length,
        tersedia_count: totalTersedia,
        maksimal_pinjam: parseInt(getSettingValue("maksimal_peminjaman", "3"), 10) || 3,
        terlambat_count: studentTerlambat,
        jatuh_tempo_terdekat: nearestDue,
        total_katalog: totalBuku
      }
    });
  }

  // Response default untuk Guru / Admin
  return createJsonResponse({
    success: true,
    data: {
      total_buku: totalBuku,
      total_eksemplar: totalEksemplar,
      total_pengguna: users.length,
      total_dipinjam: totalDipinjam,
      total_terlambat: totalTerlambat,
      total_tersedia: totalTersedia,
      kategori_distribution: kategoriDistribution
    }
  });
}

/**
 * ============================================================================
 * DATABASE INITIALIZATION & SEEDER
 * ============================================================================
 * Fungsi ini membuat sheet & struktur kolom otomatis jika belum ada,
 * dan hanya membuat SATU akun guru/admin awal jika belum ada akun guru.
 */
function handleInitializeDatabase() {
  const ss = getSpreadsheet();

  // =========================================================
  // KONFIGURASI ADMIN AWAL
  // =========================================================
  const INITIAL_ADMIN_EMAIL = "admin@perpustakaan.com";
  const INITIAL_ADMIN_PASSWORD = "admin123";
  const INITIAL_ADMIN_NAME = "Administrator";
  const INITIAL_ADMIN_NIS = "GURU001";
  const INITIAL_ADMIN_KELAS = "Staf Perpustakaan";

  // =========================================================
  // 1. USERS
  // =========================================================
  let usersSheet = ss.getSheetByName(SHEETS.USERS);

  if (!usersSheet) {
    usersSheet = ss.insertSheet(SHEETS.USERS);

    usersSheet.appendRow([
      "user_id",
      "nama",
      "nis",
      "email",
      "password",
      "role",
      "kelas",
      "status",
      "created_at"
    ]);
  }

  // =========================================================
  // 2. BOOKS
  // =========================================================
  let booksSheet = ss.getSheetByName(SHEETS.BOOKS);

  if (!booksSheet) {
    booksSheet = ss.insertSheet(SHEETS.BOOKS);

    booksSheet.appendRow([
      "book_id",
      "judul",
      "penulis",
      "penerbit",
      "tahun",
      "kategori",
      "isbn",
      "deskripsi",
      "cover_url",
      "stok_total",
      "stok_tersedia",
      "created_at"
    ]);
  }

  // =========================================================
  // 3. BORROWINGS
  // =========================================================
  let borrowingsSheet = ss.getSheetByName(SHEETS.BORROWINGS);

  if (!borrowingsSheet) {
    borrowingsSheet = ss.insertSheet(SHEETS.BORROWINGS);

    borrowingsSheet.appendRow([
      "borrowing_id",
      "user_id",
      "book_id",
      "tanggal_pinjam",
      "tanggal_jatuh_tempo",
      "tanggal_kembali",
      "status"
    ]);
  }

  // =========================================================
  // 4. CATEGORIES
  // =========================================================
  let categoriesSheet = ss.getSheetByName(SHEETS.CATEGORIES);

  if (!categoriesSheet) {
    categoriesSheet = ss.insertSheet(SHEETS.CATEGORIES);

    categoriesSheet.appendRow([
      "category_id",
      "nama_kategori"
    ]);
  }

  // =========================================================
  // 5. SETTINGS
  // =========================================================
  let settingsSheet = ss.getSheetByName(SHEETS.SETTINGS);

  if (!settingsSheet) {
    settingsSheet = ss.insertSheet(SHEETS.SETTINGS);

    settingsSheet.appendRow(["key", "value"]);
    settingsSheet.appendRow(["durasi_peminjaman", "7"]);
    settingsSheet.appendRow(["maksimal_peminjaman", "3"]);
  }

  // =========================================================
  // 6. PERBAIKI / BUAT ADMIN
  // =========================================================
  const currentUsers = sheetToObjects(usersSheet);

  // Cari akun guru berdasarkan role
  let adminUser = currentUsers.find(
    u => String(u.role).trim().toLowerCase() === "guru"
  );

  // ---------------------------------------------------------
  // Jika sudah ada guru/admin
  // ---------------------------------------------------------
  if (adminUser) {

    const rowIndex = adminUser.__rowIndex;

    // Cek apakah password masih placeholder
    const currentPassword = String(adminUser.password || "");

    const isPlaceholder =
      currentPassword === "" ||
      currentPassword === "GANTI_PASSWORD_ADMIN" ||
      currentPassword === "GANTI_PASSWORD_SISWA";

    if (isPlaceholder) {

      // Password baru akan di-hash
      const hashedPassword = hashPassword(INITIAL_ADMIN_PASSWORD);

      usersSheet.getRange(rowIndex, 4).setValue(INITIAL_ADMIN_EMAIL);
      usersSheet.getRange(rowIndex, 5).setValue(hashedPassword);
      usersSheet.getRange(rowIndex, 6).setValue("guru");
      usersSheet.getRange(rowIndex, 8).setValue("aktif");

      Logger.log("Admin lama ditemukan dan password diperbaiki.");

    } else {

      // Admin sudah memiliki password.
      // JANGAN mengubahnya.
      Logger.log("Admin sudah ada. Data admin dipertahankan.");
    }

  }

  // ---------------------------------------------------------
  // Jika BELUM ADA guru/admin
  // ---------------------------------------------------------
  else {

    const hashedPassword = hashPassword(INITIAL_ADMIN_PASSWORD);

    usersSheet.appendRow([
      "USR-ADMIN-001",
      INITIAL_ADMIN_NAME,
      INITIAL_ADMIN_NIS,
      INITIAL_ADMIN_EMAIL,
      hashedPassword,
      "guru",
      INITIAL_ADMIN_KELAS,
      "aktif",
      formatDate(new Date())
    ]);

    Logger.log("Admin awal berhasil dibuat.");
  }

  // =========================================================
  // 7. JANGAN HAPUS BUKU YANG SUDAH ADA
  // =========================================================
  const currentBooks = sheetToObjects(booksSheet);

  if (currentBooks.length === 0) {

    Logger.log("Sheet Books kosong. Tidak menghapus apa pun.");

    // Tidak otomatis memasukkan buku contoh.
    // Buku dapat ditambahkan melalui dashboard admin.
  } else {

    Logger.log(
      "Buku sudah tersedia: " +
      currentBooks.length +
      " data. Semua data dipertahankan."
    );
  }

  // =========================================================
  // 8. HASIL
  // =========================================================
  return createJsonResponse({
    success: true,
    message: "Database berhasil diperiksa tanpa menghapus data.",
    data: {
      users: sheetToObjects(usersSheet).length,
      books: sheetToObjects(booksSheet).length,
      admin_email: INITIAL_ADMIN_EMAIL
    }
  });
}