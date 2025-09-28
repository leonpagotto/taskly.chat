import React from 'react';
import { UserCategory } from '../types';
import { AddIcon, StyleIcon } from './icons';
import CategoryModal from './CategoryModal';

// A generic Icon component for Material Symbols
const Icon: React.FC<{ name: string; className?: string; style?: React.CSSProperties }> = ({ name, className, style }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>{name}</span>
);

interface CategoriesViewProps {
  categories: UserCategory[];
  onNewCategory: () => void;
  onEditCategory: (category: UserCategory) => void;
  t: (key: string) => string;
}

const CategoryCard: React.FC<{ category: UserCategory; onEdit: () => void; }> = ({ category, onEdit }) => (
  <div onClick={onEdit} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl flex items-center justify-between group transition-all hover:shadow-md hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${category.color}30` }}>
        <Icon name={category.icon} style={{ color: category.color }} className="text-3xl" />
      </div>
      <span className="font-semibold text-lg text-gray-900 dark:text-white">{category.name}</span>
    </div>
  </div>
);

const CategoriesView: React.FC<CategoriesViewProps> = ({ categories, onNewCategory, onEditCategory, t }) => {
  return (
    <div className="text-gray-900 dark:text-white">
      <div className="flex justify-end mb-4">
        <button onClick={onNewCategory} className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--color-primary-600)] text-white rounded-md font-semibold hover:bg-[var(--color-primary-700)] transition-colors text-sm">
            <AddIcon />
            <span>{t('new_category')}</span>
        </button>
      </div>

      {categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map(cat => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onEdit={() => onEditCategory(cat)}
            />
          ))}
        </div>
      ) : (
          <div className="text-center text-gray-500 flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
              <StyleIcon className="text-5xl text-gray-400 dark:text-gray-500 mb-4" />
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{t('no_categories_yet')}</h2>
              <p className="max-w-md mt-1">{t('no_categories_yet_subtitle')}</p>
          </div>
      )}
    </div>
  );
};

export default CategoriesView;