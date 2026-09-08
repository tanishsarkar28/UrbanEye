import React from 'react';
import { AnalyticsStats } from '../types';
import { Activity, AlertCircle, CheckCircle2, Wrench, Bus } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface AnalyticsPanelProps {
  stats: AnalyticsStats | null;
  districtName?: string;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ stats, districtName }) => {
  const { isDark } = useTheme();

  if (!stats) return null;

  const cardBase = isDark
    ? 'bg-slate-800 border-slate-700'
    : 'bg-white border-slate-200';

  const labelClr  = isDark ? 'text-slate-400' : 'text-slate-600';
  const hintClr   = isDark ? 'text-slate-500' : 'text-slate-400';
  const numClr    = isDark ? 'text-white'      : 'text-slate-900';
  const trackClr  = isDark ? 'bg-slate-700'    : 'bg-slate-100';
  const targetClr = isDark ? 'text-slate-400'  : 'text-slate-700';

  const getHealthMeta = (score: number) => {
    if (score >= 80) {
      return {
        text: 'text-[#1E7F73]',
        bar: 'bg-[#1E7F73]',
        badgeBg: isDark
          ? 'bg-emerald-900/50 text-emerald-300 border-emerald-700'
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
          ? 'bg-amber-900/50 text-amber-300 border-amber-700'
          : 'bg-amber-50 text-amber-800 border-amber-200',
        label: 'MODERATE WEAR',
        summary: 'Early defect cluster accumulation detected',
      };
    }
    return {
      text: 'text-red-500',
      bar: 'bg-red-600',
      badgeBg: isDark
        ? 'bg-red-900/50 text-red-300 border-red-700'
        : 'bg-red-50 text-red-800 border-red-200',
      label: 'CRITICAL ATTENTION',
      summary: 'Significant pavement degradation requiring intervention',
    };
  };

  const health = getHealthMeta(stats.roadHealthScore);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-5">
      {/* 1. HERO KPI: Road Health Index */}
      <div className={`lg:col-span-5 rounded-xl border p-5 shadow-sm flex flex-col justify-between relative overflow-hidden transition-colors duration-300 ${cardBase}`}>
        <div className="flex items-start justify-between">
          <div>
            <div className={`flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider ${labelClr}`}>
              <Activity className={`w-3.5 h-3.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`} />
              <span>Road Health Index</span>
            </div>
            <p className={`text-xs mt-0.5 ${hintClr}`}>
              Primary jurisdiction condition metric
            </p>
          </div>
          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${health.badgeBg}`}>
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

        {/* Progress Bar */}
        <div>
          <div className={`w-full h-2 rounded-full overflow-hidden mb-2 ${trackClr}`}>
            <div
              className={`h-full ${health.bar} transition-all duration-500 rounded-full`}
              style={{ width: `${Math.max(stats.roadHealthScore, 5)}%` }}
            />
          </div>
          <div className={`flex items-center justify-between text-[11px] font-medium ${hintClr}`}>
            <span>{health.summary}</span>
            <span className={`font-semibold ${targetClr}`}>Target: 80+</span>
          </div>
        </div>
      </div>

      {/* 2. SECONDARY METRICS */}
      <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
        {/* Metric A: New Defects */}
        <div className={`rounded-xl border p-3.5 shadow-sm flex flex-col justify-between transition-colors duration-300 ${isDark ? 'bg-slate-800 border-red-900/60' : 'bg-white border-red-200'}`}>
          <div className={`flex items-center justify-between text-xs font-semibold ${labelClr}`}>
            <span>New Defects</span>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-black text-red-500">
              {stats.byStatus.new}
            </span>
          </div>
          <div className={`text-[10px] ${hintClr}`}>Pending review</div>
        </div>

        {/* Metric B: Assigned */}
        <div className={`rounded-xl border p-3.5 shadow-sm flex flex-col justify-between transition-colors duration-300 ${cardBase}`}>
          <div className={`flex items-center justify-between text-xs font-semibold ${labelClr}`}>
            <span>Assigned</span>
            <Wrench className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
          </div>
          <div className="my-1.5">
            <span className={`text-2xl font-black ${numClr}`}>
              {stats.byStatus.assigned}
            </span>
          </div>
          <div className={`text-[10px] ${hintClr}`}>Work orders open</div>
        </div>

        {/* Metric C: Resolved */}
        <div className={`rounded-xl border p-3.5 shadow-sm flex flex-col justify-between transition-colors duration-300 ${cardBase}`}>
          <div className={`flex items-center justify-between text-xs font-semibold ${labelClr}`}>
            <span>Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-[#1E7F73]" />
          </div>
          <div className="my-1.5">
            <span className={`text-2xl font-black ${numClr}`}>
              {stats.byStatus.resolved}
            </span>
          </div>
          <div className={`text-[10px] ${hintClr}`}>Repaired &amp; verified</div>
        </div>

        {/* Metric D: Bus Sensors */}
        <div className={`rounded-xl border p-3.5 shadow-sm flex flex-col justify-between transition-colors duration-300 ${cardBase}`}>
          <div className={`flex items-center justify-between text-xs font-semibold ${labelClr}`}>
            <span>Bus Sensors</span>
            <Bus className={`w-4 h-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`} />
          </div>
          <div className="my-1.5 flex items-baseline space-x-1.5">
            <span className={`text-2xl font-black ${numClr}`}>
              {stats.activeBusesCount}
            </span>
            <span className="text-[10px] text-[#1E7F73] font-semibold flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1E7F73] mr-1 animate-pulse" />
              Live
            </span>
          </div>
          <div className={`text-[10px] truncate ${hintClr}`}>
            {districtName || 'District'} fleet
          </div>
        </div>
      </div>
    </div>
  );
};
