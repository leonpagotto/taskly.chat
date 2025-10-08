import React, { useState, useRef } from 'react';
import { Project, Conversation, Checklist, Note, UserCategory, Task, ProjectFile } from '../types';
import { AddIcon, ChatBubbleIcon, DescriptionIcon, ListAltIcon, RadioButtonUncheckedIcon, CloseIcon, EditIcon, CheckIcon, FolderOpenIcon, FileUploadIcon, ImageIcon, PictureAsPdfIcon, ArticleIcon, DeleteIcon } from './icons';
import Header from './Header';

const GradientCheckCircle: React.FC<{className?: string}> = ({ className }) => (
    <div className={`w-6 h-6 rounded-full bg-gradient-to-br from-[var(--color-primary-600)] to-[var(--color-primary-end)] flex items-center justify-center ${className}`}>
        <CheckIcon className="text-white text-base" />
    </div>
);

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

const TaskItem: React.FC<{
    task: Task & { listId: string; listName: string };
    onToggle: (listId: string, taskId: string) => void;
}> = ({ task, onToggle }) => (
        <div className="group flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 transition hover:border-[rgba(139,92,246,0.4)] hover:bg-white/10">
        <button
            onClick={() => onToggle(task.listId, task.id)}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 transition group-hover:border-[rgba(139,92,246,0.35)]"
            aria-label={task.completedAt ? 'Mark task incomplete' : 'Mark task complete'}
        >
            {task.completedAt ? <GradientCheckCircle /> : <RadioButtonUncheckedIcon className="text-xl text-gray-500" />}
        </button>
        <div className="min-w-0 flex-1">
            <p className={`truncate text-sm text-gray-100 ${task.completedAt ? 'line-through text-gray-500' : ''}`}>{task.text}</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">{task.listName}</p>
        </div>
    </div>
);

const CreateTaskModal: React.FC<{
    onClose: () => void;
    onCreate: (name: string) => void;
}> = ({ onClose, onCreate }) => {
    const [name, setName] = useState('');

    const handleCreate = () => {
        if (name.trim()) {
            onCreate(name.trim());
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 p-4">
            <div className="resend-glass-panel w-full max-w-md overflow-hidden rounded-[28px]" data-elevated="true">
                <header className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                    <h2 className="text-lg font-semibold text-gray-100">Create new task</h2>
                    <button onClick={onClose} className="rounded-full p-2 text-gray-500 transition hover:bg-white/5 hover:text-gray-100" aria-label="Close create task modal">
                        <CloseIcon />
                    </button>
                </header>
                <main className="px-6 py-5">
                    <label htmlFor="task-name" className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Task name</label>
                    <input
                        id="task-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Draft project proposal"
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        autoFocus
                    />
                </main>
                <footer className="border-t border-white/10 px-6 py-5">
                    <button onClick={handleCreate} disabled={!name.trim()} className="resend-primary w-full rounded-full px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] disabled:cursor-not-allowed disabled:opacity-50">
                        Create task
                    </button>
                </footer>
            </div>
        </div>
    );
};


interface ProjectDetailsViewProps {
    project: Project;
    conversations: Conversation[];
    checklists: Checklist[];
    notes: Note[];
    userCategories: UserCategory[];
    projectFiles: ProjectFile[];
    onNewChat: () => void;
    onSelectChat: (chatId: string) => void;
    onToggleSidebar: () => void;
    onToggleTask: (checklistId: string, taskId: string) => void;
    onEdit: (project: Project) => void;
    onCreateTaskInProject: (projectId: string, taskText: string) => void;
    onCreateNoteInProject: (projectId: string) => void;
    onSelectNote: (noteId: string) => void;
    onUploadFiles: (files: FileList) => void;
    onDeleteFile: (fileId: string) => void;
    onPreviewFile: (file: ProjectFile) => void;
    t: (key: string) => string;
}

const ProjectDetailsView: React.FC<ProjectDetailsViewProps> = (props) => {
    const {
        project, conversations, checklists, notes, userCategories, projectFiles, onNewChat, 
        onSelectChat, onToggleSidebar, onToggleTask, onEdit,
        onCreateTaskInProject, onCreateNoteInProject, onSelectNote, onUploadFiles, onDeleteFile, onPreviewFile, t
    } = props;
    
    const [isCreatingTask, setIsCreatingTask] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const allTasks = checklists.flatMap(cl => {
        if (cl.tasks.length === 0 && cl.completionHistory.length === 0) {
            return [{ id: cl.id, text: cl.name, completedAt: null, listId: cl.id, listName: 'Single Tasks' }];
        }
        return cl.tasks.filter(t => !t.completedAt).map(t => ({...t, listId: cl.id, listName: cl.name}));
    });
    
    const category = userCategories.find(c => c.id === project.categoryId);
    const iconName = project.icon || category?.icon || 'groups';
    const color = project.color || category?.color || '#64748B';

    const handleUploadClick = () => {
      fileInputRef.current?.click();
    };

    const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            onUploadFiles(e.target.files);
        }
    };
    
    const headerTitle = (
        <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}30` }}>
                <span className="material-symbols-outlined" style={{ color }}>{iconName}</span>
            </span>
            <span className="truncate">{project.name}</span>
        </div>
    );

    return (
        <div className="resend-app-shell flex h-full flex-1 flex-col">
            <Header title={headerTitle as any} onToggleSidebar={onToggleSidebar} onOpenSearch={() => window.dispatchEvent(new Event('taskly.openSearch'))}>
                <button
                    onClick={() => onEdit(project)}
                    className="rounded-full border border-white/10 p-2 text-gray-400 transition hover:border-[rgba(139,92,246,0.4)] hover:bg-white/5 hover:text-gray-100"
                    aria-label="Edit project"
                >
                    <EditIcon />
                </button>
            </Header>
            <main className="scroll-fade flex-1 overflow-y-auto px-4 pb-10 pt-4 sm:px-6">
                {project.description && (
                    <p className="mx-auto mb-8 max-w-4xl text-sm text-gray-400">
                        {project.description}
                    </p>
                )}
                <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {/* Conversations surface highlights threads that give context */}
                    <div className="resend-glass-panel flex h-full flex-col gap-4 rounded-3xl px-5 py-5" data-elevated="true">
                        <div className="flex items-center justify-between">
                            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-gray-400">
                                <ChatBubbleIcon className="text-lg text-gray-300" /> {t('conversations')}
                            </h2>
                            <button onClick={onNewChat} className="rounded-full border border-white/10 p-2 text-gray-400 transition hover:border-[rgba(139,92,246,0.4)] hover:bg-white/5 hover:text-gray-100" aria-label="Start new conversation">
                                <AddIcon />
                            </button>
                        </div>
                        <ul className="space-y-2">
                            {conversations.length > 0 ? (
                                conversations.map(c => (
                                    <li
                                        key={c.id}
                                        onClick={() => onSelectChat(c.id)}
                                        className="cursor-pointer rounded-2xl border border-white/5 px-4 py-3 text-sm text-gray-200 transition hover:border-[rgba(139,92,246,0.35)] hover:bg-white/5"
                                    >
                                        {c.name}
                                    </li>
                                ))
                            ) : (
                                <li className="rounded-2xl border border-white/5 px-4 py-10 text-center text-xs uppercase tracking-[0.3em] text-gray-500">
                                    {t('project_no_conversations')}
                                </li>
                            )}
                        </ul>
                    </div>

                    <div className="resend-glass-panel flex h-full flex-col gap-4 rounded-3xl px-5 py-5">
                        <div className="flex items-center justify-between">
                            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-gray-400">
                                <ListAltIcon className="text-lg text-gray-300" /> {t('pending_tasks')}
                            </h2>
                            <button onClick={() => setIsCreatingTask(true)} className="rounded-full border border-white/10 p-2 text-gray-400 transition hover:border-[rgba(139,92,246,0.4)] hover:bg-white/5 hover:text-gray-100" aria-label="Create new task">
                                <AddIcon />
                            </button>
                        </div>
                        <div className="space-y-2 overflow-y-auto pr-1" style={{ maxHeight: '26rem' }}>
                            {allTasks.length > 0 ? (
                                allTasks.map(task => (
                                    <TaskItem key={task.id} task={task} onToggle={onToggleTask} />
                                ))
                            ) : (
                                <div className="rounded-2xl border border-white/5 px-4 py-10 text-center text-xs uppercase tracking-[0.3em] text-gray-600">
                                    {t('project_no_tasks')}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="resend-glass-panel flex h-full flex-col gap-4 rounded-3xl px-5 py-5">
                        <div className="flex items-center justify-between">
                            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-gray-400">
                                <DescriptionIcon className="text-lg text-gray-300" /> {t('notes')}
                            </h2>
                            <button onClick={() => onCreateNoteInProject(project.id)} className="rounded-full border border-white/10 p-2 text-gray-400 transition hover:border-[rgba(139,92,246,0.4)] hover:bg-white/5 hover:text-gray-100" aria-label="Create project note">
                                <AddIcon />
                            </button>
                        </div>
                        <ul className="space-y-2">
                            {notes.length > 0 ? (
                                notes.map(n => (
                                    <li
                                        key={n.id}
                                        onClick={() => onSelectNote(n.id)}
                                        className="cursor-pointer rounded-2xl border border-white/5 px-4 py-3 text-sm text-gray-200 transition hover:border-[rgba(139,92,246,0.35)] hover:bg-white/5"
                                    >
                                        {n.name}
                                    </li>
                                ))
                            ) : (
                                <li className="rounded-2xl border border-white/5 px-4 py-10 text-center text-xs uppercase tracking-[0.3em] text-gray-600">
                                    {t('project_no_notes_linked')}
                                </li>
                            )}
                        </ul>
                    </div>

                    <div className="resend-glass-panel md:col-span-2 lg:col-span-3 flex flex-col gap-4 rounded-3xl px-5 py-5" data-elevated="true">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-gray-400">
                                <FolderOpenIcon className="text-lg text-gray-300" /> Files
                            </h2>
                            <div className="flex items-center gap-2">
                                <button onClick={handleUploadClick} className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-300 transition hover:border-[rgba(139,92,246,0.4)] hover:bg-white/5 hover:text-gray-100">
                                    Upload files
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleFileSelected} multiple className="hidden" />
                            </div>
                        </div>
                        {projectFiles.length > 0 ? (
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                {projectFiles.map(file => (
                                    <button
                                        key={file.id}
                                        onClick={() => onPreviewFile(file)}
                                        className="group relative flex aspect-square w-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 text-left transition hover:border-[rgba(139,92,246,0.35)]"
                                    >
                                        {file.mimeType.startsWith('image/') ? (
                                            <img src={`data:${file.mimeType};base64,${file.data}`} alt={file.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                        ) : (
                                            <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-center">
                                                <FileIcon mimeType={file.mimeType} className="text-4xl text-gray-300" />
                                                <p className="text-xs text-gray-500">{formatBytes(file.size)}</p>
                                            </div>
                                        )}
                                        <span className="pointer-events-none absolute inset-x-0 bottom-0 line-clamp-1 bg-gradient-to-t from-black/60 to-transparent px-3 py-2 text-xs font-medium text-white">
                                            {file.name}
                                        </span>
                                        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(8,10,30,0.55)] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteFile(file.id);
                                            }}
                                            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white opacity-0 transition hover:bg-red-500/90 group-hover:opacity-100"
                                            aria-label="Delete file"
                                        >
                                            <DeleteIcon className="text-sm" />
                                        </button>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-3xl border border-white/10 px-6 py-16 text-center text-sm text-gray-500">
                                No files in this project yet.
                            </div>
                        )}
                    </div>
                </div>
            </main>
            {isCreatingTask && (
                <CreateTaskModal 
                    onClose={() => setIsCreatingTask(false)}
                    onCreate={(name) => onCreateTaskInProject(project.id, name)}
                />
            )}
        </div>
    );
};
export default ProjectDetailsView;
