import React from 'react';
import { User, Role } from '../types';
import { Bus, LogOut, Radio, UserCheck, ChevronRight, MapPin } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onOpenPairing: () => void;
  onSwitchUser?: (email: string) => void;
  activeBusCount?: number;
  currentBreadcrumbs?: { label: string; onClick?: () => void }[];
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  onOpenPairing,
  onSwitchUser,
  activeBusCount = 0,
  currentBreadcrumbs = [],
}) => {
  const { isDark } = useTheme();
  const getRoleLabel = (role: Role) => {
    switch (role) {
      case 'NATIONAL_ADMIN':
        return 'Ministry Directorate';
      case 'STATE_ADMIN':
        return `State Command (${user.stateName || 'State'})`;
      case 'DISTRICT_HEAD':
        return `District Authority (${user.districtName || 'District'})`;
    }
  };

  return (
    <header className={`text-white border-b sticky top-0 z-30 shadow-sm transition-colors duration-300 ${isDark ? 'bg-[#10233D] border-slate-800' : 'bg-white border-slate-200 text-slate-800'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Brand + Calm Status + Inline Jurisdiction Breadcrumb */}
        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
          {/* Logo Brandmark */}
          <div className="flex items-center space-x-2.5 shrink-0">
            <div className={`w-8 h-8 rounded-lg overflow-hidden border flex items-center justify-center ${isDark ? 'bg-[#10233D] border-white/15' : 'bg-slate-100 border-slate-200'}`}>
              <img src="/logo.png" alt="UrbanEye" className="w-full h-full object-contain p-0.5" />
            </div>
            <div className="flex items-center space-x-2">
              <span className={`font-bold text-base tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>UrbanEye</span>
              <span className={`hidden sm:inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded ${isDark ? 'text-slate-300 bg-white/5 border border-white/10' : 'text-slate-500 bg-slate-100 border border-slate-200'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#1E7F73] animate-pulse mr-1.5 inline-block" />
                Live Edge Inference
              </span>
            </div>
          </div>

          <div className={`h-4 w-px hidden md:block shrink-0 ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />

          {/* Integrated Jurisdiction Scope Breadcrumb */}
          <div className={`hidden md:flex items-center space-x-1.5 text-xs min-w-0 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            <MapPin className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
            <div className="flex items-center space-x-1 truncate">
              {currentBreadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-500 shrink-0" />}
                  {crumb.onClick ? (
                    <button
                      onClick={crumb.onClick}
                      className={`hover:text-[#1E7F73] font-medium transition truncate underline-offset-2 hover:underline ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                    >
                      {crumb.label}
                    </button>
                  ) : (
                    <span className={`font-semibold truncate ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Restrained Tools & Actions */}
        <div className="flex items-center space-x-2.5 shrink-0">
          {/* Active Bus Sensor Counter */}
          <div className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs ${isDark ? 'bg-white/5 border border-white/10 text-slate-300' : 'bg-slate-100 border border-slate-200 text-slate-600'}`}>
            <Radio className="w-3 h-3 text-[#1E7F73] animate-pulse" />
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Sensors:</span>
            <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{activeBusCount}</span>
          </div>

          {/* Role Status Pill (Restrained Ink/Slate) */}
          <div className={`hidden lg:inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${isDark ? 'bg-white/5 border border-white/10 text-slate-300' : 'bg-slate-100 border border-slate-200 text-slate-600'}`}>
            <UserCheck className={`w-3.5 h-3.5 mr-1.5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
            <span>{getRoleLabel(user.role)}</span>
          </div>

          {/* Pair Bus Action Button (Restrained Teal Palette) */}
          <button
            onClick={onOpenPairing}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[#1E7F73] hover:bg-[#186a60] text-white shadow-sm transition"
            title="Pair a bus-mounted phone sensor using 6-digit PIN"
          >
            <Bus className="w-3.5 h-3.5" />
            <span>Pair Bus (PIN)</span>
          </button>

          {/* Switch Persona Dropdown */}
          {onSwitchUser && (
            <div className="relative">
              <select
                onChange={(e) => onSwitchUser(e.target.value)}
                value={user.email}
                className="text-xs rounded px-2.5 py-1.5 border focus:outline-none focus:ring-1 focus:ring-[#1E7F73] cursor-pointer"
                style={{ backgroundColor: '#1e293b', color: '#e2e8f0', borderColor: '#334155' }}
                title="Switch test persona"
              >
                <option value="admin@urbaneye.gov.in" style={{ backgroundColor: '#1e293b', color: '#e2e8f0' }}>National Admin (All India)</option>
                <option value="admin.pb@urbaneye.gov.in" style={{ backgroundColor: '#1e293b', color: '#e2e8f0' }}>State Admin (Punjab)</option>
                <option value="admin.mh@urbaneye.gov.in" style={{ backgroundColor: '#1e293b', color: '#e2e8f0' }}>State Admin (Maharashtra)</option>
                <option value="head.kapurthala@urbaneye.gov.in" style={{ backgroundColor: '#1e293b', color: '#e2e8f0', fontWeight: 700 }}>★ District Head (Kapurthala)</option>
                <option value="head.jalandhar@urbaneye.gov.in" style={{ backgroundColor: '#1e293b', color: '#e2e8f0' }}>District Head (Jalandhar)</option>
                <option value="head.mumbai@urbaneye.gov.in" style={{ backgroundColor: '#1e293b', color: '#e2e8f0' }}>District Head (Mumbai Suburban)</option>
                <option value="head.pune@urbaneye.gov.in" style={{ backgroundColor: '#1e293b', color: '#e2e8f0' }}>District Head (Pune)</option>
                <option value="head.bengaluru@urbaneye.gov.in" style={{ backgroundColor: '#1e293b', color: '#e2e8f0' }}>District Head (Bengaluru)</option>
              </select>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className={`p-1.5 rounded transition ${isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Jurisdiction Sub-row for small viewports */}
      <div className={`md:hidden px-4 py-1 border-t text-[11px] flex items-center space-x-1.5 overflow-x-auto ${isDark ? 'bg-slate-900/60 border-white/5 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
        <div className="flex items-center space-x-1 whitespace-nowrap">
          {currentBreadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight className="w-2.5 h-2.5 text-slate-500 shrink-0" />}
              {crumb.onClick ? (
                <button onClick={crumb.onClick} className="text-slate-400 font-medium">
                  {crumb.label}
                </button>
              ) : (
                <span className="font-semibold text-slate-100">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </header>
  );
};
