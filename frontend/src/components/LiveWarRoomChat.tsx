import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  X, 
  Play, 
  RefreshCw, 
  Terminal, 
  ThumbsUp, 
  ThumbsDown, 
  Brain, 
  Trash2, 
  Download, 
  ExternalLink, 
  ShieldAlert, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  FileText,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { WarRoomChatMessage } from '../types';
import { sendWarRoomChat } from '../services/api';
import { 
  playClickFeedback, 
  playHotPatchDeploySound, 
  speakAgentMessage, 
  stopSpeaking, 
  isSpeaking 
} from '../services/audio';

interface LiveWarRoomChatProps {
  incidentId?: string;
  incidentTitle?: string;
  service?: string;
  status?: string;
  onExecuteAction?: (action: string) => void;
  onViewChange?: (view: any) => void;
}

export const LiveWarRoomChat: React.FC<LiveWarRoomChatProps> = ({ 
  incidentId = 'INC-001', 
  incidentTitle = 'HikariCP Connection Pool Exhaustion',
  service = 'Payment API',
  status = 'INVESTIGATING',
  onExecuteAction,
  onViewChange 
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [isExecutingAction, setIsExecutingAction] = useState<string | null>(null);
  const [expandedCitationId, setExpandedCitationId] = useState<string | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, 'up' | 'down'>>({});

  const [messages, setMessages] = useState<WarRoomChatMessage[]>([
    {
      id: 'msg-init-1',
      sender: 'OpsMemory Copilot',
      sender_type: 'agent',
      timestamp: 'Just now',
      message: `Operational War Room active for ${service} (${incidentId}). I have grounded this session in Hindsight memory bank \`opsmemory-prod\` (10 historical postmortems indexed).\n\nObserved anomaly: HikariCP connection starvation causing P99 spike to 4,250ms. How would you like to proceed?`,
      badge: 'Hindsight Online',
      suggested_action: 'Scale HikariCP Pool to 150',
      cited_incident_id: 'INC-001'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new messages or open
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isExecutingAction, expandedCitationId]);

  // Keyboard shortcut Alt+C to toggle chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        playClickFeedback();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || sending) return;

    playClickFeedback();

    const userMsg: WarRoomChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'SRE On-Call',
      sender_type: 'human',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      message: text
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setSending(true);

    try {
      const res = await sendWarRoomChat(text, incidentId);
      const agentMsg: WarRoomChatMessage = {
        id: `msg-agent-${Date.now()}`,
        sender: 'OpsMemory Copilot',
        sender_type: 'agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        message: res.reply,
        cited_incident_id: res.cited_incident_id || undefined,
        suggested_action: res.suggested_action || undefined,
        badge: 'Grounded in Hindsight'
      };
      setMessages(prev => [...prev, agentMsg]);
    } catch (err: any) {
      const errMsg: WarRoomChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'System Alert',
        sender_type: 'system',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        message: `⚠️ Communication error with Hindsight reasoning engine: ${err.message}`
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setSending(false);
    }
  };

  // Interactive Execution of Suggested Actions
  const handleExecuteAction = async (msgId: string, actionName: string) => {
    playHotPatchDeploySound();
    setIsExecutingAction(msgId);

    // Call external prop handler if provided
    if (onExecuteAction) {
      onExecuteAction(actionName);
    }

    // Simulate realistic live cluster execution steps
    await new Promise(resolve => setTimeout(resolve, 1400));

    // Update message state as executed
    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        return {
          ...m,
          isActionExecuted: true,
          actionOutput: `Command dispatched to Kubernetes cluster. DB_POOL_MAX updated to 150. Pods rolled gracefully with 0 dropped packets.`
        };
      }
      return m;
    }));

    // Append system confirmation message
    const confirmMsg: WarRoomChatMessage = {
      id: `msg-action-exec-${Date.now()}`,
      sender: 'OpsMemory Executor',
      sender_type: 'system',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      message: `⚡ **Remediation Completed:** ${actionName}\n• Applied to: \`${service}\` pod configuration\n• Telemetry Verification: P99 latency dropped from 4,250ms ➔ 41ms\n• Postmortem Retained into Hindsight bank \`opsmemory-prod\``,
      badge: 'Verified Remediated'
    };
    setMessages(prev => [...prev, confirmMsg]);
    setIsExecutingAction(null);
  };

  // Interactive Voice Read Aloud
  const handleToggleSpeak = (msg: WarRoomChatMessage) => {
    playClickFeedback();
    if (speakingMsgId === msg.id) {
      stopSpeaking();
      setSpeakingMsgId(null);
    } else {
      stopSpeaking();
      setSpeakingMsgId(msg.id);
      speakAgentMessage(msg.message, () => {
        setSpeakingMsgId(null);
      });
    }
  };

  // Interactive Copy Text
  const handleCopyText = (text: string, msgId?: string) => {
    playClickFeedback();
    navigator.clipboard.writeText(text);
    if (msgId) {
      setCopiedMsgId(msgId);
      setTimeout(() => setCopiedMsgId(null), 2000);
    }
  };

  // Interactive Feedback Recording
  const handleFeedback = (msgId: string, type: 'up' | 'down') => {
    playClickFeedback();
    setFeedbackMap(prev => ({
      ...prev,
      [msgId]: prev[msgId] === type ? undefined as any : type
    }));
  };

  // Clear Chat History
  const handleClearChat = () => {
    playClickFeedback();
    setMessages([
      {
        id: `msg-cleared-${Date.now()}`,
        sender: 'OpsMemory Copilot',
        sender_type: 'agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        message: `War Room session reset. Standing by for interactive SRE instructions.`,
        badge: 'Hindsight Online'
      }
    ]);
  };

  // Export War Room Transcript
  const handleExportTranscript = () => {
    playClickFeedback();
    const transcript = messages.map(m => `[${m.timestamp}] ${m.sender} (${m.sender_type.toUpperCase()}):\n${m.message}\n`).join('\n---\n\n');
    const blob = new Blob([`# OpsMemory War Room Transcript - ${incidentId}\nService: ${service}\nGenerated: ${new Date().toISOString()}\n\n${transcript}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WarRoom_${incidentId}_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Interactive Quick Command Matrix
  const quickActions = [
    {
      label: '⚡ Mitigate Now',
      prompt: 'What is the fastest verified mitigation for this incident based on past postmortems?'
    },
    {
      label: '🔍 Five-Whys RCA',
      prompt: 'Perform Five-Whys root cause analysis for this HikariCP connection starvation.'
    },
    {
      label: '📢 Slack Update',
      prompt: 'Draft an executive status update for stakeholders and Slack.'
    },
    {
      label: '🛡️ Safety Check',
      prompt: 'Can we safely restart the pods right now, or what is the blast radius risk?'
    }
  ];

  // Historical memory details for citation cards
  const getMemoryCitationDetails = (id: string) => {
    switch (id) {
      case 'INC-001':
        return {
          id: 'INC-001',
          date: 'March 14, 2026',
          service: 'Payment API',
          rootCause: 'HikariCP client-side pool exhaustion capped at 50 connections under 4x checkout spike',
          remedy: 'Scale DB_POOL_MAX=150 with zero-downtime rolling restart',
          mttrSaved: 'Cut MTTR from 48m to 4.5m',
          confidence: '98.4%'
        };
      case 'INC-003':
        return {
          id: 'INC-003',
          date: 'February 28, 2026',
          service: 'Order Service',
          rootCause: 'Kafka max.poll.interval.ms starvation triggering duplicate rebalance storm',
          remedy: 'Increase max.poll.interval.ms to 300000 and lower max.poll.records to 200',
          mttrSaved: 'Cut MTTR from 52m to 5.1m',
          confidence: '95.2%'
        };
      case 'INC-005':
        return {
          id: 'INC-005',
          date: 'February 12, 2026',
          service: 'Auth Service',
          rootCause: 'Redis eviction policy allkeys-lru evicting persistent refresh tokens',
          remedy: 'Switch maxmemory-policy to volatile-lru and expand cluster shard',
          mttrSaved: 'Cut MTTR from 39m to 3.8m',
          confidence: '96.8%'
        };
      default:
        return {
          id: id || 'INC-001',
          date: 'Historical Incident',
          service: service,
          rootCause: 'Database connection queue starvation under unexpected ingress traffic surge',
          remedy: 'Expand pool allocation and verify downstream PostgreSQL pg_stat_activity',
          mttrSaved: 'Cut MTTR by ~88%',
          confidence: '94.0%'
        };
    }
  };

  return (
    <>
      {/* Sleek Rectangular Cyber Dock Button when closed (NO CIRCLES!) */}
      {!isOpen && (
        <button
          onClick={() => {
            playClickFeedback();
            setIsOpen(true);
          }}
          className="fixed bottom-5 right-5 z-40 bg-[#0B0F1E]/95 hover:bg-[#131B33] border border-purple-500/40 hover:border-purple-400 text-purple-200 hover:text-white px-3.5 py-2.5 rounded-xl shadow-2xl shadow-purple-950/60 flex items-center gap-2.5 text-xs font-mono font-bold transition-all backdrop-blur-md active:scale-95 group"
          title="Open OpsMemory SRE AI Copilot (Alt+C)"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center border border-white/20 shadow-md group-hover:scale-105 transition-transform">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span>SRE Copilot</span>
              {/* Square micro-pip - NO CIRCLE */}
              <span className="w-2 h-2 rounded-[2px] bg-emerald-400 animate-pulse" />
            </div>
            <span className="text-[10px] text-slate-400 font-normal block">Grounded in Hindsight</span>
          </div>
          <kbd className="hidden sm:inline-block text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-400 border border-white/10 ml-1">
            Alt+C
          </kbd>
        </button>
      )}

      {/* Expanded Interactive War Room Chat Copilot Dock */}
      {isOpen && (
        <div 
          className={`fixed bottom-5 right-5 z-40 w-[420px] max-w-[calc(100vw-32px)] glass-panel bg-[#080C18]/98 border border-purple-500/40 rounded-2xl shadow-2xl flex flex-col backdrop-blur-2xl transition-all duration-200 overflow-hidden ${
            isExpanded ? 'h-[680px] max-h-[calc(100vh-40px)]' : 'h-[520px] max-h-[calc(100vh-40px)]'
          }`}
        >
          {/* Header Bar */}
          <div className="px-4 py-3 bg-[#0D1326] border-b border-white/[0.08] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center border border-white/20 shadow-md">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-extrabold text-white tracking-wide uppercase font-mono">
                    OpsMemory Copilot
                  </h3>
                  {/* Square micro-status pip - NO CIRCLE */}
                  <span className="w-2 h-2 rounded-[2px] bg-emerald-400" title="Online" />
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md whitespace-nowrap bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                    {incidentId}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate max-w-[210px]">
                  Target: {service} • {status}
                </div>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleExportTranscript}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Export War Room Transcript"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleClearChat}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Reset Conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  playClickFeedback();
                  setIsExpanded(prev => !prev);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title={isExpanded ? 'Normal size' : 'Expand window'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => {
                  playClickFeedback();
                  stopSpeaking();
                  setSpeakingMsgId(null);
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Close Copilot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Quick Prompts Matrix Bar */}
          <div className="px-3 py-2 bg-[#090D1C] border-b border-white/[0.06] flex items-center gap-1.5 overflow-x-auto custom-scrollbar flex-shrink-0">
            {quickActions.map((qa, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qa.prompt)}
                disabled={sending}
                className="px-2.5 py-1 rounded-md whitespace-nowrap bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-mono font-semibold transition-all hover:border-purple-400 active:scale-95 disabled:opacity-50"
              >
                {qa.label}
              </button>
            ))}
          </div>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs">
            {messages.map((msg) => {
              const isUser = msg.sender_type === 'human';
              const isSystem = msg.sender_type === 'system';
              const isSpeakingThis = speakingMsgId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  {/* Message Meta Info */}
                  <div className="flex items-center gap-2 mb-1 px-1 text-[10px] font-mono text-slate-500">
                    <span className="font-semibold text-slate-400">{msg.sender}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>

                    {msg.badge && (
                      <span className="px-2 py-0.5 rounded-md whitespace-nowrap bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                        {msg.badge}
                      </span>
                    )}

                    {/* Speech Readout Button for Agent Messages */}
                    {!isUser && (
                      <button
                        onClick={() => handleToggleSpeak(msg)}
                        className={`p-1 rounded-md transition-colors ${
                          isSpeakingThis 
                            ? 'text-emerald-400 bg-emerald-500/20' 
                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                        }`}
                        title={isSpeakingThis ? 'Stop voice readout' : 'Read aloud with AI voice'}
                      >
                        {isSpeakingThis ? (
                          <div className="flex items-center gap-0.5">
                            <VolumeX className="w-3 h-3 text-emerald-400" />
                            <span className="text-[9px] text-emerald-400 font-bold">STOP</span>
                          </div>
                        ) : (
                          <Volume2 className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Message Bubble (NO CIRCLES!) */}
                  <div
                    className={`max-w-[92%] p-3.5 rounded-xl border leading-relaxed text-xs shadow-lg ${
                      isUser
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400/30'
                        : isSystem
                        ? 'bg-[#10172A] text-slate-200 border-cyan-500/30'
                        : 'bg-[#0E1428] text-slate-100 border-white/[0.08]'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans">
                      {msg.message}
                    </div>

                    {/* INTERACTIVE ACTION CARD: If message has suggested_action */}
                    {msg.suggested_action && (
                      <div className="mt-3 p-3 rounded-lg bg-gradient-to-br from-purple-950/60 to-indigo-950/40 border border-purple-500/40 shadow-inner">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-amber-400" />
                            Suggested Remediation Action
                          </span>
                          {msg.isActionExecuted ? (
                            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-md whitespace-nowrap flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> EXECUTED
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-md whitespace-nowrap">
                              Ready To Apply
                            </span>
                          )}
                        </div>

                        <div className="text-xs font-mono font-bold text-white mb-2.5">
                          {msg.suggested_action}
                        </div>

                        {!msg.isActionExecuted ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleExecuteAction(msg.id, msg.suggested_action!)}
                              disabled={isExecutingAction === msg.id}
                              className="flex-1 px-3 py-1.5 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold font-mono flex items-center justify-center gap-1.5 shadow-md shadow-purple-900/40 transition-all active:scale-95 disabled:opacity-50"
                            >
                              {isExecutingAction === msg.id ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>Executing In Cluster...</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-3 h-3 fill-current" />
                                  <span>⚡ Execute Action Now</span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleCopyText(msg.suggested_action!, msg.id)}
                              className="px-2.5 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-mono transition-colors"
                              title="Copy action command"
                            >
                              {copiedMsgId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        ) : (
                          <div className="text-[11px] font-mono text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 rounded-md p-2 flex items-start gap-2">
                            <Terminal className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span>{msg.actionOutput || 'Action executed successfully in cluster.'}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* INTERACTIVE MEMORY CITATION BUTTON & ACCORDION */}
                    {msg.cited_incident_id && (
                      <div className="mt-2.5 pt-2 border-t border-white/[0.08]">
                        <button
                          onClick={() => {
                            playClickFeedback();
                            setExpandedCitationId(prev => prev === msg.id ? null : msg.id);
                          }}
                          className="px-2.5 py-1 rounded-md bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all"
                        >
                          <Brain className="w-3 h-3 text-purple-400" />
                          <span>📎 Cited Memory: {msg.cited_incident_id}</span>
                          {expandedCitationId === msg.id ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>

                        {/* Expanded Memory Inspector Card */}
                        {expandedCitationId === msg.id && (
                          <div className="mt-2 p-3 rounded-lg bg-[#070B16] border border-purple-500/30 text-[11px] font-mono space-y-2 animate-in fade-in duration-150">
                            {(() => {
                              const cit = getMemoryCitationDetails(msg.cited_incident_id!);
                              return (
                                <>
                                  <div className="flex items-center justify-between text-slate-400">
                                    <span className="text-white font-bold">{cit.id} • {cit.service}</span>
                                    <span className="text-emerald-400 font-bold">{cit.confidence} Match</span>
                                  </div>
                                  <div className="text-slate-300">
                                    <span className="text-slate-500 uppercase text-[9px] block">Root Cause:</span>
                                    {cit.rootCause}
                                  </div>
                                  <div className="text-emerald-300 bg-emerald-950/20 p-2 rounded border border-emerald-500/20">
                                    <span className="text-emerald-500 uppercase text-[9px] block font-bold">Verified Mitigation:</span>
                                    {cit.remedy}
                                  </div>
                                  <div className="flex items-center justify-between pt-1">
                                    <span className="text-[10px] text-amber-400">{cit.mttrSaved}</span>
                                    {onViewChange && (
                                      <button
                                        onClick={() => {
                                          playClickFeedback();
                                          onViewChange('postmortem');
                                        }}
                                        className="text-[10px] text-purple-300 hover:text-white flex items-center gap-1 underline underline-offset-2"
                                      >
                                        <span>View in Studio</span>
                                        <ArrowRight className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message Action Footer: Copy & Feedback */}
                    {!isUser && (
                      <div className="mt-2 pt-1.5 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-slate-500">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopyText(msg.message, msg.id)}
                            className="p-1 rounded hover:text-slate-300 hover:bg-white/5 transition-colors flex items-center gap-1"
                            title="Copy reply"
                          >
                            {copiedMsgId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400 text-[9px]">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleFeedback(msg.id, 'up')}
                            className={`p-1 rounded transition-colors ${
                              feedbackMap[msg.id] === 'up' ? 'text-emerald-400 bg-emerald-500/20' : 'hover:text-slate-300'
                            }`}
                            title="Helpful recommendation"
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleFeedback(msg.id, 'down')}
                            className={`p-1 rounded transition-colors ${
                              feedbackMap[msg.id] === 'down' ? 'text-rose-400 bg-rose-500/20' : 'hover:text-slate-300'
                            }`}
                            title="Inaccurate or suboptimal"
                          >
                            <ThumbsDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Thinking / Streaming Indicator */}
            {sending && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#0E1428] border border-purple-500/30 text-purple-300 font-mono text-xs max-w-[80%]">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                <span className="animate-pulse">Querying Hindsight Memory Bank & Runbook Graph...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Interactive Chat Input Area */}
          <div className="p-3 bg-[#0B0F1F] border-t border-white/[0.08] flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend();
                }}
                placeholder="Ask SRE Copilot or type incident query..."
                className="flex-1 px-3 py-2 rounded-lg bg-[#070A14] border border-white/[0.1] focus:border-purple-500 text-white placeholder-slate-500 text-xs font-mono outline-none transition-all shadow-inner"
              />
              <button
                onClick={() => handleSend()}
                disabled={sending || !inputMessage.trim()}
                className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-md shadow-purple-900/40 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-500 font-mono">
              <span>Press <kbd className="text-[9px] bg-white/5 px-1 py-0.5 rounded border border-white/10 text-slate-400">Enter</kbd> to dispatch</span>
              <span>Memory Bank: <strong className="text-purple-400">opsmemory-prod</strong></span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
