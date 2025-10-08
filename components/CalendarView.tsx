import React, { useMemo, useState } from 'react';
import type { Event } from '../types';
import { UserCategory, Habit, RecurrenceRule } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, AddIcon, EventNoteIcon, CalendarAddOnIcon } from './icons';
import Header from './Header';

interface CalendarViewProps {
  events: Event[];
  habits: Habit[];
  userCategories: UserCategory[];
  onNewEventRequest: (date: string) => void;
  onEditEventRequest: (event: Event) => void;
  onToggleSidebar: () => void;
  t: (key: string) => string;
}

const CalendarView: React.FC<CalendarViewProps> = ({ events, habits, userCategories, onNewEventRequest, onEditEventRequest, onToggleSidebar, t }) => {
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
            {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} className="rounded-2xl border border-transparent"></div>)}
            {Array.from({ length: daysInMonth }).map((_, dayIndex) => {
              const dayNumber = dayIndex + 1;
              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
              const isoDate = getISODate(date);
              const isTodayFlag = isSameDay(date, today);
              const dayEvents = events.filter(e => isEventDueOnDate(e, date)).sort((a,b) => (a.startTime || '00:00').localeCompare(b.startTime || '00:00'));
              const dayHabits = habits.filter(h => isRecurrentItemDue(h.recurrence, date));
              return (
                <div
                  key={dayNumber}
                  className="group relative flex flex-col rounded-2xl border border-gray-700/50 bg-gray-900/55 p-2 min-h-[120px] overflow-hidden cursor-pointer transition-all duration-150 hover:-translate-y-1 hover:border-[var(--color-primary-600)]/60 hover:shadow-xl"
                  onClick={() => onNewEventRequest(isoDate)}
                  title={`Create event on ${isoDate}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all ${isTodayFlag ? 'bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)] text-white shadow-lg' : 'bg-gray-800/60 text-gray-200 group-hover:bg-gray-700/70 group-hover:text-white'}`}>
                      {dayNumber}
                    </span>
                    {(dayEvents.length + dayHabits.length) > 0 && (
                      <span className="text-[11px] font-semibold text-gray-500 group-hover:text-gray-300">
                        {dayEvents.length + dayHabits.length}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 mt-2 space-y-1 overflow-y-auto scrollbar-hide">
                    {dayEvents.map(event => {
                      const category = userCategories.find(c => c.id === event.categoryId);
                      const color = category?.color || '#64748B';
                      return (
                        <button
                          key={event.id}
                          onClick={(e) => { e.stopPropagation(); onEditEventRequest(event); }}
                          style={{ backgroundColor: `${color}20`, color: color }}
                          className="w-full text-left p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 backdrop-blur-sm transition-transform duration-150 hover:-translate-y-[1px]"
                        >
                          {!event.isAllDay && <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: color}}></div>}
                          <span className="truncate">{event.title}</span>
                        </button>
                      );
                    })}
                    {dayHabits.length > 0 && (
                      <div className="pt-1 space-y-1">
                        {dayHabits.map(h => {
                          const cat = userCategories.find(c => c.id === h.categoryId);
                          const color = cat?.color || '#64748B';
                          return (
                            <div key={`habit-${h.id}`} className="w-full text-left p-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 backdrop-blur-sm" style={{ backgroundColor: `${color}14`, color }}>
                              <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: color}}></div>
                              <span className="truncate">{h.name}</span>
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
              return (
                <div
                  key={idx}
                  className="group relative flex flex-col rounded-2xl border border-gray-700/50 bg-gray-900/55 p-2 min-h-[160px] overflow-hidden cursor-pointer transition-all duration-150 hover:-translate-y-1 hover:border-[var(--color-primary-600)]/60 hover:shadow-xl"
                  onClick={() => onNewEventRequest(isoDate)}
                  title={`Create event on ${isoDate}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all ${isTodayFlag ? 'bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)] text-white shadow-lg' : 'bg-gray-800/60 text-gray-200 group-hover:bg-gray-700/70 group-hover:text-white'}`}>
                      {date.getDate()}
                    </span>
                    {(dayEvents.length + dayHabits.length) > 0 && (
                      <span className="text-[11px] font-semibold text-gray-500 group-hover:text-gray-300">
                        {dayEvents.length + dayHabits.length}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 mt-2 space-y-1 overflow-y-auto scrollbar-hide">
                    {dayEvents.map(event => {
                      const category = userCategories.find(c => c.id === event.categoryId);
                      const color = category?.color || '#64748B';
                      return (
                        <button
                          key={event.id}
                          onClick={(e) => { e.stopPropagation(); onEditEventRequest(event); }}
                          style={{ backgroundColor: `${color}20`, color: color }}
                          className="w-full text-left p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 backdrop-blur-sm transition-transform duration-150 hover:-translate-y-[1px]"
                        >
                          {!event.isAllDay && <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: color}}></div>}
                          <span className="truncate">{event.title}</span>
                        </button>
                      );
                    })}
                    {dayHabits.length > 0 && (
                      <div className="pt-1 space-y-1">
                        {dayHabits.map(h => {
                          const cat = userCategories.find(c => c.id === h.categoryId);
                          const color = cat?.color || '#64748B';
                          return (
                            <div key={`habit-${h.id}`} className="w-full text-left p-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 backdrop-blur-sm" style={{ backgroundColor: `${color}14`, color }}>
                              <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: color}}></div>
                              <span className="truncate">{h.name}</span>
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
