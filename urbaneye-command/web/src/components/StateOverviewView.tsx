import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import { api } from '../services/api';
import { State, District, DistrictSummaryItem, HierarchySummary } from '../types';
import {
  Bus,
  AlertTriangle,
  Wrench,
  CheckCircle2,
  Activity,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  MapPin,
  Layers,
} from 'lucide-react';

interface StateOverviewViewProps {
  state: State;
  onSelectDistrict: (district: District) => void;
  onBack?: () => void;
  canGoBack?: boolean;
}

export const StateOverviewView: React.FC<StateOverviewViewProps> = ({
  state,
  onSelectDistrict,
  onBack,
  canGoBack = false,
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

  useEffect(() => {
    loadData();
  }, [state.id]);

  // Initialize State Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [state.centerLat, state.centerLon],
        zoom: 8,
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
    } else {
      mapInstanceRef.current.setView([state.centerLat, state.centerLon], 8);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [state.id]);

  // Update District Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || districts.length === 0) return;

    const layer = markersLayerRef.current;
    layer.clearLayers();

    districts.forEach((dist) => {
      // Custom HTML Pin for District
      const iconHtml = `
        <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <div style="
            width: 34px;
            height: 34px;
            border-radius: 50%;
            background-color: #1e293b;
            border: 2px solid #3b82f6;
            box-shadow: 0 3px 8px rgba(0,0,0,0.35);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 10px;
            font-weight: 800;
          ">
            <span>${dist.totalDefects}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-district-marker',
        html: iconHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20],
      });

      const marker = L.marker([dist.centerLat, dist.centerLon], { icon: customIcon });

      const popupDiv = document.createElement('div');
      popupDiv.style.minWidth = '220px';
      popupDiv.style.fontFamily = 'Inter, sans-serif';
      popupDiv.innerHTML = `
        <div style="padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <h4 style="font-size: 13px; font-weight: 800; color: #0f172a; margin: 0;">${dist.name}</h4>
            <span style="font-size: 10px; font-weight: 700; background: #eff6ff; color: #1d4ed8; padding: 2px 6px; border-radius: 4px;">
              ${dist.code}
            </span>
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
            Active Buses: <strong>${dist.activeBusesCount}</strong> • Road Health: <strong>${dist.roadHealthScore}/100</strong>
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; font-size: 10px; margin-bottom: 10px; text-align: center;">
            <div style="background: #fee2e2; color: #991b1b; padding: 4px; border-radius: 4px; font-weight: 700;">
              ${dist.newDefects} New
            </div>
            <div style="background: #ffedd5; color: #9a3412; padding: 4px; border-radius: 4px; font-weight: 700;">
              ${dist.assignedDefects} Asgd
            </div>
            <div style="background: #dcfce7; color: #166534; padding: 4px; border-radius: 4px; font-weight: 700;">
              ${dist.resolvedDefects} Rslv
            </div>
          </div>
          <button id="btn-enter-district-${dist.id}" style="
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
            Open ${dist.name} Dashboard →
          </button>
        </div>
      `;

      setTimeout(() => {
        const btn = document.getElementById(`btn-enter-district-${dist.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectDistrict({
              id: dist.id,
              code: dist.code,
              name: dist.name,
              stateId: state.id,
              centerLat: dist.centerLat,
              centerLon: dist.centerLon,
            });
          };
        }
      }, 50);

      marker.bindPopup(popupDiv);
      marker.addTo(layer);
    });
  }, [districts, state.id, onSelectDistrict]);

  return (
    <div className="space-y-5">
      {/* Top Banner & State Summary Strip */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div className="flex items-center space-x-3">
            {canGoBack && onBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 transition"
                title="Return to National Overview"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  State Administration: {state.name} ({state.code})
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {districts.length} District Jurisdictions
                </span>
              </div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight mt-1">
                {state.name} State Road Infrastructure Command
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Aggregated road intelligence across all districts, bus patrol fleets, and municipal work orders.
              </p>
            </div>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync State Feed</span>
          </button>
        </div>

        {/* State Summary Counters Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center space-x-1 mb-1">
              <Bus className="w-3.5 h-3.5 text-indigo-600" />
              <span>State Active Buses</span>
            </span>
            <div className="text-2xl font-black text-slate-900">
              {summary?.totalActiveBuses || 0}
            </div>
            <span className="text-[10px] text-slate-400">Patrolling Sensors</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center space-x-1 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              <span>New Defects</span>
            </span>
            <div className="text-2xl font-black text-red-600">
              {summary?.totalNewDefects || 0}
            </div>
            <span className="text-[10px] text-slate-400">Unreviewed Ingestions</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center space-x-1 mb-1">
              <Wrench className="w-3.5 h-3.5 text-orange-600" />
              <span>Assigned for Repair</span>
            </span>
            <div className="text-2xl font-black text-orange-600">
              {summary?.totalAssignedDefects || 0}
            </div>
            <span className="text-[10px] text-slate-400">PWD Work Orders</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center space-x-1 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Defects Resolved</span>
            </span>
            <div className="text-2xl font-black text-emerald-600">
              {summary?.totalResolvedDefects || 0}
            </div>
            <span className="text-[10px] text-slate-400">Completed Repairs</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center space-x-1 mb-1">
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              <span>State Road Health</span>
            </span>
            <div className="text-2xl font-black text-blue-600">
              {summary?.averageRoadHealthIndex || 100}
              <span className="text-xs font-bold text-slate-400 ml-0.5">/100</span>
            </div>
            <span className="text-[10px] text-slate-400">Average District Score</span>
          </div>
        </div>
      </div>

      {/* Interactive State Map */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>{state.name} District Regional Intelligence Map</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Click any district pin to open its live operational dashboard
          </span>
        </div>
        <div className="h-[440px] w-full relative">
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>
      </div>

      {/* District Cards Grid */}
      <div>
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
          District Operations ({districts.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {districts.map((d) => (
            <div
              key={d.id}
              onClick={() =>
                onSelectDistrict({
                  id: d.id,
                  code: d.code,
                  name: d.name,
                  stateId: state.id,
                  centerLat: d.centerLat,
                  centerLon: d.centerLon,
                })
              }
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-blue-500 transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-800 border border-blue-100">
                    {d.code}
                  </span>
                  <span className="text-xs text-blue-600 font-semibold flex items-center group-hover:translate-x-0.5 transition">
                    Open Dashboard <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1">{d.name}</h3>
                <p className="text-xs text-slate-500 mb-3 flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Center: {d.centerLat.toFixed(4)}, {d.centerLon.toFixed(4)}
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Active Bus Sensors:</span>
                  <span className="font-bold text-slate-900">{d.activeBusesCount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Total Defect Events:</span>
                  <span className="font-bold text-slate-900">{d.totalDefects}</span>
                </div>

                <div className="grid grid-cols-3 gap-1 pt-1 text-[10px] text-center font-bold">
                  <div className="bg-red-50 text-red-700 p-1.5 rounded border border-red-100">
                    {d.newDefects} New
                  </div>
                  <div className="bg-orange-50 text-orange-700 p-1.5 rounded border border-orange-100">
                    {d.assignedDefects} Asgd
                  </div>
                  <div className="bg-emerald-50 text-emerald-700 p-1.5 rounded border border-emerald-100">
                    {d.resolvedDefects} Rslv
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500 font-medium">Road Health Index:</span>
                  <span className="text-xs font-extrabold text-blue-700">{d.roadHealthScore}/100</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
