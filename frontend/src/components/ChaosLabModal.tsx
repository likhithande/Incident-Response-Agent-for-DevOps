import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  X, 
  Play, 
  AlertTriangle, 
  Database, 
  Cpu, 
  Radio, 
  CheckCircle2, 
  Brain,
  Zap
} from 'lucide-react';
import { ChaosScenario, Incident } from '../types';
import { fetchChaosScenarios } from '../services/api';
import { playSev1Alert, playClickFeedback } from '../services/audio';

interface ChaosLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInjectChaos: (incident: Incident) => void;
}

export const ChaosLabModal: React.FC<ChaosLabModalProps> = ({
  isOpen,
  onClose,
  onInjectChaos
}) => {
  const [scenarios, setScenarios] = useState<ChaosScenario[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchChaosScenarios()
        .then(setScenarios)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInject = (scenario: ChaosScenario) => {
    playClickFeedback();
    playSev1Alert();

    const newIncident: Incident = {
      incident_id: `INC-CHAOS-${Math.floor(100 + Math.random() * 900)}`,
      service: scenario.service,
      severity: scenario.severity as 'CRITICAL' | 'HIGH',
      symptoms: scenario.symptoms,
      error_logs: scenario.error_logs,
      status: 'ACTIVE'
    };

    onInjectChaos(newIncident);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl glass-panel border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-[#0B0F19] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Production Chaos Simulator
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Judge Demo Mode
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Inject realistic production failure modes to evaluate OpsMemory&apos;s real-time memory recall and triage.
              </p>
            </div>
          </div>

          <button
            onClick={() => { playClickFeedback(); onClose(); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scenarios Grid */}
        <div className="p-5 overflow-y-auto space-y-3.5 bg-[#06090F]">
          {loading ? (
            <div className="text-center py-16 space-y-2">
              <div className="w-7 h-7 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mx-auto" />
              <span className="text-xs text-slate-400 block">Loading chaos templates...</span>
            </div>
          ) : (
            scenarios.map((scenario) => {
              const isCritical = scenario.severity === 'CRITICAL';

              return (
                <div 
                  key={scenario.id}
                  className="glass-card p-4 rounded-xl border border-white/[0.07] hover:border-purple-500/40 transition-all space-y-3 relative overflow-hidden group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2.5 py-0.5 rounded-md whitespace-nowrap text-[10px] font-mono font-bold ${
                        isCritical 
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {scenario.severity}
                      </span>
                      <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                        {scenario.title}
                      </h3>
                      <span className="text-[11px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                        {scenario.service}
                      </span>
                    </div>

                    <button
                      onClick={() => handleInject(scenario)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center gap-1.5 shadow-lg shadow-rose-900/30 transition-all self-start sm:self-auto"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Inject Outage
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {scenario.description}
                  </p>

                  {/* Symptoms & Historical Link */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/[0.05] text-[11px]">
                    <div>
                      <span className="text-slate-400 font-semibold block mb-1">Observed Symptoms:</span>
                      <ul className="space-y-0.5 text-slate-300">
                        {scenario.symptoms.slice(0, 2).map((symp, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-rose-400">›</span> {symp}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-2.5 rounded-lg bg-purple-950/20 border border-purple-500/20 flex items-start gap-2">
                      <Brain className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-purple-300 uppercase tracking-wider block text-[10px]">
                          Target Hindsight Correlation
                        </span>
                        <p className="text-slate-300 text-[11px] mt-0.5">
                          {scenario.historical_link}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#0B0F19] border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400">
          <span>Clicking &quot;Inject Outage&quot; plays the PagerDuty alert chime and activates the incident for triage.</span>
          <button
            onClick={() => { playClickFeedback(); onClose(); }}
            className="px-4 py-1.5 rounded-xl font-semibold bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
