import React, { useEffect, useMemo, useState } from 'react';
import Header from './Header';
import { ArrowBackIcon, AddIcon, DeleteIcon, CheckCircleIcon, RadioButtonUncheckedIcon } from './icons';
import { Story, Project, UserCategory, Checklist, StoryStatus, AcceptanceCriterion } from '../types';

type Props = {
	story: Story;
	projects: Project[];
	userCategories: UserCategory[];
	checklists: Checklist[];
	onBack: () => void;
	onUpdate: (updates: Partial<Story>) => void;
	onDelete: () => void;
	onLinkTask: (checklistId: string) => void;
	onUnlinkTask: (checklistId: string) => void;
};

const statusOptions: { value: StoryStatus; label: string }[] = [
	{ value: 'backlog', label: 'Backlog' },
	{ value: 'in_progress', label: 'In Progress' },
	{ value: 'review', label: 'Review' },
	{ value: 'done', label: 'Done' },
];

const StoryEditorPage: React.FC<Props> = ({ story, projects, userCategories, checklists, onBack, onUpdate, onDelete, onLinkTask, onUnlinkTask }) => {
	const [local, setLocal] = useState<Story>(story);
	const [newCriterion, setNewCriterion] = useState('');
	const linkedSet = useMemo(() => new Set(local.linkedTaskIds || []), [local.linkedTaskIds]);

	useEffect(() => {
		setLocal(story);
	}, [story.id]);

	const handleField = <K extends keyof Story>(key: K, value: Story[K]) => {
		setLocal(prev => ({ ...prev, [key]: value, updatedAt: new Date().toISOString() }));
	};

	// Auto-lock category when project changes
	useEffect(() => {
		if (local.projectId) {
			const proj = projects.find(p => p.id === local.projectId);
			if (proj?.categoryId && local.categoryId !== proj.categoryId) {
				setLocal(prev => ({ ...prev, categoryId: proj.categoryId! }));
			}
		}
	}, [local.projectId, projects]);

	const save = () => {
		onUpdate({
			title: local.title,
			description: local.description,
			status: local.status,
			projectId: local.projectId,
			categoryId: local.categoryId,
			acceptanceCriteria: local.acceptanceCriteria,
			estimatePoints: local.estimatePoints,
			estimateTime: local.estimateTime,
			linkedTaskIds: local.linkedTaskIds,
		});
	};

	const addCriterion = () => {
		const text = newCriterion.trim();
		if (!text) return;
		const newItem: AcceptanceCriterion = { id: `ac-${Date.now()}`, text, done: false };
		handleField('acceptanceCriteria', [...(local.acceptanceCriteria || []), newItem]);
		setNewCriterion('');
	};

	const toggleCriterion = (id: string) => {
		const updated = (local.acceptanceCriteria || []).map(c => c.id === id ? { ...c, done: !c.done } : c);
		handleField('acceptanceCriteria', updated);
	};

	const removeCriterion = (id: string) => {
		const updated = (local.acceptanceCriteria || []).filter(c => c.id !== id);
		handleField('acceptanceCriteria', updated);
	};

	const availableChecklists = useMemo(() => checklists.filter(cl => !linkedSet.has(cl.id)), [checklists, linkedSet]);

	const projectName = (pid?: string) => projects.find(p => p.id === pid)?.name || 'No Project';
	const categoryName = (cid?: string) => userCategories.find(c => c.id === cid)?.name || 'No Category';

	return (
		<div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-800 h-full">
			<Header
				title={
					<div className="flex items-center gap-2">
						<button onClick={onBack} className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"><ArrowBackIcon className="text-base" /></button>
						<span className="truncate">Edit Story</span>
					</div>
				}
				onToggleSidebar={() => {}}
			>
				<button onClick={save} className="px-4 py-2 bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white rounded-full font-semibold hover:shadow-lg transition-all text-sm">Save</button>
			</Header>

			<div className="px-4 sm:px-6">
				<div className="mx-auto w-full max-w-5xl py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
					{/* Left/Main */}
					<div className="lg:col-span-2 space-y-4">
						<div className="bg-white dark:bg-gray-700 rounded-xl p-4">
							<input
								type="text"
								value={local.title}
								onChange={e => handleField('title', e.target.value)}
								placeholder="Story title"
								className="w-full bg-transparent border-none p-0 text-xl font-semibold text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-0"
							/>
							<textarea
								value={local.description || ''}
								onChange={e => handleField('description', e.target.value)}
								placeholder="Description"
								rows={6}
								className="mt-3 w-full bg-gray-100 dark:bg-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
							/>
						</div>

						<div className="bg-white dark:bg-gray-700 rounded-xl p-4">
							<h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Acceptance Criteria</h3>
							<div className="space-y-2">
								{(local.acceptanceCriteria || []).map(c => (
									<div key={c.id} className="flex items-center gap-2 group">
										<button onClick={() => toggleCriterion(c.id)}>
											{c.done ? <CheckCircleIcon className="text-blue-500 text-xl" /> : <RadioButtonUncheckedIcon className="text-gray-500 text-xl" />}
										</button>
										<input
											type="text"
											value={c.text}
											onChange={e => handleField('acceptanceCriteria', (local.acceptanceCriteria || []).map(ac => ac.id === c.id ? { ...ac, text: e.target.value } : ac))}
											className={`flex-1 bg-gray-100 dark:bg-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none ${c.done ? 'line-through text-gray-500' : ''}`}
										/>
										<button onClick={() => removeCriterion(c.id)} className="p-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><DeleteIcon /></button>
									</div>
								))}
								<div className="flex items-center gap-2 pt-1">
									<input
										type="text"
										value={newCriterion}
										onChange={e => setNewCriterion(e.target.value)}
										placeholder="Add criterion"
										className="flex-1 bg-gray-100 dark:bg-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none"
										onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCriterion(); } }}
									/>
									<button onClick={addCriterion} className="px-3 py-2 rounded-full bg-gray-200 dark:bg-gray-600 text-sm font-semibold flex items-center gap-1"><AddIcon className="text-base" /> Add</button>
								</div>
							</div>
						</div>

						<div className="bg-white dark:bg-gray-700 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
							<div>
								<label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Status</label>
								<select
									value={local.status}
									onChange={e => handleField('status', e.target.value as StoryStatus)}
									className="w-full bg-gray-100 dark:bg-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none"
								>
									{statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
								</select>
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
					</div>

					{/* Right/Sidebar */}
					<div className="space-y-4">
						<div className="bg-white dark:bg-gray-700 rounded-xl p-4">
							<h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Context</h3>
							<div className="space-y-3">
								<div>
									<label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Project</label>
									<select
										value={local.projectId || ''}
										onChange={e => handleField('projectId', e.target.value || undefined)}
										className="w-full bg-gray-100 dark:bg-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none"
									>
										<option value="">No Project</option>
										{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
									</select>
								</div>
								<div className={local.projectId ? 'opacity-60 pointer-events-none' : ''}>
									<label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Category</label>
									<select
										value={local.categoryId || ''}
										onChange={e => handleField('categoryId', e.target.value || undefined)}
										className="w-full bg-gray-100 dark:bg-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none"
									>
										<option value="">No Category</option>
										{userCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
									</select>
								</div>
							</div>
						</div>

						<div className="bg-white dark:bg-gray-700 rounded-xl p-4">
							<h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Linked Tasks</h3>
							<div className="space-y-2">
								{(local.linkedTaskIds || []).length === 0 && (
									<div className="text-sm text-gray-500 dark:text-gray-300">No tasks linked.</div>
								)}
								{(local.linkedTaskIds || []).map(id => {
									const cl = checklists.find(c => c.id === id);
									if (!cl) return null;
									return (
										<div key={id} className="flex items-center justify-between gap-2 bg-gray-100 dark:bg-gray-600 rounded-lg px-3 py-2">
											<div className="min-w-0">
												<div className="text-sm font-medium truncate">{cl.name}</div>
												<div className="text-xs text-gray-500 truncate">{projectName(cl.projectId)} • {categoryName(cl.categoryId)}</div>
											</div>
											<button onClick={() => onUnlinkTask(id)} className="px-2 py-1 rounded-full text-xs bg-red-600/20 text-red-400 hover:bg-red-600/30">Unlink</button>
										</div>
									);
								})}
							</div>
							{availableChecklists.length > 0 && (
								<div className="mt-3 flex items-center gap-2">
									<select id="linkSelect" className="flex-1 bg-gray-100 dark:bg-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none">
										{availableChecklists.map(cl => (
											<option key={cl.id} value={cl.id}>{cl.name}</option>
										))}
									</select>
									<button
										onClick={() => {
											const el = document.getElementById('linkSelect') as HTMLSelectElement | null;
											const id = el?.value;
											if (id) onLinkTask(id);
										}}
										className="px-3 py-2 rounded-full bg-gray-200 dark:bg-gray-600 text-sm font-semibold flex items-center gap-1"
									>
										<AddIcon className="text-base" /> Link
									</button>
								</div>
							)}
						</div>

						<div className="bg-white dark:bg-gray-700 rounded-xl p-4">
							<button onClick={onDelete} className="w-full px-4 py-2 bg-red-600/20 text-red-400 rounded-full text-sm font-semibold hover:bg-red-600/30">Delete Story</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default StoryEditorPage;

