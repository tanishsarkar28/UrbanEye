import React, { useState, useEffect } from 'react';
import { Bus, KeyRound, Shield, CheckCircle2, AlertCircle, Loader2, Trash2, Radio } from 'lucide-react';
import { api } from '../services/api';
import { District, BusSession } from '../types';

interface PairingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPairSuccess: () => void;
  currentDistrict?: District | null;
}

export const PairingModal: React.FC<PairingModalProps> = ({
  isOpen,
  onClose,
  onPairSuccess,
  currentDistrict,
}) => {
  const [activeTab, setActiveTab] = useState<'pair' | 'sessions'>('pair');
  const [pin, setPin] = useState('');
  const [busLabel, setBusLabel] = useState('');
  const [routeTag, setRouteTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [sessions, setSessions] = useState<BusSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [unpairingId, setUnpairingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen, currentDistrict]);

  const loadSessions = async () => {
    try {
      setLoadingSessions(true);
      const data = await api.getBusSessions(currentDistrict?.id);
      setSessions(data);
    } catch (err) {
      console.error('Failed to load bus sessions', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  if (!isOpen) return null;

  const handlePairSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanPin = pin.trim();
    if (!cleanPin || cleanPin.length !== 6 || !/^\d+$/.test(cleanPin)) {
      setError('Please enter a valid 6-digit numeric PIN from the mobile phone.');
      return;
    }

    if (!busLabel.trim()) {
      setError('Please specify the bus registration or vehicle ID (e.g., PB-08-LPU-001).');
      return;
    }

    try {
      setLoading(true);
      const res = await api.confirmPairing({
        pin: cleanPin,
        busLabel: busLabel.trim(),
        routeTag: routeTag.trim() || undefined,
        targetDistrictId: currentDistrict?.id,
      });

      setSuccessMessage(res.message || 'Bus successfully paired!');
      setPin('');
      setBusLabel('');
      setRouteTag('');
      loadSessions();

      setTimeout(() => {
        onPairSuccess();
        onClose();
        setSuccessMessage(null);
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to bind bus session.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnpair = async (sessionId: string) => {
    try {
      setUnpairingId(sessionId);
      await api.unpairBusSession(sessionId);
      await loadSessions();
      onPairSuccess(); // Refreshes active bus counts on parent dashboard
    } catch (err: any) {
      setError(err.message || 'Failed to unpair device');
    } finally {
      setUnpairingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-300 overflow-hidden">
        {/* Header */}
        <div className="bg-[#0b2545] p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">Bus Patrol Fleet Sensors</h3>
              <p className="text-xs text-slate-300">
                {currentDistrict?.name ? `Jurisdiction: ${currentDistrict.name}` : 'District Patrol Management'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold text-lg">
            ✕
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3">
          <button
            type="button"
            onClick={() => setActiveTab('pair')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'pair'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Pair New Sensor PIN
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('sessions');
              loadSessions();
            }}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'sessions'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Active Sensors</span>
            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
              {sessions.length}
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {activeTab === 'pair' ? (
            <div>
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start space-x-2.5">
                <Shield className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong>Secure PIN Handshake:</strong> The bus operator opens <em>UrbanEye Mobile</em> on the mounted Android device to generate a 6-digit code. Enter it below to bind telemetry and detections to this district.
                </div>
              </div>

              <form onSubmit={handlePairSubmit} className="space-y-4 text-xs">
                {/* PIN Input */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5 flex items-center space-x-1.5">
                    <KeyRound className="w-4 h-4 text-slate-500" />
                    <span>6-Digit Device PIN *</span>
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 748291"
                    className="w-full text-center text-2xl font-mono tracking-widest font-bold py-2.5 px-3 border-2 border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none bg-slate-50 text-slate-900"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1 text-center">
                    Valid for 10 minutes from generation on the phone
                  </p>
                </div>

                {/* Bus Registration Label */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Bus Registration / Fleet ID *
                  </label>
                  <input
                    type="text"
                    value={busLabel}
                    onChange={(e) => setBusLabel(e.target.value)}
                    placeholder="e.g. PB-08-LPU-001 or BEST-408"
                    className="w-full text-xs py-2 px-3 border border-slate-300 rounded-md focus:border-blue-600 focus:outline-none"
                    required
                  />
                </div>

                {/* Route Tag */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Transit Route Tag (Optional)
                  </label>
                  <input
                    type="text"
                    value={routeTag}
                    onChange={(e) => setRouteTag(e.target.value)}
                    placeholder="e.g. Route 335E (Colaba to Bandra)"
                    className="w-full text-xs py-2 px-3 border border-slate-300 rounded-md focus:border-blue-600 focus:outline-none"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2 flex justify-end space-x-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !pin || !busLabel}
                    className="px-5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold flex items-center space-x-1.5 shadow-sm"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Validating & Binding...</span>
                      </>
                    ) : (
                      <>
                        <Bus className="w-4 h-4" />
                        <span>Confirm Pairing</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Active sensor sessions streaming telemetry to this district:
              </p>

              {loadingSessions ? (
                <div className="py-8 flex justify-center items-center text-slate-500 space-x-2 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading sensors...</span>
                </div>
              ) : sessions.length === 0 ? (
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs text-slate-500">
                  No active bus sensors paired in this district.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg max-h-64 overflow-y-auto">
                  {sessions.map((s) => (
                    <div key={s.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition text-xs">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                          <Radio className="w-3.5 h-3.5 animate-pulse" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">
                            {s.busLabel || 'Unnamed Bus'}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {s.routeTag ? `${s.routeTag} • ` : ''}
                            Paired {s.pairedAt ? new Date(s.pairedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'recently'}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleUnpair(s.id)}
                        disabled={unpairingId === s.id}
                        className="px-2.5 py-1 text-[11px] font-bold text-red-600 hover:bg-red-50 border border-red-200 rounded flex items-center space-x-1 transition disabled:opacity-50"
                      >
                        {unpairingId === s.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                        <span>Unpair</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-3 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
