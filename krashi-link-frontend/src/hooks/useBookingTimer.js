import { useState, useEffect } from 'react';

export default function useBookingTimer(endTime) {
  const [timeLeft, setTimeLeft] = useState(null);
  useEffect(() => { if (!endTime) return; const id = setInterval(() => { const t = new Date(endTime) - new Date(); setTimeLeft(t); }, 1000); return () => clearInterval(id); }, [endTime]);
  return timeLeft;
}
