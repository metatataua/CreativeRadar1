'use client';

import { useState } from 'react';
import { HorizontalContent, Platform } from '@/types';
import { formatNumber } from '@/lib/sampleData';

interface Props {
  data: Record<Platform, HorizontalContent[]>;
}

const PLATFORM_ICONS: Record<Platform, string> = {
  TikTok: '🎵',
  Meta: '📘',
  YouTube: '▶️',
  Instagram: '📸',
};

const PLATFORM_COLORS: Record<Platform, string> = {
  TikTok: 'platform-tiktok',
  Meta: 'platform-meta',
  YouTube: 'platform-youtube',
  Instagram: 'platform-instagram',
};

const PLATFORM_ORDER: Platform[] = ['TikTok', 'Meta', 'YouTube', 'Instagram'];

function PlatformRow({ item, idx }: { item: HorizontalContent; idx: number }) {
  return (
    <tr className="table-row hover:bg-purple-900/10 transition-colors">
      <td className="table-cell text-purple-400/50 font-mono text-xs w-8">{idx + 1}</td>
      <td className="table-cell max-w-[220px]">
        <div className="text-xs text-white font-medium leading-snug line-clamp-2 italic">
          "{item.hook}"
        </div>
        <a
          href={item.videoLink}
          target="_blank"
          rel="noopener noreferrer"
          className="link-pill mt-1 inline-flex"
        >
          <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
          </svg>
          Open {item.platform}
        </a>
      </td>
      <td className="table-cell text-right">
        <div className="text-sm text-white font-mono font-bold">{formatNumber(item.views)}</div>
        <div className="text-xs text-purple-400/60">views</div>
      </td>
      <td className="table-cell text-right">
        <div className="text-sm text-green-400 font-mono">{item.engagementRate}%</div>
        <div className="text-xs text-purple-400/60">ER</div>
      </td>
      <td className="table-cell text-right">
        <div className="text-xs text-slate-300 font-mono">{formatNumber(item.likes)}</div>
        <div className="text-xs text-purple-400/60">likes</div>
      </td>
      <td className="table-cell text-right">
        <div className="text-xs text-slate-300 font-mono">{formatNumber(item.reposts)}</div>
        <div className="text-xs text-purple-400/60">reposts</div>
      </td>
    </tr>
  );
}

function PlatformSection({ platform, items }: { platform: Platform; items: HorizontalContent[] }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border border-purple-900/30 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-5 py-3.5 flex items-center gap-3 hover:bg-purple-900/10 transition-colors text-left"
      >
        <span className={`${PLATFORM_COLORS[platform]} px-2 py-0.5 rounded-md`}>
          {PLATFORM_ICONS[platform]} {platform}
        </span>
        <div className="flex-1">
          <span className="text-xs text-purple-400/70">
            Top {items.length} · {items[0] ? `${formatNumber(items[0].views)} views peak` : ''}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {platform === 'TikTok' && (
            <span className="text-xs text-pink-400 bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded-full">
              &gt;2M+ views
            </span>
          )}
          {platform === 'Meta' && (
            <span className="text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
              &gt;1M+ views
            </span>
          )}
          <svg
            className={`w-4 h-4 text-purple-400 transition-transform ${open ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="border-t border-purple-900/30 overflow-x-auto animate-fade-in">
          <table className="w-full min-w-[520px]">
            <thead>
              <tr className="bg-purple-950/40">
                <th className="table-cell text-left text-xs text-purple-400/60 font-medium w-8">#</th>
                <th className="table-cell text-left text-xs text-purple-400/60 font-medium">Hook / Link</th>
                <th className="table-cell text-right text-xs text-purple-400/60 font-medium">Views</th>
                <th className="table-cell text-right text-xs text-purple-400/60 font-medium">ER</th>
                <th className="table-cell text-right text-xs text-purple-400/60 font-medium">Likes</th>
                <th className="table-cell text-right text-xs text-purple-400/60 font-medium">Reposts</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <PlatformRow key={item.id} item={item} idx={i} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function Block2HorizontalContent({ data }: Props) {
  return (
    <div className="card animate-fade-in">
      <div className="card-header">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-base">🌐</div>
          <div>
            <h2 className="font-bold text-white text-sm">Block 2 — Horizontal & Organic Content</h2>
            <p className="text-xs text-purple-400/80">Горизонтальний контент · TikTok · Meta · YouTube · Instagram</p>
          </div>
        </div>
        <span className="badge bg-blue-500/10 text-blue-300 border border-blue-500/30 text-xs">
          Multi-Platform
        </span>
      </div>

      <div className="p-4 space-y-3">
        {PLATFORM_ORDER.map((platform) => (
          <PlatformSection key={platform} platform={platform} items={data[platform] ?? []} />
        ))}
      </div>
    </div>
  );
}
