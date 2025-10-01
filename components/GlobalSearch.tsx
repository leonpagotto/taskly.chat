import React, { useEffect, useRef, useState } from 'react';
import ModalOverlay from './ModalOverlay';
import { AppView, Checklist, Event, Note, Project, ProjectFile, SearchableItem, UserCategory } from '../types';
import { CalendarTodayIcon, CloseIcon, DescriptionIcon, EventNoteIcon, FilePresentIcon, ListAltIcon, SearchIcon } from './icons';

const Icon: React.FC<{ name: string; className?: string; style?: React.CSSProperties }> = ({ name, className, style }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>{name}</span>
);

export interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  checklists: Checklist[];
  habits: any[]; // habit type matches in consumers
  notes: Note[];
  projects: Project[];
  events: Event[];
  projectFiles: ProjectFile[];
  userCategories: UserCategory[];
  onSelectNote: (noteId: string) => void;
  onSelectProject: (projectId: string) => void;
  onSelectView: (view: AppView) => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose, checklists, habits, notes, projects, events, projectFiles, userCategories, onSelectNote, onSelectProject, onSelectView }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchableItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, [isOpen]);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    const q = query.toLowerCase();
    const searchChecklists = checklists.filter(c => c.name.toLowerCase().includes(q)).map(c => ({ ...c, itemType: 'task' as const }));
    const searchHabits = habits.filter((h: any) => h.name.toLowerCase().includes(q)).map((h: any) => ({ ...h, itemType: 'habit' as const }));
    const searchNotes = notes.filter(n => n.name.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)).map(n => ({ ...n, itemType: 'note' as const }));
    const searchProjects = projects.filter(p => p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q)).map(p => ({ ...p, itemType: 'project' as const }));
    const searchEvents = events.filter(e => e.title.toLowerCase().includes(q) || (e.description || '').toLowerCase().includes(q)).map(e => ({ ...e, itemType: 'event' as const }));
    const searchFiles = projectFiles.filter(f => f.name.toLowerCase().includes(q)).map(f => ({ ...f, itemType: 'file' as const }));
    setResults([...searchProjects, ...searchChecklists, ...searchHabits, ...searchNotes, ...searchEvents, ...searchFiles]);
  }, [query, checklists, habits, notes, projects, events, projectFiles]);

  const handleSelect = (item: SearchableItem) => {
    onClose();
    switch (item.itemType) {
      case 'note': onSelectNote(item.id); break;
      case 'project': onSelectProject(item.id); break;
      case 'task': onSelectView('lists'); break;
      case 'habit': onSelectView('habits'); break;
      case 'event': onSelectView('calendar'); break;
      case 'file': onSelectView('files'); break;
    }
  };

  const ResultItem: React.FC<{ item: SearchableItem }> = ({ item }) => {
    let icon: React.ReactNode;
    let title: string = '';
    let subtitle: string | undefined;
    switch (item.itemType) {
      case 'project': {
        const project = item as Project;
        const category = userCategories.find(c => c.id === project.categoryId);
        const iconName = project.icon || category?.icon || 'folder';
        const color = project.color || category?.color;
        icon = <Icon name={iconName} className="text-xl" style={{ color }} />;
        title = item.name; subtitle = 'Project';
        break;
      }
      case 'task': icon = <ListAltIcon className="text-xl text-blue-400" />; title = item.name; subtitle = 'Task/List'; break;
      case 'habit': icon = <Icon name="autorenew" className="text-xl text-green-400" />; title = item.name; subtitle = 'Habit'; break;
      case 'note': icon = <DescriptionIcon className="text-xl text-yellow-400" />; title = (item as any).name; subtitle = 'Note'; break;
      case 'event': icon = <EventNoteIcon className="text-xl text-indigo-400" />; title = (item as any).title; subtitle = 'Event'; break;
      case 'file': icon = <FilePresentIcon className="text-xl text-purple-400" />; title = (item as any).name; subtitle = 'File'; break;
    }
    return (
      <button onClick={() => handleSelect(item)} className="w-full text-left p-3 flex items-center gap-4 rounded-lg hover:bg-gray-700/50 transition-colors">
        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{title}</p>
          <p className="text-sm text-gray-400">{subtitle}</p>
        </div>
      </button>
    );
  };

  if (!isOpen) return null;
  return (
    <ModalOverlay onClick={onClose} className="p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-2xl mx-auto max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 flex items-center gap-3 border-b border-gray-700">
          <SearchIcon className="text-2xl text-gray-400" />
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search for tasks, events, notes, projects..." className="w-full bg-transparent text-lg placeholder:text-gray-500 focus:outline-none" />
          <button onClick={onClose} className="p-2 rounded-[var(--radius-button)] hover:bg-gray-700" aria-label="Close"><CloseIcon /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {results.length > 0 ? (
            <ul>{results.map(item => <li key={`${item.itemType}-${item.id}`}><ResultItem item={item} /></li>)}</ul>
          ) : (
            <p className="text-center text-gray-500 p-8">{query.length > 1 ? 'No results found.' : 'Start typing to search.'}</p>
          )}
        </div>
      </div>
    </ModalOverlay>
  );
};

export default GlobalSearch;
