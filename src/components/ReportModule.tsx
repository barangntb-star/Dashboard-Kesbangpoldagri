import React from 'react';
import { 
  FileText, Calendar, MapPin, Briefcase, Printer, FileSpreadsheet, 
  Search, CheckCircle, AlertTriangle, TrendingUp, DollarSign, Award, Users 
} from 'lucide-react';
import { Ormas, WawasanKebangsaan, KonflikSosial, ProgramKegiatan } from '../types';
import { KABUPATEN_LIST } from '../utils/mockData';

interface ReportModuleProps {
  ormas: Ormas[];
  wasbang: WawasanKebangsaan[];
  konflik: KonflikSosial[];
  programKegiatan: ProgramKegiatan[];
}

export default function ReportModule({ ormas, wasbang, konflik, programKegiatan }: ReportModuleProps) {
  const [selectedReportType, setSelectedReportType] = React.useState<'ormas' | 'wasbang' | 'konflik' | 'program'>('ormas');
  const [selectedKabupaten, setSelectedKabupaten] = React.useState('Semua');
  const [selectedTahun, setSelectedTahun] = React.useState('2026');
  const [selectedBidang, setSelectedBidang] = React.useState('Semua');

  // Format currency helper
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  // Compile data based on selection and filters
  const getCompiledData = () => {
    if (selectedReportType === 'ormas') {
      return ormas.filter(item => {
        const matchesKab = selectedKabupaten === 'Semua' || item.kabupaten === selectedKabupaten;
        // Seeded ormas usually active
        return matchesKab;
      });
    }

    if (selectedReportType === 'wasbang') {
      return wasbang.filter(item => {
        const matchesKab = selectedKabupaten === 'Semua' || item.kabupaten === selectedKabupaten;
        const matchesTahun = selectedTahun === 'Semua' || item.tanggal.startsWith(selectedTahun);
        return matchesKab && matchesTahun;
      });
    }

    if (selectedReportType === 'konflik') {
      return konflik.filter(item => {
        const matchesKab = selectedKabupaten === 'Semua' || item.kabupaten === selectedKabupaten;
        const matchesTahun = selectedTahun === 'Semua' || item.tanggal.startsWith(selectedTahun);
        return matchesKab && matchesTahun;
      });
    }

    // Program & Kegiatan
    return programKegiatan.filter(item => {
      const matchesBidang = selectedBidang === 'Semua' || item.bidang === selectedBidang;
      const matchesTahun = selectedTahun === 'Semua' || item.tahun === selectedTahun;
      return matchesBidang && matchesTahun;
    });
  };

  const compiledList = getCompiledData();

  // Excel simulation download
  const handleExportExcel = () => {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (selectedReportType === 'ormas') {
      headers = ['Nama Ormas', 'No SKT', 'Ketua', 'Kabupaten', 'Status'];
      rows = compiledList.map((item: any) => [item.nama, item.noSkt, item.ketua, item.kabupaten, item.status]);
    } else if (selectedReportType === 'wasbang') {
      headers = ['Nama Kegiatan', 'Tanggal', 'Kabupaten', 'Instansi', 'Anggaran', 'Realisasi'];
      rows = compiledList.map((item: any) => [item.namaKegiatan, item.tanggal, item.kabupaten, item.instansi, item.anggaran.toString(), item.realisasi.toString()]);
    } else if (selectedReportType === 'konflik') {
      headers = ['Jenis Konflik', 'Lokasi', 'Kabupaten', 'Kecamatan', 'Status'];
      rows = compiledList.map((item: any) => [item.jenisKonflik, item.lokasi, item.kabupaten, item.kecamatan, item.status]);
    } else {
      headers = ['Program', 'Kegiatan', 'Bidang', 'Anggaran', 'Realisasi', 'Persentase'];
      rows = compiledList.map((item: any) => [item.program, item.kegiatan, item.bidang, item.anggaran.toString(), item.realisasi.toString(), `${item.persentase}%`]);
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rekap_laporan_${selectedReportType}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Immediate Print styling trigger
  const handlePrintPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let headersHtml = '';
    let rowsHtml = '';
    let summaryHtml = '';

    if (selectedReportType === 'ormas') {
      headersHtml = `<th>Nama Ormas</th><th>No SKT</th><th>Ketua</th><th>Kabupaten</th><th>Status</th>`;
      rowsHtml = compiledList.map((item: any) => `
        <tr>
          <td>${item.nama}</td><td>${item.noSkt}</td><td>${item.ketua}</td><td>${item.kabupaten}</td><td>${item.status}</td>
        </tr>
      `).join('');
      summaryHtml = `<p>Total Organisasi Kemasyarakatan Rekap: <strong>${compiledList.length} Ormas</strong></p>`;
    } else if (selectedReportType === 'wasbang') {
      headersHtml = `<th>Nama Kegiatan</th><th>Tanggal</th><th>Kabupaten</th><th>Penyelenggara</th><th>Anggaran</th><th>Realisasi</th>`;
      rowsHtml = compiledList.map((item: any) => `
        <tr>
          <td>${item.namaKegiatan}</td><td>${item.tanggal}</td><td>${item.kabupaten}</td><td>${item.instansi}</td>
          <td>${formatIDR(item.anggaran)}</td><td>${formatIDR(item.realisasi)}</td>
        </tr>
      `).join('');
      const totBudget = compiledList.reduce((acc, curr: any) => acc + curr.anggaran, 0);
      const totReal = compiledList.reduce((acc, curr: any) => acc + curr.realisasi, 0);
      summaryHtml = `
        <p>Total Kegiatan: <strong>${compiledList.length} Pelaksanaan</strong></p>
        <p>Total Alokasi Pagu: <strong>${formatIDR(totBudget)}</strong></p>
        <p>Total Realisasi Anggaran: <strong>${formatIDR(totReal)} (${totBudget > 0 ? ((totReal/totBudget)*100).toFixed(1) : 0}%)</strong></p>
      `;
    } else if (selectedReportType === 'konflik') {
      headersHtml = `<th>Jenis Sengketa / Konflik</th><th>Lokasi</th><th>Kabupaten</th><th>Kecamatan</th><th>Status Penanganan</th>`;
      rowsHtml = compiledList.map((item: any) => `
        <tr>
          <td>${item.jenisKonflik}</td><td>${item.lokasi}</td><td>${item.kabupaten}</td><td>${item.kecamatan}</td>
          <td><strong>${item.status}</strong></td>
        </tr>
      `).join('');
      summaryHtml = `
        <p>Total Kejadian Terdata: <strong>${compiledList.length} Konflik Sosial</strong></p>
        <p>Selesai Dimediasi: <strong>${compiledList.filter((k: any) => k.status === 'Selesai').length}</strong></p>
        <p>Sedang Penanganan: <strong>${compiledList.filter((k: any) => k.status !== 'Selesai').length}</strong></p>
      `;
    } else {
      headersHtml = `<th>Program</th><th>Kegiatan</th><th>Bidang</th><th>Anggaran Pagu</th><th>Realisasi</th><th>Realisasi %</th>`;
      rowsHtml = compiledList.map((item: any) => `
        <tr>
          <td>${item.program}</td><td>${item.kegiatan}</td><td>${item.bidang}</td>
          <td>${formatIDR(item.anggaran)}</td><td>${formatIDR(item.realisasi)}</td>
          <td>${item.persentase}%</td>
        </tr>
      `).join('');
      const totBudget = compiledList.reduce((acc, curr: any) => acc + curr.anggaran, 0);
      const totReal = compiledList.reduce((acc, curr: any) => acc + curr.realisasi, 0);
      summaryHtml = `
        <p>Total Program & Kegiatan Terdata: <strong>${compiledList.length} Program</strong></p>
        <p>Total Pagu Anggaran Bidang: <strong>${formatIDR(totBudget)}</strong></p>
        <p>Total Realisasi Terserap: <strong>${formatIDR(totReal)} (${totBudget > 0 ? ((totReal/totBudget)*100).toFixed(1) : 0}%)</strong></p>
      `;
    }

    const htmlContent = `
      <html>
        <head>
          <title>Laporan Analitikal Kesbangpoldagri Provinsi NTB</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
            .header { text-align: center; border-bottom: 3px double #0d9488; padding-bottom: 15px; margin-bottom: 25px; }
            .header h1 { font-size: 20px; margin: 0; color: #111827; }
            .header h2 { font-size: 15px; margin: 5px 0 0 0; color: #475569; font-weight: normal; }
            .meta-info { margin-bottom: 20px; font-size: 12px; color: #475569; display: flex; justify-content: space-between; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th { background-color: #0d9488; color: white; text-align: left; padding: 10px; font-size: 11px; font-weight: bold; }
            td { border-bottom: 1px solid #e2e8f0; padding: 10px; font-size: 11px; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .summary-box { background-color: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 8px; padding: 15px; margin-top: 30px; font-size: 12px; }
            .summary-box p { margin: 5px 0; }
            .footer { margin-top: 60px; text-align: right; font-size: 12px; }
            .signature { margin-top: 70px; display: inline-block; text-align: center; border-top: 1px solid #1e293b; width: 220px; padding-top: 5px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>PEMERINTAH PROVINSI NUSA TENGGARA BARAT</h1>
            <h1 style="font-size: 22px; font-weight: bold; margin-top: 3px; color: #0d9488;">BADAN KESATUAN BANGSA DAN POLITIK DALAM NEGERI</h1>
            <h2>Jl. Pejanggik No. 9 Mataram, NTB - Telp (0370) 621745</h2>
          </div>
          
          <h2 style="text-align: center; font-size: 15px; text-transform: uppercase; margin-bottom: 20px;">
            REKAPITULASI LAPORAN ANALISIS ${selectedReportType.toUpperCase()}
          </h2>

          <div class="meta-info">
            <span>Filter Wilayah: <strong>${selectedKabupaten}</strong></span>
            <span>Tahun Anggaran: <strong>${selectedTahun}</strong></span>
            <span>Tanggal Cetak: <strong>${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></span>
          </div>

          <table>
            <thead>
              <tr>${headersHtml}</tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="summary-box">
            <h3 style="margin-top: 0; color: #0f766e; font-size: 13px;">RINGKASAN METRIK LAPORAN</h3>
            ${summaryHtml}
          </div>

          <div class="footer">
            <p>Mataram, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p style="font-weight: bold; margin-bottom: 80px;">Kepala Badan Kesbangpoldagri Provinsi NTB</p>
            <div class="signature">
              Drs. H. Abdul Hakim, MM<br>
              <span style="font-weight: normal; font-size: 11px;">NIP. 19691231 199403 1 010</span>
            </div>
          </div>

          <script>window.print();</script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Pusat Laporan & Rekapitulasi</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Modul kompilasi, penyaringan mendalam, cetak fisik, dan ekspor data resmi Badan Kesbangpoldagri NTB.
        </p>
      </div>

      {/* Grid Filter and Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        
        {/* Left Control Panel */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-2">Pilih Jenis Laporan</label>
            <div className="space-y-1.5">
              {[
                { id: 'ormas', label: 'Organisasi Kemasyarakatan', icon: Users },
                { id: 'wasbang', label: 'Wawasan & Bela Negara', icon: Award },
                { id: 'konflik', label: 'Konflik & Kerawanan', icon: AlertTriangle },
                { id: 'program', label: 'Program, Kegiatan & Realisasi', icon: Briefcase }
              ].map((btn) => {
                const IconComponent = btn.icon;
                const isSel = selectedReportType === btn.id;
                return (
                  <button
                    key={btn.id}
                    onClick={() => setSelectedReportType(btn.id as any)}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-left transition-all ${
                      isSel 
                        ? 'bg-teal-600 text-white shadow-md shadow-teal-500/10' 
                        : 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-900/60 hover:bg-gray-100 dark:hover:bg-slate-900'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{btn.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* District Filter (Conditional) */}
          {selectedReportType !== 'program' && (
            <div>
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1.5">Wilayah Kabupaten/Kota</label>
              <select
                value={selectedKabupaten}
                onChange={(e) => setSelectedKabupaten(e.target.value)}
                className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-700 dark:text-white outline-none cursor-pointer"
              >
                <option value="Semua">Semua Kabupaten/Kota</option>
                {KABUPATEN_LIST.map(kab => (
                  <option key={kab} value={kab}>{kab}</option>
                ))}
              </select>
            </div>
          )}

          {/* Bidang Filter (Only for Program) */}
          {selectedReportType === 'program' && (
            <div>
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1.5">Sektor Bidang Pengelola</label>
              <select
                value={selectedBidang}
                onChange={(e) => setSelectedBidang(e.target.value)}
                className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-700 dark:text-white outline-none cursor-pointer"
              >
                <option value="Semua">Semua Bidang</option>
                <option value="Sekretariat">Sekretariat</option>
                <option value="Ideologi & Waspas">Ideologi & Waspas</option>
                <option value="Poldagri">Poldagri</option>
                <option value="Ormas">Ormas</option>
              </select>
            </div>
          )}

          {/* Year Filter */}
          <div>
            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1.5">Tahun Analisis</label>
            <select
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(e.target.value)}
              className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-700 dark:text-white outline-none cursor-pointer"
            >
              <option value="Semua">Semua Tahun</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>

          {/* Action triggers */}
          <div className="pt-2 grid grid-cols-2 gap-2">
            <button
              onClick={handleExportExcel}
              className="flex items-center justify-center gap-1.5 p-2.5 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel</span>
            </button>
            <button
              onClick={handlePrintPDF}
              className="flex items-center justify-center gap-1.5 p-2.5 bg-sky-50 dark:bg-sky-950/20 hover:bg-sky-100 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-900/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak/PDF</span>
            </button>
          </div>
        </div>

        {/* Right Preview Sheet */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-50 dark:border-slate-700 pb-3 mb-4">
              <div>
                <h4 className="text-sm font-bold text-gray-800 dark:text-white">Lembar Pra-Tinjau Laporan</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">Menunjukkan data tersaring yang siap dicetak.</p>
              </div>
              <span className="text-xs font-extrabold text-teal-600 bg-teal-50 dark:bg-teal-950/40 px-3 py-1 rounded-full border border-teal-100 dark:border-teal-900">
                {compiledList.length} Entri Ditemukan
              </span>
            </div>

            {/* Quick KPI indicators based on Report Type */}
            {selectedReportType === 'program' && compiledList.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                <div className="p-3 bg-teal-50/40 dark:bg-teal-950/15 rounded-xl border border-teal-100/10">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Total Alokasi Pagu</span>
                  <p className="text-sm font-extrabold text-gray-800 dark:text-white mt-1">
                    {formatIDR(compiledList.reduce((acc, curr: any) => acc + (curr.anggaran || 0), 0))}
                  </p>
                </div>
                <div className="p-3 bg-amber-50/40 dark:bg-amber-950/15 rounded-xl border border-amber-100/10">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Realisasi Terserap</span>
                  <p className="text-sm font-extrabold text-gray-800 dark:text-white mt-1">
                    {formatIDR(compiledList.reduce((acc, curr: any) => acc + (curr.realisasi || 0), 0))}
                  </p>
                </div>
                <div className="p-3 bg-sky-50/40 dark:bg-sky-950/15 rounded-xl border border-sky-100/10">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Persentase Rata-Rata</span>
                  <p className="text-sm font-extrabold text-gray-800 dark:text-white mt-1">
                    {(compiledList.reduce((acc, curr: any) => acc + (curr.persentase || 0), 0) / compiledList.length).toFixed(1)}%
                  </p>
                </div>
              </div>
            )}

            {/* Table layout preview */}
            <div className="overflow-x-auto border border-gray-100 dark:border-slate-700 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 dark:bg-slate-900/60 border-b border-gray-100 dark:border-slate-700">
                    {selectedReportType === 'ormas' && (
                      <>
                        <th className="p-3 text-[10px] font-bold text-gray-400 uppercase">Nama Ormas</th>
                        <th className="p-3 text-[10px] font-bold text-gray-400 uppercase">No SKT</th>
                        <th className="p-3 text-[10px] font-bold text-gray-400 uppercase">Ketua</th>
                        <th className="p-3 text-[10px] font-bold text-gray-400 uppercase">Kabupaten</th>
                      </>
                    )}
                    {selectedReportType === 'wasbang' && (
                      <>
                        <th className="p-3 text-[10px] font-bold text-gray-400 uppercase">Nama Kegiatan</th>
                        <th className="p-3 text-[10px] font-bold text-gray-400 uppercase">Tanggal</th>
                        <th className="p-3 text-[10px] font-bold text-gray-400 uppercase">Kabupaten</th>
                        <th className="p-3 text-[10px] font-bold text-gray-400 uppercase">Penyelenggara</th>
                      </>
                    )}
                    {selectedReportType === 'konflik' && (
                      <>
                        <th className="p-3 text-[10px] font-bold text-gray-400 uppercase">Jenis Sengketa</th>
                        <th className="p-3 text-[10px] font-bold text-gray-400 uppercase">Kabupaten</th>
                        <th className="p-3 text-[10px] font-bold text-gray-400 uppercase">Kecamatan</th>
                        <th className="p-3 text-[10px] font-bold text-gray-400 uppercase">Status</th>
                      </>
                    )}
                    {selectedReportType === 'program' && (
                      <>
                        <th className="p-3 text-[10px] font-bold text-gray-400 uppercase">Kegiatan</th>
                        <th className="p-3 text-[10px] font-bold text-gray-400 uppercase">Bidang</th>
                        <th className="p-3 text-[10px] font-bold text-gray-400 uppercase">Pagu</th>
                        <th className="p-3 text-[10px] font-bold text-gray-400 uppercase">Selesai %</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {compiledList.slice(0, 5).map((item, index) => (
                    <tr key={index} className="hover:bg-teal-50/5 dark:hover:bg-slate-700/10">
                      {selectedReportType === 'ormas' && (
                        <>
                          <td className="p-3 text-[11px] font-semibold text-gray-800 dark:text-gray-300">{item.nama}</td>
                          <td className="p-3 text-[11px] text-gray-500">{item.noSkt}</td>
                          <td className="p-3 text-[11px] text-gray-500">{item.ketua}</td>
                          <td className="p-3 text-[11px] text-gray-500">{item.kabupaten}</td>
                        </>
                      )}
                      {selectedReportType === 'wasbang' && (
                        <>
                          <td className="p-3 text-[11px] font-semibold text-gray-800 dark:text-gray-300">{item.namaKegiatan}</td>
                          <td className="p-3 text-[11px] text-gray-500">{item.tanggal}</td>
                          <td className="p-3 text-[11px] text-gray-500">{item.kabupaten}</td>
                          <td className="p-3 text-[11px] text-gray-500">{item.instansi}</td>
                        </>
                      )}
                      {selectedReportType === 'konflik' && (
                        <>
                          <td className="p-3 text-[11px] font-semibold text-gray-800 dark:text-gray-300">{item.jenisKonflik}</td>
                          <td className="p-3 text-[11px] text-gray-500">{item.kabupaten}</td>
                          <td className="p-3 text-[11px] text-gray-500">{item.kecamatan}</td>
                          <td className="p-3 text-[11px] font-bold text-amber-600">{item.status}</td>
                        </>
                      )}
                      {selectedReportType === 'program' && (
                        <>
                          <td className="p-3 text-[11px] font-semibold text-gray-800 dark:text-gray-300">{item.kegiatan}</td>
                          <td className="p-3 text-[11px] text-gray-500">{item.bidang}</td>
                          <td className="p-3 text-[11px] text-gray-500">{formatIDR(item.anggaran)}</td>
                          <td className="p-3 text-[11px] text-gray-500 font-bold">{item.persentase}%</td>
                        </>
                      )}
                    </tr>
                  ))}
                  {compiledList.length > 5 && (
                    <tr>
                      <td colSpan={4} className="p-3.5 bg-gray-50 dark:bg-slate-900/40 text-center text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
                        ... Serta {compiledList.length - 5} baris data lainnya terlampir di lembar cetak penuh ...
                      </td>
                    </tr>
                  )}
                  {compiledList.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-xs text-gray-400 font-semibold uppercase tracking-wider">
                        Tidak ada data yang cocok dengan kriteria filter saat ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-amber-50/20 dark:bg-slate-900/40 p-4 rounded-xl border border-amber-100/10 mt-5">
            <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase tracking-widest font-extrabold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" /> Legitimasi Keabsahan Dokumen
            </span>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-normal">
              Seluruh rekapitulasi data yang dikeluarkan dari dashboard ini dilengkapi tanda tangan elektronik Kepala Badan secara kedinasan (QR Code / TTE BSrE) pada lembar salinan cetak penuh.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
