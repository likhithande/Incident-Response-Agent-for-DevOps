import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Users, 
  Sparkles, 
  ShieldCheck, 
  Brain, 
  Activity, 
  Terminal, 
  CheckCircle2, 
  Play, 
  RefreshCw,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';
import { SwarmTriageResponse, SwarmAgentMessage } from '../types';
import { runSwarmTriage } from '../services/api';
import { playClickFeedback, playResolutionChime, playHotPatchDeploySound } from '../services/audio';

interface SwarmViewProps {
  incidentId?: string;
  service?: string;
  onOpenAutopilot?: () => void;
}

export const SwarmView: React.FC<SwarmViewProps> = ({
  incidentId = 'INC-001',
  service = 'Payment API',
  onOpenAutopilot
}) => {
  const [data, setData] = useState<SwarmTriageResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);

  const loadSwarm = async () => {
    try {
      setLoading(true);
      playHotPatchDeploySound();
      const res = await runSwarmTriage(incidentId, service);
      setData(res);
      setActiveAgentId(res.messages[0]?.id || null);
      playResolutionChime();
    } catch (err: any) {
      console.error('Failed to run swarm triage:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSwarm();
  }, [incidentId, service]);

  const activeMsg = data?.messages.find(m => m.id === activeAgentId) || data?.messages[0];

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="glass-card rounded-2xl p-6 border border-purple-500/30 shadow-2xl relative overflow-hidden glow-purple">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-600/30">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Autonomous SRE Multi-Agent Swarm
                </h2>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-md whitespace-nowrap bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold uppercase">
                  5 Agents Active
                </span>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-md whitespace-nowrap bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                  Consensus Reached
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Specialized collaborative agents cross-validating telemetry, Hindsight memory recall, safety constraints, and automated rollout.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadSwarm}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white text-xs font-semibold transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${loading ? 'animate-spin' : ''}`} />
              <span>Re-Dispatch Swarm</span>
            </button>

            {onOpenAutopilot && (
              <button
                onClick={onOpenAutopilot}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4 fill-current text-yellow-300" />
                <span>Execute Consensus Autopilot</span>
              </button>
            )}
          </div>
        </div>

        {/* 5 Agent Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-5">
          {data?.messages.map((m) => {
            const isSelected = m.id === activeAgentId;
            return (
              <button
                key={m.id}
                onClick={() => { playClickFeedback(); setActiveAgentId(m.id); }}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                  isSelected
                    ? 'bg-purple-600/20 border-purple-400 shadow-md shadow-purple-500/20'
                    : 'bg-[#0B0F19]/60 border-white/[0.06] hover:border-white/[0.15]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">{m.agent_avatar}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                    VERIFIED
                  </span>
                </div>
                <div className="font-bold text-white text-xs truncate">
                  {m.agent_name}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {m.agent_role}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Agent Transcript & Evidence Inspector */}
      {activeMsg && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left 2 Cols: Collaborative Agent Dialogue */}
          <div className="lg:col-span-2 glass-panel rounded-2xl p-5 border border-white/[0.08] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
              <div className="flex items-center gap-2">
                <span className="text-xl">{activeMsg.agent_avatar}</span>
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    {activeMsg.agent_name} — {activeMsg.agent_role}
                  </h3>
                  <span className="text-[10px] text-purple-300 font-mono">
                    Phase: {activeMsg.phase}
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-mono bg-purple-500/15 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                Grounded in Hindsight Memory
              </span>
            </div>

            {/* Thought Trace Box */}
            <div className="bg-[#080C14] rounded-xl p-3.5 border border-white/[0.06] space-y-1.5">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block font-bold flex items-center gap-1">
                <Terminal className="w-3 h-3 text-cyan-400" />
                <span>Internal Agent Chain-of-Thought Trace:</span>
              </span>
              <p className="text-xs text-slate-300 font-mono leading-relaxed pl-2 border-l border-cyan-500/40">
                {activeMsg.thought_trace}
              </p>
            </div>

            {/* Verdict Output Message */}
            <div className="bg-[#12192A] rounded-xl p-4 border border-purple-500/25 space-y-1.5">
              <span className="text-[10px] text-purple-400 font-mono uppercase tracking-wider block font-bold">
                Swarm Dispatch Message:
              </span>
              <p className="text-sm text-white font-medium leading-relaxed">
                {activeMsg.output_message}
              </p>
            </div>

            {/* Evidence Tag */}
            {activeMsg.evidence_tag && (
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-500/30">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>Evidence Verified: {activeMsg.evidence_tag}</span>
              </div>
            )}
          </div>

          {/* Right Col: Swarm Consensus Synthesis */}
          <div className="glass-panel rounded-2xl p-5 border border-white/[0.08] shadow-2xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-white/[0.07]">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                  Swarm Consensus Engine
                </h3>
              </div>

              <div className="space-y-3 mt-3.5 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">
                    Consensus Confidence
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-2 bg-white/10 rounded-sm overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-sm" style={{ width: `${data?.overall_confidence || 96}%` }} />
                    </div>
                    <span className="font-mono font-bold text-white text-sm">
                      {data?.overall_confidence || 96}%
                    </span>
                  </div>
                </div>

                <div className="bg-[#0B0F1A] p-3 rounded-xl border border-white/[0.06]">
                  <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block mb-1">
                    Diagnosed Root Cause
                  </span>
                  <p className="text-slate-200 text-xs leading-relaxed font-semibold">
                    {data?.consensus_root_cause}
                  </p>
                </div>

                <div className="bg-[#0B0F1A] p-3 rounded-xl border border-white/[0.06]">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block mb-1">
                    Approved Mitigation Procedure
                  </span>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {data?.consensus_action}
                  </p>
                </div>

                <div className="bg-purple-950/20 p-2.5 rounded-xl border border-purple-500/20 text-[11px] text-purple-200 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>
                    Historical Precedent: <strong className="text-white underline">{data?.hindsight_memory_cited}</strong>
                  </span>
                </div>
              </div>
            </div>

            {onOpenAutopilot && (
              <button
                onClick={onOpenAutopilot}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Execute Autopilot Remediation</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
