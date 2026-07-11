import React from 'react';
import { ShieldCheck, User, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { UserRole } from '../types';
import { apiService } from '../utils/apiService';

interface LoginScreenProps {
  onLoginSuccess: (username: string, role: UserRole, nama: string) => void;
  onLoginAttempt: (u: string, p: string) => Promise<{ success: boolean; error?: string }>;
}

export default function LoginScreen({ onLoginSuccess, onLoginAttempt }: LoginScreenProps) {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [customLogo, setCustomLogo] = React.useState('');

  React.useEffect(() => {
    try {
      const config = apiService.getConfig();
      if (config && config.customLogo) {
        setCustomLogo(config.customLogo);
      }
    } catch (e) {
      console.error('Error loading custom logo for login screen:', e);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMessage('Username dan password wajib diisi.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const res = await onLoginAttempt(username, password);
      setIsLoading(false);
      if (res.success) {
        // Handled up stream
      } else {
        setErrorMessage(res.error || 'Username atau password salah.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage('Terjadi masalah koneksi sistem: ' + err.message);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-referrer p-4"
      style={{ 
        backgroundImage: `linear-gradient(to bottom, rgba(13, 148, 136, 0.85), rgba(15, 23, 42, 0.95)), url('https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600')` 
      }}
    >
      <div className="w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl p-8 border border-white/20 dark:border-slate-800/80 shadow-2xl space-y-6">
        
        {/* Crest logo & Title */}
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-emerald-500 p-0.5 shadow-xl flex items-center justify-center">
            <div className="w-full h-full bg-teal-950 rounded-3xl flex items-center justify-center overflow-hidden">
              <img 
                src={customLogo || "https://upload.wikimedia.org/wikipedia/commons/0/07/Coat_of_arms_of_West_Nusa_Tenggara.svg"} 
                alt="Lambang NTB" 
                className="w-12 h-12 object-contain p-0.5"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">PORTAL KESBANGPOLDAGRI</h2>
          <p className="text-[11px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-widest mt-1">Provinsi Nusa Tenggara Barat</p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="space-y-3">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30 rounded-xl text-xs font-semibold text-center animate-shake">
                {errorMessage}
              </div>

              {(errorMessage.includes('Failed to fetch') || errorMessage.includes('Koneksi') || errorMessage.includes('gagal')) && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-900/30 rounded-2xl text-xs space-y-2.5 text-gray-750 dark:text-gray-300 text-left">
                  <p className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                    💡 Mengapa ini terjadi?
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed text-gray-600 dark:text-gray-400">
                    <li>URL Web App di pengaturan sistem tidak valid atau tidak aktif.</li>
                    <li>Akses deployment Google Apps Script belum diatur ke <strong>"Anyone" (Siapa saja)</strong>.</li>
                    <li>Sertifikat SSL bermasalah atau koneksi diblokir aturan CORS.</li>
                  </ul>
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        const currentConfig = apiService.getConfig();
                        apiService.saveConfig({
                          ...currentConfig,
                          useMock: true
                        });
                        alert('Mode Luring (Database Lokal/Demo) berhasil diaktifkan kembali! Halaman akan dimuat ulang.');
                        window.location.reload();
                      } catch (err) {
                        alert('Gagal mengaktifkan Mode Luring.');
                      }
                    }}
                    className="w-full mt-2.5 py-2 px-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[11px] font-bold shadow-md active:scale-95 transition-all cursor-pointer text-center"
                  >
                    Aktifkan Mode Luring (Database Lokal)
                  </button>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5 uppercase tracking-wide">Nama Akun (Username)</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4.5 h-4.5 text-gray-400" />
              <input
                type="text"
                placeholder="Masukkan username Anda..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-teal-500 dark:focus:border-teal-400 text-gray-800 dark:text-white"
                id="login-username-input"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5 uppercase tracking-wide">Kata Sandi (Password)</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4.5 h-4.5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan password Anda..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-teal-500 dark:focus:border-teal-400 text-gray-800 dark:text-white"
                id="login-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-teal-500/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            id="login-submit-button"
          >
            {isLoading ? 'Mengotentikasi...' : 'Masuk Portal Sistem'}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>



        {/* Agency credentials footnote */}
        <div className="text-center text-[10px] text-gray-400">
          Badan Kesatuan Bangsa dan Politik Dalam Negeri<br />
          Provinsi Nusa Tenggara Barat &bull; Versi 2.1
        </div>

      </div>
    </div>
  );
}
