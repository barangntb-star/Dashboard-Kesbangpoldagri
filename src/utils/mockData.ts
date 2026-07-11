import { 
  User, Ormas, PartaiPolitik, WawasanKebangsaan, BelaNegara, 
  PendidikanPolitik, KonflikSosial, Penelitian, ProgramKegiatan, 
  Berita, Dokumen 
} from '../types';

export const KABUPATEN_LIST = [
  'Lombok Barat',
  'Lombok Tengah',
  'Lombok Timur',
  'Lombok Utara',
  'Sumbawa',
  'Sumbawa Barat',
  'Dompu',
  'Bima',
  'Kota Mataram',
  'Kota Bima'
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    username: 'admin',
    nama: 'H. Lalu Muhammad, M.Si',
    role: 'Administrator',
    bidang: 'Sekretariat',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  },
  {
    id: 'usr-2',
    username: 'operator',
    nama: 'Budi Hartono, S.Sos',
    role: 'Operator Bidang',
    bidang: 'Ormas',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  },
  {
    id: 'usr-3',
    username: 'pimpinan',
    nama: 'Drs. H. Abdul Hakim, MM',
    role: 'Pimpinan',
    bidang: 'Kepala Badan',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
  }
];

export const INITIAL_ORMAS: Ormas[] = [
  {
    id: 'orm-1',
    nama: 'Pengurus Wilayah Nahdlatul Wathan (PWNW) NTB',
    noSkt: '04/SKT/POL-PEM/IX/2024',
    tanggalSkt: '2024-09-15',
    ketua: 'TGB. Dr. M. Zainul Majdi',
    alamat: 'Jl. Pancor No. 17, Selong',
    kabupaten: 'Lombok Timur',
    kecamatan: 'Selong',
    kelurahan: 'Pancor',
    noTelp: '081234567890',
    email: 'pwnw.ntb@gmail.com',
    status: 'Aktif'
  },
  {
    id: 'orm-2',
    nama: 'Pimpinan Wilayah Muhammadiyah NTB',
    noSkt: '12/SKT/KBSP/II/2025',
    tanggalSkt: '2025-02-10',
    ketua: 'Dr. H. Falahuddin, M.Ag',
    alamat: 'Jl. Anyelir No. 5, Mataram',
    kabupaten: 'Kota Mataram',
    kecamatan: 'Mataram',
    kelurahan: 'Pagesangan',
    noTelp: '081987654321',
    email: 'pwm.ntb@muhammadiyah.or.id',
    status: 'Aktif'
  },
  {
    id: 'orm-3',
    nama: 'Majelis Ulama Indonesia (MUI) NTB',
    noSkt: '15/SKT/ORMAS/IV/2025',
    tanggalSkt: '2025-04-05',
    ketua: 'Prof. Dr. H. Saiful Muslim',
    alamat: 'Jl. Bung Karno, Mataram',
    kabupaten: 'Kota Mataram',
    kecamatan: 'Mataram',
    kelurahan: 'Pagutan',
    noTelp: '087755556666',
    email: 'mui.ntb@yahoo.com',
    status: 'Aktif'
  },
  {
    id: 'orm-4',
    nama: 'Forum Komunikasi Pemuda Sumbawa Barat (FKPSB)',
    noSkt: '33/SKT/KBSP/VI/2025',
    tanggalSkt: '2025-06-18',
    ketua: 'Supriadi, S.AP',
    alamat: 'Jl. Kencana No. 44, Taliwang',
    kabupaten: 'Sumbawa Barat',
    kecamatan: 'Taliwang',
    kelurahan: 'Kuang',
    noTelp: '085233445566',
    email: 'fkpsb.taliwang@gmail.com',
    status: 'Aktif'
  },
  {
    id: 'orm-5',
    nama: 'Yayasan Lembaga Perlindungan Konsumen Lombok',
    noSkt: '08/SKT/KBSP/I/2026',
    tanggalSkt: '2026-01-20',
    ketua: 'Lalu Syafruddin, SH',
    alamat: 'Jl. Diponegoro No. 8, Praya',
    kabupaten: 'Lombok Tengah',
    kecamatan: 'Praya',
    kelurahan: 'Gerunung',
    noTelp: '081333444555',
    email: 'ylpk.lombok@gmail.com',
    status: 'Tidak Aktif'
  }
];

export const INITIAL_PARPOL: PartaiPolitik[] = [
  {
    id: 'par-1',
    nama: 'Partai Golongan Karya (GOLKAR)',
    ketua: 'H. Mohan Roliskana, S.Sos',
    kabupaten: 'Kota Mataram',
    alamat: 'Jl. Jenderal Sudirman No. 10, Mataram',
    jumlahKursi: 10,
    jumlahSuara: 450230,
    status: 'Aktif'
  },
  {
    id: 'par-2',
    nama: 'Partai Gerakan Indonesia Raya (GERINDRA)',
    ketua: 'H. Bambang Kristiono, SE',
    kabupaten: 'Lombok Barat',
    alamat: 'Jl. Bypass BIL, Gerung',
    jumlahKursi: 10,
    jumlahSuara: 445120,
    status: 'Aktif'
  },
  {
    id: 'par-3',
    nama: 'Partai Keadilan Sejahtera (PKS)',
    ketua: 'H. Yek Agil, M.Si',
    kabupaten: 'Kota Mataram',
    alamat: 'Jl. Bung Hatta No. 15, Mataram',
    jumlahKursi: 8,
    jumlahSuara: 325150,
    status: 'Aktif'
  },
  {
    id: 'par-4',
    nama: 'Partai Demokrasi Indonesia Perjuangan (PDIP)',
    ketua: 'H. Rachmat Hidayat, SH',
    kabupaten: 'Lombok Timur',
    alamat: 'Jl. Lingkar Selatan, Mataram',
    jumlahKursi: 7,
    jumlahSuara: 280450,
    status: 'Aktif'
  },
  {
    id: 'par-5',
    nama: 'Partai Demokrat',
    ketua: 'Indra Jaya Usman, S.IP',
    kabupaten: 'Lombok Tengah',
    alamat: 'Jl. Gajah Mada No. 8, Mataram',
    jumlahKursi: 6,
    jumlahSuara: 240500,
    status: 'Aktif'
  },
  {
    id: 'par-6',
    nama: 'Partai NasDem',
    ketua: 'H. Willy Aditya',
    kabupaten: 'Kota Mataram',
    alamat: 'Jl. Pejanggik No. 50, Mataram',
    jumlahKursi: 4,
    jumlahSuara: 180200,
    status: 'Aktif'
  }
];

export const INITIAL_WASBANG: WawasanKebangsaan[] = [
  {
    id: 'wb-1',
    namaKegiatan: 'Sosialisasi Empat Pilar Kebangsaan bagi Generasi Milenial',
    tanggal: '2026-03-12',
    lokasi: 'Aula Rinjani Bakesbangpoldagri NTB',
    kabupaten: 'Kota Mataram',
    peserta: 120,
    instansi: 'Badan Kesbangpoldagri Provinsi NTB',
    narasumber: 'Drs. H. Abdul Hakim, MM (Kaban Kesbangpoldagri)',
    anggaran: 45000000,
    realisasi: 42500000,
    dokumentasi: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600'
  },
  {
    id: 'wb-2',
    namaKegiatan: 'Penyuluhan Wawasan Kebangsaan dan Karakter Bangsa Tingkat Kabupaten',
    tanggal: '2026-05-18',
    lokasi: 'Gedung Wanita Praya',
    kabupaten: 'Lombok Tengah',
    peserta: 150,
    instansi: 'Pemerintah Kabupaten Lombok Tengah',
    narasumber: 'Mayor Inf. Supriadi (Kodim 1620/Loteng)',
    anggaran: 50000000,
    realisasi: 50000000,
    dokumentasi: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600'
  },
  {
    id: 'wb-3',
    namaKegiatan: 'Kemah Bakti Pemuda Penggerak Kerukunan dan Toleransi NTB',
    tanggal: '2026-06-25',
    lokasi: 'Bumi Perkemahan Suranadi',
    kabupaten: 'Lombok Barat',
    peserta: 80,
    instansi: 'Forum Pemuda Lintas Agama (FKUB) NTB',
    narasumber: 'KH. Zaidi Abdad (Ketua FKUB NTB)',
    anggaran: 65000000,
    realisasi: 64100000,
    dokumentasi: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600'
  }
];

export const INITIAL_BELA_NEGARA: BelaNegara[] = [
  {
    id: 'bn-1',
    namaKegiatan: 'Pendidikan Kesadaran Bela Negara (PKBN) bagi ASN Provinsi NTB',
    tanggal: '2026-04-06',
    lokasi: 'Yonif 742/SWY, Gebang Mataram',
    kabupaten: 'Kota Mataram',
    peserta: 100,
    instansi: 'Badan Kepegawaian Daerah (BKD) & Kesbangpol NTB',
    output: 'Terbentuknya 100 Kader Bela Negara ASN yang disiplin, loyal, dan berintegritas.',
    anggaran: 120000000,
    realisasi: 118000000
  },
  {
    id: 'bn-2',
    namaKegiatan: 'Pelatihan Kader Bela Negara Tingkat Pemuda se-Pulau Sumbawa',
    tanggal: '2026-05-24',
    lokasi: 'Balai Latihan Kerja Sumbawa',
    kabupaten: 'Sumbawa',
    peserta: 75,
    instansi: 'Kwartir Daerah Pramuka NTB & Kesbangpol NTB',
    output: 'Deklarasi Pemuda Penggerak Bela Negara Pulau Sumbawa, bersertifikat.',
    anggaran: 90000000,
    realisasi: 88500000
  }
];

export const INITIAL_PENTIK: PendidikanPolitik[] = [
  {
    id: 'pt-1',
    tema: 'Pendidikan Politik bagi Pemilih Pemula Menjelang Pilkada NTB Serentak 2026',
    tanggal: '2026-02-15',
    lokasi: 'MAN 1 Lombok Timur, Selong',
    kabupaten: 'Lombok Timur',
    narasumber: 'Ketua KPU NTB & Anggota Bawaslu NTB',
    peserta: 250,
    anggaran: 35000000,
    realisasi: 35000000
  },
  {
    id: 'pt-2',
    tema: 'Workshop Penguatan Kapasitas Politik Perempuan dalam Parlemen',
    tanggal: '2026-04-20',
    lokasi: 'Hotel Grand Legi, Mataram',
    kabupaten: 'Kota Mataram',
    narasumber: 'Dr. Hj. Sitti Rohmi Djalilah (Tokoh Perempuan NTB)',
    peserta: 60,
    anggaran: 55000000,
    realisasi: 52400000
  },
  {
    id: 'pt-3',
    tema: 'Pendidikan Politik dan Demokrasi untuk Tokoh Masyarakat dan Agama',
    tanggal: '2026-06-08',
    lokasi: 'Aula Kantor Bupati Bima',
    kabupaten: 'Bima',
    narasumber: 'Akademisi Universitas Mataram',
    peserta: 100,
    anggaran: 40000000,
    realisasi: 39500000
  }
];

export const INITIAL_KONFLIK: KonflikSosial[] = [
  {
    id: 'kf-1',
    jenisKonflik: 'Sengketa Batas Lahan Pertanian antar Desa',
    lokasi: 'Perbatasan Desa Jereweh dan Maluk',
    kabupaten: 'Sumbawa Barat',
    kecamatan: 'Jereweh',
    status: 'Selesai',
    penyelesaian: 'Mediasi bersama BPN, Polres, Pemkab, serta tokoh masyarakat kedua belah pihak menghasilkan penandatanganan MoU batas batas wilayah definitif.',
    tanggal: '2026-02-28',
    dokumentasi: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=600'
  },
  {
    id: 'kf-2',
    jenisKonflik: 'Ketegangan Sosial akibat Kesalahpahaman Kelompok Pemuda',
    lokasi: 'Kecamatan Pujut, Lombok Tengah',
    kabupaten: 'Lombok Tengah',
    kecamatan: 'Pujut',
    status: 'Selesai',
    penyelesaian: 'Pembuatan Pos Keamanan Bersama dan deklarasi perdamaian pemuda lintas desa dipandu oleh Kodim dan Kesbangpol.',
    tanggal: '2026-05-10',
    dokumentasi: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600'
  },
  {
    id: 'kf-3',
    jenisKonflik: 'Isu Penolakan Pembangunan Tempat Ibadah',
    lokasi: 'Kecamatan Gunungsari, Lombok Barat',
    kabupaten: 'Lombok Barat',
    kecamatan: 'Gunungsari',
    status: 'Proses',
    penyelesaian: 'Sedang dilakukan pendekatan intensif oleh FKUB, Kesbangpoldagri, dan Kementerian Agama untuk memverifikasi kelayakan izin perizinan (PBM No 9 & 8 tahun 2006).',
    tanggal: '2026-06-14',
    dokumentasi: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600'
  }
];

export const INITIAL_PENELITIAN: Penelitian[] = [
  {
    id: 'pn-1',
    namaPeneliti: 'Lalu Ahmad Fikri',
    instansi: 'Universitas Mataram',
    judulPenelitian: 'Analisis Tingkat Kerukunan Umat Beragama di Kawasan Lingkar Mandalika Pasca MotoGP',
    nomorSurat: '070/321/KBSP/III/2026',
    status: 'Disetujui',
    tanggalMasuk: '2026-03-01',
    tanggalSelesai: '2026-06-01'
  },
  {
    id: 'pn-2',
    namaPeneliti: 'Andi Wijaya',
    instansi: 'Universitas Indonesia',
    judulPenelitian: 'Kesiapan Kelembagaan KPU-Bawaslu dan Potensi Kerawanan Konflik dalam Pemilu Kepala Daerah Serentak di Provinsi NTB',
    nomorSurat: '070/412/KBSP/IV/2026',
    status: 'Disetujui',
    tanggalMasuk: '2026-04-10',
    tanggalSelesai: '2026-08-10'
  },
  {
    id: 'pn-3',
    namaPeneliti: 'Sri Wahyuni',
    instansi: 'UIN Mataram',
    judulPenelitian: 'Peran Pondok Pesantren dalam Membendung Paham Radikalisme di Kabupaten Lombok Timur',
    nomorSurat: '070/505/KBSP/V/2026',
    status: 'Diproses',
    tanggalMasuk: '2026-05-22',
    tanggalSelesai: '2026-08-22'
  }
];

export const INITIAL_PROGRAM_KEGIATAN: ProgramKegiatan[] = [
  {
    id: 'pk-1',
    program: 'Program Penguatan Ideologi Pancasila dan Karakter Kebangsaan',
    kegiatan: 'Penyelenggaraan Pendidikan Wawasan Kebangsaan dan Bela Negara',
    subKegiatan: 'Sosialisasi & Workshop Empat Pilar',
    bidang: 'Ideologi & Waspas',
    anggaran: 250000000,
    realisasi: 180000000,
    persentase: 72,
    status: 'Dalam Proses',
    tahun: '2026'
  },
  {
    id: 'pk-2',
    program: 'Program Peningkatan Kerukunan Umat Beragama dan Kewaspadaan Nasional',
    kegiatan: 'Pencegahan Konflik Sosial dan Deteksi Dini',
    subKegiatan: 'Mediasi dan Penanganan Potensi Konflik',
    bidang: 'Ideologi & Waspas',
    anggaran: 300000000,
    realisasi: 285000000,
    persentase: 95,
    status: 'Selesai',
    tahun: '2026'
  },
  {
    id: 'pk-3',
    program: 'Program Pengembangan Demokrasi dan Kehidupan Berpolitik',
    kegiatan: 'Pendidikan Politik bagi Masyarakat dan Pemilih Pemula',
    subKegiatan: 'Sosialisasi Pemilu & Partisipasi Politik Masyarakat',
    bidang: 'Poldagri',
    anggaran: 400000000,
    realisasi: 310000000,
    persentase: 77.5,
    status: 'Dalam Proses',
    tahun: '2026'
  },
  {
    id: 'pk-4',
    program: 'Program Pemberdayaan Ormas dan Kemasyarakatan',
    kegiatan: 'Pendaftaran, Monitoring, dan Penguatan Kapasitas Ormas',
    subKegiatan: 'Verifikasi Berkas SKT dan Sosialisasi UU Ormas',
    bidang: 'Ormas',
    anggaran: 150000000,
    realisasi: 50000000,
    persentase: 33.3,
    status: 'Dalam Proses',
    tahun: '2026'
  },
  {
    id: 'pk-5',
    program: 'Program Penunjang Urusan Pemerintahan Daerah Provinsi',
    kegiatan: 'Administrasi Umum, Keuangan, dan Sarana Prasarana',
    subKegiatan: 'Pembayaran Gaji, Penyusunan Laporan Keuangan Sekretariat',
    bidang: 'Sekretariat',
    anggaran: 850000000,
    realisasi: 420000000,
    persentase: 49.4,
    status: 'Dalam Proses',
    tahun: '2026'
  }
];

export const INITIAL_BERITA: Berita[] = [
  {
    id: 'br-1',
    judul: 'Kaban Kesbangpoldagri NTB Hadiri Deklarasi Pilkada Damai Serentak 2026',
    isi: 'Mataram - Kepala Badan Kesatuan Bangsa dan Politik Dalam Negeri Provinsi Nusa Tenggara Barat menghadiri acara penting Deklarasi Pemilu Damai Serentak 2026 yang dilaksanakan di Lapangan Bumi Gora Kantor Gubernur NTB. Acara ini dihadiri oleh Pj Gubernur NTB, jajaran Forkopimda, KPU, Bawaslu, serta pimpinan seluruh partai politik peserta Pilkada di NTB. Hal ini demi mewujudkan NTB yang kondusif selama masa kontestasi.',
    foto: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    penulis: 'Humas Kesbangpoldagri',
    tanggal: '2026-06-15'
  },
  {
    id: 'br-2',
    judul: 'Sinergitas Pemerintah Daerah NTB dalam Pengawasan Ormas Asing',
    isi: 'Sumbawa - Badan Kesbangpoldagri NTB menyelenggarakan rapat koordinasi Tim Terpadu Pengawasan Organisasi Kemasyarakatan Asing di Provinsi Nusa Tenggara Barat. Rapat ini memfokuskan pemantauan pada kegiatan ormas asing di kawasan pariwisata guna memastikan kepatuhan terhadap aturan perundang-undangan RI.',
    foto: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800',
    penulis: 'Admin Ormas',
    tanggal: '2026-05-28'
  }
];

export const INITIAL_DOKUMEN: Dokumen[] = [
  {
    id: 'doc-1',
    namaDokumen: 'Peraturan Gubernur NTB No 45 Tahun 2024 tentang Tata Cara Pelaporan Konflik Sosial',
    kategori: 'Regulasi',
    nomorDokumen: 'Pergub No 45/2024',
    fileUrl: 'https://drive.google.com/open?id=1234567890abcdef',
    tanggalUpload: '2026-01-10',
    ukuran: '2.4 MB'
  },
  {
    id: 'doc-2',
    namaDokumen: 'Rencana Strategis (Renstra) Kesbangpoldagri NTB Tahun 2024-2029',
    kategori: 'Perencanaan',
    nomorDokumen: 'RENSTRA-KBSP-2024',
    fileUrl: 'https://drive.google.com/open?id=0987654321fedcba',
    tanggalUpload: '2026-02-05',
    ukuran: '5.8 MB'
  },
  {
    id: 'doc-3',
    namaDokumen: 'Laporan Realisasi Anggaran Triwulan I Tahun Anggaran 2026',
    kategori: 'Keuangan',
    nomorDokumen: 'LRA-TW-I-2026',
    fileUrl: 'https://drive.google.com/open?id=abcdef1234567890',
    tanggalUpload: '2026-04-12',
    ukuran: '1.2 MB'
  }
];
