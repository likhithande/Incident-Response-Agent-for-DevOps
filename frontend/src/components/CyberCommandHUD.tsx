import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Brain, 
  Terminal, 
  Clock, 
  Radio, 
  Play, 
  ShieldAlert, 
  Cpu, 
  Search,
  Sparkles,
  Zap
} from 'lucide-react';
import { Incident } from '../types';
import { isSpeaking, playClickFeedback } from '../services/audio';

interface CyberCommandHUDProps {
  activeIncident: Incident | null;
  onOpenCommandPalette: () => void;
  onOpenAutopilot: () => void;
  onToggleTimeTravel: () => void;
  isTimeTravelActive: boolean;
  recalledCount: number;
}

export const CyberCommandHUD: React.FC<CyberCommandHUDProps> = ({
  activeIncident,
  onOpenCommandPalette,
  onOpenAutopilot,
  onToggleTimeTravel,
  isTimeTravelActive,
  recalledCount
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(142);
  const [speakingActive, setSpeakingActive] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
      setSpeakingActive(isSpeaking());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatElapsed = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isCritical = activeIncident?.severity === 'CRITICAL';

  return (
    <div className="w-full bg-[#070B14]/95 border-b border-white/[0.08] backdrop-blur-md px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs z-30 flex-shrink-0">
      {/* Left: Telemetry Ticker */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 font-mono">
        {/* Outage Status & Chronometer */}
        <div className="flex items-center gap-2 bg-[#0E1526] px-2.5 py-1 rounded-lg border border-white/[0.06]">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-sm opacity-75 ${isCritical ? 'bg-rose-500' : 'bg-amber-400'}`}></span>
            <span className={`relative inline-flex rounded-sm h-2 w-2 ${isCritical ? 'bg-rose-500' : 'bg-amber-400'}`}></span>
          </span>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Triage Clock:</span>
          <span className="text-[11px] font-bold text-white tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            {formatElapsed(elapsedSeconds)}
          </span>
        </div>

        {/* P99 Latency Indicator */}
        <div className="hidden md:flex items-center gap-1.5 bg-[#0E1526] px-2.5 py-1 rounded-lg border border-white/[0.06]">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[10px] text-slate-400 uppercase">P99 Latency:</span>
          <span className={`text-[11px] font-bold ${isCritical ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
            {isCritical ? '4,250 ms' : '41 ms'}
          </span>
        </div>

        {/* Vector Recall Precision */}
        <div className="hidden lg:flex items-center gap-1.5 bg-[#0E1526] px-2.5 py-1 rounded-lg border border-purple-500/20">
          <Brain className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-[10px] text-slate-400 uppercase">Vector Recall:</span>
          <span className="text-[11px] font-bold text-purple-300">
            {recalledCount > 0 ? '96.4% Confidence' : 'Standing By'}
          </span>
        </div>

        {/* SRE Voice Waveform */}
        <div className="hidden sm:flex items-center gap-1 bg-[#0E1526] px-2.5 py-1 rounded-lg border border-white/[0.06]" title="AI Speech Synthesizer Status">
          <Radio className={`w-3.5 h-3.5 ${speakingActive ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
          <div className="flex items-center gap-0.5 h-3 px-1">
            <div className={`w-1 rounded-sm bg-emerald-400 ${speakingActive ? 'animate-eq-1' : 'h-1'}`} />
            <div className={`w-1 rounded-sm bg-emerald-400 ${speakingActive ? 'animate-eq-2' : 'h-2'}`} />
            <div className={`w-1 rounded-sm bg-emerald-400 ${speakingActive ? 'animate-eq-3' : 'h-1.5'}`} />
            <div className={`w-1 rounded-sm bg-emerald-400 ${speakingActive ? 'animate-eq-4' : 'h-1'}`} />
          </div>
          <span className="text-[9px] text-slate-400">
            {speakingActive ? 'VOICE ON' : 'SYNTH'}
          </span>
        </div>
      </div>

      {/* Right: Quick Action Futuristic Triggers */}
      <div className="flex items-center gap-2">
        {/* Spotlight Command Palette Trigger */}
        <button
          onClick={() => { playClickFeedback(); onOpenCommandPalette(); }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#121929] hover:bg-[#1A2338] border border-white/[0.08] hover:border-cyan-500/40 text-slate-300 hover:text-white transition-all text-[11px] group"
          title="Open Global Spotlight Command Palette (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline font-sans">Command Palette</span>
          <kbd className="font-mono text-[9px] bg-black/40 px-1.5 py-0.5 rounded text-slate-400 border border-white/[0.08]">
            Ctrl+K
          </kbd>
        </button>

        {/* Time-Travel Counterfactual Simulator */}
        <button
          onClick={() => { playClickFeedback(); onToggleTimeTravel(); }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
            isTimeTravelActive
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20'
              : 'bg-[#121929] hover:bg-[#1A2338] text-slate-300 hover:text-white border-white/[0.08]'
          }`}
          title="Toggle Time-Travel Incident Lifecycle Replay"
        >
          <Clock className={`w-3.5 h-3.5 ${isTimeTravelActive ? 'text-amber-400 animate-spin' : 'text-amber-400'}`} />
          <span className="font-sans">Time-Travel Replay</span>
        </button>

        {/* 1-Click Autonomous SRE Autopilot */}
        <button
          onClick={() => { playClickFeedback(); onOpenAutopilot(); }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-[11px] shadow-md shadow-purple-600/30 active:scale-95 transition-all"
          title="Trigger Autonomous SRE Self-Healing Engine (Canary & Patch)"
        >
          <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
          <span className="font-sans">SRE Autopilot</span>
          <span className="hidden md:inline-block text-[9px] bg-white/20 px-1 rounded uppercase tracking-wider">
            1-Click
          </span>
        </button>
      </div>
    </div>
  );
};
