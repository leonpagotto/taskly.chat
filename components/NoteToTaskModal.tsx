import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { CloseIcon, DeleteIcon, AddIcon } from './icons';
import ModalOverlay from './ModalOverlay';

type EditableTask = {
    id: number;
    text: string;
    dueDate?: string | null;
}

interface NoteToTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: { listName: string, tasks: EditableTask[] }) => void;
    initialData: { listName: string, tasks: { text: string, dueDate?: string }[] };
}

const NoteToTaskModal: React.FC<NoteToTaskModalProps> = ({ isOpen, onClose, onCreate, initialData }) => {
    const [listName, setListName] = useState('');
    const [tasks, setTasks] = useState<EditableTask[]>([]);

    useEffect(() => {
        if (initialData) {
            setListName(initialData.listName);
            setTasks(initialData.tasks.map((task, index) => ({
                id: index,
                text: task.text,
                dueDate: task.dueDate || null,
            })));
        }
    }, [initialData]);

    if (!isOpen) return null;

    const handleTaskChange = (id: number, field: 'text' | 'dueDate', value: string) => {
        setTasks(currentTasks => currentTasks.map(task => 
            task.id === id ? { ...task, [field]: value } : task
        ));
    };

    const handleAddTask = () => {
        const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 0;
        setTasks([...tasks, { id: newId, text: '', dueDate: null }]);
    };
    
    const handleDeleteTask = (id: number) => {
        setTasks(currentTasks => currentTasks.filter(task => task.id !== id));
    };

    const handleCreate = () => {
        if (listName.trim() && tasks.every(t => t.text.trim())) {
            onCreate({ listName, tasks });
        }
    };

    return (
        <ModalOverlay className="flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="p-4 flex items-center justify-between border-b border-gray-700 flex-shrink-0">
                    <h2 className="text-lg font-semibold">Convert Note to Tasks</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon /></button>
                </header>
                <main className="p-6 flex-1 overflow-y-auto space-y-4">
                    <div>
                        <label htmlFor="list-name" className="text-sm font-medium text-gray-300">Task List Name</label>
                        <input
                            id="list-name"
                            type="text"
                            value={listName}
                            onChange={e => setListName(e.target.value)}
                            className="w-full mt-1 bg-gray-700/50 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-600)]"
                        />
                    </div>
                    <div className="space-y-2">
                         {tasks.map(task => (
                            <div key={task.id} className="flex items-center gap-2 bg-gray-700/50 p-2 rounded-lg">
                                <input
                                    type="text"
                                    value={task.text}
                                    onChange={e => handleTaskChange(task.id, 'text', e.target.value)}
                                    placeholder="Task description"
                                    className="flex-1 bg-transparent focus:outline-none"
                                />
                                <input
                                    type="date"
                                    value={task.dueDate || ''}
                                    onChange={e => handleTaskChange(task.id, 'dueDate', e.target.value)}
                                    className="bg-gray-600 rounded-md px-2 py-1 text-sm text-gray-200 focus:outline-none"
                                />
                                <button onClick={() => handleDeleteTask(task.id)} className="p-1.5 text-gray-500 hover:text-red-500 rounded-full hover:bg-red-500/10">
                                    <DeleteIcon className="text-base" />
                                </button>
                            </div>
                         ))}
                    </div>
                     <button onClick={handleAddTask} className="w-full flex items-center justify-center gap-2 p-2 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:bg-gray-700/50 hover:border-solid">
                        <AddIcon className="text-base" />
                        <span>Add Task</span>
                    </button>
                </main>
                <footer className="p-4 border-t border-gray-700/50 flex-shrink-0 sticky bottom-0 bg-gray-800/95 backdrop-blur supports-[padding:max(0px)]:pb-[max(theme(spacing.4),env(safe-area-inset-bottom))]">
                    <button 
                        onClick={handleCreate} 
                        disabled={!listName.trim() || tasks.length === 0 || tasks.some(t => !t.text.trim())}
                        className="w-full px-4 py-2 bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)] text-white rounded-full font-semibold hover:shadow-lg disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all"
                    >
                        Create Task List
                    </button>
                </footer>
            </div>
        </ModalOverlay>
    );
};

export default NoteToTaskModal;