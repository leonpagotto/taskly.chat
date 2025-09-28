import React, { useState, useRef } from 'react';
import { Project, Conversation, Checklist, Note, UserCategory, Task, ProjectFile } from '../types';
import { AddIcon, ChatBubbleIcon, DescriptionIcon, ListAltIcon, CheckCircleIcon, RadioButtonUncheckedIcon, CloseIcon, EditIcon, CheckIcon, FolderOpenIcon, FileUploadIcon, ImageIcon, PictureAsPdfIcon, ArticleIcon, DeleteIcon, LeftPanelOpenIcon } from './icons';
import Header from './Header';

const GradientCheckCircle: React.FC<{className?: string}> = ({ className }) => (
    <div className={`w-6 h-6 rounded-full bg-gradient-to-br from-[var(--color-primary-600)] to-purple-600 flex items-center justify-center ${className}`}>
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
    <div className="flex items-center p-3 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300/50 dark:hover:bg-gray-700/50 transition-colors">
        <button onClick={() => onToggle(task.listId, task.id)} className="mr-3 flex-shrink-0 w-8 h-8 flex items-center justify-center">
            {task.completedAt ? <GradientCheckCircle /> : <RadioButtonUncheckedIcon className="text-2xl text-gray-400 dark:text-gray-500" />}
        </button>
        <div className="flex-1 min-w-0">
            <p className={`truncate ${task.completedAt ? 'line-through text-gray-400' : ''}`}>{task.text}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{task.listName}</p>
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
        <div className="fixed inset-0 bg-gray-900/80 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md">
                <header className="p-4 flex items-center justify-between border-b border-gray-700">
                    <h2 className="text-lg font-semibold">Create New Task</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon /></button>
                </header>
                <main className="p-6 space-y-2">
                    <label htmlFor="task-name" className="text-sm font-medium text-gray-300">Task Name</label>
                    <input
                        id="task-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Draft project proposal"
                        className="w-full bg-gray-700/50 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-600)]"
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        autoFocus
                    />
                </main>
                <footer className="p-4">
                    <button onClick={handleCreate} disabled={!name.trim()} className="w-full px-4 py-2 bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white rounded-full font-semibold hover:shadow-lg disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all">
                        Create Task
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
    const today = new Date().toISOString().split('T')[0];
    
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
        <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-800 h-full">
            <Header title={headerTitle as any} onToggleSidebar={onToggleSidebar}>
                <button onClick={() => onEdit(project)} className="p-2 text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                    <EditIcon />
                </button>
            </Header>
            <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-3xl">{project.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Conversations Card */}
                    <div className="lg:col-span-1 bg-white dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-xl font-semibold flex items-center gap-2"><ChatBubbleIcon className="text-gray-500"/> {t('conversations')}</h2>
                            <button onClick={onNewChat} className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"><AddIcon /></button>
                        </div>
                        <ul className="space-y-1">
                          {conversations.length > 0 ? conversations.map(c => 
                            <li key={c.id} onClick={() => onSelectChat(c.id)} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer truncate">
                              {c.name}
                            </li>
                          ) : <p className="text-sm text-gray-500 dark:text-gray-400 px-2 italic">{t('project_no_conversations')}</p>}
                        </ul>
                    </div>
                    {/* Tasks Card */}
                    <div className="lg:col-span-1 bg-white dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-xl font-semibold flex items-center gap-2"><ListAltIcon className="text-gray-500"/> {t('pending_tasks')}</h2>
                             <button onClick={() => setIsCreatingTask(true)} className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"><AddIcon /></button>
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {allTasks.length > 0 ? allTasks.map(task => (
                                <TaskItem key={task.id} task={task} onToggle={onToggleTask} />
                            )) : <p className="text-sm text-gray-500 dark:text-gray-400 px-2 italic">{t('project_no_tasks')}</p>}
                        </div>
                    </div>
                     {/* Notes Card */}
                     <div className="lg:col-span-1 bg-white dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-xl font-semibold flex items-center gap-2"><DescriptionIcon className="text-gray-500"/> {t('notes')}</h2>
                             <button onClick={() => onCreateNoteInProject(project.id)} className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"><AddIcon /></button>
                        </div>
                        <ul className="space-y-1">
                          {notes.length > 0 ? notes.map(n => 
                            <li key={n.id} onClick={() => onSelectNote(n.id)} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer truncate">
                              {n.name}
                            </li>
                          ) : <p className="text-sm text-gray-500 dark:text-gray-400 px-2 italic">{t('project_no_notes_linked')}</p>}
                        </ul>
                    </div>
                     {/* Files Card */}
                    <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-xl font-semibold flex items-center gap-2"><FolderOpenIcon className="text-gray-500"/> Files</h2>
                             <button onClick={handleUploadClick} className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"><FileUploadIcon /></button>
                             <input type="file" ref={fileInputRef} onChange={handleFileSelected} multiple className="hidden" />
                        </div>
                        {projectFiles.length > 0 ? (
                             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {projectFiles.map(file => (
                                    <div key={file.id} onClick={() => onPreviewFile(file)} className="bg-gray-200 dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center aspect-square group relative cursor-pointer overflow-hidden">
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
                        ) : (
                            <div className="text-center text-gray-500 py-8">No files in this project yet.</div>
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
