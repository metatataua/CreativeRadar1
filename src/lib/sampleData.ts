import {
  FilterState,
  Series,
  Creative,
  HorizontalContent,
  InternalCreative,
  ParsedData,
  Platform,
  PerformanceTier,
} from '@/types';

// ─── Seeded pseudo-random helpers ────────────────────────────────────────────
function hash(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i);
  }
  return Math.abs(h);
}

function seeded(seed: number, min: number, max: number): number {
  const x = Math.sin(seed + 1) * 10000;
  const r = x - Math.floor(x);
  return Math.floor(r * (max - min + 1)) + min;
}

// ─── Content pools ────────────────────────────────────────────────────────────
const GENRE_HOOKS: Record<string, string[]> = {
  Romance: [
    "He grabbed her wrist: 'You're not leaving me again.'",
    'Their eyes met across the boardroom — she was his wife and she had no idea.',
    'She signed the divorce papers. He burned them.',
    "POV: He's been secretly in love with you for 3 years.",
    "She said 'I hate you.' He smiled. 'No, you don't.'",
  ],
  Revenge: [
    'Five years. She came back different. They had no idea how different.',
    'The girl they destroyed became the CEO they now answer to.',
    "She smiled sweetly. They didn't know they were shaking hands with their downfall.",
    'She waited. Planned. And on their wedding day — she struck.',
    "He ruined her family. She ruined his empire. They called it even.",
  ],
  Billionaire: [
    "POV: The billionaire CEO doesn't know his secret wife is his new intern.",
    'He bought the company to fire her. She became his biggest asset.',
    '$1 billion deal. $1 fake marriage. Zero plan for falling in love.',
    "His assistant quit. His wife applied. He didn't recognise her.",
    'She inherited his rival company. He proposed on the spot.',
  ],
  'Enemies-to-Lovers': [
    'They hated each other in public. Clung to each other in private.',
    "The court ruled: they must live together for 30 days. Neither survived it.",
    "She's his enemy's daughter. He's her family's biggest threat.",
    'Rivals by day. Strangers who share a wall by night.',
    'He was everything she despised. She was everything he needed.',
  ],
  Thriller: [
    'She knew too much. He had to keep her close — or silence her forever.',
    'The witness saw everything. So did the killer watching her now.',
    "She thought she was safe. The GPS tracker said otherwise.",
    '48 hours to find the truth before they erased her entirely.',
    'Every text from her "dead" husband had a different postmark.',
  ],
  'Found Family': [
    '4 strangers, 1 lease, zero idea they were about to become everything to each other.',
    "They were assigned as roommates. They became each other's home.",
    "She had no one. Then she had everyone — and didn't know how to handle it.",
    'He raised his siblings alone. She showed up and changed all their lives.',
    'Orphaned at 22. Adopted by the most chaotic family at 23.',
  ],
  'Forbidden Love': [
    'They knew it was wrong. They did it anyway.',
    "Boss and employee. One rule: don't fall in love.",
    'Her father is his enemy. Their love is the battlefield.',
    'He was her bodyguard. She was the target. Neither followed the rules.',
    "Forbidden by law. Impossible to stop. They tried anyway.",
  ],
  'Alpha Male': [
    'He never begged. He never chased. Until her.',
    "He owns half the city. She owns the only thing he can't buy.",
    "His word is law. She never read the rulebook.",
    'Three words he had never said in 34 years: I need you.',
    "He controlled everything. Except the way his hands shook near her.",
  ],
  'Second Chance': [
    'She was the one who got away. He spent 10 years making sure she came back.',
    "He left for her own good. She spent 5 years not forgiving him for it.",
    "Their first chapter was a mistake. Their second is a masterpiece.",
    "Old feelings. New wounds. One more chance they're both terrified to take.",
    "He was her first love. She became his last regret.",
  ],
  'Dark Romance': [
    "He didn't ask her to stay. He locked the door.",
    "She ran. He followed. She stopped running when she realised she wanted to be caught.",
    "He's dangerous. She's drawn to danger. Neither fights it.",
    "Obsession isn't love. He was doing his best.",
    "She feared him. Then she feared a world without him more.",
  ],
  'Fake Dating': [
    "Fake engagement. Real feelings. No script for this.",
    "He needed a date for the gala. She needed rent money. Both got more than they bargained for.",
    "30 days of pretending to be in love. Day 12 — it stopped being pretend.",
    "The fake kiss. The real heartbeat. The very real problem.",
    "She agreed to be his fake girlfriend. He forgot to stay fake.",
  ],
  'CEO x Employee': [
    'New job, old boss — except the last time she saw him, she walked out on their wedding.',
    "Rule #1: Don't fall for your boss. Rule #2: He writes the rules.",
    "She thought it was just a job. He thought it was just business. Both were wrong.",
    "He hired her to stay away from her. It didn't work.",
    "Assistant by day. Rival by every other moment.",
  ],
  'Arranged Marriage': [
    "Their fathers shook hands. They shook their heads. Love shook everything else.",
    "She agreed to marry a stranger. He turned out to be someone she already knew.",
    "Contract signed. Feelings not included. Both arrived anyway.",
    "3 months of a fake marriage to satisfy the family. 3 months became forever.",
    "She hated the arrangement. He was determined to change her mind.",
  ],
  Obsession: [
    "He watched her from across the room every day for 6 months before she noticed him.",
    "She tried to leave him three times. He was waiting every single time.",
    "His obsession wasn't love, he told himself that, right up until it was.",
    "She was supposed to be a distraction. She became his only thought.",
    "He memorised everything about her before she knew his name.",
  ],
  'Redemption Arc': [
    "He did terrible things. She saw who he could be instead.",
    "The villain gets one chapter to explain. This is his.",
    "She gave him the last chance he didn't deserve. He gave her a reason to.",
    "He spent years being the monster. Loving her made him want to be something else.",
    "Damaged. Dangerous. Desperate to be worthy of the one person who saw through him.",
  ],
  Betrayal: [
    "Her best friend. His secret. The moment she found out — everything changed.",
    "He betrayed her to protect her. She had to decide if it counted.",
    "She trusted him with everything. He gave half of it away.",
    "The betrayal didn't break her. Discovering why almost did.",
    "He was the leak. She was the secret. Neither survived it unchanged.",
  ],
  Kidnapping: [
    "He took her to keep her safe. She had questions about that logic.",
    "She was collateral. She became irreplaceable.",
    "He kidnapped the wrong woman. She decided to use it to her advantage.",
    "48 hours as his hostage. A lifetime adjusting to what came after.",
    "He took her from danger. Into more danger. With slightly better decor.",
  ],
  'Twin Flame': [
    "They kept finding each other. In every city. In every life.",
    "Two people who can't stay together and can't stay apart.",
    "She felt it the second she saw him — like a memory she hadn't made yet.",
    "Twin flames don't burn gently. She was learning that first hand.",
    "The connection was instant. The chaos was eternal. Neither would trade it.",
  ],
};

const DEFAULT_HOOKS = [
  "She had 24 hours to change his mind. She needed 6.",
  "The deal was simple. The feelings were not.",
  "He never planned to stay. She never planned to let him.",
  "Three years of hiding. One moment that changed everything.",
  "She thought she knew him. She knew nothing.",
];

const SETTING_FLAVORS: Record<string, { noun: string; adj: string; titlePrefix: string[] }> = {
  Mafia: { noun: 'Don', adj: 'underground', titlePrefix: ['The Don\'s', 'Blood', 'Mafia King\'s', 'Underworld', 'The Capo\'s'] },
  Historical: { noun: 'Duke', adj: 'imperial', titlePrefix: ['The Duchess', 'Crown', 'Empire', 'The Earl\'s', 'Kingdom'] },
  Sports: { noun: 'Captain', adj: 'championship', titlePrefix: ['Game Day', 'The Playmaker\'s', 'Final Score', 'Off Season', 'Match Point'] },
  Fantasy: { noun: 'Prince', adj: 'enchanted', titlePrefix: ['The Dragon\'s', 'Crown of Ash', 'Shadow Realm', 'The Heir\'s', 'Cursed'] },
  Office: { noun: 'CEO', adj: 'corporate', titlePrefix: ['Boardroom', 'Corner Office', 'The Executive\'s', 'Q4 Love', 'The Merger'] },
  Vampire: { noun: 'Lord', adj: 'immortal', titlePrefix: ['Eternal', 'Blood Moon', 'The Count\'s', 'Immortal', 'Crimson'] },
  College: { noun: 'President', adj: 'campus', titlePrefix: ['Campus Crush', 'Dorm Room', 'Finals Week', 'Frat House', 'The TA\'s'] },
  'Royal Court': { noun: 'Prince', adj: 'royal', titlePrefix: ['The Crown\'s', 'Palace Walls', 'Royal Guard\'s', 'The King\'s', 'Throne'] },
  Military: { noun: 'Commander', adj: 'classified', titlePrefix: ['Code Name', 'Operation Love', 'The Colonel\'s', 'Base Camp', 'Classified'] },
  Werewolf: { noun: 'Alpha', adj: 'primal', titlePrefix: ['Moon Claim', 'The Alpha\'s', 'Pack Bond', 'Full Moon', 'Marked by'] },
  'Billionaire Mansion': { noun: 'Heir', adj: 'elite', titlePrefix: ['The Penthouse', 'Heir Apparent', 'Old Money', 'The Estate\'s', 'Billion Dollar'] },
};

const DEFAULT_FLAVOR = { noun: 'Hero', adj: 'dramatic', titlePrefix: ['The Secret', 'Hidden', 'Unexpected', 'Forbidden', 'The Last'] };

// ─── Link generators ──────────────────────────────────────────────────────────
function tiktokLink(seed: number) {
  const id = `72${seed.toString().padStart(17, '0').slice(0, 17)}`;
  return `https://www.tiktok.com/@verticaldrama.shorts/video/${id}`;
}

function youtubeLink(seed: number) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let id = '';
  let s = seed;
  for (let i = 0; i < 11; i++) { id += chars[s % chars.length]; s = Math.floor(s / chars.length) + 7; }
  return `https://www.youtube.com/shorts/${id}`;
}

function instagramLink(seed: number) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
  let id = '';
  let s = seed;
  for (let i = 0; i < 11; i++) { id += chars[s % chars.length]; s = Math.floor(s / chars.length) + 13; }
  return `https://www.instagram.com/reel/${id}/`;
}

function metaAdLink(seed: number) {
  return `https://www.facebook.com/ads/library/?id=${seed.toString().padStart(15, '1')}`;
}

function socialPetaLink(seed: number) {
  return `https://app.socialpeta.com/creative/detail?id=${seed.toString().padStart(8, '0')}`;
}

// ─── Block 1 – Vertical Series ────────────────────────────────────────────────
function buildCreatives(seriesSeed: number, genreHookList: string[]): Creative[] {
  const tiers: PerformanceTier[] = ['Golden Frame', 'Golden Frame', 'Silver Tier', 'Silver Tier', 'Standard'];
  return Array.from({ length: 5 }, (_, i) => {
    const s = seeded(seriesSeed + i * 17, 1000, 9999);
    return {
      id: `cr-${seriesSeed}-${i}`,
      name: `Creative #${String(i + 1).padStart(2, '0')} — ${['Hook Open', 'Conflict Peak', 'Cliffhanger', 'Resolution Tease', 'Reaction Bait'][i]}`,
      activeLink: socialPetaLink(seriesSeed + i * 100),
      activeDays: seeded(seriesSeed + i, 21, 112),
      impressions: seeded(seriesSeed + i * 3, 800_000, 12_000_000),
      ctr: parseFloat((seeded(seriesSeed + i * 7, 18, 72) / 10).toFixed(1)),
      spend: seeded(seriesSeed + i * 11, 2000, 48000),
      performanceTier: tiers[i],
      hook: genreHookList[i % genreHookList.length],
    };
  });
}

function buildSeries(filters: FilterState): Series[] {
  const primaryGenre = filters.genres[0] || 'Romance';
  const hooks = GENRE_HOOKS[primaryGenre] || DEFAULT_HOOKS;
  const flavor = SETTING_FLAVORS[filters.customSetting || filters.setting] || DEFAULT_FLAVOR;
  const baseSeed = hash(`${filters.genres.join(',')}-${filters.setting}-${filters.customSetting}-${filters.customKeywords}`);

  const TITLE_SUFFIXES = ['Season 1', 'Complete Arc', 'Full Series', 'Director\'s Cut', 'Extended Edition'];
  return Array.from({ length: 5 }, (_, i) => {
    const seriesSeed = baseSeed + i * 1337;
    const prefix = flavor.titlePrefix[i % flavor.titlePrefix.length];
    const suffix = ['Obsession', 'Secret', 'Promise', 'Surrender', 'Contract'][i];
    return {
      id: `series-${i}`,
      title: `${prefix} ${suffix} — ${TITLE_SUFFIXES[i]}`,
      totalImpressions: seeded(seriesSeed, 15_000_000, 280_000_000),
      runDurationWeeks: seeded(seriesSeed + 5, 4, 26),
      platform: 'SocialPeta',
      genre: filters.genres[i % Math.max(filters.genres.length, 1)] || primaryGenre,
      topCreatives: buildCreatives(seriesSeed, hooks),
    };
  }).sort((a, b) => b.totalImpressions - a.totalImpressions);
}

// ─── Block 2 – Horizontal Content ─────────────────────────────────────────────
function buildHorizontalContent(filters: FilterState): Record<Platform, HorizontalContent[]> {
  const primaryGenre = filters.genres[0] || 'Romance';
  const hooks = GENRE_HOOKS[primaryGenre] || DEFAULT_HOOKS;
  const baseSeed = hash(`h2-${filters.genres.join(',')}-${filters.setting}-${filters.customKeywords}`);

  const PLATFORM_CONFIGS: { platform: Platform; linkFn: (s: number) => string; minViews: number; maxViews: number }[] = [
    { platform: 'TikTok', linkFn: tiktokLink, minViews: 2_100_000, maxViews: 18_000_000 },
    { platform: 'Meta', linkFn: metaAdLink, minViews: 1_000_000, maxViews: 8_500_000 },
    { platform: 'YouTube', linkFn: youtubeLink, minViews: 1_200_000, maxViews: 12_000_000 },
    { platform: 'Instagram', linkFn: instagramLink, minViews: 850_000, maxViews: 6_000_000 },
  ];

  const result: Record<string, HorizontalContent[]> = {};

  PLATFORM_CONFIGS.forEach(({ platform, linkFn, minViews, maxViews }) => {
    const platformSeed = baseSeed + platform.charCodeAt(0) * 999;
    result[platform] = Array.from({ length: 5 }, (_, i) => {
      const s = platformSeed + i * 421;
      const views = seeded(s, minViews, maxViews);
      const er = parseFloat((seeded(s + 3, 30, 120) / 10).toFixed(1));
      return {
        id: `h2-${platform}-${i}`,
        platform,
        title: `${platform} Viral ${i + 1}: ${(filters.genres[i % Math.max(filters.genres.length, 1)] || primaryGenre)} Story`,
        hook: hooks[i % hooks.length],
        videoLink: linkFn(s),
        views,
        engagementRate: er,
        likes: Math.floor(views * (er / 100) * 0.7),
        reposts: Math.floor(views * (er / 100) * 0.3),
        genre: filters.genres[i % Math.max(filters.genres.length, 1)] || primaryGenre,
      };
    }).sort((a, b) => b.views - a.views);
  });

  return result as Record<Platform, HorizontalContent[]>;
}

// ─── Block 3 – Internal Database ──────────────────────────────────────────────
function buildInternalCreatives(filters: FilterState): InternalCreative[] {
  const primaryGenre = filters.genres[0] || 'Romance';
  const hooks = GENRE_HOOKS[primaryGenre] || DEFAULT_HOOKS;
  const baseSeed = hash(`db-${filters.genres.join(',')}-${filters.setting}-${filters.customKeywords}`);
  const statuses: ('Active' | 'Paused' | 'Archived')[] = ['Active', 'Active', 'Active', 'Paused', 'Archived'];
  const platforms = ['TikTok', 'Meta Ads', 'YouTube', 'Instagram', 'Meta Ads'];

  return Array.from({ length: 5 }, (_, i) => {
    const s = baseSeed + i * 719;
    const impressions = seeded(s, 500_000, 25_000_000);
    return {
      id: `db-${i}`,
      title: `Internal Creative #${String(i + 1).padStart(2, '0')} — ${(filters.customSetting || filters.setting || 'Drama')} Arc`,
      hook: hooks[i % hooks.length],
      platform: platforms[i],
      link: [tiktokLink, youtubeLink, instagramLink, metaAdLink, socialPetaLink][i % 5](s),
      performanceScore: seeded(s + 2, 72, 99),
      genre: filters.genres[i % Math.max(filters.genres.length, 1)] || primaryGenre,
      setting: filters.customSetting || filters.setting || 'General',
      impressions,
      ctr: parseFloat((seeded(s + 9, 15, 85) / 10).toFixed(1)),
      status: statuses[i],
    };
  }).sort((a, b) => b.performanceScore - a.performanceScore);
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function generateSampleData(filters: FilterState): ParsedData {
  return {
    block1: buildSeries(filters),
    block2: buildHorizontalContent(filters),
    block3: buildInternalCreatives(filters),
  };
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

export function formatMoney(n: number): string {
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n}`;
}
