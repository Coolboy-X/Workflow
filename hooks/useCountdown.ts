
import { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const calculateTimeLeft = (expiryDate: string): TimeLeft | null => {
  const difference = +new Date(expiryDate) - +new Date();
  if (difference <= 0) {
    return null;
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
};

export const useCountdown = (expiryDate: string) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => calculateTimeLeft(expiryDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(expiryDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryDate]);

  return timeLeft;
};
