'use client';

import { useState, useEffect, useCallback } from 'react';
import { ApiKeys } from '@/types';

const STORAGE_KEY = 'creative_radar_api_keys';

const DEFAULT_KEYS: ApiKeys = {
  googleDriveLink: '',
  socialPetaKey: '',
  apifyKey: '',
  buzzSumoKey: '',
  brandwatchKey: '',
  tiktokKey: '',
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (keys: ApiKeys) => void;
}

const FIELD_CONFIG = [
  {
    key: 'googleDriveLink' as keyof ApiKeys,
    label: 'Google Drive Link',
    placeholder: 'https://docs.google.com/spreadsheets/d/...',
    icon: '📊',
    type: 'url',
    desc: 'Link to your creative performance spreadsheet',
  },
  {
    key: 'socialPetaKey' as keyof ApiKeys,
    label: 'SocialPeta API Key',
    placeholder: 'sp_live_xxxxxxxxxxxx',
    icon: '📡',
    type: 'password',
    desc: 'For competitor ad creative intelligence',
  },
  {
    key: 'apifyKey' as keyof ApiKeys,
    label: 'Apify API Key',
    placeholder: 'apify_api_xxxxxxxxxxxx',
    icon: '🕷️',
    type: 'password',
    desc: 'For TikTok & web scraping automation',
  },
  {
    key: 'buzzSumoKey' as keyof ApiKeys,
    label: 'BuzzSumo API Key',
    placeholder: 'bsm_xxxxxxxxxxxx',
    icon: '📈',
    type: 'password',
    desc: 'For viral content & trend discovery',
  },
  {
    key: 'brandwatchKey' as keyof ApiKeys,
    label: 'Brandwatch API Key',
    placeholder: 'bw_xxxxxxxxxxxx',
    icon: '👁️',
    type: 'password',
    desc: 'For social listening & sentiment analysis',
  },
  {
    key: 'tiktokKey' as keyof ApiKeys,
    label: 'TikTok Trend Discovery API Key',
    placeholder: 'tt_xxxxxxxxxxxx',
    icon: '🎵',
    type: 'password',
    desc: 'For TikTok trending audio & hashtag analysis',
  },
];

export default function SettingsDrawer({ open, onClose, onSave }: Props) {
  const [keys, setKeys] = useState<ApiKeys>(DEFAULT_KEYS);
  const [saved, setSaved] = useState(false);
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setKeys(JSON.parse(stored));
    } catch {}
  }, []);

  const handleSave = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
    } catch {}
    onSave(keys);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [keys, onSave]);

  const connectedCount = Object.values(keys).filter(Boolean).length;

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0f0f23] border-l border-purple-900/40 z-50 flex flex-col animate-slide-in-right shadow-2xl shadow-purple-900/20">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-purple-900/30">
          <div>
            <h2 className="text-lg font-bold text-white">Data Source Keys</h2>
            <p className="text-xs text-purple-400 mt-0.5">
              {connectedCount} / {FIELD_CONFIG.length} sources connected
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-purple-900/30 text-purple-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Connection bar */}
        <div className="px-6 py-3 border-b border-purple-900/20">
          <div className="flex gap-1">
            {FIELD_CONFIG.map((f) => (
              <div
                key={f.key}
                className={`flex-1 h-1.5 rounded-full transition-colors duration-300 ${
                  keys[f.key] ? 'bg-purple-500' : 'bg-purple-900/40'
                }`}
                title={f.label}
              />
            ))}
          </div>
        </div>

        {/* Fields */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {FIELD_CONFIG.map((field) => {
            const isConnected = Boolean(keys[field.key]);
            const isVisible = showValues[field.key];
            return (
              <div key={field.key}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span>{field.icon}</span>
                  <label className="text-sm font-medium text-purple-200">{field.label}</label>
                  {isConnected && (
                    <span className="ml-auto text-xs text-green-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                      Connected
                    </span>
                  )}
                </div>
                <p className="text-xs text-purple-400/70 mb-2">{field.desc}</p>
                <div className="relative">
                  <input
                    type={field.type === 'password' && !isVisible ? 'password' : 'text'}
                    value={keys[field.key]}
                    onChange={(e) =>
                      setKeys((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    placeholder={field.placeholder}
                    className="input-field pr-10"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  {field.type === 'password' && (
                    <button
                      type="button"
                      onClick={() =>
                        setShowValues((prev) => ({ ...prev, [field.key]: !prev[field.key] }))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-300 text-xs"
                    >
                      {isVisible ? 'Hide' : 'Show'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Info box */}
          <div className="rounded-xl bg-purple-950/40 border border-purple-900/40 p-4 mt-2">
            <p className="text-xs text-purple-300/70 leading-relaxed">
              Keys are stored only in your browser's localStorage. They are never sent to any server
              except the respective platform APIs during parsing.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-purple-900/30 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 text-center">
            Cancel
          </button>
          <button onClick={handleSave} className="btn-primary flex-1 text-center">
            {saved ? '✓ Saved!' : 'Save Keys'}
          </button>
        </div>
      </aside>
    </>
  );
}

export function loadApiKeys(): ApiKeys {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return DEFAULT_KEYS;
}
