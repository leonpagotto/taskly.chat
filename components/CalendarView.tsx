import React, { useMemo, useState } from 'react';
import type { Event, Checklist } from '../types';
import { UserCategory, Habit, RecurrenceRule } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, AddIcon, EventNoteIcon, CalendarAddOnIcon, CheckCircleIcon, RadioButtonUncheckedIcon } from './icons';
import Header from './Header';

interface CalendarViewProps {
  events: Event[];
  habits: Habit[];
  checklists: Checklist[];
  userCategories: UserCategory[];
  onNewEventRequest: (date: string) => void;
  onEditEventRequest: (event: Event) => void;
  onToggleTask: (checklistId: string, taskId: string) => void;
  onToggleHabitCompletion: (habitId: string, date: string) => void;
  onToggleHabitTask: (habitId: string, taskId: string, date: string) => void;
  onToggleSidebar: () => void;
  t: (key: string) => string;
}

const CalendarView: React.FC<CalendarViewProps> = ({ 
  events, 
  habits, 
  checklists, 
  userCategories, 
  onNewEventRequest, 
  onEditEventRequest, 
  onToggleTask,
  onToggleHabitCompletion,
  onToggleHabitTask,
  onToggleSidebar, 
  t 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  const startDay = (startOfMonth.getDay() + 6) % 7; // Monday is 0
  const daysInMonth = endOfMonth.getDate();

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    }
  };
  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    }
  };
  const handleToday = () => setCurrentDate(new Date());

  const today = new Date();
  const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

  const getISODate = (date = new Date()) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const isRecurrentItemDue = (recurrence: RecurrenceRule, date: Date): boolean => {
    const checkDate = new Date(date);
    checkDate.setHours(0,0,0,0);
    const startDate = new Date(recurrence.startDate + 'T00:00:00');
    startDate.setHours(0,0,0,0);
    if (checkDate < startDate) return false;
    const dayMap: { [key: number]: NonNullable<RecurrenceRule['daysOfWeek']>[number] } = { 0:'Sun',1:'Mon',2:'Tue',3:'Wed',4:'Thu',5:'Fri',6:'Sat' };
    switch(recurrence.type){
      case 'daily': return true;
      case 'weekly': return recurrence.daysOfWeek?.includes(dayMap[checkDate.getDay()]) ?? false;
      case 'interval': {
        const diffTime = Math.abs(checkDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays % (recurrence.interval || 1) === 0;
      }
      case 'monthly': {
        const interval = recurrence.interval || 1;
        const targetDay = recurrence.dayOfMonth || startDate.getDate();
        
        // Check if it's the correct day of month
        if (checkDate.getDate() !== targetDay) return false;
        
        // Calculate month difference
        const startYear = startDate.getFullYear();
        const startMonth = startDate.getMonth();
        const checkYear = checkDate.getFullYear();
        const checkMonth = checkDate.getMonth();
        
        const monthDiff = (checkYear - startYear) * 12 + (checkMonth - startMonth);
        return monthDiff >= 0 && monthDiff % interval === 0;
      }
      case 'yearly': {
        const interval = recurrence.interval || 1;
        const targetMonth = recurrence.monthOfYear !== undefined ? recurrence.monthOfYear : startDate.getMonth();
        const targetDay = recurrence.dayOfMonth || startDate.getDate();
        
        // Check if it's the correct month and day
        if (checkDate.getMonth() !== targetMonth || checkDate.getDate() !== targetDay) return false;
        
        // Calculate year difference
        const yearDiff = checkDate.getFullYear() - startDate.getFullYear();
        return yearDiff >= 0 && yearDiff % interval === 0;
      }
      default: return false;
    }
  };

  const isEventDueOnDate = (event: Event, date: Date): boolean => {
    if (event.recurrence) {
        return isRecurrentItemDue(event.recurrence, date);
    }
    // For non-recurring events, check date range
    const eventStartDate = new Date(event.startDate + 'T00:00:00');
    const eventEndDate = event.endDate ? new Date(event.endDate + 'T00:00:00') : eventStartDate;
    const checkDate = new Date(date);
    checkDate.setHours(0,0,0,0);
    return checkDate >= eventStartDate && checkDate <= eventEndDate;
  };

  const isChecklistDueOnDate = (checklist: Checklist, date: Date): boolean => {
    if (checklist.recurrence) {
        return isRecurrentItemDue(checklist.recurrence, date);
    }
    // For non-recurring checklists, check due date
    if (checklist.dueDate) {
        const dueDate = new Date(checklist.dueDate + 'T00:00:00');
        const checkDate = new Date(date);
        checkDate.setHours(0,0,0,0);
        return checkDate.getTime() === dueDate.getTime();
    }
    return false;
  };

  // Compute week range (Mon-Sun) for currentDate
  const weekDays = useMemo(() => {
    const base = new Date(currentDate);
    const day = base.getDay(); // 0=Sun..6=Sat
    const mondayOffset = (day + 6) % 7; // days since Monday
    const monday = new Date(base);
    monday.setDate(base.getDate() - mondayOffset);
    monday.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, [currentDate]);

  const weekLabel = useMemo(() => {
    const start = weekDays[0];
    const end = weekDays[6];
    const startFmt = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endFmt = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startFmt} – ${endFmt}`;
  }, [weekDays]);

  return (
    <div className="flex-1 flex flex-col h-full">
  <Header title={t('calendar')} onToggleSidebar={onToggleSidebar} onOpenSearch={() => window.dispatchEvent(new Event('taskly.openSearch'))}>
        <button onClick={() => onNewEventRequest(new Date().toISOString().split('T')[0])} className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)] rounded-[var(--radius-button)] font-semibold hover:shadow-lg transition-all text-sm" style={{ color: '#FFFFFF' }}>
          <CalendarAddOnIcon />
          <span className="hidden sm:inline">New Event</span>
        </button>
      </Header>

      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <button onClick={handlePrev} className="w-10 h-10 inline-flex items-center justify-center rounded-[var(--radius-button)] resend-secondary transition-transform duration-150 hover:-translate-y-[1px]"><ChevronLeftIcon /></button>
          {viewMode === 'month' ? (
            <h2 className="text-lg font-semibold whitespace-nowrap">{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
          ) : (
            <h2 className="text-lg font-semibold whitespace-nowrap">{weekLabel}</h2>
          )}
          <button onClick={handleNext} className="w-10 h-10 inline-flex items-center justify-center rounded-[var(--radius-button)] resend-secondary transition-transform duration-150 hover:-translate-y-[1px]"><ChevronRightIcon /></button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center h-10 px-1 rounded-[12px] resend-secondary">
            <button
              type="button"
              className={`h-8 px-3 rounded-[12px] text-sm font-semibold transition-colors ${viewMode === 'month' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300/70 dark:hover:bg-gray-600/40'}`}
              onClick={() => setViewMode('month')}
            >Month</button>
            <button
              type="button"
              className={`h-8 px-3 rounded-[12px] text-sm font-semibold transition-colors ${viewMode === 'week' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300/70 dark:hover:bg-gray-600/40'}`}
              onClick={() => setViewMode('week')}
            >Week</button>
          </div>
          <button onClick={handleToday} className="px-4 py-1.5 rounded-[var(--radius-button)] text-sm font-semibold resend-secondary transition-transform duration-150 hover:-translate-y-[1px]">Today</button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
            <div key={day} className="py-2">
              {day}
              {viewMode === 'week' && (
                <div className="text-[10px] text-gray-400">{weekDays[i].getDate()}</div>
              )}
            </div>
          ))}
        </div>

        {viewMode === 'month' ? (
          <div className="grid grid-cols-7 grid-rows-5 auto-rows-fr gap-px bg-gray-200 dark:bg-gray-700/50 flex-1 h-full">
            {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} className="rounded-sm border border-transparent"></div>)}
            {Array.from({ length: daysInMonth }).map((_, dayIndex) => {
              const dayNumber = dayIndex + 1;
              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
              const isoDate = getISODate(date);
              const isTodayFlag = isSameDay(date, today);
              const dayEvents = events.filter(e => isEventDueOnDate(e, date)).sort((a,b) => (a.startTime || '00:00').localeCompare(b.startTime || '00:00'));
              const dayHabits = habits.filter(h => isRecurrentItemDue(h.recurrence, date));
              const dayChecklists = checklists.filter(c => isChecklistDueOnDate(c, date));
              const totalItems = dayEvents.length + dayHabits.length + dayChecklists.length;
              
              return (
                <div
                  key={dayNumber}
                  className="group relative flex flex-col rounded-sm border border-gray-700/50 bg-gray-900/55 p-1.5 min-h-[90px] overflow-hidden cursor-pointer transition-all duration-150 hover:-translate-y-1 hover:border-[var(--color-primary-600)]/60 hover:shadow-xl"
                  onClick={() => onNewEventRequest(isoDate)}
                  title={`Create event on ${isoDate}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold transition-all ${isTodayFlag ? 'bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)] text-white shadow-lg' : 'bg-gray-800/60 text-gray-200 group-hover:bg-gray-700/70 group-hover:text-white'}`}>
                      {dayNumber}
                    </span>
                    {totalItems > 0 && (
                      <span className="text-[10px] font-semibold text-gray-500 group-hover:text-gray-300">
                        {totalItems}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 mt-1.5 space-y-0.5 overflow-y-auto scrollbar-hide">
                    {dayEvents.map(event => {
                      const category = userCategories.find(c => c.id === event.categoryId);
                      const color = category?.color || '#64748B';
                      return (
                        <button
                          key={event.id}
                          onClick={(e) => { e.stopPropagation(); onEditEventRequest(event); }}
                          style={{ backgroundColor: `${color}20`, color: color }}
                          className="w-full text-left p-1 rounded-sm text-[11px] font-semibold flex items-center gap-1 backdrop-blur-sm transition-transform duration-150 hover:-translate-y-[1px]"
                        >
                          {!event.isAllDay && <div className="w-1 h-1 rounded-full" style={{backgroundColor: color}}></div>}
                          <span className="truncate">{event.title}</span>
                        </button>
                      );
                    })}
                    {dayChecklists.map(checklist => {
                      const category = userCategories.find(c => c.id === checklist.categoryId);
                      const color = category?.color || '#64748B';
                      const isCompleted = checklist.completionHistory.includes(isoDate);
                      return (
                        <div key={checklist.id} className="space-y-0.5">
                          <button
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              if (checklist.tasks.length === 0) {
                                // Simple checklist toggle
                                const today = new Date().toISOString().split('T')[0];
                                if (checklist.recurrence) {
                                  // Handle recurring checklist completion
                                } else {
                                  // Handle one-time checklist completion
                                }
                              }
                            }}
                            style={{ backgroundColor: `${color}20`, color: color }}
                            className="w-full text-left p-1 rounded-sm text-[11px] font-semibold flex items-center gap-1 backdrop-blur-sm transition-transform duration-150 hover:-translate-y-[1px]"
                          >
                            {isCompleted ? (
                              <CheckCircleIcon className="w-2 h-2" style={{color}} />
                            ) : (
                              <RadioButtonUncheckedIcon className="w-2 h-2" style={{color}} />
                            )}
                            <span className="truncate">{checklist.name}</span>
                          </button>
                          {checklist.tasks.length > 0 && (
                            <div className="ml-2 space-y-0.5">
                              {checklist.tasks.slice(0, 2).map(task => {
                                const isTaskCompleted = task.completedAt === isoDate;
                                return (
                                  <button
                                    key={task.id}
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      onToggleTask(checklist.id, task.id);
                                    }}
                                    style={{ backgroundColor: `${color}10`, color: color }}
                                    className="w-full text-left p-0.5 rounded-sm text-[10px] font-medium flex items-center gap-1 backdrop-blur-sm transition-transform duration-150 hover:-translate-y-[1px]"
                                  >
                                    {isTaskCompleted ? (
                                      <CheckCircleIcon className="w-1.5 h-1.5" style={{color}} />
                                    ) : (
                                      <RadioButtonUncheckedIcon className="w-1.5 h-1.5" style={{color}} />
                                    )}
                                    <span className="truncate">{task.text}</span>
                                  </button>
                                );
                              })}
                              {checklist.tasks.length > 2 && (
                                <div className="text-[9px] text-gray-400 ml-2">
                                  +{checklist.tasks.length - 2} more
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {dayHabits.length > 0 && (
                      <div className="pt-0.5 space-y-0.5">
                        {dayHabits.map(h => {
                          const cat = userCategories.find(c => c.id === h.categoryId);
                          const color = cat?.color || '#64748B';
                          const isHabitCompleted = h.completionHistory.includes(isoDate);
                          return (
                            <div key={`habit-${h.id}`} className="space-y-0.5">
                              <button
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  onToggleHabitCompletion(h.id, isoDate);
                                }}
                                className="w-full text-left p-1 rounded-sm text-[10px] font-semibold flex items-center gap-1 backdrop-blur-sm transition-transform duration-150 hover:-translate-y-[1px]" 
                                style={{ backgroundColor: `${color}14`, color }}
                              >
                                {isHabitCompleted ? (
                                  <CheckCircleIcon className="w-1.5 h-1.5" style={{color}} />
                                ) : (
                                  <RadioButtonUncheckedIcon className="w-1.5 h-1.5" style={{color}} />
                                )}
                                <span className="truncate">{h.name}</span>
                              </button>
                              {h.type === 'checklist' && h.tasks && h.tasks.length > 0 && (
                                <div className="ml-2 space-y-0.5">
                                  {h.tasks.slice(0, 2).map(task => {
                                    const isTaskCompleted = task.completedAt === isoDate;
                                    return (
                                      <button
                                        key={task.id}
                                        onClick={(e) => { 
                                          e.stopPropagation(); 
                                          onToggleHabitTask(h.id, task.id, isoDate);
                                        }}
                                        style={{ backgroundColor: `${color}10`, color }}
                                        className="w-full text-left p-0.5 rounded-sm text-[9px] font-medium flex items-center gap-1 backdrop-blur-sm transition-transform duration-150 hover:-translate-y-[1px]"
                                      >
                                        {isTaskCompleted ? (
                                          <CheckCircleIcon className="w-1 h-1" style={{color}} />
                                        ) : (
                                          <RadioButtonUncheckedIcon className="w-1 h-1" style={{color}} />
                                        )}
                                        <span className="truncate">{task.text}</span>
                                      </button>
                                    );
                                  })}
                                  {h.tasks.length > 2 && (
                                    <div className="text-[8px] text-gray-400 ml-2">
                                      +{h.tasks.length - 2} more
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700/50 flex-1">
            {weekDays.map((date, idx) => {
              const isoDate = getISODate(date);
              const isTodayFlag = isSameDay(date, today);
              const dayEvents = events.filter(e => isEventDueOnDate(e, date)).sort((a,b) => (a.startTime || '00:00').localeCompare(b.startTime || '00:00'));
              const dayHabits = habits.filter(h => isRecurrentItemDue(h.recurrence, date));
              const dayChecklists = checklists.filter(c => isChecklistDueOnDate(c, date));
              const totalItems = dayEvents.length + dayHabits.length + dayChecklists.length;
              
              return (
                <div
                  key={idx}
                  className="group relative flex flex-col rounded-sm border border-gray-700/50 bg-gray-900/55 p-1.5 min-h-[120px] overflow-hidden cursor-pointer transition-all duration-150 hover:-translate-y-1 hover:border-[var(--color-primary-600)]/60 hover:shadow-xl"
                  onClick={() => onNewEventRequest(isoDate)}
                  title={`Create event on ${isoDate}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold transition-all ${isTodayFlag ? 'bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)] text-white shadow-lg' : 'bg-gray-800/60 text-gray-200 group-hover:bg-gray-700/70 group-hover:text-white'}`}>
                      {date.getDate()}
                    </span>
                    {totalItems > 0 && (
                      <span className="text-[10px] font-semibold text-gray-500 group-hover:text-gray-300">
                        {totalItems}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 mt-1.5 space-y-0.5 overflow-y-auto scrollbar-hide">
                    {dayEvents.map(event => {
                      const category = userCategories.find(c => c.id === event.categoryId);
                      const color = category?.color || '#64748B';
                      return (
                        <button
                          key={event.id}
                          onClick={(e) => { e.stopPropagation(); onEditEventRequest(event); }}
                          style={{ backgroundColor: `${color}20`, color: color }}
                          className="w-full text-left p-1 rounded-sm text-[11px] font-semibold flex items-center gap-1 backdrop-blur-sm transition-transform duration-150 hover:-translate-y-[1px]"
                        >
                          {!event.isAllDay && <div className="w-1 h-1 rounded-full" style={{backgroundColor: color}}></div>}
                          <span className="truncate">{event.title}</span>
                        </button>
                      );
                    })}
                    {dayChecklists.map(checklist => {
                      const category = userCategories.find(c => c.id === checklist.categoryId);
                      const color = category?.color || '#64748B';
                      const isCompleted = checklist.completionHistory.includes(isoDate);
                      return (
                        <div key={checklist.id} className="space-y-0.5">
                          <button
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              // Handle checklist completion
                            }}
                            style={{ backgroundColor: `${color}20`, color: color }}
                            className="w-full text-left p-1 rounded-sm text-[11px] font-semibold flex items-center gap-1 backdrop-blur-sm transition-transform duration-150 hover:-translate-y-[1px]"
                          >
                            {isCompleted ? (
                              <CheckCircleIcon className="w-2 h-2" style={{color}} />
                            ) : (
                              <RadioButtonUncheckedIcon className="w-2 h-2" style={{color}} />
                            )}
                            <span className="truncate">{checklist.name}</span>
                          </button>
                          {checklist.tasks.length > 0 && (
                            <div className="ml-2 space-y-0.5">
                              {checklist.tasks.slice(0, 3).map(task => {
                                const isTaskCompleted = task.completedAt === isoDate;
                                return (
                                  <button
                                    key={task.id}
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      onToggleTask(checklist.id, task.id);
                                    }}
                                    style={{ backgroundColor: `${color}10`, color: color }}
                                    className="w-full text-left p-0.5 rounded-sm text-[10px] font-medium flex items-center gap-1 backdrop-blur-sm transition-transform duration-150 hover:-translate-y-[1px]"
                                  >
                                    {isTaskCompleted ? (
                                      <CheckCircleIcon className="w-1.5 h-1.5" style={{color}} />
                                    ) : (
                                      <RadioButtonUncheckedIcon className="w-1.5 h-1.5" style={{color}} />
                                    )}
                                    <span className="truncate">{task.text}</span>
                                  </button>
                                );
                              })}
                              {checklist.tasks.length > 3 && (
                                <div className="text-[9px] text-gray-400 ml-2">
                                  +{checklist.tasks.length - 3} more
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {dayHabits.length > 0 && (
                      <div className="pt-0.5 space-y-0.5">
                        {dayHabits.map(h => {
                          const cat = userCategories.find(c => c.id === h.categoryId);
                          const color = cat?.color || '#64748B';
                          const isHabitCompleted = h.completionHistory.includes(isoDate);
                          return (
                            <div key={`habit-${h.id}`} className="space-y-0.5">
                              <button
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  onToggleHabitCompletion(h.id, isoDate);
                                }}
                                className="w-full text-left p-1 rounded-sm text-[10px] font-semibold flex items-center gap-1 backdrop-blur-sm transition-transform duration-150 hover:-translate-y-[1px]" 
                                style={{ backgroundColor: `${color}14`, color }}
                              >
                                {isHabitCompleted ? (
                                  <CheckCircleIcon className="w-1.5 h-1.5" style={{color}} />
                                ) : (
                                  <RadioButtonUncheckedIcon className="w-1.5 h-1.5" style={{color}} />
                                )}
                                <span className="truncate">{h.name}</span>
                              </button>
                              {h.type === 'checklist' && h.tasks && h.tasks.length > 0 && (
                                <div className="ml-2 space-y-0.5">
                                  {h.tasks.slice(0, 3).map(task => {
                                    const isTaskCompleted = task.completedAt === isoDate;
                                    return (
                                      <button
                                        key={task.id}
                                        onClick={(e) => { 
                                          e.stopPropagation(); 
                                          onToggleHabitTask(h.id, task.id, isoDate);
                                        }}
                                        style={{ backgroundColor: `${color}10`, color }}
                                        className="w-full text-left p-0.5 rounded-sm text-[9px] font-medium flex items-center gap-1 backdrop-blur-sm transition-transform duration-150 hover:-translate-y-[1px]"
                                      >
                                        {isTaskCompleted ? (
                                          <CheckCircleIcon className="w-1 h-1" style={{color}} />
                                        ) : (
                                          <RadioButtonUncheckedIcon className="w-1 h-1" style={{color}} />
                                        )}
                                        <span className="truncate">{task.text}</span>
                                      </button>
                                    );
                                  })}
                                  {h.tasks.length > 3 && (
                                    <div className="text-[8px] text-gray-400 ml-2">
                                      +{h.tasks.length - 3} more
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default CalendarView;
