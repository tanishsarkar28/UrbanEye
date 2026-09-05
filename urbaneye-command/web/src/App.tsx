import React, { useState, useEffect, useCallback } from 'react';
import { User, State, District, RoadEvent, AnalyticsStats, EventStatus } from './types';
import { api } from './services/api';
import { subscribeToDistrict } from './services/socket';
import { Header } from './components/Header';
import { LiveMap } from './components/LiveMap';
import { DefectTable } from './components/DefectTable';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { PairingModal } from './components/PairingModal';
import { NationalOverviewView } from './components/NationalOverviewView';
import { StateOverviewView } from './components/StateOverviewView';
import { DefectDetailModal } from './components/DefectDetailModal';
import { Login } from './pages/Login';
import { RefreshCw, Radio, BellRing, Sparkles, ArrowLeft } from 'lucide-react';

export const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('urbaneye_token'));
  const [authLoading, setAuthLoading] = useState(true);

  // Navigation / Scope State
  const [viewMode, setViewMode] = useState<'NATIONAL' | 'STATE' | 'DISTRICT'>('DISTRICT');
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [activeDistrict, setActiveDistrict] = useState<District | null>(null);

  // Data State
  const [events, setEvents] = useState<RoadEvent[]>([]);
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [isPairingModalOpen, setIsPairingModalOpen] = useState(false);
  const [latestLiveAlert, setLatestLiveAlert] = useState<RoadEvent | null>(null);
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<RoadEvent | null>(null);

  // 1. Initial Profile Check
  useEffect(() => {
    async function checkAuth() {
      if (!token) {
        setAuthLoading(false);
        return;
      }
      try {
        const profile = await api.getMe();
        setUser(profile);
      } catch (e) {
        console.error('Session check failed:', e);
        localStorage.removeItem('urbaneye_token');
        setToken(null);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    }
    checkAuth();
  }, [token]);

  // 2. Adjust View Mode based on Role
  useEffect(() => {
    if (!user) return;

    if (user.role === 'DISTRICT_HEAD' && user.districtId) {
      setViewMode('DISTRICT');
      api.getDistrict(user.districtId).then((d) => setActiveDistrict(d)).catch(console.error);
    } else if (user.role === 'STATE_ADMIN' && user.stateId) {
      setViewMode('STATE');
      api.getStates().then((sts) => {
        const myState = sts.find((s) => s.id === user.stateId);
        if (myState) {
          setSelectedState(myState);
        }
      }).catch(console.error);
    } else if (user.role === 'NATIONAL_ADMIN') {
      setViewMode('NATIONAL');
    }
  }, [user]);

  // 3. Load District Data (Events & Stats)
  const refreshDistrictData = useCallback(async () => {
    if (!activeDistrict) return;
    setLoadingData(true);
    try {
      const [eventsRes, statsRes] = await Promise.all([
        api.getEvents({ districtId: activeDistrict.id, limit: 100 }),
        api.getEventStats(activeDistrict.id),
      ]);
      setEvents(eventsRes.events);
      setStats(statsRes);
    } catch (err) {
      console.error('Failed to load district data:', err);
    } finally {
      setLoadingData(false);
    }
  }, [activeDistrict]);

  useEffect(() => {
    if (activeDistrict) {
      refreshDistrictData();
    }
  }, [activeDistrict, refreshDistrictData]);

  // 4. Real-Time Socket Subscription (Pushes live events into map, feed, and counters)
  useEffect(() => {
    if (!activeDistrict) return;

    const cleanup = subscribeToDistrict(
      activeDistrict.id,
      (newEvent) => {
        console.log('⚡ Received Live Road Event:', newEvent);
        // Prepend event immediately to feed and map without page refresh
        setEvents((prev) => [newEvent, ...prev.filter((e) => e.id !== newEvent.id)]);
        setLatestLiveAlert(newEvent);

        // Instantly increment summary counters live
        setStats((prev) => {
          if (!prev) return prev;
          const isNew = newEvent.status === 'NEW';
          return {
            ...prev,
            totalEvents: prev.totalEvents + 1,
            byStatus: {
              ...prev.byStatus,
              new: isNew ? prev.byStatus.new + 1 : prev.byStatus.new,
            },
            byType: {
              ...prev.byType,
              pothole: newEvent.type === 'POTHOLE' ? prev.byType.pothole + 1 : prev.byType.pothole,
              roadCrack: newEvent.type === 'ROAD_CRACK' ? prev.byType.roadCrack + 1 : prev.byType.roadCrack,
              surfaceDamage: newEvent.type === 'SURFACE_DAMAGE' ? prev.byType.surfaceDamage + 1 : prev.byType.surfaceDamage,
              waterlogging: newEvent.type === 'WATERLOGGING' ? prev.byType.waterlogging + 1 : prev.byType.waterlogging,
              vehicleFlow: newEvent.type === 'VEHICLE_FLOW' ? prev.byType.vehicleFlow + 1 : prev.byType.vehicleFlow,
            },
          };
        });

        // Also sync authoritative computed stats from server
        api.getEventStats(activeDistrict.id).then(setStats).catch(console.error);

        // Auto-dismiss notification toast after 6s
        setTimeout(() => setLatestLiveAlert((curr) => (curr?.id === newEvent.id ? null : curr)), 6000);
      },
      (updatedEvent) => {
        setEvents((prev) => prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)));
        if (selectedEventForDetail?.id === updatedEvent.id) {
          setSelectedEventForDetail(updatedEvent);
        }
        api.getEventStats(activeDistrict.id).then(setStats).catch(console.error);
      },
      activeDistrict.code,
      (deleted) => {
        setEvents((prev) => prev.filter((e) => e.id !== deleted.id));
        if (selectedEventForDetail?.id === deleted.id) {
          setSelectedEventForDetail(null);
        }
        api.getEventStats(activeDistrict.id).then(setStats).catch(console.error);
      }
    );

    return () => {
      cleanup();
    };
  }, [activeDistrict, selectedEventForDetail?.id]);

  // Status Change Handler with optimistic update and server persistence
  const handleUpdateStatus = async (eventId: string, status: EventStatus, notes?: string) => {
    const res = await api.updateEventStatus(eventId, status, notes);
    setEvents((prev) => prev.map((e) => (e.id === eventId ? res.event : e)));
    if (selectedEventForDetail?.id === eventId) {
      setSelectedEventForDetail(res.event);
    }
    if (activeDistrict) {
      const freshStats = await api.getEventStats(activeDistrict.id);
      setStats(freshStats);
    }
  };

  // Delete Individual Event Handler
  const handleDeleteEvent = async (eventId: string) => {
    await api.deleteEvent(eventId);
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    if (selectedEventForDetail?.id === eventId) {
      setSelectedEventForDetail(null);
    }
    if (activeDistrict) {
      const freshStats = await api.getEventStats(activeDistrict.id);
      setStats(freshStats);
    }
  };

  // Purge / Clear All Events for District
  const handlePurgeEvents = async () => {
    if (!activeDistrict) return;
    await api.purgeEvents(activeDistrict.id);
    setEvents([]);
    setSelectedEventForDetail(null);
    const freshStats = await api.getEventStats(activeDistrict.id);
    setStats(freshStats);
  };

  // Switch persona handler for rapid review
  const handleSwitchUser = async (targetEmail: string) => {
    try {
      const res = await api.login(targetEmail, 'UrbanEye@2026');
      localStorage.setItem('urbaneye_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setSelectedEventForDetail(null);
    } catch (err) {
      console.error('Persona switch failed:', err);
    }
  };

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('urbaneye_token');
    setToken(null);
    setUser(null);
    setActiveDistrict(null);
    setSelectedState(null);
    setEvents([]);
    setSelectedEventForDetail(null);
  };

  // Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#07162c] flex items-center justify-center text-white text-xs">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-semibold tracking-wider text-slate-300">Loading UrbanEye Command Center...</span>
        </div>
      </div>
    );
  }

  // Unauthenticated -> Login View
  if (!user) {
    return <Login onLoginSuccess={(u, t) => { setUser(u); setToken(t); }} />;
  }

  // Breadcrumbs Generator
  const breadcrumbs: { label: string; onClick?: () => void }[] = [];
  if (user.role === 'NATIONAL_ADMIN') {
    breadcrumbs.push({
      label: 'National Overview (All India)',
      onClick: viewMode !== 'NATIONAL' ? () => setViewMode('NATIONAL') : undefined,
    });
    if (selectedState && viewMode !== 'NATIONAL') {
      breadcrumbs.push({
        label: selectedState.name,
        onClick: viewMode === 'DISTRICT' ? () => setViewMode('STATE') : undefined,
      });
    }
    if (activeDistrict && viewMode === 'DISTRICT') {
      breadcrumbs.push({ label: activeDistrict.name });
    }
  } else if (user.role === 'STATE_ADMIN') {
    breadcrumbs.push({
      label: `${user.stateName || 'State'} Command`,
      onClick: viewMode === 'DISTRICT' ? () => setViewMode('STATE') : undefined,
    });
    if (activeDistrict && viewMode === 'DISTRICT') {
      breadcrumbs.push({ label: activeDistrict.name });
    }
  } else {
    breadcrumbs.push({ label: `${user.districtName || 'District'} Authority` });
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col font-sans">
      {/* Header */}
      <Header
        user={user}
        onLogout={handleLogout}
        onOpenPairing={() => setIsPairingModalOpen(true)}
        onSwitchUser={handleSwitchUser}
        activeBusCount={stats?.activeBusesCount || 0}
        currentBreadcrumbs={breadcrumbs}
      />

      {/* Live Toast for Incoming Edge Detection */}
      {latestLiveAlert && (
        <div
          onClick={() => setSelectedEventForDetail(latestLiveAlert)}
          className="fixed top-20 right-6 z-50 max-w-sm bg-slate-900 text-white rounded-lg shadow-2xl p-3.5 border-l-4 border-red-500 flex items-start space-x-3 cursor-pointer hover:bg-slate-800 transition"
        >
          <div className="w-8 h-8 rounded bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
            <BellRing className="w-4 h-4 animate-pulse" />
          </div>
          <div className="text-xs">
            <div className="font-bold text-red-400 uppercase tracking-wider flex items-center space-x-1.5">
              <span>LIVE EDGE DETECTION</span>
              <Sparkles className="w-3 h-3 text-amber-400" />
            </div>
            <p className="text-white font-medium mt-0.5">
              {latestLiveAlert.type.replace('_', ' ')} ({Math.round(latestLiveAlert.confidence * 100)}% conf)
            </p>
            <p className="text-[11px] text-slate-300">
              Bus {latestLiveAlert.busLabel} • {new Date(latestLiveAlert.timestamp).toLocaleTimeString()}
            </p>
            <span className="text-[10px] text-blue-400 font-semibold underline mt-1 block">
              Click to Open Action Panel →
            </span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* VIEW 1: National Admin View */}
        {viewMode === 'NATIONAL' && (
          <NationalOverviewView
            onSelectState={async (st) => {
              setSelectedState(st);
              setViewMode('STATE');
            }}
          />
        )}

        {/* VIEW 2: State Admin View */}
        {viewMode === 'STATE' && selectedState && (
          <StateOverviewView
            state={selectedState}
            onSelectDistrict={(d) => {
              setActiveDistrict(d);
              setViewMode('DISTRICT');
            }}
            onBack={() => setViewMode('NATIONAL')}
            canGoBack={user.role === 'NATIONAL_ADMIN'}
          />
        )}

        {/* VIEW 3: District Dashboard (District Head's Scoped Workspace) */}
        {viewMode === 'DISTRICT' && activeDistrict && (
          <div>
            {/* Top District Bar */}
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center space-x-3">
                {(user.role === 'STATE_ADMIN' || user.role === 'NATIONAL_ADMIN') && (
                  <button
                    onClick={() =>
                      setViewMode(user.role === 'STATE_ADMIN' ? 'STATE' : selectedState ? 'STATE' : 'NATIONAL')
                    }
                    className="p-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 transition"
                    title="Return to State Overview"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center">
                    <span>{activeDistrict.name}</span>
                    <span className="text-xs bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded ml-2">
                      {activeDistrict.code}
                    </span>
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live bus patrol telemetry, continuous edge-AI defect mapping & municipal work order workflow.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={refreshDistrictData}
                  disabled={loadingData}
                  className="px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition flex items-center space-x-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
                  <span>Sync Feed</span>
                </button>

                <button
                  onClick={() => setIsPairingModalOpen(true)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-blue-600 hover:bg-blue-700 text-white transition flex items-center space-x-1 shadow-sm"
                >
                  <span>+ Pair Bus (PIN)</span>
                </button>
              </div>
            </div>

            {/* Analytics Stats Grid */}
            <AnalyticsPanel stats={stats} districtName={activeDistrict.name} />

            {/* Live Map & Defect Feed Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
              {/* Map Column (8 cols) */}
              <div className="lg:col-span-8 flex flex-col">
                <div className="bg-white p-3 rounded-t-lg border border-b-0 border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800">
                  <div className="flex items-center space-x-2">
                    <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                    <span>Real-Time Geospatial Defect Distribution</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {events.length} active pins plotted (Click pin for Action Panel)
                  </span>
                </div>
                <div className="h-[460px]">
                  <LiveMap
                    events={events}
                    centerLat={activeDistrict.centerLat}
                    centerLon={activeDistrict.centerLon}
                    zoom={12}
                    onUpdateStatus={handleUpdateStatus}
                    onSelectEvent={(ev) => setSelectedEventForDetail(ev)}
                    latestEventId={latestLiveAlert?.id}
                  />
                </div>
              </div>

              {/* Real-time Ticker / Recent Detections (4 cols) */}
              <div className="lg:col-span-4 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col h-[505px] overflow-hidden">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-900 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-red-600 mr-2 animate-ping"></span>
                    Live Bus Ingestion Feed
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold">
                    Real-Time Edge Stream
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y divide-slate-100">
                  {events.length === 0 ? (
                    <div className="py-16 text-center text-xs text-slate-400">
                      <p>Awaiting live bus edge inference...</p>
                      <p className="text-[10px] mt-1 text-slate-400">
                        Pair a phone running UrbanEye Mobile to start streaming road defects.
                      </p>
                    </div>
                  ) : (
                    events.slice(0, 15).map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => setSelectedEventForDetail(ev)}
                        className="pt-2 first:pt-0 flex items-start space-x-2.5 text-xs p-1.5 rounded hover:bg-slate-50 cursor-pointer transition"
                      >
                        {ev.imageSnippet ? (
                          <img
                            src={ev.imageSnippet.startsWith('data:') ? ev.imageSnippet : `data:image/jpeg;base64,${ev.imageSnippet}`}
                            alt="Crop"
                            className="w-12 h-10 object-cover rounded border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-10 rounded bg-slate-100 border border-dashed border-slate-300 shrink-0 flex items-center justify-center text-slate-400 text-[10px]">
                            Crop
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 truncate">
                              {ev.type.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            Bus: <strong>{ev.busLabel}</strong> • {Math.round(ev.confidence * 100)}% conf
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                            <span>{ev.latitude.toFixed(4)}, {ev.longitude.toFixed(4)}</span>
                            <span className={`font-bold uppercase text-[9px] ${
                              ev.status === 'RESOLVED'
                                ? 'text-emerald-600'
                                : ev.status === 'ASSIGNED_FOR_REPAIR'
                                ? 'text-orange-600'
                                : 'text-red-600'
                            }`}>
                              {ev.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Defect Management Register Table */}
            <DefectTable
              events={events}
              onUpdateStatus={handleUpdateStatus}
              onSelectEvent={(ev) => setSelectedEventForDetail(ev)}
              onDeleteEvent={handleDeleteEvent}
              onPurgeEvents={handlePurgeEvents}
              isLoading={loadingData}
            />
          </div>
        )}
      </main>

      {/* Bus Pairing Modal */}
      <PairingModal
        isOpen={isPairingModalOpen}
        onClose={() => setIsPairingModalOpen(false)}
        onPairSuccess={() => {
          if (activeDistrict) refreshDistrictData();
        }}
        currentDistrict={activeDistrict}
      />

      {/* Defect Action / Detail Modal */}
      <DefectDetailModal
        event={selectedEventForDetail}
        onClose={() => setSelectedEventForDetail(null)}
        onUpdateStatus={handleUpdateStatus}
        onDelete={handleDeleteEvent}
        readOnly={user.role === 'STATE_ADMIN' && false}
      />
    </div>
  );
};
