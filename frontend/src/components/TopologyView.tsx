import React, { useState, useEffect } from 'react';
import { 
  Network, 
  Server, 
  Database, 
  Activity, 
  Radio, 
  ArrowRight, 
  ExternalLink,
  Flame,
  RefreshCw,
  Layers
} from 'lucide-react';
import { TopologyResponse, TopologyNode } from '../types';
import { fetchTopology } from '../services/api';
import { playClickFeedback } from '../services/audio';

interface TopologyViewProps {
  activeService?: string;
  onSelectService?: (serviceName: string) => void;
}

export const TopologyView: React.FC<TopologyViewProps> = ({ 
  activeService = 'Payment API',
  onSelectService
}) => {
  const [topology, setTopology] = useState<TopologyResponse | null>(null);
  const [selectedNode, setSelectedNode] = useState<TopologyNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadTopology = async (serviceName: string) => {
    try {
      setIsLoading(true);
      const data = await fetchTopology(serviceName);
      setTopology(data);
      if (data.nodes.length > 0 && !selectedNode) {
        const primary = data.nodes.find(n => n.status === 'critical') || data.nodes[3];
        setSelectedNode(primary);
      }
    } catch (err) {
      console.error('Topology load failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTopology(activeService);
  }, [activeService]);

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'gateway':
        return <Network className="w-4 h-4" />;
      case 'database':
        return <Database className="w-4 h-4" />;
      case 'broker':
        return <Radio className="w-4 h-4" />;
      case 'external':
        return <ExternalLink className="w-4 h-4" />;
      default:
        return <Server className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Banner with Blast Radius Score */}
      <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-sm bg-rose-500 animate-ping" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400">
                Live Blast Radius & Cascading Impact
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Network className="w-5 h-5 text-purple-400" />
              Microservice Topology Map
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Live dependency graph tracking cascading degraded dependencies, saturation thresholds, and blast radius across the production mesh.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {topology && (
              <div className="glass-card px-4 py-3 rounded-xl border border-rose-500/30 bg-rose-950/20 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Blast Radius Score
                </span>
                <span className="text-xl font-black font-mono text-rose-400">
                  {topology.blast_radius_score}%
                </span>
              </div>
            )}
            <button
              onClick={() => { playClickFeedback(); loadTopology(activeService); }}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all"
              title="Refresh Topology"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-purple-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Impacted Services Bar */}
        {topology && (
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              Impacted Components ({topology.impacted_services.length}):
            </span>
            {topology.impacted_services.map((svc, i) => (
              <span 
                key={i}
                className="px-2.5 py-0.5 rounded-md whitespace-nowrap text-[11px] font-mono font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30"
              >
                {svc}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Main Grid: Architecture Graph + Node Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Architecture Node Grid */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/[0.06]">
            <span className="font-semibold uppercase tracking-wider">Architecture Mesh Layers</span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-emerald-400" /> Healthy</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-amber-400" /> Degraded</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-rose-500 animate-pulse" /> Critical</span>
            </div>
          </div>

          {/* Microservices Nodes Flow */}
          <div className="space-y-4">
            {/* Layer 1: Edge & Ingress */}
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Tier 1 · Client & API Ingress
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {topology?.nodes.filter(n => n.type === 'gateway').map((node) => (
                  <NodeCard 
                    key={node.id} 
                    node={node} 
                    icon={getNodeIcon(node.type)}
                    isSelected={selectedNode?.id === node.id}
                    onClick={() => { playClickFeedback(); setSelectedNode(node); }}
                  />
                ))}
              </div>
            </div>

            {/* Layer 2: Core Microservices */}
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Tier 2 · Backend Microservices
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {topology?.nodes.filter(n => n.type === 'service').map((node) => (
                  <NodeCard 
                    key={node.id} 
                    node={node} 
                    icon={getNodeIcon(node.type)}
                    isSelected={selectedNode?.id === node.id}
                    onClick={() => { 
                      playClickFeedback(); 
                      setSelectedNode(node);
                      if (onSelectService && node.status !== 'healthy') {
                        onSelectService(node.name);
                      }
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Layer 3: Persistence, Cache & Async Brokers */}
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Tier 3 · Data Stores, Cache & Brokers
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {topology?.nodes.filter(n => ['database', 'broker', 'external'].includes(n.type)).map((node) => (
                  <NodeCard 
                    key={node.id} 
                    node={node} 
                    icon={getNodeIcon(node.type)}
                    isSelected={selectedNode?.id === node.id}
                    onClick={() => { playClickFeedback(); setSelectedNode(node); }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Inspector: Selected Node Telemetry & Upstream/Downstream */}
        <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
            <Activity className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Component Telemetry Inspector</h3>
          </div>

          {selectedNode ? (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Node Overview Card */}
              <div className="glass-card p-4 rounded-xl border border-white/[0.08] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
                    {selectedNode.type}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-md whitespace-nowrap text-[10px] font-mono font-bold flex items-center gap-1 ${
                    selectedNode.status === 'critical'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : selectedNode.status === 'degraded'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {selectedNode.status.toUpperCase()}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white">{selectedNode.name}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {selectedNode.description}
                </p>
              </div>

              {/* Telemetry Metrics */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="glass-card p-3 rounded-xl border border-white/[0.06]">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">P99 Latency</span>
                  <span className={`text-base font-bold font-mono ${
                    selectedNode.latency_ms > 1000 ? 'text-rose-400' : (selectedNode.latency_ms > 200 ? 'text-amber-400' : 'text-emerald-400')
                  }`}>
                    {selectedNode.latency_ms} ms
                  </span>
                </div>

                <div className="glass-card p-3 rounded-xl border border-white/[0.06]">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Error Rate</span>
                  <span className={`text-base font-bold font-mono ${
                    selectedNode.error_rate > 5 ? 'text-rose-400' : (selectedNode.error_rate > 0.5 ? 'text-amber-400' : 'text-emerald-400')
                  }`}>
                    {selectedNode.error_rate}%
                  </span>
                </div>
              </div>

              {/* Upstream & Downstream Flow */}
              <div className="glass-card p-3.5 rounded-xl border border-white/[0.06] space-y-2">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  Dependency Connections
                </span>
                
                <div className="space-y-1.5 text-xs text-slate-400">
                  {topology?.edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).map((edge, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <span className="text-slate-300">{edge.source}</span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                        <span className="text-slate-300">{edge.target}</span>
                      </div>
                      <span className="text-[10px] font-mono text-purple-300 bg-purple-950/40 px-1.5 py-0.5 rounded">
                        {edge.protocol}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-slate-500">
              Click any node in the topology mesh to inspect real-time telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface NodeCardProps {
  node: TopologyNode;
  icon: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
}

const NodeCard: React.FC<NodeCardProps> = ({ node, icon, isSelected, onClick }) => {
  const isCritical = node.status === 'critical';
  const isDegraded = node.status === 'degraded';

  return (
    <div
      onClick={onClick}
      className={`p-3.5 rounded-xl cursor-pointer transition-all border relative overflow-hidden ${
        isSelected
          ? 'bg-purple-950/40 border-purple-500/70 shadow-lg shadow-purple-500/10'
          : isCritical
          ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-400'
          : isDegraded
          ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-400'
          : 'glass-card border-white/[0.07] hover:border-white/20'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
            isCritical
              ? 'bg-rose-500/20 text-rose-400'
              : isDegraded
              ? 'bg-amber-500/20 text-amber-400'
              : 'bg-white/5 text-slate-300'
          }`}>
            {icon}
          </div>
          <div>
            <h5 className="text-xs font-bold text-white truncate max-w-[130px]">{node.name}</h5>
            <span className="text-[10px] font-mono text-slate-400 uppercase block">{node.type}</span>
          </div>
        </div>

        <span className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 ${
          isCritical
            ? 'bg-rose-500 animate-ping'
            : isDegraded
            ? 'bg-amber-400'
            : 'bg-emerald-400'
        }`} />
      </div>

      <div className="mt-3 pt-2 border-t border-white/[0.05] flex items-center justify-between text-[11px] font-mono">
        <span className="text-slate-400">{node.latency_ms}ms</span>
        <span className={node.error_rate > 0 ? (isCritical ? 'text-rose-400' : 'text-amber-400') : 'text-emerald-400'}>
          {node.error_rate}% err
        </span>
      </div>
    </div>
  );
};
