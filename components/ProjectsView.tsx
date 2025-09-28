import React, { useState, useEffect, useRef } from 'react';
import { Project, UserCategory } from '../types';
import { CloseIcon, WarningIcon, AddIcon } from './icons';
import IconColorPicker from './IconColorPicker';

const DeleteConfirmationModal: React.FC<{ onConfirm: () => void; onCancel: () => void; }> = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-gray-900/80 z-[60] flex items-center justify-center p-4">
    <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md p-6 text-center">
      <WarningIcon className="text-red-500 text-5xl mx-auto mb-4" />
      <h2 className="text-xl font-semibold mb-2">Are you sure?</h2>
      <p className="text-gray-400 mb-6">
        Deleting this project is permanent. Associated chats and notes will be unlinked but not deleted.
      </p>
      <div className="flex justify-center gap-4">
        <button onClick={onCancel} className="px-6 py-2 rounded-full bg-gray-600 hover:bg-gray-500 font-semibold transition-colors">
          Cancel
        </button>
        <button onClick={onConfirm} className="px-6 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors">
          Delete
        </button>
      </div>
    </div>
  </div>
);

const CategoryPicker: React.FC<{
  categories: UserCategory[];
  selectedId: string;
  onSelect: (id: string) => void;
  onNewCategoryRequest: (callback: (newCategoryId: string) => void) => void;
}> = ({ categories, selectedId, onSelect, onNewCategoryRequest }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedCategory = categories.find(c => c.id === selectedId);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const Icon: React.FC<{ name: string; className?: string; style?: React.CSSProperties }> = ({ name, className, style }) => (
    <span className={`material-symbols-outlined ${className}`} style={style}>{name}</span>
  );

  return (
    <div ref={pickerRef} className="relative">
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between bg-gray-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
        {selectedCategory ? (
          <div className="flex items-center gap-2">
            <Icon name={selectedCategory.icon} style={{ color: selectedCategory.color }} className="text-lg" />
            <span>{selectedCategory.name}</span>
          </div>
        ) : (
          <span className="text-gray-400">Select a category...</span>
        )}
        <Icon name="unfold_more" className="text-gray-400" />
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => { onSelect(cat.id); setIsOpen(false); }}
              className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-gray-600"
            >
              <Icon name={cat.icon} style={{ color: cat.color }} className="text-lg" />
              <span>{cat.name}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              onNewCategoryRequest((newId) => onSelect(newId));
              setIsOpen(false);
            }}
            className="w-full text-left flex items-center gap-2 px-3 py-2 text-blue-400 hover:bg-gray-600"
          >
            <AddIcon />
            <span>Create new category...</span>
          </button>
        </div>
      )}
    </div>
  );
};


const ProjectModal: React.FC<{
  onClose: () => void;
  onSave: (data: Omit<Project, 'id'>) => void;
  onDelete?: () => void;
  initialData?: Project;
  userCategories: UserCategory[];
  onNewCategoryRequest: (callback: (newCategoryId: string) => void) => void;
}> = ({ onClose, onSave, onDelete, initialData, userCategories, onNewCategoryRequest }) => {
  const isEditing = !!initialData;
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [instructions, setInstructions] = useState(initialData?.instructions || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [icon, setIcon] = useState(initialData?.icon || 'folder');
  const [color, setColor] = useState(initialData?.color || '#64748B');
  const [isConfirmingDelete, setConfirmingDelete] = useState(false);
  const isCustomizedRef = useRef(!!(initialData?.icon || initialData?.color));

  useEffect(() => {
    if (!isCustomizedRef.current && categoryId) {
      const category = userCategories.find(c => c.id === categoryId);
      if (category) {
        setIcon(category.icon);
        setColor(category.color);
      }
    }
  }, [categoryId, userCategories]);

  const handleIconSelect = (newIcon: string) => {
    isCustomizedRef.current = true;
    setIcon(newIcon);
  }
  const handleColorSelect = (newColor: string) => {
    isCustomizedRef.current = true;
    setColor(newColor);
  }

  const handleSave = () => {
    if (!name.trim() || !categoryId) return;
    onSave({ name, description, instructions, categoryId, icon, color });
    onClose();
  };

  return (
     <>
      <div className="fixed inset-0 bg-gray-900/80 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] flex flex-col">
          <header className="p-4 flex items-center justify-between border-b border-gray-700">
            <h2 className="text-lg font-semibold">{isEditing ? 'Edit Project' : 'Create New Project'}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon /></button>
          </header>
          <main className="p-6 overflow-y-auto space-y-6">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Project Name" className="w-full bg-gray-700/50 rounded-lg px-4 py-3 text-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)" rows={2} className="w-full bg-gray-700/50 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            
            <div>
              <h3 className="font-semibold text-gray-300 mb-2">Category</h3>
               <CategoryPicker
                categories={userCategories}
                selectedId={categoryId}
                onSelect={setCategoryId}
                onNewCategoryRequest={onNewCategoryRequest}
              />
            </div>
            
            <div className="pt-6 border-t border-gray-700/50">
                <h3 className="font-semibold text-gray-300 -mt-2 mb-4">Icon & Color <span className="text-xs text-gray-400 font-normal">(Overrides category)</span></h3>
                <IconColorPicker 
                    selectedIcon={icon}
                    selectedColor={color}
                    onIconSelect={handleIconSelect}
                    onColorSelect={handleColorSelect}
                />
            </div>

            <div>
              <h3 className="font-semibold text-gray-300 mb-2">AI Instructions</h3>
              <textarea value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="e.g., You are a creative director for a marketing campaign." rows={3} className="w-full bg-gray-700/50 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            
          </main>
          <footer className="p-4 border-t border-gray-700 flex items-center justify-between gap-4">
            {isEditing && onDelete && (
              <button onClick={() => setConfirmingDelete(true)} className="px-4 py-3 bg-red-600/20 text-red-400 rounded-full text-sm font-semibold hover:bg-red-600/40 hover:text-red-300 transition-colors">
                Delete
              </button>
            )}
            <button onClick={handleSave} disabled={!name.trim() || !categoryId} className="flex-1 px-4 py-3 bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white rounded-full text-sm font-semibold hover:shadow-lg disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all">
              {isEditing ? 'Save Changes' : 'Create Project'}
            </button>
          </footer>
        </div>
      </div>
      {isConfirmingDelete && onDelete && (
        <DeleteConfirmationModal 
          onConfirm={() => {
            onDelete();
            setConfirmingDelete(false);
            onClose();
          }}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}
    </>
  );
};

export default ProjectModal;
