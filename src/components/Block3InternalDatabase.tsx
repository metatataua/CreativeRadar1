'use client';

import { InternalCreative } from '@/types';
import { formatNumber } from '@/lib/sampleData';

interface Props {
  data: InternalCreative[];
  googleDriveLink?: string;
}

function StatusBadge({ status }: { status: InternalCreative['status'] }) {
  if (status === 'Active')
    return (
      <span className="badge bg-green-500/15 text-green-300 border border-green-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1 animate-pulse-fast inline-block" />
        Active
      </span>
    );
  if (status === 'Paused')
    return <span className="badge bg-yellow-500/15 text-yellow-300 border border-yellow-500/30">⏸ Paused</span>;
  return <span className="badge bg-slate-500/15 text-slate-400 border border-slate-500/30">🗃 Archived</span>;
}

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-purple-900/40 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-purple-600 to-violet-400 transition-all"
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-bold text-white font-mono w-8 text-right">{score}</span>
    </div>
  );
}

export default function Block3InternalDatabase({ data, googleDriveLink }: Props) {
  return (
    <div className="card animate-fade-in">
      <div className="card-header">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center text-base">🗄️</div>
          <div>
            <h2 className="font-bold text-white text-sm">Block 3 — Internal Database</h2>
            <p className="text-xs text-purple-400/80">Внутрішня база · Top 5 proprietary creatives</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {googleDriveLink ? (
            <a
              href={googleDriveLink}
              target="_blank"
              rel="noopener noreferrer"
              className="badge bg-green-500/10 text-green-300 border border-green-500/30 hover:bg-green-500/20 transition-colors cursor-pointer text-xs"
            >
              📊 Drive Connected
            </a>
          ) : (
            <span className="badge bg-slate-500/10 text-slate-400 border border-slate-500/30 text-xs">
              🔗 No Drive Link
            </span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px]">
          <thead>
            <tr className="bg-purple-950/40 border-b border-purple-900/30">
              <th className="table-cell text-left text-xs text-purple-400/60 font-medium w-8">#</th>
              <th className="table-cell text-left text-xs text-purple-400/60 font-medium">Creative / Hook</th>
              <th className="table-cell text-left text-xs text-purple-400/60 font-medium">Platform</th>
              <th className="table-cell text-center text-xs text-purple-400/60 font-medium">Status</th>
              <th className="table-cell text-left text-xs text-purple-400/60 font-medium min-w-[120px]">Score</th>
              <th className="table-cell text-right text-xs text-purple-400/60 font-medium">Impressions</th>
              <th className="table-cell text-right text-xs text-purple-400/60 font-medium">CTR</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, i) => (
              <tr key={item.id} className="table-row hover:bg-purple-900/10 transition-colors">
                <td className="table-cell text-purple-400/50 font-mono text-xs">{i + 1}</td>
                <td className="table-cell max-w-[200px]">
                  <div className="text-xs text-white font-medium leading-snug">{item.title}</div>
                  <div className="text-xs text-purple-400/70 mt-0.5 line-clamp-1 italic">"{item.hook}"</div>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-pill mt-1 inline-flex"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                    View Source
                  </a>
                </td>
                <td className="table-cell">
                  <span className="text-xs text-slate-300 bg-slate-700/30 border border-slate-600/30 px-2 py-0.5 rounded-md">
                    {item.platform}
                  </span>
                </td>
                <td className="table-cell text-center">
                  <StatusBadge status={item.status} />
                </td>
                <td className="table-cell min-w-[120px]">
                  <ScoreBar score={item.performanceScore} />
                </td>
                <td className="table-cell text-right">
                  <span className="text-sm text-white font-mono">{formatNumber(item.impressions)}</span>
                </td>
                <td className="table-cell text-right">
                  <span className="text-sm text-purple-300 font-mono">{item.ctr}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary footer */}
      <div className="px-5 py-3 border-t border-purple-900/20 flex gap-6 text-xs text-purple-400/60">
        <span>
          Avg score:{' '}
          <strong className="text-purple-300">
            {Math.round(data.reduce((a, c) => a + c.performanceScore, 0) / data.length)}
          </strong>
          /100
        </span>
        <span>
          Total impressions:{' '}
          <strong className="text-purple-300">
            {formatNumber(data.reduce((a, c) => a + c.impressions, 0))}
          </strong>
        </span>
        <span>
          Active:{' '}
          <strong className="text-green-400">
            {data.filter((d) => d.status === 'Active').length}
          </strong>
          /{data.length}
        </span>
      </div>
    </div>
  );
}
