import React from 'react';
import { Task } from '../types';
import { Pencil, Trash2, CheckCircle, Circle } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  index: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, index, onToggle, onDelete, onEdit }) => {
  // Calculate overdue status
  const isOverdue = React.useMemo(() => {
    if (task.done) return false;
    const now = new Date();
    const [hours, minutes] = task.due_time.split(':').map(Number);
    const dueTimeDate = new Date();
    dueTimeDate.setHours(hours, minutes, 0, 0);
    return now > dueTimeDate;
  }, [task.done, task.due_time]);

  // LED Status Color Logic
  const ledColorClass = task.done
    ? 'bg-done shadow-[0_0_12px_#10b981]'
    : isOverdue
    ? 'bg-overdue shadow-[0_0_12px_#ef4444]'
    : 'bg-gray-600';

  return (
    <div className="flex justify-between items-center bg-black/20 rounded-xl p-4 transition-all hover:bg-black/30 group">
      <div 
        className="flex gap-4 items-center flex-grow min-w-0 cursor-pointer"
        onClick={() => onToggle(task.id)}
      >
        {/* Virtual LED */}
        <div className={`w-4 h-4 rounded-full transition-all duration-300 flex-shrink-0 ${ledColorClass}`} />
        
        <div className="flex flex-col min-w-0">
          <span className={`text-lg font-medium text-white truncate ${task.done ? 'line-through text-white/50' : ''}`}>
            {index + 1}. {task.title}
          </span>
          <span className={`text-sm ${isOverdue && !task.done ? 'text-overdue font-bold' : 'text-muted/80'}`}>
            Due by {task.due_time}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
        <button 
          onClick={() => onEdit(task)}
          className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
          aria-label="Edit task"
        >
          <Pencil size={18} />
        </button>
        <button 
          onClick={() => onDelete(task.id)}
          className="p-2 text-white/60 hover:text-overdue hover:bg-white/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
          aria-label="Delete task"
        >
          <Trash2 size={18} />
        </button>
        
        <button
          onClick={() => onToggle(task.id)}
          className={`px-4 py-1.5 rounded-full text-white font-bold min-w-[100px] text-center transition-colors ${
            task.done ? 'bg-done hover:bg-green-600' : 'bg-pending hover:bg-amber-600'
          }`}
        >
          {task.done ? (
            <span className="flex items-center justify-center gap-1"><CheckCircle size={16}/> Done</span>
          ) : (
            <span className="flex items-center justify-center gap-1"><Circle size={16}/> Pending</span>
          )}
        </button>
      </div>
    </div>
  );
};