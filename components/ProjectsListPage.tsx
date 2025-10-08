import React from 'react';
import { Project, UserCategory } from '../types';
import { CreateNewFolderIcon, FolderIcon, WidthNormalIcon } from './icons';
import Header from './Header';
import EmptyState from './EmptyState';

const Icon: React.FC<{ name: string; className?: string; style?: React.CSSProperties }> = ({ name, className, style }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>{name}</span>
);

interface ProjectsListPageProps {
  projects: Project[];
  userCategories: UserCategory[];
  onSelectProject: (projectId: string) => void;
  onNewProject: () => void;
  onToggleSidebar: () => void;
  t: (key: string) => string;
}

const ProjectCard: React.FC<{
  project: Project;
  category?: UserCategory;
  onSelect: () => void;
}> = ({ project, category, onSelect }) => {
  const color = category?.color || '#64748B';
  const iconName = category?.icon || project.icon || 'folder';

  return (
    <button
      onClick={onSelect}
      className="resend-glass-panel group relative w-full h-full rounded-2xl px-5 py-6 text-left overflow-hidden transition-transform duration-200 hover:-translate-y-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:ring-[rgba(139,92,246,0.55)]"
      style={{ borderRadius: '20px' }}
    >
      {/* Soft gradient wash that picks up the category color */}
      <span
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at 20% 20%, ${color}33, transparent 55%)`,
        }}
      />
      <div className="relative flex items-start gap-4">
        <div
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-inner"
          style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.18), 0 8px 20px ${color}25` }}
        >
          <Icon name={iconName} className="text-2xl" style={{ color }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-semibold text-gray-100">{project.name}</h3>
            {category && (
              <span className="resend-badge !text-[10px] uppercase tracking-[0.08em]" style={{ borderColor: `${color}55`, background: `${color}18`, color: `${color}ee` }}>
                {category.name}
              </span>
            )}
          </div>
          <p className="mt-2 line-clamp-3 text-sm text-gray-400">
            {project.description || 'No description provided yet. Add a quick summary to orient collaborators.'}
          </p>
        </div>
      </div>
      <div className="relative mt-6 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-gray-500">
        <span className="flex items-center gap-2 font-semibold">
          <WidthNormalIcon className="text-base" />
          {project.instructions ? 'AI BRIEF ACTIVE' : 'PROJECT OVERVIEW'}
        </span>
        <span className="flex items-center gap-2 text-[10px]">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
          {project.members?.length ? `${project.members.length} collaborators` : 'Solo workspace'}
        </span>
      </div>
    </button>
  );
};


const ProjectsListPage: React.FC<ProjectsListPageProps> = ({ projects, userCategories, onSelectProject, onNewProject, onToggleSidebar, t }) => {
  return (
    <div className="resend-app-shell flex h-full flex-1 flex-col">
      <Header
        title={t('projects')}
        onToggleSidebar={onToggleSidebar}
        onOpenSearch={() => window.dispatchEvent(new Event('taskly.openSearch'))}
      >
        <button
          onClick={onNewProject}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)] rounded-[var(--radius-button)] font-semibold hover:shadow-lg transition-all text-sm"
          style={{ color: '#FFFFFF' }}
          title={t('new_project')}
          aria-label={t('new_project')}
        >
          <CreateNewFolderIcon className="text-base" />
          <span className="hidden sm:inline">{t('new_project')}</span>
        </button>
      </Header>
      <div className="flex-1 overflow-y-auto px-4 pb-10 sm:px-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 py-6">
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {projects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  category={userCategories.find(c => c.id === project.categoryId)}
                  onSelect={() => onSelectProject(project.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<FolderIcon />}
              title="Create your first project"
              description="Projects gather related tasks, notes, and files into a single workspace. Spin up a project to unlock tailored AI support and keep teams aligned."
              primaryAction={{
                label: t('new_project'),
                onClick: onNewProject,
                icon: <CreateNewFolderIcon className="text-base" />,
              }}
              variant="minimal"
              className="mx-auto my-16 w-full max-w-3xl"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectsListPage;
