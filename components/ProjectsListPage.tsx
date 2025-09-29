import React from 'react';
import { Project, UserCategory } from '../types';
import { CreateNewFolderIcon, FolderIcon, WidthNormalIcon } from './icons';
import Header from './Header';

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
  return (
  <div onClick={onSelect} className="bg-white dark:bg-gray-700/50 p-3 rounded-xl flex flex-col gap-2 group transition-all hover:shadow-md cursor-pointer">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}20` }}>
          <Icon name={category?.icon || 'folder'} style={{ color }} className="text-2xl" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate flex-1">{project.name}</h3>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 flex-grow">{project.description || 'No description.'}</p>
    </div>
  );
};


const ProjectsListPage: React.FC<ProjectsListPageProps> = ({ projects, userCategories, onSelectProject, onNewProject, onToggleSidebar, t }) => {
  return (
    <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-800 h-full">
      <Header title={t('projects')} onToggleSidebar={onToggleSidebar}>
        <button onClick={onNewProject} className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white rounded-[var(--radius-button)] font-semibold hover:shadow-lg transition-all text-sm">
          <CreateNewFolderIcon />
          <span className="hidden sm:inline">{t('new_project')}</span>
        </button>
      </Header>
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 sm:px-6">
          <div className="mx-auto w-full max-w-5xl py-4 sm:py-6">
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
          <div className="text-center text-gray-500 flex flex-col items-center justify-center h-full p-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 flex items-center justify-center shadow-md mb-6">
              <FolderIcon className="text-4xl text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">No Projects Yet</h2>
            <p className="max-w-md mt-1 mb-6">Projects help you group related tasks, notes, and chats. Create your first project to get started.</p>
            <button onClick={onNewProject} className="mt-6 px-6 py-3 bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white rounded-[var(--radius-button)] font-semibold hover:shadow-lg transition-all">
              Create Your First Project
            </button>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsListPage;
