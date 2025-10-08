import React, { useEffect, useRef, useState } from 'react';
import { Project, Conversation, AppView, UserCategory, Note } from '../types';
import { Icon, AddIcon, ChatBubbleIcon, TodayIcon, ListAltIcon, AutorenewIcon, StyleIcon, SettingsIcon, DescriptionIcon, ChevronLeftIcon, CreateNewFolderIcon, NoteAddIcon, FolderOpenIcon, LeftPanelCloseIcon, NewHabitIcon, FilePresentIcon, ChatAddOnIcon, WidthNormalIcon, CalendarMonthIcon, FolderIcon, MoreVertIcon, EditIcon, DeleteIcon, ChevronRightIcon, ExpandMoreIcon } from './icons';
import { subscriptionService } from '../services/subscriptionService';
import TasklyLogo from './TasklyLogo';

interface SidebarProps {
  projects: Project[];
  conversations: Conversation[];
  userCategories: UserCategory[];
  activeChatId: string | null;
  activeProjectId: string | null;
  currentView: AppView;
  isCollapsed: boolean;
  onNewChat: (projectId?: string) => void;
  onNewProject: () => void;
  onSelectChat: (chatId: string) => void;
  onSelectView: (view: AppView) => void;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  t: (key: string) => string;
  onOpenFeedback: () => void;
  // Notes Section Props
  notes: Note[];
  onCreateNote: (projectId?: string) => void;

  // Optional actions for item menus
  onShareProject?: (projectId: string) => void;
  onDeleteProject?: (projectId: string) => void;
  onShareChat?: (chatId: string) => void;
  onRenameChat?: (chatId: string, newName: string) => void;
  onMoveChatToProject?: (chatId: string, projectId: string) => void;
  onRemoveChatFromProject?: (chatId: string) => void;
}

const NavItem: React.FC<{
  icon?: React.ReactNode;
  label: string;
  isActive?: boolean;
  isCollapsed: boolean;
  onDoubleClick?: () => void;
  variant?: 'default' | 'outline';
  rightSlot?: React.ReactNode;
}> = ({ icon, label, isActive, isCollapsed, onClick, onDoubleClick, variant = 'default', rightSlot }) => {
  // Compact, consistent padding for all items
  const baseClasses = `flex items-center rounded-[14px] text-sm font-medium transition-colors transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20`;
  // Desktop standard height: 40px. Apply to both collapsed and expanded.
  const shapeClasses = isCollapsed 
    ? 'w-10 h-10 justify-center mx-auto' 
    : 'w-full h-10 px-2 gap-2';

  const variantClasses = {
    default: `text-slate-200/80 hover:bg-white/10 hover:text-white`,
  } as const;
  const baseIconNormClass = 'leading-none block';
  const gradientIconClass = 'bg-gradient-to-r from-[var(--color-primary-500,#9d7bff)] via-[var(--color-primary-600)] to-[var(--color-primary-end)] bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(139,92,246,0.45)]';
  const normalizeIcon = (node: React.ReactNode, active?: boolean) => {
    if (!React.isValidElement(node)) return node;
    const existingClass = (node.props as any)?.className || '';
    const mergedClass = `${existingClass} ${baseIconNormClass} ${active ? gradientIconClass : ''}`.trim();
    const nextStyle = active ? { ...(node.props as any)?.style, color: undefined } : (node.props as any)?.style;
    return React.cloneElement(node as React.ReactElement<any>, { className: mergedClass, style: nextStyle });
  };

  if (variant === 'outline') {
    return (
      <button
        type="button"
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        title={isCollapsed ? label : ''}
        className={[
          'relative overflow-hidden rounded-[14px] transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20',
          isCollapsed ? 'w-10 h-10 flex items-center justify-center mx-auto hover:-translate-y-[1px]' : 'w-full h-10 hover:-translate-y-[1px]'
        ].join(' ')}
      >
        <div className="pointer-events-none absolute inset-0 rounded-[14px] bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)]" aria-hidden="true" />
        <div className="relative w-full h-full rounded-[14px] p-[2px]">
          <div className={`${isCollapsed ? 'flex items-center justify-center' : 'flex items-center w-full h-full px-2 gap-2'} bg-[#0d061a] rounded-[12px] text-white w-full h-full shadow-[0_12px_32px_rgba(124,58,237,0.35)]`}>
            <div className={isCollapsed ? '' : 'w-6 h-6 flex items-center justify-center'}>
              {normalizeIcon(icon, true)}
            </div>
            {!isCollapsed && <span className="flex-1 text-left text-sm font-medium">{label}</span>}
            {!isCollapsed && rightSlot}
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      title={isCollapsed ? label : ''}
      className={[
        baseClasses,
        `${variantClasses.default} ${shapeClasses}`,
        !isCollapsed ? 'w-full text-left' : '',
        isActive ? 'relative nav-item-active text-white' : '',
        isCollapsed ? 'hover:scale-105' : '',
      ].join(' ')}
    >
      {isActive && (
        <div className="pointer-events-none absolute inset-0 rounded-[14px] opacity-90" 
             style={{
               background: 'linear-gradient(145deg, rgba(124, 58, 237, 0.55), rgba(59, 130, 246, 0.45))',
               boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -8px 18px rgba(0, 0, 0, 0.55), 0 14px 42px rgba(124, 58, 237, 0.22)'
             }} 
             aria-hidden="true" 
        />
      )}
      <div className={`${isCollapsed ? 'flex items-center justify-center' : 'w-6 h-6 flex items-center justify-center'} relative`}>
        {normalizeIcon(icon, !!isActive)}
      </div>
      {!isCollapsed && (
        <span className={`${isActive ? 'text-white' : 'text-slate-200/85'} flex-1 relative`}>{label}</span>
      )}
      {!isCollapsed && rightSlot && <div className="relative">{rightSlot}</div>}
    </button>
  );
};

const HistoryItem: React.FC<{
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
  project?: Project;
  category?: UserCategory;
  // Menu props
  onShare?: () => void;
  onRename?: (newName: string) => void;
  onDelete?: () => void;
  onMoveToProject?: (projectId: string) => void;
  onRemoveFromProject?: () => void;
  allProjects?: Project[];
}> = ({ label, isActive, isCollapsed, onClick, project, category, onShare, onRename, onDelete, onMoveToProject, onRemoveFromProject, allProjects = [] }) => {
  const iconName = project ? (project.icon || category?.icon || 'folder') : undefined;
  const projectColor = project ? (project.color || category?.color) : undefined;
  const renderHistoryIcon = (active: boolean) => {
    if (iconName) {
      return <Icon name={iconName} className={`text-lg flex-shrink-0 block leading-none ${active ? 'bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)] bg-clip-text text-transparent' : ''}`} style={active ? undefined : { color: projectColor }} />
    }
    return <ChatBubbleIcon className={`text-lg flex-shrink-0 block leading-none ${active ? 'bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)] bg-clip-text text-transparent' : ''}`} />
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
        setIsMoveOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <button
      onClick={onClick}
      title={isCollapsed ? (project ? `${project.name} / ${label}` : label) : ''}
      className={`group relative ${isCollapsed ? 'w-10 h-10 justify-center mx-auto' : 'w-full h-10'} flex items-center rounded-[14px] text-sm transition-colors text-left hover:bg-white/12 ${isActive ? 'text-white nav-item-active' : 'text-slate-200/80'}`}
    >
      {isActive && (
        <div className="pointer-events-none absolute inset-0 rounded-[14px] opacity-90" 
             style={{
               background: 'linear-gradient(145deg, rgba(124, 58, 237, 0.55), rgba(59, 130, 246, 0.45))',
               boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -8px 18px rgba(0, 0, 0, 0.55), 0 14px 42px rgba(124, 58, 237, 0.22)'
             }} 
             aria-hidden="true" 
        />
      )}
      <div className={`flex items-center ${isCollapsed ? '' : 'w-full gap-2 px-2'} relative`}>
        {isCollapsed ? (
          <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 mx-auto">
            {renderHistoryIcon(!!isActive)}
          </div>
        ) : (
          <>
            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
              {renderHistoryIcon(!!isActive)}
            </div>
            <span className={`truncate flex-1 font-medium ${isActive ? 'text-white' : 'text-slate-200/85'}`}>{label}</span>
            {/* Kebab */}
            <button
              type="button"
              className="ml-auto w-8 h-8 flex items-center justify-center rounded-[12px] text-slate-300 hover:text-white hover:bg-white/12 opacity-0 group-hover:opacity-100 transition"
              onClick={(e) => { e.stopPropagation(); setIsMenuOpen(v => !v); }}
              aria-label="More actions"
            >
              <MoreVertIcon />
            </button>
          </>
        )}
      </div>
      {isMenuOpen && (
        <div ref={menuRef} className="absolute top-full right-0 mt-1 w-56 bg-[#120a21] text-slate-200 rounded-xl shadow-xl shadow-[0_18px_40px_rgba(10,0,32,0.5)] border border-white/10 z-20 p-1">
          <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onShare?.(); }} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-white/10">
            <Icon name="ios_share" className="text-base" />
            <span>Share</span>
          </button>
          <button onClick={(e) => { e.stopPropagation(); const newName = window.prompt('Rename chat', label); if (newName && newName.trim()) { onRename?.(newName.trim()); } setIsMenuOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-white/10">
            <EditIcon className="text-base" />
            <span>Rename</span>
          </button>
          <div className="relative">
            <button onClick={(e) => { e.stopPropagation(); setIsMoveOpen(v => !v); }} className="w-full text-left flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-lg hover:bg-white/10">
              <span className="flex items-center gap-2"><FolderOpenIcon className="text-base" /> Move to project</span>
              <ChevronRightIcon className="text-sm" />
            </button>
            {isMoveOpen && (
              <div className="absolute top-0 left-full ml-1 w-56 bg-[#120a21] text-slate-200 rounded-xl shadow-xl shadow-[0_18px_40px_rgba(10,0,32,0.5)] border border-white/10 z-30 p-1">
                {allProjects.map(p => (
                  <button key={p.id} onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); setIsMoveOpen(false); onMoveToProject?.(p.id); }} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-white/10">
                    <Icon name={p.icon || 'folder'} className="text-base" style={{ color: p.color }} />
                    <span className="truncate">{p.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {project && (
            <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onRemoveFromProject?.(); }} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-white/10">
              <Icon name="remove_circle" className="text-base" />
              <span>Remove from project</span>
            </button>
          )}
          <div className="my-1 h-px bg-white/10" />
          <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onDelete?.(); }} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-red-300 hover:bg-red-600/10">
            <DeleteIcon className="text-base" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </button>
  );
};

const ProjectItem: React.FC<{
  project: Project;
  userCategories: UserCategory[];
  activeProjectId: string | null;
  isCollapsed: boolean;
  onSelectProject: (projectId: string) => void;
  onShare?: () => void;
  onRename?: (newName: string) => void;
  onDelete?: () => void;
}> = ({ project, userCategories, activeProjectId, isCollapsed, onSelectProject, onShare, onRename, onDelete }) => {
    const category = userCategories.find(c => c.id === project.categoryId);
    const color = project.color || category?.color || '#64748B';
    const iconName = project.icon || category?.icon || 'folder';
    const isActive = activeProjectId === project.id;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      const onDocClick = (e: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsMenuOpen(false);
      };
      document.addEventListener('mousedown', onDocClick);
      return () => document.removeEventListener('mousedown', onDocClick);
    }, []);

    return (
      <div
        onClick={() => onSelectProject(project.id)}
        title={isCollapsed ? project.name : ''}
        className={`group relative ${isCollapsed ? 'w-10 h-10 justify-center mx-auto' : 'w-full h-10'} flex items-center rounded-[14px] text-sm cursor-pointer transition-colors hover:bg-white/12 ${isActive ? 'text-white nav-item-active' : 'text-slate-200/80'}`}
      >
        {isActive && (
          <div className="pointer-events-none absolute inset-0 rounded-[14px] opacity-90" 
               style={{
                 background: 'linear-gradient(145deg, rgba(124, 58, 237, 0.55), rgba(59, 130, 246, 0.45))',
                 boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -8px 18px rgba(0, 0, 0, 0.55), 0 14px 42px rgba(124, 58, 237, 0.22)'
               }} 
               aria-hidden="true" 
          />
        )}
        {isCollapsed ? (
          <div className="w-6 h-6 flex items-center justify-center mx-auto relative">
            <Icon
              name={iconName}
              className={`text-lg flex-shrink-0 block leading-none ${isActive ? 'bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)] bg-clip-text text-transparent' : ''}`}
              style={isActive ? undefined : { color }}
            />
          </div>
        ) : (
          <div className="w-full flex items-center gap-2 px-2 relative">
            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
              <Icon
                name={iconName}
                className={`text-lg flex-shrink-0 block leading-none ${isActive ? 'bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)] bg-clip-text text-transparent' : ''}`}
                style={isActive ? undefined : { color }}
              />
            </div>
            <span className={`truncate font-medium ${isActive ? 'text-white' : 'text-slate-200/85'}`}>{project.name}</span>
            {/* Kebab */}
            <button
              type="button"
              className="ml-auto w-8 h-8 flex items-center justify-center rounded-[12px] text-slate-300 hover:text-white hover:bg-white/12 opacity-0 group-hover:opacity-100 transition relative z-10"
              onClick={(e) => { e.stopPropagation(); setIsMenuOpen(v => !v); }}
              aria-label="More actions"
            >
              <MoreVertIcon />
            </button>
          </div>
        )}
        {isMenuOpen && (
          <div ref={menuRef} className="absolute top-full right-0 mt-1 w-56 bg-[#120a21] text-slate-200 rounded-xl shadow-xl shadow-[0_18px_40px_rgba(10,0,32,0.5)] border border-white/10 z-20 p-1">
            <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onShare?.(); }} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-white/10">
              <Icon name="ios_share" className="text-base" />
              <span>Share</span>
            </button>
            <button onClick={(e) => { e.stopPropagation(); const newName = window.prompt('Rename project', project.name); if (newName && newName.trim()) { onRename?.(newName.trim()); } setIsMenuOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-white/10">
              <EditIcon className="text-base" />
              <span>Rename</span>
            </button>
            <div className="my-1 h-px bg-white/10" />
            <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onDelete?.(); }} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-red-300 hover:bg-red-600/10">
              <DeleteIcon className="text-base" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    );
};


const Sidebar: React.FC<SidebarProps> = (props) => {
  const { 
    projects, conversations, userCategories, activeChatId, activeProjectId, currentView, isCollapsed, onNewChat,
    onNewProject, onSelectChat, onSelectView, onSelectProject, onToggleCollapse, isMobileOpen, onMobileClose, t,
    onOpenFeedback,
    notes, onCreateNote
  } = props;
  const [projectsCollapsed, setProjectsCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const saved = window.localStorage.getItem('sidebar.projectsCollapsed');
    return saved ? saved === 'true' : true;
  });
  useEffect(() => {
    try {
      window.localStorage.setItem('sidebar.projectsCollapsed', String(projectsCollapsed));
    } catch {}
  }, [projectsCollapsed]);

  const brandMenuRef = useRef<HTMLDivElement>(null);
  const [brandMenuOpen, setBrandMenuOpen] = useState(false);

  useEffect(() => {
    if (!brandMenuOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (!brandMenuRef.current?.contains(event.target as Node)) {
        setBrandMenuOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setBrandMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [brandMenuOpen]);

  useEffect(() => {
    if (isCollapsed) {
      setBrandMenuOpen(false);
    }
  }, [isCollapsed]);
  
  const sortedConversations = [...conversations].sort((a, b) => {
    // Basic sort, could be improved with last message timestamp
    return (b.projectId ? 1 : 0) - (a.projectId ? 1 : 0);
  });

  // Check Enterprise access for Stories
  const subscriptionInfo = subscriptionService.getSubscriptionInfo();
  const hasStoriesFeature = subscriptionInfo.limits.storiesFeature;
  
  return (
    <>
    <div className={`fixed inset-0 bg-black/60 z-[55] md:hidden ${isMobileOpen ? 'block' : 'hidden'}`} onClick={onMobileClose}></div>
  <div className={`fixed top-0 left-0 text-slate-200 flex flex-col h-screen pt-3 pb-2 px-3 md:pt-3 md:pb-3 md:px-3 border border-white/10 bg-[rgba(14,10,26,0.92)] backdrop-blur-2xl shadow-[0_20px_60px_rgba(15,0,40,0.55)] z-[60] transform transition-all duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} ${isCollapsed ? 'w-20' : 'w-[14.5rem]'}`} data-elevated={true}>
  <div className={`flex items-center mb-2 flex-shrink-0 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <div
              ref={brandMenuRef}
              className="relative flex w-full items-center"
            >
              <button
                type="button"
                onClick={() => setBrandMenuOpen(v => !v)}
                className="group inline-flex items-center gap-1.5 rounded-[14px] px-2 py-1.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                aria-haspopup="menu"
                aria-expanded={brandMenuOpen}
              >
                <TasklyLogo size={25} decorative />
                <span className="text-sm font-semibold text-white">Taskly.Chat</span>
                <ExpandMoreIcon className={`text-lg transition-transform ${brandMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {brandMenuOpen && (
                <div className="absolute left-0 top-full z-[80] mt-2 w-56 rounded-2xl border border-white/12 bg-[#120b26] p-2 shadow-[0_24px_60px_rgba(15,0,40,0.55)] backdrop-blur-lg dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setBrandMenuOpen(false);
                      onSelectView('settings');
                      if (isMobileOpen) onMobileClose();
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-100 hover:bg-white/10"
                  >
                    <SettingsIcon className="text-lg" />
                    <span>{t('settings')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBrandMenuOpen(false);
                      onOpenFeedback();
                      if (isMobileOpen) onMobileClose();
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-100 hover:bg-white/10"
                  >
                    <Icon name="rate_review" className="text-lg" />
                    <span>Feedback</span>
                  </button>
                </div>
              )}
            </div>
          )}
          <button onClick={onMobileClose} className="md:hidden text-slate-300 hover:text-white rounded-[14px] hover:bg-white/12 inline-flex items-center justify-center w-10 h-10">
            <LeftPanelCloseIcon />
          </button>
          <button onClick={onToggleCollapse} className="hidden md:inline-flex text-slate-300 hover:text-white rounded-[14px] hover:bg-white/12 items-center justify-center w-10 h-10">
            {isCollapsed ? <WidthNormalIcon /> : <LeftPanelCloseIcon />}
          </button>
        </div>

    <div className="flex flex-col min-h-0 flex-1">
  <div className="flex-1 overflow-y-auto pr-0 sidebar-scroll">
              {/* Primary Actions */}
    <nav className="space-y-[1px] mb-2">
          <NavItem 
            variant="outline" 
            icon={<ChatAddOnIcon className="text-lg"/>} 
            label={t('new_chat')} 
            isCollapsed={isCollapsed} 
            onClick={() => onNewChat()} 
            rightSlot={<span className="invisible">.</span>} 
          />
        </nav>
        
              {/* Main Views */}
              <nav className="space-y-[1px]">
                  <NavItem icon={<TodayIcon className="text-lg"/>} label={t('dashboard')} isActive={currentView === 'dashboard'} isCollapsed={isCollapsed} onClick={() => onSelectView('dashboard')} />
                  <NavItem icon={<ListAltIcon className="text-lg"/>} label={t('tasks')} isActive={currentView === 'lists'} isCollapsed={isCollapsed} onClick={() => onSelectView('lists')} />
      <NavItem icon={<NewHabitIcon className="text-lg"/>} label={t('habits')} isActive={currentView === 'habits'} isCollapsed={isCollapsed} onClick={() => onSelectView('habits')} />
      <NavItem icon={<DescriptionIcon className="text-lg"/>} label={t('notes')} isActive={currentView === 'notes'} isCollapsed={isCollapsed} onClick={() => onSelectView('notes')} />
      {/* Sidebar-specific tweak: reduce scrollbar right gap to feel tighter */}
      <style>{`
        .sidebar-scroll::-webkit-scrollbar {
          width: 6px; /* match global but ensure no extra space from container */
        }
        /* Neutralize any default padding that could create a perceived gap */
        .sidebar-scroll { padding-right: 0 !important; margin-right: 0 !important; }
      `}</style>
                  {hasStoriesFeature && (
                    <NavItem 
                      icon={<Icon name="auto_stories" className="text-lg" style={{ color: 'var(--color-accent-500)' }} />} 
                      label="Stories" 
                      isActive={currentView === 'stories'} 
                      isCollapsed={isCollapsed} 
                      onClick={() => onSelectView('stories')} 
                    />
                  )}
    <NavItem icon={<Icon name="concierge" className="text-lg" />} label="Requests" isActive={currentView === 'requests'} isCollapsed={isCollapsed} onClick={() => onSelectView('requests')} />
                  <NavItem icon={<CalendarMonthIcon className="text-lg"/>} label={t('calendar')} isActive={currentView === 'calendar'} isCollapsed={isCollapsed} onClick={() => onSelectView('calendar')} />
                   <NavItem icon={<FilePresentIcon className="text-lg"/>} label={t('files')} isActive={currentView === 'files'} isCollapsed={isCollapsed} onClick={() => onSelectView('files')} />
              </nav>
              
              {/* Projects Section */}
              <div>
                {!isCollapsed && <div className="border-t border-gray-700/30"></div>}
                {/* Projects header: single-click opens Projects, double-click toggles collapse/expand of the list */}
                <div className="relative">
                  <NavItem 
                    icon={<FolderOpenIcon className="text-lg"/>} 
                    label={t('projects')} 
                    isActive={currentView === 'projects'} 
                    isCollapsed={isCollapsed} 
                    onClick={() => onSelectView('projects')}
                    rightSlot={!isCollapsed ? (
                      <button
                        type="button"
                        className="w-6 h-6 flex items-center justify-center rounded-[12px] text-gray-400 hover:text-white hover:bg-gray-600/40"
                        onClick={(e) => { e.stopPropagation(); setProjectsCollapsed(p => !p); }}
                        aria-label={projectsCollapsed ? 'Expand projects' : 'Collapse projects'}
                      >
                        {projectsCollapsed ? <ChevronRightIcon className="text-base"/> : <ExpandMoreIcon className="text-base"/>}
                      </button>
                    ) : undefined}
                  />
                </div>
                {!projectsCollapsed && (
                  <div className="space-y-[1px]">
                      {projects.map(project => (
                          <ProjectItem 
                              key={project.id}
                              project={project}
                              userCategories={userCategories}
                              activeProjectId={activeProjectId}
                              isCollapsed={isCollapsed}
                              onSelectProject={onSelectProject}
                              onShare={() => props.onShareProject?.(project.id)}
                              onRename={(newName) => props.onRenameProject?.(project.id, newName)}
                              onDelete={() => props.onDeleteProject?.(project.id)}
                          />
                      ))}
                  </div>
                )}
              </div>

              {/* All Chats */}
              {conversations.length > 0 && (
                <div className="space-y-[1px]">
                    {/* Chats section header: show full label when expanded; when collapsed, show a divider with a tiny chat icon */}
                    {!isCollapsed ? (
                      <h2 className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('chats')}</h2>
                    ) : (
                      <div className="flex items-center my-1" aria-hidden="false">
                        <div className="flex-1 h-px bg-gray-700/40" />
                        <div className="w-9 h-9 mx-auto flex items-center justify-center" title={t('chats')}>
                          <ChatBubbleIcon className="text-base text-gray-400" />
                        </div>
                        <div className="flex-1 h-px bg-gray-700/40" />
                      </div>
                    )}
                    {sortedConversations.map(convo => {
                      const project = convo.projectId ? projects.find(p => p.id === convo.projectId) : undefined;
                      const category = project ? userCategories.find(c => c.id === project.categoryId) : undefined;
                      return (
                        <HistoryItem 
                          key={convo.id}
                          label={convo.name}
                          isActive={activeChatId === convo.id}
                          isCollapsed={isCollapsed}
                          onClick={() => onSelectChat(convo.id)}
                          project={project}
                          category={category}
                          onShare={() => props.onShareChat?.(convo.id)}
                          onRename={(newName) => props.onRenameChat?.(convo.id, newName)}
                          onDelete={() => props.onDeleteChat?.(convo.id)}
                          onMoveToProject={(projectId) => props.onMoveChatToProject?.(convo.id, projectId)}
                          onRemoveFromProject={() => props.onRemoveChatFromProject?.(convo.id)}
                          allProjects={projects}
                        />
                      );
                    })}
              </div>
              )}
            </div>
        </div>
        
      </div>
    </>
  );
};

export default Sidebar;