import React from 'react';
import MarketingLayout from './MarketingLayout';

const supportChannels = [
  {
    icon: 'support_agent',
    title: 'Product questions',
    details: 'Looking to understand how Taskly fits your workflow? Share your goals and we’ll craft a tailored walkthrough.',
    cta: 'Schedule a discovery call',
    link: 'mailto:hello@taskly.chat?subject=Discovery%20call%20request',
  },
  {
    icon: 'handshake',
    title: 'Partnerships',
    details: 'Integrate Taskly into your platform or explore co-marketing opportunities with our team.',
    cta: 'Email partnerships',
    link: 'mailto:partnerships@taskly.chat',
  },
  {
    icon: 'lock',
    title: 'Security & compliance',
    details: 'Need detailed security documentation or to discuss compliance requirements? We’re happy to help.',
    cta: 'Request security brief',
    link: 'mailto:security@taskly.chat',
  },
];

const faqs = [
  {
    question: 'Do you offer pilots or proof-of-concept programs?',
    answer: 'Yes. Teams can run a 30-day pilot with guided onboarding, sample data, and weekly check-ins to ensure adoption sticks.',
  },
  {
    question: 'Can Taskly integrate with our existing tools?',
    answer: 'We support Slack, Google Calendar, Outlook, Zapier, and have an open API roadmap. Enterprise plans include custom integration support.',
  },
  {
    question: 'What if our industry requires on-prem hosting?',
    answer: 'Enterprise customers can choose a managed private cloud deployment. Reach out to discuss options and timelines.',
  },
];

const ContactPage: React.FC = () => {
  return (
    <MarketingLayout
      pageTitle="Let’s build a faster, calmer workflow together"
      pageDescription="Our team can help you evaluate Taskly, plan a rollout, or answer security questions. Pick the track that fits your needs or drop us a quick note."
    >
      <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <h2 className="text-xl font-semibold text-white">Send us a message</h2>
          <p className="mt-3 text-sm text-gray-300">
            This lightweight form emails our success team. Expect a reply within one business day.
          </p>
          <form
            className="mt-6 space-y-4"
            action="https://formspree.io/f/mzbqoojl"
            method="POST"
          >
            {/* Simple fields keep the barrier low. */}
            <label className="block text-left text-sm font-medium text-gray-200">
              Name
              <input
                name="name"
                required
                className="mt-1 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-[var(--color-primary-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-600)]/40"
                placeholder="Your name"
              />
            </label>
            <label className="block text-left text-sm font-medium text-gray-200">
              Work email
              <input
                name="email"
                type="email"
                required
                className="mt-1 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-[var(--color-primary-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-600)]/40"
                placeholder="you@company.com"
              />
            </label>
            <label className="block text-left text-sm font-medium text-gray-200">
              How can we help?
              <textarea
                name="message"
                required
                rows={4}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-[var(--color-primary-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-600)]/40"
                placeholder="Tell us about your team and goals..."
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-full bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl"
            >
              Send message
            </button>
            <p className="text-xs text-gray-500">
              By submitting, you agree to let us contact you about Taskly. We respect your inbox—no spam, ever.
            </p>
          </form>
        </div>

        <aside className="space-y-6">
          {supportChannels.map((channel) => (
            <div
              key={channel.title}
              className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-6"
            >
              <span className="material-symbols-outlined text-[28px] text-white">
                {channel.icon}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-white">{channel.title}</h3>
              <p className="mt-2 text-sm text-gray-200">{channel.details}</p>
              <a
                href={channel.link}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary-600)] transition hover:text-[var(--color-primary-700)]"
              >
                {channel.cta}
                <span className="material-symbols-outlined text-[18px]">north_east</span>
              </a>
            </div>
          ))}
        </aside>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <h2 className="text-xl font-semibold text-white">Frequently asked questions</h2>
        <div className="mt-6 space-y-6">
          {faqs.map((item) => (
            <details
              key={item.question}
              className="group rounded-2xl border border-white/10 bg-black/40 p-5"
            >
              <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-white">
                {item.question}
                <span className="material-symbols-outlined text-[20px] text-[var(--color-primary-600)] transition group-open:rotate-180">
                  expand_more
                </span>
              </summary>
              <p className="mt-3 text-sm text-gray-300">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-[var(--color-primary-600)]/20 to-[var(--color-primary-end)]/20 p-8 text-center">
        <h2 className="text-2xl font-semibold text-white sm:text-3xl">Prefer to talk live?</h2>
        <p className="mt-3 text-sm text-gray-200 sm:text-base">
          Join our weekly product tour to see Taskly in action and ask questions in real time.
        </p>
        <a
          href="https://cal.com/taskly-chat/demo"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-200"
        >
          Reserve a seat
        </a>
      </div>
    </MarketingLayout>
  );
};

export default ContactPage;
