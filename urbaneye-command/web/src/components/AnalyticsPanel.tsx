import React from 'react';
import { AnalyticsStats } from '../types';
import { Activity, AlertCircle, CheckCircle2, Wrench, Bus, ShieldCheck } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface AnalyticsPanelProps {
  stats: AnalyticsStats | null;
  districtName?: string;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ stats, districtName }) => {
  const { isDark } = useTheme();

  if (!stats) return null;

  const cardBase = isDark
    ? 'bg-slate-800/90 border-slate-700/80 hover:border-slate-600'
    : 'bg-white border-slate-200 hover:border-slate-300';

  const labelClr   = isDark ? 'text-slate-300' : 'text-slate-700';
  const hintClr    = isDark ? 'text-slate-400' : 'text-slate-500';
  const numClr     = isDark ? 'text-white'     : 'text-slate-900';
  const trackClr   = isDark ? 'bg-slate-700/80'   : 'bg-slate-100';
  const targetClr  = isDark ? 'text-slate-400' : 'text-slate-600';
  const borderDivider = isDark ? 'border-slate-700/60' : 'border-slate-100';

  const getHealthMeta = (score: number) => {
    if (score >= 80) {
      return {
        text: 'text-[#1E7F73]',
        bar: 'bg-[#1E7F73]',
        badgeBg: isDark
          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/70'
          : 'bg-emerald-50 text-emerald-800 border-emerald-200',
        label: 'OPTIMAL HEALTH',
        summary: 'Pavement integrity meets target standard',
      };
    }
    if (score >= 60) {
      return {
        text: 'text-amber-500',
        bar: 'bg-amber-500',
        badgeBg: isDark
          ? 'bg-amber-950/80 text-amber-300 border-amber-700/70'
          : 'bg-amber-50 text-amber-800 border-amber-200',
        label: 'MODERATE WEAR',
        summary: 'Early defect cluster accumulation detected',
      };
    }
    return {
      text: 'text-red-500',
      bar: 'bg-red-600',
      badgeBg: isDark
        ? 'bg-red-950/80 text-red-300 border-red-700/70'
        : 'bg-red-50 text-red-800 border-red-200',
      label: 'CRITICAL ATTENTION',
      summary: 'Significant pavement degradation requiring intervention',
    };
  };

  const health = getHealthMeta(stats.roadHealthScore);
  const cleanDistrictName = (districtName || 'District').replace(/\s*\(.*?\)/g, '').trim();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 mb-4 sm:mb-5">
      {/* 1. HERO KPI: Road Health Index */}
      <div className={`lg:col-span-4 rounded-xl border p-4 sm:p-5 shadow-sm flex flex-col justify-between relative overflow-hidden transition-colors duration-300 ${cardBase}`}>
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className={`flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider ${labelClr}`}>
                <Activity className={`w-3.5 h-3.5 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                <span>Road Health Index</span>
              </div>
              <p className={`text-[11px] mt-0.5 ${hintClr}`}>
                Primary jurisdiction condition metric
              </p>
            </div>
            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border shrink-0 ${health.badgeBg}`}>
              {health.label}
            </span>
          </div>

          {/* Hero Score */}
          <div className="my-3 flex items-baseline space-x-2">
            <span className={`text-4xl sm:text-5xl font-black tracking-tight ${health.text}`}>
              {stats.roadHealthScore}
            </span>
            <span className={`text-sm font-bold ${hintClr}`}>/ 100</span>
          </div>
        </div>

        {/* Progress Bar & Summary */}
        <div className="pt-2">
          <div className={`w-full h-2 rounded-full overflow-hidden mb-2 ${trackClr}`}>
            <div
              className={`h-full ${health.bar} transition-all duration-500 rounded-full`}
              style={{ width: `${Math.max(stats.roadHealthScore, 5)}%` }}
            />
          </div>
          <div className={`flex items-center justify-between text-[11px] font-medium ${hintClr}`}>
            <span className="truncate mr-2">{health.summary}</span>
            <span className={`font-semibold shrink-0 ${targetClr}`}>Target: 80+</span>
          </div>
        </div>
      </div>

      {/* 2. SECONDARY METRICS: 4 equal-height cards spanning top-to-bottom without awkward bottom gaps */}
      <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Metric A: New Defects */}
        <div className={`h-full rounded-xl border p-4 shadow-sm flex flex-col justify-between transition-colors duration-300 ${
          isDark ? 'bg-slate-800/90 border-red-900/50 hover:border-red-800/70' : 'bg-white border-red-200 hover:border-red-300'
        }`}>
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className={labelClr}>New Defects</span>
            <div className="p-1 rounded-md bg-red-500/10 text-red-500">
              <AlertCircle className="w-4 h-4 shrink-0" />
            </div>
          </div>

          <div className="my-auto py-2">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-red-500">
              {stats.byStatus.new}
            </span>
          </div>

          <div className={`pt-2.5 border-t ${borderDivider} flex items-center justify-between text-[11px] font-medium ${hintClr}`}>
            <span>Pending review</span>
            {stats.byStatus.new > 0 ? (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            ) : (
              <span className="text-[10px] font-semibold text-emerald-500/90">Clear</span>
            )}
          </div>
        </div>

        {/* Metric B: Assigned */}
        <div className={`h-full rounded-xl border p-4 shadow-sm flex flex-col justify-between transition-colors duration-300 ${cardBase}`}>
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className={labelClr}>Assigned</span>
            <div className={`p-1 rounded-md ${isDark ? 'bg-slate-700/60 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
              <Wrench className="w-4 h-4 shrink-0" />
            </div>
          </div>

          <div className="my-auto py-2">
            <span className={`text-3xl sm:text-4xl font-black tracking-tight ${numClr}`}>
              {stats.byStatus.assigned}
            </span>
          </div>

          <div className={`pt-2.5 border-t ${borderDivider} flex items-center justify-between text-[11px] font-medium ${hintClr}`}>
            <span>Work orders open</span>
            <span className="text-[10px] font-semibold text-amber-500/90">Active</span>
          </div>
        </div>

        {/* Metric C: Resolved */}
        <div className={`h-full rounded-xl border p-4 shadow-sm flex flex-col justify-between transition-colors duration-300 ${cardBase}`}>
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className={labelClr}>Resolved</span>
            <div className="p-1 rounded-md bg-[#1E7F73]/10 text-[#1E7F73]">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            </div>
          </div>

          <div className="my-auto py-2">
            <span className={`text-3xl sm:text-4xl font-black tracking-tight ${numClr}`}>
              {stats.byStatus.resolved}
            </span>
          </div>

          <div className={`pt-2.5 border-t ${borderDivider} flex items-center justify-between text-[11px] font-medium ${hintClr}`}>
            <span>Repaired &amp; verified</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#1E7F73]" />
          </div>
        </div>

        {/* Metric D: Bus Sensors */}
        <div className={`h-full rounded-xl border p-4 shadow-sm flex flex-col justify-between transition-colors duration-300 ${cardBase}`}>
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className={labelClr}>Bus Sensors</span>
            <div className={`p-1 rounded-md ${isDark ? 'bg-teal-950/60 text-teal-400' : 'bg-teal-50 text-teal-700'}`}>
              <Bus className="w-4 h-4 shrink-0" />
            </div>
          </div>

          <div className="my-auto py-2 flex items-baseline justify-between">
            <span className={`text-3xl sm:text-4xl font-black tracking-tight ${numClr}`}>
              {stats.activeBusesCount}
            </span>
            <span className="text-[10px] font-bold text-[#1E7F73] bg-[#1E7F73]/10 px-2.5 py-0.5 rounded-full flex items-center shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1E7F73] mr-1.5 animate-pulse" />
              Live
            </span>
          </div>

          <div className={`pt-2.5 border-t ${borderDivider} flex items-center justify-between text-[11px] font-medium ${hintClr}`} title={`${cleanDistrictName} fleet`}>
            <span className="truncate">{cleanDistrictName} fleet</span>
          </div>
        </div>

      </div>
    </div>
  );
};
