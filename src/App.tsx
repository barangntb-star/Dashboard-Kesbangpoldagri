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
        if (!res.success) alert(res.error || 'Gagal mengubah data.');
      } else {
        // Create Action
        const res = await apiService.create(sheetName, data, fileObj);
        if (!res.success) alert(res.error || 'Gagal menambahkan data.');
      }
      // Reactive state updating without page reload
      await syncAllData();
    } catch (err: any) {
      alert('Terjadi kesalahan penyimpanan: ' + err.message);
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
        alert(res.error || 'Gagal menghapus data.');
      }
    } catch (err: any) {
      alert('Terjadi kesalahan penghapusan: ' + err.message);
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

    </div>
  );
}
