import React, { useState, useEffect } from 'react';
import { HypothesisEvaluationResponse } from '../types';
import { evaluateHypotheses } from '../services/api';

interface HypothesisSandboxProps {
  incidentId?: string;
  service?: string;
}

export const HypothesisSandbox: React.FC<HypothesisSandboxProps> = ({ incidentId = 'INC-001', service = 'Payment API' }) => {
  const [data, setData] = useState<HypothesisEvaluationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHypothesisId, setSelectedHypothesisId] = useState<string>('hyp-db-pool');

  useEffect(() => {
    loadHypotheses();
  }, [incidentId, service]);

  const loadHypotheses = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await evaluateHypotheses(incidentId, service);
      setData(res);
      setSelectedHypothesisId(res.primary_hypothesis_id);
    } catch (err: any) {
      setError(err.message || 'Failed to evaluate counterfactual hypotheses');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'CONFIRMED') {
      return { bg: 'rgba(16, 185, 129, 0.2)', border: '#10b981', color: '#34d399', text: 'CONFIRMED' };
    }
    return { bg: 'rgba(239, 68, 68, 0.2)', border: '#ef4444', color: '#f87171', text: 'REJECTED' };
  };

  const activeHypothesis = data?.hypotheses.find(h => h.id === selectedHypothesisId) || data?.hypotheses[0];

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(20, 24, 45, 0.85) 0%, rgba(13, 16, 32, 0.95) 100%)',
      border: '1px solid rgba(168, 85, 247, 0.25)',
      borderRadius: '16px',
      padding: '1.25rem',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(99, 102, 241, 0.25))',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem'
          }}>
            ⚖️
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Counterfactual Hypothesis Explorer
              <span style={{
                background: 'rgba(168, 85, 247, 0.15)',
                color: '#c084fc',
                fontSize: '0.72rem',
                padding: '0.15rem 0.5rem',
                borderRadius: '12px',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                fontWeight: 600
              }}>
                Bayesian Confidence Spread: {data?.confidence_spread ?? '94% vs 12% vs 4%'}
              </span>
            </h3>
            <p style={{ margin: '0.15rem 0 0 0', color: '#94a3b8', fontSize: '0.78rem' }}>
              Mathematically proves why alternative failure modes (deadlocks, network loss) were ruled out using Hindsight telemetry.
            </p>
          </div>
        </div>

        <button
          onClick={loadHypotheses}
          style={{
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#cbd5e1',
            borderRadius: '6px',
            padding: '0.35rem 0.75rem',
            fontSize: '0.75rem',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          🔄 Re-evaluate
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
          Simulating competing root cause hypotheses...
        </div>
      ) : error ? (
        <div style={{ color: '#ef4444', fontSize: '0.85rem' }}>⚠️ {error}</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {/* List of 3 Competing Theories */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {data?.hypotheses.map(hyp => {
              const isSelected = hyp.id === selectedHypothesisId;
              const badge = getStatusBadge(hyp.status);

              return (
                <div
                  key={hyp.id}
                  onClick={() => setSelectedHypothesisId(hyp.id)}
                  style={{
                    background: isSelected
                      ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(15, 23, 42, 0.85))'
                      : 'rgba(15, 23, 42, 0.5)',
                    border: isSelected ? '1px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    padding: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 0 16px rgba(168, 85, 247, 0.25)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{
                      background: badge.bg,
                      color: badge.color,
                      border: `1px solid ${badge.border}`,
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px'
                    }}>
                      {badge.text}
                    </span>
                    <span style={{
                      color: hyp.status === 'CONFIRMED' ? '#34d399' : '#94a3b8',
                      fontWeight: 800,
                      fontSize: '0.9rem'
                    }}>
                      {hyp.probability_score}%
                    </span>
                  </div>

                  <div style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.85rem', lineHeight: '1.3' }}>
                    {hyp.title}
                  </div>

                  {/* Progress Bar of Probability */}
                  <div style={{
                    marginTop: '0.5rem',
                    height: '4px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${hyp.probability_score}%`,
                      background: hyp.status === 'CONFIRMED'
                        ? 'linear-gradient(90deg, #10b981, #34d399)'
                        : 'rgba(239, 68, 68, 0.7)',
                      borderRadius: '2px'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Counterfactual Breakdown for Selected Hypothesis */}
          {activeHypothesis && (
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Hindsight Precedent &amp; Empirical Reasoning
                </span>
                <div style={{ color: '#cbd5e1', fontSize: '0.82rem', marginTop: '0.2rem', lineHeight: '1.4' }}>
                  {activeHypothesis.hindsight_precedent}
                </div>
              </div>

              {/* Supporting Signals */}
              <div>
                <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase' }}>
                  ➕ Supporting Telemetry Signals ({activeHypothesis.supporting_signals.length})
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.3rem' }}>
                  {activeHypothesis.supporting_signals.map((sig, idx) => (
                    <div key={idx} style={{
                      fontSize: '0.78rem',
                      color: '#cbd5e1',
                      background: 'rgba(16, 185, 129, 0.08)',
                      padding: '0.35rem 0.6rem',
                      borderRadius: '4px',
                      borderLeft: '2px solid #10b981'
                    }}>
                      {sig}
                    </div>
                  ))}
                </div>
              </div>

              {/* Contradicting Signals */}
              {activeHypothesis.contradicting_signals.length > 0 && (
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#f87171', fontWeight: 700, textTransform: 'uppercase' }}>
                    ➖ Contradicting Telemetry (Disproved By Hindsight)
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.3rem' }}>
                    {activeHypothesis.contradicting_signals.map((sig, idx) => (
                      <div key={idx} style={{
                        fontSize: '0.78rem',
                        color: '#fca5a5',
                        background: 'rgba(239, 68, 68, 0.08)',
                        padding: '0.35rem 0.6rem',
                        borderRadius: '4px',
                        borderLeft: '2px solid #ef4444'
                      }}>
                        {sig}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Recommendation */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                fontSize: '0.78rem'
              }}>
                <span style={{ color: '#94a3b8', fontWeight: 600 }}>Recommendation: </span>
                <span style={{ color: activeHypothesis.status === 'CONFIRMED' ? '#38bdf8' : '#cbd5e1' }}>
                  {activeHypothesis.recommendation}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
