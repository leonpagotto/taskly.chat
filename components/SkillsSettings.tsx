import React, { useState } from 'react';
import { SkillCategory, Skill } from '../types';

type SkillsSettingsProps = {
  skillCategories: SkillCategory[];
  occupation: string;
  onUpdateSkills: (categories: SkillCategory[]) => void;
  onGenerateSkills: () => void;
};

const MAX_CATEGORIES = 6;
const MAX_SKILLS_PER_CATEGORY = 10;

export default function SkillsSettings({
  skillCategories,
  occupation,
  onUpdateSkills,
  onGenerateSkills,
}: SkillsSettingsProps) {
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillDescription, setNewSkillDescription] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [addingSkillToCategoryId, setAddingSkillToCategoryId] = useState<string | null>(null);

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    if (skillCategories.length >= MAX_CATEGORIES) {
      alert(`You can only have up to ${MAX_CATEGORIES} skill categories.`);
      return;
    }

    const newCategory: SkillCategory = {
      id: `cat_${Date.now()}`,
      name: newCategoryName.trim(),
      skills: [],
    };

    onUpdateSkills([...skillCategories, newCategory]);
    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category and all its skills?')) return;
    onUpdateSkills(skillCategories.filter((cat) => cat.id !== categoryId));
  };

  const handleEditCategory = (categoryId: string, newName: string) => {
    if (!newName.trim()) return;
    onUpdateSkills(
      skillCategories.map((cat) =>
        cat.id === categoryId ? { ...cat, name: newName.trim() } : cat
      )
    );
    setEditingCategoryId(null);
  };

  const handleAddSkill = (categoryId: string) => {
    if (!newSkillName.trim()) return;
    
    const category = skillCategories.find((cat) => cat.id === categoryId);
    if (!category) return;
    
    if (category.skills.length >= MAX_SKILLS_PER_CATEGORY) {
      alert(`Each category can have up to ${MAX_SKILLS_PER_CATEGORY} skills.`);
      return;
    }

    const newSkill: Skill = {
      id: `skill_${Date.now()}`,
      name: newSkillName.trim(),
      description: newSkillDescription.trim() || undefined,
      categoryId,
    };

    onUpdateSkills(
      skillCategories.map((cat) =>
        cat.id === categoryId
          ? { ...cat, skills: [...cat.skills, newSkill] }
          : cat
      )
    );

    setNewSkillName('');
    setNewSkillDescription('');
    setAddingSkillToCategoryId(null);
  };

  const handleDeleteSkill = (categoryId: string, skillId: string) => {
    onUpdateSkills(
      skillCategories.map((cat) =>
        cat.id === categoryId
          ? { ...cat, skills: cat.skills.filter((s) => s.id !== skillId) }
          : cat
      )
    );
  };

  const handleEditSkill = (categoryId: string, skillId: string, name: string, description?: string) => {
    if (!name.trim()) return;
    onUpdateSkills(
      skillCategories.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              skills: cat.skills.map((s) =>
                s.id === skillId
                  ? { ...s, name: name.trim(), description: description?.trim() || undefined }
                  : s
              ),
            }
          : cat
      )
    );
    setEditingSkillId(null);
  };

  const handleMoveCategory = (categoryId: string, direction: 'up' | 'down') => {
    const index = skillCategories.findIndex((cat) => cat.id === categoryId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === skillCategories.length - 1) return;

    const newCategories = [...skillCategories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newCategories[index], newCategories[targetIndex]] = [newCategories[targetIndex], newCategories[index]];
    onUpdateSkills(newCategories);
  };

  const handleMoveSkill = (categoryId: string, skillId: string, direction: 'up' | 'down') => {
    const category = skillCategories.find((cat) => cat.id === categoryId);
    if (!category) return;
    
    const index = category.skills.findIndex((s) => s.id === skillId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === category.skills.length - 1) return;

    const newSkills = [...category.skills];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSkills[index], newSkills[targetIndex]] = [newSkills[targetIndex], newSkills[index]];

    onUpdateSkills(
      skillCategories.map((cat) =>
        cat.id === categoryId ? { ...cat, skills: newSkills } : cat
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with AI suggestion */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Skills & Expertise
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your professional skills to tag requests and track expertise.
          </p>
        </div>
        {occupation && (
          <button
            onClick={onGenerateSkills}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-lg">auto_awesome</span>
            Suggest Skills for {occupation}
          </button>
        )}
      </div>

      {/* Info about limits */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">info</span>
          <div className="text-sm text-blue-900 dark:text-blue-100">
            <p className="font-medium">Limits:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Up to {MAX_CATEGORIES} skill categories</li>
              <li>Up to {MAX_SKILLS_PER_CATEGORY} skills per category</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Skill Categories List */}
      <div className="space-y-4">
        {skillCategories.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 dark:bg-gray-700/50 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 bg-clip-text text-transparent">
                psychology
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Skills Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Add skill categories to organize your professional expertise.
            </p>
          </div>
        ) : (
          skillCategories.map((category, catIndex) => (
            <div
              key={category.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  {editingCategoryId === category.id ? (
                    <input
                      type="text"
                      defaultValue={category.name}
                      autoFocus
                      onBlur={(e) => handleEditCategory(category.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleEditCategory(category.id, e.currentTarget.value);
                        if (e.key === 'Escape') setEditingCategoryId(null);
                      }}
                      className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-full"
                    />
                  ) : (
                    <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                      {category.name}
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        ({category.skills.length}/{MAX_SKILLS_PER_CATEGORY})
                      </span>
                    </h4>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {/* Reorder buttons */}
                  <button
                    onClick={() => handleMoveCategory(category.id, 'up')}
                    disabled={catIndex === 0}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-sm">arrow_upward</span>
                  </button>
                  <button
                    onClick={() => handleMoveCategory(category.id, 'down')}
                    disabled={catIndex === skillCategories.length - 1}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-sm">arrow_downward</span>
                  </button>
                  <button
                    onClick={() => setEditingCategoryId(category.id)}
                    className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>

              {/* Skills List */}
              <div className="space-y-2 mb-3">
                {category.skills.map((skill, skillIndex) => (
                  <div
                    key={skill.id}
                    className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded"
                  >
                    {editingSkillId === skill.id ? (
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          defaultValue={skill.name}
                          placeholder="Skill name"
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                          autoFocus
                          onBlur={(e) => {
                            const desc = e.currentTarget.nextElementSibling as HTMLInputElement;
                            handleEditSkill(category.id, skill.id, e.target.value, desc?.value);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const desc = e.currentTarget.nextElementSibling as HTMLInputElement;
                              handleEditSkill(category.id, skill.id, e.currentTarget.value, desc?.value);
                            }
                            if (e.key === 'Escape') setEditingSkillId(null);
                          }}
                        />
                        <input
                          type="text"
                          defaultValue={skill.description || ''}
                          placeholder="Optional description"
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        />
                      </div>
                    ) : (
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {skill.name}
                        </div>
                        {skill.description && (
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                            {skill.description}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveSkill(category.id, skill.id, 'up')}
                        disabled={skillIndex === 0}
                        className="p-0.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-xs">arrow_upward</span>
                      </button>
                      <button
                        onClick={() => handleMoveSkill(category.id, skill.id, 'down')}
                        disabled={skillIndex === category.skills.length - 1}
                        className="p-0.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-xs">arrow_downward</span>
                      </button>
                      <button
                        onClick={() => setEditingSkillId(skill.id)}
                        className="p-0.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                      >
                        <span className="material-symbols-outlined text-xs">edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteSkill(category.id, skill.id)}
                        className="p-0.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                      >
                        <span className="material-symbols-outlined text-xs">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Skill Button */}
              {addingSkillToCategoryId === category.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="Skill name"
                    autoFocus
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddSkill(category.id);
                      if (e.key === 'Escape') {
                        setAddingSkillToCategoryId(null);
                        setNewSkillName('');
                        setNewSkillDescription('');
                      }
                    }}
                  />
                  <input
                    type="text"
                    value={newSkillDescription}
                    onChange={(e) => setNewSkillDescription(e.target.value)}
                    placeholder="Optional description"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddSkill(category.id);
                      if (e.key === 'Escape') {
                        setAddingSkillToCategoryId(null);
                        setNewSkillName('');
                        setNewSkillDescription('');
                      }
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddSkill(category.id)}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setAddingSkillToCategoryId(null);
                        setNewSkillName('');
                        setNewSkillDescription('');
                      }}
                      className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddingSkillToCategoryId(category.id)}
                  disabled={category.skills.length >= MAX_SKILLS_PER_CATEGORY}
                  className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  Add Skill
                </button>
              )}
            </div>
          ))
        )}

        {/* Add Category Section */}
        {isAddingCategory ? (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Category name (e.g., Research, UI Design)"
              autoFocus
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-3"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddCategory();
                if (e.key === 'Escape') {
                  setIsAddingCategory(false);
                  setNewCategoryName('');
                }
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Category
              </button>
              <button
                onClick={() => {
                  setIsAddingCategory(false);
                  setNewCategoryName('');
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingCategory(true)}
            disabled={skillCategories.length >= MAX_CATEGORIES}
            className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            Add Category
            {skillCategories.length > 0 && (
              <span className="text-sm">
                ({skillCategories.length}/{MAX_CATEGORIES})
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
