import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  Clock, 
  Sparkles, 
  Activity, 
  ShieldCheck, 
  CheckCircle2, 
  Zap,
  Layers,
  X
} from 'lucide-react';
import { playClickFeedback, playResolutionChime, playSev1Alert } from '../services/audio';

interface TimeTravelStep {
  timeLabel: string;
  phase: string;
  title: string;
  status: string;
  p99Latency: string;
  errorRate: string;
  trafficCanary: number;
  poolState: string;
  description: string;
  hindsightAction: string;
}

const steps: TimeTravelStep[] = [
  {
    timeLabel: 'T-00:00',
    phase: 'Detection & Ingress Surge',
    title: 'SEV-1 Outage Detected: HikariCP Pool Starvation',
    status: 'CRITICAL',
    p99Latency: '4,250 ms',
    errorRate: '18.4% (503s)',
    trafficCanary: 0,
    poolState: '50/50 Cap (142 Queued)',
    description: 'Surge of concurrent checkout requests exhausted the 50-connection pool. Incoming threads blocking on acquire.',
    hindsightAction: 'Symptom vector generated & sent to Hindsight memory bank ops-memory.'
  },
  {
    timeLabel: 'T+01:15',
    phase: 'Hindsight Memory Recall',
    title: 'Recalled INC-001 (March 2026 Outage) with 96% Match',
    status: 'CORRELATED',
    p99Latency: '4,210 ms',
    errorRate: '18.2%',
    trafficCanary: 0,
    poolState: '50/50 Cap (138 Queued)',
    description: 'Empirical postmortem INC-001 recalled. Historical root cause and verified capacity (DB_POOL_MAX=150) retrieved.',
    hindsightAction: 'Eliminated trial-and-error restarts. Formulated progressive canary mitigation plan.'
  },
  {
    timeLabel: 'T+02:30',
    phase: 'Autopilot Canary Shift (10%)',
    title: 'Canary Deployed with Resized 150-Slot Pool',
    status: 'CANARY_ACTIVE',
    p99Latency: '210 ms (Canary)',
    errorRate: '0.4%',
    trafficCanary: 10,
    poolState: '52/150 Active (0 Queued)',
    description: '5 canary pods deployed with DB_POOL_MAX=150. 10% live checkout traffic shifted without downtime.',
    hindsightAction: 'Canary telemetry validated. Zero connection acquisition timeouts on canary cohort.'
  },
  {
    timeLabel: 'T+03:45',
    phase: 'Progressive Scale (50%)',
    title: '50% Fleet Promoted: Latency Collapsing',
    status: 'STABILIZING',
    p99Latency: '65 ms',
    errorRate: '0.02%',
    trafficCanary: 50,
    poolState: '78/150 Active (0 Queued)',
    description: 'Canary traffic promoted to 50% of incoming checkouts. Thread contention completely dissipated.',
    hindsightAction: 'Error budget burn rate halted. Automated rollback trigger remained green.'
  },
  {
    timeLabel: 'T+04:30',
    phase: 'Full Fleet Promotion & Retain',
    title: '100% Fleet Promoted & Knowledge Retained into Hindsight',
    status: 'RESOLVED',
    p99Latency: '41 ms',
    errorRate: '0.00%',
    trafficCanary: 100,
    poolState: '84/150 Active (Healthy Headroom)',
    description: 'All 15 replicas running resized pool. Full checkout throughput restored. Resolution written into persistent memory.',
    hindsightAction: 'Postmortem retained into Hindsight bank ops-memory to shield future incidents.'
  }
];

interface TimeTravelSimulatorProps {
  onClose: () => void;
  onApplyStepToLive?: (stepIndex: number) => void;
}

export const TimeTravelSimulator: React.FC<TimeTravelSimulatorProps> = ({ onClose, onApplyStepToLive }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStepIdx(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            playResolutionChime();
            return prev;
          }
          const next = prev + 1;
          if (next === steps.length - 1) {
            playResolutionChime();
          } else {
            playClickFeedback();
          }
          return next;
        });
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const activeStep = steps[currentStepIdx];

  const handleStepSelect = (idx: number) => {
    playClickFeedback();
    setCurrentStepIdx(idx);
    if (onApplyStepToLive) onApplyStepToLive(idx);
    if (idx === 0) playSev1Alert();
    if (idx === steps.length - 1) playResolutionChime();
  };

  const handleTogglePlay = () => {
    playClickFeedback();
    if (currentStepIdx === steps.length - 1) {
      setCurrentStepIdx(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-amber-500/30 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
      {/* Background cyber watermark */}
      <div className="absolute right-4 bottom-2 text-7xl font-mono font-extrabold text-white/[0.02] pointer-events-none select-none">
        TIME-TRAVEL
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30 shadow-md">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                Counterfactual Incident Time-Travel Replay
              </h3>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-md whitespace-nowrap bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                {activeStep.timeLabel}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Scrub through the incident timeline to observe how Hindsight memory cut MTTR from 48m to 4m 30s.
            </p>
          </div>
        </div>

        {/* Playback Controls & Close */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={() => handleStepSelect(Math.max(0, currentStepIdx - 1))}
            disabled={currentStepIdx === 0}
            className="p-1.5 rounded-lg bg-[#111726] border border-white/[0.08] text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
            title="Previous Stage"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={handleTogglePlay}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/25 active:scale-95"
            title={isPlaying ? 'Pause Auto-Replay' : 'Play Timeline Auto-Replay'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Pause' : 'Play Replay'}</span>
          </button>

          <button
            onClick={() => handleStepSelect(Math.min(steps.length - 1, currentStepIdx + 1))}
            disabled={currentStepIdx === steps.length - 1}
            className="p-1.5 rounded-lg bg-[#111726] border border-white/[0.08] text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
            title="Next Stage"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleStepSelect(0)}
            className="p-1.5 rounded-lg bg-[#111726] border border-white/[0.08] text-slate-400 hover:text-white transition-colors"
            title="Reset to T-00:00"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors ml-1"
            title="Close Simulator"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrubbing Stepper Bar */}
      <div className="my-4">
        <div className="grid grid-cols-5 gap-1.5">
          {steps.map((st, idx) => {
            const isPassed = idx <= currentStepIdx;
            const isCurrent = idx === currentStepIdx;

            return (
              <button
                key={idx}
                onClick={() => handleStepSelect(idx)}
                className={`p-2 rounded-xl text-left transition-all border flex flex-col gap-1 ${
                  isCurrent
                    ? 'bg-amber-500/20 border-amber-400 shadow-md shadow-amber-500/20'
                    : isPassed
                    ? 'bg-[#101726] border-amber-500/30 text-slate-300'
                    : 'bg-[#0B0F18]/50 border-white/[0.04] text-slate-600 hover:border-white/[0.1]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-[10px] font-bold ${isCurrent ? 'text-amber-300' : isPassed ? 'text-slate-300' : 'text-slate-600'}`}>
                    {st.timeLabel}
                  </span>
                  {idx === steps.length - 1 ? (
                    <CheckCircle2 className={`w-3 h-3 ${isPassed ? 'text-emerald-400' : 'text-slate-700'}`} />
                  ) : (
                    <span className={`w-2 h-2 rounded-sm ${isCurrent ? 'bg-amber-400 animate-ping' : isPassed ? 'bg-amber-500/60' : 'bg-slate-800'}`} />
                  )}
                </div>
                <span className={`text-[10px] font-semibold truncate ${isCurrent ? 'text-white' : 'text-slate-400'}`}>
                  {st.phase}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Telemetry Snapshot for Selected Moment */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#0B0F19] border border-white/[0.06] rounded-xl p-3.5 text-xs font-mono">
        <div>
          <span className="text-[10px] text-slate-500 uppercase block">Snapshot P99</span>
          <span className={`text-base font-bold ${currentStepIdx === 0 ? 'text-rose-400' : currentStepIdx === 1 ? 'text-rose-300' : currentStepIdx === 2 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {activeStep.p99Latency}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 uppercase block">Error Rate</span>
          <span className={`text-base font-bold ${currentStepIdx < 2 ? 'text-rose-400' : currentStepIdx === 2 ? 'text-amber-300' : 'text-emerald-400'}`}>
            {activeStep.errorRate}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 uppercase block">Canary Traffic Shift</span>
          <span className="text-base font-bold text-cyan-400">
            {activeStep.trafficCanary}%
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 uppercase block">HikariCP Pool State</span>
          <span className="text-xs font-bold text-slate-200 mt-1 block truncate">
            {activeStep.poolState}
          </span>
        </div>
      </div>

      {/* Description & Memory Attribution for Moment */}
      <div className="mt-3.5 space-y-2 text-xs">
        <div className="bg-[#12192A]/80 border border-white/[0.06] rounded-xl p-3 text-slate-200">
          <span className="font-bold text-amber-300 mr-1.5 uppercase text-[10px] tracking-wider">
            {activeStep.title}:
          </span>
          {activeStep.description}
        </div>

        <div className="bg-purple-950/25 border border-purple-500/25 rounded-xl p-2.5 text-[11px] text-purple-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
          <span>
            <strong className="text-purple-300">Hindsight Action at this second: </strong>
            {activeStep.hindsightAction}
          </span>
        </div>
      </div>
    </div>
  );
};
