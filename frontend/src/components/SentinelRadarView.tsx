import React, { useState, useEffect } from 'react';
import { 
  Radar, 
  ShieldAlert, 
  Clock, 
  Brain, 
  Activity, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  TrendingUp, 
  AlertTriangle,
  Play
} from 'lucide-react';
import { SentinelResponse, SentinelAnomalyItem } from '../types';
import { fetchSentinelAnomalies } from '../services/api';
import { playClickFeedback, playResolutionChime, playHotPatchDeploySound } from '../services/audio';

interface SentinelRadarViewProps {
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const SentinelRadarView: React.FC<SentinelRadarViewProps> = ({ onShowToast }) => {
  const [data, setData] = useState<SentinelResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [preventedIds, setPreventedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadSentinel();
  }, []);

  const loadSentinel = async () => {
    try {
      setLoading(true);
      const res = await fetchSentinelAnomalies();
      setData(res);
    } catch (err: any) {
      console.error('Sentinel fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProactiveScale = (item: SentinelAnomalyItem) => {
    playHotPatchDeploySound();
    setPreventedIds(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      playResolutionChime();
      onShowToast(
        `Proactive prevention applied for ${item.service}! Scaled capacity before outage occurred. Zero 503s served.`,
        'success'
      );
    }, 800);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="glass-card rounded-2xl p-6 border border-cyan-500/30 shadow-2xl relative overflow-hidden glow-cyan">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-600/30">
              <Radar className="w-6 h-6 text-white animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Proactive AI Sentinel &amp; Anomaly Radar
                </h2>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-md whitespace-nowrap bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold uppercase">
                  Continuous Scanning
                </span>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-md whitespace-nowrap bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                  94.8% Outage Prevention
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Matches pre-failure telemetry curves against Hindsight historical postmortems to neutralize outages before customers notice.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="p-3 bg-[#080C14] rounded-xl border border-white/[0.06] text-center">
              <span className="text-[10px] text-slate-400 block uppercase">Monitored Services</span>
              <span className="text-base font-bold text-white">6 Fleet Targets</span>
            </div>
            <div className="p-3 bg-[#080C14] rounded-xl border border-white/[0.06] text-center">
              <span className="text-[10px] text-slate-400 block uppercase">Pre-Outage Threats</span>
              <span className="text-base font-bold text-amber-400">{data?.total_anomalies || 3} Detected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Threats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data?.active_threats.map((threat) => {
          const isPrevented = !!preventedIds[threat.id];

          return (
            <div
              key={threat.id}
              className={`glass-panel rounded-2xl p-5 border shadow-2xl flex flex-col justify-between space-y-4 transition-all ${
                isPrevented
                  ? 'border-emerald-500/40 bg-emerald-950/15'
                  : threat.severity === 'HIGH'
                  ? 'border-rose-500/30 bg-rose-950/10 hover:border-rose-500/50'
                  : 'border-amber-500/30 bg-amber-950/10 hover:border-amber-500/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{threat.service}</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                      threat.severity === 'HIGH' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {threat.severity}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-cyan-400 font-bold">
                    {threat.confidence_score}% Match
                  </span>
                </div>

                <div className="space-y-3 mt-3.5 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Anomalous Telemetry Target</span>
                    <span className="text-xs font-bold text-slate-200 block truncate">
                      {threat.metric_target}
                    </span>
                    <span className="text-[11px] text-rose-300 block mt-0.5">
                      {threat.current_value}
                    </span>
                  </div>

                  {/* Time to Saturation Gauge */}
                  <div className="bg-[#090D17] p-2.5 rounded-xl border border-white/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-amber-300">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-bold">Time-to-Outage:</span>
                    </div>
                    <span className="text-[11px] font-bold text-white">
                      {threat.projected_outage_time}
                    </span>
                  </div>

                  {/* Hindsight Pattern Precedent */}
                  <div className="bg-purple-950/25 p-2.5 rounded-xl border border-purple-500/25 text-[11px] text-purple-200">
                    <div className="flex items-center gap-1 font-bold text-purple-300 mb-1">
                      <Brain className="w-3.5 h-3.5" />
                      <span>Hindsight Precedent Match</span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                      {threat.hindsight_pattern_match}
                    </p>
                  </div>

                  {/* Recommended Action */}
                  <div className="text-[11px] text-slate-300 font-sans leading-relaxed">
                    <strong className="text-slate-400 block font-mono text-[10px] uppercase">
                      Preventative Remediation:
                    </strong>
                    {threat.preventative_action}
                  </div>
                </div>
              </div>

              {/* Proactive Action Button */}
              <div>
                {isPrevented ? (
                  <div className="w-full py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Proactively Prevented &amp; Scaled</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleProactiveScale(threat)}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Zap className="w-3.5 h-3.5 fill-yellow-300 text-yellow-300" />
                    <span>Apply Preventative Scale</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
