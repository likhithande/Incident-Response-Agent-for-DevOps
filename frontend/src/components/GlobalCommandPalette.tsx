import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Terminal, 
  Brain, 
  Network, 
  Rocket, 
  BarChart3, 
  Flame, 
  Volume2, 
  VolumeX, 
  Zap, 
  Share2, 
  Play, 
  X,
  Server,
  CornerDownLeft,
  ArrowRight,
  Users,
  Radar,
  FileText
} from 'lucide-react';
import { Incident, ActiveWorkspaceView } from '../types';
import { playClickFeedback } from '../services/audio';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  incidents: Incident[];
  onSelectIncident: (inc: Incident) => void;
  onViewChange: (view: ActiveWorkspaceView) => void;
  onTriggerAutopilot: () => void;
  onTriggerDemo: () => void;
  onOpenChaos: () => void;
  onOpenBroadcast: () => void;
  onToggleMute: () => void;
  isMuted: boolean;
  onRecallMemoryQuery: (q: string) => void;
}

interface PaletteAction {
  id: string;
  category: 'VIEW' | 'INCIDENT' | 'ACTION' | 'MEMORY';
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  handler: () => void;
}

export const GlobalCommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  incidents,
  onSelectIncident,
  onViewChange,
  onTriggerAutopilot,
  onTriggerDemo,
  onOpenChaos,
  onOpenBroadcast,
  onToggleMute,
  isMuted,
  onRecallMemoryQuery
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open
          playClickFeedback();
          // will be handled by parent or state
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Build searchable items
  const allActions: PaletteAction[] = [
    // 1-Click Actions
    {
      id: 'act-autopilot',
      category: 'ACTION',
      title: 'Run Autonomous SRE Autopilot (1-Click Mitigation)',
      subtitle: 'Execute zero-downtime canary rollout & retain to Hindsight',
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      handler: () => { onTriggerAutopilot(); onClose(); }
    },
    {
      id: 'act-demo',
      category: 'ACTION',
      title: 'Trigger Demo Scenario: Payment API Outage (INC-001 vs New)',
      subtitle: 'Simulate critical HTTP 503 outage and recall historical fix',
      icon: <Play className="w-4 h-4 text-blue-400" />,
      handler: () => { onTriggerDemo(); onClose(); }
    },
    {
      id: 'act-chaos',
      category: 'ACTION',
      title: 'Open Chaos Lab (Inject Production Failures)',
      subtitle: 'Simulate connection starvation, Kafka lag, or Redis OOM',
      icon: <Flame className="w-4 h-4 text-rose-400" />,
      handler: () => { onOpenChaos(); onClose(); }
    },
    {
      id: 'act-broadcast',
      category: 'ACTION',
      title: 'Export Incident Briefing & Slack War Room Broadcast',
      subtitle: 'Generate formatted Slack markdown and postmortem report',
      icon: <Share2 className="w-4 h-4 text-purple-400" />,
      handler: () => { onOpenBroadcast(); onClose(); }
    },
    {
      id: 'act-mute',
      category: 'ACTION',
      title: isMuted ? 'Unmute SRE Audio Alert Chimes' : 'Mute SRE Audio Alert Chimes',
      subtitle: 'Toggle synthesized voice and PagerDuty alert audio',
      icon: isMuted ? <Volume2 className="w-4 h-4 text-slate-400" /> : <VolumeX className="w-4 h-4 text-purple-400" />,
      handler: () => { onToggleMute(); onClose(); }
    },

    // Navigation Views
    {
      id: 'view-war-room',
      category: 'VIEW',
      title: 'Switch to War Room (Primary Incident Workspace)',
      subtitle: 'Live incident triage, root cause diagnosis & Hindsight panel',
      icon: <Zap className="w-4 h-4 text-purple-400" />,
      handler: () => { onViewChange('war-room'); onClose(); }
    },
    {
      id: 'view-topology',
      category: 'VIEW',
      title: 'Switch to Microservice Topology & Blast Radius',
      subtitle: 'Live cascading dependency graph and affected services',
      icon: <Network className="w-4 h-4 text-cyan-400" />,
      handler: () => { onViewChange('topology'); onClose(); }
    },
    {
      id: 'view-neural',
      category: 'VIEW',
      title: 'Switch to Neural Memory Constellation Graph',
      subtitle: 'Visual failure clusters and semantic similarity links',
      icon: <Brain className="w-4 h-4 text-indigo-400" />,
      handler: () => { onViewChange('neural-graph'); onClose(); }
    },
    {
      id: 'view-canary',
      category: 'VIEW',
      title: 'Switch to Autonomous Canary Rollout Pilot',
      subtitle: 'Multi-stage traffic shifting with automated rollback safety',
      icon: <Rocket className="w-4 h-4 text-emerald-400" />,
      handler: () => { onViewChange('canary-pilot'); onClose(); }
    },
    {
      id: 'view-analytics',
      category: 'VIEW',
      title: 'Switch to SRE MTTR & Reliability Analytics',
      subtitle: 'Postmortem intelligence and downtime savings report',
      icon: <BarChart3 className="w-4 h-4 text-amber-400" />,
      handler: () => { onViewChange('analytics'); onClose(); }
    },
    {
      id: 'view-swarm',
      category: 'VIEW',
      title: 'Switch to Autonomous SRE Multi-Agent Swarm',
      subtitle: '5 specialized agents collaborating on triage and verification',
      icon: <Users className="w-4 h-4 text-purple-400" />,
      handler: () => { onViewChange('swarm'); onClose(); }
    },
    {
      id: 'view-sentinel',
      category: 'VIEW',
      title: 'Switch to Proactive AI Sentinel & Anomaly Radar',
      subtitle: 'Predict and neutralize outages before customers notice',
      icon: <Radar className="w-4 h-4 text-cyan-400" />,
      handler: () => { onViewChange('sentinel'); onClose(); }
    },
    {
      id: 'view-postmortem',
      category: 'VIEW',
      title: 'Switch to Enterprise Postmortem & Five-Whys RCA Studio',
      subtitle: 'Automated executive RCA report with financial savings accounting',
      icon: <FileText className="w-4 h-4 text-emerald-400" />,
      handler: () => { onViewChange('postmortem'); onClose(); }
    },

    // Incidents
    ...incidents.map(inc => ({
      id: `inc-${inc.incident_id}`,
      category: 'INCIDENT' as const,
      title: `${inc.incident_id}: ${inc.service} (${inc.severity})`,
      subtitle: inc.symptoms?.[0] || inc.root_cause || 'No symptoms specified',
      icon: <Server className="w-4 h-4 text-blue-400" />,
      handler: () => { onSelectIncident(inc); onViewChange('war-room'); onClose(); }
    }))
  ];

  // If query is typed and starts with 'recall' or user wants to recall
  if (query.trim().length > 1) {
    allActions.unshift({
      id: 'dynamic-recall',
      category: 'MEMORY',
      title: `Query Hindsight Memory Bank: "${query}"`,
      subtitle: 'Execute semantic vector recall across historical postmortems',
      icon: <Brain className="w-4 h-4 text-purple-400" />,
      handler: () => { onRecallMemoryQuery(query); onClose(); }
    });
  }

  const filtered = allActions.filter(item => {
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        playClickFeedback();
        filtered[selectedIndex].handler();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-start justify-center p-4 sm:pt-20 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-[#090D17] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col glow-cyan animate-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-white/[0.08] flex items-center gap-3 bg-[#0D1322]">
          <Search className="w-5 h-5 text-cyan-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, incident ID (INC-001), query memory, or switch views..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-[10px] font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded text-slate-400">
            ESC to close
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No commands or incidents match &quot;{query}&quot;.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => { playClickFeedback(); item.handler(); }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all text-xs ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 border border-cyan-500/40 text-white'
                      : 'hover:bg-white/[0.03] text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-1.5 rounded-lg bg-[#141B2D] border border-white/[0.06] flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="truncate">
                      <div className="font-semibold text-white truncate flex items-center gap-2">
                        <span>{item.title}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-slate-400">
                          {item.category}
                        </span>
                      </div>
                      {item.subtitle && (
                        <div className="text-[11px] text-slate-400 truncate">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <CornerDownLeft className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 ml-2" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-2.5 bg-[#070B14] border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="text-cyan-400 font-bold">OpsMemory Cyber Command HUD</span>
        </div>
      </div>
    </div>
  );
};
