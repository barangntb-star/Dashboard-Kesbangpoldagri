import React from 'react';
import { 
  Search, ArrowUpDown, ChevronLeft, ChevronRight, Download, 
  Printer, Edit, Trash2, Plus, Filter, FileSpreadsheet, Eye
} from 'lucide-react';
import { UserRole } from '../types';

interface ModuleTableProps {
  moduleName: string;
  data: any[];
  columns: { key: string; label: string; format?: (val: any) => React.ReactNode }[];
  userRole: UserRole;
  onAddClick: () => void;
  onEditClick: (item: any) => void;
  onDeleteClick: (id: string) => void;
  onViewClick?: (item: any) => void;
  onDetailClick?: (item: any) => void;
  kabupatenFilterEnabled?: boolean;
}

export default function ModuleTable({
  moduleName, data, columns, userRole, onAddClick, onEditClick, onDeleteClick, onViewClick, onDetailClick, kabupatenFilterEnabled = true
}: ModuleTableProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedKabupaten, setSelectedKabupaten] = React.useState('Semua');
  const [selectedStatus, setSelectedStatus] = React.useState('Semua');
  const [selectedBidang, setSelectedBidang] = React.useState('Semua');
  const [sortKey, setSortKey] = React.useState('');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');
  
  // Pagination
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 6;

  // Reset page when search or filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedKabupaten, selectedStatus, selectedBidang]);

  // Unique kabupaten list for filters
  const kabupatenOptions = ['Semua', ...Array.from(new Set(data.map(item => item.kabupaten).filter(Boolean)))];
  // Unique status list
  const statusOptions = ['Semua', ...Array.from(new Set(data.map(item => item.status).filter(Boolean)))];
  // Unique bidang list (primarily for Program & Kegiatan)
  const bidangOptions = ['Semua', ...Array.from(new Set(data.map(item => item.bidang).filter(Boolean)))];

  // Filtering logic
  const filteredData = data.filter(item => {
    // Search filter across major fields
    const searchString = JSON.stringify(item).toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());

    // Kabupaten filter
    const matchesKabupaten = selectedKabupaten === 'Semua' || item.kabupaten === selectedKabupaten;

    // Status filter
    const matchesStatus = selectedStatus === 'Semua' || item.status === selectedStatus;

    // Bidang filter
    const matchesBidang = selectedBidang === 'Semua' || item.bidang === selectedBidang;

    return matchesSearch && matchesKabupaten && matchesStatus && matchesBidang;
  });

  // Sorting logic
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortKey) return 0;
    let aVal = a[sortKey];
    let bVal = b[sortKey];

    // Handle string/number comparison
    if (typeof aVal === 'string') {
      return sortOrder === 'asc' 
        ? aVal.localeCompare(bVal) 
        : bVal.localeCompare(aVal);
    } else if (typeof aVal === 'number') {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return 0;
  });

  // Pagination slicing
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  // CSV/Excel Export simulation
  const exportToCSV = () => {
    const headerRow = columns.map(col => col.label).join(',');
    const rows = sortedData.map(item => {
      return columns.map(col => {
        let val = item[col.key];
        // Clean values for CSV syntax
        if (typeof val === 'string') {
          val = `"${val.replace(/"/g, '""')}"`;
        } else if (val === undefined || val === null) {
          val = '';
        }
        return val;
      }).join(',');
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headerRow, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `laporan_kesbangpol_${moduleName.toLowerCase().replace(/\s/g, '_')}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Elegant Print command (supports immediate PDF creation through print styling)
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <html>
        <head>
          <title>Laporan Badan Kesbangpoldagri NTB - ${moduleName}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
            h2 { color: #0d9488; text-align: center; margin-bottom: 5px; }
            h3 { text-align: center; font-weight: normal; margin-top: 0; font-size: 14px; color: #64748b; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #0d9488; color: white; text-align: left; padding: 12px; font-size: 12px; font-weight: bold; }
            td { border-bottom: 1px solid #e2e8f0; padding: 12px; font-size: 11px; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .footer { margin-top: 50px; text-align: right; font-size: 11px; color: #64748b; }
            .stamp { margin-top: 60px; display: inline-block; text-align: center; border-top: 1px solid #1e293b; width: 200px; padding-top: 5px; }
          </style>
        </head>
        <body>
          <h2>BADAN KESATUAN BANGSA DAN POLITIK DALAM NEGERI</h2>
          <h3 style="margin-bottom: 5px;">PROVINSI NUSA TENGGARA BARAT</h3>
          <p style="text-align: center; font-size: 12px; color: #475569; margin-bottom: 30px;">
            Laporan Data ${moduleName} - Tahun Anggaran 2026
          </p>
          <table>
            <thead>
              <tr>
                ${columns.map(col => `<th>${col.label}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${sortedData.map(item => `
                <tr>
                  ${columns.map(col => `<td>${item[col.key] !== undefined && item[col.key] !== null ? item[col.key] : '-'}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>Mataram, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p style="font-weight: bold; margin-bottom: 80px;">Kepala Badan Kesbangpoldagri Provinsi NTB</p>
            <div class="stamp">
              <strong>Drs. H. Abdul Hakim, MM</strong><br>
              NIP. 19691231 199403 1 010
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const isOperator = userRole === 'Operator Bidang';
  const isPimpinan = userRole === 'Pimpinan';
  const isAdmin = userRole === 'Administrator';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
      
      {/* Table Action Controls Header */}
      <div className="p-5 border-b border-gray-100 dark:border-slate-700/60 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{moduleName}</h3>
            <p className="text-xs text-gray-400 mt-0.5">Total data: <strong className="text-teal-600 font-bold">{totalItems} entri</strong></p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Download Excel button */}
            <button
              onClick={exportToCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 rounded-xl text-xs font-semibold transition-all"
              title="Unduh format Excel / CSV"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden md:inline">Ekspor Excel</span>
            </button>

            {/* Print / PDF button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 bg-sky-50 dark:bg-sky-950/20 hover:bg-sky-100 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-900/30 rounded-xl text-xs font-semibold transition-all"
              title="Cetak Laporan / Simpan PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden md:inline">Cetak PDF</span>
            </button>

            {/* Add data button (only allowed for Administrator & Operator Bidang) */}
            {(isAdmin || isOperator) && (
              <button
                onClick={onAddClick}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-500/10 transition-all"
                id="btn-add-entry"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Data</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Filters Area */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 dark:bg-slate-900/40 p-3 rounded-xl border border-gray-100/30 dark:border-slate-700/40">
          
          {/* Main search input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari kata kunci..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-teal-500 dark:focus:border-teal-400 text-gray-700 dark:text-gray-300"
              id="table-search-input"
            />
          </div>

          {/* Kabupaten filter */}
          {kabupatenFilterEnabled && kabupatenOptions.length > 2 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Kab:</span>
              <select
                value={selectedKabupaten}
                onChange={(e) => setSelectedKabupaten(e.target.value)}
                className="flex-1 p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs outline-none text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                {kabupatenOptions.map(kab => (
                  <option key={kab} value={kab}>{kab === 'Semua' ? 'Semua Wilayah' : kab}</option>
                ))}
              </select>
            </div>
          )}

          {/* Status filter (if status column exists) */}
          {statusOptions.length > 2 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="flex-1 p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs outline-none text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                {statusOptions.map(stat => (
                  <option key={stat} value={stat}>{stat === 'Semua' ? 'Semua Status' : stat}</option>
                ))}
              </select>
            </div>
          )}

          {/* Bidang filter (if bidang column exists) */}
          {bidangOptions.length > 2 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Bidang:</span>
              <select
                value={selectedBidang}
                onChange={(e) => setSelectedBidang(e.target.value)}
                className="flex-1 p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs outline-none text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                {bidangOptions.map(bid => (
                  <option key={bid} value={bid}>{bid === 'Semua' ? 'Semua Bidang' : bid}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/75 dark:bg-slate-900/60 border-b border-gray-100 dark:border-slate-700/60">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 tracking-wider cursor-pointer select-none hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.label}</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400/80" />
                  </div>
                </th>
              ))}
              {/* Action column header */}
              <th className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-150 dark:divide-slate-800">
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <tr 
                  key={item.id || index}
                  className="hover:bg-teal-50/10 dark:hover:bg-slate-700/25 transition-colors group"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="p-4 text-xs text-gray-700 dark:text-gray-300 font-medium">
                      {col.format ? col.format(item[col.key]) : (item[col.key] !== undefined && item[col.key] !== null ? item[col.key] : '-')}
                    </td>
                  ))}
                  
                  {/* Actions Column */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      
                      {/* Document View / Link */}
                      {(item.dokumenSkt || item.fileUrl || item.dokumentasi || item.foto) && (
                        <a
                          href={item.dokumenSkt || item.fileUrl || item.dokumentasi || item.foto}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/20 rounded-lg transition-all"
                          title="Lihat Berkas / Dokumentasi"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                      )}

                      {/* Detail triggers if present */}
                      {onDetailClick && (
                        <button
                          onClick={() => onDetailClick(item)}
                          className="p-1.5 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/20 rounded-lg transition-all"
                          title="Lihat Rincian Lengkap"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}

                      {/* Edit Button (Allowed for Admin & Operator) */}
                      {(isAdmin || isOperator) && (
                        <button
                          onClick={() => onEditClick(item)}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-lg transition-all"
                          title="Ubah Data"
                          id={`btn-edit-${item.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}

                      {/* Delete Button (Strictly restricted to Administrator) */}
                      {isAdmin && (
                        <button
                          onClick={() => onDeleteClick(item.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all"
                          title="Hapus Data Selamanya"
                          id={`btn-delete-${item.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="p-8 text-center text-xs text-gray-400 font-semibold uppercase tracking-wider">
                  Belum ada data tersedia atau pencarian tidak cocok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer Controls */}
      {totalPages > 1 && (
        <div className="p-4 bg-gray-50/75 dark:bg-slate-900/40 border-t border-gray-100 dark:border-slate-700/60 flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Menampilkan <strong className="text-teal-600 font-bold">{startIndex + 1}</strong> hingga <strong className="text-teal-600 font-bold">{Math.min(startIndex + itemsPerPage, totalItems)}</strong> dari <strong className="text-teal-600 font-bold">{totalItems}</strong> entri
          </span>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 hover:bg-teal-50 dark:hover:bg-teal-950/20 disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="text-xs text-gray-600 dark:text-gray-300 font-bold px-3">
              Halaman {currentPage} dari {totalPages}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 hover:bg-teal-50 dark:hover:bg-teal-950/20 disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
