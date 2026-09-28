import React, { useState, useEffect } from 'react';
import { CanaryRolloutState } from '../types';
import { fetchCanaryState, advanceCanary } from '../services/api';

interface CanaryPilotViewProps {
  incidentId?: string;
  onResolved?: () => void;
}

export const CanaryPilotView: React.FC<CanaryPilotViewProps> = ({ incidentId = 'INC-001', onResolved }) => {
  const [state, setState] = useState<CanaryRolloutState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCanaryState();
  }, [incidentId]);

  const loadCanaryState = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchCanaryState(incidentId);
      setState(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch canary pilot state');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'start' | 'advance' | 'rollback') => {
    try {
      setActionLoading(true);
      const res = await advanceCanary(action, incidentId);
      setState(res);
      if (res.overall_status === 'FLEET_PROMOTED' && onResolved) {
        onResolved();
      }
    } catch (err: any) {
      alert(`Action error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'FLEET_PROMOTED':
        return { bg: 'rgba(16, 185, 129, 0.2)', border: '#10b981', color: '#34d399', text: '✅ FLEET PROMOTED (100%)' };
      case 'CANARY_RUNNING':
        return { bg: 'rgba(56, 189, 248, 0.2)', border: '#38bdf8', color: '#38bdf8', text: '⚡ CANARY ACTIVE' };
      case 'ROLLED_BACK':
        return { bg: 'rgba(239, 68, 68, 0.2)', border: '#ef4444', color: '#f87171', text: '🛑 EMERGENCY ROLLED BACK' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.2)', border: '#94a3b8', color: '#cbd5e1', text: '⏳ STANDBY / READY' };
    }
  };

  const badge = getStatusBadge(state?.overall_status);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Pilot Header Card */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(20, 24, 45, 0.85) 0%, rgba(13, 16, 32, 0.95) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
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
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(99, 102, 241, 0.25))',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem'
          }}>
            🚀
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                Autonomous SRE Pilot &amp; Multi-Stage Canary
              </h2>
              <span style={{
                background: badge.bg,
                color: badge.color,
                fontSize: '0.75rem',
                padding: '0.2rem 0.65rem',
                borderRadius: '20px',
                border: `1px solid ${badge.border}`,
                fontWeight: 700,
                letterSpacing: '0.04em'
              }}>
                {badge.text}
              </span>
            </div>
            <p style={{ margin: '0.25rem 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
              Zero-downtime progressive traffic shift with automated SLO health guardrails and instant rollback safety.
            </p>
          </div>
        </div>

        {/* Live Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {state?.overall_status === 'STANDBY' && (
            <button
              onClick={() => handleAction('start')}
              disabled={actionLoading}
              style={{
                background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                border: 'none',
                color: '#ffffff',
                borderRadius: '8px',
                padding: '0.65rem 1.25rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span>▶</span> Launch Canary (10%)
            </button>
          )}

          {state?.overall_status === 'CANARY_RUNNING' && state.active_stage < 4 && (
            <button
              onClick={() => handleAction('advance')}
              disabled={actionLoading}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none',
                color: '#ffffff',
                borderRadius: '8px',
                padding: '0.65rem 1.25rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span>⏩</span> {state.active_stage === 2 ? 'Promote to 50% Fleet' : 'Promote 100% Full Fleet'}
            </button>
          )}

          {/* Rollback Guardrail Button */}
          {state?.overall_status === 'CANARY_RUNNING' && (
            <button
              onClick={() => handleAction('rollback')}
              disabled={actionLoading}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #ef4444',
                color: '#f87171',
                borderRadius: '8px',
                padding: '0.65rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span>🛑</span> Trigger Auto-Rollback
            </button>
          )}

          {state?.overall_status === 'ROLLED_BACK' && (
            <button
              onClick={() => handleAction('start')}
              disabled={actionLoading}
              style={{
                background: 'rgba(56, 189, 248, 0.2)',
                border: '1px solid #38bdf8',
                color: '#38bdf8',
                borderRadius: '8px',
                padding: '0.65rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🔄 Re-arm Canary
            </button>
          )}
        </div>
      </div>

      {/* Traffic Shift Progression Bar */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Fleet Traffic Shift Progression
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
              {state?.current_traffic_percent ?? 0}% Shifted to Resized Pool (Canary)
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Target Service: </span>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>{state?.service ?? 'Payment API'}</span>
          </div>
        </div>

        {/* Progress Track */}
        <div style={{
          position: 'relative',
          height: '14px',
          background: 'rgba(30, 41, 59, 0.8)',
          borderRadius: '7px',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div style={{
            height: '100%',
            width: `${state?.current_traffic_percent ?? 0}%`,
            background: state?.overall_status === 'ROLLED_BACK'
              ? '#ef4444'
              : 'linear-gradient(90deg, #38bdf8 0%, #6366f1 50%, #10b981 100%)',
            borderRadius: '7px',
            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
          }} />
        </div>

        {/* Traffic Markers */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
          <span>0% (Baseline 50-conn)</span>
          <span>10% (Canary 150-conn)</span>
          <span>50% (Fleet Half)</span>
          <span>100% (Full Production)</span>
        </div>
      </div>

      {/* 4 Multi-Stage Rollout Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem'
      }}>
        {state?.stages.map((stage) => {
          const isActive = stage.status === 'active';
          const isPassed = stage.status === 'passed';
          const isFailed = stage.status === 'failed';

          let cardBorder = 'rgba(255, 255, 255, 0.08)';
          let statusText = 'PENDING';
          let statusColor = '#64748b';

          if (isActive) {
            cardBorder = '#38bdf8';
            statusText = 'RUNNING';
            statusColor = '#38bdf8';
          } else if (isPassed) {
            cardBorder = '#10b981';
            statusText = 'VERIFIED';
            statusColor = '#34d399';
          } else if (isFailed) {
            cardBorder = '#ef4444';
            statusText = 'FAILED';
            statusColor = '#f87171';
          }

          return (
            <div
              key={stage.stage_number}
              style={{
                background: isActive
                  ? 'linear-gradient(135deg, rgba(14, 165, 233, 0.12), rgba(15, 23, 42, 0.85))'
                  : 'rgba(15, 23, 42, 0.6)',
                border: `1px solid ${cardBorder}`,
                borderRadius: '12px',
                padding: '1.1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                position: 'relative',
                boxShadow: isActive ? '0 0 20px rgba(56, 189, 248, 0.2)' : 'none',
                transition: 'all 0.3s ease'
              }}
            >
              {/* Stage Top Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#94a3b8',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px'
                }}>
                  STAGE 0{stage.stage_number}
                </span>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: statusColor,
                  letterSpacing: '0.04em'
                }}>
                  {statusText}
                </span>
              </div>

              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                  {stage.name}
                </h4>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                  Traffic Split: <strong style={{ color: '#38bdf8' }}>{stage.traffic_percentage}%</strong>
                </div>
              </div>

              {/* Telemetry Metrics for this stage */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.5)',
                borderRadius: '8px',
                padding: '0.6rem 0.75rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem',
                fontSize: '0.78rem'
              }}>
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>P99 Latency</div>
                  <div style={{
                    color: stage.p99_latency_ms < 100 ? '#34d399' : stage.p99_latency_ms < 500 ? '#facc15' : '#f87171',
                    fontWeight: 700
                  }}>
                    {stage.p99_latency_ms} ms
                  </div>
                </div>
                <div>
                  <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Error Rate</div>
                  <div style={{
                    color: stage.error_rate < 0.5 ? '#34d399' : '#f87171',
                    fontWeight: 700
                  }}>
                    {stage.error_rate}%
                  </div>
                </div>
              </div>

              {/* Health Verdict Text */}
              <div style={{
                fontSize: '0.78rem',
                color: '#cbd5e1',
                lineHeight: '1.4',
                borderLeft: `2px solid ${statusColor}`,
                paddingLeft: '0.5rem'
              }}>
                {stage.health_verdict}
              </div>
            </div>
          );
        })}
      </div>

      {/* Automated Safety Rules & Telemetry Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* Safety Guardrails Checklist */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🛡️</span> Automated SLO Guardrails &amp; Rollback Triggers
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {state?.automated_safety_checks.map((check, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  fontSize: '0.82rem',
                  color: '#cbd5e1',
                  background: 'rgba(30, 41, 59, 0.4)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.04)'
                }}
              >
                <span style={{ color: '#34d399', fontSize: '0.9rem' }}>✓</span>
                <span>{check}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Operational Verdict */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📡</span> Live SRE Pilot Telemetry Stream
          </h3>
          <div style={{
            background: '#090d16',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            borderRadius: '8px',
            padding: '0.85rem',
            fontFamily: 'monospace',
            fontSize: '0.82rem',
            color: '#38bdf8',
            lineHeight: '1.5',
            flex: 1
          }}>
            <span style={{ color: '#94a3b8' }}>[{new Date().toLocaleTimeString()}]</span> {state?.telemetry_summary}
          </div>
        </div>
      </div>
    </div>
  );
};
