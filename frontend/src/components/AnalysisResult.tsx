import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Wrench, 
  Brain, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck,
  Zap,
  Copy,
  Check,
  CheckSquare,
  Square,
  Terminal,
  Volume2,
  VolumeX,
  Play
} from 'lucide-react';
import { IncidentAnalysisResponse, Incident, RunbookExecuteResponse } from '../types';
import { executeRunbookStep } from '../services/api';
import { InteractiveTerminalModal } from './InteractiveTerminalModal';
import { speakIncidentBriefing, stopSpeaking, isSpeaking, playClickFeedback, playResolutionChime } from '../services/audio';

interface AnalysisResultProps {
  response: IncidentAnalysisResponse;
  incident: Incident;
  onOpenResolve: () => void;
  onOpenAutopilot?: () => void;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({
  response,
  incident,
  onOpenResolve,
  onOpenAutopilot
}) => {
  const { analysis, retrieved_memories, with_memory, processing_time_ms } = response;
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [copiedStep, setCopiedStep] = useState<string | null>(null);
  
  // Terminal execution state
  const [activeTerminalStep, setActiveTerminalStep] = useState<{ title: string; type: 'investigation' | 'resolution' } | null>(null);
  const [terminalResponse, setTerminalResponse] = useState<RunbookExecuteResponse | null>(null);
  const [isExecutingStep, setIsExecutingStep] = useState(false);

  // Audio briefing state
  const [speaking, setSpeaking] = useState(false);

  const toggleStep = (id: string) => {
    setCompletedSteps(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyStepText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(id);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const handleExecute = async (title: string, type: 'investigation' | 'resolution') => {
    playClickFeedback();
    setActiveTerminalStep({ title, type });
    setTerminalResponse(null);
    setIsExecutingStep(true);

    try {
      const res = await executeRunbookStep({
        incident_id: incident.incident_id,
        step_title: title,
        step_type: type,
        service: incident.service
      });
      setTerminalResponse(res);
      if (type === 'resolution') {
        playResolutionChime();
      }
    } catch (err) {
      console.error('Runbook execution error:', err);
    } finally {
      setIsExecutingStep(false);
    }
  };

  const handleVoiceBriefing = () => {
    playClickFeedback();
    if (speaking || isSpeaking()) {
      stopSpeaking();
      setSpeaking(false);
    } else {
      setSpeaking(true);
      speakIncidentBriefing(
        analysis.summary,
        analysis.likely_root_cause,
        () => setSpeaking(false)
      );
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence.toUpperCase()) {
      case 'HIGH':
        return (
          <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-sm shadow-emerald-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            HIGH CONFIDENCE
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold">
            MEDIUM CONFIDENCE
          </span>
        );
      default:
        return (
          <span className="bg-slate-500/15 text-slate-400 border border-slate-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold">
            LOW CONFIDENCE
          </span>
        );
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 shadow-2xl space-y-5 border border-white/[0.08] animate-in fade-in duration-300 relative">
      {/* Header & Pipeline Visualizer */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3.5 border-b border-white/[0.07]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30 shadow-lg shadow-purple-500/10">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                AI Incident Triage & Runbook Engine
                <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  Live
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Execution Time: {processing_time_ms}ms • Engine: {response.memory_engine}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Audio Voice Briefing Button */}
            <button
              onClick={handleVoiceBriefing}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                speaking
                  ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-500/30 animate-pulse'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/10'
              }`}
              title="Listen to AI Incident Commander Audio Briefing"
            >
              {speaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-purple-400" />}
              <span>{speaking ? 'Stop Briefing' : 'Brief Commander'}</span>
            </button>

            {getConfidenceBadge(analysis.confidence)}

            <button
              onClick={() => { playClickFeedback(); onOpenResolve(); }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-lg shadow-emerald-600/25 active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Record Resolution</span>
            </button>
          </div>
        </div>

        {/* Visual Pipeline Flow */}
        <div className="mt-3 bg-[#080C14] border border-white/[0.06] rounded-xl p-3 text-xs flex flex-wrap items-center justify-between gap-2 shadow-inner">
          <div className="flex items-center gap-1.5 text-blue-400 font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>1. ACTIVE SIGNALS</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600" />

          <div className={`flex items-center gap-1.5 font-mono font-bold ${with_memory ? 'text-purple-400' : 'text-slate-600 line-through'}`}>
            <Brain className="w-3.5 h-3.5" />
            <span>2. HINDSIGHT RECALL ({retrieved_memories.length})</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600" />

          <div className="flex items-center gap-1.5 text-indigo-400 font-mono font-bold">
            <Zap className="w-3.5 h-3.5" />
            <span>3. CORRELATION REASONING</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600" />

          <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>4. INTERACTIVE MITIGATION</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-[#101726]/80 border border-white/[0.06] rounded-xl p-3.5 text-xs text-slate-200 leading-relaxed shadow-sm">
        <span className="font-bold text-white mr-1.5 uppercase text-[11px] tracking-wide text-blue-400">
          Executive Incident Assessment:
        </span>
        {analysis.summary}
      </div>

      {/* Likely Root Cause Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-blue-950/20 border border-purple-500/30 rounded-xl p-4 shadow-lg glow-purple">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-purple-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-purple-400" />
            Diagnosed Root Cause Hypothesis
          </span>
          <span className="text-[10px] font-mono bg-purple-500/20 text-purple-200 px-2 py-0.5 rounded border border-purple-500/30 font-semibold">
            Correlated with Hindsight
          </span>
        </div>
        <p className="text-sm font-bold text-white leading-snug">
          {analysis.likely_root_cause}
        </p>
        <p className="text-xs text-slate-300 mt-2 font-medium leading-relaxed">
          {analysis.reasoning_summary}
        </p>
      </div>

      {/* Interactive Recommended Investigation Steps Checklist with SRE CLI Sandbox */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-blue-400 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" />
            <span>Interactive Diagnostic Checklist ({analysis.recommended_investigation.length} steps)</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono font-normal">Click &quot;Run Diagnostic&quot; to test in live terminal</span>
        </div>

        <div className="space-y-2">
          {analysis.recommended_investigation.map((step, idx) => {
            const stepId = `inv-${idx}`;
            const isDone = !!completedSteps[stepId];
            return (
              <div
                key={idx}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border text-xs transition-all ${
                  isDone 
                    ? 'bg-blue-950/20 border-blue-500/30 text-slate-400' 
                    : 'bg-[#111726]/70 border-white/[0.06] text-slate-200 hover:border-white/[0.12]'
                }`}
              >
                <div className="flex items-start gap-2.5 flex-1">
                  <button
                    onClick={() => toggleStep(stepId)}
                    className="mt-0.5 text-blue-400 hover:text-blue-300 transition-colors flex-shrink-0"
                  >
                    {isDone ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-slate-500" />}
                  </button>
                  <span className={`leading-relaxed ${isDone ? 'line-through text-slate-400' : ''}`}>{step}</span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleExecute(step, 'investigation')}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 transition-all shadow-sm"
                    title="Execute diagnostic command in sandbox terminal"
                  >
                    <Terminal className="w-3 h-3 text-purple-400" />
                    <span>Run Diagnostic</span>
                  </button>

                  <button
                    onClick={() => copyStepText(step, stepId)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-white bg-white/5 transition-colors"
                    title="Copy step text"
                  >
                    {copiedStep === stepId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Autonomous SRE Autopilot Quick Launch Banner */}
      {onOpenAutopilot && (
        <div className="bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-cyan-950/50 border border-purple-500/40 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg glow-purple">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-md">
              <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Autonomous SRE Self-Healing Available</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Zero Human Delay
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Execute automated 4-stage canary deployment with live RBAC safety checks &amp; instant memory retention.
              </p>
            </div>
          </div>

          <button
            onClick={() => { playClickFeedback(); onOpenAutopilot(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 active:scale-95 transition-all self-end sm:self-center flex-shrink-0"
          >
            <Zap className="w-3.5 h-3.5 fill-current text-yellow-300" />
            <span>Launch SRE Autopilot</span>
          </button>
        </div>
      )}

      {/* Recommended Resolution Steps with Interactive CLI Execution */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-emerald-400 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5" />
            <span>Recommended Remediation Runbook ({analysis.recommended_resolution.length} actions)</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono font-normal">Click &quot;Apply Mitigation&quot; to execute fix</span>
        </div>

        <div className="space-y-2">
          {analysis.recommended_resolution.map((step, idx) => {
            const stepId = `res-${idx}`;
            return (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111726]/70 border border-white/[0.06] rounded-xl p-3.5 text-xs text-slate-200 hover:border-emerald-500/30 transition-all"
              >
                <div className="flex items-start gap-2.5 flex-1">
                  <span className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-400 font-mono font-bold flex items-center justify-center flex-shrink-0 text-[11px] border border-emerald-500/20 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed font-medium">{step}</span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleExecute(step, 'resolution')}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 transition-all shadow-sm"
                    title="Apply remediation command in terminal sandbox"
                  >
                    <Play className="w-3 h-3 text-emerald-400 fill-current" />
                    <span>Apply Mitigation</span>
                  </button>

                  <button
                    onClick={() => copyStepText(step, stepId)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-white bg-white/5 transition-colors"
                    title="Copy command"
                  >
                    {copiedStep === stepId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Operational Warnings */}
      {analysis.warnings && analysis.warnings.length > 0 && (
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3.5 text-xs text-amber-200 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-amber-400 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Operational Precautions & Risk Factors</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
            {analysis.warnings.map((warn, i) => (
              <li key={i}>{warn}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Memory Attribution Card: "Why this recommendation?" */}
      <div className="bg-[#090D17] border border-purple-500/30 rounded-xl p-4 space-y-3 glow-purple">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
            <Brain className="w-4 h-4 text-purple-400" />
            <span>Why This Recommendation? (Hindsight Attribution)</span>
          </div>
          <span className="text-[10px] font-mono text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded border border-purple-500/30 font-bold">
            Empirical Memory
          </span>
        </div>

        {with_memory && analysis.historical_context && analysis.historical_context.length > 0 ? (
          <div className="space-y-3 text-xs">
            {/* Grid comparing current evidence vs historical postmortem */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-[#121929] p-3 rounded-lg border border-white/[0.06]">
                <span className="font-bold text-slate-400 block mb-1.5 text-[10px] uppercase tracking-wider">
                  Current Observed Signals
                </span>
                <ul className="list-disc list-inside text-slate-200 space-y-1 text-[11px]">
                  {incident.symptoms.slice(0, 3).map((s, idx) => (
                    <li key={idx} className="truncate">{s}</li>
                  ))}
                  {incident.error_logs.length > 0 && (
                    <li className="font-mono text-emerald-400 truncate">
                      {incident.error_logs[0]}
                    </li>
                  )}
                </ul>
              </div>

              <div className="bg-purple-950/30 p-3 rounded-lg border border-purple-500/30">
                <span className="font-bold text-purple-300 block mb-1.5 text-[10px] uppercase tracking-wider flex items-center justify-between">
                  <span>Recalled Postmortem Precedent</span>
                  <span className="font-mono text-[9px] bg-purple-500/20 px-1.5 py-0.2 rounded text-purple-200">
                    {analysis.historical_context[0].incident_id}
                  </span>
                </span>
                <p className="text-slate-200 text-[11px] leading-relaxed">
                  {analysis.historical_context[0].relevance_explanation}
                </p>
                <div className="mt-1.5 pt-1.5 border-t border-purple-500/20 text-[10px] text-slate-400">
                  <span className="text-purple-300 font-semibold">Past Resolution: </span>
                  {analysis.historical_context[0].key_takeaways}
                </div>
              </div>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-2.5 text-[11px] text-purple-200 leading-relaxed">
              <span className="font-bold">Attribution Statement: </span>
              Recommendation was directly guided by historical postmortem{' '}
              <span className="font-mono font-bold text-white underline">
                {analysis.historical_context[0].incident_id}
              </span>.
              Hindsight persistent memory provided the proven capacity numbers and diagnostic runbook, eliminating blind trial-and-error restarts.
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400 italic py-2">
            {with_memory
              ? 'No historical postmortems matched the current symptoms with high confidence. Analysis relied on general heuristics.'
              : 'Analysis was conducted in stateless mode without persistent memory.'}
          </div>
        )}
      </div>

      {/* Interactive Terminal Execution Modal */}
      {activeTerminalStep && (
        <InteractiveTerminalModal
          isOpen={!!activeTerminalStep}
          onClose={() => setActiveTerminalStep(null)}
          stepTitle={activeTerminalStep.title}
          stepType={activeTerminalStep.type}
          response={terminalResponse}
          isLoading={isExecutingStep}
          onReExecute={() => handleExecute(activeTerminalStep.title, activeTerminalStep.type)}
        />
      )}
    </div>
  );
};
