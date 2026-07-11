import React from 'react';
import { 
  LayoutDashboard, Users, Flag, Award, BookOpen, 
  AlertTriangle, SearchCode, BarChart3, Settings, 
  FileText, LogOut, Menu, X, Landmark, Globe, Newspaper
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userRole: UserRole;
  userName: string;
  onLogout: () => void;
}

export default function Sidebar({ currentTab, setCurrentTab, userRole, userName, onLogout }: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard, roles: ['Administrator', 'Operator Bidang', 'Pimpinan'] },
    { id: 'ormas', label: 'Ormas', icon: Users, roles: ['Administrator', 'Operator Bidang', 'Pimpinan'] },
    { id: 'partai', label: 'Partai Politik', icon: Landmark, roles: ['Administrator', 'Operator Bidang', 'Pimpinan'] },
    { id: 'wasbang', label: 'Wawasan Kebangsaan', icon: Globe, roles: ['Administrator', 'Operator Bidang', 'Pimpinan'] },
    { id: 'belanegara', label: 'Bela Negara', icon: Flag, roles: ['Administrator', 'Operator Bidang', 'Pimpinan'] },
    { id: 'pentik', label: 'Pendidikan Politik', icon: Award, roles: ['Administrator', 'Operator Bidang', 'Pimpinan'] },
    { id: 'konflik', label: 'Konflik Sosial', icon: AlertTriangle, roles: ['Administrator', 'Operator Bidang', 'Pimpinan'] },
    { id: 'penelitian', label: 'Penelitian', icon: SearchCode, roles: ['Administrator', 'Operator Bidang', 'Pimpinan'] },
    { id: 'program', label: 'Program & Kegiatan', icon: FileText, roles: ['Administrator', 'Operator Bidang', 'Pimpinan'] },
    { id: 'berita', label: 'Berita Daerah', icon: Newspaper, roles: ['Administrator', 'Operator Bidang', 'Pimpinan'] },
    { id: 'dokumen', label: 'Dokumen Regulasi', icon: BookOpen, roles: ['Administrator', 'Operator Bidang', 'Pimpinan'] },
    { id: 'laporan', label: 'Laporan Analitikal', icon: BarChart3, roles: ['Administrator', 'Operator Bidang', 'Pimpinan'] },
    { id: 'pengaturan', label: 'Pengaturan Sistem', icon: Settings, roles: ['Administrator'] },
  ];

  const allowedItems = menuItems.filter(item => item.roles.includes(userRole));

  const handleTabClick = (tabId: string) => {
    setCurrentTab(tabId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2.5 rounded-xl bg-teal-800 text-white shadow-lg focus:outline-none hover:bg-teal-700 transition-colors"
          id="sidebar-toggle"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 flex flex-col w-72 bg-gradient-to-b from-teal-950 via-teal-900 to-emerald-950 text-white transition-all duration-300 transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        border-r border-teal-800/50 shadow-2xl
      `}>
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center py-8 px-6 border-b border-teal-800/40">
          <div className="w-16 h-16 mb-3 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-emerald-500 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-teal-950 rounded-2xl flex items-center justify-center overflow-hidden">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/0/07/Coat_of_arms_of_West_Nusa_Tenggara.svg" 
                alt="Logo NTB" 
                className="w-10 h-10 object-contain p-0.5"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <h1 className="text-center font-bold tracking-tight text-lg text-amber-300">
            KESBANGPOLDAGRI
          </h1>
          <p className="text-center text-[11px] text-teal-200 uppercase tracking-widest font-medium mt-0.5">
            Provinsi NTB
          </p>
        </div>

        {/* User Status Profile */}
        <div className="px-5 py-4 bg-teal-950/40 border-b border-teal-800/30">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-teal-800/80 border border-teal-600 flex items-center justify-center text-amber-300 font-bold">
                {userName.charAt(0)}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-teal-950"></span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-white">{userName}</p>
              <span className="inline-flex items-center mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-400/15 text-amber-300 border border-amber-400/20 uppercase tracking-wider">
                {userRole}
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-teal-800">
          {allowedItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`
                  w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-[14px] font-medium transition-all duration-200 group
                  ${isActive 
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-teal-950 shadow-md font-semibold' 
                    : 'text-teal-100 hover:bg-teal-800/50 hover:text-white'
                  }
                `}
                id={`menu-item-${item.id}`}
              >
                <IconComponent className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'text-teal-950' : 'text-teal-300'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer & Logout */}
        <div className="p-4 border-t border-teal-800/40 bg-teal-950/55">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 border border-rose-500/15 transition-all"
            id="logout-button"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Keluar Sistem</span>
          </button>
          <div className="text-center mt-3 text-[10px] text-teal-400/80">
            &copy; 2026 Kesbangpoldagri NTB
          </div>
        </div>
      </aside>
    </>
  );
}
