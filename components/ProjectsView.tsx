import React, { useState, useEffect, useRef } from 'react';
import { Project, UserCategory } from '../types';
import { CloseIcon, WarningIcon, AddIcon } from './icons';
import IconColorPicker from './IconColorPicker';

const DeleteConfirmationModal: React.FC<{ onConfirm: () => void; onCancel: () => void; }> = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center bg-gray-900/80 p-4">
    <div className="resend-glass-panel w-full max-w-md rounded-3xl px-8 py-10 text-center" data-elevated="true">
      <WarningIcon className="mx-auto mb-5 text-5xl text-red-400" />
      <h2 className="text-2xl font-semibold text-gray-100">Are you sure?</h2>
      <p className="mt-3 text-sm text-gray-400">
        Deleting this project is permanent. Associated chats and notes will be unlinked but stay available elsewhere.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button onClick={onCancel} className="resend-secondary rounded-full px-6 py-2 text-sm font-semibold uppercase tracking-[0.18em]">
          Cancel
        </button>
        <button onClick={onConfirm} className="rounded-full bg-red-600 px-6 py-2 text-sm font-semibold uppercase tracking-[0.18em]">
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
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="resend-glass-panel flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm transition-colors hover:border-[rgba(139,92,246,0.35)]"
        style={{ borderRadius: '18px' }}
      >
        {selectedCategory ? (
          <div className="flex items-center gap-2 text-gray-100">
            <Icon name={selectedCategory.icon} style={{ color: selectedCategory.color }} className="text-lg" />
            <span className="font-medium">{selectedCategory.name}</span>
          </div>
        ) : (
          <span className="text-gray-500">Select a category…</span>
        )}
        <Icon name="unfold_more" className="text-gray-500" />
      </button>
      {isOpen && (
        <div className="absolute z-20 mt-2 w-full space-y-1 rounded-2xl p-2 shadow-xl" style={{ backdropFilter: 'blur(18px)' }}>
          <div className="resend-glass-panel max-h-60 space-y-1 overflow-y-auto rounded-2xl p-2" data-elevated="true">
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  onSelect(cat.id);
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-white/5 focus-visible:outline-none"
              >
                <Icon name={cat.icon} style={{ color: cat.color }} className="text-lg" />
                <span className="text-sm font-medium text-gray-100">{cat.name}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                onNewCategoryRequest((newId) => onSelect(newId));
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-blue-400 transition hover:bg-white/5"
            >
              <AddIcon />
              <span>Create new category…</span>
            </button>
          </div>
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 p-4">
        <div className="resend-glass-panel flex w-full max-w-2xl max-h-[92vh] flex-col overflow-hidden rounded-[32px]" data-elevated="true">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[rgba(18,10,33,0.95)] px-6 py-5 backdrop-blur-xl">
            <h2 className="text-xl font-semibold text-gray-100">{isEditing ? 'Edit Project' : 'Create New Project'}</h2>
            <button onClick={onClose} className="rounded-full p-2 text-gray-500 transition hover:bg-white/5 hover:text-gray-100" aria-label="Close project modal">
              <CloseIcon />
            </button>
          </header>
          <main className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-6">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Project name"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-lg text-gray-100 placeholder:text-gray-500"
                aria-label="Project name"
              />
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe the objective, context, or deliverables."
                rows={3}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-gray-200 placeholder:text-gray-500"
              />

              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">Category</h3>
                <CategoryPicker
                  categories={userCategories}
                  selectedId={categoryId}
                  onSelect={setCategoryId}
                  onNewCategoryRequest={onNewCategoryRequest}
                />
              </div>

              <div className="space-y-4 rounded-2xl border border-white/5 px-5 py-5" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">Icon &amp; color</h3>
                  <span className="text-[11px] text-gray-500">Overrides the selected category</span>
                </div>
                <IconColorPicker
                  selectedIcon={icon}
                  selectedColor={color}
                  onIconSelect={handleIconSelect}
                  onColorSelect={handleColorSelect}
                />
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">AI instructions</h3>
                <textarea
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  placeholder="e.g., You are a creative director guiding the campaign narrative."
                  rows={3}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-gray-200 placeholder:text-gray-500"
                />
                <p className="text-xs text-gray-500">
                  These instructions steer the AI assistant when responding inside this project.
                </p>
              </div>
            </div>
          </main>
          <footer className="sticky bottom-0 z-10 flex flex-col gap-4 border-t border-white/10 bg-[rgba(18,10,33,0.95)] px-6 py-5 backdrop-blur-xl sm:flex-row sm:items-center">
            {isEditing && onDelete && (
              <button
                onClick={() => setConfirmingDelete(true)}
                className="rounded-full border border-red-400/40 px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-red-400 transition hover:border-red-300 hover:bg-red-500/10"
              >
                Delete
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!name.trim() || !categoryId}
              className="resend-primary flex-1 rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isEditing ? 'Save changes' : 'Create project'}
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
