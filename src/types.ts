export type UserRole = 'Administrator' | 'Operator Bidang' | 'Pimpinan';

export interface User {
  id: string;
  username: string;
  nama: string;
  role: UserRole;
  bidang?: string;
  avatar?: string;
}

export interface Ormas {
  id: string;
  nama: string;
  noSkt: string;
  tanggalSkt: string;
  ketua: string;
  alamat: string;
  kabupaten: string;
  kecamatan: string;
  kelurahan: string;
  noTelp: string;
  email: string;
  status: 'Aktif' | 'Tidak Aktif';
  dokumenSkt?: string; // base64 or URL
  logo?: string;
}

export interface PartaiPolitik {
  id: string;
  nama: string;
  ketua: string;
  kabupaten: string;
  alamat: string;
  jumlahKursi: number;
  jumlahSuara: number;
  status: 'Aktif' | 'Tidak Aktif';
  logo?: string;
}

export interface WawasanKebangsaan {
  id: string;
  namaKegiatan: string;
  tanggal: string;
  lokasi: string;
  kabupaten: string;
  peserta: number;
  instansi: string;
  narasumber: string;
  anggaran: number;
  realisasi: number;
  dokumentasi?: string;
}

export interface BelaNegara {
  id: string;
  namaKegiatan: string;
  tanggal: string;
  lokasi: string;
  kabupaten: string;
  peserta: number;
  instansi: string;
  output: string;
  anggaran: number;
  realisasi: number;
}

export interface PendidikanPolitik {
  id: string;
  tema: string;
  tanggal: string;
  lokasi: string;
  kabupaten: string;
  narasumber: string;
  peserta: number;
  anggaran: number;
  realisasi: number;
}

export interface KonflikSosial {
  id: string;
  jenisKonflik: string;
  lokasi: string;
  kabupaten: string;
  kecamatan: string;
  status: 'Selesai' | 'Proses' | 'Belum Ditangani';
  penyelesaian: string;
  dokumentasi?: string;
  tanggal: string;
}

export interface Penelitian {
  id: string;
  namaPeneliti: string;
  instansi: string;
  judulPenelitian: string;
  nomorSurat: string;
  status: 'Disetujui' | 'Diproses' | 'Ditolak';
  tanggalMasuk: string;
  tanggalSelesai: string;
}

export interface ProgramKegiatan {
  id: string;
  program: string;
  kegiatan: string;
  subKegiatan: string;
  bidang: 'Sekretariat' | 'Ideologi & Waspas' | 'Poldagri' | 'Ormas' | 'Seni Budaya & Agama';
  anggaran: number;
  realisasi: number;
  persentase: number; // calculated
  status: 'Selesai' | 'Dalam Proses' | 'Belum Mulai';
  tahun: string;
}

export interface Berita {
  id: string;
  judul: string;
  isi: string;
  foto?: string;
  penulis: string;
  tanggal: string;
}

export interface Dokumen {
  id: string;
  namaDokumen: string;
  kategori: string;
  nomorDokumen: string;
  fileUrl: string; // Google Drive link or mock URL
  tanggalUpload: string;
  ukuran?: string;
}

export interface SystemConfig {
  apiUrl: string;
  useMock: boolean;
  spreadsheetUrl: string;
  driveFolderId: string;
}
