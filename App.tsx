import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Clock } from './components/Clock';
import { TaskItem } from './components/TaskItem';
import { EventItem } from './components/EventItem';
import { 
  Task, 
  EventItem as IEventItem, 
  AppSettings, 
  DEFAULT_TASKS, 
  DEFAULT_EVENTS, 
  DEFAULT_SETTINGS 
} from './types';
import { Settings, Plus, RefreshCw, Save } from 'lucide-react';

const App: React.FC = () => {
  // --- State Management ---
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('dashboard_tasks');
    return saved ? JSON.parse(saved) : DEFAULT_TASKS;
  });

  const [events, setEvents] = useState<IEventItem[]>(() => {
    const saved = localStorage.getItem('dashboard_events');
    return saved ? JSON.parse(saved) : DEFAULT_EVENTS;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('dashboard_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // --- Persistence ---
  useEffect(() => localStorage.setItem('dashboard_tasks', JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem('dashboard_events', JSON.stringify(events)), [events]);
  useEffect(() => localStorage.setItem('dashboard_settings', JSON.stringify(settings)), [settings]);

  // --- Logic: Task Sorting ---
  const getSortedTasks = useCallback(() => {
    const pending = tasks.filter(t => !t.done);
    const done = tasks.filter(t => t.done);
    
    // Sort by due time
    const sortByTime = (a: Task, b: Task) => a.due_time.localeCompare(b.due_time);
    
    pending.sort(sortByTime);
    done.sort(sortByTime);
    
    return [...pending, ...done];
  }, [tasks]);

  // --- Logic: Auto Reset ---
  useEffect(() => {
    if (!settings.auto_reset) return;

    const checkReset = () => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const currentTimeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

      // If we haven't reset today AND it's past the reset time
      if (settings.last_reset_date !== todayStr && currentTimeStr >= settings.reset_time) {
        console.log("Auto-resetting tasks...");
        setTasks(prev => prev.map(t => ({ ...t, done: false })));
        setSettings(prev => ({ ...prev, last_reset_date: todayStr }));
      }
    };

    const interval = setInterval(checkReset, 60000); // Check every minute
    checkReset(); // Check immediately on mount
    return () => clearInterval(interval);
  }, [settings]);

  // --- Handlers ---
  const handleToggleTask = (id: string) => {
    setTasks(prev => {
      const newTasks = prev.map(t => t.id === id ? { ...t, done: !t.done } : t);
      
      // Mimic the python "cycle" logic roughly by letting the sort function handle visual order on next render
      return newTasks;
    });
  };

  const handleDeleteTask = (id: string) => {
    if (confirm('Delete this task?')) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle || !newTaskTime) return;
    const newTask: Task = {
      id: uuidv4(),
      title: newTaskTitle,
      due_time: newTaskTime,
      done: false
    };
    setTasks(prev => [...prev, newTask]);
    setNewTaskTitle('');
    setNewTaskTime('');
  };

  const handleEditTaskSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    setTasks(prev => prev.map(t => t.id === editingTask.id ? editingTask : t));
    setEditingTask(null);
  };

  const handleResetAll = () => {
    if (confirm('Are you sure you want to reset all tasks to Pending?')) {
      setTasks(prev => prev.map(t => ({ ...t, done: false })));
      // Update last reset to today so auto-reset doesn't trigger again immediately if past time
      const todayStr = new Date().toISOString().split('T')[0];
      setSettings(prev => ({ ...prev, last_reset_date: todayStr }));
    }
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle || !newEventDate) return;
    const newEvent: IEventItem = {
      id: uuidv4(),
      title: newEventTitle,
      date: newEventDate
    };
    setEvents(prev => {
        // Sort events by date
        const updated = [...prev, newEvent];
        updated.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        return updated;
    });
    setNewEventTitle('');
    setNewEventDate('');
  };

  const handleDeleteEvent = (id: string) => {
      setEvents(prev => prev.filter(e => e.id !== id));
  };

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      
      const key = parseInt(e.key);
      if (!isNaN(key) && key > 0) {
        // Get sorted list to match visual order
        const sorted = getSortedTasks();
        if (key <= sorted.length) {
          const taskToToggle = sorted[key - 1];
          handleToggleTask(taskToToggle.id);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [getSortedTasks]); // Dependency ensures we toggle the correct visual item

  const sortedTasks = getSortedTasks();

  return (
    <div className="min-h-screen text-[#f0f2f5] pb-12 font-sans animate-gradient-bg">
      <div className="max-w-7xl mx-auto px-6">
        <Clock />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Events & Settings (4 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Events Panel */}
            <div className="bg-panel backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
              <header className="flex justify-between items-center mb-4 pb-3 border-b border-white/10">
                <h2 className="text-2xl font-bold text-white">Events</h2>
              </header>
              <div className="flex flex-col gap-3">
                {events.map(event => (
                  <EventItem key={event.id} event={event} onDelete={handleDeleteEvent} />
                ))}
                {events.length === 0 && <p className="text-muted text-center py-4">No upcoming events.</p>}
              </div>
              
              <form onSubmit={handleAddEvent} className="mt-6 pt-4 border-t border-white/10 flex gap-2">
                 <input 
                    type="text" 
                    placeholder="Event Name" 
                    className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white flex-grow focus:outline-none focus:border-accent"
                    value={newEventTitle}
                    onChange={e => setNewEventTitle(e.target.value)}
                 />
                 <input 
                    type="date" 
                    className="bg-gray-700/50 border border-gray-600 rounded-lg px-2 py-2 text-white w-32 text-sm focus:outline-none focus:border-accent"
                    value={newEventDate}
                    onChange={e => setNewEventDate(e.target.value)}
                 />
                 <button type="submit" className="bg-accent/80 hover:bg-accent p-2 rounded-lg text-white">
                    <Plus size={20} />
                 </button>
              </form>
            </div>

            {/* Settings Panel */}
            <div className="bg-panel backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
              <header className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                <Settings className="text-muted" size={24} />
                <h2 className="text-2xl font-bold text-white">Settings</h2>
              </header>
              
              <div className="flex items-center justify-between mb-4">
                <label className="text-white/90 font-medium">Auto Reset Daily</label>
                <div 
                    onClick={() => setSettings(s => ({...s, auto_reset: !s.auto_reset}))}
                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${settings.auto_reset ? 'bg-done' : 'bg-gray-600'}`}
                >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${settings.auto_reset ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <label className="text-white/90 font-medium">Reset Time</label>
                <input 
                  type="time" 
                  className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1 text-white focus:outline-none focus:border-accent"
                  value={settings.reset_time}
                  onChange={(e) => setSettings(s => ({...s, reset_time: e.target.value}))}
                />
              </div>

              <button 
                onClick={handleResetAll}
                className="w-full py-3 rounded-lg bg-orange-700 hover:bg-orange-600 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <RefreshCw size={18} />
                Reset All Tasks Now
              </button>
            </div>
          </div>

          {/* Right Column: Tasks (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-panel backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl h-full flex flex-col">
              <header className="flex justify-between items-end mb-6 pb-4 border-b border-white/10">
                <div>
                    <h1 className="text-3xl font-bold text-white">Today's Tasks</h1>
                    <p className="text-muted mt-1">Press <kbd className="bg-gray-700 px-1 rounded text-xs">1</kbd> - <kbd className="bg-gray-700 px-1 rounded text-xs">9</kbd> to toggle</p>
                </div>
                <div className="text-right">
                    <span className="text-accent font-bold text-2xl">{tasks.filter(t => !t.done).length}</span>
                    <span className="text-muted ml-1">pending</span>
                </div>
              </header>

              <div className="flex flex-col gap-3 flex-grow">
                {sortedTasks.map((task, idx) => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    index={idx} 
                    onToggle={handleToggleTask} 
                    onDelete={handleDeleteTask}
                    onEdit={setEditingTask}
                  />
                ))}
                {tasks.length === 0 && (
                    <div className="text-center py-10 text-muted italic">No tasks added yet.</div>
                )}
              </div>

              <form onSubmit={handleAddTask} className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row gap-3">
                <input 
                  type="text" 
                  placeholder="Add a new task..." 
                  className="flex-grow bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  required
                />
                 <input 
                  type="time" 
                  className="bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
                  value={newTaskTime}
                  onChange={e => setNewTaskTime(e.target.value)}
                  required
                />
                <button 
                    type="submit" 
                    className="bg-accent hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg"
                >
                    <Plus size={20} />
                    Add Task
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal Overlay */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleEditTaskSave} className="bg-[#161c2d] border border-white/10 p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6">Edit Task</h3>
            
            <div className="mb-4">
                <label className="block text-sm text-muted mb-2">Title</label>
                <input 
                    type="text" 
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
                    value={editingTask.title}
                    onChange={e => setEditingTask({...editingTask, title: e.target.value})}
                />
            </div>
            
            <div className="mb-8">
                <label className="block text-sm text-muted mb-2">Due Time</label>
                <input 
                    type="time" 
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
                    value={editingTask.due_time}
                    onChange={e => setEditingTask({...editingTask, due_time: e.target.value})}
                />
            </div>

            <div className="flex gap-4">
                <button 
                    type="button" 
                    onClick={() => setEditingTask(null)}
                    className="flex-1 py-3 rounded-lg bg-gray-700 text-white font-medium hover:bg-gray-600 transition-colors"
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    className="flex-1 py-3 rounded-lg bg-accent text-white font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                    <Save size={18} /> Save Changes
                </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default App;