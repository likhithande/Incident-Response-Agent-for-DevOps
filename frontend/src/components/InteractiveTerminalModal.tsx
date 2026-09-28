import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  CheckCircle2, 
  ShieldCheck, 
  Copy, 
  Check, 
  X, 
  Play, 
  Clock, 
  Cpu, 
  AlertTriangle 
} from 'lucide-react';
import { RunbookExecuteResponse } from '../types';
import { playClickFeedback } from '../services/audio';

interface InteractiveTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  stepTitle: string;
  stepType: 'investigation' | 'resolution';
  response: RunbookExecuteResponse | null;
  isLoading: boolean;
  onReExecute?: () => void;
}

export const InteractiveTerminalModal: React.FC<InteractiveTerminalModalProps> = ({
  isOpen,
  onClose,
  stepTitle,
  stepType,
  response,
  isLoading,
  onReExecute,
}) => {
  const [copied, setCopied] = useState(false);
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);

  useEffect(() => {
    if (response && response.terminal_output) {
      const lines = response.terminal_output.split('\n');
      setDisplayedLines([]);
      
      // Simulate rapid streaming terminal lines
      lines.forEach((line, index) => {
        setTimeout(() => {
          setDisplayedLines(prev => [...prev, line]);
        }, index * 40);
      });
    } else {
      setDisplayedLines([]);
    }
  }, [response]);

  if (!isOpen) return null;

  const handleCopy = () => {
    playClickFeedback();
    if (response?.terminal_output) {
      navigator.clipboard.writeText(
        `$ ${response.command_executed}\n\n${response.terminal_output}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl glass-panel border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Terminal Header Bar */}
        <div className="px-4 py-3 bg-[#0D121F] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 mr-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500/80 inline-block border border-rose-600" />
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/80 inline-block border border-amber-600" />
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/80 inline-block border border-emerald-600" />
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <Terminal className="w-3.5 h-3.5 text-purple-400" />
              <span>sre@ops-control: ~ <span className="text-slate-500">(AWS us-east-1 / Production)</span></span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {response && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {response.duration_ms}ms
              </span>
            )}
            <button
              onClick={() => { playClickFeedback(); onClose(); }}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Context Sub-header */}
        <div className="px-5 py-3 bg-[#0B0F19] border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
              stepType === 'resolution' 
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}>
              {stepType === 'resolution' ? 'Remediation Action' : 'Diagnostic Check'}
            </span>
            <span className="text-xs font-semibold text-white truncate max-w-md">
              {stepTitle}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {response && (
              <span className={`px-2.5 py-0.5 rounded-md whitespace-nowrap text-[10px] font-mono font-bold flex items-center gap-1 ${
                response.status === 'APPLIED'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                <CheckCircle2 className="w-3 h-3" />
                {response.status}
              </span>
            )}
            {onReExecute && !isLoading && (
              <button
                onClick={() => { playClickFeedback(); onReExecute(); }}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 flex items-center gap-1.5 transition-all"
              >
                <Play className="w-3 h-3 text-purple-400" />
                Re-run
              </button>
            )}
            <button
              onClick={handleCopy}
              disabled={isLoading || !response}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Terminal Screen Body */}
        <div className="flex-1 overflow-y-auto p-5 font-mono text-xs bg-[#05070C] space-y-4 min-h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
              <div className="text-slate-400 text-xs animate-pulse">
                Establishing SSH tunnel to cluster node & executing telemetry query...
              </div>
              <span className="text-[10px] text-slate-500">Security guardrails: read-only privileged session</span>
            </div>
          ) : response ? (
            <>
              {/* Command Invocation */}
              <div className="flex items-start gap-2 text-purple-400 font-semibold bg-purple-950/20 p-2.5 rounded-lg border border-purple-500/20">
                <span className="text-emerald-400 select-none">$</span>
                <span className="text-slate-200 select-all">{response.command_executed}</span>
              </div>

              {/* Streaming Output */}
              <div className="space-y-1 text-slate-300 leading-relaxed font-mono">
                {displayedLines.map((line, idx) => {
                  const isAlert = line.includes('[ALERT]') || line.includes('[CRITICAL');
                  const isVerified = line.includes('[VERIFIED') || line.includes('[HEALTH') || line.includes('[APPLIED');
                  const isHeading = line.startsWith('#') || line.startsWith('GROUP') || line.startsWith(' count');

                  return (
                    <div 
                      key={idx} 
                      className={`whitespace-pre-wrap ${
                        isAlert 
                          ? 'text-rose-400 font-bold bg-rose-950/30 px-2 py-0.5 rounded' 
                          : isVerified
                          ? 'text-emerald-300 font-semibold bg-emerald-950/20 px-2 py-0.5 rounded'
                          : isHeading
                          ? 'text-purple-300 font-semibold'
                          : 'text-slate-300'
                      }`}
                    >
                      {line}
                    </div>
                  );
                })}
              </div>

              {/* Verified Evidence Box */}
              {response.evidence_found && (
                <div className="mt-4 p-3.5 rounded-xl bg-emerald-950/25 border border-emerald-500/30 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
                      Empirical SRE Telemetry Verified
                    </span>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {response.evidence_found}
                    </p>
                  </div>
                </div>
              )}

              {/* Safety Guardrail Badge */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-emerald-400/90">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{response.safety_checks}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <Cpu className="w-3 h-3 text-purple-400" />
                  <span>Verified via OpsMemory Runtime</span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-500">
              Ready to execute command against operational cluster.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#090D17] border-t border-white/[0.08] flex items-center justify-between">
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Execution logs automatically logged to incident timeline
          </span>
          <button
            onClick={() => { playClickFeedback(); onClose(); }}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            Close Terminal
          </button>
        </div>
      </div>
    </div>
  );
};
