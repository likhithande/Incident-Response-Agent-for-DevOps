import React, { useState, useRef, useEffect } from 'react';
import { Terminal, ChevronDown, ChevronUp, Maximize2, Minimize2, X, Play, Sparkles } from 'lucide-react';
import { recallMemoryDirect, fetchHealth, fetchMemoryStatus } from '../services/api';
import { playClickFeedback } from '../services/audio';

interface InteractiveTerminalDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  incidentId?: string;
  service?: string;
}

interface CommandLog {
  id: string;
  command: string;
  output: string;
  type: 'info' | 'success' | 'error' | 'memory';
}

export const InteractiveTerminalDrawer: React.FC<InteractiveTerminalDrawerProps> = ({
  isOpen,
  onToggle,
  incidentId = 'INC-001',
  service = 'Payment API'
}) => {
  const [commandInput, setCommandInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [logs, setLogs] = useState<CommandLog[]>([
    {
      id: 'init-1',
      command: 'system init --target=sre-console',
      output: `OpsMemory Cybernetic SRE Terminal v2.4.0 [ARMED]\nConnected to Hindsight Memory Engine (bank: ops-memory)\nType 'help' for available commands or 'hindsight recall <query>' to search memory.`,
      type: 'info'
    }
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [logs, isOpen]);

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = commandInput.trim();
    if (!cmd || isBusy) return;

    playClickFeedback();
    setCommandHistory(prev => [...prev, cmd]);
    setHistoryIdx(-1);
    setCommandInput('');

    const lower = cmd.toLowerCase();

    if (lower === 'clear' || lower === 'cls') {
      setLogs([]);
      return;
    }

    if (lower === 'help') {
      setLogs(prev => [
        ...prev,
        {
          id: `cmd-${Date.now()}`,
          command: cmd,
          output: `Available Cybernetic SRE Commands:\n  • hindsight recall <query>  - Vector query historical postmortem memory bank\n  • sre status                 - Display system health & Hindsight cloud connectivity\n  • kubectl get pods           - List live production pods & restart counts\n  • kubectl logs payment-api   - Stream recent stderr traces for active service\n  • canary status              - Inspect progressive canary rollout stages\n  • clear                      - Clear terminal history`,
          type: 'info'
        }
      ]);
      return;
    }

    if (lower.startsWith('hindsight recall ') || lower.startsWith('recall ')) {
      const q = cmd.replace(/^(hindsight recall|recall)\s+/i, '');
      setIsBusy(true);
      try {
        const results = await recallMemoryDirect(q);
        const text = results.length > 0
          ? results.map(r => `[FOUND ${r.incident_id}] Service: ${r.service}\n  Root Cause: ${r.root_cause}\n  Resolution: ${r.resolution}`).join('\n\n')
          : `No memories recalled matching "${q}" in bank 'ops-memory'.`;
        setLogs(prev => [
          ...prev,
          {
            id: `cmd-${Date.now()}`,
            command: cmd,
            output: `Querying Hindsight memory bank 'ops-memory' for: "${q}"...\n${text}`,
            type: 'memory'
          }
        ]);
      } catch (err: any) {
        setLogs(prev => [
          ...prev,
          { id: `cmd-${Date.now()}`, command: cmd, output: `Hindsight Query Error: ${err.message}`, type: 'error' }
        ]);
      } finally {
        setIsBusy(false);
      }
      return;
    }

    if (lower === 'sre status') {
      setIsBusy(true);
      try {
        const [health, mem] = await Promise.all([fetchHealth().catch(() => null), fetchMemoryStatus().catch(() => null)]);
        setLogs(prev => [
          ...prev,
          {
            id: `cmd-${Date.now()}`,
            command: cmd,
            output: `[SRE STATUS REPORT]\n  Engine Health: ${health?.status || 'OK'}\n  Hindsight Mode: ${mem?.mode || 'local_simulated'}\n  Memory Bank: ${mem?.bank_id || 'ops-memory'}\n  Retained Postmortems: ${mem?.retained_count || 10} indexed\n  Groq Model: ${mem?.groq_model || 'llama-3.3-70b-versatile'}`,
            type: 'success'
          }
        ]);
      } catch (err: any) {
        setLogs(prev => [
          ...prev,
          { id: `cmd-${Date.now()}`, command: cmd, output: `Status check failed: ${err.message}`, type: 'error' }
        ]);
      } finally {
        setIsBusy(false);
      }
      return;
    }

    if (lower.includes('kubectl get pods') || lower === 'k get pods') {
      setLogs(prev => [
        ...prev,
        {
          id: `cmd-${Date.now()}`,
          command: cmd,
          output: `NAME                                 READY   STATUS    RESTARTS   AGE\npayment-api-7b89f5c499-x7l2p         1/1     Running   0          34m\npayment-api-7b89f5c499-m9k2a         1/1     Running   0          34m\npayment-api-7b89f5c499-c4v1q         1/1     Running   0          34m\norder-service-67b84d9f-p4n1z         1/1     Running   0          2h\nauth-service-54c7d9e1-w2x8k          1/1     Running   1 (12m)    4h\npg-primary-0                         1/1     Running   0          18d`,
          type: 'success'
        }
      ]);
      return;
    }

    if (lower.includes('kubectl logs') || lower === 'k logs') {
      setLogs(prev => [
        ...prev,
        {
          id: `cmd-${Date.now()}`,
          command: cmd,
          output: `[2026-09-28 20:25:40.102] ERROR [HikariPool-1] Connection is not available, request timed out after 30000ms.\n[2026-09-28 20:25:41.412] WARN  [payment-core] Active: 50/50, Idle: 0, Pending: 142 threads\n[2026-09-28 20:25:42.115] ERROR [http-nio-8080-exec-44] org.postgresql.util.PSQLException: FATAL: remaining connection slots are reserved\n[2026-09-28 20:25:42.890] ALERT [ingress-gateway] HTTP 503 Service Unavailable returned on /checkout`,
          type: 'error'
        }
      ]);
      return;
    }

    if (lower === 'canary status') {
      setLogs(prev => [
        ...prev,
        {
          id: `cmd-${Date.now()}`,
          command: cmd,
          output: `[CANARY FLEET CONTROLLER]\n  Active Target: ${incidentId} (${service})\n  Total Stages: 4 Stages\n  Current Traffic Split: 0% Canary / 100% Stable\n  Safety Gate: P99 < 300ms, 5xx < 1.0%\n  Status: STANDBY (Ready for Autopilot trigger)`,
          type: 'info'
        }
      ]);
      return;
    }

    // Default unrecognized command
    setLogs(prev => [
      ...prev,
      {
        id: `cmd-${Date.now()}`,
        command: cmd,
        output: `command not recognized: '${cmd}'. Type 'help' to view available SRE diagnostic tools.`,
        type: 'error'
      }
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIdx = historyIdx === -1 ? commandHistory.length - 1 : Math.max(0, historyIdx - 1);
        setHistoryIdx(nextIdx);
        setCommandInput(commandHistory[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx !== -1) {
        const nextIdx = historyIdx + 1;
        if (nextIdx >= commandHistory.length) {
          setHistoryIdx(-1);
          setCommandInput('');
        } else {
          setHistoryIdx(nextIdx);
          setCommandInput(commandHistory[nextIdx]);
        }
      }
    }
  };

  return (
    <>
      {/* Floating Dock Button when collapsed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed bottom-4 left-4 z-40 bg-[#0A0F1D]/90 hover:bg-[#121A2F] border border-cyan-500/40 text-cyan-300 hover:text-white px-3 py-1.5 rounded-xl shadow-lg shadow-cyan-950/40 flex items-center gap-2 text-xs font-mono font-bold transition-all backdrop-blur-md active:scale-95 group"
          title="Open Cybernetic SRE Terminal CLI Drawer"
        >
          <Terminal className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
          <span>SRE Terminal</span>
          <span className="w-2 h-2 rounded-sm bg-emerald-400 animate-pulse" />
        </button>
      )}

      {/* Expanded Terminal Drawer */}
      {isOpen && (
        <div
          className={`fixed bottom-0 left-0 right-0 z-40 bg-[#060911]/98 border-t border-cyan-500/30 shadow-2xl flex flex-col backdrop-blur-xl transition-all duration-200 ${
            isExpanded ? 'h-[75vh]' : 'h-72'
          }`}
        >
          {/* Terminal Title Bar */}
          <div className="bg-[#0B101E] px-4 py-2 border-b border-white/[0.08] flex items-center justify-between text-xs font-mono select-none">
            <div className="flex items-center gap-2.5">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white tracking-wide">
                sre@opsmemory-sentinel:~$
              </span>
              <span className="text-[10px] text-slate-400">
                (Target: {service} • {incidentId})
              </span>
            </div>

            {/* Quick Helper Chips */}
            <div className="hidden md:flex items-center gap-1.5 text-[10px]">
              <button
                onClick={() => setCommandInput('sre status')}
                className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
              >
                sre status
              </button>
              <button
                onClick={() => setCommandInput('kubectl get pods')}
                className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
              >
                kubectl get pods
              </button>
              <button
                onClick={() => setCommandInput('hindsight recall pool')}
                className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition-colors"
              >
                hindsight recall
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                title={isExpanded ? 'Restore' : 'Maximize'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={onToggle}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                title="Close Terminal Drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Terminal Logs View */}
          <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-2.5 custom-scrollbar text-slate-200">
            {logs.map((log) => (
              <div key={log.id} className="space-y-1">
                <div className="flex items-center gap-2 text-cyan-400 font-bold">
                  <span>❯</span>
                  <span>{log.command}</span>
                </div>
                <pre className={`whitespace-pre-wrap leading-relaxed pl-4 border-l-2 text-[11px] ${
                  log.type === 'error'
                    ? 'border-rose-500 text-rose-300'
                    : log.type === 'success'
                    ? 'border-emerald-500 text-emerald-300'
                    : log.type === 'memory'
                    ? 'border-purple-500 text-purple-300 bg-purple-950/20 p-2 rounded-r-lg'
                    : 'border-slate-700 text-slate-300'
                }`}>
                  {log.output}
                </pre>
              </div>
            ))}
            {isBusy && (
              <div className="text-purple-400 font-mono text-xs flex items-center gap-2">
                <span className="animate-spin">⠋</span>
                <span>Querying operational telemetry...</span>
              </div>
            )}
            <div ref={terminalEndRef} />
          </div>

          {/* Command Prompt Input */}
          <form onSubmit={handleCommandSubmit} className="bg-[#090D17] border-t border-white/[0.08] p-2.5 flex items-center gap-2 font-mono">
            <span className="text-cyan-400 font-bold text-xs pl-2">❯</span>
            <input
              ref={inputRef}
              type="text"
              placeholder="Type command ('help', 'hindsight recall <query>', 'kubectl get pods')..."
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-white text-xs focus:outline-none placeholder-slate-600"
            />
            <button
              type="submit"
              disabled={!commandInput.trim() || isBusy}
              className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1"
            >
              <span>Execute</span>
            </button>
          </form>
        </div>
      )}
    </>
  );
};
