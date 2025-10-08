import React from 'react';
import { ProjectFile, Project, UserCategory } from '../types';
import { FolderOpenIcon, ImageIcon, PictureAsPdfIcon, ArticleIcon, DeleteIcon, FolderIcon, LeftPanelOpenIcon } from './icons';
import Header from './Header';
import EmptyState from './EmptyState';

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
        <div className="flex-1 flex flex-col h-full">
            <Header title={t('files')} onToggleSidebar={onToggleSidebar} onOpenSearch={() => window.dispatchEvent(new Event('taskly.openSearch'))} />
            <div className="flex-1 overflow-y-auto">
              <div className="px-4 sm:px-6">
                <div className="mx-auto w-full max-w-5xl py-4 sm:py-6">
                {projectFiles.length > 0 ? (
                    <div className="space-y-6">
                        {filesByProject.map(project => {
                            const category = userCategories.find(c => c.id === project.categoryId);
                            return (
                                <div key={project.id} className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[rgba(15,10,32,0.9)] backdrop-blur-xl p-4 sm:p-6 shadow-[0_22px_60px_rgba(12,0,32,0.45)]" data-elevated={true}>
                                    <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-white/20 via-transparent to-[var(--color-primary-600)]/18" aria-hidden="true" />
                                    <div className="relative flex items-center gap-2 mb-4">
                                        <FolderIcon className="text-xl" style={{ color: category?.color }} />
                                        <h2 className="text-lg font-semibold text-slate-100 tracking-tight">{project.name}</h2>
                                    </div>
                                    <div className="relative grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {project.files.map(file => (
                                            <div
                                                key={file.id}
                                                onClick={() => onPreviewFile(file)}
                                                className="group relative flex flex-col items-center justify-center aspect-square rounded-2xl border border-white/10 bg-white/10 backdrop-blur-lg cursor-pointer overflow-hidden transition-transform hover:-translate-y-[3px]"
                                            >
                                                {file.mimeType.startsWith('image/') ? (
                                                    <img src={`data:${file.mimeType};base64,${file.data}`} alt={file.name} className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110" />
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2 text-center p-3">
                                                        <FileIcon mimeType={file.mimeType} className="text-4xl text-slate-100" />
                                                        <p className="text-xs text-slate-200/80">{formatBytes(file.size)}</p>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent pointer-events-none" />
                                                <div className="absolute bottom-0 left-0 right-0 p-2 text-xs font-medium text-white truncate text-center drop-shadow-lg">
                                                    {file.name}
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDeleteFile(file.id);
                                                    }}
                                                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/55 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70 backdrop-blur"
                                                    aria-label={`Delete ${file.name}`}
                                                >
                                                    <DeleteIcon className="text-sm" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <EmptyState
                        icon={<FolderOpenIcon />}
                        title={t('no_files_yet')}
                        description={t('no_files_yet_subtitle')}
                        className="min-h-[48vh]"
                    />
                )}
                </div>
              </div>
            </div>
        </div>
    );
};

export default FilesView;
