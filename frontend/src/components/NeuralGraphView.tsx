import React, { useState, useEffect } from 'react';
import { MemoryGraphNode, MemoryGraphEdge, MemoryGraphResponse } from '../types';
import { fetchMemoryGraph } from '../services/api';

interface NeuralGraphViewProps {
  onSelectIncident?: (incidentId: string) => void;
}

export const NeuralGraphView: React.FC<NeuralGraphViewProps> = ({ onSelectIncident }) => {
  const [data, setData] = useState<MemoryGraphResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<string>('ALL');
  const [selectedNode, setSelectedNode] = useState<MemoryGraphNode | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hoveredNode, setHoveredNode] = useState<MemoryGraphNode | null>(null);

  useEffect(() => {
    loadGraph();
  }, []);

  const loadGraph = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchMemoryGraph();
      setData(res);
      // Auto-select INC-001 by default
      const defaultNode = res.nodes.find(n => n.id === 'INC-001') || res.nodes[0];
      setSelectedNode(defaultNode || null);
    } catch (err: any) {
      setError(err.message || 'Failed to load neural memory graph');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (sev?: string) => {
    switch (sev) {
      case 'CRITICAL': return '#ef4444';
      case 'HIGH': return '#f97316';
      case 'MEDIUM': return '#eab308';
      case 'LOW': return '#3b82f6';
      default: return '#8b5cf6';
    }
  };

  const getClusterColor = (cluster: string) => {
    switch (cluster) {
      case 'Resource Pool': return '#6366f1';
      case 'In-Memory Cache': return '#10b981';
      case 'Streaming / Queue': return '#ec4899';
      case 'Distributed Mesh': return '#06b6d4';
      default: return '#a855f7';
    }
  };

  const filteredNodes = data?.nodes.filter(node => {
    const matchesCluster = selectedCluster === 'ALL' || node.cluster === selectedCluster || node.type === 'cluster';
    const matchesSearch = searchQuery.trim() === '' ||
      node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (node.root_cause && node.root_cause.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCluster && matchesSearch;
  }) || [];

  const visibleNodeIds = new Set(filteredNodes.map(n => n.id));

  const filteredEdges = data?.edges.filter(edge => {
    return visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target);
  }) || [];

  const nodeMap = new Map(data?.nodes.map(n => [n.id, n]));

  // Connected nodes to selectedNode
  const connectedEdgeList = data?.edges.filter(e =>
    selectedNode && (e.source === selectedNode.id || e.target === selectedNode.id)
  ) || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Header Card */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(20, 24, 45, 0.85) 0%, rgba(13, 16, 32, 0.95) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        borderRadius: '16px',
        padding: '1.25rem 1.75rem',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.25))',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem'
          }}>
            🧠
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                Hindsight Neural Memory Constellation
              </h2>
              <span style={{
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#818cf8',
                fontSize: '0.75rem',
                padding: '0.2rem 0.6rem',
                borderRadius: '20px',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                fontWeight: 600
              }}>
                2D Semantic Mesh
              </span>
            </div>
            <p style={{ margin: '0.25rem 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
              Visualizes cross-incident architectural failure patterns, cosine similarity weights, and causal cluster hubs.
            </p>
          </div>
        </div>

        {/* Quick Stats Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Indexed Memories
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#60a5fa' }}>
              {data?.total_memories_indexed ?? 10} Incidents
            </div>
          </div>
          <div style={{ height: '32px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Semantic Edges
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#34d399' }}>
              {data?.edges.length ?? 14} Correlations
            </div>
          </div>
        </div>
      </div>

      {/* Cluster Filters & Search Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        background: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '0.75rem 1rem'
      }}>
        {/* Cluster Filter Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginRight: '0.25rem' }}>Clusters:</span>
          {['ALL', 'Resource Pool', 'In-Memory Cache', 'Streaming / Queue', 'Distributed Mesh'].map(cluster => {
            const isActive = selectedCluster === cluster;
            return (
              <button
                key={cluster}
                onClick={() => setSelectedCluster(cluster)}
                style={{
                  background: isActive ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'rgba(30, 41, 59, 0.6)',
                  border: isActive ? '1px solid #818cf8' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: isActive ? '#ffffff' : '#cbd5e1',
                  borderRadius: '20px',
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 0 12px rgba(99, 102, 241, 0.4)' : 'none'
                }}
              >
                {cluster === 'ALL' ? '🌐 All Clusters' : cluster}
              </button>
            );
          })}
        </div>

        {/* Search Filter */}
        <div style={{ position: 'relative', minWidth: '240px' }}>
          <input
            type="text"
            placeholder="Search nodes, root causes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '0.45rem 0.85rem',
              color: '#f8fafc',
              fontSize: '0.82rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Main Canvas + Detail Drawer Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: selectedNode ? '1fr 340px' : '1fr',
        gap: '1.25rem',
        alignItems: 'start'
      }}>
        {/* Constellation SVG Canvas */}
        <div style={{
          background: 'radial-gradient(ellipse at 50% 50%, #0d132e 0%, #060914 100%)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: '16px',
          padding: '1rem',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '580px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
        }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '540px', gap: '1rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid rgba(99, 102, 241, 0.2)',
                borderTopColor: '#6366f1',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Mapping neural memory vectors...</div>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#ef4444' }}>
              <div>⚠️ {error}</div>
              <button
                onClick={loadGraph}
                style={{
                  marginTop: '1rem',
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid #ef4444',
                  color: '#fff',
                  borderRadius: '6px',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer'
                }}
              >
                Retry
              </button>
            </div>
          ) : (
            <svg
              viewBox="0 0 850 620"
              style={{ width: '100%', height: '580px', userSelect: 'none' }}
            >
              <defs>
                {/* Cluster Halos */}
                <radialGradient id="halo-pool" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="halo-cache" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="halo-stream" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ec4899" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="halo-cascade" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                </radialGradient>

                {/* Animated Edge Marker */}
                <marker id="dot" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4">
                  <circle cx="5" cy="5" r="3" fill="#818cf8" opacity="0.6" />
                </marker>
              </defs>

              {/* Background Stars / Grid Pattern */}
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="0.8" fill="rgba(255, 255, 255, 0.08)" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Cluster Background Halos */}
              <circle cx="220" cy="180" r="160" fill="url(#halo-pool)" />
              <circle cx="580" cy="170" r="150" fill="url(#halo-cache)" />
              <circle cx="240" cy="480" r="150" fill="url(#halo-stream)" />
              <circle cx="590" cy="470" r="150" fill="url(#halo-cascade)" />

              {/* Edge Lines */}
              {filteredEdges.map((edge, idx) => {
                const srcNode = nodeMap.get(edge.source);
                const tgtNode = nodeMap.get(edge.target);
                if (!srcNode || !tgtNode) return null;

                const isConnectedToSelected = selectedNode && (edge.source === selectedNode.id || edge.target === selectedNode.id);
                const strokeColor = isConnectedToSelected ? '#38bdf8' : 'rgba(148, 163, 184, 0.25)';
                const strokeWidth = isConnectedToSelected ? 2.5 : Math.max(1, edge.weight * 2.2);

                return (
                  <g key={`edge-${idx}`}>
                    <line
                      x1={srcNode.x}
                      y1={srcNode.y}
                      x2={tgtNode.x}
                      y2={tgtNode.y}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeDasharray={edge.weight > 0.85 ? '5,4' : undefined}
                      strokeLinecap="round"
                    >
                      {edge.weight > 0.85 && (
                        <animate
                          attributeName="stroke-dashoffset"
                          values="18;0"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      )}
                    </line>
                    {/* Edge weight badge on midpoint for selected */}
                    {isConnectedToSelected && (
                      <g transform={`translate(${(srcNode.x + tgtNode.x) / 2}, ${(srcNode.y + tgtNode.y) / 2})`}>
                        <rect x="-18" y="-9" width="36" height="18" rx="4" fill="rgba(15, 23, 42, 0.9)" stroke="#38bdf8" strokeWidth="0.8" />
                        <text x="0" y="3" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="700">
                          {Math.round(edge.weight * 100)}%
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Graph Nodes */}
              {filteredNodes.map(node => {
                const isSelected = selectedNode?.id === node.id;
                const isHovered = hoveredNode?.id === node.id;
                const isCluster = node.type === 'cluster';

                if (isCluster) {
                  const hubColor = getClusterColor(node.cluster);
                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      onClick={() => setSelectedNode(node)}
                      onMouseEnter={() => setHoveredNode(node)}
                      onMouseLeave={() => setHoveredNode(null)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Cluster Outer Glow */}
                      <circle
                        r="34"
                        fill="none"
                        stroke={hubColor}
                        strokeWidth="1.5"
                        strokeDasharray="6,4"
                        opacity={isSelected ? 1 : 0.6}
                      >
                        <animateTransform
                          attributeName="transform"
                          type="rotate"
                          from="0"
                          to="360"
                          dur="30s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      <circle
                        r="24"
                        fill={hubColor}
                        opacity={isSelected ? 0.35 : 0.2}
                      />
                      <circle
                        r="14"
                        fill={hubColor}
                        stroke="#ffffff"
                        strokeWidth={isSelected ? 2 : 1}
                      />
                      <text
                        x="0"
                        y="42"
                        textAnchor="middle"
                        fill="#f8fafc"
                        fontSize="11"
                        fontWeight="700"
                        letterSpacing="0.02em"
                      >
                        {node.label}
                      </text>
                      <text
                        x="0"
                        y="55"
                        textAnchor="middle"
                        fill={hubColor}
                        fontSize="9"
                        fontWeight="600"
                      >
                        CLUSTER HUB
                      </text>
                    </g>
                  );
                }

                // Incident Node
                const sevColor = getSeverityColor(node.severity);
                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => setSelectedNode(node)}
                    onMouseEnter={() => setHoveredNode(node)}
                    onMouseLeave={() => setHoveredNode(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Selected Halo Pulse */}
                    {isSelected && (
                      <circle r="22" fill="none" stroke="#38bdf8" strokeWidth="2" opacity="0.8">
                        <animate attributeName="r" values="18;26;18" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.9;0.2;0.9" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}

                    {/* Node Core */}
                    <circle
                      r={isSelected ? 14 : isHovered ? 12 : 9}
                      fill={sevColor}
                      stroke={isSelected ? '#ffffff' : 'rgba(255,255,255,0.7)'}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      style={{ transition: 'all 0.2s ease' }}
                    />

                    {/* Node Label */}
                    <text
                      x="0"
                      y="-16"
                      textAnchor="middle"
                      fill={isSelected ? '#38bdf8' : '#e2e8f0'}
                      fontSize={isSelected ? '11' : '10'}
                      fontWeight={isSelected ? '700' : '500'}
                    >
                      {node.id}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}

          {/* Bottom Legend Overlay */}
          <div style={{
            position: 'absolute',
            bottom: '1rem',
            left: '1rem',
            right: '1rem',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            padding: '0.6rem 1rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            fontSize: '0.78rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#94a3b8' }}>
              <span style={{ fontWeight: 600, color: '#f8fafc' }}>Legend:</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} /> CRITICAL
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f97316' }} /> HIGH
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#eab308' }} /> MEDIUM
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', border: '2px dashed #818cf8' }} /> Cluster Hub
              </span>
            </div>
            <div style={{ color: '#38bdf8', fontWeight: 600 }}>
              💡 Click any node to inspect postmortem memory &amp; blast radius
            </div>
          </div>
        </div>

        {/* Selected Node Inspector Drawer */}
        {selectedNode && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(20, 24, 45, 0.95) 0%, rgba(15, 20, 38, 0.98) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '16px',
            padding: '1.25rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{
                  background: selectedNode.type === 'cluster' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: selectedNode.type === 'cluster' ? '#a5b4fc' : getSeverityColor(selectedNode.severity),
                  border: `1px solid ${selectedNode.type === 'cluster' ? 'rgba(99, 102, 241, 0.4)' : getSeverityColor(selectedNode.severity)}`,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 700
                }}>
                  {selectedNode.type === 'cluster' ? 'CLUSTER HUB' : selectedNode.severity || 'INCIDENT'}
                </span>
                <h3 style={{ margin: '0.5rem 0 0.15rem 0', color: '#f8fafc', fontSize: '1.1rem', fontWeight: 700 }}>
                  {selectedNode.label}
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Service: <strong style={{ color: '#cbd5e1' }}>{selectedNode.service}</strong>
                </div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  padding: '0.2rem'
                }}
              >
                ✕
              </button>
            </div>

            {/* Relevance / Cosine Match Metric */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.5)',
              borderRadius: '8px',
              padding: '0.75rem',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.78rem' }}>
                <span style={{ color: '#94a3b8' }}>Hindsight Semantic Vector Match:</span>
                <span style={{ color: '#34d399', fontWeight: 700 }}>{Math.round(selectedNode.relevance * 100)}%</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.round(selectedNode.relevance * 100)}%`,
                  background: 'linear-gradient(90deg, #6366f1, #10b981)',
                  borderRadius: '3px'
                }} />
              </div>
            </div>

            {/* Root Cause / Insight */}
            {selectedNode.root_cause && (
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Root Cause Precedent
                </div>
                <div style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  fontSize: '0.82rem',
                  color: '#fca5a5',
                  lineHeight: '1.4'
                }}>
                  {selectedNode.root_cause}
                </div>
              </div>
            )}

            {/* Connected Correlated Nodes */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Correlated Nodes ({connectedEdgeList.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '160px', overflowY: 'auto' }}>
                {connectedEdgeList.map((edge, idx) => {
                  const otherId = edge.source === selectedNode.id ? edge.target : edge.source;
                  const otherNode = nodeMap.get(otherId);
                  if (!otherNode) return null;

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedNode(otherNode)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'rgba(30, 41, 59, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '6px',
                        padding: '0.45rem 0.65rem',
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: otherNode.type === 'cluster' ? '#818cf8' : getSeverityColor(otherNode.severity)
                        }} />
                        <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{otherNode.id}</span>
                        <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>({edge.relation.replace(/_/g, ' ')})</span>
                      </div>
                      <span style={{ color: '#38bdf8', fontWeight: 700, fontSize: '0.72rem' }}>
                        {Math.round(edge.weight * 100)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            {selectedNode.type === 'incident' && (
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    if (onSelectIncident) {
                      onSelectIncident(selectedNode.id);
                    }
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                    border: 'none',
                    color: '#ffffff',
                    borderRadius: '8px',
                    padding: '0.65rem 1rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <span>🚨</span> Open in Incident War Room
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
