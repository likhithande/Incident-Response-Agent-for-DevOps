import React, { useState } from 'react';
import { X, PlusCircle, AlertCircle } from 'lucide-react';
import { Incident } from '../types';
import { createIncident } from '../services/api';

interface NewIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIncidentCreated: (newIncident: Incident) => void;
}

export const NewIncidentModal: React.FC<NewIncidentModalProps> = ({
  isOpen,
  onClose,
  onIncidentCreated
}) => {
  const [incidentId, setIncidentId] = useState(`INC-${Math.floor(100 + Math.random() * 900)}`);
  const [service, setService] = useState('Payment API');
  const [severity, setSeverity] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('CRITICAL');
  const [symptoms, setSymptoms] = useState('HTTP 503 Service Unavailable\nDatabase connection timeout\nHigh P99 latency');
  const [errorLogs, setErrorLogs] = useState('Timeout waiting for database connection from pool\nConnection pool exhausted (active=50, max=50)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentId.trim() || !service.trim()) {
      setErrorMessage('Incident ID and Service Name are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const payload: Incident = {
        incident_id: incidentId.trim().toUpperCase(),
        service: service.trim(),
        severity,
        symptoms: symptoms.split('\n').filter((s) => s.trim().length > 0),
        error_logs: errorLogs.split('\n').filter((l) => l.trim().length > 0),
        status: 'ACTIVE'
      };

      const created = await createIncident(payload);
      onIncidentCreated(created);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create incident');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-ops-surface border border-ops-border rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-xs">
        {/* Header */}
        <div className="px-6 py-4 border-b border-ops-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Create New Production Incident</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="bg-rose-500/15 border border-rose-500/30 p-2.5 rounded-lg text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Incident ID</label>
              <input
                type="text"
                required
                value={incidentId}
                onChange={(e) => setIncidentId(e.target.value)}
                className="w-full bg-ops-card border border-ops-border rounded-lg p-2 text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full bg-ops-card border border-ops-border rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Service Name</label>
            <input
              type="text"
              required
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="w-full bg-ops-card border border-ops-border rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g. Payment API, Redis Cache, Checkout Gateway"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Observed Symptoms (one per line)</label>
            <textarea
              rows={3}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="w-full bg-ops-card border border-ops-border rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
              placeholder="HTTP 503&#10;Database timeout"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Error Logs (one per line)</label>
            <textarea
              rows={3}
              value={errorLogs}
              onChange={(e) => setErrorLogs(e.target.value)}
              className="w-full bg-ops-dark border border-ops-border rounded-lg p-2.5 text-emerald-400 font-mono focus:outline-none focus:border-blue-500"
              placeholder="Timeout waiting for database connection"
            />
          </div>

          <div className="pt-3 border-t border-ops-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-ops-card hover:bg-ops-border text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Registering...' : 'Register Incident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
