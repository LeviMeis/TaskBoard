import React, { useEffect, useState } from 'react';

export const Clock: React.FC = () => {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const dateString = time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <header className="text-center py-8">
      <div className="text-6xl md:text-8xl font-bold text-white drop-shadow-lg tracking-tight">
        {timeString}
      </div>
      <div className="text-xl md:text-2xl text-white/80 mt-2 font-light">
        {dateString}
      </div>
    </header>
  );
};