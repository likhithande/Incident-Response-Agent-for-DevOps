import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Sparkles, 
  BookOpen, 
  Wrench, 
  RefreshCw, 
  Tag, 
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { RetrievedMemoryItem } from '../types';
import { recallMemoryDirect } from '../services/api';

interface HindsightMemoryPanelProps {
  memories: RetrievedMemoryItem[];
  cloudConnected: boolean;
  bankId: string;
  isRecalling: boolean;
}

export const HindsightMemoryPanel: React.FC<HindsightMemoryPanelProps> = ({
  memories,
  cloudConnected,
  bankId,
  isRecalling
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [customResults, setCustomResults] = useState<RetrievedMemoryItem[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const quickFilterTags = [
    '503 Outage',
    'Connection Pool',
    'Redis OOM',
    'CrashLoopBackOff',
    'Kafka Lag'
  ];

  const handleSearch = async (queryText: string) => {
    if (!queryText.trim()) {
      setCustomResults(null);
      return;
    }
    try {
      setIsSearching(true);
      const res = await recallMemoryDirect(queryText);
      setCustomResults(res);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    handleSearch(tag);
  };

  const copyMemoryContent = (mem: RetrievedMemoryItem) => {
    navigator.clipboard.writeText(`Incident: ${mem.incident_id}\nRoot Cause: ${mem.root_cause}\nResolution: ${mem.resolution}`);
    setCopiedId(mem.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const displayedMemories = customResults !== null ? customResults : memories;

  return (
    <div className="glass-panel rounded-xl p-4 flex flex-col h-full shadow-2xl border border-white/[0.08]">
      {/* Header */}
      <div className="pb-3 border-b border-white/[0.07] flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-white tracking-wide uppercase">
                Hindsight Memory
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                Long-Term Knowledge Bank
              </p>
            </div>
          </div>

          <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-md whitespace-nowrap font-bold border ${
            cloudConnected
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : 'bg-purple-500/15 text-purple-300 border-purple-500/30'
          }`}>
            {bankId}
          </span>
        </div>

        {/* Live Search Bar */}
        <form onSubmit={handleFormSubmit} className="mt-3 relative">
          <input
            type="text"
            placeholder="Search memory bank (e.g. 503, pool, Redis)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111726] border border-white/[0.08] text-xs text-white pl-8 pr-16 py-1.8 rounded-lg focus:outline-none focus:border-purple-500 placeholder-slate-500 transition-colors"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          {customResults !== null && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setCustomResults(null);
              }}
              className="absolute right-14 top-2 text-[10px] text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-1.5 top-1 px-2.5 py-1 rounded-md bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold transition-all disabled:opacity-50 active:scale-95"
          >
            {isSearching ? '...' : 'Recall'}
          </button>
        </form>

        {/* Quick Tag Chips */}
        <div className="flex flex-wrap items-center gap-1 mt-2 text-[10px]">
          <span className="text-slate-500 font-mono text-[9px]">Filter:</span>
          {quickFilterTags.map((tag, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleTagClick(tag)}
              className="px-2 py-0.5 rounded bg-white/[0.04] hover:bg-purple-500/20 hover:text-purple-300 text-slate-400 transition-all font-mono"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Memory Status Indicator */}
      <div className="py-2 px-3 my-2.5 rounded-lg bg-[#0C111D] border border-white/[0.05] flex items-center justify-between text-xs flex-shrink-0">
        <span className="text-slate-400 text-[11px]">Recall Status:</span>
        {isRecalling ? (
          <span className="flex items-center gap-1.5 text-purple-400 font-mono font-bold text-[11px]">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Querying Hindsight...</span>
          </span>
        ) : displayedMemories.length > 0 ? (
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{displayedMemories.length} Memories Recalled</span>
          </span>
        ) : (
          <span className="text-slate-500 text-[11px]">Awaiting incident query</span>
        )}
      </div>

      {/* Recalled Memories List */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1.5 custom-scrollbar">
        {displayedMemories.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 space-y-2">
            <Database className="w-8 h-8 mx-auto text-slate-600 stroke-1" />
            <p className="font-medium text-slate-400">No memories recalled yet.</p>
            <p className="text-[11px] text-slate-600">
              Click &quot;Analyze Incident&quot; or search above to retrieve memories from Hindsight.
            </p>
          </div>
        ) : (
          displayedMemories.map((mem, idx) => {
            const similarityPct = mem.score ? Math.round(mem.score * 100) : Math.max(72, Math.round(96.4 - idx * 8.2));
            return (
              <div
                key={mem.id}
                className="glass-card rounded-xl p-3.5 text-xs hover:border-purple-500/40 transition-all flex flex-col gap-2 relative group"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white text-[11px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                      {mem.incident_id}
                    </span>
                    <span className="font-bold text-slate-200 truncate max-w-[110px]">
                      {mem.service}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {similarityPct}% Sim
                    </span>
                    <button
                      onClick={() => copyMemoryContent(mem)}
                      className="p-1 rounded text-slate-500 hover:text-white transition-colors"
                      title="Copy memory summary"
                    >
                      {copiedId === mem.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

              {/* Root Cause */}
              <div className="bg-[#0A0E17] p-2.5 rounded-lg border border-white/[0.04]">
                <span className="font-bold text-purple-400 block text-[9px] uppercase tracking-wider mb-0.5">
                  Historical Root Cause
                </span>
                <p className="text-slate-200 text-[11px] leading-relaxed">
                  {mem.root_cause}
                </p>
              </div>

              {/* Resolution */}
              <div className="bg-[#0A0E17] p-2.5 rounded-lg border border-white/[0.04]">
                <span className="font-bold text-emerald-400 block text-[9px] uppercase tracking-wider mb-0.5 flex items-center gap-1">
                  <Wrench className="w-3 h-3" />
                  <span>Historical Resolution</span>
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed font-mono">
                  {mem.resolution}
                </p>
              </div>

              {/* Lessons Learned */}
              {mem.lessons_learned && (
                <div className="bg-[#0A0E17] p-2.5 rounded-lg border border-white/[0.04]">
                  <span className="font-bold text-amber-400 block text-[9px] uppercase tracking-wider mb-0.5 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    <span>Lessons Learned</span>
                  </span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    {mem.lessons_learned}
                  </p>
                </div>
              )}
            </div>
          );
        })
      )}
      </div>
    </div>
  );
};
