import React, { useState } from 'react';
import { RoadEvent, EventStatus, DefectType } from '../types';
import { Eye, CheckCircle2, Wrench, Filter, AlertTriangle, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface DefectTableProps {
  events: RoadEvent[];
  onUpdateStatus: (eventId: string, status: EventStatus, notes?: string) => Promise<void>;
  onSelectEvent?: (event: RoadEvent) => void;
  onDeleteEvent?: (eventId: string) => Promise<void>;
  onPurgeEvents?: () => Promise<void>;
  isLoading?: boolean;
}

export const DefectTable: React.FC<DefectTableProps> = ({
  events,
  onUpdateStatus,
  onSelectEvent,
  onDeleteEvent,
  onPurgeEvents,
  isLoading = false,
}) => {
  const { isDark } = useTheme();

  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [purging, setPurging] = useState(false);
  const [notesModalEvent, setNotesModalEvent] = useState<{ id: string; targetStatus: EventStatus } | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  /* ── Theme tokens ──────────────────────────────────────────── */
  const wrap      = isDark ? 'bg-slate-800 border-slate-700'   : 'bg-white border-slate-200';
  const hdrBg     = isDark ? 'bg-slate-900/60 border-slate-700' : 'bg-slate-50 border-slate-200';
  const titleClr  = isDark ? 'text-white'    : 'text-slate-900';
  const labelClr  = isDark ? 'text-slate-400' : 'text-slate-600';
  const countBg   = isDark ? 'bg-slate-700 text-slate-300'     : 'bg-slate-200 text-slate-700';
  const inputCls  = isDark
    ? 'bg-slate-900 border-slate-600 text-slate-200 placeholder:text-slate-500 focus:ring-[#1E7F73]'
    : 'bg-white border-slate-300 text-slate-800 focus:ring-slate-800';
  const theadBg   = isDark ? 'bg-slate-900 text-slate-400 border-slate-700'  : 'bg-slate-100 text-slate-700 border-slate-200';
  const rowHover  = isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50';
  const divider   = isDark ? 'divide-slate-700' : 'divide-slate-100';
  const cellMain  = isDark ? 'text-slate-200' : 'text-slate-900';
  const cellSub   = isDark ? 'text-slate-500' : 'text-slate-500';
  const cellMono  = isDark ? 'text-slate-400' : 'text-slate-600';
  const thumbBg   = isDark ? 'bg-slate-700 border-slate-600 text-slate-500' : 'bg-slate-100 border-slate-300 text-slate-400';
  const actionBtn = isDark
    ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
    : 'bg-slate-100 hover:bg-slate-200 text-slate-700';
  const emptyClr  = isDark ? 'text-slate-500' : 'text-slate-400';
  const emptyIcon = isDark ? 'text-slate-600' : 'text-slate-300';

  /* ── Filtering ─────────────────────────────────────────────── */
  const filteredEvents = events.filter((e) => {
    if (selectedStatus !== 'ALL' && e.status !== selectedStatus) return false;
    if (selectedType !== 'ALL' && e.type !== selectedType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!e.busLabel.toLowerCase().includes(q) &&
          !(e.district?.name.toLowerCase().includes(q)) &&
          !e.type.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  /* ── Status change ─────────────────────────────────────────── */
  const handleStatusClick = (eventId: string, targetStatus: EventStatus) => {
    setNotesModalEvent({ id: eventId, targetStatus });
    setReviewNote('');
    setModalError(null);
  };

  const submitStatusChange = async () => {
    if (!notesModalEvent) return;
    try {
      setActionLoadingId(notesModalEvent.id);
      setModalError(null);
      await onUpdateStatus(notesModalEvent.id, notesModalEvent.targetStatus, reviewNote);
      setNotesModalEvent(null);
    } catch (err: any) {
      setModalError(err.message || 'Failed to update status');
    } finally {
      setActionLoadingId(null);
    }
  };

  /* ── Badges ────────────────────────────────────────────────── */
  const getStatusBadge = (status: EventStatus) => {
    if (isDark) {
      switch (status) {
        case 'NEW':               return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-900/50 text-red-300 border border-red-700">NEW ALERT</span>;
        case 'REVIEWED':          return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-700 text-slate-300 border border-slate-600">REVIEWED</span>;
        case 'ASSIGNED_FOR_REPAIR': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-900/50 text-amber-300 border border-amber-700">ASSIGNED REPAIR</span>;
        case 'RESOLVED':          return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-900/50 text-emerald-300 border border-emerald-700">RESOLVED</span>;
      }
    }
    switch (status) {
      case 'NEW':               return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-50 text-red-700 border border-red-200">NEW ALERT</span>;
      case 'REVIEWED':          return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">REVIEWED</span>;
      case 'ASSIGNED_FOR_REPAIR': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">ASSIGNED REPAIR</span>;
      case 'RESOLVED':          return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">RESOLVED</span>;
    }
  };

  const getTypeBadge = (type: DefectType) => {
    if (isDark) {
      switch (type) {
        case 'POTHOLE':        return <span className="font-semibold text-red-300 bg-red-900/40 px-2 py-0.5 rounded border border-red-800 text-xs">Pothole</span>;
        case 'ROAD_CRACK':     return <span className="font-semibold text-amber-300 bg-amber-900/40 px-2 py-0.5 rounded border border-amber-800 text-xs">Road Crack</span>;
        case 'SURFACE_DAMAGE': return <span className="font-semibold text-orange-300 bg-orange-900/40 px-2 py-0.5 rounded border border-orange-800 text-xs">Surface Wear</span>;
        case 'WATERLOGGING':   return <span className="font-semibold text-blue-300 bg-blue-900/40 px-2 py-0.5 rounded border border-blue-800 text-xs">Waterlogging</span>;
        case 'VEHICLE_FLOW':   return <span className="font-semibold text-purple-300 bg-purple-900/40 px-2 py-0.5 rounded border border-purple-800 text-xs">Traffic Stream</span>;
      }
    }
    switch (type) {
      case 'POTHOLE':        return <span className="font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200 text-xs">Pothole</span>;
      case 'ROAD_CRACK':     return <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-xs">Road Crack</span>;
      case 'SURFACE_DAMAGE': return <span className="font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200 text-xs">Surface Wear</span>;
      case 'WATERLOGGING':   return <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-xs">Waterlogging</span>;
      case 'VEHICLE_FLOW':   return <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 text-xs">Traffic Stream</span>;
    }
  };

  return (
    <div className={`rounded-lg shadow-sm border overflow-hidden transition-colors duration-300 ${wrap}`}>

      {/* ── Header Controls ──────────────────────────────────── */}
      <div className={`p-4 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-3 ${hdrBg}`}>
        <div className="flex items-center space-x-2">
          <AlertTriangle className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-700'}`} />
          <h3 className={`text-sm font-bold tracking-tight ${titleClr}`}>Edge-AI Detection Register</h3>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${countBg}`}>
            {filteredEvents.length} events
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <input
            type="text"
            placeholder="Search bus, route, defect..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`px-3 py-1.5 border rounded-md focus:outline-none focus:ring-1 text-xs ${inputCls}`}
          />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className={`px-2.5 py-1.5 border rounded-md focus:outline-none focus:ring-1 text-xs ${inputCls}`}
            style={{ backgroundColor: '#1e293b', color: '#e2e8f0', borderColor: '#334155' }}
          >
            <option value="ALL" style={{ backgroundColor: '#1e293b', color: '#e2e8f0' }}>All Defect Types</option>
            <option value="POTHOLE" style={{ backgroundColor: '#1e293b', color: '#e2e8f0' }}>Potholes</option>
            <option value="ROAD_CRACK" style={{ backgroundColor: '#1e293b', color: '#e2e8f0' }}>Road Cracks</option>
            <option value="SURFACE_DAMAGE" style={{ backgroundColor: '#1e293b', color: '#e2e8f0' }}>Surface Wear</option>
            <option value="WATERLOGGING" style={{ backgroundColor: '#1e293b', color: '#e2e8f0' }}>Waterlogging</option>
            <option value="VEHICLE_FLOW" style={{ backgroundColor: '#1e293b', color: '#e2e8f0' }}>Vehicle Flow</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={`px-2.5 py-1.5 border rounded-md focus:outline-none focus:ring-1 font-medium text-xs ${inputCls}`}
            style={{ backgroundColor: '#1e293b', color: '#e2e8f0', borderColor: '#334155' }}
          >
            <option value="ALL" style={{ backgroundColor: '#1e293b', color: '#e2e8f0' }}>All Statuses</option>
            <option value="NEW" style={{ backgroundColor: '#1e293b', color: '#e2e8f0' }}>New</option>
            <option value="REVIEWED" style={{ backgroundColor: '#1e293b', color: '#e2e8f0' }}>Reviewed</option>
            <option value="ASSIGNED_FOR_REPAIR" style={{ backgroundColor: '#1e293b', color: '#e2e8f0' }}>Assigned Repair</option>
            <option value="RESOLVED" style={{ backgroundColor: '#1e293b', color: '#e2e8f0' }}>Resolved</option>
          </select>
          {onPurgeEvents && events.length > 0 && (
            <button
              onClick={() => setIsPurgeModalOpen(true)}
              className="px-2.5 py-1.5 border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-md text-xs font-semibold flex items-center space-x-1 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Test Events</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────── */}
      <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className={`font-semibold sticky top-0 border-b z-10 ${theadBg}`}>
            <tr>
              <th className="py-2.5 px-3">Thumbnail</th>
              <th className="py-2.5 px-3">Type &amp; Confidence</th>
              <th className="py-2.5 px-3">Bus Unit</th>
              <th className="py-2.5 px-3">Coordinates (Lat, Lon)</th>
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Officer Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${divider}`}>
            {isLoading ? (
              <tr>
                <td colSpan={7} className={`text-center py-10 ${emptyClr}`}>
                  <div className={`inline-block animate-spin rounded-full h-6 w-6 border-b-2 mb-2 ${isDark ? 'border-slate-400' : 'border-slate-700'}`} />
                  <div>Syncing real-time detection events...</div>
                </td>
              </tr>
            ) : filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={7} className={`text-center py-12 ${emptyClr}`}>
                  <AlertTriangle className={`w-8 h-8 mx-auto mb-2 ${emptyIcon}`} />
                  <p className="font-medium">No detection events recorded for this district yet.</p>
                  <p className={`text-[11px] mt-1 ${emptyClr}`}>
                    Mount phone in bus, open UrbanEye Mobile, and pair using the 6-digit PIN.
                  </p>
                </td>
              </tr>
            ) : (
              filteredEvents.map((event) => (
                <tr key={event.id} className={`transition ${rowHover}`}>
                  {/* Thumbnail */}
                  <td className="py-2 px-3">
                    {event.imageSnippet ? (
                      <button
                        onClick={() => setPreviewImage(event.imageSnippet || null)}
                        className="relative group w-14 h-10 rounded border border-slate-600/50 overflow-hidden bg-slate-700 block"
                      >
                        <img
                          src={event.imageSnippet.startsWith('data:') ? event.imageSnippet : `data:image/jpeg;base64,${event.imageSnippet}`}
                          alt="Crop"
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                          <Eye className="w-3.5 h-3.5 text-white" />
                        </div>
                      </button>
                    ) : (
                      <div className={`w-14 h-10 rounded border border-dashed flex items-center justify-center ${thumbBg}`}>
                        <ImageIcon className="w-4 h-4" />
                      </div>
                    )}
                  </td>

                  {/* Type & Confidence */}
                  <td className="py-2 px-3">
                    <div className="flex flex-col space-y-1">
                      <div>{getTypeBadge(event.type)}</div>
                      <div className={`text-[11px] font-medium ${cellSub}`}>
                        Conf: <strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>{Math.round(event.confidence * 100)}%</strong>
                      </div>
                    </div>
                  </td>

                  {/* Bus Unit */}
                  <td className="py-2 px-3">
                    <div className={`font-medium ${cellMain}`}>{event.busLabel}</div>
                    <div className={`text-[10px] ${cellSub}`}>{event.district?.name}</div>
                  </td>

                  {/* Coordinates */}
                  <td className={`py-2 px-3 font-mono text-[11px] ${cellMono}`}>
                    <div>{event.latitude.toFixed(5)}, {event.longitude.toFixed(5)}</div>
                    {event.speed !== null && event.speed !== undefined && (
                      <div className={`text-[10px] ${cellSub}`}>Speed: {Math.round(event.speed)} km/h</div>
                    )}
                  </td>

                  {/* Timestamp */}
                  <td className={`py-2 px-3 text-[11px] ${cellMono}`}>
                    <div>{new Date(event.timestamp).toLocaleTimeString()}</div>
                    <div className={`text-[10px] ${cellSub}`}>{new Date(event.timestamp).toLocaleDateString()}</div>
                  </td>

                  {/* Status */}
                  <td className="py-2 px-3">
                    {getStatusBadge(event.status)}
                    {event.reviewNotes && (
                      <div className={`text-[10px] mt-0.5 truncate max-w-[130px] ${cellSub}`} title={event.reviewNotes}>
                        Note: {event.reviewNotes}
                      </div>
                    )}
                  </td>

                  {/* Officer Actions */}
                  <td className="py-2 px-3 text-right">
                    <div className="inline-flex items-center space-x-1">
                      {onSelectEvent && (
                        <button
                          onClick={() => onSelectEvent(event)}
                          className={`px-2 py-1 text-[11px] font-semibold rounded transition ${actionBtn}`}
                        >
                          Details
                        </button>
                      )}
                      {event.status === 'NEW' && (
                        <button
                          onClick={() => handleStatusClick(event.id, 'REVIEWED')}
                          disabled={actionLoadingId === event.id}
                          className={`px-2 py-1 text-[11px] font-semibold rounded transition ${actionBtn}`}
                        >
                          Review
                        </button>
                      )}
                      {(event.status === 'NEW' || event.status === 'REVIEWED') && (
                        <button
                          onClick={() => handleStatusClick(event.id, 'ASSIGNED_FOR_REPAIR')}
                          disabled={actionLoadingId === event.id}
                          className="px-2 py-1 text-[11px] font-semibold rounded bg-[#10233D] hover:bg-slate-800 text-white transition flex items-center space-x-1 shadow-sm"
                        >
                          <Wrench className="w-3 h-3 mr-1" />
                          <span>Assign</span>
                        </button>
                      )}
                      {event.status === 'ASSIGNED_FOR_REPAIR' && (
                        <button
                          onClick={() => handleStatusClick(event.id, 'RESOLVED')}
                          disabled={actionLoadingId === event.id}
                          className="px-2 py-1 text-[11px] font-semibold rounded bg-[#1E7F73] hover:bg-[#186a60] text-white transition flex items-center space-x-1 shadow-sm"
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          <span>Resolve</span>
                        </button>
                      )}
                      {event.status === 'RESOLVED' && (
                        <span className="text-[11px] text-emerald-500 font-semibold flex items-center">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Closed
                        </span>
                      )}
                      {onDeleteEvent && (
                        <button
                          onClick={async () => {
                            if (window.confirm(`Delete this ${event.type.replace(/_/g, ' ')} defect record?`)) {
                              try {
                                setDeletingId(event.id);
                                await onDeleteEvent(event.id);
                              } finally {
                                setDeletingId(null);
                              }
                            }
                          }}
                          disabled={deletingId === event.id}
                          className={`p-1 rounded transition ${isDark ? 'text-slate-500 hover:text-red-400 hover:bg-red-900/30' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}
                        >
                          <Trash2 className={`w-3.5 h-3.5 ${deletingId === event.id ? 'animate-spin' : ''}`} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Status Note Modal ─────────────────────────────────── */}
      {notesModalEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`rounded-lg shadow-xl max-w-md w-full p-5 border transition-colors ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-300'}`}>
            <h4 className={`text-sm font-bold mb-1 ${titleClr}`}>
              Update Defect Status: <span className="text-blue-400">{notesModalEvent.targetStatus.replace('_', ' ')}</span>
            </h4>
            <p className={`text-xs mb-3 ${labelClr}`}>
              Add engineering notes or contractor dispatch details for the official audit trail.
            </p>
            <textarea
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="e.g. Work order #402 dispatched to PWD Ward 14 road crew..."
              rows={3}
              className={`w-full text-xs p-2.5 border rounded-md focus:outline-none focus:ring-1 mb-3 ${isDark ? 'bg-slate-900 border-slate-600 text-slate-200 placeholder:text-slate-500 focus:ring-[#1E7F73]' : 'border-slate-300 focus:ring-blue-600'}`}
            />
            {modalError && (
              <div className="mb-3 p-2.5 rounded-md bg-red-500/10 border border-red-500/40 text-red-400 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}
            <div className="flex justify-end space-x-2 text-xs">
              <button
                onClick={() => setNotesModalEvent(null)}
                className={`px-3 py-1.5 rounded-md border font-medium ${isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
              >
                Cancel
              </button>
              <button
                onClick={submitStatusChange}
                disabled={actionLoadingId !== null}
                className="px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Purge Modal ───────────────────────────────────────── */}
      {isPurgeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`rounded-lg shadow-xl max-w-md w-full p-5 border ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-300'}`}>
            <div className="flex items-center space-x-3 mb-3 text-red-500">
              <div className="w-9 h-9 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className={`text-sm font-bold ${titleClr}`}>Clear Test Detections?</h4>
                <p className={`text-xs ${labelClr}`}>Purge recorded edge events from this register</p>
              </div>
            </div>
            <p className={`text-xs mb-4 p-3 rounded border ${isDark ? 'text-slate-300 bg-slate-900/50 border-slate-700' : 'text-slate-600 bg-slate-50 border-slate-200'}`}>
              Are you sure? This will delete <strong>{events.length} defect records</strong> so you can start clean with fresh bus camera streams.
            </p>
            <div className="flex justify-end space-x-2 text-xs">
              <button
                onClick={() => setIsPurgeModalOpen(false)}
                disabled={purging}
                className={`px-3.5 py-1.5 rounded-md border font-medium ${isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!onPurgeEvents) return;
                  try { setPurging(true); await onPurgeEvents(); setIsPurgeModalOpen(false); }
                  finally { setPurging(false); }
                }}
                disabled={purging}
                className="px-3.5 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center space-x-1 disabled:opacity-50"
              >
                <Trash2 className={`w-3.5 h-3.5 ${purging ? 'animate-spin' : ''}`} />
                <span>{purging ? 'Clearing...' : 'Yes, Clear All Events'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Lightbox ──────────────────────────────────────────── */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className={`max-w-2xl w-full rounded-lg p-2 shadow-2xl overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <div className={`flex justify-between items-center px-2 py-1 text-xs font-semibold border-b mb-2 ${isDark ? 'text-slate-300 border-slate-700' : 'text-slate-600 border-slate-100'}`}>
              <span>Edge-AI Camera Frame Snippet</span>
              <button onClick={() => setPreviewImage(null)} className={`text-sm font-bold ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-800'}`}>✕</button>
            </div>
            <img
              src={previewImage.startsWith('data:') ? previewImage : `data:image/jpeg;base64,${previewImage}`}
              alt="Road Defect Capture"
              className="w-full max-h-[70vh] object-contain rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
};
