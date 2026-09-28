import React, { useState } from 'react';
import { Plus, Search, AlertCircle, CheckCircle, Flame, Server, Filter, X } from 'lucide-react';
import { Incident } from '../types';

interface SidebarProps {
  incidents: Incident[];
  selectedIncidentId: string;
  onSelectIncident: (incident: Incident) => void;
  onOpenNewModal: () => void;
}

type FilterType = 'all' | 'active' | 'critical' | 'resolved';

export const Sidebar: React.FC<SidebarProps> = ({
  incidents,
  selectedIncidentId,
  onSelectIncident,
  onOpenNewModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');

  const filteredIncidents = incidents.filter((inc) => {
    // Text search
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      inc.incident_id.toLowerCase().includes(term) ||
      inc.service.toLowerCase().includes(term) ||
      inc.symptoms.some((s) => s.toLowerCase().includes(term)) ||
      (inc.root_cause && inc.root_cause.toLowerCase().includes(term));

    if (!matchesSearch) return false;

    // Filter tabs
    if (filterType === 'active') return inc.status !== 'RESOLVED';
    if (filterType === 'resolved') return inc.status === 'RESOLVED';
    if (filterType === 'critical') return inc.severity.toUpperCase() === 'CRITICAL';
    return true;
  });

  const activeCount = incidents.filter(i => i.status !== 'RESOLVED').length;
  const criticalCount = incidents.filter(i => i.severity.toUpperCase() === 'CRITICAL').length;

  const getSeverityBadge = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return (
          <span className="bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-sm bg-rose-500 animate-pulse" />
            CRIT
          </span>
        );
      case 'HIGH':
        return (
          <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
            MED
          </span>
        );
      default:
        return (
          <span className="bg-slate-500/15 text-slate-400 border border-slate-500/30 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
            LOW
          </span>
        );
    }
  };

  return (
    <aside className="w-full lg:w-80 flex-shrink-0 bg-[#0A0E17]/95 border-r border-white/[0.07] flex flex-col h-full min-h-0 overflow-hidden">
      {/* Sidebar Header & Action */}
      <div className="p-3.5 border-b border-white/[0.07] flex flex-col gap-2.5 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-white tracking-wide uppercase">Incidents</span>
            <span className="text-[11px] font-mono bg-[#141C2E] border border-white/[0.08] px-1.5 py-0.2 rounded text-slate-300">
              {filteredIncidents.length}
            </span>
          </div>

          <button
            onClick={onOpenNewModal}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-2.5 py-1.2 rounded-lg transition-all shadow-sm shadow-blue-600/30 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Incident</span>
          </button>
        </div>

        {/* Search input with clear */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search service, ID, symptom..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#121826] border border-white/[0.08] text-xs text-white pl-8 pr-7 py-1.5 rounded-lg focus:outline-none focus:border-blue-500 placeholder-slate-500 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Quick Tabs */}
        <div className="grid grid-cols-4 gap-1 p-0.5 bg-[#070A11] rounded-lg border border-white/[0.05] text-[10px] font-medium">
          <button
            onClick={() => setFilterType('all')}
            className={`py-1 rounded text-center transition-all ${
              filterType === 'all'
                ? 'bg-blue-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('active')}
            className={`py-1 rounded text-center transition-all flex items-center justify-center gap-1 ${
              filterType === 'active'
                ? 'bg-amber-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Active</span>
            {activeCount > 0 && <span className="text-[9px] bg-black/40 px-1 rounded">{activeCount}</span>}
          </button>
          <button
            onClick={() => setFilterType('critical')}
            className={`py-1 rounded text-center transition-all flex items-center justify-center gap-1 ${
              filterType === 'critical'
                ? 'bg-rose-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Crit</span>
            {criticalCount > 0 && <span className="text-[9px] bg-black/40 px-1 rounded">{criticalCount}</span>}
          </button>
          <button
            onClick={() => setFilterType('resolved')}
            className={`py-1 rounded text-center transition-all ${
              filterType === 'resolved'
                ? 'bg-emerald-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Resolved
          </button>
        </div>
      </div>

      {/* Incidents Scroll List */}
      <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-white/[0.04] custom-scrollbar">
        {filteredIncidents.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No incidents match your filter.
          </div>
        ) : (
          filteredIncidents.map((incident) => {
            const isSelected = incident.incident_id === selectedIncidentId;
            return (
              <button
                key={incident.incident_id}
                onClick={() => onSelectIncident(incident)}
                className={`w-full text-left p-3 transition-all flex flex-col gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600/15 border-l-4 border-l-blue-500 pl-2.5 shadow-sm'
                    : 'hover:bg-white/[0.02] border-l-4 border-l-transparent'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-white tracking-tight">
                      {incident.incident_id}
                    </span>
                    {getSeverityBadge(incident.severity)}
                  </div>

                  {incident.status === 'RESOLVED' ? (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                      <CheckCircle className="w-3 h-3" />
                      Resolved
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] text-amber-400 font-medium">
                      <AlertCircle className="w-3 h-3" />
                      Active
                    </span>
                  )}
                </div>

                <div className="text-xs font-semibold text-slate-200 truncate">
                  {incident.service}
                </div>

                <div className="text-[11px] text-slate-400 line-clamp-1 font-mono">
                  {incident.symptoms && incident.symptoms.length > 0
                    ? incident.symptoms[0]
                    : incident.root_cause || 'No symptoms specified'}
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
};
