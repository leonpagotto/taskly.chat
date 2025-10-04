import React from 'react';

type LandingPageProps = {
	onSignIn: () => void;
};

const features = [
	{
		icon: 'task_alt',
		title: 'Tasks & Projects',
		description: 'Organize your work with smart checklists, projects, and kanban boards.',
	},
	{
		icon: 'calendar_month',
		title: 'Calendar & Events',
		description: 'Stay on schedule with integrated calendar and reminders.',
	},
	{
		icon: 'psychology',
		title: 'AI Assistant',
		description: 'Get help planning, writing, and organizing with smart AI.',
	},
	{
		icon: 'note',
		title: 'Notes & Docs',
		description: 'Capture ideas and knowledge in one organized place.',
	},
];

const LandingPage: React.FC<LandingPageProps> = ({ onSignIn }) => {
	return (
		<div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-[var(--color-primary-600)]/25 blur-[150px]" />
				<div className="absolute bottom-[-12rem] left-0 h-[26rem] w-[26rem] rounded-full bg-purple-600/15 blur-[160px]" />
			</div>

			<header className="relative z-10 border-b border-white/5 bg-slate-950/70 backdrop-blur">
				<div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
					<div className="flex items-center gap-2">
						<span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-primary-600)] to-purple-500 text-white shadow-lg">
							<span className="material-symbols-outlined text-[22px]">task_alt</span>
						</span>
						<p className="text-base font-semibold leading-tight sm:text-lg">Taskly.chat</p>
					</div>
					<button
						onClick={onSignIn}
						className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-200 sm:px-5"
					>
						Sign In
					</button>
				</div>
			</header>

			<main className="relative z-10">
				<section className="px-4 py-16 sm:py-24">
					<div className="mx-auto max-w-4xl text-center space-y-6">
						<h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
							Your AI-powered workspace for{' '}
							<span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
								tasks, notes, and projects
							</span>
						</h1>
						<p className="mx-auto max-w-2xl text-base text-gray-300 sm:text-lg">
							Stay organized and focused with smart task management, AI assistance, and seamless collaboration—all in one beautiful workspace.
						</p>
						<div className="flex flex-col gap-3 items-center justify-center pt-4 sm:flex-row sm:gap-4">
							<button
								onClick={onSignIn}
								className="w-full sm:w-auto rounded-full bg-gradient-to-r from-[var(--color-primary-600)] to-purple-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--color-primary-600)]/40 transition hover:shadow-xl"
							>
								Get Started Free
							</button>
							<button
								onClick={onSignIn}
								className="w-full sm:w-auto rounded-full border border-white/20 px-8 py-3 text-sm font-semibold text-gray-200 transition hover:bg-white/10"
							>
								Sign In
							</button>
						</div>
					</div>
				</section>

				<section className="px-4 pb-20">
					<div className="mx-auto max-w-6xl">
						<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
							{features.map((feature) => (
								<div
									key={feature.title}
									className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10"
								>
									<span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-primary-600)]/20 to-purple-500/20 text-[var(--color-primary-400)]">
										<span className="material-symbols-outlined text-[28px]">{feature.icon}</span>
									</span>
									<h3 className="mt-4 text-lg font-semibold text-white">{feature.title}</h3>
									<p className="mt-2 text-sm text-gray-300">{feature.description}</p>
								</div>
							))}
						</div>
					</div>
				</section>

				<section className="px-4 pb-24">
					<div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-gradient-to-br from-[var(--color-primary-600)]/10 via-slate-900 to-black p-8 sm:p-12 text-center">
						<h2 className="text-2xl font-bold sm:text-3xl">Ready to get organized?</h2>
						<p className="mt-4 text-base text-gray-300 sm:text-lg">
							Join thousands of users managing their work smarter with Taskly.
						</p>
						<button
							onClick={onSignIn}
							className="mt-6 rounded-full bg-white px-8 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-200"
						>
							Start Free Today
						</button>
					</div>
				</section>
			</main>

			<footer className="relative border-t border-white/10 bg-slate-950/80">
				<div className="mx-auto max-w-6xl px-4 py-8 text-center text-sm text-gray-400">
					<p className="mb-4 text-base font-semibold text-white">Taskly.chat</p>
					<p>Your AI-powered workspace for modern productivity</p>
					<p className="mt-4 text-xs text-gray-500">
						© {new Date().getFullYear()} Taskly.chat · All rights reserved
					</p>
				</div>
			</footer>
		</div>
	);
};

export default LandingPage;
