import React from 'react';
import { Project, UserCategory } from '../types';
import { DescriptionIcon, FolderIcon, CloseIcon, ChatBubbleIcon } from './icons';
import ModalOverlay from './ModalOverlay';

interface ProjectLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  userCategories: UserCategory[];
  currentProjectId?: string;
  onLink: (projectId?: string) => void;
  title: string;
  itemType: 'Note' | 'Chat';
}

const ProjectLinkModal: React.FC<ProjectLinkModalProps> = ({ isOpen, onClose, projects, userCategories, currentProjectId, onLink, title, itemType }) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay className="flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md max-h-[70vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="p-4 flex items-center justify-between border-b border-gray-700">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-[var(--radius-button)] hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white" aria-label="Close"><CloseIcon /></button>
        </header>
        <main className="p-2 overflow-y-auto">
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => { onLink(undefined); onClose(); }}
                className={`w-full text-left p-3 rounded-md flex items-center gap-3 transition-colors ${!currentProjectId ? 'bg-[var(--color-primary-600)]/30' : 'hover:bg-gray-700/70'}`}
              >
                {itemType === 'Note' ? <DescriptionIcon className="text-xl" /> : <ChatBubbleIcon className="text-xl" />}
                <span>Standalone {itemType}</span>
              </button>
            </li>
            {projects.map(project => {
              const category = userCategories.find(c => c.id === project.categoryId);
              return (
                <li key={project.id}>
                  <button
                    onClick={() => { onLink(project.id); onClose(); }}
                    className={`w-full text-left p-3 rounded-md flex items-center gap-3 transition-colors ${currentProjectId === project.id ? 'bg-[var(--color-primary-600)]/30' : 'hover:bg-gray-700/70'}`}
                  >
                    {category ? (
                      <span className="material-symbols-outlined" style={{ color: category.color }}>{category.icon}</span>
                    ) : (
                      <FolderIcon className="text-xl" />
                    )}
                    <span className="truncate">{project.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </main>
      </div>
    </ModalOverlay>
  );
};

export default ProjectLinkModal;
