import React from 'react';
import { ProjectFile, Project, UserCategory } from '../types';
import { FolderOpenIcon, ImageIcon, PictureAsPdfIcon, ArticleIcon, DeleteIcon, FolderIcon, LeftPanelOpenIcon } from './icons';
import Header from './Header';
import EmptyStateIcon from './EmptyStateIcon';

const FileIcon: React.FC<{ mimeType: string; className?: string }> = ({ mimeType, className }) => {
  if (mimeType.startsWith('image/')) return <ImageIcon className={className} />;
  if (mimeType === 'application/pdf') return <PictureAsPdfIcon className={className} />;
  return <ArticleIcon className={className} />;
};

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

interface FilesViewProps {
    projectFiles: ProjectFile[];
    projects: Project[];
    userCategories: UserCategory[];
    onDeleteFile: (fileId: string) => void;
    onPreviewFile: (file: ProjectFile) => void;
    onToggleSidebar: () => void;
    t: (key: string) => string;
}

const FilesView: React.FC<FilesViewProps> = ({ projectFiles, projects, userCategories, onDeleteFile, onPreviewFile, onToggleSidebar, t }) => {
    
    const filesByProject = projects.map(project => ({
        ...project,
        files: projectFiles.filter(file => file.projectId === project.id)
    })).filter(project => project.files.length > 0);

    return (
        <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-800 h-full">
            <Header title={t('files')} onToggleSidebar={onToggleSidebar} onOpenSearch={() => window.dispatchEvent(new Event('taskly.openSearch'))} />
            <div className="flex-1 overflow-y-auto">
              <div className="px-4 sm:px-6">
                <div className="mx-auto w-full max-w-5xl py-4 sm:py-6">
                {projectFiles.length > 0 ? (
                    <div className="space-y-6">
                        {filesByProject.map(project => {
                            const category = userCategories.find(c => c.id === project.categoryId);
                            return (
                                <div key={project.id}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <FolderIcon className="text-xl" style={{ color: category?.color }} />
                                        <h2 className="text-lg font-semibold">{project.name}</h2>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {project.files.map(file => (
                                             <div key={file.id} onClick={() => onPreviewFile(file)} className="bg-white dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700/50 flex flex-col items-center justify-center aspect-square group relative cursor-pointer overflow-hidden">
                                                {file.mimeType.startsWith('image/') ? (
                                                   <img src={`data:${file.mimeType};base64,${file.data}`} alt={file.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2 text-center p-2">
                                                        <FileIcon mimeType={file.mimeType} className="text-4xl text-gray-500 dark:text-gray-400" />
                                                        <p className="text-xs text-gray-500">{formatBytes(file.size)}</p>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                                <div className="absolute bottom-0 left-0 right-0 p-1.5 text-white text-xs truncate text-center">
                                                    {file.name}
                                                </div>
                                                <button onClick={(e) => { e.stopPropagation(); onDeleteFile(file.id); }} className="absolute top-1 right-1 p-1 bg-black/40 rounded-full text-white hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <DeleteIcon className="text-sm"/>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 flex flex-col items-center justify-center min-h-[50vh] p-6">
                        <EmptyStateIcon icon={<FolderOpenIcon />} size="lg" />
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{t('no_files_yet')}</h2>
                        <p className="max-w-md mt-1 mb-6">{t('no_files_yet_subtitle')}</p>
                    </div>
                )}
                </div>
              </div>
            </div>
        </div>
    );
};

export default FilesView;
