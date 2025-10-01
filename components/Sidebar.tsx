import React, { useEffect, useRef, useState } from 'react';
import { Project, Conversation, AppView, UserCategory, Note } from '../types';
import { Icon, AddIcon, ChatBubbleIcon, TodayIcon, ListAltIcon, AutorenewIcon, StyleIcon, SettingsIcon, DescriptionIcon, ChevronLeftIcon, CreateNewFolderIcon, NoteAddIcon, FolderOpenIcon, LeftPanelCloseIcon, NewHabitIcon, FilePresentIcon, ChatAddOnIcon, WidthNormalIcon, CalendarMonthIcon, FolderIcon, MoreVertIcon, EditIcon, DeleteIcon, ChevronRightIcon, ExpandMoreIcon } from './icons';
import { subscriptionService } from '../services/subscriptionService';

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
  onSelectProject: (projectId: string) => void;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  t: (key: string) => string;
  // Notes Section Props
  notes: Note[];
  onCreateNote: (projectId?: string) => void;

  // Optional actions for item menus
  onShareProject?: (projectId: string) => void;
  onRenameProject?: (projectId: string, newName: string) => void;
  onDeleteProject?: (projectId: string) => void;
  onShareChat?: (chatId: string) => void;
  onRenameChat?: (chatId: string, newName: string) => void;
  onDeleteChat?: (chatId: string) => void;
  onMoveChatToProject?: (chatId: string, projectId: string) => void;
  onRemoveChatFromProject?: (chatId: string) => void;
}

const NavItem: React.FC<{
  icon?: React.ReactNode;
  label: string;
  isActive?: boolean;
  isCollapsed: boolean;
  onClick: () => void;
  onDoubleClick?: () => void;
  variant?: 'default' | 'outline';
  rightSlot?: React.ReactNode;
}> = ({ icon, label, isActive, isCollapsed, onClick, onDoubleClick, variant = 'default', rightSlot }) => {
  // Compact, consistent padding for all items
  const baseClasses = `flex items-center rounded-[12px] text-sm transition-colors transition-transform`;
  // Desktop standard height: 36px (h-9). Apply to both collapsed and expanded.
  const shapeClasses = isCollapsed 
    ? 'w-9 h-9 justify-center mx-auto' 
    : 'w-full h-9 px-1.5 space-x-2';
  
  const variantClasses = {
  default: `text-gray-300 hover:bg-gray-700/50`,
    outline: `bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 hover:from-[var(--color-primary-700)] hover:to-purple-700`
  } as const;

  const appliedVariant = variantClasses[variant];

  const baseIconNormClass = 'leading-none block';
  const gradientIconClass = 'bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 bg-clip-text text-transparent';
  const normalizeIcon = (node: React.ReactNode, active?: boolean) => {
    if (!React.isValidElement(node)) return node;
    const existingClass = (node.props as any)?.className || '';
    const mergedClass = `${existingClass} ${baseIconNormClass} ${active ? gradientIconClass : ''}`.trim();
    const nextStyle = active ? { ...(node.props as any)?.style, color: undefined } : (node.props as any)?.style;
    return React.cloneElement(node as React.ReactElement<any>, { className: mergedClass, style: nextStyle });
  };

  return (
    <button
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      title={isCollapsed ? label : ''}
      className={[
        baseClasses,
        // Use square shape on collapsed, full-width on expanded
        appliedVariant,
  variant === 'outline' ? `p-[2px] ${isCollapsed ? 'w-9 h-9 mx-auto' : 'w-full h-9'}` : '',
        variant !== 'outline' ? shapeClasses : '',
        !isCollapsed ? 'w-full text-left' : '',
    // Selected items: slightly darker, tighter padding feel
        isActive && variant !== 'outline' ? 'bg-gray-700/70' : '',
        // Add subtle inner-shadow circle only for collapsed + active
        isCollapsed && isActive && variant !== 'outline' ? 'relative nav-active-collapsed' : '',
        isCollapsed ? 'hover:scale-105' : '',
      ].join(' ')}
    >
      {variant === 'outline' ? (
  <div className={`${isCollapsed ? 'flex items-center justify-center' : 'flex items-center w-full h-full px-1.5 space-x-2'} bg-gray-900 rounded-[10px] w-full h-full`}>
          <div className={isCollapsed ? '' : 'w-6 h-6 flex items-center justify-center'}>
            {normalizeIcon(icon, true)}
          </div>
          {!isCollapsed && <span className="text-white flex-1">{label}</span>}
          {!isCollapsed && rightSlot}
        </div>
      ) : (
        <>
          <div className={isCollapsed ? 'flex items-center justify-center' : 'w-6 h-6 flex items-center justify-center'}>
            {normalizeIcon(icon, !!isActive)}
          </div>
          {!isCollapsed && (
            <span className={`${isActive ? 'text-white' : 'text-gray-300'} flex-1`}>{label}</span>
          )}
          {!isCollapsed && rightSlot}
        </>
      )}
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
      return <Icon name={iconName} className={`text-xl flex-shrink-0 block leading-none ${active ? 'bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 bg-clip-text text-transparent' : ''}`} style={active ? undefined : { color: projectColor }} />
    }
    return <ChatBubbleIcon className={`text-xl flex-shrink-0 block leading-none ${active ? 'bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 bg-clip-text text-transparent' : ''}`} />
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
      className={`group relative ${isCollapsed ? 'w-9 h-9 justify-center mx-auto' : 'w-full h-9'} flex items-center rounded-[12px] text-sm transition-colors text-left hover:bg-gray-700/40 ${isActive ? 'bg-gray-700/60' : ''} ${isCollapsed && isActive ? 'nav-active-collapsed' : ''}`}
    >
      <div className={`flex items-center ${isCollapsed ? '' : 'w-full gap-2 px-1.5'}`}>
        {isCollapsed ? (
          <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 mx-auto">
            {renderHistoryIcon(!!isActive)}
          </div>
        ) : (
          <>
            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
              {renderHistoryIcon(!!isActive)}
            </div>
            <span className={`truncate flex-1 font-normal ${isActive ? 'text-white' : 'text-gray-300'}`}>{label}</span>
            {/* Kebab */}
            <button
              type="button"
              className="ml-auto w-8 h-8 flex items-center justify-center rounded-[12px] text-gray-400 hover:text-white hover:bg-gray-600/40 opacity-0 group-hover:opacity-100 transition"
              onClick={(e) => { e.stopPropagation(); setIsMenuOpen(v => !v); }}
              aria-label="More actions"
            >
              <MoreVertIcon />
            </button>
          </>
        )}
      </div>
      {isMenuOpen && (
        <div ref={menuRef} className="absolute top-full right-0 mt-1 w-56 bg-gray-100 dark:bg-gray-700 rounded-xl shadow-xl z-20 p-1">
          <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onShare?.(); }} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
            <Icon name="ios_share" className="text-base" />
            <span>Share</span>
          </button>
          <button onClick={(e) => { e.stopPropagation(); const newName = window.prompt('Rename chat', label); if (newName && newName.trim()) { onRename?.(newName.trim()); } setIsMenuOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
            <EditIcon className="text-base" />
            <span>Rename</span>
          </button>
          <div className="relative">
            <button onClick={(e) => { e.stopPropagation(); setIsMoveOpen(v => !v); }} className="w-full text-left flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
              <span className="flex items-center gap-2"><FolderOpenIcon className="text-base" /> Move to project</span>
              <ChevronRightIcon className="text-sm" />
            </button>
            {isMoveOpen && (
              <div className="absolute top-0 left-full ml-1 w-56 bg-gray-100 dark:bg-gray-700 rounded-xl shadow-xl z-30 p-1">
                {allProjects.map(p => (
                  <button key={p.id} onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); setIsMoveOpen(false); onMoveToProject?.(p.id); }} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
                    <Icon name={p.icon || 'folder'} className="text-base" style={{ color: p.color }} />
                    <span className="truncate">{p.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {project && (
            <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onRemoveFromProject?.(); }} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
              <Icon name="remove_circle" className="text-base" />
              <span>Remove from project</span>
            </button>
          )}
          <div className="my-1 h-px bg-gray-300 dark:bg-gray-600" />
          <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onDelete?.(); }} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-red-500/10 text-red-600 dark:text-red-400">
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
        className={`group relative ${isCollapsed ? 'w-9 h-9 justify-center mx-auto' : 'w-full h-9'} flex items-center rounded-[12px] text-sm cursor-pointer transition-colors hover:bg-gray-700/40 ${isActive ? 'bg-gray-700/60' : ''} ${isCollapsed && isActive ? 'nav-active-collapsed' : ''}`}
      >
        {isCollapsed ? (
          <div className="w-6 h-6 flex items-center justify-center mx-auto">
            <Icon
              name={iconName}
              className={`text-xl flex-shrink-0 block leading-none ${isActive ? 'bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 bg-clip-text text-transparent' : ''}`}
              style={isActive ? undefined : { color }}
            />
          </div>
        ) : (
          <div className="w-full flex items-center gap-2 px-1.5">
            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
              <Icon
                name={iconName}
                className={`text-xl flex-shrink-0 block leading-none ${isActive ? 'bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 bg-clip-text text-transparent' : ''}`}
                style={isActive ? undefined : { color }}
              />
            </div>
            <span className={`truncate font-normal ${isActive ? 'text-white' : 'text-gray-300'}`}>{project.name}</span>
            {/* Kebab */}
            <button
              type="button"
              className="ml-auto w-8 h-8 flex items-center justify-center rounded-[12px] text-gray-400 hover:text-white hover:bg-gray-600/40 opacity-0 group-hover:opacity-100 transition"
              onClick={(e) => { e.stopPropagation(); setIsMenuOpen(v => !v); }}
              aria-label="More actions"
            >
              <MoreVertIcon />
            </button>
          </div>
        )}
        {isMenuOpen && (
          <div ref={menuRef} className="absolute top-full right-0 mt-1 w-56 bg-gray-100 dark:bg-gray-700 rounded-xl shadow-xl z-20 p-1">
            <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onShare?.(); }} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
              <Icon name="ios_share" className="text-base" />
              <span>Share</span>
            </button>
            <button onClick={(e) => { e.stopPropagation(); const newName = window.prompt('Rename project', project.name); if (newName && newName.trim()) { onRename?.(newName.trim()); } setIsMenuOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
              <EditIcon className="text-base" />
              <span>Rename</span>
            </button>
            <div className="my-1 h-px bg-gray-300 dark:bg-gray-600" />
            <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onDelete?.(); }} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-red-500/10 text-red-600 dark:text-red-400">
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
  
  const sortedConversations = [...conversations].sort((a, b) => {
    // Basic sort, could be improved with last message timestamp
    return (b.projectId ? 1 : 0) - (a.projectId ? 1 : 0);
  });

  // Check Enterprise access for Stories
  const subscriptionInfo = subscriptionService.getSubscriptionInfo();
  const hasStoriesFeature = subscriptionInfo.limits.storiesFeature;
  
  return (
    <>
    <div className={`fixed inset-0 bg-gray-900/60 z-[55] md:hidden ${isMobileOpen ? 'block' : 'hidden'}`} onClick={onMobileClose}></div>
  <div className={`fixed top-0 left-0 bg-gray-900 text-gray-300 flex flex-col h-screen pt-4 pb-2 px-2 md:pt-4 md:pb-2 md:px-2 border-r border-gray-700/50 z-[60] transform transition-all duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} ${isCollapsed ? 'w-20' : 'w-[13.5rem]'}`}>
  <div className={`flex items-center mb-4 flex-shrink-0 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed ? (
            <div className="flex items-center ml-2 gap-2">
              <span className="material-symbols-outlined text-2xl text-white">things_to_do</span>
              <span className="text-lg font-medium text-white">Taskly.Chat</span>
            </div>
          ) : (
            <div className="hidden" aria-hidden="true"></div>
          )}
          <button onClick={onMobileClose} className="md:hidden text-gray-400 hover:text-white rounded-[12px] hover:bg-gray-700/50 inline-flex items-center justify-center w-9 h-9">
            <LeftPanelCloseIcon />
          </button>
          <button onClick={onToggleCollapse} className="hidden md:inline-flex text-gray-400 hover:text-white rounded-[12px] hover:bg-gray-700/50 items-center justify-center w-9 h-9">
            {isCollapsed ? <WidthNormalIcon /> : <LeftPanelCloseIcon />}
          </button>
        </div>

    <div className="flex-grow flex flex-col min-h-0">
  <div className="flex-grow overflow-y-auto pr-0 sidebar-scroll">
              {/* Primary Actions */}
    <nav className="space-y-0 mb-2">
          <NavItem 
            variant="outline" 
            icon={<ChatAddOnIcon className="text-xl"/>} 
            label={t('new_chat')} 
            isCollapsed={isCollapsed} 
            onClick={() => onNewChat()} 
            rightSlot={<span className="invisible">.</span>} 
          />
        </nav>
        
              {/* Main Views */}
              <nav className="space-y-0">
                  <NavItem icon={<TodayIcon className="text-xl"/>} label={t('dashboard')} isActive={currentView === 'dashboard'} isCollapsed={isCollapsed} onClick={() => onSelectView('dashboard')} />
                  <NavItem icon={<ListAltIcon className="text-xl"/>} label={t('tasks')} isActive={currentView === 'lists'} isCollapsed={isCollapsed} onClick={() => onSelectView('lists')} />
      <NavItem icon={<NewHabitIcon className="text-xl"/>} label={t('habits')} isActive={currentView === 'habits'} isCollapsed={isCollapsed} onClick={() => onSelectView('habits')} />
    <NavItem icon={<Icon name="concierge" className="text-xl" />} label="Requests" isActive={currentView === 'requests'} isCollapsed={isCollapsed} onClick={() => onSelectView('requests')} />
      {/* Sidebar-specific tweak: reduce scrollbar right gap to feel tighter */}
      <style>{`
        .sidebar-scroll::-webkit-scrollbar {
          width: 6px; /* match global but ensure no extra space from container */
        }
        /* Neutralize any default padding that could create a perceived gap */
        .sidebar-scroll { padding-right: 0 !important; margin-right: 0 !important; }
      `}</style>
                  <NavItem icon={<CalendarMonthIcon className="text-xl"/>} label={t('calendar')} isActive={currentView === 'calendar'} isCollapsed={isCollapsed} onClick={() => onSelectView('calendar')} />
                  {hasStoriesFeature && (
                    <NavItem 
                      icon={<Icon name="auto_stories" className="text-xl" style={{ color: 'var(--color-accent-500)' }} />} 
                      label="Stories" 
                      isActive={currentView === 'stories'} 
                      isCollapsed={isCollapsed} 
                      onClick={() => onSelectView('stories')} 
                    />
                  )}
                   <NavItem icon={<DescriptionIcon className="text-xl"/>} label={t('notes')} isActive={currentView === 'notes'} isCollapsed={isCollapsed} onClick={() => onSelectView('notes')} />
                   <NavItem icon={<FilePresentIcon className="text-xl"/>} label={t('files')} isActive={currentView === 'files'} isCollapsed={isCollapsed} onClick={() => onSelectView('files')} />
              </nav>
              
              {/* Projects Section */}
              <div>
                <div className="border-t border-gray-700/30"></div>
                {/* Projects header: single-click opens Projects, double-click toggles collapse/expand of the list */}
                <div className="relative">
                  <NavItem 
                    icon={<FolderOpenIcon className="text-xl"/>} 
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
                  <div className="space-y-0">
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
                <div className="space-y-0">
                    {/* Chats section header: show full label when expanded; when collapsed, show a divider with a tiny chat icon */}
                    {!isCollapsed ? (
                      <h2 className="px-2 py-1 text-xs font-medium text-gray-400">{t('chats')}</h2>
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
        
        <div className="flex-shrink-0 pt-1 border-t border-gray-700/50">
             <NavItem icon={<SettingsIcon className="text-xl"/>} label={t('settings')} isActive={currentView === 'settings'} isCollapsed={isCollapsed} onClick={() => onSelectView('settings')} />
        </div>
      </div>
    </>
  );
};

export default Sidebar;