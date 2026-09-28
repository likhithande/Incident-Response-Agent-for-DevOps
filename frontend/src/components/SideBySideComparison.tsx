import React from 'react';
import { 
  Terminal, 
  Brain, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  X, 
  Layers,
  ArrowRight,
  TrendingUp,
  AlertOctagon
} from 'lucide-react';
import { IncidentAnalysisResponse } from '../types';

interface SideBySideComparisonProps {
  statelessResponse: IncidentAnalysisResponse | null;
  memoryResponse: IncidentAnalysisResponse | null;
  isLoading: boolean;
  onClose: () => void;
}

export const SideBySideComparison: React.FC<SideBySideComparisonProps> = ({
  statelessResponse,
  memoryResponse,
  isLoading,
  onClose,
}) => {
  return (
    <div className="glass-panel rounded-xl p-5 shadow-2xl space-y-4 border border-amber-500/30 glow-amber animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3 h-3" />
              Empirical Differentiator
            </span>
            <h3 className="text-base font-extrabold text-white">
              Before vs. After: Stateless AI vs. OpsMemory with Hindsight
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visual proof of how persistent memory replaces speculative troubleshooting with empirical postmortem runbooks.
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors"
          title="Exit comparison"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Running dual comparative incident triage...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Column 1: WITHOUT MEMORY */}
          <div className="bg-[#090D15] border border-white/[0.07] rounded-xl p-4 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-slate-500/20 text-slate-400 flex items-center justify-center">
                    <Terminal className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wide">
                      Without Memory (Stateless AI)
                    </h4>
                    <span className="text-[10px] text-slate-500">Standard LLM incident bot</span>
                  </div>
                </div>

                <span className="bg-slate-500/15 text-slate-400 border border-slate-500/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  Generic Advice
                </span>
              </div>

              {statelessResponse ? (
                <div className="mt-3 space-y-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-400 block text-[10px] uppercase tracking-wider mb-1">
                      Diagnosis:
                    </span>
                    <p className="text-slate-300 bg-[#101624] p-2.5 rounded-lg border border-white/[0.05] leading-relaxed">
                      {statelessResponse.analysis.likely_root_cause}
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-slate-400 block text-[10px] uppercase tracking-wider mb-1">
                      Diagnostic Steps:
                    </span>
                    <ul className="space-y-1 bg-[#101624] p-2.5 rounded-lg border border-white/[0.05]">
                      {statelessResponse.analysis.recommended_investigation.slice(0, 4).map((step, i) => (
                        <li key={i} className="text-slate-300 flex items-start gap-2 text-[11px] leading-relaxed">
                          <span className="text-slate-500 font-mono mt-0.5">•</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-bold text-slate-400 block text-[10px] uppercase tracking-wider mb-1">
                      Proposed Resolution:
                    </span>
                    <ul className="space-y-1 bg-[#101624] p-2.5 rounded-lg border border-white/[0.05]">
                      {statelessResponse.analysis.recommended_resolution.map((step, i) => (
                        <li key={i} className="text-slate-300 flex items-start gap-2 text-[11px] leading-relaxed">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-rose-500/10 border border-rose-500/25 p-3 rounded-lg text-[11px] text-rose-300 space-y-1">
                    <span className="font-bold flex items-center gap-1">
                      <AlertOctagon className="w-3.5 h-3.5" />
                      Critical Operational Risk:
                    </span>
                    <p className="leading-relaxed text-slate-300">
                      The stateless model suggests blind instance restarts. In database pool saturation, restarting service pods triggers an immediate influx of reconnection requests, worsening the outage.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 py-6 text-center">No stateless data.</div>
              )}
            </div>
          </div>

          {/* Column 2: WITH HINDSIGHT MEMORY */}
          <div className="bg-gradient-to-b from-[#130E26] to-[#0A0D18] border border-purple-500/40 rounded-xl p-4 flex flex-col justify-between space-y-4 glow-purple">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-purple-500/30">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                    <Brain className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-purple-200 text-xs uppercase tracking-wide">
                      With Hindsight Memory
                    </h4>
                    <span className="text-[10px] text-purple-400/80 font-mono">OpsMemory Agent</span>
                  </div>
                </div>

                <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  Context-Aware
                </span>
              </div>

              {memoryResponse ? (
                <div className="mt-3 space-y-3 text-xs">
                  <div>
                    <span className="font-bold text-purple-300 block text-[10px] uppercase tracking-wider mb-1">
                      Correlated Root Cause:
                    </span>
                    <p className="text-white bg-purple-950/30 p-2.5 rounded-lg border border-purple-500/30 font-medium leading-relaxed">
                      {memoryResponse.analysis.likely_root_cause}
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-purple-300 block text-[10px] uppercase tracking-wider mb-1">
                      Targeted Diagnostic Runbook:
                    </span>
                    <ul className="space-y-1 bg-purple-950/30 p-2.5 rounded-lg border border-purple-500/30">
                      {memoryResponse.analysis.recommended_investigation.slice(0, 4).map((step, i) => (
                        <li key={i} className="text-slate-200 flex items-start gap-2 text-[11px] leading-relaxed">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-bold text-purple-300 block text-[10px] uppercase tracking-wider mb-1">
                      Verified Remediation (Proven in INC-001):
                    </span>
                    <ul className="space-y-1 bg-purple-950/30 p-2.5 rounded-lg border border-purple-500/30">
                      {memoryResponse.analysis.recommended_resolution.map((step, i) => (
                        <li key={i} className="text-slate-200 flex items-start gap-2 text-[11px] leading-relaxed">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-purple-500/20 border border-purple-500/30 p-3 rounded-lg text-[11px] text-purple-200 space-y-1">
                    <span className="font-bold flex items-center gap-1 text-purple-300">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      The Hindsight Advantage:
                    </span>
                    <p className="leading-relaxed text-slate-200">
                      Retrieved historical incident <span className="font-mono font-bold text-white underline">{memoryResponse.retrieved_memories[0]?.incident_id || 'INC-001'}</span>. Provides verified capacity numbers (scale pool from 50 to 150) rather than generic trial-and-error restarts.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 py-6 text-center">No memory data.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
