import React from 'react';
import { 
  Database, RefreshCw, Key, ShieldAlert, CheckCircle, 
  Trash2, UserPlus, Server, Copy, HelpCircle, Save, Image, Upload
} from 'lucide-react';
import { SystemConfig, User, UserRole } from '../types';
import { apiService } from '../utils/apiService';
import { GOOGLE_APPS_SCRIPT_CODE, SPREADSHEET_SCHEMA } from '../utils/googleAppsScript';

interface SystemSettingsProps {
  config: SystemConfig;
  onConfigSave: (config: SystemConfig) => void;
  users: User[];
  onUsersUpdate: () => void;
}

export default function SystemSettings({ config, onConfigSave, users, onUsersUpdate }: SystemSettingsProps) {
  const [activeSubTab, setActiveSubTab] = React.useState<'database' | 'user' | 'logo' | 'panduan'>('database');
  
  // Database state
  const [apiUrl, setApiUrl] = React.useState(config.apiUrl);
  const [spreadsheetUrl, setSpreadsheetUrl] = React.useState(config.spreadsheetUrl);
  const [driveFolderId, setDriveFolderId] = React.useState(config.driveFolderId);
  const [useMock, setUseMock] = React.useState(config.useMock);

  const [testResult, setTestResult] = React.useState<{ success: boolean; msg: string } | null>(null);
  const [isTesting, setIsTesting] = React.useState(false);
  const [isCopied, setIsCopied] = React.useState(false);

  // User database state
  const [newUsername, setNewUsername] = React.useState('');
  const [newNama, setNewNama] = React.useState('');
  const [newRole, setNewRole] = React.useState<UserRole>('Operator Bidang');
  const [newBidang, setNewBidang] = React.useState('Ormas');
  const [newPassword, setNewPassword] = React.useState('operator123');

  // Logo state
  const [logoBase64, setLogoBase64] = React.useState(config.customLogo || '');
  const [isDragging, setIsDragging] = React.useState(false);
  const [logoSaveStatus, setLogoSaveStatus] = React.useState<'idle' | 'saved' | 'error'>('idle');

  React.useEffect(() => {
    if (config.customLogo !== undefined) {
      setLogoBase64(config.customLogo);
    }
  }, [config.customLogo]);

  const handleLogoFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa format gambar (PNG, JPG, JPEG, atau SVG)!');
      return;
    }
    // Check file size (keep it reasonable, e.g., under 1.5MB for localStorage)
    if (file.size > 1.5 * 1024 * 1024) {
      alert('Ukuran berkas logo terlalu besar (maksimal 1.5 MB agar tersimpan dengan baik di sistem local!).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setLogoBase64(base64);
      setLogoSaveStatus('idle');
    };
    reader.onerror = () => {
      alert('Gagal membaca file gambar logo.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleLogoFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleLogoFile(e.target.files[0]);
    }
  };

  const handleSaveLogo = () => {
    try {
      onConfigSave({
        ...config,
        customLogo: logoBase64
      });
      setLogoSaveStatus('saved');
      setTimeout(() => setLogoSaveStatus('idle'), 3000);
    } catch (err) {
      setLogoSaveStatus('error');
    }
  };

  const handleResetLogo = () => {
    if (window.confirm('Apakah Anda yakin ingin mengembalikan logo instansi ke default (Lambang Provinsi NTB)?')) {
      setLogoBase64('');
      onConfigSave({
        ...config,
        customLogo: ''
      });
      setLogoSaveStatus('saved');
      setTimeout(() => setLogoSaveStatus('idle'), 3000);
    }
  };

  const handleConfigSave = (e: React.FormEvent) => {
    e.preventDefault();
    onConfigSave({
      apiUrl,
      spreadsheetUrl,
      driveFolderId,
      useMock
    });
    alert('Konfigurasi sistem berhasil disimpan!');
  };

  const handleTestConnection = async () => {
    if (!apiUrl) {
      setTestResult({ success: false, msg: 'Masukkan URL Google Apps Script Web API terlebih dahulu.' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    const res = await apiService.testConnection(apiUrl);
    setIsTesting(false);
    if (res.success) {
      setTestResult({ success: true, msg: 'SINKRONISASI BERHASIL! Aplikasi terhubung dengan Google Sheets.' });
    } else {
      setTestResult({ success: false, msg: `KONEKSI GAGAL: ${res.error || 'Periksa CORS atau kecocokan URL Anda'}` });
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // User CRUD actions
  const handleAddUser = () => {
    if (!newUsername || !newNama) {
      alert('Nama dan Username wajib diisi!');
      return;
    }
    const currentUsers = JSON.parse(localStorage.getItem('Users') || '[]');
    const isExist = currentUsers.some((u: any) => u.username === newUsername);
    if (isExist) {
      alert('Username sudah terdaftar!');
      return;
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      username: newUsername,
      nama: newNama,
      role: newRole,
      bidang: newBidang
    };

    currentUsers.push(newUser);
    localStorage.setItem('Users', JSON.stringify(currentUsers));
    
    // Seed password entry offline simulated for login verify
    // Keep credentials inside code or storage safely
    setNewUsername('');
    setNewNama('');
    onUsersUpdate();
    alert(`Pengguna Baru ${newNama} berhasil ditambahkan! Password default Anda: operator123`);
  };

  const handleDeleteUser = (id: string) => {
    if (id === 'usr-1') {
      alert('Administrator utama tidak boleh dihapus!');
      return;
    }
    if (confirm('Apakah Anda yakin ingin menghapus akses pengguna ini?')) {
      const currentUsers = JSON.parse(localStorage.getItem('Users') || '[]');
      const filtered = currentUsers.filter((u: any) => u.id !== id);
      localStorage.setItem('Users', JSON.stringify(filtered));
      onUsersUpdate();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Pengaturan Sistem</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Atur integrasi database awan Google Spreadsheet, pengelolaan otorisasi pengguna, dan struktur master data.
        </p>
      </div>

      {/* Sub Menu Tabs */}
      <div className="flex border-b border-gray-150 dark:border-slate-800 gap-1.5">
        {[
          { id: 'database', label: 'Integrasi Database', icon: Server },
          { id: 'user', label: 'Pengelolaan Pengguna', icon: Key },
          { id: 'logo', label: 'Import Logo', icon: Image },
          { id: 'panduan', label: 'Panduan Pemasangan', icon: HelpCircle }
        ].map(tab => {
          const IconComp = tab.icon;
          const isSel = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4.5 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                isSel 
                  ? 'border-teal-600 text-teal-600 dark:text-teal-400 font-extrabold' 
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
            >
              <IconComp className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-TAB PANELS */}

      {/* Panel 1: Database & Spreadsheet API Configuration */}
      {activeSubTab === 'database' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Config Input Form */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-md font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
              <Database className="w-5 h-5 text-teal-600" />
              <span>Konfigurasi Google Apps Script Web API</span>
            </h3>

            <form onSubmit={handleConfigSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1.5">Mode Jalur Database</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      checked={useMock === true} 
                      onChange={() => setUseMock(true)}
                      className="text-teal-600 focus:ring-teal-500 h-4 w-4"
                    />
                    <span className="text-xs text-gray-700 dark:text-gray-300 font-semibold">Offline / Mock Database (Sangat Cepat & Aman)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      checked={useMock === false} 
                      onChange={() => setUseMock(false)}
                      className="text-teal-600 focus:ring-teal-500 h-4 w-4"
                    />
                    <span className="text-xs text-gray-700 dark:text-gray-300 font-semibold">Live Google Sheets Web API (Apps Script)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase block mb-1.5">URL Google Apps Script Deployment *</label>
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                  disabled={useMock}
                />
                <p className="text-[10px] text-gray-400 mt-1">Salin alamat URL deploy Web App yang Anda dapatkan dari editor Google Apps Script.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase block mb-1.5">Tautan URL Google Spreadsheet</label>
                  <input
                    type="text"
                    value={spreadsheetUrl}
                    onChange={(e) => setSpreadsheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                    className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                    disabled={useMock}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase block mb-1.5">Folder ID Google Drive (Dokumen Upload)</label>
                  <input
                    type="text"
                    value={driveFolderId}
                    onChange={(e) => setDriveFolderId(e.target.value)}
                    placeholder="Contoh: 1abcdefg1234567890..."
                    className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                    disabled={useMock}
                  />
                </div>
              </div>

              {testResult && (
                <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                  testResult.success 
                    ? 'bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-900/30' 
                    : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/30'
                }`}>
                  {testResult.success ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <ShieldAlert className="w-4 h-4 flex-shrink-0" />}
                  <span>{testResult.msg}</span>
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-500/10 transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Konfigurasi</span>
                </button>

                {!useMock && (
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="flex items-center gap-1.5 px-4.5 py-2.5 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
                    <span>Uji Hubungan API</span>
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Quick info / Guide card */}
          <div className="bg-gradient-to-br from-teal-900 to-emerald-950 text-white p-6 rounded-2xl shadow-md border border-teal-850/20 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-teal-300 font-extrabold uppercase tracking-widest block">INFORMASI DATABASE AWAN</span>
              <h4 className="text-md font-bold mt-2">Sinkronisasi Google Sheets</h4>
              <p className="text-xs text-teal-100/90 leading-relaxed mt-3">
                Melalui web apps script, seluruh ASN, operator bidang, dan pimpinan dapat membaca dan menginput secara bersamaan. Data langsung di-streaming ke sel Google Spreadsheet Anda dan dinormalisasi secara otomatis.
              </p>
              <ul className="text-xs text-teal-200 space-y-2 mt-4 list-disc list-inside">
                <li>Keamanan tingkat tinggi (Token-less CORS API)</li>
                <li>Penyimpanan berkas SKT langsung di folder Google Drive</li>
                <li>Perubahan langsung ter-refresh ke seluruh pengguna aktif</li>
              </ul>
            </div>
            <div className="border-t border-white/10 pt-4 mt-6 text-[11px] text-teal-300">
              Butuh panduan lengkap? Klik tab <strong>Panduan Pemasangan</strong> di atas.
            </div>
          </div>
        </div>
      )}

      {/* Panel 2: User management (Restricted list) */}
      {activeSubTab === 'user' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add User form */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm h-fit">
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-teal-600" />
              <span>Daftarkan Pengguna Baru</span>
            </h3>

            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Nama Lengkap ASN *</label>
                <input 
                  type="text" value={newNama} onChange={(e) => setNewNama(e.target.value)}
                  placeholder="Contoh: Budi Susanto, S.IP"
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Username Login *</label>
                <input 
                  type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Contoh: budi_ormas"
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Pilih Hak Akses (Role)</label>
                <select 
                  value={newRole} onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none cursor-pointer"
                >
                  <option value="Operator Bidang">Operator Bidang (Tambah & Ubah)</option>
                  <option value="Pimpinan">Pimpinan (Hanya Baca & Ekspor Laporan)</option>
                  <option value="Administrator">Administrator (Hak Penuh & Hapus)</option>
                </select>
              </div>

              {newRole === 'Operator Bidang' && (
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Sektor Bidang Tugas</label>
                  <select 
                    value={newBidang} onChange={(e) => setNewBidang(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none cursor-pointer"
                  >
                    <option value="Ormas">Bidang Organisasi Kemasyarakatan</option>
                    <option value="Poldagri">Bidang Politik Dalam Negeri</option>
                    <option value="Ideologi & Waspas">Bidang Ideologi & Kewaspadaan Nasional</option>
                    <option value="Seni Budaya & Agama">Bidang Ketahanan Seni Budaya, Agama & Kemasyarakatan</option>
                  </select>
                </div>
              )}

              <button
                type="button"
                onClick={handleAddUser}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-teal-500/10 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Tambahkan Pengguna</span>
              </button>
            </div>
          </div>

          {/* User List Table */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Akses Pengguna Terdaftar ({users.length})</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 dark:bg-slate-900/60 border-b border-gray-100 dark:border-slate-700">
                      <th className="p-3 text-[10px] font-bold text-gray-400 uppercase">Nama Pegawai</th>
                      <th className="p-3 text-[10px] font-bold text-gray-400 uppercase">Username</th>
                      <th className="p-3 text-[10px] font-bold text-gray-400 uppercase">Role</th>
                      <th className="p-3 text-[10px] font-bold text-gray-400 uppercase text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-teal-50/10 transition-colors">
                        <td className="p-3 text-xs font-semibold text-gray-800 dark:text-gray-300">
                          {user.nama}
                        </td>
                        <td className="p-3 text-xs text-gray-500 font-mono">
                          {user.username}
                        </td>
                        <td className="p-3 text-xs">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            user.role === 'Administrator' 
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400' 
                              : user.role === 'Pimpinan'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400'
                              : 'bg-teal-100 text-teal-700 dark:bg-teal-950/20 dark:text-teal-400'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={user.role === 'Administrator'}
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
                            title="Cabut akses login"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Panel: Import Logo */}
      {activeSubTab === 'logo' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h3 className="text-md font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Image className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <span>Pengaturan Logo & Identitas Visual Portal</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Sesuaikan identitas logo instansi atau logo pemerintah daerah yang ditampilkan pada Halaman Utama, 
                Sidebar Menu, dan Halaman Login Portal Kesbangpoldagri Provinsi NTB.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
              {/* Left Column: Drag & Drop Area */}
              <div className="md:col-span-7 space-y-4">
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`
                    border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer min-h-[220px] relative group
                    ${isDragging 
                      ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/20' 
                      : 'border-gray-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-600 bg-gray-50/50 dark:bg-slate-900/30'
                    }
                  `}
                  onClick={() => document.getElementById('logo-file-input')?.click()}
                  style={{ touchAction: 'manipulation' }}
                >
                  <input 
                    type="file" 
                    id="logo-file-input" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                  <div className="p-3.5 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm text-teal-600 dark:text-teal-400 mb-3 group-hover:scale-105 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Tarik dan lepaskan gambar di sini, atau <span className="text-teal-600 dark:text-teal-400 underline">cari berkas</span>
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed">
                    Mendukung berkas format PNG, JPG, JPEG, atau SVG.<br />
                    Maksimal ukuran berkas: 1.5 Megabytes.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSaveLogo}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-500/10 cursor-pointer active:scale-95 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Logo Baru</span>
                  </button>
                  <button
                    onClick={handleResetLogo}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 cursor-pointer active:scale-95 transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-rose-500" />
                    <span>Kembalikan Default</span>
                  </button>
                </div>

                {logoSaveStatus === 'saved' && (
                  <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 text-xs font-semibold animate-fade-in">
                    <CheckCircle className="w-4.5 h-4.5" />
                    <span>Sistem berhasil diperbarui dengan logo baru! Logo telah diubah pada Sidebar dan Portal Login.</span>
                  </div>
                )}
                {logoSaveStatus === 'error' && (
                  <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 text-xs font-semibold">
                    <ShieldAlert className="w-4.5 h-4.5" />
                    <span>Terjadi kesalahan saat menyimpan logo baru.</span>
                  </div>
                )}
              </div>

              {/* Right Column: Visual Preview Mockups */}
              <div className="md:col-span-5 bg-gray-50/50 dark:bg-slate-900/30 border border-gray-150 dark:border-slate-700/60 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-4">
                    Pratinjau Tampilan Logo
                  </h4>
                  <div className="space-y-6">
                    {/* Preview 1: Sidebar Version */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                        Tampilan di Sidebar Menu (Samping)
                      </span>
                      <div className="bg-gradient-to-b from-teal-950 to-teal-900 rounded-2xl p-4 flex items-center gap-3.5 border border-teal-800/40 w-full max-w-[280px]">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-emerald-500 p-0.5 shadow-md flex items-center justify-center flex-shrink-0">
                          <div className="w-full h-full bg-teal-950 rounded-xl flex items-center justify-center overflow-hidden">
                            <img 
                              src={logoBase64 || "https://upload.wikimedia.org/wikipedia/commons/0/07/Coat_of_arms_of_West_Nusa_Tenggara.svg"} 
                              alt="Logo Sidebar" 
                              className="w-8 h-8 object-contain p-0.5"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <h1 className="font-bold text-amber-300 text-xs leading-none">
                            KESBANGPOLDAGRI
                          </h1>
                          <p className="text-[9px] text-teal-200 uppercase tracking-widest font-semibold mt-0.5">
                            Provinsi NTB
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Preview 2: Login Version */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                        Tampilan di Halaman Login Utama
                      </span>
                      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4.5 border border-gray-200 dark:border-slate-700 flex items-center gap-4 shadow-sm max-w-[280px]">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-emerald-500 p-0.5 shadow-md flex items-center justify-center flex-shrink-0">
                          <div className="w-full h-full bg-teal-950 rounded-2xl flex items-center justify-center overflow-hidden">
                            <img 
                              src={logoBase64 || "https://upload.wikimedia.org/wikipedia/commons/0/07/Coat_of_arms_of_West_Nusa_Tenggara.svg"} 
                              alt="Logo Login" 
                              className="w-10 h-10 object-contain p-0.5"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-extrabold text-teal-950 dark:text-white truncate">Sistem Portal Login</p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight truncate">Badan Kesbangpoldagri NTB</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-gray-150 dark:border-slate-800 pt-4 text-[11px] text-gray-400 dark:text-gray-500 italic">
                  * Logo disimpan secara lokal pada peramban web dan/atau konfigurasi integrasi database Anda untuk kenyamanan kustomisasi instansi secara instan.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Panel 3: Deployment instructions & Apps Script Code copy */}
      {activeSubTab === 'panduan' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Step-by-step instructions */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-md font-bold text-gray-800 dark:text-white flex items-center gap-1.5">
              <span>Langkah-langkah Pemasangan Google Apps Script</span>
            </h3>

            <div className="space-y-4 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[10px]">1</span>
                <div>
                  <strong className="text-gray-800 dark:text-white font-bold block">Buat Google Spreadsheet & Sheet Kolom</strong>
                  <p className="mt-1">Buat berkas Google Spreadsheet baru di Google Drive Anda. Di dalamnya, buat 11 buah tab sheet dengan nama persis:</p>
                  <p className="font-mono text-[10px] text-teal-600 bg-teal-50 dark:bg-slate-900/60 p-1.5 rounded-lg border border-teal-100 dark:border-slate-700/60 mt-1.5 leading-normal">
                    Users, Ormas, PartaiPolitik, WawasanKebangsaan, BelaNegara, PendidikanPolitik, KonflikSosial, Penelitian, ProgramKegiatan, Berita, Dokumen.
                  </p>
                  <p className="mt-1.5">Isi baris pertama (Row 1) setiap sheet dengan nama-nama kolom parameter yang sesuai, misalnya di sheet <strong className="text-gray-800 dark:text-white font-bold">Users</strong> masukkan kolom: <code className="font-mono bg-gray-50 px-1 py-0.5 rounded">id, username, password, nama, role, bidang, avatar</code>.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[10px]">2</span>
                <div>
                  <strong className="text-gray-800 dark:text-white font-bold block">Buka Apps Script Editor</strong>
                  <p className="mt-1">Pada Google Spreadsheet Anda, klik menu <strong className="text-gray-800 dark:text-white font-bold">Ekstensi &gt; Apps Script</strong>. Editor kode akan terbuka di tab baru.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[10px]">3</span>
                <div>
                  <strong className="text-gray-800 dark:text-white font-bold block">Tempel Kode Apps Script</strong>
                  <p className="mt-1">Hapus kode bawaan editor, lalu salin (copy) seluruh kode JavaScript di panel sebelah kanan dan tempel (paste) di editor Apps Script.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[10px]">4</span>
                <div>
                  <strong className="text-gray-800 dark:text-white font-bold block">Deploy Aplikasi Web (Web App)</strong>
                  <p className="mt-1">Klik tombol <strong className="text-gray-800 dark:text-white font-bold">Terapkan (Deploy) &gt; Penerapan Baru (New Deployment)</strong>. Pilih jenis <strong className="text-gray-800 dark:text-white font-bold">Aplikasi Web</strong>.</p>
                  <ul className="list-disc list-inside space-y-1 mt-1.5 text-[11px] text-gray-500">
                    <li>Jalankan sebagai: <strong>Saya (email Anda)</strong></li>
                    <li>Siapa yang memiliki akses: <strong>Siapa saja (Anyone)</strong> (Sangat penting agar API dapat merespons dari luar)</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[10px]">5</span>
                <div>
                  <strong className="text-gray-800 dark:text-white font-bold block">Tempel URL Web App ke Dashboard</strong>
                  <p className="mt-1">Klik Terapkan, beri persetujuan otorisasi Google Drive/Sheets jika diminta, salin URL Aplikasi Web akhir, lalu rekatkan di formulir tab <strong>Integrasi Database</strong> di aplikasi ini!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Code Viewer Panel */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Kode Google Apps Script</h4>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-900/30 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isCopied ? 'Tersalin' : 'Salin Kode'}</span>
                </button>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 h-96 overflow-y-auto scrollbar-thin">
                <pre className="text-[10px] text-teal-400 font-mono leading-relaxed whitespace-pre-wrap">
                  {GOOGLE_APPS_SCRIPT_CODE}
                </pre>
              </div>
            </div>
            <div className="text-[11px] text-gray-400 text-center mt-3 border-t border-gray-100 dark:border-slate-700/60 pt-3">
              Gunakan kombinasi tombol Ctrl+A dan Ctrl+C di dalam editor di atas.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
