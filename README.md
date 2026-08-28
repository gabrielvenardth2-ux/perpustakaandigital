# Aplikasi Web Perpustakaan Digital (React + Google Apps Script + Google Sheets)

Aplikasi web Perpustakaan Digital modern, responsif, dan siap di-deploy ke **Vercel**, dengan backend REST API berbasis **Google Apps Script Web App** dan basis data **Google Sheets**.

---

## 1. Teknologi & Arsitektur

* **Frontend:** React 19 + TypeScript + Vite
* **Styling:** Tailwind CSS + Lucide React Icons
* **Backend API:** Google Apps Script Web App (`google-apps-script/Code.gs`)
* **Database:** Google Spreadsheet (Tanpa Firebase/Supabase/SQL)
* **Deployment Frontend:** Vercel

---

## 2. Struktur Database Google Sheets

Sistem menggunakan 5 lembar (sheet) dalam satu Google Spreadsheet:

1. **Users**
   * Kolom: `user_id`, `nama`, `nis`, `email`, `password_hash`, `kelas`, `role`, `status`, `created_at`
2. **Books**
   * Kolom: `book_id`, `judul`, `penulis`, `penerbit`, `tahun`, `isbn`, `kategori`, `deskripsi`, `cover_url`, `stok_total`, `stok_tersedia`, `created_at`
3. **Borrowings**
   * Kolom: `borrowing_id`, `user_id`, `book_id`, `tanggal_pinjam`, `tanggal_jatuh_tempo`, `tanggal_kembali`, `status`, `catatan`
4. **Categories**
   * Kolom: `category_id`, `nama_kategori`
5. **Settings**
   * Kolom: `key`, `value`

> **Tips Cepat:** Anda tidak perlu membuat kolom secara manual satu per satu! Endpoint `action=initializeDatabase` akan otomatis membuat ke-5 lembar beserta header dan akun awal ketika pertama kali dijalankan (bisa dijalankan via tombol "Inisialisasi Database Sheet" di aplikasi).

---

## 3. Panduan Setup Google Apps Script

1. Buat Google Spreadsheet baru di [sheets.new](https://sheets.new).
2. Di menu spreadsheet, pilih **Extensions (Ekstensi) > Apps Script**.
3. Hapus kode default di editor, lalu salin seluruh kode dari file `google-apps-script/Code.gs`.
4. Klik tombol **Save** (ikon disket).
5. Klik tombol **Deploy > New deployment (Terapkan > Penerapan baru)**:
   * Pilih jenis: **Web app**
   * Description: `Perpustakaan API v1`
   * Execute as: **Me (email Anda)**
   * Who has access: **Anyone (Siapa saja)** *(Wajib dipilih agar frontend dapat mengirim request)*
6. Klik tombol **Deploy**, izinkan otorisasi akun Google Anda (*Authorize access*).
7. Salin URL Web App yang berakhiran `/exec`.
8. Tempel URL tersebut ke menu Pengaturan di aplikasi atau masukkan ke file `.env` sebagai `VITE_API_URL`.

---

## 4. Panduan Deploy ke Vercel

1. Push repository ini ke GitHub / GitLab.
2. Buka dashboard [Vercel](https://vercel.com) dan klik **Add New Project**.
3. Import repository perpustakaan ini.
4. Di bagian **Environment Variables**, tambahkan:
   * **Key:** `VITE_API_URL`
   * **Value:** *(URL Web App Google Apps Script yang berakhiran `/exec`)*
5. Klik **Deploy**. Vercel akan otomatis melakukan build (`vite build`) dan menghasilkan web app berkinerja tinggi.

---

## 5. Akun Awal & Pengujian Cepat

Aplikasi dilengkapi dengan mode simulasi offline cerdas sehingga dapat langsung diuji di browser tanpa konfigurasi awal sekalipun.

Tersedia akun bawaan:
* **Guru / Admin:**
  * Email / Username: `admin@perpustakaan.sch.id`
  * Password: `admin123`
* **Siswa:**
  * NIS / Username: `20241001`
  * Password: `password`

---

## 6. Fitur & Keamanan

* **Role Validation di Backend:** Role diverifikasi langsung dari sheet `Users` di Google Apps Script sebelum mengeksekusi operasi admin.
* **Hashing Password:** Kata sandi disimpan dalam bentuk hash SHA-256 dan tidak pernah dikembalikan ke client.
* **Proteksi Stok & Durasi Pinjam:** Durasi otomatis 7 hari kalender, pencegahan peminjaman buku jika stok habis, dan pengembalian otomatis menambah stok kembali ke rak.
* **Proteksi Hapus Buku:** Buku yang sedang dipinjam oleh siswa tidak dapat dihapus.
