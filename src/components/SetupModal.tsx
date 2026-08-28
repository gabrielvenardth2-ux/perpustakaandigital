import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Database,
  ShieldCheck,
  CloudLightning,
  TableProperties
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface SetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const SetupModal: React.FC<SetupModalProps> = ({ isOpen, onClose, onShowToast }) => {
  const { apiUrl, updateApiUrl, isDemoMode, toggleDemoMode } = useAuth();
  const [inputUrl, setInputUrl] = useState(apiUrl);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!inputUrl.trim()) {
      setTestResult({ success: false, message: 'Masukkan URL Google Apps Script terlebih dahulu.' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await api.testConnection(inputUrl.trim());
      setTestResult({
        success: res.success,
        message: res.success
          ? 'Koneksi Berhasil! Google Apps Script Web App aktif dan merespons dengan baik.'
          : `Koneksi Gagal: ${res.message || 'Pastikan Web App diset "Who has access: Anyone"'}`
      });
      if (res.success) {
        updateApiUrl(inputUrl.trim());
        toggleDemoMode(false);
        onShowToast('success', 'URL API berhasil diverifikasi dan disimpan!');
      }
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || 'Koneksi gagal.' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveUrl = () => {
    updateApiUrl(inputUrl.trim());
    if (inputUrl.trim()) {
      toggleDemoMode(false);
      onShowToast('success', 'URL Web App tersimpan di memori browser.');
    } else {
      toggleDemoMode(true);
      onShowToast('info', 'URL dikosongkan. Beralih ke mode demo lokal.');
    }
  };

  const handleInitializeDb = async () => {
    setIsInitializing(true);
    try {
      const res = await api.initializeDatabase();
      if (res.success) {
        onShowToast('success', res.message || 'Inisialisasi database berhasil!');
      } else {
        onShowToast('error', res.message || 'Gagal menginisialisasi database.');
      }
    } catch (e: any) {
      onShowToast('error', e.message || 'Gagal inisialisasi.');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      const response = await fetch('/google-apps-script/Code.gs');
      let codeText = '';
      if (response.ok) {
        codeText = await response.text();
      }
      if (!codeText) {
        codeText = `// Silakan ambil file /google-apps-script/Code.gs di repository ini`;
      }
      await navigator.clipboard.writeText(codeText);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2500);
      onShowToast('success', 'Kode Google Apps Script berhasil disalin ke clipboard!');
    } catch (err) {
      onShowToast('error', 'Gagal menyalin kode. Anda dapat melihat file google-apps-script/Code.gs');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Pengaturan Google Sheets & Apps Script</h2>
              <p className="text-xs text-slate-500">Konfigurasi database Google Sheets melalui REST API Web App</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Status Banner */}
          <div className={`p-4 rounded-xl border flex items-start justify-between gap-4 ${
            !isDemoMode && apiUrl
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${!isDemoMode && apiUrl ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
              <div>
                <h4 className="text-sm font-semibold">
                  {!isDemoMode && apiUrl ? 'Terhubung ke Google Apps Script' : 'Mode Demo / Simulasi Offline Aktif'}
                </h4>
                <p className="text-xs mt-0.5 opacity-90">
                  {!isDemoMode && apiUrl
                    ? `Request terhubung ke: ${apiUrl.slice(0, 45)}...`
                    : 'Aplikasi saat ini menggunakan database simulasi lokal sehingga dapat langsung diuji. Masukkan URL Web App Anda untuk menghubungkan ke Google Sheets asli.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleDemoMode(!isDemoMode)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-current hover:bg-black/5 shrink-0 transition-colors"
            >
              {isDemoMode ? 'Pakai Web App' : 'Pakai Demo'}
            </button>
          </div>

          {/* Input URL Web App */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800">
              Google Apps Script Web App URL <span className="text-xs font-normal text-slate-500">(VITE_API_URL)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                value={inputUrl}
                onChange={e => setInputUrl(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono text-xs"
              />
              <button
                onClick={handleSaveUrl}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shrink-0 transition-colors"
              >
                Simpan
              </button>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleTestConnection}
                disabled={isTesting || !inputUrl.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                {isTesting ? 'Menguji Koneksi...' : 'Test Koneksi'}
              </button>
              <button
                onClick={handleInitializeDb}
                disabled={isInitializing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
              >
                <TableProperties className="w-3.5 h-3.5" />
                {isInitializing ? 'Menginisialisasi...' : 'Inisialisasi Database Sheet'}
              </button>
            </div>

            {testResult && (
              <div className={`p-3 rounded-xl text-xs font-medium mt-2 border ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}>
                {testResult.message}
              </div>
            )}
          </div>

          {/* Quick Steps Guide */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3 text-xs text-slate-700">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <CloudLightning className="w-4 h-4 text-blue-600" />
              Langkah Cepat Setup Google Sheets & Apps Script:
            </h4>
            <ol className="list-decimal list-inside space-y-2 leading-relaxed">
              <li>
                Buat Google Spreadsheet baru di{' '}
                <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-blue-600 underline inline-flex items-center gap-0.5">
                  sheets.new <ExternalLink className="w-3 h-3" />
                </a>.
              </li>
              <li>
                Di Spreadsheet, buka menu: <strong>Extensions &gt; Apps Script</strong> (Ekstensi &gt; Apps Script).
              </li>
              <li>
                Salin seluruh kode dari file <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-900">google-apps-script/Code.gs</code>:
                <button
                  onClick={handleCopyCode}
                  className="ml-2 inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-300 rounded-md font-semibold text-slate-800 hover:bg-slate-50 shadow-2xs"
                >
                  {copiedScript ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copiedScript ? 'Tersalin!' : 'Salin Kode Apps Script'}
                </button>
              </li>
              <li>
                Tempel kode tersebut ke editor Apps Script, lalu klik icon <strong>Save (Simpan)</strong>.
              </li>
              <li>
                Klik tombol <strong>Deploy &gt; New deployment</strong> (Terapkan &gt; Penerapan baru):
                <ul className="list-disc list-inside pl-4 mt-1 space-y-1 text-slate-600">
                  <li>Pilih jenis: <strong>Web app</strong></li>
                  <li>Execute as: <strong>Me (email Anda)</strong></li>
                  <li>Who has access: <strong>Anyone (Siapa saja)</strong></li>
                </ul>
              </li>
              <li>
                Klik <strong>Deploy</strong>, izinkan hak akses Google (Authorize access), lalu salin URL Web App yang berakhiran <code className="bg-slate-200 px-1 rounded">/exec</code>.
              </li>
              <li>
                Tempel URL tersebut ke kolom di atas dan simpan, atau tambahkan ke <code className="bg-slate-200 px-1 rounded">.env</code> / Vercel sebagai <code className="bg-slate-200 px-1 rounded">VITE_API_URL</code>.
              </li>
            </ol>
          </div>

          {/* Admin Account Note */}
          <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              Akun Awal Guru / Admin Default:
            </div>
            <p>
              Saat fungsi inisialisasi dijalankan, sistem membuat 1 akun Guru default jika belum ada akun guru:
            </p>
            <div className="font-mono bg-white/80 p-2 rounded-lg border border-blue-200 mt-1 flex flex-col sm:flex-row sm:gap-6 text-slate-800">
              <div>Email: <strong>admin@perpustakaan.sch.id</strong></div>
              <div>Password: <strong>admin123</strong></div>
              <div>NIS/NIP: <strong>GURU001</strong></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
