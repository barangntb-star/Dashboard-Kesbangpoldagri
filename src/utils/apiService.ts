import { 
  User, Ormas, PartaiPolitik, WawasanKebangsaan, BelaNegara, 
  PendidikanPolitik, KonflikSosial, Penelitian, ProgramKegiatan, 
  Berita, Dokumen, SystemConfig 
} from '../types';
import { 
  INITIAL_USERS, INITIAL_ORMAS, INITIAL_PARPOL, INITIAL_WASBANG, 
  INITIAL_BELA_NEGARA, INITIAL_PENTIK, INITIAL_KONFLIK, INITIAL_PENELITIAN, 
  INITIAL_PROGRAM_KEGIATAN, INITIAL_BERITA, INITIAL_DOKUMEN 
} from './mockData';

const CONFIG_KEY = 'kesbangpol_config';
const USER_KEY = 'kesbangpol_current_user';

const DEFAULT_CONFIG: SystemConfig = {
  apiUrl: '',
  useMock: true,
  spreadsheetUrl: '',
  driveFolderId: '',
  customLogo: '',
  customMap: ''
};

// Initialize LocalStorage with mock data if not already exists
function initLocalStorage() {
  if (!localStorage.getItem('Users')) {
    localStorage.setItem('Users', JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem('Ormas')) {
    localStorage.setItem('Ormas', JSON.stringify(INITIAL_ORMAS));
  }
  if (!localStorage.getItem('PartaiPolitik')) {
    localStorage.setItem('PartaiPolitik', JSON.stringify(INITIAL_PARPOL));
  }
  if (!localStorage.getItem('WawasanKebangsaan')) {
    localStorage.setItem('WawasanKebangsaan', JSON.stringify(INITIAL_WASBANG));
  }
  if (!localStorage.getItem('BelaNegara')) {
    localStorage.setItem('BelaNegara', JSON.stringify(INITIAL_BELA_NEGARA));
  }
  if (!localStorage.getItem('PendidikanPolitik')) {
    localStorage.setItem('PendidikanPolitik', JSON.stringify(INITIAL_PENTIK));
  }
  if (!localStorage.getItem('KonflikSosial')) {
    localStorage.setItem('KonflikSosial', JSON.stringify(INITIAL_KONFLIK));
  }
  if (!localStorage.getItem('Penelitian')) {
    localStorage.setItem('Penelitian', JSON.stringify(INITIAL_PENELITIAN));
  }
  if (!localStorage.getItem('ProgramKegiatan')) {
    localStorage.setItem('ProgramKegiatan', JSON.stringify(INITIAL_PROGRAM_KEGIATAN));
  }
  if (!localStorage.getItem('Berita')) {
    localStorage.setItem('Berita', JSON.stringify(INITIAL_BERITA));
  }
  if (!localStorage.getItem('Dokumen')) {
    localStorage.setItem('Dokumen', JSON.stringify(INITIAL_DOKUMEN));
  }
  if (!localStorage.getItem(CONFIG_KEY)) {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(DEFAULT_CONFIG));
  }
}

initLocalStorage();

export const apiService = {
  // Config Management
  getConfig(): SystemConfig {
    const configStr = localStorage.getItem(CONFIG_KEY);
    return configStr ? JSON.parse(configStr) : DEFAULT_CONFIG;
  },

  saveConfig(config: SystemConfig): void {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  },

  // Auth Management
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  },

  // Generic Request Handlers supporting both Mock (LocalStorage) and Real GAS Web API
  async login(username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const config = this.getConfig();
    
    // Live Apps Script Connection
    if (!config.useMock && config.apiUrl) {
      try {
        const response = await fetch(config.apiUrl, {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'login', username, password })
        });
        const resJson = await response.json();
        if (resJson.success && resJson.user) {
          this.setCurrentUser(resJson.user);
          return { success: true, user: resJson.user };
        } else {
          return { success: false, error: resJson.error || 'Autentikasi gagal.' };
        }
      } catch (err: any) {
        console.error("Live API Error, falling back to offline verify:", err);
        return { success: false, error: 'Koneksi ke Google Apps Script Web API gagal: ' + err.message };
      }
    }

    // Local / Offline authentication (Fallback or standard mock mode)
    const users: User[] = JSON.parse(localStorage.getItem('Users') || '[]');
    // For simplicity, we compare with our pre-set passwords
    // admin -> admin123, operator -> operator123, pimpinan -> pimpinan123
    const matchedUser = users.find(u => u.username === username);
    if (matchedUser) {
      const correctPassword = username === 'admin' ? 'admin123' : username === 'operator' ? 'operator123' : 'pimpinan123';
      if (password === correctPassword) {
        this.setCurrentUser(matchedUser);
        return { success: true, user: matchedUser };
      }
    }
    return { success: false, error: 'Username atau password salah!' };
  },

  async testConnection(apiUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
      // GAS Web Apps return a CORS preflight or standard json error when actions aren't met
      // But fetching with standard GET should at least reply or fail connection
      const response = await fetch(`${apiUrl}?action=read&sheet=Users`, {
        method: 'GET',
        mode: 'cors'
      });
      const data = await response.json();
      if (data && (data.success !== undefined)) {
        return { success: true };
      }
      return { success: false, error: 'Respons format tidak sesuai.' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // CRUD Operations supporting both modes
  async read<T>(sheetName: string): Promise<T[]> {
    const config = this.getConfig();

    if (!config.useMock && config.apiUrl) {
      try {
        const response = await fetch(`${config.apiUrl}?action=read&sheet=${sheetName}`, {
          method: 'GET',
          mode: 'cors'
        });
        const resJson = await response.json();
        if (resJson.success && Array.isArray(resJson.data)) {
          // Keep a local copy in cache to prevent offline breakage
          localStorage.setItem(sheetName, JSON.stringify(resJson.data));
          return resJson.data as T[];
        }
      } catch (err) {
        console.warn(`Gagal membaca dari Live Sheets (${sheetName}), menggunakan cache local:`, err);
      }
    }

    // Default to LocalStorage
    const localData = localStorage.getItem(sheetName);
    return localData ? JSON.parse(localData) : [];
  },

  async create<T extends { id?: string }>(
    sheetName: string, 
    data: T, 
    fileObj?: { base64: string; name: string; type: string }
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    const config = this.getConfig();
    const id = `rec-${Date.now()}`;
    const payload = { ...data, id };

    if (!config.useMock && config.apiUrl) {
      try {
        const response = await fetch(config.apiUrl, {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'create', 
            sheet: sheetName, 
            data: payload,
            file: fileObj?.base64,
            fileName: fileObj?.name,
            fileType: fileObj?.type
          })
        });
        const resJson = await response.json();
        if (resJson.success) {
          // Re-sync local cache
          const currentLocal = await apiService.read<any>(sheetName);
          currentLocal.push(resJson.data || payload);
          localStorage.setItem(sheetName, JSON.stringify(currentLocal));
          return { success: true, data: resJson.data };
        } else {
          return { success: false, error: resJson.error || 'Gagal menyimpan ke Google Sheets' };
        }
      } catch (err: any) {
        return { success: false, error: 'Koneksi API gagal: ' + err.message };
      }
    }

    // Local-only save
    const currentLocal = JSON.parse(localStorage.getItem(sheetName) || '[]');
    // Attach custom local image simulation if file provided
    if (fileObj) {
      const fileUrl = fileObj.base64; // local base64 preview URL
      (payload as any).fileUrl = fileUrl;
      if (sheetName === "Ormas") (payload as any).dokumenSkt = fileUrl;
      if (sheetName === "KonflikSosial") (payload as any).dokumentasi = fileUrl;
      if (sheetName === "WawasanKebangsaan") (payload as any).dokumentasi = fileUrl;
      if (sheetName === "Berita") (payload as any).foto = fileUrl;
    }
    currentLocal.push(payload);
    localStorage.setItem(sheetName, JSON.stringify(currentLocal));
    return { success: true, data: payload };
  },

  async update<T extends { id: string }>(
    sheetName: string, 
    data: T,
    fileObj?: { base64: string; name: string; type: string }
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    const config = this.getConfig();

    if (!config.useMock && config.apiUrl) {
      try {
        const response = await fetch(config.apiUrl, {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'update', 
            sheet: sheetName, 
            data: data,
            file: fileObj?.base64,
            fileName: fileObj?.name,
            fileType: fileObj?.type
          })
        });
        const resJson = await response.json();
        if (resJson.success) {
          const currentLocal = await apiService.read<any>(sheetName);
          const updated = currentLocal.map(item => item.id === data.id ? (resJson.data || data) : item);
          localStorage.setItem(sheetName, JSON.stringify(updated));
          return { success: true, data: resJson.data };
        } else {
          return { success: false, error: resJson.error || 'Gagal mengubah data di Google Sheets' };
        }
      } catch (err: any) {
        return { success: false, error: 'Koneksi API gagal: ' + err.message };
      }
    }

    // Local-only update
    const currentLocal = JSON.parse(localStorage.getItem(sheetName) || '[]');
    const payload = { ...data };
    if (fileObj) {
      const fileUrl = fileObj.base64;
      (payload as any).fileUrl = fileUrl;
      if (sheetName === "Ormas") (payload as any).dokumenSkt = fileUrl;
      if (sheetName === "KonflikSosial") (payload as any).dokumentasi = fileUrl;
      if (sheetName === "WawasanKebangsaan") (payload as any).dokumentasi = fileUrl;
      if (sheetName === "Berita") (payload as any).foto = fileUrl;
    }
    const updated = currentLocal.map((item: any) => item.id === data.id ? { ...item, ...payload } : item);
    localStorage.setItem(sheetName, JSON.stringify(updated));
    return { success: true, data: payload as T };
  },

  async delete(sheetName: string, id: string): Promise<{ success: boolean; error?: string }> {
    const config = this.getConfig();

    if (!config.useMock && config.apiUrl) {
      try {
        const response = await fetch(config.apiUrl, {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete', sheet: sheetName, id })
        });
        const resJson = await response.json();
        if (resJson.success) {
          const currentLocal = await apiService.read<any>(sheetName);
          const filtered = currentLocal.filter(item => item.id !== id);
          localStorage.setItem(sheetName, JSON.stringify(filtered));
          return { success: true };
        } else {
          return { success: false, error: resJson.error || 'Gagal menghapus data di Google Sheets' };
        }
      } catch (err: any) {
        return { success: false, error: 'Koneksi API gagal: ' + err.message };
      }
    }

    // Local-only delete
    const currentLocal = JSON.parse(localStorage.getItem(sheetName) || '[]');
    const filtered = currentLocal.filter((item: any) => item.id !== id);
    localStorage.setItem(sheetName, JSON.stringify(filtered));
    return { success: true };
  },

  // Specialized aggregate call to pull entire data at once for the dashboard refresh without individual reads
  async fetchDashboardData(): Promise<{
    ormas: Ormas[];
    partai: PartaiPolitik[];
    wasbang: WawasanKebangsaan[];
    belaNegara: BelaNegara[];
    pentik: PendidikanPolitik[];
    konflik: KonflikSosial[];
    penelitian: Penelitian[];
    programKegiatan: ProgramKegiatan[];
    berita: Berita[];
    dokumen: Dokumen[];
  }> {
    const config = this.getConfig();

    if (!config.useMock && config.apiUrl) {
      try {
        const response = await fetch(`${config.apiUrl}?action=dashboard`, {
          method: 'GET',
          mode: 'cors'
        });
        const resJson = await response.json();
        if (resJson.success && resJson.data) {
          const sheetsData = resJson.data;
          // Synchronize each sheet local cache
          Object.keys(sheetsData).forEach(key => {
            localStorage.setItem(key, JSON.stringify(sheetsData[key]));
          });
        }
      } catch (err) {
        console.warn("Gagal sinkronisasi data dashboard dari Google Sheets, menggunakan data lokal:", err);
      }
    }

    // Return current state from LocalStorage
    return {
      ormas: JSON.parse(localStorage.getItem('Ormas') || '[]'),
      partai: JSON.parse(localStorage.getItem('PartaiPolitik') || '[]'),
      wasbang: JSON.parse(localStorage.getItem('WawasanKebangsaan') || '[]'),
      belaNegara: JSON.parse(localStorage.getItem('BelaNegara') || '[]'),
      pentik: JSON.parse(localStorage.getItem('PendidikanPolitik') || '[]'),
      konflik: JSON.parse(localStorage.getItem('KonflikSosial') || '[]'),
      penelitian: JSON.parse(localStorage.getItem('Penelitian') || '[]'),
      programKegiatan: JSON.parse(localStorage.getItem('ProgramKegiatan') || '[]'),
      berita: JSON.parse(localStorage.getItem('Berita') || '[]'),
      dokumen: JSON.parse(localStorage.getItem('Dokumen') || '[]')
    };
  }
};
