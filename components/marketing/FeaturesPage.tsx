import React from 'react';
import MarketingLayout from './MarketingLayout';

const featureBuckets = [
  {
    title: 'Plan with clarity',
    description: 'Map out everything from daily todos to enterprise projects with flexible, AI-enhanced workflows.',
    items: [
      'Unified calendar, kanban, and list views for any team size',
      'Smart grouping by projects, categories, or priority',
      'Quick actions optimized for mobile, tablet, and desktop',
    ],
  },
  {
    title: 'Stay in flow',
    description: 'Keep context at your fingertips with notes, files, and chat in a single workspace.',
    items: [
      'Lightweight notes with rich formatting and instant search',
      'Attach files to tasks, requests, and stories with previews',
      'AI-powered summaries that surface what matters right now',
    ],
  },
  {
    title: 'Collaborate effortlessly',
    description: 'Give every teammate the right level of insight—from executive dashboards to contributor checklists.',
    items: [
      'Role-based access with per-project permissions',
      'Stories view for sprint planning, retros, and stakeholder updates',
      'Requests intake that converts into tasks or stories in one click',
    ],
  },
];

const aiHighlights = [
  {
    icon: 'robot_2',
    title: 'Task drafting',
    copy: 'Turn a chat prompt into a structured task with due dates, skills, and subtasks in seconds.',
  },
  {
    icon: 'bolt',
    title: 'SpecKit automations',
    copy: 'Generate acceptance criteria, backlog stories, and estimates tailored to your team’s playbook.',
  },
  {
    icon: 'insights',
    title: 'Progress insights',
    copy: 'Spot trends across tasks, habits, and stories with AI-curated summaries and nudges.',
  },
];

const platformSupport = [
  {
    icon: 'devices',
    title: 'Any device',
    description: 'Responsive layouts adapt seamlessly across desktop, tablet, and mobile.',
  },
  {
    icon: 'cloud_sync',
    title: 'Cloud sync',
    description: 'Real-time updates keep distributed teams aligned, even in hybrid environments.',
  },
  {
    icon: 'security',
    title: 'Privacy first',
    description: 'Data encryption at rest and in transit, with enterprise SSO available on request.',
  },
];

const FeaturesPage: React.FC = () => {
  return (
    <MarketingLayout
      pageTitle="Powerful building blocks for every workflow"
      pageDescription="Taskly combines modern productivity patterns with AI support so your team can plan, execute, and reflect without switching tools."
    >
      {/* Key feature pillars presented in approachable bite-sized chunks. */}
      <div className="grid gap-8 lg:grid-cols-3">
        {featureBuckets.map((bucket) => (
          <article
            key={bucket.title}
            className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg shadow-black/10"
          >
            <h2 className="text-xl font-semibold text-white">{bucket.title}</h2>
            <p className="mt-3 text-sm text-gray-300">{bucket.description}</p>
            <ul className="mt-6 space-y-3 text-sm text-gray-200">
              {bucket.items.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="material-symbols-outlined mt-0.5 text-[20px] text-[var(--color-primary-600)]">
                    check_circle
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      {/* AI highlight cards offer a quick glimpse into differentiated value. */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[var(--color-primary-600)]/20 via-slate-900 to-slate-950 p-10">
        <h2 className="text-2xl font-semibold text-white sm:text-3xl">AI inside every flow</h2>
        <p className="mt-3 max-w-2xl text-sm text-gray-200 sm:text-base">
          Google Gemini powers the Taskly assistant. Ask questions, generate plans, and automate the busywork—without leaving your workspace.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {aiHighlights.map((highlight) => (
            <div
              key={highlight.title}
              className="rounded-2xl border border-white/10 bg-white/10 p-6"
            >
              <span className="material-symbols-outlined text-[32px] text-white/90">
                {highlight.icon}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-white">{highlight.title}</h3>
              <p className="mt-2 text-sm text-gray-200">{highlight.copy}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Platform reassurance section keeps procurement conversations simple. */}
      <div className="grid gap-6 md:grid-cols-3">
        {platformSupport.map((item) => (
          <article
            key={item.title}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center"
          >
            <span className="material-symbols-outlined text-[28px] text-[var(--color-primary-600)]">
              {item.icon}
            </span>
            <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
            <p className="mt-2 text-sm text-gray-300">{item.description}</p>
          </article>
        ))}
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
        <h2 className="text-2xl font-semibold text-white sm:text-3xl">Need a deeper dive?</h2>
        <p className="mt-3 text-sm text-gray-300 sm:text-base">
          Book a guided tour and we’ll tailor a walkthrough for your team’s exact workflow.
        </p>
        <a
          href="/contact.html"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-200"
        >
          Talk to us
        </a>
      </div>
    </MarketingLayout>
  );
};

export default FeaturesPage;
