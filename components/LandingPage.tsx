import React from 'react';

type LandingPageProps = {
	onOpenApp: () => void;
	onSignIn: () => void;
};

const LandingPage: React.FC<LandingPageProps> = ({ onOpenApp, onSignIn }) => {
	return (
		<div className="min-h-screen bg-gray-900 text-white">
			<header className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<img src="/vite.svg" alt="Taskly" className="w-7 h-7" />
					<span className="font-bold">Taskly.chat</span>
				</div>
				<div className="flex items-center gap-3">
					<button onClick={onOpenApp} className="px-3 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-sm font-semibold">Open App</button>
					<button onClick={onSignIn} className="px-3 py-2 rounded-md bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-sm font-semibold">Sign In</button>
				</div>
			</header>
			<main>
				{/* Hero */}
				<section className="px-4">
					<div className="max-w-6xl mx-auto rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 md:p-12 mt-4">
						<h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Turn conversations into action</h1>
						<p className="mt-3 text-white/95 max-w-2xl">Taskly.chat blends chat and planning so you can capture ideas, plan work, and track progress—fast.</p>
						<div className="mt-6 flex flex-wrap gap-3">
							<button onClick={onOpenApp} className="px-5 py-3 rounded-full bg-gray-900/90 hover:bg-gray-900 text-sm font-semibold">Try the App</button>
							<button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })} className="px-5 py-3 rounded-full bg-white/90 text-gray-900 hover:bg-white text-sm font-semibold">Contact Us</button>
						</div>
					</div>
				</section>

				{/* Features */}
				<section className="px-4 mt-10">
					<div className="max-w-6xl mx-auto">
						<h2 className="text-xl font-bold">Features</h2>
						<div className="grid md:grid-cols-3 gap-4 mt-4">
							{[
								{ title: 'Unified Today', desc: 'Tasks, habits, and calendar in one view.' },
								{ title: 'AI Assistance', desc: 'Create tasks and plans directly from chat.' },
								{ title: 'Projects & Notes', desc: 'Keep work organized with linked notes and files.' },
							].map((f, i) => (
								<div key={i} className="p-4 rounded-xl bg-gray-800 border border-gray-700">
									<h3 className="font-semibold">{f.title}</h3>
									<p className="text-sm text-gray-300">{f.desc}</p>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Pricing placeholder */}
				<section className="px-4 mt-10">
					<div className="max-w-6xl mx-auto">
						<h2 className="text-xl font-bold">Pricing</h2>
						<div className="grid md:grid-cols-3 gap-4 mt-4">
							{['Free', 'Pro', 'Team'].map((tier, i) => (
								<div key={i} className="p-4 rounded-xl bg-gray-800 border border-gray-700">
									<h3 className="font-semibold">{tier}</h3>
									<p className="text-sm text-gray-300">Coming soon.</p>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Portfolio/Blog placeholder */}
				<section className="px-4 mt-10">
					<div className="max-w-6xl mx-auto">
						<h2 className="text-xl font-bold">From the Blog</h2>
						<div className="grid md:grid-cols-3 gap-4 mt-4">
							{[1,2,3].map(i => (
								<article key={i} className="p-4 rounded-xl bg-gray-800 border border-gray-700">
									<h3 className="font-semibold">Post title {i}</h3>
									<p className="text-sm text-gray-300">Insights, updates, and case studies.</p>
								</article>
							))}
						</div>
					</div>
				</section>

				{/* Contact */}
				<section className="px-4 mt-10 mb-16">
					<div className="max-w-6xl mx-auto">
						<h2 className="text-xl font-bold">Contact</h2>
						<div className="mt-3 p-4 rounded-xl bg-gray-800 border border-gray-700">
							<p className="text-sm text-gray-300">Have a project in mind? Reach out and let’s talk.</p>
							<div className="mt-3 flex gap-3">
								<a href="mailto:hello@taskly.chat" className="px-4 py-2 rounded-md bg-white text-gray-900 text-sm font-semibold">Email us</a>
								<button onClick={onSignIn} className="px-4 py-2 rounded-md bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-sm font-semibold">Sign in</button>
							</div>
						</div>
					</div>
				</section>
			</main>
			<footer className="py-8 text-center text-sm text-gray-400">© {new Date().getFullYear()} Taskly.chat</footer>
		</div>
	);
};

export default LandingPage;
