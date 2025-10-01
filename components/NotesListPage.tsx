import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Note, Project, UserCategory, AppView, Checklist, ProjectFile } from '../types';
import NotesView from './NotesView';
import Header from './Header';
import EmptyStateIcon from './EmptyStateIcon';
import { DescriptionIcon, NoteAddIcon, ExpandMoreIcon, WidthNormalIcon } from './icons';

// Compact list item in the Notes list column
const NoteListItem: React.FC<{
  note: Note;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ note, isSelected, onSelect }) => {
  const getContentPreviewText = (htmlContent: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const firstElement = tempDiv.firstElementChild as HTMLElement | null;
    if (firstElement) firstElement.remove();
    const text = tempDiv.textContent?.trim() || 'No additional text';
    return text.substring(0, 100);
  };

  const lastModified = new Date(note.lastModified).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric'
  });

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-3 border-b border-gray-200 dark:border-gray-700/50 transition-colors ${isSelected ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
    >
      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{note.name}</h3>
      <div className="flex items-center gap-2 text-sm mt-1 text-gray-500 dark:text-gray-400">
        <span className="flex-shrink-0">{lastModified}</span>
        <span className="truncate">{getContentPreviewText(note.content)}</span>
      </div>
    </button>
  );
};

// Left column: grouped notes list
const NotesListColumn: React.FC<{
  notes: Note[];
  projects: Project[];
  selectedNoteId: string | null;
  onSelectNote: (noteId: string) => void;
  onCreateNote: () => void;
  onToggleSidebar: () => void;
  t: (key: string) => string;
  showHeader?: boolean;
}> = ({ notes, projects, selectedNoteId, onSelectNote, onCreateNote, onToggleSidebar, t, showHeader = true }) => {
  const [collapsedProjects, setCollapsedProjects] = useState<Set<string>>(new Set());

  const toggleProjectCollapse = (projectId: string) => {
    setCollapsedProjects(prev => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId); else next.add(projectId);
      return next;
    });
  };

  const sortedNotes = [...notes].sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
  const projectNotes = projects
    .map(p => ({ project: p, notes: sortedNotes.filter(n => n.projectId === p.id) }))
    .filter(group => group.notes.length > 0);
  const standaloneNotes = sortedNotes.filter(n => !n.projectId);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-800/50">
      {showHeader && (
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={onToggleSidebar} className="md:hidden p-2 -ml-2 text-gray-500 dark:text-gray-300 hover:text-white">
              <WidthNormalIcon />
            </button>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('notes')}</h2>
          </div>
          <button
            onClick={onCreateNote}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white rounded-[var(--radius-button)] font-semibold hover:shadow-lg transition-all text-sm"
            title={t('create_note')}
          >
            <NoteAddIcon />
            <span className="hidden sm:inline">{t('create_note')}</span>
          </button>
        </header>
      )}
      <div className="flex-1 overflow-y-auto">
        {standaloneNotes.length > 0 && (
          <div className="pt-2">
            <h3 className="px-3 py-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Notes</h3>
            {standaloneNotes.map(note => (
              <NoteListItem
                key={note.id}
                note={note}
                isSelected={note.id === selectedNoteId}
                onSelect={() => onSelectNote(note.id)}
              />
            ))}
          </div>
        )}
        {projectNotes.map(({ project, notes }) => {
          const isCollapsed = collapsedProjects.has(project.id);
          return (
            <div key={project.id} className="pt-2">
              <button
                onClick={() => toggleProjectCollapse(project.id)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <span>{project.name}</span>
                <ExpandMoreIcon className={`transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
              </button>
              {!isCollapsed && notes.map(note => (
                <NoteListItem
                  key={note.id}
                  note={note}
                  isSelected={note.id === selectedNoteId}
                  onSelect={() => onSelectNote(note.id)}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Main component for the new Notes page layout
const NotesListPage: React.FC<{
  notes: Note[];
  projects: Project[];
  userCategories: UserCategory[];
  projectFiles: ProjectFile[];
  selectedNoteId: string | null;
  onSelectNote: (noteId: string | null) => void;
  onUpdateNote: (noteId: string, updates: Partial<Omit<Note, 'id'>>) => void;
  onCreateNote: (projectId?: string) => void;
  onDeleteNote: (noteId: string) => void;
  onCloseNote: () => void;
  onToggleSidebar: () => void;
  onUploadFiles: (files: FileList, projectId: string, noteId: string) => void;
  onDeleteFile: (fileId: string) => void;
  onPreviewFile: (file: ProjectFile) => void;
  onCreateChecklist: (checklistData: Omit<Checklist, 'id'>) => Checklist;
  onSelectView: (view: AppView) => void;
  onNewCategoryRequest: (callback: (newCategoryId: string) => void) => void;
  t: (key: string) => string;
}> = (props) => {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [sidebarWidth, setSidebarWidth] = useState(Math.round((typeof window !== 'undefined' ? window.innerWidth : 1200) * 0.33));
  const isResizing = useRef(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = e.clientX;
    const clampedWidth = Math.max(240, Math.min(newWidth, 600));
    setSidebarWidth(clampedWidth);
  }, []);

  const handleMouseUp = useCallback(() => {
    isResizing.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const selectedNote = props.notes.find(n => n.id === props.selectedNoteId);

  // Auto-select the most recent note if none is selected and on desktop
  useEffect(() => {
    if (!isMobile && !props.selectedNoteId && props.notes.length > 0) {
      const mostRecentNote = [...props.notes].sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())[0];
      props.onSelectNote(mostRecentNote.id);
    }
  }, [isMobile, props.selectedNoteId, props.notes, props.onSelectNote]);

  // Mobile view logic
  if (isMobile) {
    if (selectedNote) {
      return (
        <NotesView
          key={selectedNote.id}
          note={selectedNote}
          {...props}
          isSplitView={false}
        />
      );
    }
    return (
      props.notes.length === 0 ? (
        <div className="flex-1 min-h-0 flex items-center justify-center p-6 bg-gray-100 dark:bg-gray-800">
          <div className="text-center text-gray-500 dark:text-gray-400 max-w-md">
            <EmptyStateIcon icon={<DescriptionIcon />} size="lg" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">No notes yet</h2>
            <p className="text-sm mb-5">Create your first note to get started.</p>
            <button
              onClick={() => props.onCreateNote()}
              className="px-6 py-3 bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white rounded-[var(--radius-button)] font-semibold hover:shadow-lg transition-all"
            >
              {props.t('create_note')}
            </button>
          </div>
        </div>
      ) : (
        <NotesListColumn
          {...props}
          onSelectNote={(id) => props.onSelectNote(id)}
          onCreateNote={() => props.onCreateNote()}
        />
      )
    );
  }

  // Desktop layout
  return (
    <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-800 h-full">
  <Header title={props.t('notes')} onToggleSidebar={props.onToggleSidebar} onOpenSearch={() => window.dispatchEvent(new Event('taskly.openSearch'))}>
        <button
          onClick={() => props.onCreateNote()}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white rounded-[var(--radius-button)] font-semibold hover:shadow-lg transition-all text-sm"
          title={props.t('create_note')}
        >
          <NoteAddIcon />
          <span className="hidden sm:inline">{props.t('create_note')}</span>
        </button>
      </Header>
      <div className="h-px bg-gray-200 dark:bg-gray-700/50" />

      {props.notes.length === 0 ? (
        <div className="flex-1 min-h-0 flex items-center justify-center p-4">
          <div className="text-center text-gray-500 dark:text-gray-400 max-w-md">
            <EmptyStateIcon icon={<DescriptionIcon />} size="lg" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">No notes yet</h2>
            <p className="text-sm mb-5">Create your first note to get started.</p>
            <button
              onClick={() => props.onCreateNote()}
              className="px-6 py-3 bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white rounded-[var(--radius-button)] font-semibold hover:shadow-lg transition-all"
            >
              {props.t('create_note')}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex w-full">
          <div
            className="h-full flex-shrink-0"
            style={{ width: `${sidebarWidth}px` }}
          >
            <NotesListColumn
              {...props}
              onSelectNote={(id) => props.onSelectNote(id)}
              onCreateNote={() => props.onCreateNote()}
              showHeader={false}
            />
          </div>

          <div
            onMouseDown={handleMouseDown}
            className="w-1.5 h-full cursor-col-resize flex-shrink-0 bg-gray-200 dark:bg-gray-700/50 hover:bg-[var(--color-primary-600)] transition-colors"
            aria-label="Resize note panel"
            role="separator"
          />

          <div className="flex-1 min-w-[300px]">
            {selectedNote ? (
              <NotesView
                key={selectedNote.id}
                note={selectedNote}
                {...props}
                isSplitView={true}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 p-4">
                <EmptyStateIcon icon={<DescriptionIcon />} size="lg" />
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Select a note</h2>
                <p className="max-w-xs mt-2">Select a note from the list to view its content.</p>
                <button
                  onClick={() => props.onCreateNote()}
                  className="mt-6 px-4 py-2 bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white rounded-[var(--radius-button)] font-semibold hover:shadow-lg transition-all"
                >
                  {props.t('create_note')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesListPage;