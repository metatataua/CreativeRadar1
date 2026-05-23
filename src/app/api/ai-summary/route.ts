import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Brave Search ─────────────────────────────────────────────────────────────
async function braveSearch(query: string, braveKey: string): Promise<string> {
  try {
    const res = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5&freshness=pm`,
      { headers: { 'Accept': 'application/json', 'X-Subscription-Token': braveKey } }
    );
    if (!res.ok) return '';
    const data = await res.json();
    return (data?.web?.results || [])
      .map((r: any) => `• ${r.title} — ${r.url}\n  ${r.description || ''}`)
      .join('\n');
  } catch { return ''; }
}

// ─── Apify Google Search ──────────────────────────────────────────────────────
async function apifySearch(query: string, apifyKey: string): Promise<string> {
  try {
    const url = `https://api.apify.com/v2/acts/apify~google-search-scraper/run-sync-get-dataset-items?token=${apifyKey}&timeout=30&memory=256`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queries: query, maxPagesPerQuery: 1, resultsPerPage: 5 }),
    });
    if (!res.ok) return '';
    const data = await res.json();
    const results = data?.[0]?.organicResults || [];
    return results
      .map((r: any) => `• ${r.title} — ${r.url}\n  ${r.description || ''}`)
      .join('\n');
  } catch { return ''; }
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const body = await req.json();
  const { filters, data, apiKeys } = body;

  const genre = filters.genres?.join(', ') || 'Romance';
  const setting = filters.customSetting || filters.setting || 'General';
  const keywords = filters.customKeywords || '';
  const searchQuery = `${genre} ${setting} ${keywords} vertical drama series viral hooks`.trim();

  // ── Gather all available data ──────────────────────────────────────────────

  // 1. Apify web search results (if key available)
  const apifyKey = apiKeys?.apifyKey;
  const braveKey = apiKeys?.braveSearchKey;

  let externalSearchResults = '';

  if (apifyKey) {
    externalSearchResults = await apifySearch(searchQuery, apifyKey);
  } else if (braveKey) {
    externalSearchResults = await braveSearch(searchQuery, braveKey);
  }
  // If neither — Claude web_search will handle it below

  // 2. Platform data (TikTok, YouTube etc from fetch-data)
  const block1Summary = data?.block1?.length
    ? data.block1.slice(0, 3).map((s: any) =>
        `• ${s.title} — ${(s.totalImpressions / 1_000_000).toFixed(0)}M impressions, ${s.runDurationWeeks}wk run`
      ).join('\n')
    : '';

  const block2Summary = Object.entries(data?.block2 ?? {})
    .filter(([, posts]) => (posts as any[]).length > 0)
    .map(([platform, posts]) => {
      const top = (posts as any[])[0];
      return `• ${platform}: "${(top?.hook || '').slice(0, 100)}" — ${((top?.views || 0) / 1_000_000).toFixed(1)}M views${top?.videoLink ? ` [${top.videoLink}]` : ''}`;
    }).join('\n');

  // 3. Open web results from fetch-data (Apify Google scraper)
  const openWebSummary = data?.openWeb?.length
    ? data.openWeb.map((r: any) => `• ${r.title} — ${r.url}`).join('\n')
    : '';

  // 4. Google Drive internal base
  const driveContext = data?.driveContent
    ? `\nINTERNAL BASE (Google Drive):\n${data.driveContent.slice(0, 2000)}`
    : '';

  // ── Build prompt ───────────────────────────────────────────────────────────
  const hasExternalData = externalSearchResults || openWebSummary || block2Summary;

  const systemPrompt = `You are an elite Performance Marketing Director for vertical drama series (ReelShort, DramaBox, MyDrama).
${!hasExternalData ? '\nYou have web_search available. Use it NOW to find real current data before writing the brief.' : '\nReal data has been provided below. Use it as the primary source for your analysis.'}

Generate a plug-and-play creative brief:

### 1. WHAT'S WORKING RIGHT NOW
(cite real examples with clickable links)

### 2. TOP 5 HOOK FRAMEWORKS
(copy-paste ready, with [CHARACTER] [ACTION] brackets, link real examples)

### 3. STOP-DOING LIST
(3 specific mistakes in this genre/setting)

### 4. PRODUCTION BRIEF
(exact scene for the #1 hook: 0–3sec / 3–7sec / 7–15sec / 15sec+)`;

  const userMessage = `Genre: ${genre} | Setting: ${setting}${keywords ? ` | Keywords: ${keywords}` : ''}

${block1Summary ? `SOCIAL PETA DATA:\n${block1Summary}\n` : ''}
${block2Summary ? `PLATFORM DATA (real videos):\n${block2Summary}\n` : ''}
${openWebSummary ? `WEB SEARCH RESULTS (Apify):\n${openWebSummary}\n` : ''}
${externalSearchResults ? `ADDITIONAL WEB SEARCH (${apifyKey ? 'Apify' : 'Brave'}):\n${externalSearchResults}\n` : ''}
${driveContext}
${!hasExternalData ? '\nNo external data available — search the web for real examples first.' : ''}

Write the full creative brief. Cite sources with real links.`;

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      try {
        let messages: any[] = [{ role: 'user', content: userMessage }];

        // If no external data — use Claude's own web_search
        if (!hasExternalData) {
          const searchPass = await client.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 4096,
            system: systemPrompt,
            tools: [{ type: 'web_search_20250305', name: 'web_search' }] as any,
            messages,
          });

          messages = [
            ...messages,
            { role: 'assistant', content: searchPass.content },
          ];

          const toolResults = searchPass.content
            .filter((b: any) => b.type === 'tool_use')
            .map((b: any) => ({ type: 'tool_result', tool_use_id: b.id, content: 'Search completed' }));

          if (toolResults.length > 0) {
            messages.push({ role: 'user', content: toolResults });
          }
        }

        // Stream the final brief
        const stream = client.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 2048,
          system: systemPrompt,
          messages,
        });

        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
          }
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
