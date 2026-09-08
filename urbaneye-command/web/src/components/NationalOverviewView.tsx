import React, { useEffect, useState, useRef, useMemo } from 'react';
import L from 'leaflet';
import { api } from '../services/api';
import { StateSummaryItem, HierarchySummary, State, District, DistrictSummaryItem } from '../types';
import {
  Bus, CheckCircle2, Activity, ArrowRight, RefreshCw, MapPin,
  Layers, Search, ArrowUpDown, ArrowUp, ArrowDown, Building2, ChevronRight, X,
} from 'lucide-react';

interface NationalOverviewViewProps {
  onSelectState: (state: State) => void;
  onSelectDistrict?: (district: District) => void;
}

type SortField = 'name' | 'districtsCount' | 'roadHealthScore' | 'newDefects' | 'resolutionRate';
type SortOrder = 'asc' | 'desc';

export const NationalOverviewView: React.FC<NationalOverviewViewProps> = ({
  onSelectState, onSelectDistrict,
}) => {
  const [loading, setLoading] = useState(true);
  const [states, setStates] = useState<StateSummaryItem[]>([]);
  const [summary, setSummary] = useState<HierarchySummary | null>(null);
  const [sortField, setSortField] = useState<SortField>('roadHealthScore');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStateItem, setSelectedStateItem] = useState<StateSummaryItem | null>(null);
  const [stateDistricts, setStateDistricts] = useState<DistrictSummaryItem[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getNationalSummary();
      setStates(res.states);
      setSummary(res.summary);
    } catch (err) {
      console.error('Failed to load national summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (!selectedStateItem) { setStateDistricts([]); return; }
    let isMounted = true;
    setLoadingDistricts(true);
    api.getStateSummary(selectedStateItem.id)
      .then((res) => { if (isMounted) setStateDistricts(res.districts); })
      .catch((err) => console.error('Failed to load districts:', err))
      .finally(() => { if (isMounted) setLoadingDistricts(false); });
    return () => { isMounted = false; };
  }, [selectedStateItem]);

  const getHealthMeta = (score: number) => {
    if (score >= 80) return { bg: '#1E7F73', badgeBg: 'bg-emerald-900/40 border-emerald-700 text-emerald-300', barBg: 'bg-[#1E7F73]', label: 'Optimal' };
    if (score >= 60) return { bg: '#d97706', badgeBg: 'bg-amber-900/40 border-amber-700 text-amber-300', barBg: 'bg-amber-500', label: 'Moderate' };
    return { bg: '#dc2626', badgeBg: 'bg-red-900/40 border-red-700 text-red-300', barBg: 'bg-red-600', label: 'Attention' };
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, { center: [22.8, 79.5], zoom: 5, zoomControl: true });
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors', maxZoom: 19,
      }).addTo(map);
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;
    }
    return () => {
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || states.length === 0) return;
    const layer = markersLayerRef.current;
    layer.clearLayers();
    states.forEach((st) => {
      const health = getHealthMeta(st.roadHealthScore);
      const isSelected = selectedStateItem?.id === st.id;
      const resRate = st.totalDefects > 0 ? Math.round((st.resolvedDefects / st.totalDefects) * 100) : 100;
      const iconHtml = `
        <div style="position:relative;width:48px;height:48px;display:flex;align-items:center;justify-content:center;cursor:pointer;">
          ${isSelected ? `<div style="position:absolute;width:56px;height:56px;border-radius:50%;border:3px solid ${health.bg};opacity:0.7;animation:pulse-ring 1.8s infinite;"></div>` : ''}
          <div style="width:42px;height:42px;border-radius:50%;background-color:#0f172a;border:3px solid ${health.bg};box-shadow:0 4px 12px rgba(0,0,0,0.35);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;transition:transform 0.15s ease-in-out;">
            <span style="color:#94a3b8;font-size:9px;font-weight:700;line-height:1;">${st.code}</span>
            <span style="color:${health.bg};font-size:13px;font-weight:900;line-height:1.1;">${st.roadHealthScore}</span>
          </div>
        </div>`;
      const customIcon = L.divIcon({ className: 'custom-state-health-marker', html: iconHtml, iconSize: [48, 48], iconAnchor: [24, 24], popupAnchor: [0, -24] });
      const marker = L.marker([st.centerLat, st.centerLon], { icon: customIcon });
      const popupDiv = document.createElement('div');
      popupDiv.style.minWidth = '240px';
      popupDiv.style.fontFamily = 'Inter, -apple-system, sans-serif';
      popupDiv.innerHTML = `
        <div style="padding:2px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
            <div style="display:flex;align-items:center;gap:6px;">
              <h4 style="font-size:14px;font-weight:800;color:#0f172a;margin:0;">${st.name}</h4>
              <span style="font-size:10px;font-weight:700;background:#e2e8f0;color:#334155;padding:1px 5px;border-radius:3px;">${st.code}</span>
            </div>
            <span style="font-size:11px;font-weight:800;color:${health.bg};">${health.label}</span>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;font-size:12px;">
            <span style="color:#64748b;font-weight:500;">Road Health Index:</span>
            <span style="font-size:14px;font-weight:900;color:#0f172a;">${st.roadHealthScore}<span style="font-size:10px;color:#94a3b8;">/100</span></span>
          </div>
          <div style="width:100%;height:5px;background:#e2e8f0;border-radius:999px;overflow:hidden;margin-bottom:8px;">
            <div style="width:${st.roadHealthScore}%;height:100%;background-color:${health.bg};"></div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:4px;font-size:11px;margin-bottom:8px;color:#475569;">
            <div><strong>Districts Live:</strong> ${st.districtsCount}</div>
            <div><strong>Active Sensors:</strong> ${st.activeBusesCount}</div>
            <div><strong>New Defects:</strong> ${st.newDefects}</div>
            <div><strong>Resolution:</strong> ${resRate}%</div>
          </div>
          <button id="btn-select-state-map-${st.id}" style="width:100%;background-color:#10233D;color:#fff;border:none;padding:6px 10px;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px;">
            <span>Filter to ${st.name} Districts</span> →
          </button>
        </div>`;
      setTimeout(() => {
        const btn = document.getElementById(`btn-select-state-map-${st.id}`);
        if (btn) btn.onclick = (e) => {
          e.stopPropagation();
          setSelectedStateItem(st);
          if (mapInstanceRef.current) mapInstanceRef.current.setView([st.centerLat, st.centerLon], 7, { animate: true });
        };
      }, 50);
      marker.bindPopup(popupDiv);
      marker.on('click', () => setSelectedStateItem(st));
      marker.addTo(layer);
    });
  }, [states, selectedStateItem]);

  const processedStates = useMemo(() => {
    let result = states.map((st) => ({
      ...st,
      resolutionRate: st.totalDefects > 0 ? Math.round((st.resolvedDefects / st.totalDefects) * 100) : 100,
    }));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((st) => st.name.toLowerCase().includes(q) || st.code.toLowerCase().includes(q));
    }
    result.sort((a, b) => {
      let valA: any = (a as any)[sortField];
      let valB: any = (b as any)[sortField];
      if (typeof valA === 'string') { valA = valA.toLowerCase(); valB = valB.toLowerCase(); }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [states, searchQuery, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortOrder((p) => (p === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortOrder(field === 'name' ? 'asc' : 'desc'); }
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-slate-500 ml-1 opacity-60" />;
    return sortOrder === 'asc'
      ? <ArrowUp className="w-3 h-3 text-slate-200 ml-1" />
      : <ArrowDown className="w-3 h-3 text-slate-200 ml-1" />;
  };

  const handleOpenDistrict = (dist: DistrictSummaryItem) => {
    if (onSelectDistrict) {
      onSelectDistrict({ id: dist.id, code: dist.code, name: dist.name, stateId: selectedStateItem?.id || '', centerLat: dist.centerLat, centerLon: dist.centerLon });
    } else if (selectedStateItem) {
      onSelectState({ id: selectedStateItem.id, code: selectedStateItem.code, name: selectedStateItem.name, centerLat: selectedStateItem.centerLat, centerLon: selectedStateItem.centerLon });
    }
  };

  /* ── dark tokens ── */
  const card     = 'bg-slate-800 border-slate-700';
  const miniCard = 'bg-slate-900/60 border-slate-700';
  const label    = 'text-slate-400';
  const numClr   = 'text-white';
  const hint     = 'text-slate-500';

  return (
    <div className="space-y-5">
      {/* ── Top Summary Strip ──────────────────────────────────────── */}
      <div className={`rounded-xl border shadow-sm p-5 ${card}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#10233D] text-white tracking-wide">MoRTH National Directorate</span>
              <span className={`text-xs font-semibold ${label}`}>Live Highway Surveillance</span>
            </div>
            <h1 className={`text-xl font-black tracking-tight mt-1 ${numClr}`}>National Road Network Health &amp; Surveillance</h1>
            <p className={`text-xs mt-0.5 ${hint}`}>Live state-level telemetry synthesized from continuous bus-mounted edge-AI camera inference across operational transit fleets.</p>
          </div>
          <button
            onClick={loadData} disabled={loading}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-600 bg-slate-700 hover:bg-slate-600 text-slate-200 transition flex items-center space-x-1.5 self-start sm:self-auto shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync National Feed</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: <Building2 className="w-3.5 h-3.5 text-slate-400" />, label: 'States Onboarded', value: states.length, hint: 'Operational state command nodes', cls: numClr },
            { icon: <Bus className="w-3.5 h-3.5 text-[#1E7F73]" />, label: 'Active Bus Sensors', value: summary?.totalActiveBuses || 0, hint: 'Patrolling public transit fleet', cls: numClr, live: true },
            { icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#1E7F73]" />, label: 'Defects Resolved to Date', value: summary?.totalResolvedDefects || 0, hint: 'Repaired & verified by PWD', cls: numClr },
            { icon: <Activity className="w-3.5 h-3.5 text-slate-400" />, label: 'National Road Health', value: summary?.averageRoadHealthIndex || 100, hint: 'Weighted national health index', cls: numClr, suffix: '/100' },
          ].map((m, i) => (
            <div key={i} className={`p-3.5 rounded-xl border ${miniCard}`}>
              <span className={`text-[11px] font-semibold ${label} flex items-center space-x-1 mb-1`}>
                {m.icon}<span>{m.label}</span>
              </span>
              <div className={`text-2xl font-black ${m.cls} flex items-baseline space-x-1.5`}>
                <span>{m.value}</span>
                {m.live && <span className="text-xs font-semibold text-[#1E7F73] flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-[#1E7F73] mr-1 animate-pulse" />Live</span>}
                {m.suffix && <span className="text-xs font-bold text-slate-500">{m.suffix}</span>}
              </div>
              <span className={`text-[10px] ${hint}`}>{m.hint}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Map + Ranked Table ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Map */}
        <div className={`lg:col-span-7 rounded-xl border shadow-sm overflow-hidden flex flex-col ${card}`}>
          <div className={`p-3.5 border-b flex items-center justify-between ${miniCard}`}>
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
              <Layers className="w-4 h-4 text-[#1E7F73]" />
              <span>State Road Health Distribution (Leaflet)</span>
            </div>
            <span className={`text-[11px] font-medium ${hint}`}>Shaded by Road Health Index</span>
          </div>
          <div className="h-[480px] w-full relative">
            <div ref={mapContainerRef} className="w-full h-full" />
            <div className="absolute bottom-4 left-4 z-[500] bg-slate-900/90 backdrop-blur-md text-white border border-white/10 rounded-lg p-2.5 text-xs shadow-lg">
              <div className="font-semibold text-slate-200 text-[11px] mb-1.5">Road Health Index Scale</div>
              <div className="space-y-1 text-[10px]">
                {[['#1E7F73','80 – 100: Optimal Health'],['#d97706','60 – 79: Moderate Health'],['#dc2626','< 60: Degraded / Attention']].map(([c, t]) => (
                  <div key={c} className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full inline-block shrink-0" style={{ backgroundColor: c }} />
                    <span className="text-slate-200 font-medium">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Ranked Table */}
        <div className={`lg:col-span-5 rounded-xl border shadow-sm flex flex-col overflow-hidden ${card}`}>
          <div className={`p-3.5 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ${miniCard}`}>
            <div>
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                <span>State Health Rankings</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-300">{processedStates.length}</span>
              </h2>
              <span className={`text-[11px] ${hint}`}>Click any row to filter to its live districts</span>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter states..."
                className="w-full sm:w-36 pl-8 pr-2.5 py-1 text-xs border border-slate-600 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1E7F73] bg-slate-900 text-slate-200 placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[440px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-900 text-slate-400 font-bold sticky top-0 z-10 border-b border-slate-700 text-[11px]">
                <tr>
                  {(['name','districtsCount','roadHealthScore','newDefects','resolutionRate'] as SortField[]).map((f, i) => (
                    <th key={f} onClick={() => handleSort(f)}
                      className={`py-2.5 ${i===0?'px-3':i===1?'px-2 text-center':i===4?'px-3 text-right':'px-2.5 text-right'} cursor-pointer hover:bg-slate-800 transition`}>
                      <div className={`flex items-center ${i===0?'':'justify-'+(i===1?'center':'end')}`}>
                        <span>{['State','Districts','Health Index','New Defects','Resolution'][i]}</span>
                        {renderSortIndicator(f)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {processedStates.length === 0 ? (
                  <tr><td colSpan={5} className={`py-8 text-center text-xs ${hint}`}>No matching state jurisdictions found.</td></tr>
                ) : processedStates.map((st, idx) => {
                  const health = getHealthMeta(st.roadHealthScore);
                  const isSelected = selectedStateItem?.id === st.id;
                  return (
                    <tr
                      key={st.id}
                      onClick={() => { setSelectedStateItem(st); if (mapInstanceRef.current) mapInstanceRef.current.setView([st.centerLat, st.centerLon], 7, { animate: true }); }}
                      className={`cursor-pointer transition ${isSelected ? 'bg-slate-700/50' : 'hover:bg-slate-700/30'}`}
                    >
                      <td className="py-2.5 px-3">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-bold ${hint} w-4`}>#{idx+1}</span>
                          <div>
                            <div className={`font-bold ${numClr} flex items-center space-x-1.5`}>
                              <span>{st.name}</span>
                              <span className="text-[10px] font-semibold bg-slate-700 text-slate-300 px-1 rounded">{st.code}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className={`py-2.5 px-2 text-center font-semibold ${label}`}>{st.districtsCount}</td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <div className="w-12 h-1.5 bg-slate-700 rounded-full overflow-hidden hidden sm:block">
                            <div className={`h-full ${health.barBg}`} style={{ width: `${st.roadHealthScore}%` }} />
                          </div>
                          <span className={`font-black text-xs px-1.5 py-0.5 rounded border ${health.badgeBg}`}>{st.roadHealthScore}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2.5 text-right font-semibold">
                        {st.newDefects > 0 ? <span className="text-red-400 font-bold">{st.newDefects}</span> : <span className={hint}>0</span>}
                      </td>
                      <td className={`py-2.5 px-3 text-right font-bold ${label}`}>{st.resolutionRate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── District Drilldown Panel ────────────────────────────────── */}
      {selectedStateItem && (
        <div className={`rounded-xl border shadow-sm p-4 ${card}`}>
          <div className={`flex items-center justify-between pb-3 border-b border-slate-700 mb-3`}>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-[#1E7F73]" />
              <h3 className={`text-sm font-bold ${numClr}`}>Operational Districts in {selectedStateItem.name} ({selectedStateItem.code})</h3>
              <span className={`text-xs font-normal ${hint}`}>Click any district to open its Command page</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onSelectState({ id: selectedStateItem.id, code: selectedStateItem.code, name: selectedStateItem.name, centerLat: selectedStateItem.centerLat, centerLon: selectedStateItem.centerLon })}
                className="text-xs text-slate-300 hover:text-white font-semibold flex items-center px-2 py-1 rounded border border-slate-600 hover:bg-slate-700 transition"
              >
                <span>Full State Command View</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </button>
              <button onClick={() => setSelectedStateItem(null)} className={`p-1 ${label} hover:text-slate-200 rounded`} title="Close">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {loadingDistricts ? (
            <div className={`py-8 flex justify-center items-center text-xs ${hint} space-x-2`}>
              <RefreshCw className="w-4 h-4 animate-spin" /><span>Loading operational districts for {selectedStateItem.name}...</span>
            </div>
          ) : stateDistricts.length === 0 ? (
            <div className={`py-6 text-center text-xs ${hint}`}>No live districts found for this state.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {stateDistricts.map((dist) => {
                const dHealth = getHealthMeta(dist.roadHealthScore);
                const isKapurthala = dist.code === 'PB-KAP' || dist.name.includes('Kapurthala');
                return (
                  <div
                    key={dist.id}
                    onClick={() => handleOpenDistrict(dist)}
                    className={`p-3.5 rounded-lg border hover:border-[#1E7F73] bg-slate-900/50 hover:bg-slate-700/50 hover:shadow-md transition cursor-pointer flex flex-col justify-between group ${miniCard}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[11px] font-bold ${label} bg-slate-800 px-1.5 py-0.5 rounded border border-slate-600`}>{dist.code}</span>
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border ${dHealth.badgeBg}`}>Health: {dist.roadHealthScore}/100</span>
                      </div>
                      <h4 className={`text-sm font-bold ${numClr} group-hover:text-white flex items-center`}>
                        <span>{dist.name}</span>
                        {isKapurthala && <span className="ml-1 text-[10px] font-bold text-amber-400 bg-amber-900/30 border border-amber-700/50 px-1 rounded">★ Primary Seed</span>}
                      </h4>
                      <div className={`mt-2 text-xs ${label} space-y-1`}>
                        <div className="flex justify-between"><span>Active Bus Patrols:</span><span className={`font-semibold ${numClr}`}>{dist.activeBusesCount}</span></div>
                        <div className="flex justify-between"><span>New Alerts:</span><span className="font-semibold text-red-400">{dist.newDefects}</span></div>
                        <div className="flex justify-between"><span>Resolved:</span><span className="font-semibold text-[#1E7F73]">{dist.resolvedDefects}</span></div>
                      </div>
                    </div>
                    <div className={`mt-3 pt-2.5 border-t border-slate-700 flex items-center justify-between text-xs ${label} font-semibold group-hover:text-slate-200`}>
                      <span>Launch District Command</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
