import React, { useEffect, useMemo, useState } from 'react';
import Header from './Header';
import { ArrowBackIcon, AddIcon, DeleteIcon, CheckCircleIcon, RadioButtonUncheckedIcon, ChevronRightIcon } from './icons';
import { Story, Project, UserCategory, Checklist, StoryStatus, AcceptanceCriterion, SkillCategory } from '../types';
import { authService } from '../services/authService';
import { generateUUID } from '../utils/uuid';

type Props = {
  story: Story;
  projects: Project[];
  userCategories: UserCategory[];
  skillCategories: SkillCategory[];
  checklists: Checklist[];
  onBack: () => void;
  onUpdate: (updates: Partial<Story>) => void;
  onDelete: () => void;
  onLinkTask: (checklistId: string) => void;
  onUnlinkTask: (checklistId: string) => void;
  onCreateLinkedTask?: (name: string) => void;
};

const statusOptions: { value: StoryStatus; label: string }[] = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
];

const StoryEditorPage: React.FC<Props> = ({ story, projects, userCategories, skillCategories, checklists, onBack, onUpdate, onDelete, onLinkTask, onUnlinkTask, onCreateLinkedTask }) => {
  const [local, setLocal] = useState<Story>(story);
  const [newCriterion, setNewCriterion] = useState('');
  const [newLinkedTaskName, setNewLinkedTaskName] = useState('');
  const [selectedChecklistId, setSelectedChecklistId] = useState<string>('');
  const [assigneeFocus, setAssigneeFocus] = useState(false);
  const [requesterFocus, setRequesterFocus] = useState(false);

  const linkedSet = useMemo(() => new Set(local.linkedTaskIds || []), [local.linkedTaskIds]);
  const availableChecklists = useMemo(() => checklists.filter(c => !linkedSet.has(c.id)), [checklists, linkedSet]);

  useEffect(() => { setLocal(story); }, [story.id, story.updatedAt]);

  const handleField = <K extends keyof Story>(key: K, value: Story[K]) => {
    setLocal(prev => ({ ...prev, [key]: value, updatedAt: new Date().toISOString() }));
  };

  useEffect(() => {
    if (local.projectId) {
      const proj = projects.find(p => p.id === local.projectId);
      if (proj?.categoryId && local.categoryId !== proj.categoryId) {
        setLocal(prev => ({ ...prev, categoryId: proj.categoryId! }));
      }
    }
  }, [local.projectId, projects]);

  const save = () => onUpdate(local);

  const toggleCriterion = (id: string) => {
    const updated = (local.acceptanceCriteria || []).map(c => c.id === id ? { ...c, done: !c.done } : c);
    handleField('acceptanceCriteria', updated as AcceptanceCriterion[] as any);
  };
  const removeCriterion = (id: string) => {
    const updated = (local.acceptanceCriteria || []).filter(c => c.id !== id);
    handleField('acceptanceCriteria', updated as AcceptanceCriterion[] as any);
  };
  const addCriterion = () => {
    const text = newCriterion.trim();
    if (!text) return;
    const crit: AcceptanceCriterion = { id: generateUUID(), text, done: false } as AcceptanceCriterion;
    handleField('acceptanceCriteria', [ ...(local.acceptanceCriteria || []), crit ] as any);
    setNewCriterion('');
  };

  const projectName = (id?: string | null) => projects.find(p => p.id === id)?.name || 'No Project';
  const categoryName = (id?: string | null) => userCategories.find(c => c.id === id)?.name || 'No Category';

  const deriveDisplayName = (email?: string | null) => email ? email.split('@')[0] : 'Me';
  const assignAssigneeToMe = async () => {
    const session = await authService.getSession();
    if (!session) return;
    handleField('assigneeUserId', session.userId);
    handleField('assigneeName', deriveDisplayName(session.email));
  };
  const setRequesterToMe = async () => {
    const session = await authService.getSession();
    if (!session) return;
    handleField('requesterUserId', session.userId);
    handleField('requesterName', deriveDisplayName(session.email));
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <Header
        title={<div className="flex items-center gap-2"><button onClick={onBack} className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"><ArrowBackIcon className="text-base" /></button><span className="truncate">Edit Story</span></div>}
        onToggleSidebar={() => {}}
      >
        <button onClick={save} className="px-4 py-2 bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)] text-white rounded-full font-semibold hover:shadow-lg transition-all text-sm">Save</button>
      </Header>

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 pb-28">
        <div className="mx-auto w-full max-w-5xl py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-gray-700 rounded-xl p-4">
              <input type="text" value={local.title} onChange={e => handleField('title', e.target.value)} placeholder="Story title" className="w-full bg-transparent border-none p-0 text-xl font-semibold text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-0" />
              <textarea value={local.description || ''} onChange={e => handleField('description', e.target.value)} placeholder="Description" rows={6} className="mt-3 w-full bg-gray-100 dark:bg-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none" />
            </div>

            <div className="bg-white dark:bg-gray-700 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Status</label>
                <div className="relative">
                  <select value={local.status} onChange={e => handleField('status', e.target.value as StoryStatus)} className="w-full appearance-none bg-gray-100 dark:bg-gray-600 rounded-lg px-3 pr-8 py-2 text-sm focus:outline-none">
                    {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <ChevronRightIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Story Points</label>
                <input type="number" min={0} value={local.estimatePoints || 0} onChange={e => handleField('estimatePoints', Number(e.target.value))} className="w-full bg-gray-100 dark:bg-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Time Estimate</label>
                <input type="text" value={local.estimateTime || ''} onChange={e => handleField('estimateTime', e.target.value)} placeholder="e.g., 3h, 1d" className="w-full bg-gray-100 dark:bg-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-700 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Acceptance Criteria</h3>
              <div className="space-y-2">
                {(local.acceptanceCriteria || []).map(c => (
                  <div key={c.id} className="flex items-center gap-2 group">
                    <button onClick={() => toggleCriterion(c.id)}>{c.done ? <CheckCircleIcon className="text-blue-500 text-xl" /> : <RadioButtonUncheckedIcon className="text-gray-500 text-xl" />}</button>
                    <input type="text" value={c.text} onChange={e => handleField('acceptanceCriteria', (local.acceptanceCriteria || []).map(ac => ac.id === c.id ? { ...ac, text: e.target.value } : ac) as any)} className={`flex-1 bg-gray-100 dark:bg-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none ${c.done ? 'line-through text-gray-500' : ''}`} />
                    <button onClick={() => removeCriterion(c.id)} className="p-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Remove"><DeleteIcon /></button>
                  </div>
                ))}
                <div className="flex items-center gap-2 pt-1">
                  <input type="text" value={newCriterion} onChange={e => setNewCriterion(e.target.value)} placeholder="Add criterion" className="flex-1 bg-gray-100 dark:bg-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCriterion(); } }} />
                  <button onClick={addCriterion} className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center" title="Add" aria-label="Add criterion"><AddIcon className="text-base" /></button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-700 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Context</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Project</label>
                  <div className="relative">
                    <select value={local.projectId || ''} onChange={e => handleField('projectId', e.target.value || undefined)} className="w-full appearance-none bg-gray-100 dark:bg-gray-600 rounded-lg px-3 pr-8 py-2 text-sm focus:outline-none">
                      <option value="">No Project</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <ChevronRightIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {skillCategories.length > 0 && (
              <div className="bg-white dark:bg-gray-700 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Required Skills</h3>
                <div className="space-y-3">
                  {skillCategories.map(cat => {
                    const catSkills = cat.skills || [];
                    if (catSkills.length === 0) return null;
                    return (
                      <div key={cat.id}>
                        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">{cat.name}</div>
                        <div className="flex flex-wrap gap-2">
                          {catSkills.map(skill => {
                            const isSelected = (local.skillIds || []).includes(skill.id);
                            return (
                              <button
                                key={skill.id}
                                type="button"
                                onClick={() => {
                                  const currentSkills = local.skillIds || [];
                                  const updated = isSelected
                                    ? currentSkills.filter(id => id !== skill.id)
                                    : [...currentSkills, skill.id];
                                  handleField('skillIds', updated);
                                }}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                  isSelected
                                    ? 'bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)] text-white'
                                    : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500'
                                }`}
                                title={skill.description || skill.name}
                              >
                                {skill.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  {(local.skillIds || []).length > 0 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-600">
                      {(local.skillIds || []).length} skill{(local.skillIds || []).length !== 1 ? 's' : ''} selected
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-gray-700 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Linked Tasks</h3>
              <div className="space-y-2">
                {(local.linkedTaskIds || []).length === 0 && (<div className="text-sm text-gray-500 dark:text-gray-300">No tasks linked.</div>)}
                {(local.linkedTaskIds || []).map(id => {
                  const cl = checklists.find(c => c.id === id);
                  if (!cl) return null;
                  return (
                    <div key={id} className="flex items-center justify-between gap-2 bg-gray-100 dark:bg-gray-600 rounded-lg px-3 py-2">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{cl.name}</div>
                        <div className="text-xs text-gray-500 truncate">{projectName(cl.projectId)} • {categoryName(cl.categoryId)}</div>
                      </div>
                      <button onClick={() => { onUnlinkTask(id); setLocal(prev => ({ ...prev, linkedTaskIds: (prev.linkedTaskIds || []).filter(x => x !== id) })); }} className="p-2 rounded-full text-xs bg-red-600/20 text-red-400 hover:bg-red-600/30" title="Unlink"><DeleteIcon /></button>
                    </div>
                  );
                })}
              </div>
              {availableChecklists.length > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="relative flex-1">
                    <select value={selectedChecklistId} onChange={(e) => setSelectedChecklistId(e.target.value)} className="w-full appearance-none bg-gray-100 dark:bg-gray-600 rounded-lg px-3 pr-8 py-2 text-sm focus:outline-none">
                      {availableChecklists.map(cl => (<option key={cl.id} value={cl.id}>{cl.name}</option>))}
                    </select>
                    <ChevronRightIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                  <button onClick={() => { if (selectedChecklistId) { onLinkTask(selectedChecklistId); setLocal(prev => ({ ...prev, linkedTaskIds: Array.from(new Set([...(prev.linkedTaskIds || []), selectedChecklistId])) })); } }} className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center" title="Link"><AddIcon className="text-base" /></button>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-gray-600/40">
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">Create and link a new task</div>
                <div className="flex items-center gap-2">
                  <input type="text" value={newLinkedTaskName} onChange={(e) => setNewLinkedTaskName(e.target.value)} placeholder="Task name" className="flex-1 bg-gray-100 dark:bg-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none" onKeyDown={(e) => { if (e.key === 'Enter' && newLinkedTaskName.trim()) { onCreateLinkedTask?.(newLinkedTaskName.trim()); setNewLinkedTaskName(''); } }} />
                  <button disabled={!newLinkedTaskName.trim()} onClick={() => { if (newLinkedTaskName.trim()) { onCreateLinkedTask?.(newLinkedTaskName.trim()); setNewLinkedTaskName(''); } }} className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center disabled:opacity-50" title="Create & Link"><AddIcon className="text-base" /></button>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-700 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">People</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Assignee</label>
                  <div className="relative">
                    <input type="text" value={local.assigneeName || ''} onChange={e => handleField('assigneeName', e.target.value)} onFocus={() => setAssigneeFocus(true)} onBlur={() => setTimeout(() => setAssigneeFocus(false), 150)} placeholder="Type a name or pick from users later" className="w-full bg-gray-100 dark:bg-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                    {assigneeFocus && (
                      <div className="absolute left-0 right-0 mt-1 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow p-2 text-xs">
                        <div className="flex items-center justify-between">
                          <button onMouseDown={(e) => { e.preventDefault(); assignAssigneeToMe(); }} className="px-2 py-1 rounded-md bg-gray-200 dark:bg-gray-700">Assign to me</button>
                          <button onMouseDown={(e) => { e.preventDefault(); }} className="px-2 py-1 rounded-md bg-gray-200 dark:bg-gray-700">Search users…</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Requester</label>
                  <div className="relative">
                    <input type="text" value={local.requesterName || ''} onChange={e => handleField('requesterName', e.target.value)} onFocus={() => setRequesterFocus(true)} onBlur={() => setTimeout(() => setRequesterFocus(false), 150)} placeholder="Who requested this?" className="w-full bg-gray-100 dark:bg-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                    {requesterFocus && (
                      <div className="absolute left-0 right-0 mt-1 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow p-2 text-xs">
                        <div className="flex items-center justify-between">
                          <button onMouseDown={(e) => { e.preventDefault(); setRequesterToMe(); }} className="px-2 py-1 rounded-md bg-gray-200 dark:bg-gray-700">I'm the requester</button>
                          <button onMouseDown={(e) => { e.preventDefault(); }} className="px-2 py-1 rounded-md bg-gray-200 dark:bg-gray-700">Search users…</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-700 rounded-xl p-4">
              <button onClick={onDelete} className="w-full px-4 py-2 bg-red-600/20 text-red-400 rounded-full text-sm font-semibold hover:bg-red-600/30">Delete Story</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StoryEditorPage;

