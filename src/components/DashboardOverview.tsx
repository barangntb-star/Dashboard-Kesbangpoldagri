import React from 'react';
import { 
  Users, Landmark, AlertTriangle, SearchCode, FileText, 
  TrendingUp, Percent, Award, Globe, Flag, MapPin, 
  ArrowRight, Calendar, DollarSign, Wallet
} from 'lucide-react';
import { 
  Ormas, PartaiPolitik, WawasanKebangsaan, BelaNegara, 
  PendidikanPolitik, KonflikSosial, Penelitian, ProgramKegiatan 
} from '../types';

interface DashboardOverviewProps {
  ormas: Ormas[];
  partai: PartaiPolitik[];
  wasbang: WawasanKebangsaan[];
  belaNegara: BelaNegara[];
  pentik: PendidikanPolitik[];
  konflik: KonflikSosial[];
  penelitian: Penelitian[];
  programKegiatan: ProgramKegiatan[];
  customMap?: string;
}

export default function DashboardOverview({
  ormas, partai, wasbang, belaNegara, pentik, konflik, penelitian, programKegiatan, customMap
}: DashboardOverviewProps) {
  const [selectedKabupaten, setSelectedKabupaten] = React.useState<string>('Seluruh NTB');

  // Calculating counters
  const totalOrmas = ormas.length;
  const totalPartai = partai.length;
  const totalPenelitian = penelitian.length;
  const totalKonflik = konflik.length;
  const totalPentik = pentik.length;
  const totalWasbang = wasbang.length;
  const totalBelaNegara = belaNegara.length;
  const totalKegiatan = totalPentik + totalWasbang + totalBelaNegara;

  // Budget calculations
  const totalAnggaran = programKegiatan.reduce((acc, curr) => acc + curr.anggaran, 0);
  const totalRealisasi = programKegiatan.reduce((acc, curr) => acc + curr.realisasi, 0);
  const persentaseRealisasi = totalAnggaran > 0 ? (totalRealisasi / totalAnggaran) * 100 : 0;

  // Format currency
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  // Helper for Kabupaten lists
  const kabupatenList = [
    'Kota Mataram', 'Lombok Barat', 'Lombok Tengah', 'Lombok Timur', 'Lombok Utara',
    'Sumbawa Barat', 'Sumbawa', 'Dompu', 'Bima', 'Kota Bima'
  ];

  // Ormas per Kabupaten distribution
  const ormasPerKab: { [key: string]: number } = {};
  kabupatenList.forEach(kab => { ormasPerKab[kab] = 0; });
  ormas.forEach(o => {
    if (ormasPerKab[o.kabupaten] !== undefined) {
      ormasPerKab[o.kabupaten]++;
    } else if (o.kabupaten) {
      ormasPerKab[o.kabupaten] = 1;
    }
  });

  // Konflik per Kabupaten distribution
  const konflikPerKab: { [key: string]: number } = {};
  kabupatenList.forEach(kab => { konflikPerKab[kab] = 0; });
  konflik.forEach(k => {
    if (konflikPerKab[k.kabupaten] !== undefined) {
      konflikPerKab[k.kabupaten]++;
    }
  });

  // Parpol Seats per Parpol
  const kursiPerParpol = partai.reduce((acc: { [key: string]: number }, curr) => {
    acc[curr.nama] = (acc[curr.nama] || 0) + curr.jumlahKursi;
    return acc;
  }, {});

  // Budget vs Realization per Bidang
  const budgetBidang = programKegiatan.reduce((acc: { [key: string]: { budget: number; real: number } }, curr) => {
    if (!acc[curr.bidang]) {
      acc[curr.bidang] = { budget: 0, real: 0 };
    }
    acc[curr.bidang].budget += curr.anggaran;
    acc[curr.bidang].real += curr.realisasi;
    return acc;
  }, {});

  // Selected kabupaten statistical details
  const filteredOrmasCount = selectedKabupaten === 'Seluruh NTB' ? totalOrmas : ormas.filter(o => o.kabupaten === selectedKabupaten).length;
  const filteredParpolCount = selectedKabupaten === 'Seluruh NTB' ? totalPartai : partai.filter(p => p.kabupaten === selectedKabupaten).length;
  const filteredKonflikCount = selectedKabupaten === 'Seluruh NTB' ? totalKonflik : konflik.filter(k => k.kabupaten === selectedKabupaten).length;
  const filteredWasbangCount = selectedKabupaten === 'Seluruh NTB' ? totalWasbang : wasbang.filter(w => w.kabupaten === selectedKabupaten).length;
  const filteredPentikCount = selectedKabupaten === 'Seluruh NTB' ? totalPentik : pentik.filter(p => p.kabupaten === selectedKabupaten).length;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Dashboard Analitikal NTB</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Informasi real-time Badan Kesatuan Bangsa dan Politik Dalam Negeri Provinsi Nusa Tenggara Barat.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 px-2.5">Wilayah Analisis:</span>
          <select 
            value={selectedKabupaten}
            onChange={(e) => setSelectedKabupaten(e.target.value)}
            className="text-xs font-bold text-teal-700 dark:text-teal-400 bg-transparent border-none outline-none pr-6 focus:ring-0 cursor-pointer"
          >
            <option value="Seluruh NTB">Seluruh Provinsi NTB</option>
            {kabupatenList.map(kab => (
              <option key={kab} value={kab}>{kab}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Dashboard Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Ormas Card */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-teal-50 dark:bg-teal-950/20 rounded-full group-hover:scale-110 transition-transform"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Ormas Terdaftar</span>
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1.5">{totalOrmas}</h3>
              <p className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold mt-1 flex items-center gap-1">
                <span>{ormas.filter(o => o.status === 'Aktif').length} Aktif</span>
                <span className="text-gray-300">•</span>
                <span className="text-gray-400">{ormas.filter(o => o.status === 'Tidak Aktif').length} Tidak Aktif</span>
              </p>
            </div>
            <div className="p-3 bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 rounded-xl">
              <Users className="w-5.5 h-5.5" />
            </div>
          </div>
        </div>

        {/* Parpol Card */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-amber-50 dark:bg-amber-950/20 rounded-full group-hover:scale-110 transition-transform"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Partai Politik</span>
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1.5">{totalPartai}</h3>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
                {partai.reduce((sum, p) => sum + p.jumlahKursi, 0)} Total Kursi DPRD NTB
              </p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-xl">
              <Landmark className="w-5.5 h-5.5" />
            </div>
          </div>
        </div>

        {/* Konflik Sosial Card */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-rose-50 dark:bg-rose-950/20 rounded-full group-hover:scale-110 transition-transform"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Konflik Sosial</span>
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1.5">{totalKonflik}</h3>
              <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-1 flex items-center gap-1">
                <span>{konflik.filter(c => c.status === 'Selesai').length} Selesai</span>
                <span className="text-gray-300">•</span>
                <span className="text-rose-400">{konflik.filter(c => c.status !== 'Selesai').length} Penanganan</span>
              </p>
            </div>
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-xl">
              <AlertTriangle className="w-5.5 h-5.5" />
            </div>
          </div>
        </div>

        {/* Penelitian Card */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-50 dark:bg-blue-950/20 rounded-full group-hover:scale-110 transition-transform"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Rekomendasi Penelitian</span>
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1.5">{totalPenelitian}</h3>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1">
                {penelitian.filter(r => r.status === 'Disetujui').length} Terbit Surat Rekomendasi
              </p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <SearchCode className="w-5.5 h-5.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Budget KPI & Multi Kegiatan Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Realisasi Anggaran Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-teal-900 to-emerald-950 text-white p-6 rounded-2xl shadow-md border border-teal-850/20 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">Realisasi Keuangan Program</span>
              <div className="flex items-center gap-1 px-2.5 py-1 bg-white/10 rounded-full border border-white/5 text-[11px] font-bold text-amber-300">
                <Percent className="w-3.5 h-3.5" />
                <span>{persentaseRealisasi.toFixed(1)}% Realisasi</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              <div>
                <span className="text-xs text-teal-300 flex items-center gap-1">
                  <Wallet className="w-3.5 h-3.5" /> Total Pagu Anggaran
                </span>
                <p className="text-xl md:text-2xl font-extrabold mt-1">{formatIDR(totalAnggaran)}</p>
              </div>
              <div>
                <span className="text-xs text-teal-300 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" /> Realisasi Terserap
                </span>
                <p className="text-xl md:text-2xl font-extrabold mt-1 text-amber-300">{formatIDR(totalRealisasi)}</p>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex justify-between items-center text-xs text-teal-200 mb-2">
              <span>Progress Penyerapan Anggaran Provinsi</span>
              <span className="font-bold">{persentaseRealisasi.toFixed(1)}%</span>
            </div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-1000" 
                style={{ width: `${Math.min(100, persentaseRealisasi)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Bidang Kegiatan Distribution */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <h4 className="text-sm font-bold text-gray-800 dark:text-white tracking-tight flex items-center gap-2">
            <FileText className="w-4.5 h-4.5 text-teal-600 dark:text-teal-400" />
            <span>Pusat Kegiatan Bidang ({totalKegiatan})</span>
          </h4>
          <div className="space-y-4 my-5 flex-1 flex flex-col justify-center">
            {/* Wawasan Kebangsaan */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 font-medium">
                  <Globe className="w-3.5 h-3.5 text-sky-500" /> Wawasan Kebangsaan
                </span>
                <span className="font-bold text-gray-800 dark:text-white">{totalWasbang}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-full">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: `${(totalWasbang/Math.max(1, totalKegiatan))*100}%` }}></div>
              </div>
            </div>

            {/* Bela Negara */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 font-medium">
                  <Flag className="w-3.5 h-3.5 text-emerald-500" /> Bela Negara
                </span>
                <span className="font-bold text-gray-800 dark:text-white">{totalBelaNegara}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-full">
                <div className="h-full bg-emerald-50 rounded-full" style={{ width: `${(totalBelaNegara/Math.max(1, totalKegiatan))*100}%` }}></div>
              </div>
            </div>

            {/* Pendidikan Politik */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 font-medium">
                  <Award className="w-3.5 h-3.5 text-purple-500" /> Pendidikan Politik
                </span>
                <span className="font-bold text-gray-800 dark:text-white">{totalPentik}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-full">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(totalPentik/Math.max(1, totalKegiatan))*100}%` }}></div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 dark:border-slate-700 pt-3 flex justify-between items-center text-xs text-gray-400">
            <span>Pelaksanaan Aktif 2026</span>
            <span className="font-semibold text-teal-600 dark:text-teal-400">NTB Gemilang</span>
          </div>
        </div>
      </div>

      {/* Intermediate Grid: Peta Sebaran & Statistik Kabupaten */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Interactive Peta Sebaran NTB */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <MapPin className="w-4.5 h-4.5 text-teal-600 dark:text-teal-400" />
              <span>Peta Sebaran Kabupaten/Kota di Nusa Tenggara Barat</span>
            </h4>
            <p className="text-xs text-gray-400 mt-1">
              Klik salah satu kabupaten untuk memfilter statistik regional secara interaktif.
            </p>
          </div>

          {/* Map Area using clean, gorgeous SVG representations of Lombok & Sumbawa */}
          <div className="my-8 flex flex-col items-center justify-center">
            {customMap ? (
              <div className="w-full max-w-xl relative flex flex-col items-center">
                <div className="w-full bg-teal-50/20 dark:bg-slate-900/40 rounded-2xl p-4 border border-teal-100/30 overflow-hidden flex items-center justify-center min-h-[220px]">
                  <img src={customMap} alt="Peta NTB Kustom" className="max-h-[240px] w-full object-contain rounded-lg shadow-sm" />
                </div>
                
                {/* Kabupaten filter selection when custom map is loaded */}
                <div className="mt-5 w-full bg-gray-50 dark:bg-slate-900/40 p-4 rounded-xl border border-gray-150 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2.5 text-center">Pilih Wilayah Filter Statistik:</span>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {[
                      { name: 'Kota Mataram', label: 'Mataram' },
                      { name: 'Lombok Barat', label: 'Lombok Barat' },
                      { name: 'Lombok Tengah', label: 'Lombok Tengah' },
                      { name: 'Lombok Timur', label: 'Lombok Timur' },
                      { name: 'Lombok Utara', label: 'Lombok Utara' },
                      { name: 'Sumbawa Barat', label: 'Sumbawa Barat' },
                      { name: 'Sumbawa', label: 'Sumbawa' },
                      { name: 'Dompu', label: 'Dompu' },
                      { name: 'Bima', label: 'Bima' },
                      { name: 'Kota Bima', label: 'Kota Bima' }
                    ].map(kab => (
                      <button
                        key={kab.name}
                        onClick={() => setSelectedKabupaten(kab.name)}
                        className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold text-center border transition-all truncate shadow-sm cursor-pointer ${
                          selectedKabupaten === kab.name
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-teal-950 border-amber-600'
                            : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-100 dark:border-slate-700 hover:bg-teal-50 dark:hover:bg-teal-950/20'
                        }`}
                      >
                        {kab.label}
                      </button>
                    ))}
                    <button 
                      onClick={() => setSelectedKabupaten('Seluruh NTB')}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-extrabold border uppercase tracking-wider transition-all cursor-pointer ${
                        selectedKabupaten === 'Seluruh NTB'
                          ? 'bg-teal-600 text-white border-teal-500 shadow-sm'
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-slate-700'
                      }`}
                    >
                      Seluruh NTB
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-xl aspect-[16/7] relative bg-teal-50/20 dark:bg-slate-900/40 rounded-2xl p-4 border border-teal-100/30 overflow-hidden flex flex-col justify-between">
                
                {/* Regional selection button cards representing the two islands */}
                <div className="flex justify-between items-start gap-4 h-full relative">
                  
                  {/* Pulau Lombok Section */}
                  <div className="w-2/5 h-full relative flex flex-col justify-end">
                    <div className="text-center font-bold text-[10px] tracking-wider text-teal-600/70 dark:text-teal-400/50 uppercase mb-2">PULAU LOMBOK</div>
                    
                    {/* Grid representing Lombok districts */}
                    <div className="grid grid-cols-2 gap-1.5 relative z-10">
                      {[
                        { name: 'Kota Mataram', label: 'Mataram' },
                        { name: 'Lombok Barat', label: 'Lombok Barat' },
                        { name: 'Lombok Tengah', label: 'Lombok Tengah' },
                        { name: 'Lombok Timur', label: 'Lombok Timur' },
                        { name: 'Lombok Utara', label: 'Lombok Utara' }
                      ].map(kab => (
                        <button
                          key={kab.name}
                          onClick={() => setSelectedKabupaten(kab.name)}
                          className={`px-2 py-2.5 rounded-lg text-[10px] font-bold text-center border transition-all truncate shadow-sm cursor-pointer ${
                            selectedKabupaten === kab.name
                              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-teal-950 border-amber-600'
                              : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-100 dark:border-slate-700 hover:bg-teal-50 dark:hover:bg-teal-950/20'
                          }`}
                        >
                          {kab.label}
                        </button>
                      ))}
                    </div>
                    {/* Decorative simple Lombok outline block */}
                    <div className="absolute inset-0 bg-teal-600/5 dark:bg-teal-400/5 rounded-xl -z-0 pointer-events-none"></div>
                  </div>

                  {/* Pulau Sumbawa Section */}
                  <div className="w-3/5 h-full relative flex flex-col justify-end">
                    <div className="text-center font-bold text-[10px] tracking-wider text-teal-600/70 dark:text-teal-400/50 uppercase mb-2">PULAU SUMBAWA</div>
                    
                    {/* Grid representing Sumbawa districts */}
                    <div className="grid grid-cols-3 gap-1.5 relative z-10">
                      {[
                        { name: 'Sumbawa Barat', label: 'Sumbawa Barat' },
                        { name: 'Sumbawa', label: 'Sumbawa' },
                        { name: 'Dompu', label: 'Dompu' },
                        { name: 'Bima', label: 'Bima' },
                        { name: 'Kota Bima', label: 'Kota Bima' }
                      ].map(kab => (
                        <button
                          key={kab.name}
                          onClick={() => setSelectedKabupaten(kab.name)}
                          className={`px-1 py-2.5 rounded-lg text-[10px] font-bold text-center border transition-all truncate shadow-sm cursor-pointer ${
                            selectedKabupaten === kab.name
                              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-teal-950 border-amber-600'
                              : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-100 dark:border-slate-700 hover:bg-teal-50 dark:hover:bg-teal-950/20'
                          }`}
                        >
                          {kab.label}
                        </button>
                      ))}
                    </div>
                    {/* Decorative simple Sumbawa outline block */}
                    <div className="absolute inset-0 bg-emerald-600/5 dark:bg-emerald-400/5 rounded-xl -z-0 pointer-events-none"></div>
                  </div>

                </div>

                {/* Reset button to show all province statistics */}
                <button 
                  onClick={() => setSelectedKabupaten('Seluruh NTB')}
                  className={`absolute top-2 right-2 px-3 py-1 rounded-full text-[10px] font-extrabold border uppercase tracking-wider transition-all cursor-pointer ${
                    selectedKabupaten === 'Seluruh NTB'
                      ? 'bg-teal-600 text-white border-teal-500 shadow-sm'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-slate-700'
                  }`}
                >
                  Lihat Seluruh NTB
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 justify-center text-xs text-gray-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Indikator terpilih saat ini: <strong className="text-teal-700 dark:text-teal-400 font-bold">{selectedKabupaten}</strong></span>
          </div>
        </div>

        {/* Selected Kabupaten Statistics Summary */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-1.5">
              <span>Statistik Regional</span>
            </h4>
            <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900 px-2 py-0.5 rounded-md inline-block mt-1">
              {selectedKabupaten}
            </span>
          </div>

          <div className="space-y-4 my-6 flex-1 flex flex-col justify-center">
            {/* Ormas count */}
            <div className="flex items-center justify-between border-b border-gray-50 dark:border-slate-700/50 pb-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600" /> Ormas Terdaftar
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{filteredOrmasCount}</span>
            </div>

            {/* Parpol count */}
            <div className="flex items-center justify-between border-b border-gray-50 dark:border-slate-700/50 pb-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-amber-500" /> Jumlah Parpol
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{filteredParpolCount}</span>
            </div>

            {/* Konflik count */}
            <div className="flex items-center justify-between border-b border-gray-50 dark:border-slate-700/50 pb-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" /> Konflik Sosial
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{filteredKonflikCount}</span>
            </div>

            {/* Wasbang count */}
            <div className="flex items-center justify-between border-b border-gray-50 dark:border-slate-700/50 pb-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-500" /> Sosialisasi Wasbang
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{filteredWasbangCount}</span>
            </div>

            {/* Pentik count */}
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-500" /> Pendidikan Politik
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{filteredPentikCount}</span>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-slate-900/60 p-3 rounded-xl border border-gray-100/50 dark:border-slate-700/30">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">Catatan Regional:</span>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-normal">
              {filteredKonflikCount > 0 
                ? `Terdapat ${filteredKonflikCount} laporan konflik sosial yang sedang dimonitor untuk pencegahan dan penanggulangan terpadu.` 
                : 'Kondisi sosial wilayah terpilih berada dalam kategori sangat aman, kondusif, dan rukun.'}
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Custom SVG Chart Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Chart 1: Ormas per Kabupaten/Kota */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
          <h4 className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider mb-4 flex items-center justify-between">
            <span>Ormas per Kabupaten/Kota</span>
            <span className="text-[10px] font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 px-2 py-0.5 rounded">Bar Chart</span>
          </h4>
          <div className="space-y-2.5">
            {kabupatenList.map(kab => {
              const count = ormasPerKab[kab] || 0;
              const maxCount = Math.max(...Object.values(ormasPerKab), 1);
              const percent = (count / maxCount) * 100;
              return (
                <div key={kab} className="group">
                  <div className="flex justify-between items-center text-[11px] mb-1">
                    <span className="text-gray-600 dark:text-gray-400 group-hover:text-gray-950 dark:group-hover:text-white font-medium transition-colors">{kab}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{count}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-50 dark:bg-slate-900/60 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full transition-all duration-500" 
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Anggaran vs Realisasi per Bidang */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Keuangan Anggaran per Bidang</span>
              <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded">Financials</span>
            </h4>
            <div className="space-y-4">
              {Object.keys(budgetBidang).map(bidang => {
                const bVal = budgetBidang[bidang].budget;
                const rVal = budgetBidang[bidang].real;
                const percent = bVal > 0 ? (rVal / bVal) * 100 : 0;
                return (
                  <div key={bidang} className="border-b border-gray-50 dark:border-slate-700/30 pb-3 last:border-0 last:pb-0">
                    <span className="text-[11px] font-bold text-gray-800 dark:text-slate-300 block mb-1">{bidang}</span>
                    <div className="flex justify-between items-center text-[10px] text-gray-400 mb-1">
                      <span>Pagu: {formatIDR(bVal)}</span>
                      <span className="text-amber-600 dark:text-amber-400 font-bold">Realisasi: {percent.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-50 dark:bg-slate-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full" 
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="bg-teal-50/20 dark:bg-slate-900/30 p-3 rounded-xl border border-teal-100/10 mt-4 text-[11px] text-teal-600 dark:text-teal-400 text-center font-semibold">
            Penyerapan Anggaran Terpantau Efektif
          </div>
        </div>

        {/* Chart 3: Konflik Sosial per Kabupaten */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
          <h4 className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider mb-4 flex items-center justify-between">
            <span>Sebaran Konflik per Kabupaten</span>
            <span className="text-[10px] font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 rounded">Risk Level</span>
          </h4>
          <div className="space-y-2.5">
            {kabupatenList.map(kab => {
              const count = konflikPerKab[kab] || 0;
              const maxCount = Math.max(...Object.values(konflikPerKab), 1);
              const percent = (count / maxCount) * 100;
              return (
                <div key={kab} className="group">
                  <div className="flex justify-between items-center text-[11px] mb-1">
                    <span className="text-gray-600 dark:text-gray-400 group-hover:text-rose-600 transition-colors font-medium">{kab}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{count} Kasus</span>
                  </div>
                  <div className="w-full h-2 bg-gray-50 dark:bg-slate-900/60 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        count > 0 ? 'bg-rose-500' : 'bg-gray-200 dark:bg-slate-700'
                      }`} 
                      style={{ width: `${count > 0 ? percent : 100}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Bottom Section: Recent Activities & Annual Data Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Recent Kegiatan / Conflict Logging summary */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-gray-800 dark:text-white flex items-center justify-between">
              <span>Ringkasan Data Kegiatan & Konflik Terbaru</span>
              <span className="text-xs text-teal-600 dark:text-teal-400 font-bold flex items-center gap-1 cursor-pointer">
                Semua Log <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </h4>
            <div className="space-y-4.5 mt-5">
              {/* Combine Wasbang, Konflik, Pentik for a chronological listing */}
              {[
                ...wasbang.map(w => ({ type: 'wasbang', date: w.tanggal, title: w.namaKegiatan, detail: `Peserta: ${w.peserta} orang - Kab. ${w.kabupaten}`, color: 'bg-sky-500' })),
                ...konflik.map(k => ({ type: 'konflik', date: k.tanggal, title: k.jenisKonflik, detail: `Status: ${k.status} - Kab. ${k.kabupaten}`, color: 'bg-rose-500' })),
                ...pentik.map(p => ({ type: 'pentik', date: p.tanggal, title: p.tema, detail: `Narasumber: ${p.narasumber} - Kab. ${p.kabupaten}`, color: 'bg-purple-500' }))
              ]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 4)
                .map((log, index) => (
                  <div key={index} className="flex gap-4 items-start group">
                    <div className="relative mt-1">
                      <div className={`w-3.5 h-3.5 rounded-full ${log.color} ring-4 ring-white dark:ring-slate-800 z-10 relative`}></div>
                      {index < 3 && <div className="absolute top-3.5 left-1.5 w-0.5 h-12 bg-gray-100 dark:bg-slate-700 -z-0"></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h5 className="text-[13px] font-bold text-gray-800 dark:text-white truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                          {log.title}
                        </h5>
                        <span className="text-[10px] text-gray-400 font-medium flex-shrink-0 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {log.date}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">{log.detail}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Year Statistics Widget */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-gray-800 dark:text-white">Statistik Tahunan NTB</h4>
            <span className="text-xs text-gray-400 block mt-1">Metrik historis kinerja pelaksanaan 2026.</span>
          </div>

          <div className="space-y-4 my-6">
            <div className="p-3 bg-teal-50/30 dark:bg-teal-950/15 rounded-xl border border-teal-100/10 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-teal-600 dark:text-teal-400 uppercase tracking-widest font-extrabold">Partisipasi Ormas</span>
                <p className="text-lg font-extrabold text-gray-800 dark:text-white mt-0.5">85% Aktif</p>
              </div>
              <TrendingUp className="w-6 h-6 text-teal-600" />
            </div>

            <div className="p-3 bg-amber-50/30 dark:bg-amber-950/15 rounded-xl border border-amber-100/10 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase tracking-widest font-extrabold">Penyelesaian Konflik</span>
                <p className="text-lg font-extrabold text-gray-800 dark:text-white mt-0.5">
                  {((konflik.filter(k => k.status === 'Selesai').length / Math.max(1, konflik.length)) * 100).toFixed(0)}% Selesai
                </p>
              </div>
              <TrendingUp className="w-6 h-6 text-amber-600" />
            </div>
          </div>

          <div className="text-center text-[10px] text-gray-400 uppercase tracking-wider font-semibold border-t border-gray-100 dark:border-slate-700/60 pt-3">
            Sistem Informasi Kesbangpoldagri
          </div>
        </div>

      </div>

    </div>
  );
}
