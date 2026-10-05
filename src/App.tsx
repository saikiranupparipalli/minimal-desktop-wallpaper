import React, { useState, useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import './App.css';

type WidgetType = 'clock' | 'todo' | 'timer' | 'stopwatch' | 'quotes' | 'calendar';

interface Widget {
  id: string;
  type: WidgetType;
  x: number | string;
  y: number | string;
  width?: number | string;
  height?: number | string;
  data?: any;
}

interface WidgetProps {
  widget: Widget;
  isEditing: boolean;
  readOnly?: boolean;
  updateData: (id: string, data: any) => void;
  stopEditing: () => void;
}

// Widget components
const TodoWidgetComponent = ({ widget, isEditing, readOnly, updateData, stopEditing }: WidgetProps) => {
  const [tasks, setTasks] = useState<{id: number, text: string, done: boolean}[]>(
    widget.data?.tasks || [
      { id: 1, text: 'Design new layout', done: true },
      { id: 2, text: 'Implement drag & drop', done: false }
    ]
  );
  const [newTask, setNewTask] = useState('');
  const title = widget.data?.title ?? 'To-Do List';
  const color = widget.data?.color || 'var(--text-primary)';

  const addTask = () => {
    if (newTask.trim()) {
      const newTasks = [...tasks, { id: Date.now(), text: newTask, done: false }];
      setTasks(newTasks);
      updateData(widget.id, { tasks: newTasks });
      setNewTask('');
    }
  };

  const removeTask = (id: number) => {
    const newTasks = tasks.filter(t => t.id !== id);
    setTasks(newTasks);
    updateData(widget.id, { tasks: newTasks });
  };
  
  const toggleTask = (id: number) => {
    const newTasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    setTasks(newTasks);
    updateData(widget.id, { tasks: newTasks });
  };

  if (isEditing) {
    return (
      <div style={{ padding: '16px', background: 'var(--panel-bg)', borderRadius: '8px', border: '1px solid var(--panel-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Edit Settings</h4>
        <input 
          type="text" 
          value={title}
          onChange={e => updateData(widget.id, { title: e.target.value })}
          style={{ width: '100%', background: 'transparent', border: '1px solid var(--panel-border)', color: 'var(--text-primary)', padding: '8px', borderRadius: '4px' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Text Color:</label>
          <input type="color" value={widget.data?.color || '#ffffff'} onChange={e => updateData(widget.id, { color: e.target.value })} style={{ border: 'none', background: 'none', width: '30px', height: '30px', cursor: 'pointer' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Font:</label>
          <select value={widget.data?.font || 'inherit'} onChange={e => updateData(widget.id, { font: e.target.value })} style={{ flex: 1, background: 'transparent', border: '1px solid var(--panel-border)', color: 'var(--text-primary)', padding: '4px', borderRadius: '4px', outline: 'none' }}>
            <option value="inherit">Default</option><option value="Inter">Inter</option><option value="'Playfair Display', serif">Playfair</option><option value="'Space Mono', monospace">Mono</option><option value="'Outfit', sans-serif">Outfit</option>
          </select>
        </div>
        <button onClick={stopEditing} style={{ background: 'var(--text-primary)', color: 'var(--bg-color)', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', marginTop: '4px' }}>Done</button>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', padding: '8px', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ marginBottom: '16px', fontWeight: 500, fontSize: '1.2rem', color }}>{title}</h3>
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '8px' }}>
        {tasks.map(t => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color }}>
            <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)} style={{ accentColor: color, width: '16px', height: '16px', flexShrink: 0 }} /> 
            <span style={{ fontSize: '0.95rem', flex: 1, textDecoration: t.done ? 'line-through' : 'none', opacity: t.done ? 0.5 : 1 }}>{t.text}</span>
            {!readOnly && <button onClick={() => removeTask(t.id)} style={{ background: 'none', border: 'none', color, opacity: 0.5, cursor: 'pointer', fontSize: '1.2rem' }}>×</button>}
          </div>
        ))}
      </div>
      {!readOnly && (
        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
          <input 
            type="text" 
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="New task..."
            style={{ flex: 1, background: 'transparent', border: '1px solid var(--panel-border)', padding: '6px 8px', color, borderRadius: '4px', outline: 'none' }}
          />
          <button onClick={addTask} style={{ background: 'var(--panel-border)', border: 'none', color, padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>+</button>
        </div>
      )}
    </div>
  );
};

const TimerWidgetComponent = ({ widget, isEditing, updateData, stopEditing }: WidgetProps) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const title = widget.data?.title ?? 'Timer';
  const color = widget.data?.color || 'var(--text-primary)';

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  const setTimer = (mins: number) => {
    setIsRunning(false);
    setTimeLeft(mins * 60);
  };

  if (isEditing) {
    return (
      <div style={{ padding: '16px', background: 'var(--panel-bg)', borderRadius: '8px', border: '1px solid var(--panel-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Timer Settings</h4>
        <input 
          type="text" 
          value={title}
          onChange={e => updateData(widget.id, { title: e.target.value })}
          style={{ width: '100%', background: 'transparent', border: '1px solid var(--panel-border)', color: 'var(--text-primary)', padding: '8px', borderRadius: '4px', outline: 'none' }}
          placeholder="Timer Title"
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input 
            type="number"
            value={Math.floor(timeLeft / 60)}
            onChange={e => {
              const val = parseInt(e.target.value) || 0;
              setTimer(val);
            }}
            style={{ width: '80px', background: 'transparent', border: '1px solid var(--panel-border)', color: 'var(--text-primary)', padding: '8px', borderRadius: '4px', outline: 'none' }}
          />
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>minutes</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Text Color:</label>
          <input type="color" value={widget.data?.color || '#ffffff'} onChange={e => updateData(widget.id, { color: e.target.value })} style={{ border: 'none', background: 'none', width: '30px', height: '30px', cursor: 'pointer' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Font:</label>
          <select value={widget.data?.font || 'inherit'} onChange={e => updateData(widget.id, { font: e.target.value })} style={{ flex: 1, background: 'transparent', border: '1px solid var(--panel-border)', color: 'var(--text-primary)', padding: '4px', borderRadius: '4px', outline: 'none' }}>
            <option value="inherit">Default</option><option value="Inter">Inter</option><option value="'Playfair Display', serif">Playfair</option><option value="'Space Mono', monospace">Mono</option><option value="'Outfit', sans-serif">Outfit</option>
          </select>
        </div>
        <button onClick={stopEditing} style={{ background: 'var(--text-primary)', color: 'var(--bg-color)', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', marginTop: '4px' }}>Done</button>
      </div>
    );
  }

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <div style={{ textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <h3 style={{ marginBottom: '12px', fontWeight: 500, fontSize: '1.1rem', color }}>{title}</h3>
      <div style={{ fontSize: '3.5rem', fontWeight: 300, color, marginBottom: '16px' }}>
        {mins}:{secs}
      </div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <button 
          onClick={() => setIsRunning(!isRunning)}
          style={{ background: isRunning ? '#ff4444' : color, color: isRunning ? '#fff' : 'var(--bg-color)', border: 'none', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
        >
          {isRunning ? 'Stop' : 'Start'}
        </button>
        <button 
          onClick={() => setTimer(25)}
          style={{ background: 'transparent', border: `1px solid ${color}`, color, padding: '6px 16px', borderRadius: '6px', cursor: 'pointer' }}
        >
          Reset
        </button>
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        <button onClick={() => setTimer(5)} style={{ background: 'var(--panel-bg)', border: `1px solid ${color}`, color, padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', opacity: 0.8 }}>5m</button>
        <button onClick={() => setTimer(15)} style={{ background: 'var(--panel-bg)', border: `1px solid ${color}`, color, padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', opacity: 0.8 }}>15m</button>
        <button onClick={() => setTimer(25)} style={{ background: 'var(--panel-bg)', border: `1px solid ${color}`, color, padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', opacity: 0.8 }}>25m</button>
      </div>
    </div>
  );
};

const StopwatchWidgetComponent = ({ widget, isEditing, updateData, stopEditing }: WidgetProps) => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const title = widget.data?.title ?? 'Stopwatch';
  const color = widget.data?.color || 'var(--text-primary)';

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning) {
      interval = setInterval(() => setTime(t => t + 10), 10);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  if (isEditing) {
    return (
      <div style={{ padding: '16px', background: 'var(--panel-bg)', borderRadius: '8px', border: '1px solid var(--panel-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Edit Settings</h4>
        <input 
          type="text" 
          value={title}
          onChange={e => updateData(widget.id, { title: e.target.value })}
          style={{ width: '100%', background: 'transparent', border: '1px solid var(--panel-border)', color: 'var(--text-primary)', padding: '8px', borderRadius: '4px' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Text Color:</label>
          <input type="color" value={widget.data?.color || '#ffffff'} onChange={e => updateData(widget.id, { color: e.target.value })} style={{ border: 'none', background: 'none', width: '30px', height: '30px', cursor: 'pointer' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Font:</label>
          <select value={widget.data?.font || 'inherit'} onChange={e => updateData(widget.id, { font: e.target.value })} style={{ flex: 1, background: 'transparent', border: '1px solid var(--panel-border)', color: 'var(--text-primary)', padding: '4px', borderRadius: '4px', outline: 'none' }}>
            <option value="inherit">Default</option><option value="Inter">Inter</option><option value="'Playfair Display', serif">Playfair</option><option value="'Space Mono', monospace">Mono</option><option value="'Outfit', sans-serif">Outfit</option>
          </select>
        </div>
        <button onClick={stopEditing} style={{ background: 'var(--text-primary)', color: 'var(--bg-color)', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', marginTop: '4px' }}>Done</button>
      </div>
    );
  }

  const mins = Math.floor(time / 60000).toString().padStart(2, '0');
  const secs = Math.floor((time % 60000) / 1000).toString().padStart(2, '0');
  const ms = Math.floor((time % 1000) / 10).toString().padStart(2, '0');

  return (
    <div style={{ textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <h3 style={{ marginBottom: '12px', fontWeight: 500, fontSize: '1.1rem', color }}>{title}</h3>
      <div style={{ fontSize: '3.5rem', fontWeight: 300, color, marginBottom: '16px' }}>
        {mins}:{secs}.{ms}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button 
          onClick={() => setIsRunning(!isRunning)}
          style={{ background: isRunning ? '#ff4444' : color, color: isRunning ? '#fff' : 'var(--bg-color)', border: 'none', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
        >
          {isRunning ? 'Stop' : 'Start'}
        </button>
        <button 
          onClick={() => { setIsRunning(false); setTime(0); }}
          style={{ background: 'transparent', border: `1px solid ${color}`, color, padding: '6px 16px', borderRadius: '6px', cursor: 'pointer' }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

const CalendarWidgetComponent = ({ widget, isEditing, readOnly, updateData, stopEditing }: WidgetProps) => {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [scheduleInput, setScheduleInput] = useState('');

  const today = new Date();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const color = widget.data?.color || 'var(--text-primary)';
  const schedules = widget.data?.schedules || {};
  
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const handleDateClick = (day: number | null) => {
    if (!day) return;
    setSelectedDate(day);
    setScheduleInput(schedules[day] || '');
  };

  const saveSchedule = () => {
    if (selectedDate) {
      const newSchedules = { ...schedules };
      if (scheduleInput.trim()) {
        newSchedules[selectedDate] = scheduleInput.trim();
      } else {
        delete newSchedules[selectedDate];
      }
      updateData(widget.id, { schedules: newSchedules });
      setSelectedDate(null);
    }
  };

  if (isEditing) {
    return (
      <div style={{ padding: '16px', background: 'var(--panel-bg)', borderRadius: '8px', border: '1px solid var(--panel-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Edit Settings</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Text Color:</label>
          <input type="color" value={widget.data?.color || '#ffffff'} onChange={e => updateData(widget.id, { color: e.target.value })} style={{ border: 'none', background: 'none', width: '30px', height: '30px', cursor: 'pointer' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Font:</label>
          <select value={widget.data?.font || 'inherit'} onChange={e => updateData(widget.id, { font: e.target.value })} style={{ flex: 1, background: 'transparent', border: '1px solid var(--panel-border)', color: 'var(--text-primary)', padding: '4px', borderRadius: '4px', outline: 'none' }}>
            <option value="inherit">Default</option><option value="Inter">Inter</option><option value="'Playfair Display', serif">Playfair</option><option value="'Space Mono', monospace">Mono</option><option value="'Outfit', sans-serif">Outfit</option>
          </select>
        </div>
        <button onClick={stopEditing} style={{ background: 'var(--text-primary)', color: 'var(--bg-color)', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', marginTop: '4px' }}>Done</button>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', padding: '8px', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ marginBottom: '12px', fontWeight: 500, fontSize: '1.1rem', color, textAlign: 'center' }}>
        {monthNames[today.getMonth()]} {today.getFullYear()}
      </h3>
      
      {selectedDate ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ color, fontSize: '0.9rem', fontWeight: 500 }}>Task for {monthNames[today.getMonth()]} {selectedDate}:</div>
          <textarea 
            value={scheduleInput}
            onChange={e => setScheduleInput(e.target.value)}
            style={{ flex: 1, background: 'transparent', border: `1px solid ${color}`, color, padding: '8px', borderRadius: '4px', resize: 'none', outline: 'none', fontSize: '0.85rem' }}
            placeholder="Type task/schedule here..."
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
            <button onClick={saveSchedule} style={{ flex: 1, background: color, color: 'var(--bg-color)', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}>Save</button>
            <button onClick={() => setSelectedDate(null)} style={{ flex: 1, background: 'transparent', color, border: `1px solid ${color}`, padding: '6px', borderRadius: '4px', cursor: 'pointer' }}>Back</button>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, fontSize: '0.9rem', color, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
          <span style={{opacity: 0.6}}>S</span>
          <span style={{opacity: 0.6}}>M</span>
          <span style={{opacity: 0.6}}>T</span>
          <span style={{opacity: 0.6}}>W</span>
          <span style={{opacity: 0.6}}>T</span>
          <span style={{opacity: 0.6}}>F</span>
          <span style={{opacity: 0.6}}>S</span>
          {days.map((day, i) => {
            const isToday = day === today.getDate();
            const hasSchedule = day && schedules[day];
            
            let bg = 'transparent';
            let fg = color;
            let border = '1px solid transparent';
            let fontWeight = 400;

            if (hasSchedule) {
              bg = color;
              fg = 'var(--bg-color)';
              fontWeight = 600;
            } else if (isToday) {
              bg = 'transparent';
              border = `1px solid ${color}`;
              fontWeight = 600;
            }

            return (
              <span 
                key={i} 
                onClick={() => handleDateClick(day)}
                style={{ 
                  background: bg, 
                  color: fg, 
                  border: border,
                  borderRadius: '50%', 
                  fontWeight: fontWeight, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '26px', 
                  height: '26px', 
                  margin: '0 auto',
                  cursor: day ? 'pointer' : 'default',
                  opacity: day ? 1 : 0,
                  transition: 'transform 0.1s'
                }}
                title={hasSchedule ? schedules[day] : ''}
              >
                {day || ''}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};
const QUOTES_LIST = [
  "Simplicity is the ultimate sophistication.",
  "Every moment is a fresh beginning.",
  "What you do today can improve all your tomorrows.",
  "Focus on the step in front of you, not the whole staircase.",
  "Done is better than perfect.",
  "Small steps every day.",
  "Be entirely here and now.",
  "Embrace the glorious mess that you are.",
  "Clear your mind of can't.",
  "Progress, not perfection.",
  "Make today your masterpiece.",
  "Keep moving forward.",
  "One day or day one. You decide."
];

const QuotesWidgetComponent = ({ widget, isEditing, updateData, stopEditing }: WidgetProps) => {
  const [quote, setQuote] = useState('');
  
  useEffect(() => {
    const updateQuote = () => {
      const twelveHoursInMs = 12 * 60 * 60 * 1000;
      const index = Math.floor(Date.now() / twelveHoursInMs) % QUOTES_LIST.length;
      setQuote(QUOTES_LIST[index]);
    };
    
    updateQuote();
    const interval = setInterval(updateQuote, 60000);
    return () => clearInterval(interval);
  }, []);

  const color = widget.data?.color || 'var(--text-primary)';

  if (isEditing) {
    return (
      <div style={{ padding: '16px', background: 'var(--panel-bg)', borderRadius: '8px', border: '1px solid var(--panel-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Edit Settings</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Text Color:</label>
          <input type="color" value={widget.data?.color || '#ffffff'} onChange={e => updateData(widget.id, { color: e.target.value })} style={{ border: 'none', background: 'none', width: '30px', height: '30px', cursor: 'pointer' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Font:</label>
          <select value={widget.data?.font || 'inherit'} onChange={e => updateData(widget.id, { font: e.target.value })} style={{ flex: 1, background: 'transparent', border: '1px solid var(--panel-border)', color: 'var(--text-primary)', padding: '4px', borderRadius: '4px', outline: 'none' }}>
            <option value="inherit">Default</option><option value="Inter">Inter</option><option value="'Playfair Display', serif">Playfair</option><option value="'Space Mono', monospace">Mono</option><option value="'Outfit', sans-serif">Outfit</option>
          </select>
        </div>
        <button onClick={stopEditing} style={{ background: 'var(--text-primary)', color: 'var(--bg-color)', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', marginTop: '4px' }}>Done</button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <p style={{ color, fontSize: '1.2rem', fontWeight: 300, fontStyle: 'italic', margin: 0 }}>
        "{quote}"
      </p>
    </div>
  );
};

interface WallpaperData {
  id: string;
  name: string;
  boxTheme: string;
  customBg: string | null;
  font: string;
  widgets: Widget[];
}

function App() {
  const [currentView, setCurrentView] = useState<'editor' | 'wallpapers' | 'view'>('editor');
  const [savedWallpapers, setSavedWallpapers] = useState<WallpaperData[]>(() => {
    const saved = localStorage.getItem('wallpapers');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentWallpaperId, setCurrentWallpaperId] = useState<string | null>(null);
  const [viewingWallpaper, setViewingWallpaper] = useState<WallpaperData | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  
  useEffect(() => {
    if (!canvasRef.current) return;
    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        setCanvasSize({
          width: entries[0].contentRect.width,
          height: entries[0].contentRect.height
        });
      }
    });
    observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, [currentView]);

  const getPx = (val: number | string, max: number) => {
    if (typeof val === 'string' && val.endsWith('%')) {
      return (parseFloat(val) / 100) * max;
    }
    return typeof val === 'number' ? val : parseFloat(val);
  };

  const handleDelete = (id: string) => {
    const updated = savedWallpapers.filter(w => w.id !== id);
    setSavedWallpapers(updated);
    localStorage.setItem('wallpapers', JSON.stringify(updated));
    if (currentWallpaperId === id) setCurrentWallpaperId(null);
  };

  const [appTheme, setAppTheme] = useState('dark');
  const [boxTheme, setBoxTheme] = useState('dark');
  const [font, setFont] = useState('Inter');
  const [time, setTime] = useState(new Date());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [customBg, setCustomBg] = useState<string | null>(null);
  
  // Start with clock and quotes widgets separately by default
  const [widgets, setWidgets] = useState<Widget[]>([
    { id: 'default-clock', type: 'clock', x: 250, y: 100, width: 300, height: 120 },
    { id: 'default-quotes', type: 'quotes', x: 200, y: 220, width: 400, height: 150 }
  ]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleAppTheme = () => {
    const newTheme = appTheme === 'dark' ? 'light' : 'dark';
    setAppTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleBoxThemeChange = (newTheme: string) => {
    setBoxTheme(newTheme);
    setCustomBg(null);
  };

  const removeWidget = (id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const editWidget = (id: string) => {
    setEditingId(editingId === id ? null : id);
  };

  const updateWidgetData = (id: string, data: any) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, data: { ...(w.data || {}), ...data } } : w));
    
    if (currentView === 'view' && viewingWallpaper) {
      const updatedWidgets = viewingWallpaper.widgets.map(w => w.id === id ? { ...w, data: { ...(w.data || {}), ...data } } : w);
      const updatedWallpaper = { ...viewingWallpaper, widgets: updatedWidgets };
      
      setViewingWallpaper(updatedWallpaper);
      
      const updatedList = savedWallpapers.map(wp => wp.id === viewingWallpaper.id ? updatedWallpaper : wp);
      setSavedWallpapers(updatedList);
      localStorage.setItem('wallpapers', JSON.stringify(updatedList));
      
      // @ts-ignore
      if (window.require) {
        // @ts-ignore
        const { ipcRenderer } = window.require('electron');
        ipcRenderer.send('save-wallpaper', JSON.stringify(updatedWallpaper));
      }
    }
  };

  const addWidget = (type: WidgetType) => {
    setWidgets(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        type,
        x: 100 + (prev.length * 40) % 300,
        y: 100 + (prev.length * 40) % 300,
        width: 300,
        height: 250
      }
    ]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomBg(event.target.result as string);
          setBoxTheme('custom');
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSave = () => {
    const existingWallpaper = currentWallpaperId ? savedWallpapers.find(w => w.id === currentWallpaperId) : null;
    const newId = currentWallpaperId || Date.now().toString();
    const newWallpaper: WallpaperData = {
      id: newId,
      name: existingWallpaper ? existingWallpaper.name : `Wallpaper ${savedWallpapers.length + 1}`,
      boxTheme,
      customBg,
      font,
      widgets
    };
    
    let updated;
    if (currentWallpaperId && savedWallpapers.some(w => w.id === currentWallpaperId)) {
      updated = savedWallpapers.map(w => w.id === newId ? newWallpaper : w);
    } else {
      updated = [...savedWallpapers, newWallpaper];
      setCurrentWallpaperId(newId);
    }
    
    setSavedWallpapers(updated);
    localStorage.setItem('wallpapers', JSON.stringify(updated));
    
    // Save to SQLite DB via main process IPC
    // @ts-ignore
    if (window.require) {
      // @ts-ignore
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.send('save-wallpaper', JSON.stringify(newWallpaper));
    }
    
    setCurrentView('wallpapers');
  };

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Widget Renderers
  const renderWidget = (widget: Widget, readOnly = false) => {
    const commonProps: WidgetProps = {
      widget,
      isEditing: !readOnly && editingId === widget.id,
      readOnly,
      updateData: updateWidgetData,
      stopEditing: () => setEditingId(null)
    };
    
    const color = widget.data?.color || 'var(--text-primary)';

    switch (widget.type) {
      case 'clock':
        if (commonProps.isEditing) {
          return (
            <div style={{ padding: '16px', background: 'var(--panel-bg)', borderRadius: '8px', border: '1px solid var(--panel-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Edit Settings</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Style:</label>
                <select value={widget.data?.clockStyle || 'minimal'} onChange={e => updateWidgetData(widget.id, { clockStyle: e.target.value })} style={{ flex: 1, background: 'transparent', border: '1px solid var(--panel-border)', color: 'var(--text-primary)', padding: '4px', borderRadius: '4px', outline: 'none' }}>
                  <option value="minimal">Minimal</option>
                  <option value="bold">Bold & Date</option>
                  <option value="retro">Retro Digital</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Text Color:</label>
                <input type="color" value={widget.data?.color || '#ffffff'} onChange={e => updateWidgetData(widget.id, { color: e.target.value })} style={{ border: 'none', background: 'none', width: '30px', height: '30px', cursor: 'pointer' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Font:</label>
                <select value={widget.data?.font || 'inherit'} onChange={e => updateWidgetData(widget.id, { font: e.target.value })} style={{ flex: 1, background: 'transparent', border: '1px solid var(--panel-border)', color: 'var(--text-primary)', padding: '4px', borderRadius: '4px', outline: 'none' }}>
                  <option value="inherit">Default</option><option value="Inter">Inter</option><option value="'Playfair Display', serif">Playfair</option><option value="'Space Mono', monospace">Mono</option><option value="'Outfit', sans-serif">Outfit</option>
                </select>
              </div>
              <button onClick={commonProps.stopEditing} style={{ background: 'var(--text-primary)', color: 'var(--bg-color)', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', marginTop: '4px' }}>Done</button>
            </div>
          );
        }
        
        const clockStyle = widget.data?.clockStyle || 'minimal';
        const formattedDate = time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

        return (
          <div style={{ textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            {clockStyle === 'minimal' && (
              <h1 style={{ fontSize: '5rem', fontWeight: 300, letterSpacing: '-3px', margin: 0, lineHeight: 1, color }}>
                {formattedTime}
              </h1>
            )}
            {clockStyle === 'bold' && (
              <>
                <h1 style={{ fontSize: '4.5rem', fontWeight: 800, letterSpacing: '-1px', margin: 0, lineHeight: 1, color }}>
                  {formattedTime}
                </h1>
                <p style={{ color, opacity: 0.8, fontSize: '1.2rem', marginTop: '12px', fontWeight: 500, letterSpacing: '2px', textTransform: 'uppercase', margin: '12px 0 0 0' }}>
                  {formattedDate}
                </p>
              </>
            )}
            {clockStyle === 'retro' && (
              <div style={{ background: color, padding: '16px 32px', borderRadius: '16px', display: 'inline-block', border: `4px solid ${color}88` }}>
                <h1 style={{ fontSize: '4.2rem', fontWeight: 700, fontFamily: "'Space Mono', monospace", margin: 0, lineHeight: 1, color: 'var(--bg-color)' }}>
                  {formattedTime}
                </h1>
              </div>
            )}
          </div>
        );
      case 'quotes':
        return <QuotesWidgetComponent {...commonProps} />;
      case 'todo':
        return <TodoWidgetComponent {...commonProps} />;
      case 'timer':
        return <TimerWidgetComponent {...commonProps} />;
      case 'stopwatch':
        return <StopwatchWidgetComponent {...commonProps} />;
      case 'calendar':
        return <CalendarWidgetComponent {...commonProps} />;
      default:
        return null;
    }
  };

  if (currentView === 'wallpapers') {
    return (
      <div className="app-container" style={{ background: 'var(--bg-color)' }}>
        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', flex: 1, width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--text-primary)', fontWeight: 300, fontFamily: "'Inter', sans-serif", margin: 0 }}>Saved Wallpapers</h2>
            <button 
              onClick={() => {
                setCurrentWallpaperId(null);
                setBoxTheme('dark');
                setCustomBg(null);
                setFont('Inter');
                setWidgets([]);
                setCurrentView('editor');
              }}
              style={{ background: 'var(--text-primary)', color: 'var(--bg-color)', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: 500 }}
            >
              + Create New
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            {savedWallpapers.map(wp => (
              <div key={wp.id} style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--panel-bg)', padding: '24px', borderRadius: '24px', border: '1px solid var(--panel-border)' }}>
                {/* Preview Container */}
                <div 
                  className="canvas-area" 
                  data-theme={wp.boxTheme}
                  style={{ 
                    position: 'relative', 
                    height: '250px',
                    fontFamily: wp.font,
                    backgroundImage: wp.customBg ? `url(${wp.customBg})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    borderRadius: '12px',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ position: 'absolute', inset: 0, zIndex: 100 }} />
                  <div style={{ width: '200%', height: '200%', transform: 'scale(0.5)', transformOrigin: 'top left', position: 'relative' }}>
                    {wp.widgets.map(w => (
                      <div key={w.id} style={{ position: 'absolute', left: w.x, top: w.y, width: w.width, height: w.height, border: '1px solid transparent', borderRadius: '12px', fontFamily: w.data?.font || 'inherit' }}>
                        {renderWidget(w, true)}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '1.2rem', fontFamily: "'Inter', sans-serif" }}>{wp.name}</span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => {
                        setViewingWallpaper(wp);
                        setCurrentView('view');
                      }}
                      style={{ background: 'var(--panel-border)', border: 'none', color: 'var(--text-primary)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}
                    >
                      View
                    </button>
                    <button 
                      onClick={() => handleDelete(wp.id)}
                      style={{ background: 'rgba(255, 68, 68, 0.1)', border: '1px solid rgba(255, 68, 68, 0.3)', color: '#ff4444', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}
                    >
                      Delete
                    </button>
                    <button 
                      onClick={() => {
                        setCurrentWallpaperId(wp.id);
                        setBoxTheme(wp.boxTheme);
                        setCustomBg(wp.customBg);
                        setFont(wp.font);
                        setWidgets(wp.widgets);
                        setCurrentView('editor');
                      }}
                      style={{ background: 'transparent', border: '1px solid var(--panel-border)', color: 'var(--text-primary)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => console.log('Set as wallpaper:', wp.id)}
                      style={{ background: 'var(--text-primary)', border: 'none', color: 'var(--bg-color)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Set as wallpaper
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {savedWallpapers.length === 0 && (
              <div style={{ color: 'var(--text-secondary)', padding: '32px 0', fontSize: '1.2rem' }}>No saved wallpapers yet. Click "Create New" to start!</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'view' && viewingWallpaper) {
    return (
      <div 
        className="app-container" 
        data-theme={viewingWallpaper.boxTheme}
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          fontFamily: viewingWallpaper.font,
          backgroundColor: 'var(--bg-color)',
          backgroundImage: viewingWallpaper.customBg ? `url(${viewingWallpaper.customBg})` : 'var(--bg-image, none)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          overflow: 'hidden'
        }}
      >
        <button 
          onClick={() => setCurrentView('wallpapers')} 
          style={{ 
            position: 'absolute',
            top: '24px',
            left: '24px',
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.4)',
            color: '#fff', 
            border: '1px solid rgba(255, 255, 255, 0.2)', 
            backdropFilter: 'blur(12px)',
            padding: '10px 20px', 
            borderRadius: '8px', 
            cursor: 'pointer', 
            fontSize: '1rem', 
            fontWeight: 500,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          ← Back
        </button>
        
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          {viewingWallpaper.widgets.map(w => (
            <div key={w.id} style={{ position: 'absolute', left: typeof w.x === 'number' ? `${w.x}px` : w.x, top: typeof w.y === 'number' ? `${w.y}px` : w.y, width: w.width, height: w.height, border: '1px solid transparent', borderRadius: '12px', fontFamily: w.data?.font || 'inherit' }}>
              {renderWidget(w, true)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="editor-layout animate-fade-in">
        {/* Sidebar */}
        <div className="sidebar" style={{ overflowY: 'auto' }}>
          <div style={{ marginTop: '0', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <button 
              onClick={toggleAppTheme}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                padding: '0',
                cursor: 'pointer',
                fontSize: '1.5rem',
                lineHeight: 1
              }}
              title={`Toggle ${appTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {appTheme === 'dark' ? '☀️' : '🌙'}
            </button>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '16px', color: 'var(--text-primary)', lineHeight: 1.2, letterSpacing: '-0.5px', fontFamily: "'Inter', sans-serif" }}>
              Minimal<br/>Desktop<br/>Wallpaper
            </h1>
          </div>
          
          <div style={{ marginTop: '2rem', background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', padding: '20px', borderRadius: '16px', fontFamily: 'var(--font-main)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '2rem', marginBottom: '1.2rem', color: 'var(--text-primary)', fontWeight: 300, fontFamily: "'Inter', sans-serif", letterSpacing: '-0.5px', lineHeight: 1.4 }}>
            Themes<br/> 
            </h3>
            <div className="theme-picker" style={{ flexWrap: 'wrap', gap: '8px' }}>
              <button 
                className={`theme-btn ${boxTheme === 'dark' ? 'active' : ''}`}
                style={{ background: '#121212' }}
                onClick={() => handleBoxThemeChange('dark')}
                title="Dark"
              />
              <button 
                className={`theme-btn ${boxTheme === 'light' ? 'active' : ''}`}
                style={{ background: '#f7f7f7', border: '1px solid #e5e5e5' }}
                onClick={() => handleBoxThemeChange('light')}
                title="Light"
              />
              <button 
                className={`theme-btn ${boxTheme === 'ocean' ? 'active' : ''}`}
                style={{ background: '#0f172a' }}
                onClick={() => handleBoxThemeChange('ocean')}
                title="Ocean"
              />
              <button 
                className={`theme-btn ${boxTheme === 'sunset' ? 'active' : ''}`}
                style={{ background: '#451a03' }}
                onClick={() => handleBoxThemeChange('sunset')}
                title="Sunset"
              />
              <button 
                className={`theme-btn ${boxTheme === 'gradient' ? 'active' : ''}`}
                style={{ background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' }}
                onClick={() => handleBoxThemeChange('gradient')}
                title="Gradient"
              />
              
              {/* Custom Image Upload Button */}
              <button 
                className={`theme-btn ${boxTheme === 'custom' ? 'active' : ''}`}
                style={{ 
                  background: customBg ? `url(${customBg}) center/cover no-repeat` : '#333', 
                  color: '#fff', 
                  fontSize: customBg ? '0' : '28px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  padding: 0,
                  margin: 0,
                  lineHeight: 1,
                  overflow: 'hidden'
                }}
                onClick={() => document.getElementById('bg-upload')?.click()}
                title="Upload Custom Image"
              >
                 {!customBg && <span style={{ position: 'relative', top: '1px' }}>🖼️</span>}
              </button>
              <input id="bg-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
            </div>
          </div>
          
          <div style={{ marginTop: '2.5rem', background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', padding: '20px', borderRadius: '16px', fontFamily: 'var(--font-main)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '2rem', marginBottom: '1.2rem', color: 'var(--text-primary)', fontWeight: 300, fontFamily: "'Inter', sans-serif", letterSpacing: '-0.5px' }}>
              styles
            </h3>
            <select 
              value={font} 
              onChange={(e) => setFont(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '10px', 
                background: 'var(--bg-color)', 
                color: 'var(--text-primary)', 
                border: '1px solid var(--panel-border)', 
                borderRadius: '6px',
                fontFamily: 'var(--font-main)',
                outline: 'none'
              }}
            >
              <option value="Inter">Inter (Clean)</option>
              <option value="'Playfair Display', serif">Playfair Display (Elegant)</option>
              <option value="'Space Mono', monospace">Space Mono (Tech)</option>
              <option value="'Outfit', sans-serif">Outfit (Modern)</option>
            </select>
          </div>
          
          <div style={{ marginTop: '2.5rem', background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', padding: '20px', borderRadius: '16px', fontFamily: 'var(--font-main)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--text-primary)', textAlign: 'center', fontWeight: 300, fontFamily: "'Inter', sans-serif", letterSpacing: '-0.5px' }}>
              widgets
            </h3>
            <div className="widget-list">
              <button className="widget-btn" onClick={() => addWidget('clock')}>
                <span>Clock</span>
                <span className="widget-icon">+</span>
              </button>
              <button className="widget-btn" onClick={() => addWidget('quotes')}>
                <span>Quotes</span>
                <span className="widget-icon">+</span>
              </button>
              <button className="widget-btn" onClick={() => addWidget('todo')}>
                <span>To-Do List</span>
                <span className="widget-icon">+</span>
              </button>
              <button className="widget-btn" onClick={() => addWidget('timer')}>
                <span>Timer</span>
                <span className="widget-icon">+</span>
              </button>
              <button className="widget-btn" onClick={() => addWidget('stopwatch')}>
                <span>Stopwatch</span>
                <span className="widget-icon">+</span>
              </button>
              <button className="widget-btn" onClick={() => addWidget('calendar')}>
                <span>Calendar</span>
                <span className="widget-icon">+</span>
              </button>
            </div>
          </div>
          
        </div>

        {/* Canvas area wrapper to hold the canvas and the button below it */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '16px' }}>
          
          <div 
            className="canvas-area" 
            data-theme={boxTheme}
            ref={canvasRef}
            style={{ 
              flex: 1,
              position: 'relative', 
              fontFamily: font,
              backgroundImage: customBg ? `url(${customBg})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              borderRadius: '16px',
              overflow: 'hidden'
            }}
          >
          {/* Sketch watermark */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.2, fontSize: '3.5rem', letterSpacing: '2px', pointerEvents: 'none', userSelect: 'none', zIndex: 0 }}>
            appearance box
          </div>
          {widgets.map(widget => (
            <Rnd
              key={widget.id}
              default={{
                x: getPx(widget.x, canvasSize.width),
                y: getPx(widget.y, canvasSize.height),
                width: widget.width || 250,
                height: widget.height || 150,
              }}
              onDragStop={(e, d) => {
                const px = (d.x / canvasSize.width) * 100;
                const py = (d.y / canvasSize.height) * 100;
                setWidgets(prev => prev.map(w => w.id === widget.id ? { ...w, x: `${px}%`, y: `${py}%` } : w));
              }}
              onResizeStop={(e, direction, ref, delta, position) => {
                setWidgets(prev => prev.map(w => w.id === widget.id ? { 
                  ...w, 
                  width: parseInt(ref.style.width, 10), 
                  height: parseInt(ref.style.height, 10),
                  ...position
                } : w));
              }}
              bounds="parent"
              cancel="input, textarea, button, select, option, .widget-toolbar-btn"
              style={{
                border: '1px solid transparent',
                borderRadius: '12px',
                transition: 'border 0.2s',
                fontFamily: widget.data?.font || 'inherit',
              }}
              className="widget-container"
            >
              <div className="widget-toolbar">
                <button className="widget-toolbar-btn edit" onClick={() => editWidget(widget.id)} title={editingId === widget.id ? "Done" : "Edit"}>
                  {editingId === widget.id ? "✓" : "✎"}
                </button>
                <button className="widget-toolbar-btn delete" onClick={() => removeWidget(widget.id)} title="Remove">✕</button>
              </div>
              {renderWidget(widget)}
            </Rnd>
          ))}
          </div>

          {/* Action buttons below canvas */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
            <button 
              onClick={() => setCurrentView('wallpapers')}
              style={{ background: 'transparent', border: '1px solid var(--text-primary)', color: 'var(--text-primary)', fontSize: '1rem', cursor: 'pointer', padding: '8px 20px', borderRadius: '8px', fontWeight: 500 }}
            >
              View Wallpapers
            </button>
            <button 
              onClick={handleSave}
              style={{ background: 'var(--text-primary)', color: 'var(--bg-color)', border: 'none', fontSize: '1rem', cursor: 'pointer', padding: '8px 24px', borderRadius: '8px', fontWeight: 600 }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
