import React from 'react';
import { District, State } from '../types';
import { MapPin, Bus, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';

interface DistrictSelectorProps {
  state: State;
  districts: District[];
  onSelectDistrict: (district: District) => void;
  onBack?: () => void;
  canGoBack?: boolean;
}

export const DistrictSelector: React.FC<DistrictSelectorProps> = ({
  state,
  districts,
  onSelectDistrict,
  onBack,
  canGoBack = false,
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-3">
          {canGoBack && onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded border border-slate-300 hover:bg-slate-100 text-slate-700 transition"
              title="Return to National Overview"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              {state.name} — District Road Intelligence Centers
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select an individual district to view its live camera feed, defect map, and manage municipal work orders.
            </p>
          </div>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200 self-start sm:self-auto">
          {districts.length} Districts Available
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {districts.map((d) => (
          <div
            key={d.id}
            onClick={() => onSelectDistrict(d)}
            className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-blue-500 transition cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold px-2 py-0.5 bg-blue-50 text-blue-800 rounded border border-blue-100">
                  {d.code}
                </span>
                <span className="text-xs text-blue-600 font-semibold flex items-center group-hover:translate-x-0.5 transition">
                  Open Dashboard <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1">{d.name}</h3>
              <p className="text-xs text-slate-500 mb-3 flex items-center">
                <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                Center: {d.centerLat.toFixed(4)}, {d.centerLon.toFixed(4)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
              <div className="bg-slate-50 p-2 rounded">
                <div className="text-[10px] text-slate-500 font-medium flex items-center">
                  <Bus className="w-3 h-3 mr-1 text-indigo-600" /> Buses Active
                </div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {d._count?.sessions || 0}
                </div>
              </div>

              <div className="bg-slate-50 p-2 rounded">
                <div className="text-[10px] text-slate-500 font-medium flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1 text-amber-600" /> Total Defects
                </div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {d._count?.events || 0}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
