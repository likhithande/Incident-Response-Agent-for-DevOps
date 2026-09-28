import React from 'react';
import { 
  Database, 
  Cpu, 
  RefreshCw, 
  Key, 
  Play, 
  Share2, 
  Flame, 
  Volume2, 
  VolumeX, 
  Network, 
  BarChart3, 
  Zap,
  Activity,
  Brain,
  Rocket,
  Users,
  Radar,
  FileText
} from 'lucide-react';
import { MemoryStatusResponse, Incident, ActiveWorkspaceView } from '../types';
import { playClickFeedback } from '../services/audio';

interface NavbarProps {
  memoryStatus: MemoryStatusResponse | null;
  onSeed: () => void;
  onOpenSettings: () => void;
  onTriggerDemo: () => void;
  isSeeding: boolean;
  activeIncident: Incident | null;
  currentView: ActiveWorkspaceView;
  onViewChange: (view: ActiveWorkspaceView) => void;
  onOpenBroadcast: () => void;
  onOpenChaos: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  memoryStatus,
  onSeed,
  onOpenSettings,
  onTriggerDemo,
  isSeeding,
  activeIncident,
  currentView,
  onViewChange,
  onOpenBroadcast,
  onOpenChaos,
  isMuted,
  onToggleMute,
}) => {
  return (
    <header className="glass-panel sticky top-0 z-40 border-b border-white/[0.08] backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer" onClick={() => { playClickFeedback(); onViewChange('war-room'); }}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/25 border border-white/20 transition-transform group-hover:scale-105">
              <Database className="w-4 h-4 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-sm border-2 border-[#0B0F17] animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
                OpsMemory
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md whitespace-nowrap bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-sm">
                  Hindsight SRE
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Autonomous Incident Response Agent with Persistent Memory
            </p>
          </div>
        </div>

        {/* Center Workspace View Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#090D17] border border-white/[0.08] text-xs font-semibold self-stretch lg:self-auto overflow-x-auto custom-scrollbar max-w-full">
          <button
            onClick={() => { playClickFeedback(); onViewChange('war-room'); }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              currentView === 'war-room'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>War Room</span>
          </button>

          <button
            onClick={() => { playClickFeedback(); onViewChange('topology'); }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              currentView === 'topology'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Topology & Blast Radius</span>
          </button>

          <button
            onClick={() => { playClickFeedback(); onViewChange('neural-graph'); }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              currentView === 'neural-graph'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Neural Graph</span>
          </button>

          <button
            onClick={() => { playClickFeedback(); onViewChange('canary-pilot'); }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              currentView === 'canary-pilot'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Canary Pilot</span>
          </button>

          <button
            onClick={() => { playClickFeedback(); onViewChange('analytics'); }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              currentView === 'analytics'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>SRE Analytics</span>
          </button>

          <button
            onClick={() => { playClickFeedback(); onViewChange('swarm'); }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              currentView === 'swarm'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/30 glow-purple'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Agent Swarm</span>
          </button>

          <button
            onClick={() => { playClickFeedback(); onViewChange('sentinel'); }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              currentView === 'sentinel'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-900/30 glow-cyan'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Radar className="w-3.5 h-3.5" />
            <span>AI Sentinel</span>
          </button>

          <button
            onClick={() => { playClickFeedback(); onViewChange('postmortem'); }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              currentView === 'postmortem'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/30 glow-emerald'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>RCA Studio</span>
          </button>

          <button
            onClick={() => { playClickFeedback(); onOpenChaos(); }}
            className="px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-all font-bold"
          >
            <Flame className="w-3.5 h-3.5 animate-pulse" />
            <span>Chaos Lab</span>
          </button>
        </div>

        {/* Right Live Controls & Actions */}
        <div className="flex flex-wrap items-center gap-2 justify-end w-full lg:w-auto">
          {/* Audio Sound Toggle */}
          <button
            onClick={() => { playClickFeedback(); onToggleMute(); }}
            className={`p-1.5 rounded-lg border transition-all ${
              isMuted 
                ? 'bg-white/5 border-white/10 text-slate-500 hover:text-slate-300' 
                : 'bg-purple-950/30 border-purple-500/30 text-purple-300 hover:text-white'
            }`}
            title={isMuted ? 'Unmute SRE Audio Alert Chimes' : 'Mute Sound Effects'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-purple-400" />}
          </button>

          {/* Broadcast & Export Modal Trigger */}
          <button
            onClick={() => { playClickFeedback(); onOpenBroadcast(); }}
            className="flex items-center gap-1.5 bg-[#121A2A] hover:bg-[#1A253B] border border-white/[0.08] text-slate-200 hover:text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all"
            title="Generate Slack Incident Broadcast & Postmortem Markdown"
          >
            <Share2 className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Broadcast & Export</span>
          </button>

          {/* Critical Demo 1-Click Action */}
          <button
            onClick={() => { playClickFeedback(); onTriggerDemo(); }}
            className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm shadow-blue-500/30 active:scale-95 transition-all"
            title="Load Critical Demo: Payment API Outage (INC-001 vs New Incident)"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Demo Scenario</span>
          </button>

          {/* Seed Memories Button */}
          <button
            onClick={() => { playClickFeedback(); onSeed(); }}
            disabled={isSeeding}
            className="flex items-center gap-1.5 bg-[#121A2A] hover:bg-[#1A253B] border border-white/[0.08] text-slate-200 hover:text-white text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50"
            title="Seed Hindsight with 10 production incident postmortems"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isSeeding ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Seed</span>
            {memoryStatus && (
              <span className="bg-[#0B0F17] text-amber-300 font-mono text-[10px] px-1.5 py-0.2 rounded border border-white/[0.06]">
                {memoryStatus.retained_count}
              </span>
            )}
          </button>

          {/* Settings Modal Trigger */}
          <button
            onClick={() => { playClickFeedback(); onOpenSettings(); }}
            className="p-1.5 bg-[#121A2A] hover:bg-[#1A253B] border border-white/[0.08] text-slate-300 hover:text-white rounded-lg transition-all"
            title="API Keys & Engine Settings"
          >
            <Key className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
