'use client';

import { useState, useEffect, useCallback } from 'react';
import { FilterState, ParsedData, ApiKeys } from '@/types';
import { generateSampleData } from '@/lib/sampleData';
import SettingsDrawer, { loadApiKeys } from '@/components/SettingsDrawer';
import FilterPanel from '@/components/FilterPanel';
import LoadingOverlay from '@/components/LoadingOverlay';
import Block1VerticalSeries from '@/components/Block1VerticalSeries';
import Block2HorizontalContent from '@/components/Block2HorizontalContent';
import Block3InternalDatabase from '@/components/Block3InternalDatabase';
import Block4AISummary from '@/components/Block4AISummary';

const DEFAULT_FILTERS: FilterState = {
  genres: [],
  setting: '',
  customSetting: '',
  customKeywords: '',
};

function useLoadingSteps(active: boolean) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!active) { setStep(0); return; }
    const id = setInterval(() => setStep((s) => s + 1), 700);
    return () => clearInterval(id);
  }, [active]);

  return step;
}

export default function HomePage() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    googleDriveLink: '',
    socialPetaKey: '',
    apifyKey: '',
    buzzSumoKey: '',
    brandwatchKey: '',
    tiktokKey: '',
  });
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [loading, setLoading] = useState(false);

  const loadingStep = useLoadingSteps(loading);

  // Load keys from localStorage on mount
  useEffect(() => {
    setApiKeys(loadApiKeys());
  }, []);

  const handleParse = useCallback(async () => {
    setLoading(true);
    // Simulate realistic parse delay (3.5s)
    await new Promise((r) => setTimeout(r, 3500));
    const data = generateSampleData(filters);
    setParsedData(data);
    setLoading(false);
  }, [filters]);

  const connectedSources = Object.values(apiKeys).filter(Boolean).length;

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 bg-[#0a0a1a]/90 backdrop-blur-md border-b border-purple-900/30">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center text-base shadow-[0_0_16px_rgba(139,92,246,0.4)]">
              📡
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight">Creative Radar</span>
              <span className="hidden sm:inline text-xs text-purple-400/70 ml-2">
                Vertical Series Intelligence
              </span>
            </div>
          </div>

          {/* Status bar */}
          <div className="hidden md:flex items-center gap-2 text-xs text-purple-400/60">
            {parsedData && (
              <>
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span>Data parsed</span>
                <span className="mx-2 text-purple-800">|</span>
              </>
            )}
            <span
              className={`${connectedSources > 0 ? 'text-green-400' : 'text-purple-400/40'}`}
            >
              {connectedSources} / 6 sources
            </span>
            {connectedSources > 0 && <span className="text-purple-400/60">connected</span>}
          </div>

          {/* Settings button */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-purple-800/40 bg-purple-950/30 hover:bg-purple-900/30 text-purple-300 hover:text-white transition-all duration-150 text-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
            <span className="hidden sm:inline">API Keys</span>
            {connectedSources > 0 && (
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">
                {connectedSources}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Filter panel */}
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          onParse={handleParse}
          loading={loading}
          hasData={Boolean(parsedData)}
        />

        {/* Empty state */}
        {!parsedData && !loading && (
          <div className="text-center py-20 animate-fade-in">
            <div className="text-6xl mb-6">🎬</div>
            <h3 className="text-xl font-bold text-white mb-3">
              Select your niche filters and parse data
            </h3>
            <p className="text-purple-400/70 text-sm max-w-md mx-auto mb-8">
              Choose genres, set a scene, add custom keywords, then click{' '}
              <strong className="text-purple-300">Parse Data</strong> to populate the four
              intelligence blocks below.
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-sm text-purple-400/50">
              {['📱 Vertical Series Analytics', '🌐 Horizontal Content', '🗄️ Internal Database', '🧠 AI Summary'].map(
                (label) => (
                  <span key={label} className="px-3 py-1.5 rounded-full border border-purple-900/30">
                    {label}
                  </span>
                )
              )}
            </div>
          </div>
        )}

        {/* Data workspace */}
        {parsedData && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-fade-in">
            <Block1VerticalSeries data={parsedData.block1} />
            <Block2HorizontalContent data={parsedData.block2} />
            <Block3InternalDatabase
              data={parsedData.block3}
              googleDriveLink={apiKeys.googleDriveLink || undefined}
            />
            <Block4AISummary filters={filters} data={parsedData} />
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-purple-900/20 py-4 mt-6">
        <div className="max-w-[1600px] mx-auto px-6 flex items-center justify-between text-xs text-purple-400/40">
          <span>Creative Radar · Vertical Series Intelligence Platform</span>
          <span>Simulated data · BYOAK architecture</span>
        </div>
      </footer>

      {/* ── Overlays ── */}
      {loading && <LoadingOverlay step={loadingStep} />}

      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={(keys) => { setApiKeys(keys); setSettingsOpen(false); }}
      />
    </div>
  );
}
