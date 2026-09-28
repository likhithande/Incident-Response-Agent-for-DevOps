import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { IncidentDetail } from './components/IncidentDetail';
import { AnalysisResult } from './components/AnalysisResult';
import { SideBySideComparison } from './components/SideBySideComparison';
import { HindsightMemoryPanel } from './components/HindsightMemoryPanel';
import { MemoryTimeline } from './components/MemoryTimeline';
import { ResolutionModal } from './components/ResolutionModal';
import { SettingsModal } from './components/SettingsModal';
import { NewIncidentModal } from './components/NewIncidentModal';
import { BroadcastModal } from './components/BroadcastModal';
import { ChaosLabModal } from './components/ChaosLabModal';
import { TopologyView } from './components/TopologyView';
import { AnalyticsView } from './components/AnalyticsView';
import { NeuralGraphView } from './components/NeuralGraphView';
import { CanaryPilotView } from './components/CanaryPilotView';
import { HypothesisSandbox } from './components/HypothesisSandbox';
import { LiveWarRoomChat } from './components/LiveWarRoomChat';
import { CyberCommandHUD } from './components/CyberCommandHUD';
import { TimeTravelSimulator } from './components/TimeTravelSimulator';
import { GlobalCommandPalette } from './components/GlobalCommandPalette';
import { AutopilotCockpitModal } from './components/AutopilotCockpitModal';
import { InteractiveTerminalDrawer } from './components/InteractiveTerminalDrawer';
import { SwarmView } from './components/SwarmView';
import { SentinelRadarView } from './components/SentinelRadarView';
import { PostmortemStudioView } from './components/PostmortemStudioView';
import { 
  fetchIncidents, 
  fetchMemoryStatus, 
  analyzeIncident, 
  seedMemories, 
  fetchTimeline,
  recallMemoryDirect
} from './services/api';
import { 
  Incident, 
  IncidentAnalysisResponse, 
  MemoryStatusResponse, 
  TimelineEvent, 
  RetrievedMemoryItem,
  ActiveWorkspaceView 
} from './types';
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  Brain, 
  ShieldCheck, 
  Activity, 
  TrendingDown,
  Navigation,
  ArrowUp
} from 'lucide-react';
import { 
  setSoundMuted, 
  playSev1Alert, 
  playResolutionChime,
  playClickFeedback 
} from './services/audio';

export function App() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [analysisResponse, setAnalysisResponse] = useState<IncidentAnalysisResponse | null>(null);
  const [retrievedMemories, setRetrievedMemories] = useState<RetrievedMemoryItem[]>([]);
  const [memoryStatus, setMemoryStatus] = useState<MemoryStatusResponse | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);

  // Workspace View Mode
  const [currentView, setCurrentView] = useState<ActiveWorkspaceView>('war-room');

  // Audio Mute State
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Toggles and states
  const [withMemory, setWithMemory] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [statelessResponse, setStatelessResponse] = useState<IncidentAnalysisResponse | null>(null);
  const [isComparingLoading, setIsComparingLoading] = useState<boolean>(false);

  // Futuristic Feature Modals & Drawers
  const [isResolutionOpen, setIsResolutionOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isNewIncidentOpen, setIsNewIncidentOpen] = useState<boolean>(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState<boolean>(false);
  const [isChaosOpen, setIsChaosOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isAutopilotOpen, setIsAutopilotOpen] = useState<boolean>(false);
  const [isTimeTravelActive, setIsTimeTravelActive] = useState<boolean>(false);
  const [isTerminalDrawerOpen, setIsTerminalDrawerOpen] = useState<boolean>(false);

  // Notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadInitialData = useCallback(async () => {
    try {
      const [incs, memStatus, timeline] = await Promise.all([
        fetchIncidents().catch(() => []),
        fetchMemoryStatus().catch(() => null),
        fetchTimeline().catch(() => [])
      ]);

      setIncidents(incs);
      setMemoryStatus(memStatus);
      setTimelineEvents(timeline);

      if (incs.length > 0 && !selectedIncident) {
        setSelectedIncident(incs[0]);
      }
    } catch (err: any) {
      console.error('Error loading initial data:', err);
    }
  }, [selectedIncident]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Global Keyboard Shortcuts (Ctrl+K for Spotlight Command Palette, ` for Terminal Drawer)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === '`' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setIsTerminalDrawerOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectIncident = (incident: Incident) => {
    setSelectedIncident(incident);
    setAnalysisResponse(null);
    setIsCompareMode(false);
  };

  const handleAnalyze = async (useMemory: boolean) => {
    if (!selectedIncident) return;
    try {
      setIsAnalyzing(true);
      setWithMemory(useMemory);

      const res = await analyzeIncident(selectedIncident, useMemory);
      setAnalysisResponse(res);
      setRetrievedMemories(res.retrieved_memories);

      // Refresh timeline
      const updatedTimeline = await fetchTimeline().catch(() => []);
      setTimelineEvents(updatedTimeline);

      showToast(
        useMemory
          ? `Analysis complete. Recalled ${res.retrieved_memories.length} historical postmortems from Hindsight.`
          : 'Stateless analysis complete without historical memory.',
        'success'
      );
    } catch (err: any) {
      showToast(err.message || 'Analysis failed', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleToggleCompare = async () => {
    if (!selectedIncident) return;
    if (isCompareMode) {
      setIsCompareMode(false);
      return;
    }

    try {
      setIsCompareMode(true);
      setIsComparingLoading(true);

      const [stateless, withMem] = await Promise.all([
        analyzeIncident(selectedIncident, false),
        analyzeIncident(selectedIncident, true)
      ]);

      setStatelessResponse(stateless);
      setAnalysisResponse(withMem);
      setRetrievedMemories(withMem.retrieved_memories);

      const updatedTimeline = await fetchTimeline().catch(() => []);
      setTimelineEvents(updatedTimeline);
    } catch (err: any) {
      showToast(err.message || 'Comparison failed', 'error');
      setIsCompareMode(false);
    } finally {
      setIsComparingLoading(false);
    }
  };

  const handleSeed = async () => {
    try {
      setIsSeeding(true);
      const res = await seedMemories();
      playResolutionChime();
      showToast(res.message, 'success');

      const [incs, memStatus, timeline] = await Promise.all([
        fetchIncidents(),
        fetchMemoryStatus(),
        fetchTimeline()
      ]);
      setIncidents(incs);
      setMemoryStatus(memStatus);
      setTimelineEvents(timeline);
    } catch (err: any) {
      showToast(err.message || 'Seeding failed', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleTriggerDemo = () => {
    playSev1Alert();
    const demoIncident: Incident = {
      incident_id: 'INC-DEMO-PAY',
      service: 'Payment API',
      severity: 'CRITICAL',
      symptoms: [
        'HTTP 503 Service Unavailable',
        'High latency (>4000ms)',
        'Database connection timeout'
      ],
      error_logs: [
        'Timeout waiting for database connection from pool',
        'Connection pool exhausted (active=50, max=50)'
      ],
      status: 'ACTIVE'
    };

    setSelectedIncident(demoIncident);
    setAnalysisResponse(null);
    setIsCompareMode(false);
    setCurrentView('war-room');
    showToast('Loaded Critical Demo Scenario: Payment API 503 Outage. Click "Analyze Incident" to recall INC-001!', 'info');
  };

  const handleResolutionSaved = async (updatedIncident: Incident, memoryId?: string) => {
    playResolutionChime();
    setIncidents((prev) =>
      prev.map((inc) => (inc.incident_id === updatedIncident.incident_id ? updatedIncident : inc))
    );
    setSelectedIncident(updatedIncident);

    const [memStatus, timeline] = await Promise.all([
      fetchMemoryStatus().catch(() => null),
      fetchTimeline().catch(() => [])
    ]);
    setMemoryStatus(memStatus);
    setTimelineEvents(timeline);

    showToast(`Resolution retained into Hindsight! (Memory ID: ${memoryId || 'retained'})`, 'success');
  };

  const handleIncidentCreated = (newIncident: Incident) => {
    playSev1Alert();
    setIncidents((prev) => [newIncident, ...prev]);
    setSelectedIncident(newIncident);
    setAnalysisResponse(null);
    setCurrentView('war-room');
    showToast(`Incident ${newIncident.incident_id} created and registered.`, 'success');
  };

  const handleInjectChaos = (chaosIncident: Incident) => {
    setIncidents((prev) => [chaosIncident, ...prev]);
    setSelectedIncident(chaosIncident);
    setAnalysisResponse(null);
    setCurrentView('war-room');
    showToast(`Chaos Outage Injected: ${chaosIncident.service} (${chaosIncident.severity}). Ready for triage!`, 'error');
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    setSoundMuted(nextMute);
    showToast(nextMute ? 'Audio Alert Chimes Muted' : 'Audio Alert Chimes Enabled', 'info');
  };

  const handleRecallMemoryDirect = async (queryText: string) => {
    try {
      const results = await recallMemoryDirect(queryText);
      setRetrievedMemories(results);
      showToast(`Hindsight Memory recall: ${results.length} historical postmortems found.`, 'success');
      setCurrentView('war-room');
    } catch (err: any) {
      showToast(`Memory recall error: ${err.message}`, 'error');
    }
  };

  const scrollToSection = (id: string) => {
    playClickFeedback();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col font-sans selection:bg-purple-500/30 selection:text-white overflow-hidden bg-[#06090F] cyber-grid">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-2xl text-xs font-semibold backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
                : toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
                : 'bg-blue-950/90 border-blue-500/40 text-blue-200'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex-shrink-0">
        <Navbar
          memoryStatus={memoryStatus}
          onSeed={handleSeed}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onTriggerDemo={handleTriggerDemo}
          isSeeding={isSeeding}
          activeIncident={selectedIncident}
          currentView={currentView}
          onViewChange={(v) => setCurrentView(v)}
          onOpenBroadcast={() => setIsBroadcastOpen(true)}
          onOpenChaos={() => setIsChaosOpen(true)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />

        {/* Futuristic Cybernetic Telemetry Ribbon */}
        <CyberCommandHUD
          activeIncident={selectedIncident}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenAutopilot={() => setIsAutopilotOpen(true)}
          onToggleTimeTravel={() => setIsTimeTravelActive((prev) => !prev)}
          isTimeTravelActive={isTimeTravelActive}
          recalledCount={retrievedMemories.length}
        />
      </div>

      {/* Workspace Body */}
      {currentView === 'war-room' && (
        <div className="flex-1 min-h-0 w-full flex flex-col lg:flex-row overflow-hidden">
          {/* Left Sidebar: Incidents List */}
          <Sidebar
            incidents={incidents}
            selectedIncidentId={selectedIncident?.incident_id || ''}
            onSelectIncident={handleSelectIncident}
            onOpenNewModal={() => setIsNewIncidentOpen(true)}
          />

          {/* Center Panel: Smoothly Scrollable War Room */}
          <main 
            id="war-room-main-panel" 
            className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 lg:p-6 space-y-4 custom-scrollbar scroll-smooth"
          >
            {/* Quick Section Navigation Floating Pill Bar */}
            <div className="sticky top-0 z-20 bg-[#090D17]/90 backdrop-blur-md p-1.5 rounded-xl border border-white/[0.08] flex items-center justify-between gap-2 shadow-lg text-[11px] font-mono">
              <div className="flex items-center gap-1 overflow-x-auto">
                <span className="text-slate-500 px-1 text-[10px] hidden sm:inline">Jump:</span>
                <button 
                  onClick={() => scrollToSection('section-details')} 
                  className="px-2 py-0.5 rounded bg-white/5 hover:bg-purple-600/30 text-slate-300 hover:text-white transition-colors"
                >
                  #Details
                </button>
                <button 
                  onClick={() => scrollToSection('section-analysis')} 
                  className="px-2 py-0.5 rounded bg-white/5 hover:bg-purple-600/30 text-slate-300 hover:text-white transition-colors"
                >
                  #Analysis & Runbook
                </button>
                <button 
                  onClick={() => scrollToSection('section-hypotheses')} 
                  className="px-2 py-0.5 rounded bg-white/5 hover:bg-purple-600/30 text-slate-300 hover:text-white transition-colors"
                >
                  #Hypotheses
                </button>
                <button 
                  onClick={() => scrollToSection('section-timeline')} 
                  className="px-2 py-0.5 rounded bg-white/5 hover:bg-purple-600/30 text-slate-300 hover:text-white transition-colors"
                >
                  #Event Stream
                </button>
              </div>

              <button 
                onClick={() => scrollToSection('section-telemetry')} 
                className="px-2.5 py-0.5 rounded bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 transition-colors flex items-center gap-1 font-bold flex-shrink-0"
              >
                <ArrowUp className="w-3 h-3" />
                <span>Top</span>
              </button>
            </div>

            {/* Futuristic Time-Travel Simulator Bar (if toggled) */}
            {isTimeTravelActive && (
              <TimeTravelSimulator
                onClose={() => setIsTimeTravelActive(false)}
                onApplyStepToLive={(idx) => {
                  showToast(`Scrubbed to stage ${idx + 1}/5 in incident lifecycle.`, 'info');
                }}
              />
            )}

            {/* Quick Metrics Bar */}
            <div id="section-telemetry" className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="glass-card p-3 rounded-xl flex items-center gap-2.5 border border-white/[0.06]">
                <div className="w-7 h-7 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center border border-purple-500/25">
                  <Brain className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Memory Bank</span>
                  <span className="font-bold text-white font-mono text-[11px] truncate block max-w-[120px]">
                    {memoryStatus?.bank_id || 'ops-memory'}
                  </span>
                </div>
              </div>

              <div className="glass-card p-3 rounded-xl flex items-center gap-2.5 border border-white/[0.06]">
                <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/25">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Retained Postmortems</span>
                  <span className="font-bold text-white font-mono text-xs">
                    {memoryStatus?.retained_count || 10} Indexed
                  </span>
                </div>
              </div>

              <div className="glass-card p-3 rounded-xl flex items-center gap-2.5 border border-white/[0.06]">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/25">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Recall Status</span>
                  <span className="font-bold text-emerald-400 font-mono text-xs">
                    {retrievedMemories.length > 0 ? `${retrievedMemories.length} Recalled` : 'Ready'}
                  </span>
                </div>
              </div>

              <div className="glass-card p-3 rounded-xl flex items-center gap-2.5 border border-white/[0.06]">
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/25">
                  <TrendingDown className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Est. MTTR Impact</span>
                  <span className="font-bold text-amber-300 font-mono text-xs">
                    -71% Triage Time
                  </span>
                </div>
              </div>
            </div>

            {selectedIncident ? (
              <>
                {/* Incident Details Card with Live Telemetry */}
                <div id="section-details">
                  <IncidentDetail
                    incident={selectedIncident}
                    onChange={(updated) => setSelectedIncident(updated)}
                    onAnalyze={handleAnalyze}
                    onToggleCompare={handleToggleCompare}
                    isAnalyzing={isAnalyzing}
                    withMemory={withMemory}
                    isCompareMode={isCompareMode}
                  />
                </div>

                {/* Side-by-Side Comparison Mode */}
                {isCompareMode && (
                  <div id="section-analysis">
                    <SideBySideComparison
                      statelessResponse={statelessResponse}
                      memoryResponse={analysisResponse}
                      isLoading={isComparingLoading}
                      onClose={() => setIsCompareMode(false)}
                    />
                  </div>
                )}

                {/* Standard Analysis Result Card with Interactive SRE CLI Sandbox */}
                {!isCompareMode && analysisResponse && (
                  <div id="section-analysis">
                    <AnalysisResult
                      response={analysisResponse}
                      incident={selectedIncident}
                      onOpenResolve={() => setIsResolutionOpen(true)}
                      onOpenAutopilot={() => setIsAutopilotOpen(true)}
                    />
                  </div>
                )}

                {/* Counterfactual Root Cause Hypothesis Explorer */}
                <div id="section-hypotheses">
                  <HypothesisSandbox
                    incidentId={selectedIncident.incident_id}
                    service={selectedIncident.service}
                  />
                </div>

                {/* Memory Timeline Stream */}
                <div id="section-timeline">
                  <MemoryTimeline events={timelineEvents} />
                </div>
              </>
            ) : (
              <div className="py-24 text-center text-xs text-slate-500">
                Select an incident from the sidebar or click &quot;Demo Scenario&quot; to begin.
              </div>
            )}
          </main>

          {/* Right Panel: Hindsight Memory Explorer */}
          <aside className="w-full lg:w-96 flex-shrink-0 border-t lg:border-t-0 lg:border-l border-white/[0.07] p-4 bg-[#070A11]/80 h-full min-h-0 flex flex-col overflow-hidden">
            <HindsightMemoryPanel
              memories={retrievedMemories}
              cloudConnected={memoryStatus?.cloud_connected || false}
              bankId={memoryStatus?.bank_id || 'ops-memory'}
              isRecalling={isAnalyzing}
            />
          </aside>
        </div>
      )}

      {/* Topology & Blast Radius View */}
      {currentView === 'topology' && (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full custom-scrollbar">
          <TopologyView 
            activeService={selectedIncident?.service || 'Payment API'}
            onSelectService={(svcName) => {
              const matching = incidents.find(inc => inc.service.toLowerCase().includes(svcName.toLowerCase()));
              if (matching) {
                setSelectedIncident(matching);
                setCurrentView('war-room');
              }
            }}
          />
        </main>
      )}

      {/* Neural Memory Constellation Graph View */}
      {currentView === 'neural-graph' && (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full custom-scrollbar">
          <NeuralGraphView
            onSelectIncident={(incId) => {
              const matching = incidents.find(inc => inc.incident_id === incId);
              if (matching) {
                setSelectedIncident(matching);
                setCurrentView('war-room');
                showToast(`Loaded ${incId} into War Room`, 'info');
              }
            }}
          />
        </main>
      )}

      {/* Autonomous SRE Pilot & Canary Rollout View */}
      {currentView === 'canary-pilot' && (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full custom-scrollbar">
          <CanaryPilotView
            incidentId={selectedIncident?.incident_id || 'INC-001'}
            onResolved={() => {
              showToast('Canary fleet promoted to 100%! Incident resolved.', 'success');
              playResolutionChime();
            }}
          />
        </main>
      )}

      {/* SRE MTTR & Reliability Analytics View */}
      {currentView === 'analytics' && (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full custom-scrollbar">
          <AnalyticsView />
        </main>
      )}

      {/* Autonomous SRE Multi-Agent Swarm View */}
      {currentView === 'swarm' && (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full custom-scrollbar">
          <SwarmView
            incidentId={selectedIncident?.incident_id || 'INC-001'}
            service={selectedIncident?.service || 'Payment API'}
            onOpenAutopilot={() => setIsAutopilotOpen(true)}
          />
        </main>
      )}

      {/* Proactive AI Sentinel & Anomaly Radar View */}
      {currentView === 'sentinel' && (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full custom-scrollbar">
          <SentinelRadarView onShowToast={showToast} />
        </main>
      )}

      {/* Enterprise Postmortem & Five-Whys RCA Studio View */}
      {currentView === 'postmortem' && (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full custom-scrollbar">
          <PostmortemStudioView
            incidentId={selectedIncident?.incident_id || 'INC-001'}
            service={selectedIncident?.service || 'Payment API'}
            onShowToast={showToast}
          />
        </main>
      )}

      {/* Modals & Popups */}
      {selectedIncident && (
        <ResolutionModal
          isOpen={isResolutionOpen}
          onClose={() => setIsResolutionOpen(false)}
          incident={selectedIncident}
          onResolutionSaved={handleResolutionSaved}
        />
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onKeysUpdated={loadInitialData}
      />

      <NewIncidentModal
        isOpen={isNewIncidentOpen}
        onClose={() => setIsNewIncidentOpen(false)}
        onIncidentCreated={handleIncidentCreated}
      />

      {selectedIncident && (
        <BroadcastModal
          isOpen={isBroadcastOpen}
          onClose={() => setIsBroadcastOpen(false)}
          incident={selectedIncident}
          analysisResponse={analysisResponse}
        />
      )}

      <ChaosLabModal
        isOpen={isChaosOpen}
        onClose={() => setIsChaosOpen(false)}
        onInjectChaos={handleInjectChaos}
      />

      {/* Futuristic 1-Click Autonomous SRE Autopilot Cockpit */}
      {selectedIncident && (
        <AutopilotCockpitModal
          isOpen={isAutopilotOpen}
          onClose={() => setIsAutopilotOpen(false)}
          incident={selectedIncident}
          onIncidentResolved={handleResolutionSaved}
        />
      )}

      {/* Futuristic Spotlight Command Palette (Ctrl+K) */}
      <GlobalCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        incidents={incidents}
        onSelectIncident={handleSelectIncident}
        onViewChange={(v) => setCurrentView(v)}
        onTriggerAutopilot={() => setIsAutopilotOpen(true)}
        onTriggerDemo={handleTriggerDemo}
        onOpenChaos={() => setIsChaosOpen(true)}
        onOpenBroadcast={() => setIsBroadcastOpen(true)}
        onToggleMute={handleToggleMute}
        isMuted={isMuted}
        onRecallMemoryQuery={handleRecallMemoryDirect}
      />

      {/* Interactive SRE Terminal CLI Drawer */}
      <InteractiveTerminalDrawer
        isOpen={isTerminalDrawerOpen}
        onToggle={() => setIsTerminalDrawerOpen((prev) => !prev)}
        incidentId={selectedIncident?.incident_id}
        service={selectedIncident?.service}
      />

      {/* Floating War Room AI SRE On-Call Copilot */}
      <LiveWarRoomChat
        incidentId={selectedIncident?.incident_id || 'INC-001'}
        incidentTitle={selectedIncident?.root_cause || selectedIncident?.service}
        service={selectedIncident?.service}
        status={selectedIncident?.status}
        onExecuteAction={(act) => {
          showToast(`⚡ SRE Copilot executing: ${act}`, 'info');
        }}
        onViewChange={(v) => setCurrentView(v)}
      />
    </div>
  );
}

export default App;
