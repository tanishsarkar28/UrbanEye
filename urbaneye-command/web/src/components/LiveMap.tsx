import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { RoadEvent, EventStatus } from '../types';

interface LiveMapProps {
  events: RoadEvent[];
  centerLat: number;
  centerLon: number;
  zoom?: number;
  onUpdateStatus?: (eventId: string, status: EventStatus, notes?: string) => void;
  onSelectEvent?: (event: RoadEvent) => void;
  latestEventId?: string | null;
}

const STATUS_METADATA: Record<EventStatus, { bg: string; text: string; label: string; symbol: string }> = {
  NEW: { bg: '#dc2626', text: '#ffffff', label: 'New Defect', symbol: '!' },
  ASSIGNED_FOR_REPAIR: { bg: '#d97706', text: '#ffffff', label: 'Assigned Repair', symbol: '⚙' },
  RESOLVED: { bg: '#1E7F73', text: '#ffffff', label: 'Resolved', symbol: '✓' },
  REVIEWED: { bg: '#475569', text: '#ffffff', label: 'Reviewed', symbol: '•' },
};

export const LiveMap: React.FC<LiveMapProps> = ({
  events,
  centerLat,
  centerLon,
  zoom = 12,
  onUpdateStatus,
  onSelectEvent,
  latestEventId,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const pulseCircleRef = useRef<L.CircleMarker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLon],
        zoom: zoom,
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

  // Update center when props change
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([centerLat, centerLon], zoom, { animate: true });
    }
  }, [centerLat, centerLon, zoom]);

  // Handle Latest Event Glow Effect
  useEffect(() => {
    if (!mapInstanceRef.current || !latestEventId) return;
    const latestEv = events.find((e) => e.id === latestEventId);
    if (!latestEv) return;

    // Pan map smoothly to the incoming live event
    mapInstanceRef.current.panTo([latestEv.latitude, latestEv.longitude], { animate: true });

    // Animated ripple circle marker
    if (pulseCircleRef.current) {
      pulseCircleRef.current.remove();
    }

    const circle = L.circleMarker([latestEv.latitude, latestEv.longitude], {
      radius: 26,
      fillColor: '#ef4444',
      fillOpacity: 0.3,
      color: '#dc2626',
      weight: 2,
    }).addTo(mapInstanceRef.current);

    pulseCircleRef.current = circle;

    const timer = setTimeout(() => {
      if (pulseCircleRef.current) {
        pulseCircleRef.current.remove();
        pulseCircleRef.current = null;
      }
    }, 6000);

    return () => clearTimeout(timer);
  }, [latestEventId, events]);

  // Update Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const layer = markersLayerRef.current;
    layer.clearLayers();

    events.forEach((event) => {
      const statusMeta = STATUS_METADATA[event.status] || STATUS_METADATA.NEW;
      const isNew = event.status === 'NEW';
      const isLatest = event.id === latestEventId;

      // Custom HTML Pin with Status Color & Pulse
      const iconHtml = `
        <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          ${
            isLatest
              ? `<div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background-color: ${statusMeta.bg}; opacity: 0.6; animation: pulse-ring 1.2s infinite;"></div>`
              : isNew
              ? `<div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background-color: ${statusMeta.bg}; opacity: 0.35; animation: pulse-ring 2s infinite;"></div>`
              : ''
          }
          <div style="
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background-color: ${statusMeta.bg};
            border: 2px solid #ffffff;
            box-shadow: 0 2px 6px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 11px;
            font-weight: 800;
            transition: transform 0.15s ease-in-out;
          ">
            ${statusMeta.symbol}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-road-marker',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
      });

      const marker = L.marker([event.latitude, event.longitude], { icon: customIcon });

      // Interactive Click opens Detail Panel
      marker.on('click', () => {
        if (onSelectEvent) {
          onSelectEvent(event);
        }
      });

      // Quick hover/click popup
      const dateStr = new Date(event.timestamp).toLocaleString();
      const popupDiv = document.createElement('div');
      popupDiv.style.minWidth = '220px';
      popupDiv.style.fontFamily = 'Inter, -apple-system, sans-serif';

      popupDiv.innerHTML = `
        <div style="padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 800; color: ${statusMeta.bg}; text-transform: uppercase;">
              ${event.type.replace('_', ' ')}
            </span>
            <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background-color: #f1f5f9; color: #334155;">
              ${Math.round(event.confidence * 100)}% Conf
            </span>
          </div>

          ${
            event.imageSnippet
              ? `<div style="margin-bottom: 8px; border-radius: 4px; overflow: hidden; border: 1px solid #e2e8f0; max-height: 100px;">
                  <img src="${event.imageSnippet.startsWith('data:') ? event.imageSnippet : `data:image/jpeg;base64,${event.imageSnippet}`}" alt="Camera snippet" style="width: 100%; height: 95px; object-fit: cover; display: block;" />
                </div>`
              : ''
          }

          <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">
            <strong>Bus:</strong> ${event.busLabel}
          </div>
          <div style="font-size: 10px; color: #64748b; margin-bottom: 4px;">
            <strong>GPS:</strong> ${event.latitude.toFixed(5)}, ${event.longitude.toFixed(5)}
          </div>
          <div style="font-size: 10px; color: #64748b; margin-bottom: 8px;">
            <strong>Detected:</strong> ${dateStr}
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 6px; border-top: 1px solid #f1f5f9;">
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${statusMeta.bg};">
              ${statusMeta.label}
            </span>
            <button id="btn-view-detail-${event.id}" style="
              background-color: #10233D;
              color: #ffffff;
              border: none;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 10px;
              font-weight: 700;
              cursor: pointer;
            ">
              Action Panel →
            </button>
          </div>
        </div>
      `;

      // Wire button inside popup
      setTimeout(() => {
        const btn = document.getElementById(`btn-view-detail-${event.id}`);
        if (btn) {
          btn.onclick = (e) => {
            e.stopPropagation();
            if (onSelectEvent) onSelectEvent(event);
          };
        }
      }, 50);

      marker.bindPopup(popupDiv);
      marker.addTo(layer);
    });
  }, [events, latestEventId, onSelectEvent]);

  return (
    <div className="relative w-full h-full min-h-[440px] bg-slate-100 rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Map Status Legend Overlay (Subtle, Translucent Frosted Style) */}
      <div className="absolute bottom-4 left-4 z-[500] bg-slate-900/85 backdrop-blur-md border border-white/10 rounded-lg shadow-lg p-2.5 text-xs text-white">
        <div className="font-semibold text-slate-300 text-[11px] mb-1.5 flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1E7F73] animate-pulse"></span>
          <span>Defect Status Overlay</span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#dc2626] inline-block shrink-0"></span>
            <span className="text-slate-200">New Alert</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#d97706] inline-block shrink-0"></span>
            <span className="text-slate-200">Assigned</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#1E7F73] inline-block shrink-0"></span>
            <span className="text-slate-200">Resolved</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#475569] inline-block shrink-0"></span>
            <span className="text-slate-200">Reviewed</span>
          </div>
        </div>
      </div>
    </div>
  );
};
