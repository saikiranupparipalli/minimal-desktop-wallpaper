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
  width: number;
  height: number;
  isEditing: boolean;
  readOnly?: boolean;
  hideTitle?: boolean;
  updateData: (id: string, data: any) => void;
  onSizePresetChange?: (id: string, type: WidgetType, preset: 'compact' | 'default' | 'large' | 'xlarge') => void;
  stopEditing: () => void;
}

// Widget Edit Modal Panel
const WidgetEditPanel = ({
  title,
  widget,
  updateData,
  onSizePresetChange,
  stopEditing,
  children
}: {
  title: string;
  widget: Widget;
  updateData: (id: string, data: any) => void;
  onSizePresetChange?: (id: string, type: WidgetType, preset: 'compact' | 'default' | 'large' | 'xlarge') => void;
  stopEditing: () => void;
  children?: React.ReactNode;
}) => {
  const currentPreset = widget.data?.sizeScale || 'default';
  
  return (
    <div 
      className="widget-edit-modal animate-scale-in"
      onClick={e => e.stopPropagation()}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em', color: 'inherit' }}>{title}</h4>
        <button 
          onClick={stopEditing}
          style={{ background: 'transparent', border: 'none', color: 'inherit', opacity: 0.6, cursor: 'pointer', fontSize: '1.1rem', padding: '0 4px', lineHeight: 1 }}
          title="Close Settings"
        >
          ✕
        </button>
      </div>

      {children}

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label style={{ fontSize: '0.82rem', opacity: 0.8, minWidth: '75px' }}>Size:</label>
        <select 
          value={currentPreset}
          onChange={e => onSizePresetChange && onSizePresetChange(widget.id, widget.type, e.target.value as any)}
          className="widget-edit-select"
        >
          {currentPreset === 'custom' && (
            <option value="custom">Custom ({Math.round(typeof widget.width === 'number' ? widget.width : parseInt(widget.width as string, 10) || 0)}×{Math.round(typeof widget.height === 'number' ? widget.height : parseInt(widget.height as string, 10) || 0)})</option>
          )}
          <option value="compact">Compact</option>
          <option value="default">Normal</option>
          <option value="large">Large</option>
          <option value="xlarge">Extra Large</option>
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label style={{ fontSize: '0.82rem', opacity: 0.8, minWidth: '75px' }}>Color:</label>
        <input 
          type="color" 
          value={widget.data?.color || '#ffffff'} 
          onChange={e => updateData(widget.id, { color: e.target.value })} 
          style={{ border: 'none', background: 'none', width: '28px', height: '28px', cursor: 'pointer', padding: 0 }} 
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label style={{ fontSize: '0.82rem', opacity: 0.8, minWidth: '75px' }}>Font:</label>
        <select 
          value={widget.data?.font || 'inherit'} 
          onChange={e => updateData(widget.id, { font: e.target.value })} 
          className="widget-edit-select"
        >
          <option value="inherit">Default</option>
          <option value="Inter">Inter</option>
          <option value="'Playfair Display', serif">Playfair</option>
          <option value="'Space Mono', monospace">Mono</option>
          <option value="'Outfit', sans-serif">Outfit</option>
        </select>
      </div>

      <button onClick={stopEditing} className="widget-edit-done-btn">
        Done
      </button>
    </div>
  );
};

// Widget components
const ClockWidgetComponent = ({ 
  widget, 
  width, 
  height, 
  isEditing, 
  updateData, 
  onSizePresetChange, 
  stopEditing, 
  time 
}: WidgetProps & { time: Date }) => {
  const color = widget.data?.color || 'var(--text-primary)';
  const clockStyle = widget.data?.clockStyle || 'minimal';
  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  if (isEditing) {
    return (
      <WidgetEditPanel
        title="Clock Settings"
        widget={widget}
        updateData={updateData}
        onSizePresetChange={onSizePresetChange}
        stopEditing={stopEditing}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.82rem', opacity: 0.8, minWidth: '75px' }}>Style:</label>
          <select 
            value={clockStyle} 
            onChange={e => updateData(widget.id, { clockStyle: e.target.value })} 
            className="widget-edit-select"
          >
            <option value="minimal">Minimal</option>
            <option value="bold">Bold & Date</option>
            <option value="retro">Retro Digital</option>
          </select>
        </div>
      </WidgetEditPanel>
    );
  }

  if (clockStyle === 'minimal') {
    const fontSize = Math.max(20, Math.min(width * 0.22, height * 0.72, 120));
    return (
      <div style={{ textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
        <h1 style={{ fontSize: `${fontSize}px`, fontWeight: 300, letterSpacing: `${Math.max(-4, -fontSize * 0.04)}px`, margin: 0, lineHeight: 1, color, whiteSpace: 'nowrap' }}>
          {formattedTime}
        </h1>
      </div>
    );
  }

  if (clockStyle === 'bold') {
    const timeFontSize = Math.max(18, Math.min(width * 0.19, height * 0.50, 100));
    const dateFontSize = Math.max(10, Math.min(timeFontSize * 0.28, 20));
    const marginTop = Math.max(4, timeFontSize * 0.12);
    return (
      <div style={{ textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
        <h1 style={{ fontSize: `${timeFontSize}px`, fontWeight: 800, letterSpacing: '-1px', margin: 0, lineHeight: 1, color, whiteSpace: 'nowrap' }}>
          {formattedTime}
        </h1>
        <p style={{ color, opacity: 0.8, fontSize: `${dateFontSize}px`, marginTop: `${marginTop}px`, fontWeight: 500, letterSpacing: '2px', textTransform: 'uppercase', margin: `${marginTop}px 0 0 0`, whiteSpace: 'nowrap' }}>
          {formattedDate}
        </p>
      </div>
    );
  }

  // Retro
  const timeFontSize = Math.max(16, Math.min(width * 0.17, height * 0.48, 85));
  const padV = Math.max(4, timeFontSize * 0.18);
  const padH = Math.max(10, timeFontSize * 0.35);
  return (
    <div style={{ textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
      <div style={{ background: color, padding: `${padV}px ${padH}px`, borderRadius: '14px', display: 'inline-block', border: `3px solid ${color}88` }}>
        <h1 style={{ fontSize: `${timeFontSize}px`, fontWeight: 700, fontFamily: "'Space Mono', monospace", margin: 0, lineHeight: 1, color: 'var(--bg-color)', whiteSpace: 'nowrap' }}>
          {formattedTime}
        </h1>
      </div>
    </div>
  );
};

const TodoWidgetComponent = ({ widget, width, height: _h, isEditing, readOnly, hideTitle, updateData, onSizePresetChange, stopEditing }: WidgetProps) => {
  const [tasks, setTasks] = useState<{id: number, text: string, done: boolean}[]>(
    widget.data?.tasks || [
      { id: 1, text: 'Design new layout', done: true },
      { id: 2, text: 'Implement drag & drop', done: false }
    ]
  );
  const [newTask, setNewTask] = useState('');
  const title = widget.data?.title ?? 'To-Do List';
  const color = widget.data?.color || 'var(--text-primary)';

  const titleFontSize = Math.max(13, Math.min(width * 0.065, 20));
  const itemFontSize = Math.max(11, Math.min(width * 0.048, 16));

  const addTask = () => {
    if (newTask.trim()) {
      const newTasks = [...tasks, { id: Date.now(), text: newTask.trim(), done: false }];
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
      <WidgetEditPanel
        title="To-Do Settings"
        widget={widget}
        updateData={updateData}
        onSizePresetChange={onSizePresetChange}
        stopEditing={stopEditing}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.82rem', opacity: 0.8, minWidth: '75px' }}>Title:</label>
          <input 
            type="text" 
            value={title}
            onChange={e => updateData(widget.id, { title: e.target.value })}
            className="widget-edit-input"
          />
        </div>
      </WidgetEditPanel>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', padding: '12px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', overflow: 'hidden' }}>
      {!hideTitle && (
        <h3 style={{ marginBottom: '10px', fontWeight: 600, fontSize: `${titleFontSize}px`, color, flexShrink: 0, fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
          {title}
        </h3>
      )}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', marginBottom: '8px', paddingRight: '4px', minHeight: 0 }}>
        {tasks.map(t => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color, width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
            <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)} style={{ accentColor: color, width: '15px', height: '15px', flexShrink: 0, cursor: 'pointer', borderRadius: '4px' }} /> 
            <span style={{ fontSize: `${itemFontSize}px`, flex: 1, minWidth: 0, textDecoration: t.done ? 'line-through' : 'none', opacity: t.done ? 0.5 : 1, wordBreak: 'break-word', overflowWrap: 'anywhere', lineHeight: 1.3 }}>{t.text}</span>
            {!readOnly && (
              <button 
                onClick={() => removeTask(t.id)} 
                style={{ background: 'none', border: 'none', color, opacity: 0.5, cursor: 'pointer', fontSize: '1.1rem', padding: '0 4px', flexShrink: 0, borderRadius: '50%' }} 
                title="Remove task"
              >
                ×
              </button>
            )}
          </div>
        ))}
        {tasks.length === 0 && (
          <div style={{ color, opacity: 0.5, fontSize: `${itemFontSize}px`, fontStyle: 'italic', padding: '4px 0' }}>No tasks</div>
        )}
      </div>
      {!readOnly && (
        <div style={{ display: 'flex', gap: '6px', marginTop: 'auto', flexShrink: 0 }}>
          <input 
            type="text" 
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="New task..."
            style={{ flex: 1, minWidth: 0, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--panel-border)', padding: '6px 12px', color, borderRadius: '9999px', outline: 'none', fontSize: `${Math.max(11, itemFontSize * 0.9)}px` }}
          />
          <button 
            onClick={addTask} 
            className="widget-pill-btn"
            style={{ background: color, border: 'none', color: 'var(--bg-color)', padding: '6px 14px', borderRadius: '9999px', cursor: 'pointer', flexShrink: 0, fontWeight: 600, fontSize: `${Math.max(11, itemFontSize * 0.9)}px` }}
          >
            +
          </button>
        </div>
      )}
    </div>
  );
};

const TimerWidgetComponent = ({ widget, width, height, isEditing, hideTitle, updateData, onSizePresetChange, stopEditing }: WidgetProps) => {
  const initialDuration = widget.data?.durationMinutes ?? 25;
  const [durationMinutes, setDurationMinutes] = useState<number>(initialDuration);
  const [timeLeft, setTimeLeft] = useState<number>(initialDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const endTimeRef = useRef<number | null>(null);

  const title = widget.data?.title ?? 'Timer';
  const color = widget.data?.color || 'var(--text-primary)';

  const timeFontSize = Math.max(22, Math.min(width * 0.22, height * 0.36, 75));
  const titleFontSize = Math.max(11, Math.min(timeFontSize * 0.34, 18));
  const btnPadding = `${Math.max(4, timeFontSize * 0.1)}px ${Math.max(12, timeFontSize * 0.3)}px`;
  const btnFontSize = Math.max(11, timeFontSize * 0.26);
  const quickBtnPadding = `${Math.max(3, timeFontSize * 0.08)}px ${Math.max(10, timeFontSize * 0.2)}px`;
  const quickBtnFontSize = Math.max(10, timeFontSize * 0.22);

  // Play a soft, natural chime on completion
  const playAlertSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      
      const playTone = (freq: number, start: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.12, start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + dur);
      };

      playTone(587.33, now, 0.4);       // D5
      playTone(880, now + 0.15, 0.7);    // A5
    } catch (_err) {
      // AudioContext could be blocked by browser policy prior to gesture
    }
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning) {
      endTimeRef.current = Date.now() + timeLeft * 1000;
      interval = setInterval(() => {
        if (!endTimeRef.current) return;
        const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining <= 0) {
          setIsRunning(false);
          setIsFinished(true);
          playAlertSound();
          clearInterval(interval);
        }
      }, 250);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const setTimerPreset = (mins: number) => {
    setIsRunning(false);
    setIsFinished(false);
    setDurationMinutes(mins);
    setTimeLeft(mins * 60);
    updateData(widget.id, { durationMinutes: mins });
  };

  const handleStartToggle = () => {
    if (isFinished || timeLeft <= 0) {
      setIsFinished(false);
      setTimeLeft(durationMinutes * 60);
      setIsRunning(true);
    } else {
      setIsRunning(!isRunning);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsFinished(false);
    setTimeLeft(durationMinutes * 60);
  };

  if (isEditing) {
    return (
      <WidgetEditPanel
        title="Timer Settings"
        widget={widget}
        updateData={updateData}
        onSizePresetChange={onSizePresetChange}
        stopEditing={stopEditing}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.82rem', opacity: 0.8, minWidth: '75px' }}>Title:</label>
          <input 
            type="text" 
            value={title}
            onChange={e => updateData(widget.id, { title: e.target.value })}
            className="widget-edit-input"
            placeholder="Timer Title"
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.82rem', opacity: 0.8, minWidth: '75px' }}>Minutes:</label>
          <input 
            type="number"
            min="1"
            max="180"
            value={durationMinutes}
            onChange={e => {
              const val = Math.max(1, parseInt(e.target.value) || 1);
              setTimerPreset(val);
            }}
            className="widget-edit-input"
            style={{ width: '80px' }}
          />
        </div>
      </WidgetEditPanel>
    );
  }

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <div style={{ textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '8px', boxSizing: 'border-box', overflow: 'hidden' }}>
      {!hideTitle && (
        <h3 style={{ marginBottom: `${Math.max(4, timeFontSize * 0.15)}px`, fontWeight: 600, fontSize: `${titleFontSize}px`, color, whiteSpace: 'nowrap', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
          {title}
        </h3>
      )}
      <div 
        className={isFinished ? 'timer-finished-pulse' : ''}
        style={{ 
          fontSize: `${timeFontSize}px`, 
          fontWeight: 300, 
          color: isFinished ? '#ff5252' : color, 
          marginBottom: `${Math.max(6, timeFontSize * 0.2)}px`, 
          lineHeight: 1, 
          whiteSpace: 'nowrap',
          letterSpacing: '-0.5px',
          fontVariantNumeric: 'tabular-nums'
        }}
      >
        {isFinished ? '00:00' : `${mins}:${secs}`}
      </div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: `${Math.max(4, timeFontSize * 0.16)}px` }}>
        <button 
          onClick={handleStartToggle}
          className="widget-pill-btn"
          style={{ 
            background: isRunning ? 'rgba(255, 68, 68, 0.9)' : color, 
            color: isRunning ? '#fff' : 'var(--bg-color)', 
            border: 'none', 
            padding: btnPadding, 
            borderRadius: '9999px', 
            cursor: 'pointer', 
            fontWeight: 600, 
            fontSize: `${btnFontSize}px`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        >
          {isFinished ? 'Restart' : (isRunning ? 'Stop' : 'Start')}
        </button>
        <button 
          onClick={handleReset}
          className="widget-pill-btn"
          style={{ 
            background: 'transparent', 
            border: `1px solid ${color}`, 
            color, 
            padding: btnPadding, 
            borderRadius: '9999px', 
            cursor: 'pointer', 
            fontSize: `${btnFontSize}px`,
            opacity: 0.9
          }}
        >
          Reset
        </button>
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        {[5, 15, 25].map(m => (
          <button 
            key={m}
            onClick={() => setTimerPreset(m)} 
            className="widget-pill-btn"
            style={{ 
              background: durationMinutes === m ? 'rgba(255, 255, 255, 0.15)' : 'var(--panel-bg)', 
              border: `1px solid ${durationMinutes === m ? color : 'var(--panel-border)'}`, 
              color, 
              padding: quickBtnPadding, 
              borderRadius: '9999px', 
              cursor: 'pointer', 
              fontSize: `${quickBtnFontSize}px`, 
              opacity: durationMinutes === m ? 1 : 0.75 
            }}
          >
            {m}m
          </button>
        ))}
      </div>
    </div>
  );
};

const StopwatchWidgetComponent = ({ widget, width, height, isEditing, hideTitle, updateData, onSizePresetChange, stopEditing }: WidgetProps) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const startTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  const title = widget.data?.title ?? 'Stopwatch';
  const color = widget.data?.color || 'var(--text-primary)';

  const timeFontSize = Math.max(18, Math.min(width * 0.18, height * 0.36, 70));
  const titleFontSize = Math.max(11, Math.min(timeFontSize * 0.34, 18));
  const btnPadding = `${Math.max(4, timeFontSize * 0.1)}px ${Math.max(14, timeFontSize * 0.32)}px`;
  const btnFontSize = Math.max(11, timeFontSize * 0.26);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now();
      const update = () => {
        const now = performance.now();
        setElapsedTime(accumulatedTimeRef.current + (now - startTimeRef.current));
        animFrameRef.current = requestAnimationFrame(update);
      };
      animFrameRef.current = requestAnimationFrame(update);
    } else {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    }
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isRunning]);

  const handleToggleRunning = () => {
    if (isRunning) {
      accumulatedTimeRef.current += performance.now() - startTimeRef.current;
      setElapsedTime(accumulatedTimeRef.current);
      setIsRunning(false);
    } else {
      setIsRunning(true);
    }
  };

  const handleReset = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setIsRunning(false);
    accumulatedTimeRef.current = 0;
    setElapsedTime(0);
  };

  if (isEditing) {
    return (
      <WidgetEditPanel
        title="Stopwatch Settings"
        widget={widget}
        updateData={updateData}
        onSizePresetChange={onSizePresetChange}
        stopEditing={stopEditing}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.82rem', opacity: 0.8, minWidth: '75px' }}>Title:</label>
          <input 
            type="text" 
            value={title}
            onChange={e => updateData(widget.id, { title: e.target.value })}
            className="widget-edit-input"
          />
        </div>
      </WidgetEditPanel>
    );
  }

  const totalSeconds = Math.floor(elapsedTime / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
  const secs = (totalSeconds % 60).toString().padStart(2, '0');
  const hundredths = Math.floor((elapsedTime % 1000) / 10).toString().padStart(2, '0');
  const formattedTime = hours > 0 
    ? `${hours}:${mins}:${secs}.${hundredths}` 
    : `${mins}:${secs}.${hundredths}`;

  return (
    <div style={{ textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '8px', boxSizing: 'border-box', overflow: 'hidden' }}>
      {!hideTitle && (
        <h3 style={{ marginBottom: `${Math.max(4, timeFontSize * 0.15)}px`, fontWeight: 600, fontSize: `${titleFontSize}px`, color, whiteSpace: 'nowrap', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
          {title}
        </h3>
      )}
      <div style={{ 
        fontSize: `${timeFontSize}px`, 
        fontWeight: 300, 
        color, 
        marginBottom: `${Math.max(6, timeFontSize * 0.2)}px`, 
        lineHeight: 1, 
        whiteSpace: 'nowrap',
        letterSpacing: '-0.5px',
        fontVariantNumeric: 'tabular-nums'
      }}>
        {formattedTime}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button 
          onClick={handleToggleRunning}
          className="widget-pill-btn"
          style={{ 
            background: isRunning ? 'rgba(255, 68, 68, 0.9)' : color, 
            color: isRunning ? '#fff' : 'var(--bg-color)', 
            border: 'none', 
            padding: btnPadding, 
            borderRadius: '9999px', 
            cursor: 'pointer', 
            fontWeight: 600, 
            fontSize: `${btnFontSize}px`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        >
          {isRunning ? 'Stop' : 'Start'}
        </button>
        <button 
          onClick={handleReset}
          className="widget-pill-btn"
          style={{ 
            background: 'transparent', 
            border: `1px solid ${color}`, 
            color, 
            padding: btnPadding, 
            borderRadius: '9999px', 
            cursor: 'pointer', 
            fontSize: `${btnFontSize}px`,
            opacity: 0.9
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

const CalendarWidgetComponent = ({ widget, width, height, isEditing, readOnly, updateData, onSizePresetChange, stopEditing }: WidgetProps) => {
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

  const titleFontSize = Math.max(12, Math.min(width * 0.065, height * 0.09, 20));
  const availW = width - 24;
  const availH = height - 52;
  const cellSize = Math.max(18, Math.min(Math.floor(availW / 7.5), Math.floor(availH / 6.5), 44));
  const cellFontSize = Math.max(10, Math.min(cellSize * 0.48, 16));

  const handleDateClick = (day: number | null) => {
    if (!day || readOnly) return;
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
      <WidgetEditPanel
        title="Calendar Settings"
        widget={widget}
        updateData={updateData}
        onSizePresetChange={onSizePresetChange}
        stopEditing={stopEditing}
      />
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', padding: '10px 12px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', overflow: 'hidden' }}>
      <h3 style={{ marginBottom: '6px', fontWeight: 600, fontSize: `${titleFontSize}px`, color, textAlign: 'center', flexShrink: 0, whiteSpace: 'nowrap', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
        {monthNames[today.getMonth()]} {today.getFullYear()}
      </h3>
      
      {selectedDate ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', minHeight: 0 }}>
          <div style={{ color, fontSize: '0.85rem', fontWeight: 500 }}>Task for {monthNames[today.getMonth()]} {selectedDate}:</div>
          <textarea 
            value={scheduleInput}
            onChange={e => setScheduleInput(e.target.value)}
            style={{ flex: 1, background: 'transparent', border: `1px solid ${color}`, color, padding: '8px', borderRadius: '4px', resize: 'none', outline: 'none', fontSize: '0.85rem' }}
            placeholder="Type task/schedule here..."
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
            <button onClick={saveSchedule} className="widget-pill-btn" style={{ flex: 1, background: color, color: 'var(--bg-color)', border: 'none', padding: '7px 14px', borderRadius: '9999px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Save</button>
            <button onClick={() => setSelectedDate(null)} className="widget-pill-btn" style={{ flex: 1, background: 'transparent', color, border: `1px solid ${color}`, padding: '7px 14px', borderRadius: '9999px', cursor: 'pointer', fontSize: '0.85rem' }}>Back</button>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, minHeight: 0, fontSize: `${cellFontSize}px`, color, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center', alignItems: 'center' }}>
          <span style={{opacity: 0.6, fontSize: `${Math.max(10, cellFontSize * 0.9)}px`}}>S</span>
          <span style={{opacity: 0.6, fontSize: `${Math.max(10, cellFontSize * 0.9)}px`}}>M</span>
          <span style={{opacity: 0.6, fontSize: `${Math.max(10, cellFontSize * 0.9)}px`}}>T</span>
          <span style={{opacity: 0.6, fontSize: `${Math.max(10, cellFontSize * 0.9)}px`}}>W</span>
          <span style={{opacity: 0.6, fontSize: `${Math.max(10, cellFontSize * 0.9)}px`}}>T</span>
          <span style={{opacity: 0.6, fontSize: `${Math.max(10, cellFontSize * 0.9)}px`}}>F</span>
          <span style={{opacity: 0.6, fontSize: `${Math.max(10, cellFontSize * 0.9)}px`}}>S</span>
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
                className="calendar-date-cell"
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
                  width: `${cellSize}px`, 
                  height: `${cellSize}px`, 
                  fontSize: `${cellFontSize}px`,
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
  "Nature does not hurry, yet everything is accomplished.",
  "Every moment is a fresh beginning.",
  "What you do today can improve all your tomorrows.",
  "Focus on the step in front of you, not the whole staircase.",
  "Done is better than perfect.",
  "Small steps every day lead to big changes.",
  "Be entirely here and now.",
  "Quiet the mind, and the soul will speak.",
  "Clear your mind of can't.",
  "Progress, not perfection.",
  "Make today your masterpiece.",
  "Keep moving forward with quiet confidence.",
  "One day or day one. You decide.",
  "Breathe in calm, exhale chaos.",
  "In the middle of difficulty lies opportunity.",
  "Less, but better.",
  "Do what you can, with what you have, where you are.",
  "Stay patient and trust your journey.",
  "Order and clarity bring freedom."
];

const QuotesWidgetComponent = ({ widget, width, height, isEditing, readOnly, hideTitle: _h, updateData, onSizePresetChange, stopEditing }: WidgetProps) => {
  const [quoteIndex, setQuoteIndex] = useState(() => {
    if (typeof widget.data?.quoteIndex === 'number') {
      return widget.data.quoteIndex;
    }
    const twelveHoursInMs = 12 * 60 * 60 * 1000;
    return Math.floor(Date.now() / twelveHoursInMs) % QUOTES_LIST.length;
  });

  const shuffleQuote = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextIndex = (quoteIndex + 1 + Math.floor(Math.random() * (QUOTES_LIST.length - 1))) % QUOTES_LIST.length;
    setQuoteIndex(nextIndex);
    updateData(widget.id, { customQuote: undefined, quoteIndex: nextIndex });
  };

  const color = widget.data?.color || 'var(--text-primary)';
  const currentQuote = widget.data?.customQuote || QUOTES_LIST[quoteIndex % QUOTES_LIST.length];
  const quoteFontSize = Math.max(12, Math.min(width * 0.05, height * 0.32, 28));

  if (isEditing) {
    return (
      <WidgetEditPanel
        title="Quotes Settings"
        widget={widget}
        updateData={updateData}
        onSizePresetChange={onSizePresetChange}
        stopEditing={stopEditing}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.82rem', opacity: 0.8, minWidth: '75px' }}>Custom:</label>
          <input 
            type="text" 
            value={widget.data?.customQuote || ''} 
            onChange={e => updateData(widget.id, { customQuote: e.target.value })} 
            className="widget-edit-input"
            placeholder="Leave empty for rotating quotes"
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
          <button 
            onClick={() => shuffleQuote()}
            className="widget-pill-btn"
            style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              border: '1px solid rgba(255, 255, 255, 0.2)', 
              color: 'inherit', 
              padding: '6px 14px', 
              borderRadius: '9999px', 
              cursor: 'pointer', 
              fontSize: '0.8rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            ↻ Shuffle Quote
          </button>
        </div>
      </WidgetEditPanel>
    );
  }

  return (
    <div className="quote-container" style={{ textAlign: 'center', width: '100%', height: '100%', padding: '6px 14px', boxSizing: 'border-box', overflow: 'hidden' }}>
      <p style={{ color, fontSize: `${quoteFontSize}px`, fontWeight: 300, fontStyle: 'italic', margin: 0, lineHeight: 1.35, maxWidth: '100%', wordBreak: 'break-word' }}>
        "{currentQuote}"
      </p>
      {!readOnly && (
        <div style={{ position: 'absolute', bottom: '6px', right: '8px' }}>
          <button 
            onClick={shuffleQuote}
            className="quote-shuffle-btn"
            title="Next inspirational quote"
            aria-label="Next quote"
          >
            ↻
          </button>
        </div>
      )}
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
  canvasWidth?: number;
  canvasHeight?: number;
}

const getWidgetMinSize = (type: WidgetType) => {
  switch (type) {
    case 'calendar':
      return { minWidth: 200, minHeight: 200, defaultWidth: 280, defaultHeight: 290 };
    case 'todo':
      return { minWidth: 180, minHeight: 140, defaultWidth: 290, defaultHeight: 250 };
    case 'clock':
      return { minWidth: 160, minHeight: 60, defaultWidth: 320, defaultHeight: 110 };
    case 'timer':
      return { minWidth: 180, minHeight: 120, defaultWidth: 280, defaultHeight: 210 };
    case 'stopwatch':
      return { minWidth: 180, minHeight: 110, defaultWidth: 280, defaultHeight: 185 };
    case 'quotes':
      return { minWidth: 180, minHeight: 50, defaultWidth: 420, defaultHeight: 100 };
    default:
      return { minWidth: 160, minHeight: 60, defaultWidth: 260, defaultHeight: 150 };
  }
};

const getWidgetSizePreset = (type: WidgetType, preset: 'compact' | 'default' | 'large' | 'xlarge') => {
  switch (preset) {
    case 'compact':
      switch (type) {
        case 'clock': return { width: 220, height: 75 };
        case 'quotes': return { width: 300, height: 70 };
        case 'timer': return { width: 220, height: 160 };
        case 'stopwatch': return { width: 220, height: 145 };
        case 'todo': return { width: 240, height: 190 };
        case 'calendar': return { width: 220, height: 220 };
        default: return { width: 200, height: 100 };
      }
    case 'large':
      switch (type) {
        case 'clock': return { width: 440, height: 150 };
        case 'quotes': return { width: 540, height: 140 };
        case 'timer': return { width: 340, height: 250 };
        case 'stopwatch': return { width: 340, height: 220 };
        case 'todo': return { width: 360, height: 320 };
        case 'calendar': return { width: 340, height: 350 };
        default: return { width: 340, height: 200 };
      }
    case 'xlarge':
      switch (type) {
        case 'clock': return { width: 560, height: 190 };
        case 'quotes': return { width: 660, height: 170 };
        case 'timer': return { width: 400, height: 300 };
        case 'stopwatch': return { width: 400, height: 260 };
        case 'todo': return { width: 440, height: 390 };
        case 'calendar': return { width: 400, height: 420 };
        default: return { width: 400, height: 250 };
      }
    case 'default':
    default:
      switch (type) {
        case 'clock': return { width: 320, height: 110 };
        case 'quotes': return { width: 420, height: 100 };
        case 'timer': return { width: 280, height: 210 };
        case 'stopwatch': return { width: 280, height: 185 };
        case 'todo': return { width: 290, height: 250 };
        case 'calendar': return { width: 280, height: 290 };
        default: return { width: 280, height: 160 };
      }
  }
};

const getEffectiveWidgetSize = (widget: Widget) => {
  const minSize = getWidgetMinSize(widget.type);
  const rawW = typeof widget.width === 'number' 
    ? widget.width 
    : (typeof widget.width === 'string' ? parseInt(widget.width, 10) : minSize.defaultWidth) || minSize.defaultWidth;
  const rawH = typeof widget.height === 'number' 
    ? widget.height 
    : (typeof widget.height === 'string' ? parseInt(widget.height, 10) : minSize.defaultHeight) || minSize.defaultHeight;

  return {
    width: Math.max(minSize.minWidth, rawW),
    height: Math.max(minSize.minHeight, rawH),
  };
};

const getWidgetPixelCoords = (w: Widget, baseW: number, baseH: number) => {
  let x: number;
  let y: number;

  if (typeof w.x === 'string' && w.x.endsWith('%')) {
    x = (parseFloat(w.x) / 100) * baseW;
  } else if (typeof w.x === 'number') {
    x = w.x;
  } else {
    x = parseFloat(w.x) || 0;
  }

  if (typeof w.y === 'string' && w.y.endsWith('%')) {
    y = (parseFloat(w.y) / 100) * baseH;
  } else if (typeof w.y === 'number') {
    y = w.y;
  } else {
    y = parseFloat(w.y) || 0;
  }

  const effectiveSize = getEffectiveWidgetSize(w);

  return { x, y, width: effectiveSize.width, height: effectiveSize.height };
};

const SavedWallpaperCard = ({
  wp,
  onView,
  onDelete,
  onEdit,
  onSetAsWallpaper,
  renderWidget
}: {
  wp: WallpaperData;
  onView: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onSetAsWallpaper: () => void;
  renderWidget: (widget: Widget, readOnly?: boolean, hideTitle?: boolean) => React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 380, height: 230 });

  useEffect(() => {
    if (!containerRef.current) return;
    const update = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth || 380;
        const h = containerRef.current.clientHeight || 230;
        if (w > 50 && h > 50) {
          setSize({ width: w, height: h });
        }
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const fallbackW = Math.max(800, ...wp.widgets.map(w => {
    const x = typeof w.x === 'number' ? w.x : 0;
    const width = typeof w.width === 'number' ? w.width : 250;
    return x + width + 40;
  }));
  const fallbackH = Math.max(500, ...wp.widgets.map(w => {
    const y = typeof w.y === 'number' ? w.y : 0;
    const height = typeof w.height === 'number' ? w.height : 150;
    return y + height + 40;
  }));

  const baseW = wp.canvasWidth || fallbackW;
  const baseH = wp.canvasHeight || fallbackH;

  const scale = Math.min(size.width / baseW, size.height / baseH);
  const offsetX = (size.width - baseW * scale) / 2;
  const offsetY = (size.height - baseH * scale) / 2;

  return (
    <div className="saved-wallpaper-card animate-fade-in">
      {/* Preview Container */}
      <div 
        ref={containerRef}
        className="saved-wallpaper-preview" 
        data-theme={wp.boxTheme}
        onClick={onView}
        style={{ 
          cursor: 'pointer',
          fontFamily: wp.font,
          backgroundImage: wp.customBg ? `url(${wp.customBg})` : undefined,
        }}
        title="Click to view full screen"
      >
        <div 
          style={{ 
            position: 'absolute', 
            left: `${offsetX}px`, 
            top: `${offsetY}px`, 
            width: `${baseW}px`, 
            height: `${baseH}px`, 
            transform: `scale(${scale})`, 
            transformOrigin: 'top left',
            pointerEvents: 'none'
          }}
        >
          {wp.widgets.map(w => {
            const coords = getWidgetPixelCoords(w, baseW, baseH);
            return (
              <div 
                key={w.id} 
                style={{ 
                  position: 'absolute', 
                  left: `${coords.x}px`, 
                  top: `${coords.y}px`, 
                  width: `${coords.width}px`, 
                  height: `${coords.height}px`, 
                  border: '1px solid transparent', 
                  borderRadius: '12px', 
                  fontFamily: w.data?.font || 'inherit',
                  overflow: 'hidden'
                }}
              >
                {renderWidget(w, true, true)}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
        <h3 style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.15rem', fontFamily: 'var(--font-heading)', letterSpacing: '-0.025em' }}>
          {wp.name}
        </h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button 
            onClick={onView}
            className="btn-pill"
            style={{ background: 'var(--panel-border)', border: 'none', color: 'var(--text-primary)', padding: '8px 16px', borderRadius: '9999px', cursor: 'pointer', fontWeight: 500, fontSize: '0.88rem' }}
          >
            View
          </button>
          <button 
            onClick={onDelete}
            className="btn-pill"
            style={{ background: 'rgba(255, 68, 68, 0.12)', border: '1px solid rgba(255, 68, 68, 0.3)', color: '#ff5252', padding: '8px 16px', borderRadius: '9999px', cursor: 'pointer', fontWeight: 500, fontSize: '0.88rem' }}
          >
            Delete
          </button>
          <button 
            onClick={onEdit}
            className="btn-pill"
            style={{ background: 'transparent', border: '1px solid var(--panel-border)', color: 'var(--text-primary)', padding: '8px 16px', borderRadius: '9999px', cursor: 'pointer', fontWeight: 500, fontSize: '0.88rem' }}
          >
            Edit
          </button>
          <button 
            onClick={onSetAsWallpaper}
            className="btn-pill"
            style={{ background: 'var(--text-primary)', border: 'none', color: 'var(--bg-color)', padding: '8px 18px', borderRadius: '9999px', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
          >
            Set as wallpaper
          </button>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [currentView, setCurrentView] = useState<'editor' | 'wallpapers' | 'view'>('editor');
  const [viewSource, setViewSource] = useState<'editor' | 'wallpapers'>('wallpapers');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    // @ts-ignore
    if (window.require) {
      try {
        // @ts-ignore
        const { ipcRenderer } = window.require('electron');
        ipcRenderer.send('toggle-fullscreen');
      } catch (err) {
        console.error('Electron fullscreen error:', err);
      }
    }
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Browser fullscreen error:', err);
    }
  };

  useEffect(() => {
    if (currentView !== 'view') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.fullscreenElement) {
        setCurrentView(viewSource);
      } else if (e.key === 'f' || e.key === 'F') {
        if (!['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
          toggleFullscreen();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, viewSource, isFullscreen]);

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
    { id: 'default-clock', type: 'clock', x: 240, y: 100, width: 320, height: 110 },
    { id: 'default-quotes', type: 'quotes', x: 180, y: 290, width: 440, height: 100 }
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

  const handleSizePresetChange = (id: string, type: WidgetType, preset: 'compact' | 'default' | 'large' | 'xlarge') => {
    const presetSize = getWidgetSizePreset(type, preset);
    setWidgets(prev => prev.map(w => w.id === id ? {
      ...w,
      width: presetSize.width,
      height: presetSize.height,
      data: { ...(w.data || {}), sizeScale: preset }
    } : w));

    if (currentView === 'view' && viewingWallpaper) {
      const updatedWidgets = viewingWallpaper.widgets.map(w => w.id === id ? {
        ...w,
        width: presetSize.width,
        height: presetSize.height,
        data: { ...(w.data || {}), sizeScale: preset }
      } : w);
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

  const updateWidgetGeometryInView = (id: string, updates: { x?: number; y?: number; width?: number; height?: number }) => {
    if (!viewingWallpaper) return;
    
    const updatedWidgets = viewingWallpaper.widgets.map(w => {
      if (w.id !== id) return w;
      return {
        ...w,
        ...(updates.x !== undefined ? { x: updates.x } : {}),
        ...(updates.y !== undefined ? { y: updates.y } : {}),
        ...(updates.width !== undefined ? { width: updates.width } : {}),
        ...(updates.height !== undefined ? { height: updates.height } : {}),
      };
    });

    const updatedWallpaper = { ...viewingWallpaper, widgets: updatedWidgets };
    setViewingWallpaper(updatedWallpaper);

    if (currentWallpaperId === viewingWallpaper.id || viewingWallpaper.id === 'temp-preview') {
      setWidgets(updatedWidgets);
    }

    const updatedList = savedWallpapers.map(wp => wp.id === viewingWallpaper.id ? updatedWallpaper : wp);
    setSavedWallpapers(updatedList);
    localStorage.setItem('wallpapers', JSON.stringify(updatedList));

    // @ts-ignore
    if (window.require) {
      // @ts-ignore
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.send('save-wallpaper', JSON.stringify(updatedWallpaper));
    }
  };

  const addWidget = (type: WidgetType) => {
    const minSize = getWidgetMinSize(type);
    let defaultX = 240;
    let defaultY = 100;

    switch (type) {
      case 'calendar':
        defaultX = 20;
        defaultY = 60;
        break;
      case 'todo':
        defaultX = 490;
        defaultY = 60;
        break;
      case 'clock':
        defaultX = 240;
        defaultY = 100;
        break;
      case 'quotes':
        defaultX = 180;
        defaultY = 290;
        break;
      case 'timer':
        defaultX = 260;
        defaultY = 20;
        break;
      case 'stopwatch':
        defaultX = 260;
        defaultY = 400;
        break;
    }

    let x = defaultX;
    let y = defaultY;
    let attempts = 0;
    while (attempts < 8 && widgets.some(w => {
      const wx = getPx(w.x, canvasSize.width);
      const wy = getPx(w.y, canvasSize.height);
      return Math.abs(wx - x) < 50 && Math.abs(wy - y) < 50;
    })) {
      x = (x + 30) % 520;
      y = (y + 30) % 380;
      attempts++;
    }

    setWidgets(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        type,
        x,
        y,
        width: minSize.defaultWidth,
        height: minSize.defaultHeight
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
      widgets,
      canvasWidth: canvasSize.width,
      canvasHeight: canvasSize.height
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

  // Widget Renderers
  const renderWidget = (widget: Widget, readOnly = false, hideTitle?: boolean) => {
    const effectiveSize = getEffectiveWidgetSize(widget);
    const shouldHideTitle = hideTitle ?? (readOnly || currentView === 'view');
    const commonProps: WidgetProps = {
      widget,
      width: effectiveSize.width,
      height: effectiveSize.height,
      isEditing: !readOnly && editingId === widget.id,
      readOnly,
      hideTitle: shouldHideTitle,
      updateData: updateWidgetData,
      onSizePresetChange: handleSizePresetChange,
      stopEditing: () => setEditingId(null)
    };

    switch (widget.type) {
      case 'clock':
        return <ClockWidgetComponent {...commonProps} time={time} />;
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button 
                onClick={() => setCurrentView('editor')}
                className="btn-pill"
                style={{ background: 'transparent', border: '1px solid var(--panel-border)', color: 'var(--text-primary)', padding: '10px 20px', borderRadius: '9999px', cursor: 'pointer', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                title="Return to Editor"
              >
                ← Back to Editor
              </button>
              <h2 style={{ fontSize: '2.2rem', color: 'var(--text-primary)', fontWeight: 700, fontFamily: 'var(--font-heading)', letterSpacing: '-0.035em', margin: 0 }}>Saved Wallpapers</h2>
            </div>
            <button 
              onClick={() => {
                setCurrentWallpaperId(null);
                setBoxTheme('dark');
                setCustomBg(null);
                setFont('Inter');
                setWidgets([]);
                setCurrentView('editor');
              }}
              className="btn-pill"
              style={{ background: 'var(--text-primary)', color: 'var(--bg-color)', border: 'none', padding: '12px 26px', borderRadius: '9999px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600, boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }}
            >
              + Create New
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '28px', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
            {savedWallpapers.map(wp => (
              <SavedWallpaperCard
                key={wp.id}
                wp={wp}
                onView={() => {
                  setViewingWallpaper(wp);
                  setViewSource('wallpapers');
                  setCurrentView('view');
                }}
                onDelete={() => handleDelete(wp.id)}
                onEdit={() => {
                  setCurrentWallpaperId(wp.id);
                  setBoxTheme(wp.boxTheme);
                  setCustomBg(wp.customBg);
                  setFont(wp.font);
                  setWidgets(wp.widgets);
                  setCurrentView('editor');
                }}
                onSetAsWallpaper={() => {
                  setViewingWallpaper(wp);
                  setViewSource('wallpapers');
                  setCurrentView('view');
                  // @ts-ignore
                  if (window.require) {
                    try {
                      // @ts-ignore
                      const { ipcRenderer } = window.require('electron');
                      ipcRenderer.send('save-wallpaper', JSON.stringify(wp));
                    } catch (_err) {}
                  }
                }}
                renderWidget={renderWidget}
              />
            ))}
            {savedWallpapers.length === 0 && (
              <div style={{ color: 'var(--text-secondary)', padding: '60px 0', fontSize: '1.15rem', gridColumn: '1 / -1', textAlign: 'center' }}>
                No saved wallpapers yet. Click "<strong>+ Create New</strong>" or save from the editor to get started!
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'view' && viewingWallpaper) {
    const fallbackW = Math.max(800, ...viewingWallpaper.widgets.map(w => {
      const x = typeof w.x === 'number' ? w.x : 0;
      const width = typeof w.width === 'number' ? w.width : 250;
      return x + width + 50;
    }));
    const fallbackH = Math.max(600, ...viewingWallpaper.widgets.map(w => {
      const y = typeof w.y === 'number' ? w.y : 0;
      const height = typeof w.height === 'number' ? w.height : 150;
      return y + height + 50;
    }));
    const baseW = viewingWallpaper.canvasWidth || fallbackW;
    const baseH = viewingWallpaper.canvasHeight || fallbackH;
    const screenW = windowDimensions.width;
    const screenH = windowDimensions.height;

    const scale = Math.min(screenW / baseW, screenH / baseH);
    const offsetX = (screenW - baseW * scale) / 2;
    const offsetY = (screenH - baseH * scale) / 2;
    const stageStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${offsetX}px`,
      top: `${offsetY}px`,
      width: `${baseW}px`,
      height: `${baseH}px`,
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
    };

    return (
      <div 
        className="app-container" 
        data-theme={viewingWallpaper.boxTheme}
        onClick={() => {
          if (!showControls) setShowControls(true);
        }}
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
          overflow: 'hidden',
          padding: 0
        }}
      >
        {/* Floating Controls Bar */}
        <div 
          className={`view-toolbar ${showControls ? 'visible' : 'hidden'}`}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            right: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 1000,
            pointerEvents: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'auto' }}>
            <button 
              onClick={() => setCurrentView(viewSource)} 
              className="view-toolbar-btn view-back-btn"
              title="Return to previous screen"
            >
              ← Back
            </button>
            <span className="view-wallpaper-title">
              {viewingWallpaper.name}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'auto' }}>
            {/* Lock/Unlock Button (Icon Only) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLocked(!isLocked);
                if (!isLocked) setEditingId(null);
              }}
              className={`view-toolbar-btn view-icon-btn ${isLocked ? 'locked' : ''}`}
              title={isLocked ? "Unlock Widgets (Editing is currently locked)" : "Lock Widgets (Prevent accidental moves or edits)"}
              aria-label={isLocked ? "Unlock Widgets" : "Lock Widgets"}
            >
              <span className="btn-icon">{isLocked ? "🔒" : "🔓"}</span>
            </button>

            {/* Toggle Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="view-toolbar-btn view-fullscreen-btn"
              title={isFullscreen ? "Exit Fullscreen (Esc)" : "Enter Fullscreen (F11)"}
            >
              <span className="btn-icon">{isFullscreen ? "⤓" : "⛶"}</span>
              <span>{isFullscreen ? "Exit Fullscreen" : "Full Screen"}</span>
            </button>

            {/* Hide Toolbar Button (Icon Only) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowControls(false);
              }}
              className="view-toolbar-btn view-icon-btn"
              title="Hide Toolbar"
              aria-label="Hide Toolbar"
            >
              <span className="btn-icon">👁️</span>
            </button>
          </div>
        </div>

        {/* Floating show button when controls are hidden (Icon Only) */}
        {!showControls && (
          <button 
            className="view-show-controls-btn view-icon-btn"
            onClick={(e) => {
              e.stopPropagation();
              setShowControls(true);
            }}
            title="Show Toolbar"
            aria-label="Show Toolbar"
          >
            <span className="btn-icon">👁️</span>
          </button>
        )}
        
        {/* Widget Canvas Stage */}
        <div className={`stage-area ${editingId ? 'editing-active' : ''}`} style={stageStyle}>
          {viewingWallpaper.widgets.map(w => {
            const coords = getWidgetPixelCoords(w, baseW, baseH);
            const minSize = getWidgetMinSize(w.type);
            return (
              <Rnd
                key={w.id}
                scale={scale}
                bounds="parent"
                disableDragging={isLocked}
                enableResizing={!isLocked}
                position={{
                  x: coords.x,
                  y: coords.y,
                }}
                size={{
                  width: coords.width,
                  height: coords.height,
                }}
                minWidth={minSize.minWidth}
                minHeight={minSize.minHeight}
                onDragStop={(_e, d) => {
                  if (isLocked) return;
                  updateWidgetGeometryInView(w.id, { x: d.x, y: d.y });
                }}
                onResizeStop={(_e, _direction, ref, _delta, position) => {
                  if (isLocked) return;
                  const newW = Math.max(minSize.minWidth, parseInt(ref.style.width, 10));
                  const newH = Math.max(minSize.minHeight, parseInt(ref.style.height, 10));
                  updateWidgetGeometryInView(w.id, {
                    width: newW,
                    height: newH,
                    x: position.x,
                    y: position.y,
                  });
                  updateWidgetData(w.id, { sizeScale: 'custom' });
                }}
                cancel="input, textarea, button, select, option, .widget-toolbar-btn, .calendar-date-cell, .widget-edit-modal, .widget-edit-select, .widget-edit-input, .widget-edit-done-btn"
                className={`widget-container view-widget-rnd ${isLocked ? 'locked' : ''} ${editingId === w.id ? 'is-editing' : ''}`}
                style={{
                  border: '1px solid transparent',
                  borderRadius: '12px',
                  transition: 'border 0.2s',
                  fontFamily: w.data?.font || 'inherit',
                  zIndex: editingId === w.id ? 1000 : 1,
                }}
              >
                {!isLocked && (
                  <div className="widget-toolbar view-widget-toolbar">
                    <button 
                      className="widget-toolbar-btn edit" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(editingId === w.id ? null : w.id);
                      }} 
                      title={editingId === w.id ? "Done" : "Edit Settings"}
                    >
                      {editingId === w.id ? "✓" : "✎"}
                    </button>
                  </div>
                )}
                {renderWidget(w, isLocked ? true : (w.type === 'calendar' ? false : (editingId === w.id ? false : true)))}
              </Rnd>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="editor-layout animate-fade-in">
        {/* Sidebar */}
        <div className="sidebar" style={{ overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <button 
              onClick={toggleAppTheme}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                padding: '0',
                cursor: 'pointer',
                fontSize: '1.4rem',
                lineHeight: 1
              }}
              title={`Toggle ${appTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {appTheme === 'dark' ? '☀️' : '🌙'}
            </button>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: '12px', color: 'var(--text-primary)', lineHeight: 1.15, letterSpacing: '-0.04em', fontFamily: 'var(--font-heading)' }}>
              Minimal<br/>Desktop<br/>Wallpaper
            </h1>
          </div>
          
          <div style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', padding: '18px 20px', borderRadius: '16px', fontFamily: 'var(--font-main)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '12px', color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'var(--font-heading)', letterSpacing: '-0.025em' }}>
              Themes
            </h3>
            
            <div className="theme-picker" style={{ flexWrap: 'wrap', gap: '8px' }}>
              <button 
                className={`theme-btn ${boxTheme === 'dark' ? 'active' : ''}`}
                style={{ background: '#121316' }}
                onClick={() => handleBoxThemeChange('dark')}
                title="Dark (Carbon)"
              />
              <button 
                className={`theme-btn ${boxTheme === 'light' ? 'active' : ''}`}
                style={{ background: '#fbfbfa' }}
                onClick={() => handleBoxThemeChange('light')}
                title="Light (Paper)"
              />
              <button 
                className={`theme-btn ${boxTheme === 'ocean' ? 'active' : ''}`}
                style={{ background: 'linear-gradient(135deg, #0a1118 0%, #16202c 100%)' }}
                onClick={() => handleBoxThemeChange('ocean')}
                title="Ocean (Nordic Fjord)"
              />
              <button 
                className={`theme-btn ${boxTheme === 'sunset' ? 'active' : ''}`}
                style={{ background: 'linear-gradient(135deg, #1f1614 0%, #3a221c 100%)' }}
                onClick={() => handleBoxThemeChange('sunset')}
                title="Sunset (Terracotta)"
              />
              <button 
                className={`theme-btn ${boxTheme === 'gradient' ? 'active' : ''}`}
                style={{ background: 'linear-gradient(135deg, #0e131f 0%, #201d36 100%)' }}
                onClick={() => handleBoxThemeChange('gradient')}
                title="Gradient (Aurora)"
              />
              <button 
                className={`theme-btn ${boxTheme === 'mac-sonoma' ? 'active' : ''}`}
                style={{ background: 'linear-gradient(135deg, #181b29 0%, #2c2d42 55%, #c89666 100%)' }}
                onClick={() => handleBoxThemeChange('mac-sonoma')}
                title="Sonoma"
              />
              <button 
                className={`theme-btn ${boxTheme === 'mac-ventura' ? 'active' : ''}`}
                style={{ background: 'linear-gradient(135deg, #131c2b 0%, #1f334d 55%, #d9822b 100%)' }}
                onClick={() => handleBoxThemeChange('mac-ventura')}
                title="Ventura"
              />
              <button 
                className={`theme-btn ${boxTheme === 'mac-monterey' ? 'active' : ''}`}
                style={{ background: 'linear-gradient(135deg, #161326 0%, #291d45 55%, #9b6bc2 100%)' }}
                onClick={() => handleBoxThemeChange('mac-monterey')}
                title="Monterey"
              />
              <button 
                className={`theme-btn ${boxTheme === 'mac-bigsur' ? 'active' : ''}`}
                style={{ background: 'linear-gradient(135deg, #0c1e24 0%, #173842 55%, #3d8b7a 100%)' }}
                onClick={() => handleBoxThemeChange('mac-bigsur')}
                title="Big Sur"
              />
              <button 
                className={`theme-btn ${boxTheme === 'mac-sequoia' ? 'active' : ''}`}
                style={{ background: 'linear-gradient(135deg, #131a15 0%, #1d2c22 55%, #5a7d63 100%)' }}
                onClick={() => handleBoxThemeChange('mac-sequoia')}
                title="Sequoia"
              />
              
              {/* Custom Image Upload Button */}
              <button 
                className={`theme-btn ${boxTheme === 'custom' ? 'active' : ''}`}
                style={{ 
                  background: customBg ? `url(${customBg}) center/cover no-repeat` : '#333', 
                  color: '#fff', 
                  fontSize: customBg ? '0' : '20px', 
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
          
          <div style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', padding: '18px 20px', borderRadius: '16px', fontFamily: 'var(--font-main)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '12px', color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'var(--font-heading)', letterSpacing: '-0.025em' }}>
              Styles
            </h3>
            <select 
              value={font} 
              onChange={(e) => setFont(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '9px 12px', 
                background: 'var(--bg-color)', 
                color: 'var(--text-primary)', 
                border: '1px solid var(--panel-border)', 
                borderRadius: '8px',
                fontFamily: 'var(--font-main)',
                outline: 'none',
                fontSize: '0.9rem'
              }}
            >
              <option value="Inter">Inter (Clean)</option>
              <option value="'Playfair Display', serif">Playfair Display (Elegant)</option>
              <option value="'Space Mono', monospace">Space Mono (Tech)</option>
              <option value="'Outfit', sans-serif">Outfit (Modern)</option>
            </select>
          </div>
          
          <div style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', padding: '18px 20px', borderRadius: '16px', fontFamily: 'var(--font-main)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '12px', color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'var(--font-heading)', letterSpacing: '-0.025em' }}>
              Widgets
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
            className={`canvas-area ${editingId ? 'editing-active' : ''}`} 
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
          {widgets.map(widget => {
            const effectiveSize = getEffectiveWidgetSize(widget);
            const minSize = getWidgetMinSize(widget.type);
            return (
              <Rnd
                key={widget.id}
                position={{
                  x: getPx(widget.x, canvasSize.width),
                  y: getPx(widget.y, canvasSize.height),
                }}
                size={{
                  width: effectiveSize.width,
                  height: effectiveSize.height,
                }}
                minWidth={minSize.minWidth}
                minHeight={minSize.minHeight}
                onDragStop={(_e, d) => {
                  setWidgets(prev => prev.map(w => w.id === widget.id ? { ...w, x: d.x, y: d.y } : w));
                }}
                onResizeStop={(_e, _direction, ref, _delta, position) => {
                  const newW = Math.max(minSize.minWidth, parseInt(ref.style.width, 10));
                  const newH = Math.max(minSize.minHeight, parseInt(ref.style.height, 10));
                  setWidgets(prev => prev.map(w => w.id === widget.id ? { 
                    ...w, 
                    width: newW, 
                    height: newH,
                    x: position.x,
                    y: position.y,
                    data: { ...(w.data || {}), sizeScale: 'custom' }
                  } : w));
                }}
                bounds="parent"
                cancel="input, textarea, button, select, option, .widget-toolbar-btn, .calendar-date-cell, .widget-edit-modal, .widget-edit-select, .widget-edit-input, .widget-edit-done-btn"
                style={{
                  border: '1px solid transparent',
                  borderRadius: '12px',
                  transition: 'border 0.2s',
                  fontFamily: widget.data?.font || 'inherit',
                  zIndex: editingId === widget.id ? 1000 : 1,
                }}
                className={`widget-container ${editingId === widget.id ? 'is-editing' : ''}`}
              >
                <div className="widget-toolbar">
                  <button className="widget-toolbar-btn edit" onClick={() => editWidget(widget.id)} title={editingId === widget.id ? "Done" : "Edit"}>
                    {editingId === widget.id ? "✓" : "✎"}
                  </button>
                  <button className="widget-toolbar-btn delete" onClick={() => removeWidget(widget.id)} title="Remove">✕</button>
                </div>
                {renderWidget(widget)}
              </Rnd>
            );
          })}
          </div>

          {/* Action buttons below canvas */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
            <button 
              onClick={() => {
                setViewingWallpaper({
                  id: currentWallpaperId || 'temp-preview',
                  name: 'Current Wallpaper',
                  boxTheme,
                  customBg,
                  font,
                  widgets,
                  canvasWidth: canvasSize.width,
                  canvasHeight: canvasSize.height
                });
                setViewSource('editor');
                setCurrentView('view');
              }}
              className="btn-pill"
              style={{ background: 'transparent', border: '1px solid var(--panel-border)', color: 'var(--text-primary)', fontSize: '0.95rem', cursor: 'pointer', padding: '10px 22px', borderRadius: '9999px', fontWeight: 500 }}
            >
              Full Screen View
            </button>
            <button 
              onClick={() => setCurrentView('wallpapers')}
              className="btn-pill"
              style={{ background: 'transparent', border: '1px solid var(--panel-border)', color: 'var(--text-primary)', fontSize: '0.95rem', cursor: 'pointer', padding: '10px 22px', borderRadius: '9999px', fontWeight: 500 }}
            >
              View Wallpapers
            </button>
            <button 
              onClick={handleSave}
              className="btn-pill"
              style={{ background: 'var(--text-primary)', color: 'var(--bg-color)', border: 'none', fontSize: '0.95rem', cursor: 'pointer', padding: '10px 26px', borderRadius: '9999px', fontWeight: 600, boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }}
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
