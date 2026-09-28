import React, { useState } from 'react';
import { X, Key, Check, Database, Cpu, ShieldAlert, Sparkles } from 'lucide-react';
import { updateConfigKeys } from '../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeysUpdated: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onKeysUpdated
}) => {
  const [hindsightKey, setHindsightKey] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [groqModel, setGroqModel] = useState('llama-3.3-70b-versatile');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      await updateConfigKeys({
        hindsight_api_key: hindsightKey || undefined,
        groq_api_key: groqKey || undefined,
        groq_model: groqModel || undefined
      });
      setStatusMessage('Configuration updated! Engine reloaded.');
      setTimeout(() => {
        onKeysUpdated();
        onClose();
        setStatusMessage(null);
      }, 1200);
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-ops-surface border border-ops-border rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-xs">
        {/* Header */}
        <div className="px-6 py-4 border-b border-ops-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Engine Configuration & Keys</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {statusMessage && (
            <div className="bg-blue-500/15 border border-blue-500/30 p-2.5 rounded-lg text-blue-300">
              {statusMessage}
            </div>
          )}

          <div className="bg-ops-card p-3 rounded-lg border border-ops-border space-y-1.5">
            <span className="font-bold text-white block">Environment Variable Support:</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              You can set your keys in <code className="bg-ops-dark px-1 py-0.5 rounded text-blue-300">backend/.env</code> or enter them here dynamically.
              If no cloud keys are provided, OpsMemory runs with its high-fidelity persistent memory engine for smooth local testing and judging.
            </p>
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">
              HINDSIGHT_API_KEY (Cloud Authentication)
            </label>
            <input
              type="password"
              placeholder="vct_live_..."
              value={hindsightKey}
              onChange={(e) => setHindsightKey(e.target.value)}
              className="w-full bg-ops-card border border-ops-border rounded-lg p-2 text-white font-mono focus:outline-none focus:border-blue-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Default Endpoint: https://api.hindsight.vectorize.io (Bank: ops-memory)
            </span>
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">
              GROQ_API_KEY (LLM Inference)
            </label>
            <input
              type="password"
              placeholder="gsk_..."
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
              className="w-full bg-ops-card border border-ops-border rounded-lg p-2 text-white font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">
              GROQ_MODEL
            </label>
            <input
              type="text"
              value={groqModel}
              onChange={(e) => setGroqModel(e.target.value)}
              className="w-full bg-ops-card border border-ops-border rounded-lg p-2 text-white font-mono focus:outline-none focus:border-blue-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              e.g. llama-3.3-70b-versatile or llama-3.1-8b-instant
            </span>
          </div>

          <div className="pt-3 border-t border-ops-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-ops-card hover:bg-ops-border text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md transition-all disabled:opacity-50"
            >
              {isUpdating ? 'Saving...' : 'Apply Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
