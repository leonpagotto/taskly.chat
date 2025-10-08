import React from 'react';
import TasklyLogo from '../TasklyLogo';

interface MarketingLayoutProps {
  pageTitle: string;
  pageDescription?: string;
  children: React.ReactNode;
}

const navigationLinks = [
  { label: 'About', href: '/about.html' },
  { label: 'Features', href: '/features.html' },
  { label: 'Contact', href: '/contact.html' },
];

/**
 * MarketingLayout keeps the marketing pages consistent (header, nav, footer).
 * Designers can drop in any content as children without worrying about scaffolding.
 */
const MarketingLayout: React.FC<MarketingLayoutProps> = ({ pageTitle, pageDescription, children }) => {
  const year = new Date().getFullYear();

  const handleSignIn = () => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.origin + '/');
    url.searchParams.set('login', 'open');
    window.location.href = url.toString();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* Soft gradients add depth without overwhelming the content. */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-48 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-[var(--color-primary-600)]/20 blur-[140px]" />
        <div className="absolute bottom-[-10rem] right-[-6rem] h-[26rem] w-[26rem] rounded-full bg-purple-600/10 blur-[160px]" />
      </div>

      <header className="relative z-10 border-b border-white/5 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <a className="flex items-center gap-2" href="/about.html" aria-label="Go to Taskly about page">
            <TasklyLogo size={40} />
            <p className="text-base font-semibold leading-tight sm:text-lg">Taskly.chat</p>
          </a>
          <nav aria-label="Primary marketing pages" className="hidden items-center gap-6 text-sm font-medium text-gray-200 md:flex">
            {navigationLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="transition hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <button
            onClick={handleSignIn}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-200"
          >
            Sign In
          </button>
        </div>
      </header>

      <main className="relative z-10">
        <section className="px-4 py-14 sm:py-20">
          <div className="mx-auto max-w-3xl text-center space-y-4">
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
              {pageTitle}
            </h1>
            {pageDescription && (
              <p className="mx-auto max-w-2xl text-base text-gray-300 sm:text-lg">
                {pageDescription}
              </p>
            )}
          </div>
        </section>
        <section className="px-4 pb-20">
          <div className="mx-auto flex max-w-6xl flex-col gap-12">
            {children}
          </div>
        </section>
      </main>

      <footer className="relative border-t border-white/10 bg-slate-950/80">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center text-sm text-gray-400">
          <p className="mb-4 text-base font-semibold text-white">Taskly.chat</p>
          <p>Your AI-powered workspace for modern productivity</p>
          <p className="mt-4 text-xs text-gray-500">© {year} Taskly.chat · All rights reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default MarketingLayout;
