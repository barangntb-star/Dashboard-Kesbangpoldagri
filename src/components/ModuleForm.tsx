import React from 'react';
import { X, Upload, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { KABUPATEN_LIST } from '../utils/mockData';

interface ModuleFormProps {
  tabId: string;
  moduleName: string;
  editingItem: any;
  onClose: () => void;
  onSave: (data: any, fileObj?: { base64: string; name: string; type: string }) => void;
}

export default function ModuleForm({ tabId, moduleName, editingItem, onClose, onSave }: ModuleFormProps) {
  const [formData, setFormData] = React.useState<any>({});
  const [fileObject, setFileObject] = React.useState<{ base64: string; name: string; type: string } | null>(null);
  const [filePreviewName, setFilePreviewName] = React.useState('');
  const [dragActive, setDragActive] = React.useState(false);
  const [validationErrors, setValidationErrors] = React.useState<{ [key: string]: string }>({});

  // Initialize form values from editing item or defaults
  React.useEffect(() => {
    if (editingItem) {
      setFormData({ ...editingItem });
    } else {
      // Default initial states based on tabId
      const defaults: any = { status: 'Aktif', kabupaten: KABUPATEN_LIST[0] };
      if (tabId === 'konflik') defaults.status = 'Belum Ditangani';
      if (tabId === 'penelitian') defaults.status = 'Diproses';
      if (tabId === 'program') {
        defaults.status = 'Belum Mulai';
        defaults.bidang = 'Sekretariat';
        defaults.tahun = '2026';
        defaults.anggaran = 0;
        defaults.realisasi = 0;
      }
      if (tabId === 'partai') {
        defaults.jumlahKursi = 0;
        defaults.jumlahSuara = 0;
      }
      if (['wasbang', 'belanegara', 'pentik'].includes(tabId)) {
        defaults.peserta = 0;
        defaults.anggaran = 0;
        defaults.realisasi = 0;
        defaults.tanggal = new Date().toISOString().split('T')[0];
      }
      if (tabId === 'berita' || tabId === 'dokumen') {
        defaults.tanggal = new Date().toISOString().split('T')[0];
        defaults.tanggalUpload = new Date().toISOString().split('T')[0];
      }
      setFormData(defaults);
    }
  }, [editingItem, tabId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;
    if (type === 'number') {
      finalValue = Number(value);
    }
    setFormData((prev: any) => ({ ...prev, [name]: finalValue }));
    // Clear validation error when typing
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  // Convert uploaded file to base64 so it can be routed securely
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setFileObject({
        base64: reader.result as string,
        name: file.name,
        type: file.type
      });
      setFilePreviewName(file.name);
      // Automatically record file size if dealing with Dokumen tab
      if (tabId === 'dokumen') {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        setFormData((prev: any) => ({ ...prev, ukuran: `${sizeMB} MB` }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop uploader handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Validations before saving
  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (tabId === 'ormas') {
      if (!formData.nama) errors.nama = 'Nama Ormas wajib diisi';
      if (!formData.noSkt) errors.noSkt = 'Nomor SKT wajib diisi';
      if (!formData.ketua) errors.ketua = 'Nama Ketua wajib diisi';
    }
    if (tabId === 'partai') {
      if (!formData.nama) errors.nama = 'Nama Partai wajib diisi';
      if (!formData.ketua) errors.ketua = 'Nama Ketua wajib diisi';
    }
    if (tabId === 'wasbang' || tabId === 'belanegara') {
      if (!formData.namaKegiatan) errors.namaKegiatan = 'Nama Kegiatan wajib diisi';
      if (!formData.lokasi) errors.lokasi = 'Lokasi wajib diisi';
    }
    if (tabId === 'pentik') {
      if (!formData.tema) errors.tema = 'Tema wajib diisi';
      if (!formData.lokasi) errors.lokasi = 'Lokasi wajib diisi';
    }
    if (tabId === 'konflik') {
      if (!formData.jenisKonflik) errors.jenisKonflik = 'Jenis Konflik wajib diisi';
      if (!formData.lokasi) errors.lokasi = 'Lokasi sengketa wajib diisi';
    }
    if (tabId === 'penelitian') {
      if (!formData.namaPeneliti) errors.namaPeneliti = 'Nama Peneliti wajib diisi';
      if (!formData.judulPenelitian) errors.judulPenelitian = 'Judul Penelitian wajib diisi';
    }
    if (tabId === 'program') {
      if (!formData.program) errors.program = 'Nama Program wajib diisi';
      if (!formData.kegiatan) errors.kegiatan = 'Nama Kegiatan wajib diisi';
    }
    if (tabId === 'berita') {
      if (!formData.judul) errors.judul = 'Judul berita wajib diisi';
      if (!formData.isi) errors.isi = 'Isi berita wajib diisi';
    }
    if (tabId === 'dokumen') {
      if (!formData.namaDokumen) errors.namaDokumen = 'Nama Dokumen wajib diisi';
      if (!formData.nomorDokumen) errors.nomorDokumen = 'Nomor Dokumen wajib diisi';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData, fileObject || undefined);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700/60 flex flex-col max-h-[90vh]">
        
        {/* Header Title bar */}
        <div className="p-5 border-b border-gray-150 dark:border-slate-700 flex justify-between items-center bg-teal-50/10 dark:bg-slate-900/30">
          <div>
            <h3 className="text-md font-bold text-gray-900 dark:text-white">
              {editingItem ? 'Edit Data' : 'Tambah Data'} - {moduleName}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Lengkapi formulir di bawah ini dengan valid.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white bg-gray-50 dark:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {Object.keys(validationErrors).length > 0 && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>Harap perbaiki beberapa isian formulir yang belum valid.</span>
            </div>
          )}

          {/* DYNAMIC FORM RENDER BASED ON TABID */}
          
          {/* 1. Ormas Form */}
          {tabId === 'ormas' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Nama Ormas *</label>
                <input 
                  type="text" name="nama" value={formData.nama || ''} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none focus:border-teal-500"
                />
                {validationErrors.nama && <span className="text-[10px] text-rose-500 font-semibold mt-1 block">{validationErrors.nama}</span>}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Nomor SKT *</label>
                <input 
                  type="text" name="noSkt" value={formData.noSkt || ''} onChange={handleChange}
                  placeholder="Contoh: 04/SKT/POL/2026"
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
                {validationErrors.noSkt && <span className="text-[10px] text-rose-500 font-semibold mt-1 block">{validationErrors.noSkt}</span>}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Tanggal SKT</label>
                <input 
                  type="date" name="tanggalSkt" value={formData.tanggalSkt || ''} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Nama Ketua *</label>
                <input 
                  type="text" name="ketua" value={formData.ketua || ''} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
                {validationErrors.ketua && <span className="text-[10px] text-rose-500 font-semibold mt-1 block">{validationErrors.ketua}</span>}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Nomor Telepon</label>
                <input 
                  type="text" name="noTelp" value={formData.noTelp || ''} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Email Ormas</label>
                <input 
                  type="email" name="email" value={formData.email || ''} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Kabupaten NTB</label>
                <select 
                  name="kabupaten" value={formData.kabupaten || ''} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none cursor-pointer"
                >
                  {KABUPATEN_LIST.map(kab => (
                    <option key={kab} value={kab}>{kab}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Status Ormas</label>
                <select 
                  name="status" value={formData.status || 'Aktif'} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none cursor-pointer"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Tidak Aktif">Tidak Aktif</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Kecamatan</label>
                <input 
                  type="text" name="kecamatan" value={formData.kecamatan || ''} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Kelurahan</label>
                <input 
                  type="text" name="kelurahan" value={formData.kelurahan || ''} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Alamat Lengkap</label>
                <textarea 
                  name="alamat" value={formData.alamat || ''} onChange={handleChange} rows={2}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
              </div>
            </div>
          )}

          {/* 2. Partai Politik Form */}
          {tabId === 'partai' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Nama Partai Politik *</label>
                <input 
                  type="text" name="nama" value={formData.nama || ''} onChange={handleChange}
                  placeholder="Contoh: Partai Golkar"
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
                {validationErrors.nama && <span className="text-[10px] text-rose-500 font-semibold mt-1 block">{validationErrors.nama}</span>}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Nama Ketua DPD/PW *</label>
                <input 
                  type="text" name="ketua" value={formData.ketua || ''} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
                {validationErrors.ketua && <span className="text-[10px] text-rose-500 font-semibold mt-1 block">{validationErrors.ketua}</span>}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Kabupaten Sekretariat</label>
                <select 
                  name="kabupaten" value={formData.kabupaten || ''} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                >
                  {KABUPATEN_LIST.map(kab => (
                    <option key={kab} value={kab}>{kab}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Jumlah Kursi DPRD NTB</label>
                <input 
                  type="number" name="jumlahKursi" value={formData.jumlahKursi !== undefined ? formData.jumlahKursi : 0} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Jumlah Suara Sah (Pilu)</label>
                <input 
                  type="number" name="jumlahSuara" value={formData.jumlahSuara !== undefined ? formData.jumlahSuara : 0} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Alamat Kantor DPD</label>
                <textarea 
                  name="alamat" value={formData.alamat || ''} onChange={handleChange} rows={2}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
              </div>
            </div>
          )}

          {/* 3. Wawasan Kebangsaan & Bela Negara Form */}
          {(tabId === 'wasbang' || tabId === 'belanegara') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Nama Kegiatan Kelompok *</label>
                <input 
                  type="text" name="namaKegiatan" value={formData.namaKegiatan || ''} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
                {validationErrors.namaKegiatan && <span className="text-[10px] text-rose-500 font-semibold mt-1 block">{validationErrors.namaKegiatan}</span>}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Tanggal Pelaksanaan</label>
                <input 
                  type="date" name="tanggal" value={formData.tanggal || ''} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Kabupaten Pelaksanaan</label>
                <select 
                  name="kabupaten" value={formData.kabupaten || ''} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                >
                  {KABUPATEN_LIST.map(kab => (
                    <option key={kab} value={kab}>{kab}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Jumlah Peserta (Orang)</label>
                <input 
                  type="number" name="peserta" value={formData.peserta !== undefined ? formData.peserta : 0} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Instansi Penyelenggara</label>
                <input 
                  type="text" name="instansi" value={formData.instansi || ''} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
              </div>

              {tabId === 'wasbang' ? (
                <>
                  <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Nama Narasumber</label>
                    <input 
                      type="text" name="narasumber" value={formData.narasumber || ''} onChange={handleChange}
                      className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Lokasi Aula/Gedung *</label>
                    <input 
                      type="text" name="lokasi" value={formData.lokasi || ''} onChange={handleChange}
                      className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                    />
                    {validationErrors.lokasi && <span className="text-[10px] text-rose-500 font-semibold mt-1 block">{validationErrors.lokasi}</span>}
                  </div>
                </>
              ) : (
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Output Hasil Kegiatan</label>
                  <textarea 
                    name="output" value={formData.output || ''} onChange={handleChange} rows={2}
                    placeholder="Contoh: Deklarasi dan Sertifikasi 100 kader bela negara"
                    className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Anggaran Pagu (IDR)</label>
                <input 
                  type="number" name="anggaran" value={formData.anggaran !== undefined ? formData.anggaran : 0} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Realisasi Terserap (IDR)</label>
                <input 
                  type="number" name="realisasi" value={formData.realisasi !== undefined ? formData.realisasi : 0} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
              </div>
            </div>
          )}

          {/* 4. Pendidikan Politik Form */}
          {tabId === 'pentik' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Tema Pendidikan Politik *</label>
                <input 
                  type="text" name="tema" value={formData.tema || ''} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
                {validationErrors.tema && <span className="text-[10px] text-rose-500 font-semibold mt-1 block">{validationErrors.tema}</span>}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Tanggal Kegiatan</label>
                <input 
                  type="date" name="tanggal" value={formData.tanggal || ''} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Kabupaten Lokasi</label>
                <select 
                  name="kabupaten" value={formData.kabupaten || ''} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                >
                  {KABUPATEN_LIST.map(kab => (
                    <option key={kab} value={kab}>{kab}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Narasumber Utama</label>
                <input 
                  type="text" name="narasumber" value={formData.narasumber || ''} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Jumlah Peserta</label>
                <input 
                  type="number" name="peserta" value={formData.peserta !== undefined ? formData.peserta : 0} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Lokasi Persis *</label>
                <input 
                  type="text" name="lokasi" value={formData.lokasi || ''} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
                {validationErrors.lokasi && <span className="text-[10px] text-rose-500 font-semibold mt-1 block">{validationErrors.lokasi}</span>}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Anggaran (IDR)</label>
                <input 
                  type="number" name="anggaran" value={formData.anggaran !== undefined ? formData.anggaran : 0} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Realisasi (IDR)</label>
                <input 
                  type="number" name="realisasi" value={formData.realisasi !== undefined ? formData.realisasi : 0} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
              </div>
            </div>
          )}

          {/* 5. Konflik Sosial Form */}
          {tabId === 'konflik' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Jenis / Judul Konflik Sosial *</label>
                <input 
                  type="text" name="jenisKonflik" value={formData.jenisKonflik || ''} onChange={handleChange}
                  placeholder="Contoh: Sengketa tapal batas wilayah"
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
                {validationErrors.jenisKonflik && <span className="text-[10px] text-rose-500 font-semibold mt-1 block">{validationErrors.jenisKonflik}</span>}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Kabupaten Konflik</label>
                <select 
                  name="kabupaten" value={formData.kabupaten || ''} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                >
                  {KABUPATEN_LIST.map(kab => (
                    <option key={kab} value={kab}>{kab}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Kecamatan Lokasi</label>
                <input 
                  type="text" name="kecamatan" value={formData.kecamatan || ''} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Tanggal Pelaporan</label>
                <input 
                  type="date" name="tanggal" value={formData.tanggal || ''} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Status Penanganan</label>
                <select 
                  name="status" value={formData.status || 'Belum Ditangani'} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none cursor-pointer"
                >
                  <option value="Belum Ditangani">Belum Ditangani</option>
                  <option value="Proses">Sedang Diproses/Pendekatan</option>
                  <option value="Selesai">Selesai Damai</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Lokasi Spesifik Kejadian *</label>
                <input 
                  type="text" name="lokasi" value={formData.lokasi || ''} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
                {validationErrors.lokasi && <span className="text-[10px] text-rose-500 font-semibold mt-1 block">{validationErrors.lokasi}</span>}
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Hasil Langkah Penyelesaian / Tindakan</label>
                <textarea 
                  name="penyelesaian" value={formData.penyelesaian || ''} onChange={handleChange} rows={3}
                  placeholder="Deskripsikan langkah penyelesaian, mediasi, atau rencana ke depan..."
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
              </div>
            </div>
          )}

          {/* 6. Penelitian Form */}
          {tabId === 'penelitian' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Nama Lengkap Peneliti *</label>
                <input 
                  type="text" name="namaPeneliti" value={formData.namaPeneliti || ''} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
                {validationErrors.namaPeneliti && <span className="text-[10px] text-rose-500 font-semibold mt-1 block">{validationErrors.namaPeneliti}</span>}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Instansi / Universitas</label>
                <input 
                  type="text" name="instansi" value={formData.instansi || ''} onChange={handleChange}
                  placeholder="Contoh: Universitas Mataram"
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Judul Penelitian Resmi *</label>
                <input 
                  type="text" name="judulPenelitian" value={formData.judulPenelitian || ''} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
                {validationErrors.judulPenelitian && <span className="text-[10px] text-rose-500 font-semibold mt-1 block">{validationErrors.judulPenelitian}</span>}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Nomor Surat Pengantar / Rekomendasi</label>
                <input 
                  type="text" name="nomorSurat" value={formData.nomorSurat || ''} onChange={handleChange}
                  placeholder="Contoh: 070/412/KBSP/2026"
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Status Persetujuan</label>
                <select 
                  name="status" value={formData.status || 'Diproses'} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none cursor-pointer"
                >
                  <option value="Diproses">Diproses / Telaah Berkas</option>
                  <option value="Disetujui">Surat Rekomendasi Disetujui</option>
                  <option value="Ditolak">Ditolak / Kurang Syarat</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Tanggal Mulai Masuk</label>
                <input 
                  type="date" name="tanggalMasuk" value={formData.tanggalMasuk || ''} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Tanggal Selesai Penelitian</label>
                <input 
                  type="date" name="tanggalSelesai" value={formData.tanggalSelesai || ''} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
              </div>
            </div>
          )}

          {/* 7. Program & Kegiatan Form */}
          {tabId === 'program' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Nama Program Pemerintah *</label>
                <input 
                  type="text" name="program" value={formData.program || ''} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
                {validationErrors.program && <span className="text-[10px] text-rose-500 font-semibold mt-1 block">{validationErrors.program}</span>}
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Nama Kegiatan *</label>
                <input 
                  type="text" name="kegiatan" value={formData.kegiatan || ''} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
                {validationErrors.kegiatan && <span className="text-[10px] text-rose-500 font-semibold mt-1 block">{validationErrors.kegiatan}</span>}
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Sub Kegiatan</label>
                <input 
                  type="text" name="subKegiatan" value={formData.subKegiatan || ''} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Bidang Pengelola</label>
                <select 
                  name="bidang" value={formData.bidang || 'Sekretariat'} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none cursor-pointer"
                >
                  <option value="Sekretariat">Sekretariat</option>
                  <option value="Ideologi & Waspas">Ideologi & Waspas</option>
                  <option value="Poldagri">Poldagri</option>
                  <option value="Ormas">Ormas</option>
                  <option value="Seni Budaya & Agama">Seni Budaya & Agama</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Tahun Anggaran</label>
                <input 
                  type="text" name="tahun" value={formData.tahun || '2026'} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Anggaran Pagu (IDR)</label>
                <input 
                  type="number" name="anggaran" value={formData.anggaran !== undefined ? formData.anggaran : 0} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Realisasi (IDR)</label>
                <input 
                  type="number" name="realisasi" value={formData.realisasi !== undefined ? formData.realisasi : 0} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Status Pelaksanaan</label>
                <select 
                  name="status" value={formData.status || 'Belum Mulai'} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none cursor-pointer"
                >
                  <option value="Belum Mulai">Belum Mulai</option>
                  <option value="Dalam Proses">Dalam Proses</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>
            </div>
          )}

          {/* 8. Berita Form */}
          {tabId === 'berita' && (
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Judul Berita Daerah *</label>
                <input 
                  type="text" name="judul" value={formData.judul || ''} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
                {validationErrors.judul && <span className="text-[10px] text-rose-500 font-semibold mt-1 block">{validationErrors.judul}</span>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Penulis / Humas</label>
                  <input 
                    type="text" name="penulis" value={formData.penulis || 'Humas Kesbangpol'} onChange={handleChange}
                    className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Tanggal Berita</label>
                  <input 
                    type="date" name="tanggal" value={formData.tanggal || ''} onChange={handleChange}
                    className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Isi / Artikel Berita *</label>
                <textarea 
                  name="isi" value={formData.isi || ''} onChange={handleChange} rows={5}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none leading-normal"
                />
                {validationErrors.isi && <span className="text-[10px] text-rose-500 font-semibold mt-1 block">{validationErrors.isi}</span>}
              </div>
            </div>
          )}

          {/* 9. Dokumen Form */}
          {tabId === 'dokumen' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Nama Dokumen Regulasi *</label>
                <input 
                  type="text" name="namaDokumen" value={formData.namaDokumen || ''} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
                {validationErrors.namaDokumen && <span className="text-[10px] text-rose-500 font-semibold mt-1 block">{validationErrors.namaDokumen}</span>}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Kategori Dokumen</label>
                <select 
                  name="kategori" value={formData.kategori || 'Regulasi'} onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none cursor-pointer"
                >
                  <option value="Regulasi">Regulasi / Pergub / UU</option>
                  <option value="Perencanaan">Renstra / Perencanaan</option>
                  <option value="Keuangan">Keuangan / LRA</option>
                  <option value="Laporan">Laporan Kinerja / LPPD</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">Nomor Dokumen *</label>
                <input 
                  type="text" name="nomorDokumen" value={formData.nomorDokumen || ''} onChange={handleChange}
                  placeholder="Contoh: Pergub No 45/2026"
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-white outline-none"
                />
                {validationErrors.nomorDokumen && <span className="text-[10px] text-rose-500 font-semibold mt-1 block">{validationErrors.nomorDokumen}</span>}
              </div>
            </div>
          )}

          {/* SHARED PREMIUM FILE UPLOADER (For tabs: ormas, konflik, wasbang, berita, dokumen) */}
          {['ormas', 'konflik', 'wasbang', 'berita', 'dokumen'].includes(tabId) && (
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block">
                {tabId === 'dokumen' ? 'Unggah File Dokumen (.pdf, .doc, .xlsx)' : 'Unggah Foto Dokumentasi / Logo (.png, .jpg)'}
              </label>
              
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`
                  border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2
                  ${dragActive 
                    ? 'border-teal-500 bg-teal-50/20 dark:bg-teal-950/20' 
                    : 'border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/20 hover:border-teal-500 dark:hover:border-teal-500'
                  }
                `}
                onClick={() => document.getElementById('form-file-input')?.click()}
              >
                <input 
                  type="file" 
                  id="form-file-input"
                  onChange={handleFileChange}
                  accept={tabId === 'dokumen' ? '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx' : 'image/*'}
                  className="hidden" 
                />
                
                <Upload className="w-8 h-8 text-gray-400 group-hover:text-teal-500 transition-colors" />
                
                <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold">
                  Tarik & lepas file Anda di sini, atau <span className="text-teal-600 dark:text-teal-400">pilih berkas</span>
                </p>
                <p className="text-[10px] text-gray-400">
                  {tabId === 'dokumen' ? 'PDF, Word, Excel hingga 5MB' : 'Gambar JPEG, PNG hingga 3MB'}
                </p>
              </div>

              {/* Upload success notification snippet */}
              {filePreviewName && (
                <div className="p-2.5 bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-900/30 rounded-xl text-xs font-bold flex items-center justify-between">
                  <span className="flex items-center gap-2 truncate">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{filePreviewName}</span>
                  </span>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFileObject(null);
                      setFilePreviewName('');
                    }}
                    className="p-1 hover:bg-teal-100 rounded-md text-[10px] text-rose-500 font-extrabold uppercase tracking-widest"
                  >
                    Hapus
                  </button>
                </div>
              )}
            </div>
          )}

        </form>

        {/* Footer controls */}
        <div className="p-4 border-t border-gray-150 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/30 rounded-b-2xl flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-500/10 transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan</span>
          </button>
        </div>

      </div>
    </div>
  );
}
