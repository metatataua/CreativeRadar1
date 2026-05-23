'use client';

import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FilterState, ParsedData } from '@/types';
import { loadApiKeys } from '@/components/SettingsDrawer';

interface Props {
  filters: FilterState;
  data: ParsedData | null;
}

type Status = 'idle' | 'loading' | 'streaming' | 'done' | 'error';

export default function Block4AISummary({ filters, data }: Props) {
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [searchSource, setSearchSource] = useState('');

  const runAnalysis = useCallback(async () => {
    if (!data) return;
    setContent('');
    setError('');
    setStatus('loading');

    const apiKeys = loadApiKeys();

    // Determine which search source will be used
    if (apiKeys.apifyKey) setSearchSource('Apify + Claude');
    else if (apiKeys.braveSearchKey) setSearchSource('Brave Search + Claude');
    else setSearchSource('Claude web search');

    try {
      const res = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters, data, apiKeys }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error ?? `HTTP ${res.status}`);
      }

      if (!res.body) throw new Error('No response stream');

      setStatus('streaming');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6);
          if (raw === '[DONE]') { setStatus('done'); return; }
          try {
            const parsed = JSON.parse(raw);
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.text) setContent((prev) => prev + parsed.text);
          } catch (e) {
            if (e instanceof Error && e.message !== 'Unexpected end of JSON input') throw e;
          }
        }
      }

      setStatus('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unexpected error');
      setStatus('error');
    }
  }, [filters, data]);

  const isEmpty = !data;
  const genreLabel = filters.genres.slice(0, 3).join(', ') || 'No filters yet';

  return (
    <div className="card animate-fade-in flex flex-col">
      <div className="card-header">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-600/30 border border-purple-500/30 flex items-center justify-center text-base">🧠</div>
          <div>
            <h2 className="font-bold text-white text-sm">Block 4 — AI Summary</h2>
            <p className="text-xs text-purple-400/80">
              {searchSource ? `Powered by ${searchSource}` : 'Automated Workspace · Powered by Claude'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {status === 'streaming' && (
            <span className="flex items-center gap-1.5 text-xs text-purple-400">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              Generating…
            </span>
          )}
          {status === 'done' && (
            <span className="badge bg-green-500/15 text-green-300 border border-green-500/30 text-xs">
              ✓ Analysis complete
            </span>
          )}
        </div>
      </div>

      {/* Context pill */}
      <div className="px-5 py-3 border-b border-purple-900/20 flex flex-wrap gap-2 items-center">
        <span className="text-xs text-purple-400/60">Filters:</span>
        <span className="text-xs bg-purple-800/30 text-purple-300 border border-purple-700/30 px-2 py-0.5 rounded-full">
          {genreLabel}
        </span>
        {(filters.customSetting || filters.setting) && (
          <span className="text-xs bg-purple-800/30 text-purple-300 border border-purple-700/30 px-2 py-0.5 rounded-full">
            {filters.customSetting || filters.setting}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 p-5">
        {status === 'idle' && !content && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🎯</div>
            <p className="text-purple-300 font-medium mb-2">
              {isEmpty ? 'Parse data first to unlock AI analysis' : 'Data ready for AI analysis'}
            </p>
            <p className="text-xs text-purple-400/60 mb-6 max-w-xs mx-auto">
              Claude will search the web for real examples and generate an actionable hook playbook.
            </p>
            <button onClick={runAnalysis} disabled={isEmpty} className={`btn-primary ${isEmpty ? 'opacity-40 cursor-not-allowed' : ''}`}>
              ✨ Generate AI Brief
            </button>
          </div>
        )}

        {status === 'loading' && (
          <div className="text-center py-12">
            <div className="relative w-14 h-14 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-purple-900/40" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-xl">🧠</div>
            </div>
            <p className="text-sm text-purple-300">Searching the web for real data…</p>
            <p className="text-xs text-purple-400/50 mt-1">{searchSource}</p>
          </div>
        )}

        {(status === 'streaming' || status === 'done') && content && (
          <div className="prose-custom">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors">
                    {children}
                  </a>
                ),
                h3: ({ children }) => (
                  <h3 className="text-purple-300 font-bold text-sm mt-6 mb-3 first:mt-0 flex items-center gap-2 border-b border-purple-900/30 pb-2">
                    {children}
                  </h3>
                ),
                ul: ({ children }) => <ul className="space-y-2 mb-4 pl-4">{children}</ul>,
                li: ({ children }) => <li className="text-slate-300 text-sm leading-relaxed list-disc">{children}</li>,
                p: ({ children }) => <p className="text-slate-300 text-sm leading-relaxed mb-3">{children}</p>,
                strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                code: ({ children }) => <code className="bg-purple-900/30 text-purple-300 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>,
                blockquote: ({ children }) => <blockquote className="border-l-2 border-purple-500 pl-4 my-3 italic text-slate-400 text-sm">{children}</blockquote>,
              }}
            >
              {content}
            </ReactMarkdown>
            {status === 'streaming' && (
              <span className="inline-block w-2 h-4 bg-purple-500 animate-pulse-fast ml-0.5 rounded-sm" />
            )}
          </div>
        )}

        {status === 'error' && (
          <div className="rounded-xl bg-red-950/30 border border-red-900/40 p-5">
            <p className="text-red-400 font-medium text-sm mb-1">⚠ AI Analysis Failed</p>
            <p className="text-red-300/70 text-xs">{error}</p>
            <p className="text-xs text-purple-400/60 mt-3">
              Make sure <code className="text-purple-300">ANTHROPIC_API_KEY</code> is set in Vercel environment variables.
            </p>
            <button onClick={runAnalysis} className="btn-secondary mt-3">Retry</button>
          </div>
        )}
      </div>

      {(status === 'done' || status === 'error') && (
        <div className="px-5 py-3 border-t border-purple-900/20 flex justify-between items-center">
          <span className="text-xs text-purple-400/50">
            {filters.genres.length} genre filter{filters.genres.length !== 1 ? 's' : ''} · {searchSource}
          </span>
          <button onClick={runAnalysis} className="btn-secondary">↺ Re-generate</button>
        </div>
      )}

      {status === 'idle' && content === '' && !isEmpty && (
        <div className="px-5 py-3 border-t border-purple-900/20">
          <button onClick={runAnalysis} className="btn-primary w-full">✨ Generate AI Brief</button>
        </div>
      )}
    </div>
  );
}
