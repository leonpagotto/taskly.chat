import React from 'react';
import { UserCategory } from '../types';
import { AddIcon, StyleIcon } from './icons';
import CategoryModal from './CategoryModal';
import EmptyState from './EmptyState';

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
      <div className="flex items-center justify-end mb-4">
        <button onClick={onNewCategory} className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)] rounded-[var(--radius-button)] font-semibold hover:shadow-lg transition-all text-sm" style={{ color: '#FFFFFF' }}>
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
        <EmptyState
          icon={<StyleIcon />}
          title={t('no_categories_yet')}
          description={t('no_categories_yet_subtitle')}
          primaryAction={{
            label: t('new_category'),
            onClick: onNewCategory,
            icon: <AddIcon className="text-base" />,
          }}
          variant="minimal"
          className="mx-auto my-16 w-full max-w-3xl"
        />
      )}
    </div>
  );
};

export default CategoriesView;