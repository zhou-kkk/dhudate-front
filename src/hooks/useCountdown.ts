import { useState, useEffect } from 'react';

export function useCountdown(targetDateStr?: string) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!targetDateStr) {
      setTimeLeft('');
      return;
    }

    const updateCountdown = () => {
      const target = new Date(targetDateStr).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft('待结算');
        return false;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      if (d > 0) {
        setTimeLeft(`倒计时 ${d}天 ${h}小时 ${m}分钟`);
      } else {
        setTimeLeft(`倒计时 ${h}小时 ${m}分钟 ${s}秒`);
      }
      return true;
    };

    updateCountdown(); // Run immediately once
    const interval = setInterval(() => {
      const isRunning = updateCountdown();
      if (!isRunning) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDateStr]);

  return timeLeft;
}
