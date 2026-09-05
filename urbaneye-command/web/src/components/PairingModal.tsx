import React, { useState } from 'react';
import { Bus, KeyRound, Shield, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { District } from '../types';

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
  const [pin, setPin] = useState('');
  const [busLabel, setBusLabel] = useState('');
  const [routeTag, setRouteTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
      setError('Please specify the bus registration or vehicle ID (e.g., MH-01-CV-9821).');
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

      setTimeout(() => {
        onPairSuccess();
        onClose();
        setSuccessMessage(null);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to bind bus session.');
    } finally {
      setLoading(false);
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
              <h3 className="font-bold text-base tracking-tight">Pair Bus-Mounted AI Sensor</h3>
              <p className="text-xs text-slate-300">Bind phone device session to {currentDistrict?.name || 'District'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold text-lg">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start space-x-2.5">
            <Shield className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>Secure PIN Handshake:</strong> The bus operator opens <em>UrbanEye Mobile</em> on the mounted Android device to generate a 6-digit code. Enter it below to bind telemetry and detections to this district.
            </div>
          </div>

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
                placeholder="e.g. MH-01-CV-9821 or BEST-408"
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
      </div>
    </div>
  );
};
