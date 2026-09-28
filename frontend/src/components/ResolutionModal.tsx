import React, { useState } from 'react';
import { 
  X, 
  CheckCircle, 
  Database, 
  Sparkles, 
  BookOpen, 
  AlertCircle,
  Eye,
  FileCode,
  ShieldCheck
} from 'lucide-react';
import { Incident } from '../types';
import { resolveIncident } from '../services/api';

interface ResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: Incident;
  onResolutionSaved: (updatedIncident: Incident, memoryId?: string) => void;
}

export const ResolutionModal: React.FC<ResolutionModalProps> = ({
  isOpen,
  onClose,
  incident,
  onResolutionSaved
}) => {
  const [rootCause, setRootCause] = useState(incident.root_cause || '');
  const [resolution, setResolution] = useState(
    incident.resolution_steps && incident.resolution_steps.length > 0
      ? incident.resolution_steps.join('\n')
      : ''
  );
  const [outcome, setOutcome] = useState('P99 latency recovered to baseline; 5xx error rate dropped to 0.00%.');
  const [lessonsLearned, setLessonsLearned] = useState(
    incident.lessons_learned && incident.lessons_learned.length > 0
      ? incident.lessons_learned.join('\n')
      : ''
  );
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rootCause.trim() || !resolution.trim()) {
      setErrorMessage('Actual Root Cause and Resolution are required.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);

      const res = await resolveIncident({
        incident_id: incident.incident_id,
        actual_root_cause: rootCause,
        resolution,
        outcome,
        lessons_learned: lessonsLearned
      });

      setSaveSuccess(res.message);
      setTimeout(() => {
        onResolutionSaved(res.incident, res.retained_memory_id);
        onClose();
        setSaveSuccess(null);
      }, 1400);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to retain resolution in Hindsight.');
    } finally {
      setIsSaving(false);
    }
  };

  const previewMarkdown = `# Postmortem Knowledge: ${incident.incident_id}
**Service:** ${incident.service} | **Severity:** ${incident.severity} | **Status:** RESOLVED

### Identified Root Cause
${rootCause || 'None specified'}

### Resolution Applied
${resolution || 'None specified'}

### Observed Outcome
${outcome || 'None specified'}

### Lessons Learned & Runbook Modifications
${lessonsLearned || 'None specified'}
`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel border border-white/[0.1] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">Record Postmortem Resolution</h3>
              <p className="text-[11px] text-slate-400">
                Retain lessons learned into Hindsight long-term persistent memory.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPreview(!isPreview)}
              className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[11px] text-slate-300 flex items-center gap-1 font-medium transition-colors"
            >
              {isPreview ? <FileCode className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{isPreview ? 'Edit Form' : 'Preview Knowledge'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        {isPreview ? (
          <div className="p-6 space-y-3 text-xs">
            <div className="p-4 rounded-xl bg-[#080C14] border border-white/[0.08] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
              {previewMarkdown}
            </div>
            <p className="text-[11px] text-purple-300">
              This structured postmortem text will be indexed into Hindsight Cloud with document ID <span className="font-mono font-bold text-white">{incident.incident_id}</span>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {saveSuccess && (
              <div className="bg-emerald-500/15 border border-emerald-500/30 p-3 rounded-xl flex items-center gap-2 text-emerald-300 animate-in fade-in">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span className="font-semibold">{saveSuccess}</span>
              </div>
            )}

            {errorMessage && (
              <div className="bg-rose-500/15 border border-rose-500/30 p-3 rounded-xl flex items-center gap-2 text-rose-300 animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="bg-[#101726] p-2.5 rounded-xl border border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-slate-400">Target Incident:</span>
              <span className="font-mono font-bold text-white bg-blue-500/15 px-2 py-0.5 rounded border border-blue-500/25">
                {incident.incident_id} • {incident.service}
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-200 block mb-1">
                Actual Root Cause <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={rootCause}
                onChange={(e) => setRootCause(e.target.value)}
                className="w-full bg-[#101625] border border-white/[0.08] rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                placeholder="e.g. Database connection pool exhaustion caused by sudden flash-sale traffic spike..."
              />
            </div>

            <div>
              <label className="font-semibold text-slate-200 block mb-1">
                Resolution Applied <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full bg-[#101625] border border-white/[0.08] rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                placeholder="e.g. Increased database connection pool capacity from 50 to 150; rolling restarted Payment API pods..."
              />
            </div>

            <div>
              <label className="font-semibold text-slate-200 block mb-1">
                Observed Outcome
              </label>
              <input
                type="text"
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                className="w-full bg-[#101625] border border-white/[0.08] rounded-xl p-2 text-white focus:outline-none focus:border-emerald-500"
                placeholder="e.g. Latency returned to <50ms; 0 errors observed in subsequent 30m"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-200 block mb-1">
                Lessons Learned / Runbook Modifications
              </label>
              <textarea
                rows={2}
                value={lessonsLearned}
                onChange={(e) => setLessonsLearned(e.target.value)}
                className="w-full bg-[#101625] border border-white/[0.08] rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                placeholder="e.g. Configure connection pool auto-scaling; add circuit breaker to checkout gateway..."
              />
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-lg shadow-emerald-600/25 active:scale-95 transition-all disabled:opacity-50"
              >
                <Database className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Retaining to Hindsight...' : 'Save Resolution to Hindsight'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
