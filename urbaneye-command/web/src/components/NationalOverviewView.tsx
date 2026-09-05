import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import { api } from '../services/api';
import { StateSummaryItem, HierarchySummary, State } from '../types';
import {
  Bus,
  AlertTriangle,
  Wrench,
  CheckCircle2,
  Activity,
  ArrowRight,
  RefreshCw,
  MapPin,
  Shield,
  Layers,
} from 'lucide-react';

interface NationalOverviewViewProps {
  onSelectState: (state: State) => void;
}

export const NationalOverviewView: React.FC<NationalOverviewViewProps> = ({ onSelectState }) => {
  const [loading, setLoading] = useState(true);
  const [states, setStates] = useState<StateSummaryItem[]>([]);
  const [summary, setSummary] = useState<HierarchySummary | null>(null);
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

  useEffect(() => {
    loadData();
  }, []);

  // Initialize National Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [22.8, 79.5], // Center of India
        zoom: 5,
        zoomControl: true,
      });

      // OpenStreetMap standard tiles (100% key-free, no watermarks)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update State Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || states.length === 0) return;

    const layer = markersLayerRef.current;
    layer.clearLayers();

    states.forEach((st) => {
      // Custom HTML Pin for State
      const iconHtml = `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <div style="
            width: 38px;
            height: 38px;
            border-radius: 10px;
            background-color: #0f172a;
            border: 2px solid #38bdf8;
            box-shadow: 0 4px 10px rgba(0,0,0,0.4);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 11px;
            font-weight: 800;
            line-height: 1;
          ">
            <span style="color: #38bdf8; font-size: 10px;">${st.code}</span>
            <span style="font-size: 11px; font-weight: 900; margin-top: 1px;">${st.totalDefects}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-state-marker',
        html: iconHtml,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        popupAnchor: [0, -22],
      });

      const marker = L.marker([st.centerLat, st.centerLon], { icon: customIcon });

      const popupDiv = document.createElement('div');
      popupDiv.style.minWidth = '220px';
      popupDiv.style.fontFamily = 'Inter, sans-serif';
      popupDiv.innerHTML = `
        <div style="padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <h4 style="font-size: 13px; font-weight: 800; color: #0f172a; margin: 0;">${st.name}</h4>
            <span style="font-size: 10px; font-weight: 700; background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px;">
              ${st.code}
            </span>
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
            ${st.districtsCount} Operational Districts • ${st.activeBusesCount} Active Buses
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; font-size: 10px; margin-bottom: 10px; text-align: center;">
            <div style="background: #fee2e2; color: #991b1b; padding: 4px; border-radius: 4px; font-weight: 700;">
              ${st.newDefects} New
            </div>
            <div style="background: #ffedd5; color: #9a3412; padding: 4px; border-radius: 4px; font-weight: 700;">
              ${st.assignedDefects} Asgd
            </div>
            <div style="background: #dcfce7; color: #166534; padding: 4px; border-radius: 4px; font-weight: 700;">
              ${st.resolvedDefects} Rslv
            </div>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; margin-bottom: 8px;">
            <span style="color: #475569; font-weight: 600;">Road Health Index:</span>
            <span style="font-weight: 800; color: ${st.roadHealthScore >= 80 ? '#16a34a' : '#d97706'};">
              ${st.roadHealthScore}/100
            </span>
          </div>
          <button id="btn-drill-state-${st.id}" style="
            width: 100%;
            background-color: #2563eb;
            color: white;
            border: none;
            padding: 6px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
          ">
            Drill Down into ${st.name} →
          </button>
        </div>
      `;

      setTimeout(() => {
        const btn = document.getElementById(`btn-drill-state-${st.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectState({
              id: st.id,
              code: st.code,
              name: st.name,
              centerLat: st.centerLat,
              centerLon: st.centerLon,
            });
          };
        }
      }, 50);

      marker.bindPopup(popupDiv);
      marker.on('click', () => {
        // Can directly select or let user click popup
      });

      marker.addTo(layer);
    });
  }, [states, onSelectState]);

  return (
    <div className="space-y-5">
      {/* Top Banner & Summary Strip */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                MoRTH National Directorate
              </span>
              <span className="text-xs font-semibold text-slate-500">Live Highway Surveillance</span>
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight mt-1">
              All-India Edge-AI Road Intelligence Surveillance
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live nation-wide aggregate rollups synthesized from continuous bus-mounted edge-AI camera inference.
            </p>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync National Feed</span>
          </button>
        </div>

        {/* National Summary Counters Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center space-x-1 mb-1">
              <Bus className="w-3.5 h-3.5 text-indigo-600" />
              <span>Active Bus Patrols</span>
            </span>
            <div className="text-2xl font-black text-slate-900">
              {summary?.totalActiveBuses || 0}
            </div>
            <span className="text-[10px] text-slate-400">Nationwide Fleet Sensors</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center space-x-1 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              <span>New Road Defects</span>
            </span>
            <div className="text-2xl font-black text-red-600">
              {summary?.totalNewDefects || 0}
            </div>
            <span className="text-[10px] text-slate-400">Pending Authority Review</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center space-x-1 mb-1">
              <Wrench className="w-3.5 h-3.5 text-orange-600" />
              <span>Assigned for Repair</span>
            </span>
            <div className="text-2xl font-black text-orange-600">
              {summary?.totalAssignedDefects || 0}
            </div>
            <span className="text-[10px] text-slate-400">PWD Work Orders Issued</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center space-x-1 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Defects Resolved</span>
            </span>
            <div className="text-2xl font-black text-emerald-600">
              {summary?.totalResolvedDefects || 0}
            </div>
            <span className="text-[10px] text-slate-400">Repaired & Verified</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center space-x-1 mb-1">
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              <span>National Health Index</span>
            </span>
            <div className="text-2xl font-black text-blue-600">
              {summary?.averageRoadHealthIndex || 100}
              <span className="text-xs font-bold text-slate-400 ml-0.5">/100</span>
            </div>
            <span className="text-[10px] text-slate-400">Aggregated Quality Metric</span>
          </div>
        </div>
      </div>

      {/* National Interactive Map */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>National Surveillance Map (State Rollups)</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Click any state pin to inspect its district network
          </span>
        </div>
        <div className="h-[460px] w-full relative">
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>
      </div>

      {/* State Cards Grid */}
      <div>
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center space-x-2">
          <span>State Jurisdictions ({states.length})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {states.map((st) => (
            <div
              key={st.id}
              onClick={() =>
                onSelectState({
                  id: st.id,
                  code: st.code,
                  name: st.name,
                  centerLat: st.centerLat,
                  centerLon: st.centerLon,
                })
              }
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md hover:border-blue-500 transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                    {st.code}
                  </span>
                  <span className="text-xs text-blue-600 font-semibold flex items-center group-hover:translate-x-0.5 transition">
                    Drill Down <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1">{st.name}</h3>
                <p className="text-xs text-slate-500 mb-3 flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {st.districtsCount} Operational Districts
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Active Bus Sensors:</span>
                  <span className="font-bold text-slate-900">{st.activeBusesCount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Total Defect Events:</span>
                  <span className="font-bold text-slate-900">{st.totalDefects}</span>
                </div>

                <div className="grid grid-cols-3 gap-1 pt-1 text-[10px] text-center font-bold">
                  <div className="bg-red-50 text-red-700 p-1.5 rounded border border-red-100">
                    {st.newDefects} New
                  </div>
                  <div className="bg-orange-50 text-orange-700 p-1.5 rounded border border-orange-100">
                    {st.assignedDefects} Asgd
                  </div>
                  <div className="bg-emerald-50 text-emerald-700 p-1.5 rounded border border-emerald-100">
                    {st.resolvedDefects} Rslv
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500 font-medium">Road Health Index:</span>
                  <span className="text-xs font-extrabold text-blue-700">{st.roadHealthScore}/100</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
