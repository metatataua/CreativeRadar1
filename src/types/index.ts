export interface ApiKeys {
  googleDriveLink: string;
  socialPetaKey: string;
  apifyKey: string;
  buzzSumoKey: string;
  brandwatchKey: string;
  tiktokKey: string;
}

export interface FilterState {
  genres: string[];
  setting: string;
  customSetting: string;
  customKeywords: string;
}

export type PerformanceTier = 'Golden Frame' | 'Silver Tier' | 'Standard';

export interface Creative {
  id: string;
  name: string;
  activeLink?: string;       // only present when SocialPeta API key is connected
  searchQuery?: string;      // used to fetch real link when key is available
  activeDays: number;
  impressions: number;
  ctr: number;
  spend: number;
  performanceTier: PerformanceTier;
  hook: string;
}

export interface Series {
  id: string;
  title: string;
  totalImpressions: number;
  runDurationWeeks: number;
  platform: string;
  genre: string;
  topCreatives: Creative[];
}

export type Platform = 'TikTok' | 'Meta' | 'YouTube' | 'Instagram';

export interface HorizontalContent {
  id: string;
  platform: Platform;
  title: string;
  hook: string;
  videoLink?: string;        // only present when Apify/TikTok API key is connected
  searchQuery?: string;      // used to fetch real link when key is available
  views: number;
  engagementRate: number;
  likes: number;
  reposts: number;
  genre: string;
}

export interface InternalCreative {
  id: string;
  title: string;
  hook: string;
  platform: string;
  link?: string;             // only present when Google Drive is connected
  searchQuery?: string;      // used to fetch real link when key is available
  performanceScore: number;
  genre: string;
  setting: string;
  impressions: number;
  ctr: number;
  status: 'Active' | 'Paused' | 'Archived';
}

export interface ParsedData {
  block1: Series[];
  block2: Record<Platform, HorizontalContent[]>;
  block3: InternalCreative[];
}
