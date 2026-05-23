'use client';

import { FilterState } from '@/types';

const GENRES = [
  'Romance', 'Revenge', 'Billionaire', 'Enemies-to-Lovers', 'Thriller',
  'Found Family', 'Forbidden Love', 'Alpha Male', 'Second Chance', 'Dark Romance',
  'Fake Dating', 'CEO x Employee', 'Arranged Marriage', 'Obsession',
  'Redemption Arc', 'Betrayal', 'Kidnapping', 'Twin Flame',
];

const SETTINGS = [
  'Mafia', 'Historical', 'Sports', 'Fantasy', 'Office',
  'Vampire', 'College', 'Royal Court', 'Military', 'Werewolf', 'Billionaire Mansion',
];

interface Props {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onParse: () => void;
  loading: boolean;
  hasData: boolean;
}

export default function FilterPanel({ filters, onChange, onParse, loading, hasData }: Props) {
  const toggleGenre = (genre: string) => {
    const next = filters.genres.includes(genre)
      ? filters.genres.filter((g) => g !== genre)
      : [...filters.genres, genre];
    onChange({ ...filters, genres: next });
  };

  const activeCount = filters.genres.length;
  const effectiveSetting = filters.customSetting || filters.setting;

  return (
    <section className="card">
      <div className="card-header">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-600/30 flex items-center justify-center text-sm">🎯</div>
          <div>
            <h2 className="font-semibold text-white text-sm">Niche Filter Panel</h2>
            <p className="text-xs text-purple-400/80">
              {activeCount > 0 ? `${activeCount} genre${activeCount > 1 ? 's' : ''} selected` : 'Select genres to target'}{effectiveSetting ? ` · ${effectiveSetting}` : ''}
            </p>
          </div>
        </div>
        <button
          onClick={onParse}
          disabled={loading}
          className={`btn-primary flex items-center gap-2 text-sm ${loading ? 'opacity-70 cursor-wait' : ''}`}
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" strokeLinecap="round" />
              </svg>
              Parsing…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z" clipRule="evenodd" />
              </svg>
              {hasData ? 'Re-Parse Data' : 'Parse Data'}
            </>
          )}
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Genre chips */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
              Genre / Tropes
            </label>
            {activeCount > 0 && (
              <button
                onClick={() => onChange({ ...filters, genres: [] })}
                className="text-xs text-purple-500 hover:text-purple-300 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((genre) => (
              <button
                key={genre}
                onClick={() => toggleGenre(genre)}
                className={filters.genres.includes(genre) ? 'chip-active' : 'chip-inactive'}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Setting + Custom */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2">
              Setting
            </label>
            <select
              value={filters.setting}
              onChange={(e) => onChange({ ...filters, setting: e.target.value, customSetting: '' })}
              className="input-field"
              disabled={Boolean(filters.customSetting)}
            >
              <option value="">— Select setting —</option>
              {SETTINGS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2">
              Or type custom setting
            </label>
            <input
              type="text"
              value={filters.customSetting}
              onChange={(e) => onChange({ ...filters, customSetting: e.target.value })}
              placeholder="e.g. Space Opera, Pirate Ship…"
              className="input-field"
            />
          </div>
        </div>

        {/* Custom Keywords */}
        <div>
          <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2">
            Custom Search Keywords
          </label>
          <input
            type="text"
            value={filters.customKeywords}
            onChange={(e) => onChange({ ...filters, customKeywords: e.target.value })}
            placeholder="Enter search queries manually… e.g. 'billionaire CEO kidnap fake marriage rivals'"
            className="input-field"
          />
          {filters.customKeywords && (
            <p className="text-xs text-purple-400/60 mt-1.5">
              Overrides default keyword logic for all blocks
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
