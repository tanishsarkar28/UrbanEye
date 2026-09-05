import React from 'react';
import { State } from '../types';
import { MapPin, Bus, AlertTriangle, ArrowRight } from 'lucide-react';

interface StateSelectorProps {
  states: State[];
  onSelectState: (state: State) => void;
}

export const StateSelector: React.FC<StateSelectorProps> = ({ states, onSelectState }) => {
  return (
    <div className="space-y-4">
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              National Highway & Transit Infrastructure Overview
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select a state to inspect district jurisdictions, bus patrol fleets, and live road conditions.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
            {states.length} Active States
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {states.map((st) => {
          const totalDistricts = st.districts?.length || 0;
          const totalEvents = st.districts?.reduce((acc: number, d: any) => acc + (d._count?.events || 0), 0) || 0;
          const totalBuses = st.districts?.reduce((acc: number, d: any) => acc + (d._count?.sessions || 0), 0) || 0;

          return (
            <div
              key={st.id}
              onClick={() => onSelectState(st)}
              className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-blue-400 transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                    {st.code}
                  </span>
                  <span className="text-xs text-blue-600 font-semibold flex items-center group-hover:translate-x-0.5 transition">
                    Inspect State <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1">{st.name}</h3>
                <p className="text-xs text-slate-500 mb-4 flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {totalDistricts} Operational Districts
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
                <div className="bg-slate-50 p-2 rounded">
                  <div className="text-[10px] text-slate-500 font-medium flex items-center">
                    <Bus className="w-3 h-3 mr-1 text-indigo-600" /> Active Buses
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">{totalBuses}</div>
                </div>

                <div className="bg-slate-50 p-2 rounded">
                  <div className="text-[10px] text-slate-500 font-medium flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" /> Road Defects
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">{totalEvents}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
