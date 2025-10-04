import React from 'react';

type LandingPageProps = {
	onSignIn: () => void;
};

const features = [
	{
		icon: 'task_alt',
		title: 'Tasks & Habits',
		description: 'Track daily tasks and build lasting habits with smart checklists and recurring reminders.',
	},
	{
		icon: 'concierge',
		title: 'Requests Intake',
		description: 'Collect and manage incoming work requests with priority, skills, and AI-powered conversion to Stories.',
	},
	{
		icon: 'auto_stories',
		title: 'User Stories & Kanban',
		description: 'Plan work with user stories, acceptance criteria, and visual Kanban boards for agile workflows.',
	},
	{
		icon: 'folder_open',
		title: 'Projects & Organization',
		description: 'Structure work with projects, categories, and team collaboration features.',
	},
	{
		icon: 'calendar_month',
		title: 'Calendar & Scheduling',
		description: 'Stay on schedule with integrated calendar, events, and deadline tracking.',
	},
	{
		icon: 'psychology',
		title: 'Smart AI Assistant',
		description: 'Generate tasks, suggest skills, create stories, and get intelligent help powered by Google Gemini.',
	},
	{
		icon: 'note',
		title: 'Notes & Files',
		description: 'Capture ideas, manage documents, and organize knowledge in one secure workspace.',
	},
	{
		icon: 'insights',
		title: 'Skills Management',
		description: 'Define team skills, tag work with required expertise, and match talent to tasks.',
	},
];

const plans = [
	{
		name: 'Free',
		subtitle: 'Starter',
		price: '$0',
		period: 'forever',
		description: 'For individuals exploring Taskly',
		features: [
			'Up to 50 tasks, 5 habits, 2 projects',
			'Basic reminders',
			'List view only',
			'Up to 3 Requests/month',
			'No AI assistance',
			'No collaboration',
		],
		cta: 'Get Started',
		highlighted: false,
	},
	{
		name: 'Lifetime',
		subtitle: 'One-Time Payment',
		price: '$25',
		period: 'one-time',
		description: 'Unlimited personal use, no subscriptions',
		features: [
			'Unlimited tasks, habits, projects',
			'Unlimited Requests (text-based)',
			'Light AI suggestions (5/day)',
			'Sync across devices',
			'Profile customization',
			'No collaboration or Stories',
		],
		cta: 'Buy Once',
		highlighted: false,
	},
	{
		name: 'Pro',
		subtitle: 'Power Users & Teams',
		price: '$10',
		period: '/user/month',
		description: 'Collaboration + Smart AI',
		features: [
			'Unlimited everything',
			'Requests → Stories conversion',
			'Smart AI (natural language, SpecKit)',
			'Up to 5 team collaborators',
			'Calendar sync (Google, Outlook)',
			'Basic Kanban board',
			'Priority support',
		],
		cta: 'Start Pro Trial',
		highlighted: true,
	},
	{
		name: 'Enterprise',
		subtitle: 'Organizations',
		price: 'Custom',
		period: 'pricing',
		description: 'Advanced workflows + unlimited AI',
		features: [
			'Everything in Pro, plus:',
			'Advanced Stories (criteria, estimation)',
			'Full Kanban workflows',
			'Unlimited AI (SpecKit, auto-Stories)',
			'Team management & permissions',
			'Advanced analytics & reporting',
			'Enterprise integrations (Slack, Jira)',
			'SSO, audit logs, dedicated support',
		],
		cta: 'Contact Sales',
		highlighted: false,
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

				<section className="px-4 pb-12">
					<div className="mx-auto max-w-6xl">
						<h2 className="mb-10 text-center text-2xl font-bold sm:text-3xl">Everything you need to stay productive</h2>
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

				<section className="px-4 py-16 sm:py-20">
					<div className="mx-auto max-w-6xl">
						<div className="mb-12 text-center">
							<h2 className="text-2xl font-bold sm:text-3xl lg:text-4xl">Simple, transparent pricing</h2>
							<p className="mt-4 text-base text-gray-300 sm:text-lg">
								Choose the plan that fits your needs. Start free, upgrade anytime.
							</p>
						</div>
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
							{plans.map((plan) => (
								<div
									key={plan.name}
									className={`relative rounded-3xl border p-6 transition ${
										plan.highlighted
											? 'border-[var(--color-primary-600)] bg-gradient-to-br from-[var(--color-primary-600)]/10 to-purple-500/10 shadow-xl shadow-[var(--color-primary-600)]/20'
											: 'border-white/10 bg-white/5 hover:bg-white/10'
									}`}
								>
									{plan.highlighted && (
										<div className="absolute -top-3 left-1/2 -translate-x-1/2">
											<span className="rounded-full bg-gradient-to-r from-[var(--color-primary-600)] to-purple-500 px-3 py-1 text-xs font-semibold text-white">
												Most Popular
											</span>
										</div>
									)}
									<div className="mb-4">
										<h3 className="text-xl font-bold text-white">{plan.name}</h3>
										<p className="text-sm text-gray-400">{plan.subtitle}</p>
									</div>
									<div className="mb-4">
										<span className="text-3xl font-bold text-white">{plan.price}</span>
										<span className="ml-1 text-sm text-gray-400">{plan.period}</span>
									</div>
									<p className="mb-6 text-sm text-gray-300">{plan.description}</p>
									<button
										onClick={onSignIn}
										className={`mb-6 w-full rounded-full py-2.5 text-sm font-semibold transition ${
											plan.highlighted
												? 'bg-gradient-to-r from-[var(--color-primary-600)] to-purple-500 text-white shadow-lg hover:shadow-xl'
												: 'border border-white/20 text-gray-200 hover:bg-white/10'
										}`}
									>
										{plan.cta}
									</button>
									<ul className="space-y-2.5">
										{plan.features.map((feature, idx) => (
											<li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
												<span className="material-symbols-outlined mt-0.5 text-[18px] text-[var(--color-primary-400)]">
													check_circle
												</span>
												<span>{feature}</span>
											</li>
										))}
									</ul>
								</div>
							))}
						</div>
					</div>
				</section>

				<section className="px-4 pb-24">
					<div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-gradient-to-br from-[var(--color-primary-600)]/10 via-slate-900 to-black p-8 sm:p-12 text-center">
						<h2 className="text-2xl font-bold sm:text-3xl">Ready to transform your productivity?</h2>
						<p className="mt-4 text-base text-gray-300 sm:text-lg">
							Join thousands of users managing tasks, requests, and projects with AI-powered intelligence.
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
