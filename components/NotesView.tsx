import React, { useEffect, useRef, useState } from 'react';
import { Note, Project, UserCategory, ProjectFile, Checklist, Task, AppView } from '../types';
import { DescriptionIcon, FormatBoldIcon, FormatItalicIcon, FormatUnderlinedIcon, FormatListBulletedIcon, FormatListNumberedIcon, CodeIcon, FormatQuoteIcon, AddIcon, FolderIcon, CloseIcon, ArrowBackIcon, CreateNewFolderIcon, PaperclipIcon, ImageIcon, PictureAsPdfIcon, ArticleIcon, DeleteIcon, TextFieldsIcon, ExpandMoreIcon, PlaylistAddCheckIcon, MoreVertIcon, WidthNormalIcon } from './icons';
import ProjectLinkModal from './ProjectLinkModal';
import NoteToTaskModal from './NoteToTaskModal';
import { generateTasksFromNote } from '../services/geminiService';

const FileIcon: React.FC<{ mimeType: string; className?: string }> = ({ mimeType, className }) => {
  if (mimeType.startsWith('image/')) return <ImageIcon className={className} />;
  if (mimeType === 'application/pdf') return <PictureAsPdfIcon className={className} />;
  return <ArticleIcon className={className} />;
};

interface NotesViewProps {
  note: Note;
  projects: Project[];
  userCategories: UserCategory[];
  onUpdateNote: (noteId: string, updates: Partial<Omit<Note, 'id'>>) => void;
  onToggleSidebar: () => void;
  onCloseNote: () => void;
  t: (key: string) => string;
  projectFiles: ProjectFile[];
  onUploadFiles: (files: FileList, projectId: string, noteId:string) => void;
  onDeleteFile: (fileId: string) => void;
  onPreviewFile: (file: ProjectFile) => void;
  onCreateChecklist: (checklistData: Omit<Checklist, 'id'>) => Checklist;
  onSelectView: (view: AppView) => void;
  onNewCategoryRequest: (callback: (newCategoryId: string) => void) => void;
  isSplitView?: boolean;
}

const NoteEditor: React.FC<{ 
    note: Note; 
    onUpdate: (updates: Partial<Omit<Note, 'id'>>) => void;
    projectFiles: ProjectFile[];
    onUploadFiles: (files: FileList, projectId: string, noteId: string) => void;
    onDeleteFile: (fileId: string) => void;
    onPreviewFile: (file: ProjectFile) => void;
}> = (props) => {
    const { note, onUpdate, projectFiles, onUploadFiles, onDeleteFile, onPreviewFile } = props;
    const editorRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<number | null>(null);
    const isFirstLoadForNote = useRef(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const [formatDropdownOpen, setFormatDropdownOpen] = useState(false);
    const formatDropdownRef = useRef<HTMLDivElement>(null);
    const [moreToolsOpen, setMoreToolsOpen] = useState(false);
    const moreToolsRef = useRef<HTMLDivElement>(null);
    const [currentBlockType, setCurrentBlockType] = useState('Paragraph');

    const formatOptions: { label: string; value: 'h1' | 'h2' | 'h3' | 'p' }[] = [
        { label: 'Heading 1', value: 'h1' },
        { label: 'Heading 2', value: 'h2' },
        { label: 'Heading 3', value: 'h3' },
        { label: 'Paragraph', value: 'p' },
    ];

    useEffect(() => {
        isFirstLoadForNote.current = true;
    }, [note.id]);

    useEffect(() => {
        if (editorRef.current) {
            if (editorRef.current.innerHTML !== note.content) {
                editorRef.current.innerHTML = note.content;
            }
            // If it's a new, unedited note, select the default title for easy replacement
            if (isFirstLoadForNote.current && note.name === 'Untitled Note' && editorRef.current.textContent === 'Untitled Note') {
                const range = document.createRange();
                const sel = window.getSelection();
                range.selectNodeContents(editorRef.current);
                sel?.removeAllRanges();
                sel?.addRange(range);
                isFirstLoadForNote.current = false;
            }
        }
    }, [note.id, note.content, note.name]);
    
     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (formatDropdownRef.current && !formatDropdownRef.current.contains(event.target as Node)) {
                setFormatDropdownOpen(false);
            }
            if (moreToolsRef.current && !moreToolsRef.current.contains(event.target as Node)) {
                setMoreToolsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const updateBlockType = () => {
            if (document.activeElement === editorRef.current) {
                const type = document.queryCommandValue('formatBlock').toLowerCase();
                const matchedOption = formatOptions.find(opt => opt.value === type);
                setCurrentBlockType(matchedOption ? matchedOption.label : 'Paragraph');
            }
        };
        document.addEventListener('selectionchange', updateBlockType);
        return () => document.removeEventListener('selectionchange', updateBlockType);
    }, []);


    const handleContentChange = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        // FIX: Use window.setTimeout to ensure the return type is a number, resolving the TypeScript error.
        timeoutRef.current = window.setTimeout(() => {
            if (editorRef.current) {
                const newContent = editorRef.current.innerHTML;

                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = newContent;

                let newName = 'Untitled Note';
                // Find first element child with text content
                const firstElement = tempDiv.querySelector<HTMLElement>('*:not(:empty)');
                
                if (firstElement && firstElement.textContent?.trim()) {
                    newName = firstElement.textContent.trim();
                } else if (tempDiv.textContent?.trim()) {
                    // Fallback for plain text
                    newName = tempDiv.textContent.trim().split('\n')[0];
                }

                onUpdate({ name: newName, content: newContent });
            }
        }, 500);
    };
    
    const applyFormat = (command: string, value: string | null = null) => {
        editorRef.current?.focus();
        document.execCommand(command, false, value);
        handleContentChange();
    }
    
    const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key !== ' ') return;
        const selection = window.getSelection();
        if (!selection?.rangeCount) return;
        const range = selection.getRangeAt(0);
        if (!range.collapsed) return;
        const node = range.startContainer;
        const parentElement = node.nodeType === Node.TEXT_NODE ? node.parentElement : null;
        
        if (parentElement && editorRef.current?.contains(parentElement)) {
            const blockText = parentElement.textContent;
            const headingMatch = blockText.match(/^(#{1,3})$/);
            if (headingMatch) {
                e.preventDefault();
                const level = headingMatch[1].length;
                parentElement.textContent = '';
                document.execCommand('formatBlock', false, `h${level}`);
                return;
            }
            if (blockText === '*' || blockText === '-') {
                e.preventDefault();
                document.execCommand('insertUnorderedList');
                return;
            }
            if (blockText === '1.') {
                e.preventDefault();
                document.execCommand('insertOrderedList');
                return;
            }
        }
        
        if (node.nodeType === Node.TEXT_NODE) {
            const textContent = node.textContent || '';
            const textBeforeCursor = textContent.substring(0, range.startOffset);
            const boldRegex = /\*\*(.+?)\*\*$/;
            const italicRegex = /\*(.+?)\*$/;
            const boldMatch = textBeforeCursor.match(boldRegex);
            const italicMatch = textBeforeCursor.match(italicRegex);

            if (boldMatch) {
                e.preventDefault();
                const content = boldMatch[1];
                const matchLength = boldMatch[0].length;
                const replacementRange = document.createRange();
                replacementRange.setStart(node, range.startOffset - matchLength);
                replacementRange.setEnd(node, range.startOffset);
                selection.removeAllRanges();
                selection.addRange(replacementRange);
                document.execCommand('insertHTML', false, `<strong>${content}</strong>&nbsp;`);
                return;
            }
            
            if (italicMatch && !textBeforeCursor.endsWith('**')) {
                e.preventDefault();
                const content = italicMatch[1];
                const matchLength = italicMatch[0].length;
                const replacementRange = document.createRange();
                replacementRange.setStart(node, range.startOffset - matchLength);
                replacementRange.setEnd(node, range.startOffset);
                selection.removeAllRanges();
                selection.addRange(replacementRange);
                document.execCommand('insertHTML', false, `<em>${content}</em>&nbsp;`);
                return;
            }
        }
    };
    
    const handleUploadClick = () => {
        if (!note.projectId) {
            alert("Please link this note to a project before attaching files.");
            return;
        }
        fileInputRef.current?.click();
    };

    const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && note.projectId) {
            onUploadFiles(e.target.files, note.projectId, note.id);
        }
    };
    
    const handleInsertImageClick = () => {
        imageInputRef.current?.click();
    };

    const handleImageFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64Data = event.target?.result as string;
                editorRef.current?.focus();
                applyFormat('insertHTML', `<img src="${base64Data}" alt="${file.name}" />`);
            };
            reader.readAsDataURL(file);
        }
    };

    const EditorButton: React.FC<{ icon: React.ReactNode, command: string, value?: string | null, onClick?: () => void }> = ({ icon, command, value, onClick }) => (
        <button 
            onMouseDown={e => e.preventDefault()} 
            onClick={onClick ? onClick : () => applyFormat(command, value)} 
            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
            {icon}
        </button>
    );
    
    const MoreMenuItem: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void }> = ({ icon, label, onClick }) => (
        <button
            onMouseDown={e => e.preventDefault()}
            onClick={() => { onClick(); setMoreToolsOpen(false); }}
            className="w-full text-left flex items-center gap-3 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
            {icon}
            <span className="text-sm">{label}</span>
        </button>
    );

    const attachedFiles = note.fileIds?.map(id => projectFiles.find(f => f.id === id)).filter(Boolean) as ProjectFile[] || [];

    return (
    <>
        <div className="flex-1 flex flex-col dark:bg-gray-800 min-h-0">
             <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-1 flex-shrink-0 bg-gray-100/50 dark:bg-gray-900/30">
                <div className="flex items-center gap-1 flex-nowrap sm:flex-wrap overflow-x-auto scrollbar-hide">
                    <div ref={formatDropdownRef} className="relative">
                        <button onClick={() => setFormatDropdownOpen(p => !p)} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm flex-shrink-0">
                            <TextFieldsIcon />
                            <span className="hidden md:inline">{currentBlockType}</span>
                            <ExpandMoreIcon className="text-base" />
                        </button>
                        {formatDropdownOpen && (
                            <div className="absolute top-full left-0 mt-1 bg-gray-100 dark:bg-gray-900 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10 w-40">
                                {formatOptions.map(opt => (
                                    <button
                                        key={opt.value}
                                        onMouseDown={e => e.preventDefault()}
                                        onClick={() => { applyFormat('formatBlock', opt.value); setFormatDropdownOpen(false); }}
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-700/50"
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="h-5 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
                    <EditorButton icon={<FormatBoldIcon />} command="bold" />
                    <EditorButton icon={<FormatItalicIcon />} command="italic" />
                    <EditorButton icon={<FormatUnderlinedIcon />} command="underline" />
                    <div className="h-5 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
                    <EditorButton icon={<FormatListBulletedIcon />} command="insertUnorderedList" />
                    <EditorButton icon={<FormatListNumberedIcon />} command="insertOrderedList" />
                    
                    <div className="hidden sm:flex items-center gap-1">
                        <div className="h-5 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
                        <EditorButton icon={<ImageIcon />} command="insertImage" onClick={handleInsertImageClick} />
                        <EditorButton icon={<FormatQuoteIcon />} command="formatBlock" value="blockquote" />
                        <EditorButton icon={<CodeIcon />} command="formatBlock" value="pre" />
                    </div>
                </div>
                
                <div ref={moreToolsRef} className="relative">
                    <button onClick={() => setMoreToolsOpen(p => !p)} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        <MoreVertIcon />
                    </button>
                     {moreToolsOpen && (
                        <div className="absolute top-full right-0 mt-1 w-56 bg-gray-100 dark:bg-gray-900 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10 p-1">
                            <div className="sm:hidden">
                                <MoreMenuItem icon={<ImageIcon />} label="Insert Image" onClick={handleInsertImageClick} />
                                <MoreMenuItem icon={<FormatQuoteIcon />} label="Blockquote" onClick={() => applyFormat('formatBlock', 'blockquote')} />
                                <MoreMenuItem icon={<CodeIcon />} label="Code Block" onClick={() => applyFormat('formatBlock', 'pre')} />
                            </div>
                            <MoreMenuItem icon={<PaperclipIcon />} label="Attach File" onClick={handleUploadClick} />
                        </div>
                    )}
                </div>
            </div>
            
            <div 
                ref={editorRef}
                contentEditable
                onInput={handleContentChange}
                onKeyDown={handleEditorKeyDown}
                className="prose prose-sm sm:prose-base dark:prose-invert max-w-none flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto focus:outline-none note-editor-content"
                suppressContentEditableWarning={true}
            />
             {attachedFiles.length > 0 && (
                <div className="flex-shrink-0 p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-100/50 dark:bg-gray-900/30">
                    <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
                        {attachedFiles.map(file => (
                            <div key={file.id} onClick={() => onPreviewFile(file)} className="flex-shrink-0 w-32 h-20 bg-gray-200 dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center group relative cursor-pointer overflow-hidden">
                                {file.mimeType.startsWith('image/') ? (
                                    <img src={`data:${file.mimeType};base64,${file.data}`} alt={file.name} className="w-full h-full object-cover" />
                                ) : (
                                    <FileIcon mimeType={file.mimeType} className="text-3xl text-gray-500 dark:text-gray-400" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent p-1 flex items-end">
                                    <p className="text-white text-xs truncate">{file.name}</p>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); onDeleteFile(file.id); }} className="absolute top-1 right-1 p-1 bg-black/40 rounded-full text-white hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <DeleteIcon className="text-sm"/>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileSelected} multiple className="hidden" accept="image/png, image/jpeg, image/gif, application/pdf, text/plain, .md, .docx" />
        <input type="file" ref={imageInputRef} onChange={handleImageFileSelected} className="hidden" accept="image/*" />
    </>
    );
};

const NotesView: React.FC<NotesViewProps> = (props) => {
    const { note, projects, userCategories, onUpdateNote, onToggleSidebar, onCloseNote, t, projectFiles, onUploadFiles, onDeleteFile, onPreviewFile, onCreateChecklist, onSelectView, onNewCategoryRequest, isSplitView = false } = props;
    const project = note.projectId ? projects.find(p => p.id === note.projectId) : undefined;
    const category = note.categoryId ? userCategories.find(c => c.id === note.categoryId) : undefined;
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [taskGenerationData, setTaskGenerationData] = useState<{ listName: string, tasks: { text: string, dueDate?: string }[] } | null>(null);
    const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);

    const handleLinkToProject = (projectId?: string) => {
        const linkedProject = projects.find(p => p.id === projectId);
        onUpdateNote(note.id, { projectId, categoryId: linkedProject?.categoryId });
    };
    
    const handleLinkToCategory = (categoryId?: string) => {
        onUpdateNote(note.id, { categoryId });
    };

    const handleGenerateTasks = async () => {
        setIsGeneratingTasks(true);
        try {
            const result = await generateTasksFromNote(note.name, note.content);
            setTaskGenerationData(result);
            setIsTaskModalOpen(true);
        } catch (error) {
            console.error("Failed to generate tasks:", error);
            alert("Sorry, there was an error generating tasks from this note.");
        } finally {
            setIsGeneratingTasks(false);
        }
    };
    
    const handleCreateTasksFromNote = (data: { listName: string, tasks: { text: string, dueDate?: string }[] }) => {
        const newTasks: Task[] = data.tasks.map(t => ({ id: `task-${Date.now()}-${Math.random()}`, text: t.text, completedAt: null }));
        
        const newChecklist: Omit<Checklist, 'id'> = {
            name: data.listName,
            tasks: newTasks,
            completionHistory: [],
            projectId: note.projectId,
            categoryId: note.categoryId,
            sourceNoteId: note.id
        };

        const createdChecklist = onCreateChecklist(newChecklist);
        onUpdateNote(note.id, { generatedChecklistId: createdChecklist.id });
        onSelectView('lists');
        setIsTaskModalOpen(false);
    };

    return (
    <>
        {isTaskModalOpen && taskGenerationData && (
            <NoteToTaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                initialData={taskGenerationData}
                onCreate={handleCreateTasksFromNote}
            />
        )}
        <ProjectLinkModal
            title="Link Note to Project"
            isOpen={isProjectModalOpen}
            onClose={() => setIsProjectModalOpen(false)}
            projects={projects}
            userCategories={userCategories}
            currentProjectId={note.projectId}
            onLink={handleLinkToProject}
            itemType="Note"
        />
        <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-800 h-full">
            <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white bg-gray-100 dark:bg-gray-800 flex-shrink-0 gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button onClick={onToggleSidebar} className="md:hidden text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        <WidthNormalIcon className="w-6 h-6" />
                    </button>
                    {!isSplitView &&
                        <button onClick={onCloseNote} className="text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                            <ArrowBackIcon className="w-6 h-6" />
                        </button>
                    }
                    {category ? (
                        <span className="material-symbols-outlined text-xl" style={{ color: category.color }}>{category.icon}</span>
                    ) : (project ? <FolderIcon className="text-xl text-gray-500" /> : <DescriptionIcon className="text-xl text-gray-500" />)
                    }
                    <div className="truncate flex-1">
                        {project && <span className="text-sm text-gray-500 dark:text-gray-400">{project.name} / </span>}
                        <span className="truncate font-semibold text-lg">{note.name}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button 
                        onClick={handleGenerateTasks} 
                        disabled={isGeneratingTasks}
                        className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg transition-colors bg-gray-200/80 dark:bg-gray-700/50 hover:bg-gray-300/80 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                        <PlaylistAddCheckIcon className="text-base" />
                        <span className="hidden sm:inline">{isGeneratingTasks ? 'Generating...' : 'Generate Tasks'}</span>
                    </button>
                    <button onClick={() => setIsProjectModalOpen(true)} className="p-2 rounded-lg transition-colors bg-gray-200/80 dark:bg-gray-700/50 hover:bg-gray-300/80 dark:hover:bg-gray-700">
                        <CreateNewFolderIcon className="text-base" />
                    </button>
                </div>
            </header>
             <NoteEditor 
                note={note} 
                onUpdate={(updates) => onUpdateNote(note.id, updates)} 
                projectFiles={projectFiles}
                onUploadFiles={onUploadFiles}
                onDeleteFile={onDeleteFile}
                onPreviewFile={onPreviewFile}
             />
        </div>
    </>
    );
};

export default NotesView;