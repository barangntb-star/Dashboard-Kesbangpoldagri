import React from 'react';
import { apiService } from './utils/apiService';
import { 
  User, Ormas, PartaiPolitik, WawasanKebangsaan, BelaNegara, 
  PendidikanPolitik, KonflikSosial, Penelitian, ProgramKegiatan, 
  Berita, Dokumen, SystemConfig, UserRole 
} from './types';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DashboardOverview from './components/DashboardOverview';
import ModuleTable from './components/ModuleTable';
import ModuleForm from './components/ModuleForm';
import ReportModule from './components/ReportModule';
import SystemSettings from './components/SystemSettings';
import LoginScreen from './components/LoginScreen';

export default function App() {
  // Session / Authentication state
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);

  // Tab Navigation state
  const [currentTab, setCurrentTab] = React.useState<string>('dashboard');

  // Unified global data state retrieved from the datastore
  const [ormas, setOrmas] = React.useState<Ormas[]>([]);
  const [partai, setPartai] = React.useState<PartaiPolitik[]>([]);
  const [wasbang, setWasbang] = React.useState<WawasanKebangsaan[]>([]);
  const [belaNegara, setBelaNegara] = React.useState<BelaNegara[]>([]);
  const [pentik, setPentik] = React.useState<PendidikanPolitik[]>([]);
  const [konflik, setKonflik] = React.useState<KonflikSosial[]>([]);
  const [penelitian, setPenelitian] = React.useState<Penelitian[]>([]);
  const [programKegiatan, setProgramKegiatan] = React.useState<ProgramKegiatan[]>([]);
  const [berita, setBerita] = React.useState<Berita[]>([]);
  const [dokumen, setDokumen] = React.useState<Dokumen[]>([]);

  // Config states
  const [systemConfig, setSystemConfig] = React.useState<SystemConfig>(apiService.getConfig());
  const [isSyncing, setIsSyncing] = React.useState(false);

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<any | null>(null);

  // Connection Error fallback state
  const [connectionError, setConnectionError] = React.useState<{
    sheetName: string;
    action: 'create' | 'update' | 'delete';
    data?: any;
    id?: string;
    fileObj?: { base64: string; name: string; type: string };
    errorMessage: string;
  } | null>(null);

  // Load active session and fetch seed database on load
  React.useEffect(() => {
    const activeUser = apiService.getCurrentUser();
    if (activeUser) {
      setCurrentUser(activeUser);
    }
    // Fetch initial datasets
    syncAllData();
  }, []);

  const syncAllData = async () => {
    setIsSyncing(true);
    try {
      const result = await apiService.fetchDashboardData();
      setOrmas(result.ormas);
      setPartai(result.partai);
      setWasbang(result.wasbang);
      setBelaNegara(result.belaNegara);
      setPentik(result.pentik);
      setKonflik(result.konflik);
      setPenelitian(result.penelitian);
      setProgramKegiatan(result.programKegiatan);
      setBerita(result.berita);
      setDokumen(result.dokumen);
    } catch (err) {
      console.error("Gagal melakukan sinkronisasi data:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Login handler
  const handleLoginAttempt = async (u: string, p: string) => {
    const result = await apiService.login(u, p);
    if (result.success && result.user) {
      setCurrentUser(result.user);
      // Re-fetch database specific to the logged-in user credentials
      syncAllData();
    }
    return result;
  };

  const handleLogout = () => {
    apiService.setCurrentUser(null);
    setCurrentUser(null);
    setCurrentTab('dashboard');
  };

  // Config modifier
  const handleConfigSave = (newConfig: SystemConfig) => {
    apiService.saveConfig(newConfig);
    setSystemConfig(newConfig);
    // Trigger database re-sync with new API url or Radios toggled
    syncAllData();
  };

  // Unified CRUD save router
  const handleSaveItem = async (data: any, fileObj?: { base64: string; name: string; type: string }) => {
    let sheetName = '';
    if (currentTab === 'ormas') sheetName = 'Ormas';
    if (currentTab === 'partai') sheetName = 'PartaiPolitik';
    if (currentTab === 'wasbang') sheetName = 'WawasanKebangsaan';
    if (currentTab === 'belanegara') sheetName = 'BelaNegara';
    if (currentTab === 'pentik') sheetName = 'PendidikanPolitik';
    if (currentTab === 'konflik') sheetName = 'KonflikSosial';
    if (currentTab === 'penelitian') sheetName = 'Penelitian';
    if (currentTab === 'program') sheetName = 'ProgramKegiatan';
    if (currentTab === 'berita') sheetName = 'Berita';
    if (currentTab === 'dokumen') sheetName = 'Dokumen';

    setIsFormOpen(false);
    setIsSyncing(true);

    try {
      if (editingItem) {
        // Edit Action
        const res = await apiService.update(sheetName, data, fileObj);
        if (!res.success) {
          if (res.error?.includes('Failed to fetch') || res.error?.includes('Koneksi API') || res.error?.includes('failed to fetch')) {
            setConnectionError({
              sheetName,
              action: 'update',
              data,
              fileObj,
              errorMessage: res.error
            });
          } else {
            alert(res.error || 'Gagal mengubah data.');
          }
        }
      } else {
        // Create Action
        const res = await apiService.create(sheetName, data, fileObj);
        if (!res.success) {
          if (res.error?.includes('Failed to fetch') || res.error?.includes('Koneksi API') || res.error?.includes('failed to fetch')) {
            setConnectionError({
              sheetName,
              action: 'create',
              data,
              fileObj,
              errorMessage: res.error
            });
          } else {
            alert(res.error || 'Gagal menambahkan data.');
          }
        }
      }
      // Reactive state updating without page reload
      await syncAllData();
    } catch (err: any) {
      const errMsg = err.message || '';
      if (errMsg.includes('Failed to fetch') || errMsg.includes('Koneksi') || errMsg.includes('failed to fetch')) {
        setConnectionError({
          sheetName,
          action: editingItem ? 'update' : 'create',
          data,
          fileObj,
          errorMessage: 'Terjadi kesalahan jaringan: ' + errMsg
        });
      } else {
        alert('Terjadi kesalahan penyimpanan: ' + errMsg);
      }
    } finally {
      setIsSyncing(false);
      setEditingItem(null);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini secara permanen dari sistem?')) {
      return;
    }

    let sheetName = '';
    if (currentTab === 'ormas') sheetName = 'Ormas';
    if (currentTab === 'partai') sheetName = 'PartaiPolitik';
    if (currentTab === 'wasbang') sheetName = 'WawasanKebangsaan';
    if (currentTab === 'belanegara') sheetName = 'BelaNegara';
    if (currentTab === 'pentik') sheetName = 'PendidikanPolitik';
    if (currentTab === 'konflik') sheetName = 'KonflikSosial';
    if (currentTab === 'penelitian') sheetName = 'Penelitian';
    if (currentTab === 'program') sheetName = 'ProgramKegiatan';
    if (currentTab === 'berita') sheetName = 'Berita';
    if (currentTab === 'dokumen') sheetName = 'Dokumen';

    setIsSyncing(true);
    try {
      const res = await apiService.delete(sheetName, id);
      if (res.success) {
        await syncAllData();
      } else {
        if (res.error?.includes('Failed to fetch') || res.error?.includes('Koneksi API') || res.error?.includes('failed to fetch')) {
          setConnectionError({
            sheetName,
            action: 'delete',
            id,
            errorMessage: res.error
          });
        } else {
          alert(res.error || 'Gagal menghapus data.');
        }
      }
    } catch (err: any) {
      const errMsg = err.message || '';
      if (errMsg.includes('Failed to fetch') || errMsg.includes('Koneksi') || errMsg.includes('failed to fetch')) {
        setConnectionError({
          sheetName,
          action: 'delete',
          id,
          errorMessage: 'Terjadi kesalahan jaringan: ' + errMsg
        });
      } else {
        alert('Terjadi kesalahan penghapusan: ' + errMsg);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFallbackToOffline = async () => {
    if (!connectionError) return;

    // 1. Switch config to Mock / Offline mode
    const currentConfig = apiService.getConfig();
    const newConfig = { ...currentConfig, useMock: true };
    apiService.saveConfig(newConfig);
    setSystemConfig(newConfig);

    // 2. Perform the action locally
    const { sheetName, action, data, id, fileObj } = connectionError;
    setIsSyncing(true);

    try {
      if (action === 'create') {
        const res = await apiService.create(sheetName, data, fileObj);
        if (res.success) {
          alert('Sistem berhasil dialihkan ke Mode Luring (Lokal) dan data berhasil disimpan!');
        } else {
          alert('Gagal menyimpan data secara lokal: ' + res.error);
        }
      } else if (action === 'update') {
        const res = await apiService.update(sheetName, data, fileObj);
        if (res.success) {
          alert('Sistem berhasil dialihkan ke Mode Luring (Lokal) dan data berhasil diubah!');
        } else {
          alert('Gagal mengubah data secara lokal: ' + res.error);
        }
      } else if (action === 'delete' && id) {
        const res = await apiService.delete(sheetName, id);
        if (res.success) {
          alert('Sistem berhasil dialihkan ke Mode Luring (Lokal) dan data berhasil dihapus!');
        } else {
          alert('Gagal menghapus data secara lokal: ' + res.error);
        }
      }
      
      // Clear connection error state
      setConnectionError(null);
      // Re-fetch all cached data (which will now correctly load the local localStorage)
      await syncAllData();
    } catch (err: any) {
      alert('Terjadi kesalahan saat menyimpan lokal: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddClick = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (item: any) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  // Handle route shield checks
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={(u, r, n) => {}} onLoginAttempt={handleLoginAttempt} />;
  }

  // Get current list of users for Settings Panel
  const allSystemUsers: User[] = JSON.parse(localStorage.getItem('Users') || '[]');

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950 flex transition-colors duration-200">
      
      {/* 1. Collapsible Sidebar Drawer */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        userRole={currentUser.role} 
        userName={currentUser.nama}
        onLogout={handleLogout}
        customLogo={systemConfig.customLogo}
      />

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        
        {/* Navbar */}
        <Navbar 
          userRole={currentUser.role}
          userName={currentUser.nama}
          useMock={systemConfig.useMock}
          onSync={syncAllData}
          isSyncing={isSyncing}
        />

        {/* Inner Content Area */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          {isSyncing && (
            <div className="fixed bottom-4 right-4 z-40 bg-teal-800 text-white px-4 py-2.5 rounded-full shadow-lg text-xs font-bold flex items-center gap-2 animate-bounce">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <span>Menyinkronkan Database...</span>
            </div>
          )}

          {/* DYNAMIC RENDERS FOR ALL CHANNELS */}
          {currentTab === 'dashboard' && (
            <DashboardOverview 
              ormas={ormas} 
              partai={partai}
              wasbang={wasbang}
              belaNegara={belaNegara}
              pentik={pentik}
              konflik={konflik}
              penelitian={penelitian}
              programKegiatan={programKegiatan}
              customMap={systemConfig.customMap}
            />
          )}

          {currentTab === 'ormas' && (
            <ModuleTable 
              moduleName="Organisasi Kemasyarakatan"
              data={ormas}
              columns={[
                { key: 'nama', label: 'Nama Ormas' },
                { key: 'noSkt', label: 'Nomor SKT' },
                { key: 'ketua', label: 'Ketua Pengurus' },
                { key: 'kabupaten', label: 'Kabupaten/Kota' },
                { 
                  key: 'status', 
                  label: 'Status',
                  format: (val) => (
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      val === 'Aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>{val}</span>
                  )
                }
              ]}
              userRole={currentUser.role}
              onAddClick={handleAddClick}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteItem}
            />
          )}

          {currentTab === 'partai' && (
            <ModuleTable 
              moduleName="Partai Politik (Parpol)"
              data={partai}
              columns={[
                { key: 'nama', label: 'Nama Partai' },
                { key: 'ketua', label: 'Ketua Wilayah' },
                { key: 'kabupaten', label: 'Kabupaten' },
                { key: 'jumlahKursi', label: 'Kursi DPRD' },
                { 
                  key: 'jumlahSuara', 
                  label: 'Perolehan Suara',
                  format: (val) => new Intl.NumberFormat('id-ID').format(val)
                }
              ]}
              userRole={currentUser.role}
              onAddClick={handleAddClick}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteItem}
            />
          )}

          {currentTab === 'wasbang' && (
            <ModuleTable 
              moduleName="Wawasan Kebangsaan"
              data={wasbang}
              columns={[
                { key: 'namaKegiatan', label: 'Nama Sosialisasi' },
                { key: 'tanggal', label: 'Tanggal' },
                { key: 'kabupaten', label: 'Lokasi Kabupaten' },
                { key: 'peserta', label: 'Peserta (Orang)' },
                { 
                  key: 'anggaran', 
                  label: 'Anggaran Pagu',
                  format: (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
                }
              ]}
              userRole={currentUser.role}
              onAddClick={handleAddClick}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteItem}
            />
          )}

          {currentTab === 'belanegara' && (
            <ModuleTable 
              moduleName="Kader Bela Negara"
              data={belaNegara}
              columns={[
                { key: 'namaKegiatan', label: 'Nama Pelatihan' },
                { key: 'kabupaten', label: 'Lokasi Kabupaten' },
                { key: 'peserta', label: 'Peserta' },
                { key: 'instansi', label: 'Instansi Penggerak' },
                { 
                  key: 'anggaran', 
                  label: 'Pagu Anggaran',
                  format: (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
                }
              ]}
              userRole={currentUser.role}
              onAddClick={handleAddClick}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteItem}
            />
          )}

          {currentTab === 'pentik' && (
            <ModuleTable 
              moduleName="Pendidikan Politik (Pentik)"
              data={pentik}
              columns={[
                { key: 'tema', label: 'Tema Workshop' },
                { key: 'tanggal', label: 'Tanggal' },
                { key: 'kabupaten', label: 'Kabupaten' },
                { key: 'narasumber', label: 'Narasumber' },
                { 
                  key: 'anggaran', 
                  label: 'Alokasi Pagu',
                  format: (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
                }
              ]}
              userRole={currentUser.role}
              onAddClick={handleAddClick}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteItem}
            />
          )}

          {currentTab === 'konflik' && (
            <ModuleTable 
              moduleName="Konflik Sosial"
              data={konflik}
              columns={[
                { key: 'jenisKonflik', label: 'Deskripsi Konflik' },
                { key: 'lokasi', label: 'Lokasi' },
                { key: 'kabupaten', label: 'Kabupaten/Kota' },
                { 
                  key: 'status', 
                  label: 'Status Penanganan',
                  format: (val) => (
                    <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                      val === 'Selesai' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : val === 'Proses' 
                        ? 'bg-amber-100 text-amber-850' 
                        : 'bg-rose-100 text-rose-800'
                    }`}>{val}</span>
                  )
                }
              ]}
              userRole={currentUser.role}
              onAddClick={handleAddClick}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteItem}
            />
          )}

          {currentTab === 'penelitian' && (
            <ModuleTable 
              moduleName="Rekomendasi Penelitian"
              data={penelitian}
              columns={[
                { key: 'namaPeneliti', label: 'Nama Peneliti' },
                { key: 'instansi', label: 'Instansi Asal' },
                { key: 'judulPenelitian', label: 'Judul Penelitian' },
                { key: 'nomorSurat', label: 'Nomor Surat' },
                { 
                  key: 'status', 
                  label: 'Persetujuan',
                  format: (val) => (
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      val === 'Disetujui' ? 'bg-emerald-100 text-emerald-800' : val === 'Ditolak' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                    }`}>{val}</span>
                  )
                }
              ]}
              userRole={currentUser.role}
              onAddClick={handleAddClick}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteItem}
            />
          )}

          {currentTab === 'program' && (
            <ModuleTable 
              moduleName="Program & Kegiatan APBD"
              data={programKegiatan}
              columns={[
                { key: 'program', label: 'Nama Program' },
                { key: 'kegiatan', label: 'Kegiatan Sektoral' },
                { key: 'bidang', label: 'Bidang Pengelola' },
                { 
                  key: 'anggaran', 
                  label: 'Pagu Anggaran',
                  format: (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
                },
                { 
                  key: 'realisasi', 
                  label: 'Realisasi Serapan',
                  format: (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
                },
                { 
                  key: 'persentase', 
                  label: 'Serapan %',
                  format: (val) => <strong className="text-teal-600 font-bold">{val}%</strong>
                }
              ]}
              userRole={currentUser.role}
              onAddClick={handleAddClick}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteItem}
            />
          )}

          {currentTab === 'berita' && (
            <ModuleTable 
              moduleName="Kliping Berita Daerah"
              data={berita}
              columns={[
                { key: 'judul', label: 'Judul Artikel Berita' },
                { key: 'penulis', label: 'Penulis / Sumber' },
                { key: 'tanggal', label: 'Tanggal Terbit' }
              ]}
              userRole={currentUser.role}
              onAddClick={handleAddClick}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteItem}
              kabupatenFilterEnabled={false}
            />
          )}

          {currentTab === 'dokumen' && (
            <ModuleTable 
              moduleName="Dokumen Regulasi & Laporan"
              data={dokumen}
              columns={[
                { key: 'namaDokumen', label: 'Nama File Dokumen' },
                { key: 'kategori', label: 'Kategori' },
                { key: 'nomorDokumen', label: 'Nomor Surat' },
                { key: 'ukuran', label: 'Ukuran File' }
              ]}
              userRole={currentUser.role}
              onAddClick={handleAddClick}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteItem}
              kabupatenFilterEnabled={false}
            />
          )}

          {currentTab === 'laporan' && (
            <ReportModule 
              ormas={ormas}
              wasbang={wasbang}
              konflik={konflik}
              programKegiatan={programKegiatan}
            />
          )}

          {currentTab === 'pengaturan' && (
            <SystemSettings 
              config={systemConfig}
              onConfigSave={handleConfigSave}
              users={allSystemUsers}
              onUsersUpdate={syncAllData}
            />
          )}
        </main>
      </div>

      {/* 3. Global Form Dialogue Sheet Overlay */}
      {isFormOpen && (
        <ModuleForm 
          tabId={currentTab}
          moduleName={
            currentTab === 'ormas' ? 'Organisasi Kemasyarakatan' :
            currentTab === 'partai' ? 'Partai Politik' :
            currentTab === 'wasbang' ? 'Wawasan Kebangsaan' :
            currentTab === 'belanegara' ? 'Bela Negara' :
            currentTab === 'pentik' ? 'Pendidikan Politik' :
            currentTab === 'konflik' ? 'Konflik Sosial' :
            currentTab === 'penelitian' ? 'Penelitian' :
            currentTab === 'program' ? 'Program & Kegiatan' :
            currentTab === 'berita' ? 'Berita Daerah' : 'Dokumen Regulasi'
          }
          editingItem={editingItem}
          onClose={() => {
            setIsFormOpen(false);
            setEditingItem(null);
          }}
          onSave={handleSaveItem}
        />
      )}

      {/* 4. Connection Error Fallback Modal */}
      {connectionError && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-rose-100 dark:border-rose-950/40 text-left space-y-5">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-2xl">
                {/* Visual warning icon */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white leading-tight">
                  Koneksi API Google Sheets Gagal
                </h3>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-mono mt-0.5 break-all">
                  Detail: {connectionError.errorMessage || 'Failed to fetch'}
                </p>
              </div>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl text-xs space-y-2.5 text-gray-700 dark:text-gray-300">
              <p className="font-bold text-amber-800 dark:text-amber-400">
                💡 Mengapa ini terjadi?
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400 leading-relaxed text-[11px]">
                <li>URL Web App di pengaturan sistem tidak valid atau tidak aktif.</li>
                <li>Pengaturan hak akses Google Web App belum diatur ke <strong>"Anyone" (Siapa saja)</strong>.</li>
                <li>CORS memblokir permintaan dari domain preview ini di peramban Anda.</li>
              </ul>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 italic">
                Anda tidak perlu khawatir kehilangan data. Anda bisa mengalihkan sistem ke <strong>Mode Luring (Database Lokal)</strong> sekarang untuk menyimpan data ini secara lokal terlebih dahulu.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleFallbackToOffline}
                className="flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white rounded-xl text-xs font-bold transition-all text-center cursor-pointer shadow-md shadow-amber-600/10"
              >
                Simpan Secara Lokal & Aktifkan Luring
              </button>
              <button
                type="button"
                onClick={() => setConnectionError(null)}
                className="py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-98 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border border-gray-200 dark:border-slate-700"
              >
                Batal (Periksa Pengaturan)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
