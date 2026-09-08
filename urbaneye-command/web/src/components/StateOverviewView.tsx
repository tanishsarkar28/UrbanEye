import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import { api } from '../services/api';
import { State, District, DistrictSummaryItem, HierarchySummary } from '../types';
import {
  Bus, AlertTriangle, Wrench, CheckCircle2, Activity,
  ArrowRight, ArrowLeft, RefreshCw, MapPin, Layers,
} from 'lucide-react';

interface StateOverviewViewProps {
  state: State;
  onSelectDistrict: (district: District) => void;
  onBack?: () => void;
  canGoBack?: boolean;
}

export const StateOverviewView: React.FC<StateOverviewViewProps> = ({
  state, onSelectDistrict, onBack, canGoBack = false,
}) => {
  const [loading, setLoading] = useState(true);
  const [districts, setDistricts] = useState<DistrictSummaryItem[]>([]);
  const [summary, setSummary] = useState<HierarchySummary | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getStateSummary(state.id);
      setDistricts(res.districts);
      setSummary(res.summary);
    } catch (err) {
      console.error('Failed to load state summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [state.id]);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [state.centerLat, state.centerLon], zoom: 8, zoomControl: true,
      });
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors', maxZoom: 19,
      }).addTo(map);
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([state.centerLat, state.centerLon], 8);
    }
    return () => {
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
    };
  }, [state.id]);

  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || districts.length === 0) return;
    const layer = markersLayerRef.current;
    layer.clearLayers();
    districts.forEach((dist) => {
      const getHealthColor = (s: number) => s >= 80 ? '#1E7F73' : s >= 60 ? '#d97706' : '#dc2626';
      const healthColor = getHealthColor(dist.roadHealthScore);
      const iconHtml = `
        <div style="position:relative;width:42px;height:42px;display:flex;align-items:center;justify-content:center;cursor:pointer;">
          <div style="width:36px;height:36px;border-radius:50%;background-color:#0f172a;border:2.5px solid ${healthColor};box-shadow:0 3px 8px rgba(0,0,0,0.35);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:800;">
            <span style="color:${healthColor};font-weight:900;">${dist.roadHealthScore}</span>
          </div>
        </div>`;
      const customIcon = L.divIcon({ className: 'custom-district-marker', html: iconHtml, iconSize: [42, 42], iconAnchor: [21, 21], popupAnchor: [0, -21] });
      const marker = L.marker([dist.centerLat, dist.centerLon], { icon: customIcon });
      const popupDiv = document.createElement('div');
      popupDiv.style.minWidth = '220px';
      popupDiv.style.fontFamily = 'Inter, sans-serif';
      popupDiv.innerHTML = `
        <div style="padding:2px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
            <h4 style="font-size:13px;font-weight:800;color:#0f172a;margin:0;">${dist.name}</h4>
            <span style="font-size:10px;font-weight:700;background:#e2e8f0;color:#334155;padding:2px 6px;border-radius:4px;">${dist.code}</span>
          </div>
          <div style="font-size:11px;color:#64748b;margin-bottom:8px;">Active Buses: <strong>${dist.activeBusesCount}</strong> • Road Health: <strong style="color:${healthColor};">${dist.roadHealthScore}/100</strong></div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;font-size:10px;margin-bottom:10px;text-align:center;">
            <div style="background:#fee2e2;color:#991b1b;padding:4px;border-radius:4px;font-weight:700;">${dist.newDefects} New</div>
            <div style="background:#fef3c7;color:#92400e;padding:4px;border-radius:4px;font-weight:700;">${dist.assignedDefects} Asgd</div>
            <div style="background:#ecfdf5;color:#065f46;padding:4px;border-radius:4px;font-weight:700;">${dist.resolvedDefects} Rslv</div>
          </div>
          <button id="btn-enter-district-${dist.id}" style="width:100%;background-color:#10233D;color:white;border:none;padding:6px;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;">Launch District Command →</button>
        </div>`;
      setTimeout(() => {
        const btn = document.getElementById(`btn-enter-district-${dist.id}`);
        if (btn) btn.onclick = () => onSelectDistrict({ id: dist.id, code: dist.code, name: dist.name, stateId: state.id, centerLat: dist.centerLat, centerLon: dist.centerLon });
      }, 50);
      marker.bindPopup(popupDiv);
      marker.addTo(layer);
    });
  }, [districts, state.id, onSelectDistrict]);

  /* ── shared dark tokens ── */
  const card     = 'bg-slate-800 border-slate-700';
  const miniCard = 'bg-slate-900/60 border-slate-700';
  const label    = 'text-slate-400';
  const numClr   = 'text-white';
  const hint     = 'text-slate-500';

  return (
    <div className="space-y-5">
      {/* ── Top Banner ──────────────────────────────────────────── */}
      <div className={`rounded-xl border shadow-sm p-5 ${card}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div className="flex items-center space-x-3">
            {canGoBack && onBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-lg border border-slate-600 hover:bg-slate-700 text-slate-300 transition"
                title="Return to National Overview"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#10233D] text-white">
                  State Administration: {state.name} ({state.code})
                </span>
                <span className={`text-xs font-semibold ${label}`}>{districts.length} District Jurisdictions</span>
              </div>
              <h1 className={`text-xl font-black tracking-tight mt-1 ${numClr}`}>
                {state.name} State Road Infrastructure Command
              </h1>
              <p className={`text-xs mt-0.5 ${hint}`}>
                Aggregated road intelligence across all districts, bus patrol fleets, and municipal work orders.
              </p>
            </div>
          </div>
          <button
            onClick={loadData} disabled={loading}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-600 bg-slate-700 hover:bg-slate-600 text-slate-200 transition flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync State Feed</span>
          </button>
        </div>

        {/* State Summary Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { icon: <Bus className="w-3.5 h-3.5 text-indigo-400" />, label: 'State Active Buses', value: summary?.totalActiveBuses || 0, hint: 'Patrolling Sensors', cls: numClr },
            { icon: <AlertTriangle className="w-3.5 h-3.5 text-red-400" />, label: 'New Defects', value: summary?.totalNewDefects || 0, hint: 'Unreviewed Ingestions', cls: 'text-red-400' },
            { icon: <Wrench className="w-3.5 h-3.5 text-orange-400" />, label: 'Assigned for Repair', value: summary?.totalAssignedDefects || 0, hint: 'PWD Work Orders', cls: 'text-orange-400' },
            { icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />, label: 'Defects Resolved', value: summary?.totalResolvedDefects || 0, hint: 'Completed Repairs', cls: 'text-emerald-400' },
            { icon: <Activity className="w-3.5 h-3.5 text-blue-400" />, label: 'State Road Health', value: summary?.averageRoadHealthIndex || 100, hint: 'Average District Score', cls: 'text-blue-400', suffix: '/100' },
          ].map((m, i) => (
            <div key={i} className={`p-3.5 rounded-xl border ${miniCard} ${i === 4 ? 'col-span-2 sm:col-span-1' : ''}`}>
              <span className={`text-[11px] font-semibold ${label} flex items-center space-x-1 mb-1`}>
                {m.icon}<span>{m.label}</span>
              </span>
              <div className={`text-2xl font-black ${m.cls}`}>
                {m.value}{m.suffix && <span className="text-xs font-bold text-slate-500 ml-0.5">{m.suffix}</span>}
              </div>
              <span className={`text-[10px] ${hint}`}>{m.hint}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── State Map ─────────────────────────────────────────────── */}
      <div className={`rounded-xl border shadow-sm overflow-hidden flex flex-col ${card}`}>
        <div className={`p-3.5 border-b flex items-center justify-between ${miniCard}`}>
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>{state.name} District Regional Intelligence Map</span>
          </div>
          <span className={`text-[11px] font-medium ${hint}`}>Click any district pin to open its live operational dashboard</span>
        </div>
        <div className="h-[440px] w-full relative">
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>
      </div>

      {/* ── District Cards Grid ────────────────────────────────────── */}
      <div>
        <h2 className={`text-sm font-bold uppercase tracking-wider mb-3 ${label}`}>
          District Operations ({districts.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {districts.map((d) => (
            <div
              key={d.id}
              onClick={() => onSelectDistrict({ id: d.id, code: d.code, name: d.name, stateId: state.id, centerLat: d.centerLat, centerLon: d.centerLon })}
              className={`rounded-xl border p-5 shadow-sm hover:shadow-lg hover:border-[#1E7F73] transition cursor-pointer flex flex-col justify-between group ${card}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-900/40 text-blue-300 border border-blue-700/50">
                    {d.code}
                  </span>
                  <span className="text-xs text-[#1E7F73] font-semibold flex items-center group-hover:translate-x-0.5 transition">
                    Open Dashboard <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </span>
                </div>
                <h3 className={`text-base font-bold mb-1 ${numClr}`}>{d.name}</h3>
                <p className={`text-xs mb-3 flex items-center ${hint}`}>
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-600" />
                  Center: {d.centerLat.toFixed(4)}, {d.centerLon.toFixed(4)}
                </p>
              </div>

              <div className={`space-y-2 pt-3 border-t border-slate-700 text-xs`}>
                <div className="flex items-center justify-between">
                  <span className={label}>Active Bus Sensors:</span>
                  <span className={`font-bold ${numClr}`}>{d.activeBusesCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={label}>Total Defect Events:</span>
                  <span className={`font-bold ${numClr}`}>{d.totalDefects}</span>
                </div>
                <div className="grid grid-cols-3 gap-1 pt-1 text-[10px] text-center font-bold">
                  <div className="bg-red-900/40 text-red-300 p-1.5 rounded border border-red-800/50">{d.newDefects} New</div>
                  <div className="bg-orange-900/40 text-orange-300 p-1.5 rounded border border-orange-800/50">{d.assignedDefects} Asgd</div>
                  <div className="bg-emerald-900/40 text-emerald-300 p-1.5 rounded border border-emerald-800/50">{d.resolvedDefects} Rslv</div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className={`text-[11px] font-medium ${label}`}>Road Health Index:</span>
                  <span className="text-xs font-extrabold text-blue-400">{d.roadHealthScore}/100</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
