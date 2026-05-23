'use client';

import { useState } from 'react';
import { Series, Creative } from '@/types';
import { formatNumber, formatMoney } from '@/lib/sampleData';

interface Props {
  data: Series[];
}

function TierBadge({ tier }: { tier: Creative['performanceTier'] }) {
  if (tier === 'Golden Frame')
    return <span className="badge-golden">✦ Golden Frame</span>;
  if (tier === 'Silver Tier')
    return <span className="badge-silver">◆ Silver Tier</span>;
  return <span className="badge-standard">● Standard</span>;
}

function CreativeRow({ creative, idx }: { creative: Creative; idx: number }) {
  return (
    <tr className="table-row hover:bg-purple-900/10 transition-colors">
      <td className="table-cell text-purple-400/60 font-mono text-xs w-8">{idx + 1}</td>
      <td className="table-cell">
        <div className="text-xs text-white font-medium leading-snug">{creative.name}</div>
        <div className="text-xs text-purple-400/70 mt-0.5 line-clamp-1 italic">"{creative.hook}"</div>
        <a
          href={creative.activeLink}
          target="_blank"
          rel="noopener noreferrer"
          className="link-pill mt-1 inline-flex"
        >
          <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
          </svg>
          View on SocialPeta
        </a>
      </td>
      <td className="table-cell text-center">
        <TierBadge tier={creative.performanceTier} />
      </td>
      <td className="table-cell text-right">
        <div className="text-sm text-white font-mono">{formatNumber(creative.impressions)}</div>
        <div className="text-xs text-purple-400/60">{creative.ctr}% CTR</div>
      </td>
      <td className="table-cell text-right">
        <div className="text-xs text-slate-300 font-mono">{creative.activeDays}d</div>
        <div className="text-xs text-purple-400/60">{formatMoney(creative.spend)} spent</div>
      </td>
    </tr>
  );
}

function SeriesCard({ series, rank }: { series: Series; rank: number }) {
  const [expanded, setExpanded] = useState(rank === 0);

  return (
    <div className="border border-purple-900/30 rounded-xl overflow-hidden">
      {/* Series header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full px-5 py-4 flex items-center gap-4 hover:bg-purple-900/10 transition-colors text-left"
      >
        <div className="w-8 h-8 rounded-lg bg-purple-700/30 border border-purple-600/30 flex items-center justify-center text-sm font-bold text-purple-300 shrink-0">
          #{rank + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white text-sm truncate">{series.title}</div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
            <span className="text-xs text-purple-400">{formatNumber(series.totalImpressions)} impressions</span>
            <span className="text-xs text-purple-400/60">·</span>
            <span className="text-xs text-purple-400">{series.runDurationWeeks} wk run</span>
            <span className="text-xs text-purple-400/60">·</span>
            <span className="badge bg-purple-700/30 text-purple-300 border border-purple-600/30 text-xs">
              {series.genre}
            </span>
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-purple-400 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Creatives table */}
      {expanded && (
        <div className="border-t border-purple-900/30 overflow-x-auto animate-fade-in">
          <table className="w-full min-w-[540px]">
            <thead>
              <tr className="bg-purple-950/40">
                <th className="table-cell text-left text-xs text-purple-400/60 font-medium w-8">#</th>
                <th className="table-cell text-left text-xs text-purple-400/60 font-medium">Creative / Hook</th>
                <th className="table-cell text-center text-xs text-purple-400/60 font-medium">Tier</th>
                <th className="table-cell text-right text-xs text-purple-400/60 font-medium">Impressions</th>
                <th className="table-cell text-right text-xs text-purple-400/60 font-medium">Run</th>
              </tr>
            </thead>
            <tbody>
              {series.topCreatives.map((creative, i) => (
                <CreativeRow key={creative.id} creative={creative} idx={i} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function Block1VerticalSeries({ data }: Props) {
  return (
    <div className="card animate-fade-in">
      <div className="card-header">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-base">📱</div>
          <div>
            <h2 className="font-bold text-white text-sm">Block 1 — Vertical Series Analytics</h2>
            <p className="text-xs text-purple-400/80">Вертикальні серіали · Top 5 by Impressions × Run Duration</p>
          </div>
        </div>
        <span className="badge bg-yellow-500/10 text-yellow-300 border border-yellow-500/30 text-xs">
          SocialPeta
        </span>
      </div>

      <div className="p-4 space-y-3">
        {data.map((series, i) => (
          <SeriesCard key={series.id} series={series} rank={i} />
        ))}
      </div>
    </div>
  );
}
