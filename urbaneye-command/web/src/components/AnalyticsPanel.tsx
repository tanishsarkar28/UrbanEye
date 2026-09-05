import React from 'react';
import { AnalyticsStats } from '../types';
import { Activity, AlertOctagon, CheckCircle, Wrench, ShieldAlert, Bus } from 'lucide-react';

interface AnalyticsPanelProps {
  stats: AnalyticsStats | null;
  districtName?: string;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ stats, districtName }) => {
  if (!stats) return null;

  const getHealthColor = (score: number) => {
    if (score >= 80) return { text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', label: 'EXCELLENT' };
    if (score >= 60) return { text: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', label: 'MODERATE' };
    if (score >= 40) return { text: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', label: 'ATTENTION NEEDED' };
    return { text: 'text-red-700', bg: 'bg-red-50 border-red-200', label: 'CRITICAL' };
  };

  const health = getHealthColor(stats.roadHealthScore);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
      {/* 1. Road Health Index Score */}
      <div className={`p-4 rounded-lg border shadow-sm ${health.bg} flex flex-col justify-between`}>
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Road Health Index</span>
          <Activity className="w-4 h-4 text-slate-500" />
        </div>
        <div className="my-1 flex items-baseline space-x-2">
          <span className={`text-3xl font-extrabold ${health.text}`}>
            {stats.roadHealthScore}
          </span>
          <span className="text-xs text-slate-500 font-semibold">/ 100</span>
        </div>
        <div className="text-[11px] font-bold tracking-wide uppercase text-slate-600">
          Rating: <span className={health.text}>{health.label}</span>
        </div>
      </div>

      {/* 2. New Unreviewed Defects */}
      <div className="p-4 rounded-lg border border-red-200 bg-white shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>New Defects</span>
          <AlertOctagon className="w-4 h-4 text-red-600" />
        </div>
        <div className="my-1">
          <span className="text-2xl font-extrabold text-red-600">
            {stats.byStatus.new}
          </span>
        </div>
        <div className="text-[11px] text-slate-500">
          Pending officer review
        </div>
      </div>

      {/* 3. Under Repair / Assigned */}
      <div className="p-4 rounded-lg border border-blue-200 bg-white shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>Assigned for Repair</span>
          <Wrench className="w-4 h-4 text-blue-600" />
        </div>
        <div className="my-1">
          <span className="text-2xl font-extrabold text-blue-600">
            {stats.byStatus.assigned}
          </span>
        </div>
        <div className="text-[11px] text-slate-500">
          Active PWD work orders
        </div>
      </div>

      {/* 4. Resolved Defects */}
      <div className="p-4 rounded-lg border border-emerald-200 bg-white shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>Defects Resolved</span>
          <CheckCircle className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="my-1">
          <span className="text-2xl font-extrabold text-emerald-600">
            {stats.byStatus.resolved}
          </span>
        </div>
        <div className="text-[11px] text-slate-500">
          Closed & verified
        </div>
      </div>

      {/* 5. Active Bus Patrol Fleet */}
      <div className="p-4 rounded-lg border border-indigo-200 bg-white shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>Active Bus Sensors</span>
          <Bus className="w-4 h-4 text-indigo-600" />
        </div>
        <div className="my-1 flex items-baseline space-x-1.5">
          <span className="text-2xl font-extrabold text-indigo-900">
            {stats.activeBusesCount}
          </span>
          <span className="text-xs text-emerald-600 font-semibold flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
            Online
          </span>
        </div>
        <div className="text-[11px] text-slate-500 truncate">
          Patrolling {districtName || 'district'}
        </div>
      </div>
    </div>
  );
};
