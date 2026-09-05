import React from 'react';
import { User, Role } from '../types';
import { Shield, Bus, LogOut, Radio, UserCheck, ChevronRight, MapPin } from 'lucide-react';

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
  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'NATIONAL_ADMIN':
        return { label: 'National Highway Directorate', bg: 'bg-indigo-900 text-indigo-100 border-indigo-700' };
      case 'STATE_ADMIN':
        return { label: `State Command (${user.stateName || 'State'})`, bg: 'bg-blue-900 text-blue-100 border-blue-700' };
      case 'DISTRICT_HEAD':
        return { label: `District Authority (${user.districtName || 'District'})`, bg: 'bg-emerald-950 text-emerald-200 border-emerald-800' };
    }
  };

  const badge = getRoleBadge(user.role);

  return (
    <header className="bg-[#0b2545] text-white shadow-md border-b border-[#134074] sticky top-0 z-30">
      {/* Top Ministry Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-amber-400 font-black text-lg tracking-wider">
              <Shield className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-white">UrbanEye</span>
                <span className="text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Command
                </span>
                <span className="flex items-center text-xs text-emerald-300 font-medium ml-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1.5 inline-block"></span>
                  Edge-AI Live
                </span>
              </div>
              <div className="text-[11px] text-slate-300 font-medium tracking-wide">
                Ministry of Road Transport & Highways • Public Transit Intelligence
              </div>
            </div>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center space-x-3">
          {/* Active Buses Pill */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-xs text-slate-200">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Active Bus Sensors:</span>
            <span className="font-bold text-white bg-emerald-700/60 px-1.5 py-0.5 rounded">
              {activeBusCount}
            </span>
          </div>

          {/* Pair New Bus Button */}
          <button
            onClick={onOpenPairing}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm transition"
            title="Pair a bus-mounted phone sensor using 6-digit PIN"
          >
            <Bus className="w-4 h-4" />
            <span>Pair Bus (PIN)</span>
          </button>

          {/* Role Badge */}
          <div className={`hidden md:inline-flex items-center px-2.5 py-1 rounded text-xs font-medium border ${badge.bg}`}>
            <UserCheck className="w-3.5 h-3.5 mr-1.5" />
            <span>{badge.label}</span>
          </div>

          {/* Quick Role Switcher for Evaluator Convenience */}
          {onSwitchUser && (
            <div className="relative group">
              <select
                onChange={(e) => onSwitchUser(e.target.value)}
                value={user.email}
                className="text-xs bg-white/10 hover:bg-white/20 text-white rounded px-2.5 py-1.5 border border-white/20 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
                title="Switch test persona"
              >
                <option value="admin@urbaneye.gov.in" className="text-slate-900">National Admin (All States)</option>
                <option value="admin.mh@urbaneye.gov.in" className="text-slate-900">State Admin (Maharashtra)</option>
                <option value="admin.pb@urbaneye.gov.in" className="text-slate-900">State Admin (Punjab)</option>
                <option value="head.mumbai@urbaneye.gov.in" className="text-slate-900">District Head (Mumbai Suburban)</option>
                <option value="head.pune@urbaneye.gov.in" className="text-slate-900">District Head (Pune)</option>
                <option value="head.bengaluru@urbaneye.gov.in" className="text-slate-900">District Head (Bengaluru)</option>
                <option value="head.kapurthala@urbaneye.gov.in" className="text-slate-900 font-bold">★ District Head (Kapurthala / LPU)</option>
                <option value="head.jalandhar@urbaneye.gov.in" className="text-slate-900">District Head (Jalandhar)</option>
              </select>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={onLogout}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded transition"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Breadcrumbs / Jurisdiction Scope Bar */}
      <div className="bg-[#07162c] px-4 sm:px-6 lg:px-8 py-1.5 text-xs text-slate-300 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400 font-medium">Jurisdiction:</span>
          <div className="flex items-center space-x-1.5">
            {currentBreadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-500" />}
                {crumb.onClick ? (
                  <button
                    onClick={crumb.onClick}
                    className="hover:text-amber-300 font-semibold underline underline-offset-2 transition"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className="font-semibold text-white">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="text-[11px] text-slate-400 hidden sm:block">
          Logged in as: <span className="text-slate-200 font-medium">{user.name}</span> ({user.email})
        </div>
      </div>
    </header>
  );
};
