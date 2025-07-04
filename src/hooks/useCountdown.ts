import { useState, useEffect } from 'react';

export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isExpired: boolean;
}

export const useCountdown = (targetDate: Date | null): CountdownTime => {
  const [timeLeft, setTimeLeft] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
    isExpired: false
  });

  useEffect(() => {
    if (!targetDate) {
      setTimeLeft({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalSeconds: 0,
        isExpired: false
      });
      return;
    }

    const updateCountdown = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        const totalSeconds = Math.floor(difference / 1000);

        setTimeLeft({
          days,
          hours,
          minutes,
          seconds,
          totalSeconds,
          isExpired: false
        });
      } else {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalSeconds: 0,
          isExpired: true
        });
      }
    };

    // Initial update
    updateCountdown();

    // Set up interval
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
};

// Helper hook for license-specific countdowns
export const useLicenseCountdown = () => {
  const formatCountdown = (countdown: CountdownTime): string => {
    if (countdown.isExpired) {
      return 'Expired';
    }

    if (countdown.days > 0) {
      return `${countdown.days} day${countdown.days > 1 ? 's' : ''}`;
    }

    if (countdown.hours > 0) {
      return `${countdown.hours} hour${countdown.hours > 1 ? 's' : ''}`;
    }

    if (countdown.minutes > 0) {
      return `${countdown.minutes} minute${countdown.minutes > 1 ? 's' : ''}`;
    }

    return `${countdown.seconds} second${countdown.seconds > 1 ? 's' : ''}`;
  };

  const getUrgencyLevel = (countdown: CountdownTime): 'low' | 'medium' | 'high' | 'expired' => {
    if (countdown.isExpired) {
      return 'expired';
    }

    if (countdown.totalSeconds <= 24 * 60 * 60) { // 1 day
      return 'high';
    }

    if (countdown.totalSeconds <= 7 * 24 * 60 * 60) { // 7 days
      return 'medium';
    }

    return 'low';
  };

  const getUrgencyColor = (urgency: 'low' | 'medium' | 'high' | 'expired'): string => {
    switch (urgency) {
      case 'expired':
        return 'text-red-600';
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return {
    formatCountdown,
    getUrgencyLevel,
    getUrgencyColor
  };
};