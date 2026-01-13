import React from 'react';
import { EventItem as IEventItem } from '../types';
import { Calendar } from 'lucide-react';

interface EventItemProps {
  event: IEventItem;
  onDelete: (id: string) => void;
}

export const EventItem: React.FC<EventItemProps> = ({ event, onDelete }) => {
  const calculateCountdown = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(dateStr);
    // Fix UTC offset issue by treating the string as local time or setting time to noon
    const eventDateAtNoon = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), 12, 0, 0);
    const todayAtNoon = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0);
    
    const diffTime = eventDateAtNoon.getTime() - todayAtNoon.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today!';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 0) return 'Passed';
    return `${diffDays} days`;
  };

  const countdownText = calculateCountdown(event.date);

  return (
    <div className="flex justify-between items-center bg-black/20 rounded-xl p-4 group">
      <div className="flex items-center gap-3">
        <Calendar className="text-muted" size={20} />
        <span className="text-white font-medium">{event.title}</span>
      </div>
      <div className="flex items-center gap-3">
         <span className="text-xl font-bold text-accent min-w-[80px] text-right">
            {countdownText}
        </span>
        <button 
          onClick={() => onDelete(event.id)}
          className="text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 font-bold px-2"
        >
          &times;
        </button>
      </div>
    </div>
  );
};