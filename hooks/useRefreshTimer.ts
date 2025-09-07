import { useState, useEffect } from 'react';

interface RefreshTimerData {
  nextUpdateIn: string;
  lastChecked: string;
}

const formatTime = (totalSeconds: number): string => {
  if (totalSeconds <= 0) return '00:00:00';

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const timeString = [hours, minutes, seconds]
    .map(v => v.toString().padStart(2, '0'))
    .join(':');

  if (days > 0) {
    return `${days}d ${timeString}`;
  }

  return timeString;
};

const formatLastChecked = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return "just now";
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    
    return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};


export const useRefreshTimer = (lastUpdatedAt: string | null, cacheDurationMs: number): RefreshTimerData | null => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!lastUpdatedAt) {
      setTimeLeft(null);
      return;
    }

    const calculateTimeLeft = () => {
      const lastUpdateDate = new Date(lastUpdatedAt);
      const nextUpdateTime = lastUpdateDate.getTime() + cacheDurationMs;
      const difference = nextUpdateTime - Date.now();
      return Math.max(0, Math.floor(difference / 1000));
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [lastUpdatedAt, cacheDurationMs]);

  if (timeLeft === null || !lastUpdatedAt) {
    return null;
  }

  return {
    nextUpdateIn: formatTime(timeLeft),
    lastChecked: formatLastChecked(lastUpdatedAt),
  };
};