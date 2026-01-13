export interface Task {
  id: string;
  title: string;
  due_time: string; // Format "HH:MM"
  done: boolean;
}

export interface EventItem {
  id: string;
  title: string;
  date: string; // Format "YYYY-MM-DD"
}

export interface AppSettings {
  auto_reset: boolean;
  reset_time: string; // Format "HH:MM"
  last_reset_date: string; // Format "YYYY-MM-DD"
}

export const DEFAULT_TASKS: Task[] = [
  { id: '1', title: "Morning Meds", done: false, due_time: "09:00" },
  { id: '2', title: "Check Emails", done: false, due_time: "09:30" },
  { id: '3', title: "Walk the Dog", done: false, due_time: "18:00" }
];

export const DEFAULT_EVENTS: EventItem[] = [
  { id: '1', title: "Project Deadline", date: "2025-10-28" },
  { id: '2', title: "Maria's Birthday", date: "2025-11-15" },
  { id: '3', title: "Winter Holiday", date: "2025-12-24" }
];

export const DEFAULT_SETTINGS: AppSettings = {
  auto_reset: true,
  reset_time: "00:00",
  last_reset_date: new Date().toISOString().split('T')[0]
};