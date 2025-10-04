import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Project, UserCategory, Story, StoryStatus } from '../types';
import { Icon, ExpandMoreIcon } from './icons';
import { MoreVertIcon } from './icons';
import UnifiedToolbar from './UnifiedToolbar';
import Header from './Header';
import EmptyStateIcon from './EmptyStateIcon';

interface StoriesViewProps {
	stories: Story[];
	projects: Project[];
	userCategories: UserCategory[];
	onCreateStory?: () => void;
	onSelectStory?: (id: string) => void;
	onEditStory?: (id: string) => void;
	onDeleteStory?: (id: string) => void;
	onToggleSidebar?: () => void;
	onMoveStory?: (id: string, status: StoryStatus) => void;
  onLoadSampleData?: () => void;
}

const StoriesView: React.FC<StoriesViewProps> = ({ stories, projects, userCategories, onCreateStory, onSelectStory, onEditStory, onDeleteStory, onToggleSidebar, onMoveStory, onLoadSampleData }) => {
	const getCategory = (catId?: string) => userCategories.find(c => c.id === catId);
	const getProject = (projId?: string) => projects.find(p => p.id === projId);
	const STORAGE_KEY = 'stories.filters.v1';
	  type Persisted = {
		projectId: 'all' | string;
		categoryId: 'all' | string;
		viewMode: 'list' | 'board';
		status: 'all' | StoryStatus;
		sortBy: 'updated' | 'created';
	};
	const loadPersisted = (): Persisted => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
				if (!raw) return { projectId: 'all', categoryId: 'all', viewMode: 'list', status: 'all', sortBy: 'updated' };
			const data = JSON.parse(raw) as Partial<Persisted>;
			return {
				projectId: (data.projectId as any) ?? 'all',
				categoryId: (data.categoryId as any) ?? 'all',
				viewMode: (data.viewMode as any) ?? 'list',
				status: (data.status as any) ?? 'all',
				sortBy: (data.sortBy as any) ?? 'updated',
			};
			} catch { return { projectId: 'all', categoryId: 'all', viewMode: 'list', status: 'all', sortBy: 'updated' }; }
	};

	const [selectedProjectId, setSelectedProjectId] = useState<'all' | string>(() => (typeof window !== 'undefined' ? loadPersisted().projectId : 'all'));
	const [selectedCategoryId, setSelectedCategoryId] = useState<'all' | string>(() => (typeof window !== 'undefined' ? loadPersisted().categoryId : 'all'));
	const [viewMode, setViewMode] = useState<'list' | 'board'>(() => (typeof window !== 'undefined' ? loadPersisted().viewMode : 'list'));
	const [statusFilter, setStatusFilter] = useState<'all' | StoryStatus>(() => (typeof window !== 'undefined' ? loadPersisted().status : 'all'));
	const [sortBy, setSortBy] = useState<'updated' | 'created'>(() => (typeof window !== 'undefined' ? loadPersisted().sortBy : 'updated'));

	useEffect(() => {
		try {
			const toSave: Persisted = { projectId: selectedProjectId, categoryId: selectedCategoryId, viewMode, status: statusFilter, sortBy };
			localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
		} catch {}
	}, [selectedProjectId, selectedCategoryId, viewMode, statusFilter, sortBy]);

	const filteredStories = useMemo(() => {
		return stories.filter(s => {
			const projOk = selectedProjectId === 'all' || s.projectId === selectedProjectId;
			const catOk = selectedCategoryId === 'all' || s.categoryId === selectedCategoryId;
			const statusOk = statusFilter === 'all' || s.status === statusFilter;
			return projOk && catOk && statusOk;
		});
	}, [stories, selectedProjectId, selectedCategoryId, statusFilter]);

	// Apply sorting based on sortBy value
	const sortedStories = useMemo(() => {
		const arr = [...filteredStories];
		switch (sortBy) {
			case 'updated':
				return arr.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
			case 'created':
				return arr.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
			default:
				return arr;
		}
	}, [filteredStories, sortBy]); 

	// Simple menu state for per-story actions (Edit/Delete). One menu open at a time.
	const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);
	useEffect(() => {
		const onDocClick = () => setMenuOpenFor(null);
		document.addEventListener('click', onDocClick);
		return () => document.removeEventListener('click', onDocClick);
	}, []);

	const renderRightBadges = (s: Story) => {
		const estimate = (s.estimatePoints ?? undefined) || (s.estimateTime ? undefined : undefined);
		const estimateLabel = (() => {
			const pts = s.estimatePoints != null ? `${s.estimatePoints} pts` : '';
			const time = s.estimateTime || '';
			if (pts && time) return `${pts} • ${time}`;
			return pts || time;
		})();
		return (
			<div className="flex items-center gap-2 ml-auto">
				{estimateLabel && (
					<span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 whitespace-nowrap">{estimateLabel}</span>
				)}
				{s.status && (
					<span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 capitalize whitespace-nowrap">{s.status.replace('_',' ')}</span>
				)}
			</div>
		);
	};

	const renderMenu = (sid: string) => (
		<div className="absolute right-0 top-full mt-1 w-40 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-xl border border-gray-300 dark:border-gray-600 z-20 p-1" onClick={(e) => e.stopPropagation()}>
			<button className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" onClick={() => { setMenuOpenFor(null); onEditStory?.(sid); }}>Edit</button>
			<button className="w-full text-left px-3 py-2 text-sm rounded-md text-red-600 hover:bg-red-600/10" onClick={() => { setMenuOpenFor(null); onDeleteStory?.(sid); }}>Delete</button>
		</div>
	);

	// Use shared UnifiedToolbar instead of local FilterDropdowns

	const StatusDropdown: React.FC<{ value: 'all' | StoryStatus; onChange: (v: 'all' | StoryStatus) => void; }> = ({ value, onChange }) => {
		const [open, setOpen] = useState(false);
		const ref = useRef<HTMLDivElement>(null);
		useEffect(() => {
			const onDocClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
			document.addEventListener('mousedown', onDocClick);
			return () => document.removeEventListener('mousedown', onDocClick);
		}, []);
		const label = value === 'all' ? 'All status' : value.replace('_',' ');
		return (
			<div ref={ref} className="relative sm:w-52 w-full">
				<button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-2 px-3 h-10 rounded-[12px] text-sm font-semibold transition-colors bg-gray-200 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700">
					<div className="flex items-center gap-2 truncate">
						<Icon name="flag" className="text-base flex-shrink-0" />
						<span className="truncate capitalize">{label}</span>
					</div>
					<ExpandMoreIcon className={`text-base transition-transform transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
				</button>
				{open && (
					<div className="absolute z-20 top-full mt-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-lg shadow-xl border border-gray-300 dark:border-gray-600 overflow-hidden">
						<ul className="max-h-72 overflow-y-auto">
							{(['all','backlog','in_progress','review','done'] as const).map(opt => (
								<li key={opt}>
									<button onClick={() => { onChange(opt); setOpen(false); }} className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-300 dark:hover:bg-gray-600 truncate ${value === opt ? 'font-semibold text-[var(--color-primary-600)]' : ''}`}>
										{opt === 'all' ? 'All status' : opt.replace('_',' ')}
									</button>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		);
	};

	const SortDropdown: React.FC<{ value: 'updated' | 'created'; onChange: (v: 'updated' | 'created') => void; }> = ({ value, onChange }) => {
		const [open, setOpen] = useState(false);
		const ref = useRef<HTMLDivElement>(null);
		useEffect(() => {
			const onDocClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
			document.addEventListener('mousedown', onDocClick);
			return () => document.removeEventListener('mousedown', onDocClick);
		}, []);
		const label = value === 'updated' ? 'Latest updated' : 'Latest created';
		return (
			<div ref={ref} className="relative sm:w-52">
				<button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-2 px-3 h-10 rounded-[12px] text-sm font-semibold transition-colors bg-gray-200 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700">
					<div className="flex items-center gap-2 truncate">
						<Icon name="sort" className="text-base flex-shrink-0" />
						<span className="truncate">{label}</span>
					</div>
					<ExpandMoreIcon className={`text-base transition-transform transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
				</button>
				{open && (
					<div className="absolute z-20 top-full mt-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-lg shadow-xl border border-gray-300 dark:border-gray-600 overflow-hidden">
						<ul className="max-h-72 overflow-y-auto">
							{(['updated', 'created'] as const).map(opt => (
								<li key={opt}>
									<button onClick={() => { onChange(opt); setOpen(false); }} className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-300 dark:hover:bg-gray-600 truncate ${value === opt ? 'font-semibold text-[var(--color-primary-600)]' : ''}`}>
										{opt === 'updated' ? 'Latest updated' : 'Latest created'}
									</button>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		);
	};

	return (
		<div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-800 h-full">
			<Header title="Stories" onToggleSidebar={onToggleSidebar || (() => {})} onOpenSearch={() => window.dispatchEvent(new Event('taskly.openSearch'))}>
				<button onClick={onCreateStory} className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white rounded-[var(--radius-button)] font-semibold hover:shadow-lg transition-all text-sm">
					<Icon name="auto_stories" />
					<span className="hidden sm:inline">New Story</span>
				</button>
			</Header>

			{/* Primary filter bar (full width background) */}
			<div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
				<div className="px-4 sm:px-6">
					<div className="w-full py-4">
						<UnifiedToolbar
							projects={projects}
							userCategories={userCategories}
							selectedProjectId={selectedProjectId}
							selectedCategoryId={selectedCategoryId}
							onChangeProject={setSelectedProjectId}
							onChangeCategory={setSelectedCategoryId}
							hideCategory
							compactHeight="h10"
							inlineExtras={<StatusDropdown value={statusFilter} onChange={setStatusFilter} />}
							rightExtras={
								<>
									<div className="bg-gray-200 dark:bg-gray-700/50 flex items-center h-10 px-1 rounded-[12px]">
										<button onClick={() => setViewMode('list')} className={`h-8 px-3 rounded-[12px] text-sm font-semibold ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300/70 dark:hover:bg-gray-600/40'}`}>
											<span className="inline-flex items-center gap-1"><Icon name="view_list" className="text-base" /> <span className="hidden sm:inline">List</span></span>
										</button>
										<button onClick={() => setViewMode('board')} className={`h-8 px-3 rounded-[12px] text-sm font-semibold ${viewMode === 'board' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300/70 dark:hover:bg-gray-600/40'}`}>
											<span className="inline-flex items-center gap-1"><Icon name="view_kanban" className="text-base" /> <span className="hidden sm:inline">Board</span></span>
										</button>
									</div>
									<div className="ml-2"><SortDropdown value={sortBy} onChange={setSortBy} /></div>
								</>
							}
						/>
					</div>
					</div>
				</div>

			{/* Main content area */}
			<div className="px-4 sm:px-6">
				<div className="w-full py-4 sm:py-6">
					{sortedStories.length === 0 ? (
						<div className="text-center text-gray-500 p-6 flex flex-col items-center justify-center min-h-[50vh]">
							<EmptyStateIcon icon={<Icon name="auto_stories" />} size="lg" />
							<h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
								{stories.length === 0 ? 'No stories yet' : 'No stories match filters'}
							</h2>
							<p className="max-w-md mt-1 mb-6 text-gray-500 dark:text-gray-400">
								{stories.length === 0 
									? 'Create your first story to track narrative progress.' 
									: 'Try adjusting your filters (project, category, or status) or create a new story.'}
							</p>
							<div className="flex items-center gap-2">
								<button onClick={onCreateStory} className="px-6 py-3 bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white rounded-[var(--radius-button)] font-semibold hover:shadow-lg transition-all">New Story</button>
								{onLoadSampleData && (
									<button onClick={onLoadSampleData} className="px-6 py-3 rounded-[var(--radius-button)] font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all">Load sample data</button>
								)}
							</div>
						</div>
					) : viewMode === 'list' ? (
						<div className="bg-transparent">
							<div className="divide-y divide-gray-200 dark:divide-gray-700 rounded-xl overflow-hidden">
								{sortedStories.map(story => {
									const category = getCategory(story.categoryId);
									const project = getProject(story.projectId);
									return (
										<div key={story.id} className="bg-white dark:bg-gray-700/50 p-3 hover:shadow-md transition-all group">
											<button onClick={() => onSelectStory?.(story.id)} className="w-full text-left">
												<div className="flex items-center gap-3">
													<div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${(category?.color || project?.color || '#64748B')}20` }}>
														<Icon name={category?.icon || project?.icon || 'auto_stories'} style={{ color: category?.color || project?.color || '#64748B' }} className="text-2xl" />
													</div>
													<div className="flex-1 min-w-0">
														<div className="text-base font-medium text-gray-900 dark:text-white truncate">{story.title}</div>
													</div>
													{/* Right-aligned badges (estimate, status) and 3-dots menu */}
													<div className="ml-2 flex items-center gap-2 relative">
														{renderRightBadges(story)}
														<button
															onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpenFor(p => p === story.id ? null : story.id); }}
															className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-300/60 dark:hover:bg-gray-600/60"
															title="More"
														>
															<MoreVertIcon />
														</button>
														{menuOpenFor === story.id && renderMenu(story.id)}
													</div>
												</div>
											</button>
										</div>
									);
								})}
							</div>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
							{(['Backlog', 'In Progress', 'Review', 'Done'] as const).map(col => {
								const statusMap: Record<string, StoryStatus> = {
									'Backlog': 'backlog',
									'In Progress': 'in_progress',
									'Review': 'review',
									'Done': 'done'
								};
								const columnStatus = statusMap[col];
								return (
									<div key={col} className="bg-white dark:bg-gray-700/50 rounded-xl p-3"
										onDragOver={(e) => e.preventDefault()}
										onDrop={(e) => {
											const storyId = e.dataTransfer.getData('text/plain');
											if (storyId) onMoveStory?.(storyId, columnStatus);
										}}
									>
										<div className="flex items-center justify-between mb-2">
											<h3 className="text-sm font-semibold text-gray-700 dark:text-gray-100">{col}</h3>
											<span className="text-xs text-gray-400">{sortedStories.filter(s => s.status === columnStatus).length}</span>
										</div>
										<div className="space-y-2 min-h-[120px]">
											{sortedStories
												.filter(s => s.status === columnStatus)
												.map(s => {
													const category = getCategory(s.categoryId);
													const project = getProject(s.projectId);
													return (
														<button
															key={s.id}
															draggable
															onDragStart={(e) => e.dataTransfer.setData('text/plain', s.id)}
															onClick={() => onSelectStory?.(s.id)}
															className="w-full text-left p-2 rounded-lg bg-gray-100 dark:bg-gray-600 hover:shadow-md transition-all"
														>
														<div className="flex items-start justify-between gap-2">
															<div className="flex items-start gap-2 min-w-0">
																<div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${(category?.color || project?.color || '#64748B')}20` }}>
																	<Icon name={category?.icon || project?.icon || 'auto_stories'} style={{ color: category?.color || project?.color || '#64748B' }} className="text-lg" />
																</div>
																<div className="min-w-0 flex-1">
																	<div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{s.title}</div>
																	{(project || category) && (
																		<div className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-300 flex items-center gap-1">
																			{project && <span className="truncate">{project.name}</span>}
																			{project && category && <span>•</span>}
																			{category && (
																				<span className="inline-flex items-center gap-1 truncate"><Icon name={category.icon} className="text-xs" style={{ color: category.color }} />{category.name}</span>
																			)}
																		</div>
																	)}
																</div>
															</div>
															<div className="flex items-center gap-2 relative">
																{renderRightBadges(s)}
																<button
																	onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpenFor(p => p === s.id ? null : s.id); }}
																	className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-300/60 dark:hover:bg-gray-600/60"
																	title="More"
																>
																	<MoreVertIcon />
																</button>
																{menuOpenFor === s.id && renderMenu(s.id)}
															</div>
														</div>
														</button>
													);
												})
											}
											{sortedStories.filter(s => s.status === columnStatus).length === 0 && (
													<div className="text-center text-gray-500 dark:text-gray-400 py-6">
														<p className="text-sm">No stories in this column yet.</p>
													</div>
												)}
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default StoriesView;
