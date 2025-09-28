import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Project, UserCategory, Story, StoryStatus } from '../types';
import { Icon, ExpandMoreIcon } from './icons';
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
}

const StoriesView: React.FC<StoriesViewProps> = ({ stories, projects, userCategories, onCreateStory, onSelectStory, onEditStory, onDeleteStory, onToggleSidebar, onMoveStory }) => {
	const getCategory = (catId?: string) => userCategories.find(c => c.id === catId);
	const getProject = (projId?: string) => projects.find(p => p.id === projId);
	const [selectedProjectId, setSelectedProjectId] = useState<'all' | string>('all');
	const [selectedCategoryId, setSelectedCategoryId] = useState<'all' | string>('all');
	const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
	const [isFilterOpen, setFilterOpen] = useState(false);
	const [statusFilter, setStatusFilter] = useState<'all' | StoryStatus>('all');
	const [sortBy, setSortBy] = useState<'updated' | 'created'>('updated');

	const filteredStories = useMemo(() => {
		return stories.filter(s => {
			const projOk = selectedProjectId === 'all' || s.projectId === selectedProjectId;
			const catOk = selectedCategoryId === 'all' || s.categoryId === selectedCategoryId;
			const statusOk = statusFilter === 'all' || s.status === statusFilter;
			return projOk && catOk && statusOk;
		});
	}, [stories, selectedProjectId, selectedCategoryId, statusFilter]);

	// Placeholder sorting (no timestamps in Story type yet). Keeps array as-is; hook ready for future fields.
	const sortedStories = filteredStories; 

	// Use shared UnifiedToolbar instead of local FilterDropdowns

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
				<button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors bg-gray-200 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700">
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
			<Header title="Stories" onToggleSidebar={onToggleSidebar || (() => {})}>
				<button onClick={onCreateStory} className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white rounded-full font-semibold hover:shadow-lg transition-all text-sm">
					<Icon name="auto_stories" />
					<span className="hidden sm:inline">New Story</span>
				</button>
			</Header>

			{/* Primary filter bar (full width background) */}
			<div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
				<div className="px-4 sm:px-6">
					<div className="mx-auto w-full max-w-5xl py-4">
						<UnifiedToolbar
							projects={projects}
							userCategories={userCategories}
							selectedProjectId={selectedProjectId}
							selectedCategoryId={selectedCategoryId}
							onChangeProject={setSelectedProjectId}
							onChangeCategory={setSelectedCategoryId}
							chips={[
								{ key: 'all', label: 'all' },
								{ key: 'backlog', label: 'backlog' },
								{ key: 'in_progress', label: 'in progress' },
								{ key: 'review', label: 'review' },
								{ key: 'done', label: 'done' },
							]}
							activeChipKey={statusFilter}
							onChangeChip={(key) => setStatusFilter(key as any)}
							rightExtras={
								<>
									<div className="p-1 bg-gray-200 dark:bg-gray-700/50 rounded-full flex">
										<button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-full text-sm font-semibold ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300/70 dark:hover:bg-gray-600/40'}`}>
											<span className="inline-flex items-center gap-1"><Icon name="view_list" className="text-base" /> <span className="hidden sm:inline">List</span></span>
										</button>
										<button onClick={() => setViewMode('board')} className={`px-3 py-1.5 rounded-full text-sm font-semibold ${viewMode === 'board' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300/70 dark:hover:bg-gray-600/40'}`}>
											<span className="inline-flex items-center gap-1"><Icon name="view_kanban" className="text-base" /> <span className="hidden sm:inline">Board</span></span>
										</button>
									</div>
									<button onClick={() => setFilterOpen(v => !v)} className="px-3 py-1.5 rounded-full text-sm font-semibold bg-gray-200 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700">
										<span className="inline-flex items-center gap-1"><Icon name="search" className="text-base" /> Filters</span>
									</button>
								</>
							}
						/>
					</div>
					</div>
				</div>

			{/* Secondary filter bar (sort only) */}
			{isFilterOpen && (
				<div className="bg-gray-50 dark:bg-gray-900/30 border-b border-gray-200 dark:border-gray-700">
					<div className="px-4 sm:px-6">
						<div className="mx-auto w-full max-w-5xl py-3 flex items-center gap-2">
							<div className="ml-auto flex items-center gap-2">
								{/* Sort dropdown styled like the filter selectors */}
								<SortDropdown value={sortBy} onChange={setSortBy} />
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Main content area */}
			<div className="px-4 sm:px-6">
				<div className="mx-auto w-full max-w-5xl py-4 sm:py-6">
					{sortedStories.length === 0 ? (
						<div className="text-center text-gray-500 p-6 flex flex-col items-center justify-center">
							<EmptyStateIcon icon={<Icon name="auto_stories" />} size="lg" />
							<h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">No stories yet</h2>
							<p className="max-w-md mt-1 mb-6 text-gray-500 dark:text-gray-400">Create your first story to track narrative progress.</p>
							<button onClick={onCreateStory} className="px-6 py-3 bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white rounded-full font-semibold hover:shadow-lg transition-all">New Story</button>
						</div>
					) : viewMode === 'list' ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
							{sortedStories.map(story => {
								const category = getCategory(story.categoryId);
								const project = getProject(story.projectId);
								return (
									<div key={story.id} className="bg-white dark:bg-gray-700 p-3 rounded-xl group transition-all hover:shadow-md cursor-pointer" onClick={() => onSelectStory?.(story.id)}>
										<div className="flex items-start gap-3">
											<div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: `${(category?.color || project?.color || '#64748B')}20` }}>
												<Icon name={category?.icon || project?.icon || 'auto_stories'} style={{ color: category?.color || project?.color || '#64748B' }} className="text-2xl" />
											</div>
											<div className="min-w-0 flex-1">
												<div className="flex items-center gap-2">
													<h3 className="text-base font-medium text-gray-900 dark:text-white truncate">{story.title}</h3>
													{story.status && (
														<span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200">{story.status}</span>
													)}
												</div>
												{(project || category) && (
													<div className="mt-1 text-xs text-gray-500 dark:text-gray-300 flex items-center gap-2">
														{project && <span className="truncate">{project.name}</span>}
														{project && category && <span>•</span>}
														{category && (
															<span className="inline-flex items-center gap-1 truncate"><Icon name={category.icon} className="text-sm" style={{ color: category.color }} />{category.name}</span>
														)}
													</div>
												)}
											</div>
											<div className="flex-shrink-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
												<div className="flex items-center gap-1">
													<button className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-white hover:bg-gray-600/50" onClick={(e) => { e.stopPropagation(); onEditStory?.(story.id); }} title="Edit">
														<Icon name="edit" />
													</button>
													<button className="w-8 h-8 flex items-center justify-center rounded-full text-red-500 hover:text-red-400 hover:bg-red-500/10" onClick={(e) => { e.stopPropagation(); onDeleteStory?.(story.id); }} title="Delete">
														<Icon name="delete" />
													</button>
												</div>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
							{(['Backlog', 'In Progress', 'Review', 'Done'] as const).map(col => {
								const statusMap: Record<typeof col, StoryStatus> = {
									'Backlog': 'backlog',
									'In Progress': 'in_progress',
									'Review': 'review',
									'Done': 'done'
								} as any;
								const columnStatus = statusMap[col];
								return (
									<div key={col} className="bg-white dark:bg-gray-700 rounded-xl p-3"
										onDragOver={(e) => e.preventDefault()}
										onDrop={(e) => {
											const storyId = e.dataTransfer.getData('text/plain');
											if (storyId) onMoveStory?.(storyId, columnStatus);
										}}
									>
										<div className="flex items-center justify-between mb-2">
											<h3 className="text-sm font-semibold text-gray-700 dark:text-gray-100">{col}</h3>
											<span className="text-xs text-gray-400">—</span>
										</div>
										<div className="space-y-2 min-h-[60px]">
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
															className="w-full text-left p-2 rounded-lg bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
														>
															<div className="flex items-start gap-2">
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
														</button>
													);
												})}
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
