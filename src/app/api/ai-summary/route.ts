import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured. Add it to .env.local to enable AI analysis.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const body = await req.json();
  const { filters, data } = body;

  const genre = filters.genres?.join(', ') || 'Romance';
  const setting = filters.customSetting || filters.setting || 'General';
  const keywords = filters.customKeywords || '(none)';

  const block1Summary = data?.block1
    ?.slice(0, 3)
    .map((s: { title: string; totalImpressions: number; runDurationWeeks: number; topCreatives: { name: string; performanceTier: string; activeDays: number; ctr: number }[] }) =>
      `• **${s.title}** — ${(s.totalImpressions / 1_000_000).toFixed(0)}M impressions, ${s.runDurationWeeks}wk run. Top creative: "${s.topCreatives[0]?.name}" (${s.topCreatives[0]?.performanceTier}, ${s.topCreatives[0]?.activeDays}d active, ${s.topCreatives[0]?.ctr}% CTR)`
    )
    .join('\n') ?? '';

  const block2Summary = Object.entries(data?.block2 ?? {})
    .map(([platform, posts]) => {
      const top = (posts as { hook: string; views: number; engagementRate: number }[])[0];
      return `• **${platform}** top hook: "${top?.hook}" — ${(top?.views / 1_000_000).toFixed(1)}M views, ${top?.engagementRate}% ER`;
    })
    .join('\n');

  const block3Summary = data?.block3
    ?.slice(0, 3)
    .map((c: { title: string; hook: string; performanceScore: number; ctr: number }) =>
      `• **${c.title}** (score: ${c.performanceScore}/100, CTR: ${c.ctr}%) — Hook: "${c.hook}"`
    )
    .join('\n') ?? '';

  const systemPrompt = `You are an elite, data-driven Performance Marketing Director for vertical series. Analyze the provided parsed marketing tables (competitor ads, organic videos, internal metrics) filtered for Genre: ${genre}, Setting: ${setting}, and Custom Search Keywords: ${keywords}.

Generate a plug-and-play creative brief with the exact structure below. Always include working clickable Markdown hyperlinks [text](url) referencing specific videos/sources from the data where applicable. Keep it punchy, actionable, and formatted cleanly.

### 1. ACTIONABLE CREATIVE PATTERNS (What to copy)
### 2. PLUG-and-PLAY HOOK FRAMEWORKS (First 3 Seconds with dynamic brackets and active markdown source hyperlinks)
### 3. THE "STOP-DOING" LIST (What to avoid / creative mistakes)
### 4. PRODUCTION-READY BRIEF (Next Steps matching the #1 ad format with the top organic hook)`;

  const userMessage = `Here is the parsed data for your analysis:

**GENRE FILTERS:** ${genre}
**SETTING:** ${setting}
**CUSTOM KEYWORDS:** ${keywords}

---
**BLOCK 1 — TOP PERFORMING VERTICAL SERIES (SocialPeta)**
${block1Summary}

---
**BLOCK 2 — TOP ORGANIC/PAID CONTENT BY PLATFORM**
${block2Summary}

---
**BLOCK 3 — INTERNAL DATABASE CREATIVES**
${block3Summary}

---
Now generate the full creative brief following your system prompt structure. Be specific, cite the data, and include clickable source links where relevant.`;

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const stream = client.messages.stream({
          model: 'claude-opus-4-7',
          max_tokens: 2048,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }],
        });

        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            const chunk = `data: ${JSON.stringify({ text: event.delta.text })}\n\n`;
            controller.enqueue(encoder.encode(chunk));
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
