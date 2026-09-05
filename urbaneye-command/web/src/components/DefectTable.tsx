import React, { useState } from 'react';
import { RoadEvent, EventStatus, DefectType } from '../types';
import { Eye, CheckCircle2, Wrench, Clock, Filter, AlertTriangle, Image as ImageIcon, Trash2 } from 'lucide-react';

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

  const filteredEvents = events.filter((e) => {
    if (selectedStatus !== 'ALL' && e.status !== selectedStatus) return false;
    if (selectedType !== 'ALL' && e.type !== selectedType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const busMatch = e.busLabel.toLowerCase().includes(q);
      const districtMatch = e.district?.name.toLowerCase().includes(q) || false;
      const typeMatch = e.type.toLowerCase().includes(q);
      if (!busMatch && !districtMatch && !typeMatch) return false;
    }
    return true;
  });

  const [modalError, setModalError] = useState<string | null>(null);

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
      console.error('Failed to update status from table:', err);
      setModalError(err.message || 'Failed to update status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (status: EventStatus) => {
    switch (status) {
      case 'NEW':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800 border border-red-200">NEW DEFECT</span>;
      case 'REVIEWED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">REVIEWED</span>;
      case 'ASSIGNED_FOR_REPAIR':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">ASSIGNED REPAIR</span>;
      case 'RESOLVED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">RESOLVED</span>;
    }
  };

  const getTypeBadge = (type: DefectType) => {
    switch (type) {
      case 'POTHOLE':
        return <span className="font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200 text-xs">Pothole</span>;
      case 'ROAD_CRACK':
        return <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-xs">Road Crack</span>;
      case 'SURFACE_DAMAGE':
        return <span className="font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200 text-xs">Surface Wear</span>;
      case 'WATERLOGGING':
        return <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-xs">Waterlogging</span>;
      case 'VEHICLE_FLOW':
        return <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 text-xs">Traffic Stream</span>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-slate-700" />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Edge-AI Detection Register
          </h3>
          <span className="text-xs bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded-full">
            {filteredEvents.length} events
          </span>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <input
            type="text"
            placeholder="Search bus, route, defect..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
          />

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
          >
            <option value="ALL">All Defect Types</option>
            <option value="POTHOLE">Potholes</option>
            <option value="ROAD_CRACK">Road Cracks</option>
            <option value="SURFACE_DAMAGE">Surface Wear</option>
            <option value="WATERLOGGING">Waterlogging</option>
            <option value="VEHICLE_FLOW">Vehicle Flow</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="ASSIGNED_FOR_REPAIR">Assigned Repair</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          {onPurgeEvents && events.length > 0 && (
            <button
              onClick={() => setIsPurgeModalOpen(true)}
              className="px-2.5 py-1.5 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 rounded-md text-xs font-semibold flex items-center space-x-1 transition"
              title="Clear recorded test events for this district"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              <span>Clear Test Events</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 border-b border-slate-200 z-10">
            <tr>
              <th className="py-2.5 px-3">Thumbnail</th>
              <th className="py-2.5 px-3">Type & Confidence</th>
              <th className="py-2.5 px-3">Bus Unit</th>
              <th className="py-2.5 px-3">Coordinates (Lat, Lon)</th>
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Officer Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-slate-500">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-slate-700 mb-2"></div>
                  <div>Syncing real-time detection events...</div>
                </td>
              </tr>
            ) : filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-medium">No detection events recorded for this district yet.</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Mount phone in bus, open UrbanEye Mobile, and pair using the 6-digit PIN. Real on-device camera inference will stream live detections here.
                  </p>
                </td>
              </tr>
            ) : (
              filteredEvents.map((event) => (
                <tr key={event.id} className="hover:bg-slate-50 transition">
                  {/* Thumbnail */}
                  <td className="py-2 px-3">
                    {event.imageSnippet ? (
                      <button
                        onClick={() => setPreviewImage(event.imageSnippet || null)}
                        className="relative group w-14 h-10 rounded border border-slate-200 overflow-hidden bg-slate-100 block"
                        title="Click to view camera capture"
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
                      <div className="w-14 h-10 rounded bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                    )}
                  </td>

                  {/* Type & Confidence */}
                  <td className="py-2 px-3">
                    <div className="flex flex-col space-y-1">
                      <div>{getTypeBadge(event.type)}</div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        Conf: <strong className="text-slate-700">{Math.round(event.confidence * 100)}%</strong>
                      </div>
                    </div>
                  </td>

                  {/* Bus Unit */}
                  <td className="py-2 px-3 font-medium text-slate-900">
                    <div>{event.busLabel}</div>
                    <div className="text-[10px] text-slate-500">{event.district?.name}</div>
                  </td>

                  {/* Coordinates */}
                  <td className="py-2 px-3 text-slate-600 font-mono text-[11px]">
                    <div>{event.latitude.toFixed(5)}, {event.longitude.toFixed(5)}</div>
                    {event.speed !== null && event.speed !== undefined && (
                      <div className="text-[10px] text-slate-400">Speed: {Math.round(event.speed)} km/h</div>
                    )}
                  </td>

                  {/* Timestamp */}
                  <td className="py-2 px-3 text-slate-600 text-[11px]">
                    <div>{new Date(event.timestamp).toLocaleTimeString()}</div>
                    <div className="text-[10px] text-slate-400">{new Date(event.timestamp).toLocaleDateString()}</div>
                  </td>

                  {/* Status */}
                  <td className="py-2 px-3">
                    {getStatusBadge(event.status)}
                    {event.reviewNotes && (
                      <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[130px]" title={event.reviewNotes}>
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
                          className="px-2 py-1 text-[11px] font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                          title="Open Defect Action & Telemetry Panel"
                        >
                          Details
                        </button>
                      )}
                      {event.status === 'NEW' && (
                        <button
                          onClick={() => handleStatusClick(event.id, 'REVIEWED')}
                          disabled={actionLoadingId === event.id}
                          className="px-2 py-1 text-[11px] font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
                          title="Mark as reviewed by engineering team"
                        >
                          Review
                        </button>
                      )}

                      {(event.status === 'NEW' || event.status === 'REVIEWED') && (
                        <button
                          onClick={() => handleStatusClick(event.id, 'ASSIGNED_FOR_REPAIR')}
                          disabled={actionLoadingId === event.id}
                          className="px-2 py-1 text-[11px] font-semibold rounded bg-blue-600 hover:bg-blue-700 text-white transition flex items-center space-x-1"
                          title="Assign work order to PWD road repair contractor"
                        >
                          <Wrench className="w-3 h-3 mr-1" />
                          <span>Assign</span>
                        </button>
                      )}

                      {event.status === 'ASSIGNED_FOR_REPAIR' && (
                        <button
                          onClick={() => handleStatusClick(event.id, 'RESOLVED')}
                          disabled={actionLoadingId === event.id}
                          className="px-2 py-1 text-[11px] font-semibold rounded bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center space-x-1"
                          title="Mark defect repair completed"
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          <span>Resolve</span>
                        </button>
                      )}

                      {event.status === 'RESOLVED' && (
                        <span className="text-[11px] text-emerald-700 font-semibold flex items-center">
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
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                          title="Delete test defect record"
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

      {/* Status Note Modal */}
      {notesModalEvent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5 border border-slate-300">
            <h4 className="text-sm font-bold text-slate-900 mb-1">
              Update Defect Status: <span className="text-blue-600">{notesModalEvent.targetStatus.replace('_', ' ')}</span>
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Add engineering notes or contractor dispatch details for the official audit trail.
            </p>

            <textarea
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="e.g. Work order #402 dispatched to PWD Ward 14 road crew..."
              rows={3}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 mb-3"
            />

            {modalError && (
              <div className="mb-3 p-2.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <div className="flex justify-end space-x-2 text-xs">
              <button
                onClick={() => setNotesModalEvent(null)}
                className="px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium"
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

      {/* Clear All Test Events Confirmation Modal */}
      {isPurgeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5 border border-slate-300 animate-fade-in">
            <div className="flex items-center space-x-3 mb-3 text-red-600">
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Clear Test Detections?</h4>
                <p className="text-xs text-slate-500">Purge recorded edge events from this register</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded border border-slate-200">
              Are you sure you want to clear the register? This will delete <strong>{events.length} defect records</strong> so you can start clean with fresh bus camera streams.
            </p>
            <div className="flex justify-end space-x-2 text-xs">
              <button
                onClick={() => setIsPurgeModalOpen(false)}
                disabled={purging}
                className="px-3.5 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!onPurgeEvents) return;
                  try {
                    setPurging(true);
                    await onPurgeEvents();
                    setIsPurgeModalOpen(false);
                  } finally {
                    setPurging(false);
                  }
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

      {/* Lightbox Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="max-w-2xl w-full bg-white rounded-lg p-2 shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center px-2 py-1 text-xs text-slate-600 font-semibold border-b border-slate-100 mb-2">
              <span>Edge-AI Camera Frame Snippet</span>
              <button onClick={() => setPreviewImage(null)} className="text-slate-400 hover:text-slate-800 text-sm font-bold">
                ✕
              </button>
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
