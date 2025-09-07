import React from 'react';
import { useRefreshTimer } from '../hooks/useRefreshTimer';

interface RefreshTimerProps {
  lastUpdatedAt: string | null;
  cacheDurationMs: number;
}

const RefreshTimer: React.FC<RefreshTimerProps> = ({ lastUpdatedAt, cacheDurationMs }) => {
  const timerData = useRefreshTimer(lastUpdatedAt, cacheDurationMs);

  // Don't render if there's no data yet.
  if (!timerData) {
    return null;
  }
  
  return (
    <div className="max-w-4xl mx-auto mb-6 text-center text-sm text-genshin-gold-light/70 bg-teyvat-blue/50 border border-genshin-gold/30 rounded-lg p-3 backdrop-blur-sm flex items-center justify-center flex-wrap gap-x-4 sm:gap-x-8 gap-y-2">
      {timerData && (
        <>
            <span>
                Last checked: <strong className="text-genshin-gold-light">{timerData.lastChecked}</strong>
            </span>
            <span className="h-4 w-px bg-genshin-gold/30 hidden sm:block"></span>
            <span>
                Next auto-check in: <strong className="text-genshin-gold-light font-mono">{timerData.nextUpdateIn}</strong>
            </span>
        </>
      )}
    </div>
  );
};

export default RefreshTimer;