export const SPREADSHEET_SCHEMA = {
  Users: ['id', 'username', 'password', 'nama', 'role', 'bidang', 'avatar'],
  Ormas: ['id', 'nama', 'noSkt', 'tanggalSkt', 'ketua', 'alamat', 'kabupaten', 'kecamatan', 'kelurahan', 'noTelp', 'email', 'status', 'dokumenSkt', 'logo'],
  PartaiPolitik: ['id', 'nama', 'ketua', 'kabupaten', 'alamat', 'jumlahKursi', 'jumlahSuara', 'status', 'logo'],
  WawasanKebangsaan: ['id', 'namaKegiatan', 'tanggal', 'lokasi', 'kabupaten', 'peserta', 'instansi', 'narasumber', 'anggaran', 'realisasi', 'dokumentasi'],
  BelaNegara: ['id', 'namaKegiatan', 'tanggal', 'lokasi', 'kabupaten', 'peserta', 'instansi', 'output', 'anggaran', 'realisasi'],
  PendidikanPolitik: ['id', 'tema', 'tanggal', 'lokasi', 'kabupaten', 'narasumber', 'peserta', 'anggaran', 'realisasi'],
  KonflikSosial: ['id', 'jenisKonflik', 'lokasi', 'kabupaten', 'kecamatan', 'status', 'penyelesaian', 'dokumentasi', 'tanggal'],
  Penelitian: ['id', 'namaPeneliti', 'instansi', 'judulPenelitian', 'nomorSurat', 'status', 'tanggalMasuk', 'tanggalSelesai'],
  ProgramKegiatan: ['id', 'program', 'kegiatan', 'subKegiatan', 'bidang', 'anggaran', 'realisasi', 'persentase', 'status', 'tahun'],
  Berita: ['id', 'judul', 'isi', 'foto', 'penulis', 'tanggal'],
  Dokumen: ['id', 'namaDokumen', 'kategori', 'nomorDokumen', 'fileUrl', 'tanggalUpload', 'ukuran']
};

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * Google Apps Script Web API untuk Dashboard Kesbangpoldagri Provinsi NTB
 * 
 * Skenario Penggunaan:
 * 1. Buat Google Spreadsheet baru.
 * 2. Buat sheet-sheet berikut: Users, Ormas, PartaiPolitik, WawasanKebangsaan, BelaNegara, PendidikanPolitik, KonflikSosial, Penelitian, ProgramKegiatan, Berita, Dokumen.
 * 3. Isi baris pertama setiap sheet dengan header kolom yang sesuai (lihat dokumentasi di dashboard).
 * 4. Buka menu Ekstensi > Apps Script.
 * 5. Hapus kode bawaan, lalu paste kode di bawah ini.
 * 6. Sesuaikan konfigurasi (ID Folder Google Drive untuk upload jika ada).
 * 7. Klik 'Terapkan' (Deploy) > 'Penerapan Baru' (New Deployment).
 * 8. Pilih jenis 'Aplikasi Web' (Web App).
 * 9. Set 'Jalankan sebagai' ke 'Saya' (Me / email Anda).
 * 10. Set 'Siapa yang memiliki akses' ke 'Siapa saja' (Anyone).
 * 11. Klik Terapkan, berikan izin akses Google, lalu salin URL Aplikasi Web yang diberikan.
 * 12. Masukkan URL tersebut ke panel Pengaturan Integrasi di aplikasi ini.
 */

const DRIVE_FOLDER_ID = ""; // Kosongkan jika ingin menyimpannya di folder root Drive Anda, atau isi dengan ID Folder Drive khusus

function doGet(e) {
  const action = e.parameter.action;
  const sheetName = e.parameter.sheet;
  
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (action === "read") {
      if (!sheetName) throw new Error("Parameter 'sheet' wajib diisi untuk aksi 'read'.");
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) throw new Error("Sheet '" + sheetName + "' tidak ditemukan.");
      
      const data = getSheetData(sheet);
      return ContentService.createTextOutput(JSON.stringify({ success: true, data: data }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "dashboard") {
      const result = {};
      const sheets = ss.getSheets();
      sheets.forEach(function(s) {
        const name = s.getName();
        result[name] = getSheetData(s);
      });
      return ContentService.createTextOutput(JSON.stringify({ success: true, data: result }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Aksi tidak dikenal." }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  let postData;
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };
  
  try {
    postData = JSON.parse(e.postData.contents);
  } catch(err) {
    // Fallback jika dikirim lewat format x-www-form-urlencoded
    postData = e.parameter;
  }
  
  const action = postData.action;
  const sheetName = postData.sheet;
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (action === "login") {
      const username = postData.username;
      const password = postData.password;
      const sheet = ss.getSheetByName("Users");
      if (!sheet) throw new Error("Sheet 'Users' tidak ditemukan.");
      
      const users = getSheetData(sheet);
      const user = users.find(u => u.username === username && u.password === password);
      
      if (user) {
        // Jangan sertakan password di response
        const { password: _, ...safeUser } = user;
        return ContentService.createTextOutput(JSON.stringify({ success: true, user: safeUser }))
          .setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Username atau password salah." }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    if (action === "create") {
      if (!sheetName) throw new Error("Parameter 'sheet' wajib diisi.");
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) throw new Error("Sheet '" + sheetName + "' tidak ditemukan.");
      
      const payload = postData.data;
      if (!payload.id) {
        payload.id = Utilities.getUuid();
      }
      
      // Jika ada file upload berupa base64
      if (postData.file && postData.fileName) {
        const fileUrl = uploadFileToDrive(postData.file, postData.fileName, postData.fileType);
        payload.fileUrl = fileUrl; // atau sesuai kolom dokumen
        if (sheetName === "Ormas") payload.dokumenSkt = fileUrl;
        if (sheetName === "KonflikSosial") payload.dokumentasi = fileUrl;
        if (sheetName === "WawasanKebangsaan") payload.dokumentasi = fileUrl;
        if (sheetName === "Berita") payload.foto = fileUrl;
      }
      
      appendRowToSheet(sheet, payload);
      return ContentService.createTextOutput(JSON.stringify({ success: true, data: payload }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "update") {
      if (!sheetName) throw new Error("Parameter 'sheet' wajib diisi.");
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) throw new Error("Sheet '" + sheetName + "' tidak ditemukan.");
      
      const payload = postData.data;
      const id = payload.id;
      if (!id) throw new Error("ID data wajib disertakan untuk update.");
      
      // Jika ada file upload baru berupa base64
      if (postData.file && postData.fileName) {
        const fileUrl = uploadFileToDrive(postData.file, postData.fileName, postData.fileType);
        payload.fileUrl = fileUrl;
        if (sheetName === "Ormas") payload.dokumenSkt = fileUrl;
        if (sheetName === "KonflikSosial") payload.dokumentasi = fileUrl;
        if (sheetName === "WawasanKebangsaan") payload.dokumentasi = fileUrl;
        if (sheetName === "Berita") payload.foto = fileUrl;
      }
      
      updateRowInSheet(sheet, id, payload);
      return ContentService.createTextOutput(JSON.stringify({ success: true, data: payload }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "delete") {
      if (!sheetName) throw new Error("Parameter 'sheet' wajib diisi.");
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) throw new Error("Sheet '" + sheetName + "' tidak ditemukan.");
      
      const id = postData.id;
      if (!id) throw new Error("ID data wajib disertakan untuk delete.");
      
      deleteRowFromSheet(sheet, id);
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Data berhasil dihapus." }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Aksi tidak dikenal." }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// === HELPER FUNCTIONS ===

function getSheetData(sheet) {
  const range = sheet.getDataRange();
  const values = range.getValues();
  if (values.length <= 1) return [];
  
  const headers = values[0];
  const data = [];
  
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const item = {};
    let hasData = false;
    
    for (let j = 0; j < headers.length; j++) {
      const header = headers[j];
      let val = row[j];
      
      // Format tanggal
      if (val instanceof Date) {
        val = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
      }
      
      item[header] = val;
      if (val !== "") hasData = true;
    }
    
    if (hasData) {
      data.push(item);
    }
  }
  return data;
}

function appendRowToSheet(sheet, dataObj) {
  const headers = sheet.getDataRange().getValues()[0];
  const newRow = [];
  
  for (let i = 0; i < headers.length; i++) {
    const key = headers[i];
    newRow.push(dataObj[key] !== undefined ? dataObj[key] : "");
  }
  
  sheet.appendRow(newRow);
}

function updateRowInSheet(sheet, id, dataObj) {
  const range = sheet.getDataRange();
  const values = range.getValues();
  const headers = values[0];
  const idColIndex = headers.indexOf("id");
  
  if (idColIndex === -1) throw new Error("Kolom 'id' tidak ditemukan di sheet.");
  
  let rowIndex = -1;
  for (let i = 1; i < values.length; i++) {
    if (values[i][idColIndex].toString() === id.toString()) {
      rowIndex = i + 1; // 1-based index untuk range
      break;
    }
  }
  
  if (rowIndex === -1) throw new Error("Data dengan ID '" + id + "' tidak ditemukan.");
  
  for (let j = 0; j < headers.length; j++) {
    const key = headers[j];
    if (dataObj[key] !== undefined) {
      sheet.getRange(rowIndex, j + 1).setValue(dataObj[key]);
    }
  }
}

function deleteRowFromSheet(sheet, id) {
  const range = sheet.getDataRange();
  const values = range.getValues();
  const headers = values[0];
  const idColIndex = headers.indexOf("id");
  
  if (idColIndex === -1) throw new Error("Kolom 'id' tidak ditemukan.");
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][idColIndex].toString() === id.toString()) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  throw new Error("Data dengan ID '" + id + "' tidak ditemukan.");
}

function uploadFileToDrive(base64Data, fileName, mimeType) {
  try {
    const rawData = base64Data.split(",")[1] || base64Data;
    const decoded = Utilities.base64Decode(rawData);
    const blob = Utilities.newBlob(decoded, mimeType, fileName);
    
    let folder;
    if (DRIVE_FOLDER_ID) {
      folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    } else {
      folder = DriveApp.getRootFolder();
    }
    
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (err) {
    return "Error upload: " + err.toString();
  }
}

// Handle preflight OPTIONS request
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400"
    });
}
`;
