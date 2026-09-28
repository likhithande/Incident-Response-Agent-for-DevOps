import React, { useState } from 'react';
import { 
  Clock, 
  Database, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Terminal, 
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Filter
} from 'lucide-react';
import { TimelineEvent } from '../types';

interface MemoryTimelineProps {
  events: TimelineEvent[];
}

export const MemoryTimeline: React.FC<MemoryTimelineProps> = ({ events }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'incident_created':
        return <AlertCircle className="w-4 h-4 text-blue-400" />;
      case 'memory_retrieved':
        return <Database className="w-4 h-4 text-purple-400" />;
      case 'recommendation_generated':
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
      case 'incident_resolved':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'resolution_retained':
        return <ShieldCheck className="w-4 h-4 text-purple-300" />;
      case 'memory_seeded':
        return <Database className="w-4 h-4 text-amber-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'incident_created':
        return <span className="bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[9px] px-2 py-0.5 rounded font-mono font-bold">INCIDENT OPENED</span>;
      case 'memory_retrieved':
        return <span className="bg-purple-500/15 text-purple-400 border border-purple-500/30 text-[9px] px-2 py-0.5 rounded font-mono font-bold">MEMORY RECALLED</span>;
      case 'recommendation_generated':
        return <span className="bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 text-[9px] px-2 py-0.5 rounded font-mono font-bold">AI RECOMMENDATION</span>;
      case 'incident_resolved':
        return <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] px-2 py-0.5 rounded font-mono font-bold">RESOLVED</span>;
      case 'resolution_retained':
        return <span className="bg-purple-500/25 text-purple-300 border border-purple-500/40 text-[9px] px-2 py-0.5 rounded font-mono font-extrabold shadow-sm">RETAINED TO HINDSIGHT</span>;
      default:
        return <span className="bg-slate-500/15 text-slate-400 border border-slate-500/30 text-[9px] px-2 py-0.5 rounded font-mono font-bold">SYSTEM</span>;
    }
  };

  const formatTimestamp = (ts: string) => {
    try {
      const date = new Date(ts);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return ts;
    }
  };

  const filteredEvents = events.filter((e) => {
    if (filterType === 'retained') return e.event_type === 'resolution_retained' || e.event_type === 'memory_seeded';
    if (filterType === 'recalled') return e.event_type === 'memory_retrieved';
    if (filterType === 'resolved') return e.event_type === 'incident_resolved';
    return true;
  });

  return (
    <div className="glass-panel rounded-xl p-5 shadow-2xl space-y-4 border border-white/[0.08] mt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.07]">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-extrabold text-white tracking-wide uppercase">
            Hindsight Memory & Incident Event Stream
          </h3>
          <span className="text-[10px] font-mono bg-[#111726] border border-white/[0.06] px-2 py-0.5 rounded text-slate-400">
            {events.length} Events Logged
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 text-[10px] font-medium bg-[#080C14] p-0.5 rounded-lg border border-white/[0.06]">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2 py-1 rounded transition-colors ${filterType === 'all' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('recalled')}
            className={`px-2 py-1 rounded transition-colors ${filterType === 'recalled' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Recalls
          </button>
          <button
            onClick={() => setFilterType('retained')}
            className={`px-2 py-1 rounded transition-colors ${filterType === 'retained' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Retained
          </button>
          <button
            onClick={() => setFilterType('resolved')}
            className={`px-2 py-1 rounded transition-colors ${filterType === 'resolved' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Resolved
          </button>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500">
          No events match the selected timeline filter.
        </div>
      ) : (
        <div className="relative pl-6 space-y-3.5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/[0.07]">
          {filteredEvents.slice(0, 10).map((event, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div key={idx} className="relative flex items-start gap-3 text-xs group">
                {/* Event Dot */}
                <div className="absolute -left-6 mt-1 w-5 h-5 rounded-full bg-[#0C121F] border border-white/[0.1] flex items-center justify-center shadow-md">
                  {getEventIcon(event.event_type)}
                </div>

                {/* Event Card */}
                <div className="flex-1 bg-[#101625]/80 border border-white/[0.06] rounded-xl p-3 hover:border-white/[0.14] transition-all shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getEventBadge(event.event_type)}
                      <span className="font-mono font-bold text-white text-[11px]">
                        {event.incident_id}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-500 font-mono">
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </div>

                  <p className="text-slate-200 text-xs mt-1.5 leading-relaxed font-medium">
                    {event.description}
                  </p>

                  {/* Expandable JSON details */}
                  {event.details && Object.keys(event.details).length > 0 && (
                    <div className="mt-2">
                      <button
                        onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                        className="text-[10px] font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        <span>{isExpanded ? 'Hide payload' : 'Inspect event details'}</span>
                      </button>

                      {isExpanded && (
                        <div className="mt-2 p-2.5 rounded-lg bg-[#070A11] border border-white/[0.05] text-[10px] font-mono text-emerald-400 overflow-x-auto space-y-0.5">
                          {Object.entries(event.details).map(([k, v]) => (
                            <div key={k} className="leading-snug">
                              <span className="text-slate-500">{k}:</span>{' '}
                              <span className="text-slate-200">{typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
