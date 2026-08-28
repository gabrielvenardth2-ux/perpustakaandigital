import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar, ActivePage } from './components/Sidebar';
import { ToastContainer, ToastMessage } from './components/Toast';
import { SetupModal } from './components/SetupModal';
import { BookDetailModal } from './components/BookDetailModal';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Siswa Pages
import { SiswaDashboard } from './pages/siswa/SiswaDashboard';
import { KatalogPage } from './pages/siswa/KatalogPage';
import { PeminjamanSayaPage } from './pages/siswa/PeminjamanSayaPage';
import { RiwayatSiswaPage } from './pages/siswa/RiwayatSiswaPage';
import { ProfilSiswaPage } from './pages/siswa/ProfilSiswaPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { KelolaBukuPage } from './pages/admin/KelolaBukuPage';
import { KelolaPenggunaPage } from './pages/admin/KelolaPenggunaPage';
import { PeminjamanAdminPage } from './pages/admin/PeminjamanAdminPage';
import { MejaPengembalianPage } from './pages/admin/MejaPengembalianPage';
import { RiwayatAdminPage } from './pages/admin/RiwayatAdminPage';

import { api } from './services/api';
import { Book, Category, Borrowing } from './types';

const MainApp: React.FC = () => {
  const { user, isLoading: isAuthLoading } = useAuth();

  // Navigation State
  const [activePage, setActivePage] = useState<ActivePage>('siswa-dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  // Modals & Notifications
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Core Data
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Toast Helper
  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const handleDismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Synchronize initial page based on Role
  useEffect(() => {
    if (user) {
      if (user.role === 'guru') {
        setActivePage('admin-dashboard');
      } else {
        setActivePage('siswa-dashboard');
      }
      loadInitialData();
    }
  }, [user]);

  // Role Access Guard: Prevent Siswa from accessing Admin pages
  useEffect(() => {
    if (user && user.role === 'siswa' && activePage.startsWith('admin-')) {
      showToast('error', 'Akses ditolak: Anda tidak memiliki izin administrator.');
      setActivePage('siswa-dashboard');
    }
  }, [activePage, user]);

  const loadInitialData = async () => {
    if (!user) return;
    setIsDataLoading(true);
    try {
      const [booksRes, catsRes, loansRes] = await Promise.all([
        api.getBooks(),
        api.getCategories(),
        user.role === 'guru'
          ? api.getAllBorrowings(user.user_id)
          : api.getMyBorrowings(user.user_id)
      ]);

      if (booksRes.success && booksRes.data) setBooks(booksRes.data);
      if (catsRes.success && catsRes.data) setCategories(catsRes.data);
      if (loansRes.success && loansRes.data) setBorrowings(loansRes.data);
    } catch (e) {
      console.error('Gagal memuat data utama:', e);
    } finally {
      setIsDataLoading(false);
    }
  };

  // Check student active loans & overdue limits
  const activeLoans = borrowings.filter(b => b.status === 'dipinjam' || b.status === 'terlambat');
  const overdueLoans = activeLoans.filter(b => b.status === 'terlambat');
  const canBorrow = activeLoans.length < 3 && overdueLoans.length === 0;

  const borrowLimitReason =
    activeLoans.length >= 3
      ? 'Anda telah mencapai batas maksimal 3 buku yang sedang dipinjam.'
      : overdueLoans.length > 0
      ? 'Anda memiliki tanggungan buku yang terlambat. Harap kembalikan terlebih dahulu.'
      : undefined;

  // Handle Borrow Book
  const handleBorrowBook = async (bookId: string): Promise<boolean> => {
    if (!user) return false;
    if (user.role !== 'siswa') {
      showToast('error', 'Hanya siswa yang dapat melakukan peminjaman buku.');
      return false;
    }

    setIsBorrowing(true);
    try {
      const res = await api.borrowBook(user.user_id, bookId);
      if (res.success) {
        showToast('success', res.message || 'Peminjaman buku berhasil!');
        // Refresh catalogue and loans data
        await loadInitialData();
        return true;
      } else {
        showToast('error', res.message || 'Gagal meminjam buku.');
        return false;
      }
    } catch (err: any) {
      showToast('error', err.message || 'Terjadi kesalahan sistem.');
      return false;
    } finally {
      setIsBorrowing(false);
    }
  };

  // Open Book Detail Modal
  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    setIsDetailOpen(true);
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-medium">Memuat Perpustakaan Digital...</p>
        </div>
      </div>
    );
  }

  // Not logged in -> Show Login or Register
  if (!user) {
    return (
      <>
        {authView === 'login' ? (
          <LoginPage
            onSwitchToRegister={() => setAuthView('register')}
            onShowToast={showToast}
            onOpenSetup={() => setIsSetupOpen(true)}
          />
        ) : (
          <RegisterPage
            onSwitchToLogin={() => setAuthView('login')}
            onShowToast={showToast}
          />
        )}

        <SetupModal
          isOpen={isSetupOpen}
          onClose={() => setIsSetupOpen(false)}
          onShowToast={showToast}
        />

        <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
      </>
    );
  }

  // Logged in layout
  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col">
      <Navbar
        onOpenSetup={() => setIsSetupOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          activePage={activePage}
          onSelectPage={page => setActivePage(page)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeLoansCount={activeLoans.length}
          overdueCount={overdueLoans.length}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {/* Siswa Pages */}
          {activePage === 'siswa-dashboard' && (
            <SiswaDashboard
              onNavigateKatalog={() => setActivePage('siswa-katalog')}
              onNavigatePeminjaman={() => setActivePage('siswa-peminjaman')}
              onSelectBook={handleSelectBook}
            />
          )}

          {activePage === 'siswa-katalog' && (
            <KatalogPage
              books={books}
              categories={categories}
              isLoading={isDataLoading}
              onSelectBook={handleSelectBook}
              onRefresh={loadInitialData}
            />
          )}

          {activePage === 'siswa-peminjaman' && (
            <PeminjamanSayaPage
              borrowings={borrowings}
              isLoading={isDataLoading}
              onNavigateKatalog={() => setActivePage('siswa-katalog')}
            />
          )}

          {activePage === 'siswa-riwayat' && (
            <RiwayatSiswaPage borrowings={borrowings} isLoading={isDataLoading} />
          )}

          {activePage === 'siswa-profil' && (
            <ProfilSiswaPage borrowings={borrowings} />
          )}

          {/* Admin Pages */}
          {activePage === 'admin-dashboard' && (
            <AdminDashboard
              onNavigateBuku={() => setActivePage('admin-buku')}
              onNavigatePengguna={() => setActivePage('admin-pengguna')}
              onNavigatePeminjaman={() => setActivePage('admin-peminjaman')}
              onNavigatePengembalian={() => setActivePage('admin-pengembalian')}
              onOpenSetup={() => setIsSetupOpen(true)}
              onShowToast={showToast}
            />
          )}

          {activePage === 'admin-buku' && (
            <KelolaBukuPage
              books={books}
              categories={categories}
              isLoading={isDataLoading}
              onRefresh={loadInitialData}
              onShowToast={showToast}
            />
          )}

          {activePage === 'admin-pengguna' && (
            <KelolaPenggunaPage onShowToast={showToast} />
          )}

          {activePage === 'admin-peminjaman' && (
            <PeminjamanAdminPage
              borrowings={borrowings}
              isLoading={isDataLoading}
              onRefresh={loadInitialData}
              onShowToast={showToast}
            />
          )}

          {activePage === 'admin-pengembalian' && (
            <MejaPengembalianPage
              borrowings={borrowings}
              isLoading={isDataLoading}
              onRefresh={loadInitialData}
              onShowToast={showToast}
            />
          )}

          {activePage === 'admin-riwayat' && (
            <RiwayatAdminPage borrowings={borrowings} isLoading={isDataLoading} />
          )}
        </main>
      </div>

      {/* Book Detail Modal */}
      <BookDetailModal
        book={selectedBook}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedBook(null);
        }}
        onBorrow={handleBorrowBook}
        isBorrowing={isBorrowing}
        canBorrow={canBorrow}
        borrowLimitReason={borrowLimitReason}
      />

      {/* Setup & Instructions Modal */}
      <SetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        onShowToast={showToast}
      />

      {/* Global Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
