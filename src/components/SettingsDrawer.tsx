'use client';

import { useState, useEffect } from 'react';
import { ApiKeys } from '@/types';

const STORAGE_KEY = 'cr_api_keys';

const FIELDS: { key: keyof ApiKeys; label: string; placeholder: string; isUrl?: boolean }[] = [
  { key: 'googleDriveLink', label: 'Google Drive Link', placeholder: 'https://docs.google.com/spreadsheets/d/...', isUrl: true },
  { key: 'socialPetaKey', label: 'SocialPeta API Key', placeholder: 'sp-xxxxxxxxxxxxxxxx' },
  { key: 'apifyKey', label: 'Apify API Key', placeholder: 'apify_api_xxxxxxxxxxxxxxxx' },
  { key: 'buzzSumoKey', label: 'BuzzSumo API Key', placeholder: 'bz-xxxxxxxxxxxxxxxx' },
  { key: 'brandwatchKey', label: 'Brandwatch API Key', placeholder: 'bw-xxxxxxxxxxxxxxxx' },
  { key: 'tiktokKey', label: 'TikTok Trend Discovery API Key', placeholder: 'tt-xxxxxxxxxxxxxxxx' },
];

function emptyKeys(): ApiKeys {
  return { googleDriveLink: '', socialPetaKey: '', apifyKey: '', buzzSumoKey: '', brandwatchKey: '', tiktokKey: '' };
}

export function loadApiKeys(): ApiKeys {
  if (typeof window === 'undefined') return emptyKeys();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...emptyKeys(), ...JSON.parse(raw) } : emptyKeys();
  } catch { return emptyKeys(); }
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (keys: ApiKeys) => void;
}

export default function SettingsDrawer({ open, onClose, onSave }: Props) {
  const [keys, setKeys] = useState<ApiKeys>(emptyKeys());
  const [saved, setSaved] = useState(false);
  const [visible, setVisible] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) setKeys(loadApiKeys());
  }, [open]);

  function handleChange(key: keyof ApiKeys, value: string) {
    setKeys(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
    setSaved(true);
    setTimeout(() => { setSaved(false); onSave(keys); }, 800);
  }

  function handleClear() {
    const empty = emptyKeys();
    setKeys(empty);
    localStorage.removeItem(STORAGE_KEY);
  }

  function toggleVisible(key: string) {
    setVisible(prev => ({ ...prev, [key]: !prev[key] }));
  }

  const connected = Object.values(keys).filter(v => v.trim().length > 0).length;
  const total = FIELDS.length;

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-[#0d0d1f] border-l border-purple-900/40 z-50 flex flex-col transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-purple-900/30">
          <div>
            <h2 className="text-base font-semibold text-white">Data Sources & API Keys</h2>
            <p className="text-xs text-purple-400/50 mt-0.5">Stored locally in your browser only</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
            ✕
          </button>
        </div>

        {/* Status bar */}
        <div className={`px-6 py-2.5 text-xs font-medium border-b border-purple-900/20 ${
          connected === 0 ? 'text-purple-400/40' :
          connected === total ? 'text-green-400' : 'text-amber-400'
        }`}>
          {connected === 0 && '○  No sources connected — AI knowledge only, no links'}
          {connected > 0 && connected < total && `◑  ${connected} of ${total} sources connected — partial live data`}
          {connected === total && `● All ${total} sources connected — full live data`}
        </div>

        {/* Fields */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {FIELDS.map(({ key, label, placeholder, isUrl }) => {
            const value = keys[key];
            const isSet = value.trim().length > 0;
            const show = visible[key] || isUrl;
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-purple-300/70 uppercase tracking-wider">{label}</label>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${isSet ? 'bg-green-500/15 text-green-400' : 'bg-white/5 text-white/25'}`}>
                    {isSet ? '● Connected' : '○ Not set'}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={e => handleChange(key, e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-purple-950/30 border border-purple-800/40 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-purple-500/60 transition-colors pr-10"
                  />
                  {!isUrl && (
                    <button type="button" onClick={() => toggleVisible(key)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors text-sm">
                      {show ? '🙈' : '👁'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          <div className="bg-purple-950/20 border border-purple-900/30 rounded-lg p-4 text-xs text-purple-400/50 leading-relaxed">
            API keys are saved in your browser's local storage and sent to the server only during a research query. They are never stored on our servers. When a key is connected, that source returns real links. When not connected, no links are shown.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-purple-900/30 flex gap-3">
          <button onClick={handleClear} className="px-4 py-2 rounded-lg border border-purple-800/40 text-sm text-purple-400/60 hover:text-white hover:border-purple-600/40 transition-colors">
            Clear all
          </button>
          <button onClick={handleSave} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${saved ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-purple-600 hover:bg-purple-500 text-white'}`}>
            {saved ? '✓ Saved' : 'Save keys'}
          </button>
        </div>
      </div>
    </>
  );
}
