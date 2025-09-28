import React, { useState } from 'react';
import { UserCategory } from '../types';
import { CloseIcon, WarningIcon } from './icons';
import IconColorPicker from './IconColorPicker';
import ModalOverlay from './ModalOverlay';

const DeleteConfirmationModal: React.FC<{ onConfirm: () => void; onCancel: () => void; }> = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-gray-900/80 z-[80] flex items-center justify-center p-4">
    <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md p-6 text-center">
      <WarningIcon className="text-red-500 text-5xl mx-auto mb-4" />
      <h2 className="text-xl font-semibold mb-2">Are you sure?</h2>
      <p className="text-gray-400 mb-6">
        Deleting this category is permanent. It will be removed from all associated checklists and habits.
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

interface CategoryModalProps {
  onClose: () => void;
  onSave: (data: Omit<UserCategory, 'id'>) => void;
  onUpdate: (id: string, data: Partial<Omit<UserCategory, 'id'>>) => void;
  onDelete?: () => void;
  initialData?: UserCategory;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ onClose, onSave, onUpdate, onDelete, initialData }) => {
  const isEditing = !!initialData;
  const [name, setName] = useState(initialData?.name || '');
  const [icon, setIcon] = useState(initialData?.icon || 'style');
  const [color, setColor] = useState(initialData?.color || '#64748B');
  const [isConfirmingDelete, setConfirmingDelete] = useState(false);

  const handleSave = () => {
    if (!name.trim()) return;
    const data = { name, icon, color };
    if (isEditing) {
        onUpdate(initialData.id, data);
    } else {
        onSave(data);
    }
    onClose();
  };

  return (
     <>
      <ModalOverlay className="flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-lg max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
          <header className="p-4 flex items-center justify-between border-b border-gray-700">
            <h2 className="text-lg font-semibold">{isEditing ? 'Edit Category' : 'Create New Category'}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon /></button>
          </header>
          <main className="p-6 overflow-y-auto space-y-6">
            <div>
              <label htmlFor="category-name" className="font-semibold text-gray-300 mb-2 block">Category Name</label>
              <input
                id="category-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Fitness"
                className="w-full bg-gray-700/50 rounded-lg px-4 py-3 text-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <IconColorPicker 
                selectedIcon={icon}
                selectedColor={color}
                onIconSelect={setIcon}
                onColorSelect={setColor}
            />
          </main>
          <footer className="p-4 border-t border-gray-700 flex items-center justify-between gap-4 sticky bottom-0 bg-gray-800/95 backdrop-blur supports-[padding:max(0px)]:pb-[max(theme(spacing.4),env(safe-area-inset-bottom))]">
            {isEditing && onDelete && (
              <button onClick={() => setConfirmingDelete(true)} className="px-4 py-3 bg-red-600/20 text-red-400 rounded-full text-sm font-semibold hover:bg-red-600/40 hover:text-red-300 transition-colors">
                Delete
              </button>
            )}
            <button onClick={handleSave} disabled={!name.trim()} className="flex-1 px-4 py-3 bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white rounded-full text-sm font-semibold hover:shadow-lg disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all">
              {isEditing ? 'Save Changes' : 'Create Category'}
            </button>
          </footer>
        </div>
      </ModalOverlay>
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

export default CategoryModal;
