'use client';

const STEPS = [
  { icon: '🔍', label: 'Querying SocialPeta competitor ads…' },
  { icon: '🎵', label: 'Fetching TikTok trend signals…' },
  { icon: '📊', label: 'Reading internal Google Drive data…' },
  { icon: '📡', label: 'Scanning Meta Ads Library…' },
  { icon: '🧠', label: 'Aggregating performance matrices…' },
];

export default function LoadingOverlay({ step }: { step: number }) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="card max-w-sm w-full mx-4 p-8 text-center">
        {/* Spinner */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-purple-900/40" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-r-violet-400 animate-spin-slow opacity-60" />
          <div className="absolute inset-2 rounded-full bg-purple-600/20 flex items-center justify-center text-2xl">
            {STEPS[step % STEPS.length].icon}
          </div>
        </div>

        <h3 className="text-lg font-bold text-white mb-2">Parsing Intelligence Data</h3>
        <p className="text-sm text-purple-300 mb-6 min-h-[20px] transition-all duration-300">
          {STEPS[step % STEPS.length].label}
        </p>

        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i < step % STEPS.length
                  ? 'bg-purple-400 scale-100'
                  : i === step % STEPS.length
                  ? 'bg-purple-500 scale-125 shadow-[0_0_6px_rgba(139,92,246,0.8)]'
                  : 'bg-purple-900/40 scale-75'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
