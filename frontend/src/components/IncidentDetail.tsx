import React, { useState } from 'react';
import { 
  Play, 
  Brain, 
  Terminal, 
  Layers, 
  Sparkles, 
  Clock, 
  Copy, 
  Check, 
  AlertOctagon 
} from 'lucide-react';
import { Incident } from '../types';

interface IncidentDetailProps {
  incident: Incident;
  onChange: (updated: Incident) => void;
  onAnalyze: (withMemory: boolean) => void;
  onToggleCompare: () => void;
  isAnalyzing: boolean;
  withMemory: boolean;
  isCompareMode: boolean;
}

export const IncidentDetail: React.FC<IncidentDetailProps> = ({
  incident,
  onChange,
  onAnalyze,
  onToggleCompare,
  isAnalyzing,
  withMemory,
  isCompareMode
}) => {
  const [copiedLogs, setCopiedLogs] = useState(false);

  const copyLogs = () => {
    navigator.clipboard.writeText(incident.error_logs.join('\n'));
    setCopiedLogs(true);
    setTimeout(() => setCopiedLogs(false), 2000);
  };

  const addCommonSymptom = (symptom: string) => {
    if (!incident.symptoms.includes(symptom)) {
      onChange({ ...incident, symptoms: [...incident.symptoms, symptom] });
    }
  };

  const isCritical = incident.severity === 'CRITICAL';
  const isHigh = incident.severity === 'HIGH';

  return (
    <div className="glass-card rounded-2xl p-5 shadow-2xl space-y-4 border border-white/[0.08]">
      {/* Top Banner: Incident Title, Status & Mode Selector */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3.5 border-b border-white/[0.07]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30 uppercase tracking-wider">
              {incident.incident_id}
            </span>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md whitespace-nowrap border ${
              incident.status === 'RESOLVED'
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-400 border-rose-500/30 flex items-center gap-1'
            }`}>
              {incident.status !== 'RESOLVED' && <span className="w-1.5 h-1.5 rounded-sm bg-rose-500 radar-ping" />}
              {incident.status}
            </span>
            <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {incident.timestamp ? new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live Outage'}
            </span>
          </div>

          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            {incident.service}
          </h2>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1 bg-[#090D16] p-1 rounded-xl border border-white/[0.08] text-xs">
          <button
            onClick={() => onAnalyze(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              withMemory && !isCompareMode
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/30 glow-purple'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>With Hindsight Memory</span>
          </button>

          <button
            onClick={() => onAnalyze(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              !withMemory && !isCompareMode
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Stateless AI</span>
          </button>

          <button
            onClick={onToggleCompare}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              isCompareMode
                ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Side-by-side comparison of stateless vs Hindsight memory"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Compare Mode</span>
          </button>
        </div>
      </div>

      {/* Live SRE Telemetry Gauges Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-[#090D17] border border-white/[0.06] text-xs font-mono">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">P99 Latency</span>
          <span className={`font-bold text-sm ${isCritical ? 'text-rose-400' : (isHigh ? 'text-amber-400' : 'text-emerald-400')}`}>
            {isCritical ? '4,250 ms' : (isHigh ? '1,840 ms' : '45 ms')}
          </span>
          <span className="text-[9px] text-slate-500">baseline: 42ms</span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">Error Rate</span>
          <span className={`font-bold text-sm ${isCritical ? 'text-rose-400' : (isHigh ? 'text-amber-400' : 'text-emerald-400')}`}>
            {isCritical ? '18.4%' : (isHigh ? '6.2%' : '0.01%')}
          </span>
          <span className="text-[9px] text-slate-500">HTTP 503 / 504</span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">Impacted Traffic</span>
          <span className={`font-bold text-sm ${isCritical ? 'text-rose-300' : 'text-slate-300'}`}>
            {isCritical ? '~3,400 req/s' : 'Minimal'}
          </span>
          <span className="text-[9px] text-slate-500">Checkout / API Gateway</span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">SLO Status</span>
          <span className={`font-bold text-sm flex items-center gap-1 ${isCritical ? 'text-rose-400' : 'text-emerald-400'}`}>
            {isCritical ? 'BREACHED (0.00%)' : 'HEALTHY (99.95%)'}
          </span>
          <span className="text-[9px] text-slate-500">Monthly Error Budget</span>
        </div>
      </div>

      {/* Primary Attributes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="text-slate-400 font-semibold mb-1 block">Service Name</label>
          <input
            type="text"
            value={incident.service}
            onChange={(e) => onChange({ ...incident, service: e.target.value })}
            className="w-full bg-[#111726] border border-white/[0.08] rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <label className="text-slate-400 font-semibold mb-1 block">Severity Level</label>
          <select
            value={incident.severity}
            onChange={(e) => onChange({ ...incident, severity: e.target.value as any })}
            className="w-full bg-[#111726] border border-white/[0.08] rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-purple-500"
          >
            <option value="CRITICAL">P1 - CRITICAL (Service Outage)</option>
            <option value="HIGH">P2 - HIGH (Performance Degraded)</option>
            <option value="MEDIUM">P3 - MEDIUM (Non-Critical)</option>
            <option value="LOW">P4 - LOW (Minor Telemetry Bug)</option>
          </select>
        </div>

        <div>
          <label className="text-slate-400 font-semibold mb-1 block">Incident Status</label>
          <select
            value={incident.status}
            onChange={(e) => onChange({ ...incident, status: e.target.value as any })}
            className="w-full bg-[#111726] border border-white/[0.08] rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-purple-500"
          >
            <option value="ACTIVE">ACTIVE (Investigating)</option>
            <option value="INVESTIGATING">INVESTIGATING (Runbook Active)</option>
            <option value="RESOLVED">RESOLVED (Retained in Memory)</option>
          </select>
        </div>
      </div>

      {/* Observed Symptoms */}
      <div className="text-xs space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-slate-300 font-semibold">
            Observed Symptoms (one per line)
          </label>
          {/* Quick chips */}
          <div className="hidden sm:flex items-center gap-1.5 text-[10px]">
            <span className="text-slate-500">Quick add:</span>
            <button
              type="button"
              onClick={() => addCommonSymptom('HTTP 503 Service Unavailable')}
              className="px-2 py-0.5 rounded bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 transition-colors"
            >
              + 503 Outage
            </button>
            <button
              type="button"
              onClick={() => addCommonSymptom('Database connection timeout')}
              className="px-2 py-0.5 rounded bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 transition-colors"
            >
              + DB Timeout
            </button>
            <button
              type="button"
              onClick={() => addCommonSymptom('High P99 latency (>4000ms)')}
              className="px-2 py-0.5 rounded bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 transition-colors"
            >
              + High Latency
            </button>
          </div>
        </div>

        <textarea
          rows={2}
          value={incident.symptoms.join('\n')}
          onChange={(e) =>
            onChange({
              ...incident,
              symptoms: e.target.value.split('\n').filter((s) => s.trim().length > 0)
            })
          }
          className="w-full bg-[#111726] border border-white/[0.08] rounded-xl p-2.5 text-slate-100 font-mono text-xs focus:outline-none focus:border-purple-500 leading-relaxed"
          placeholder="HTTP 503 Service Unavailable&#10;Database connection timeout&#10;High latency"
        />
      </div>

      {/* Error Logs Terminal */}
      <div className="text-xs space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-slate-300 font-semibold flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Captured Telemetry & Stack Traces</span>
          </label>
          <button
            type="button"
            onClick={copyLogs}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
          >
            {copiedLogs ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedLogs ? 'Copied' : 'Copy Logs'}</span>
          </button>
        </div>

        <div className="relative rounded-xl overflow-hidden border border-white/[0.08] bg-[#070A11]">
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#0C121F] border-b border-white/[0.05] text-[10px] text-slate-400 font-mono">
            <span>stderr / stdout stream</span>
            <span className="text-emerald-400 font-bold">● live stream</span>
          </div>
          <textarea
            rows={3}
            value={incident.error_logs.join('\n')}
            onChange={(e) =>
              onChange({
                ...incident,
                error_logs: e.target.value.split('\n').filter((s) => s.trim().length > 0)
              })
            }
            className="w-full bg-transparent p-2.5 text-emerald-400 font-mono text-xs focus:outline-none leading-relaxed resize-y"
            placeholder="Timeout waiting for database connection from pool&#10;Connection pool exhausted (active=50, max=50)"
          />
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-white/[0.07] flex flex-wrap items-center justify-between gap-3">
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          {withMemory ? (
            <span className="flex items-center gap-1 text-purple-300 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Hindsight persistent memory bank will be queried across past postmortems.</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-slate-400 font-medium">
              <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
              <span>Stateless mode: Triage without historical postmortem knowledge.</span>
            </span>
          )}
        </div>

        <button
          onClick={() => onAnalyze(withMemory)}
          disabled={isAnalyzing}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-purple-600/25 active:scale-95 transition-all disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Querying Hindsight & Correlating...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Analyze Incident</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
