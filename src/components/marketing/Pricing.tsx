import React from 'react';

const Pricing: React.FC = () => {
  return (
    <section
      className="py-24 bg-background-light dark:bg-background-dark border-b border-slate-200 dark:border-border-dark"
      id="pricing"
    >
      <div className="w-full px-4 md:px-10 lg:px-40">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
            Transparent Pricing
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Start coding for free. Upgrade as you scale your projects and team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Starter Plan */}
          <div className="rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-8 flex flex-col shadow-sm hover:shadow-md transition-shadow animate-fade-in-up delay-100">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Starter</h3>
              <p className="text-sm text-slate-500 mt-2">Perfect for hobbyists and learning.</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-black text-slate-900 dark:text-white">$0</span>
              <span className="text-slate-500">/month</span>
            </div>
            <button className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-slate-200 dark:border-border-dark bg-transparent hover:bg-slate-100 dark:hover:bg-surface-hover text-slate-900 dark:text-white h-10 px-4 py-2 mb-8">
              Get Started
            </button>
            <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-300 flex-1">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-lg">check</span>
                <span>Unlimited public projects</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-lg">check</span>
                <span>Basic WebContainer access</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-lg">check</span>
                <span>Community support</span>
              </li>
            </ul>
          </div>

          {/* Pro Plan */}
          <div className="rounded-xl border border-primary dark:border-primary bg-white dark:bg-surface-dark p-8 flex flex-col shadow-lg relative animate-fade-in-up delay-200 scale-105 z-10">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4">
              <span className="inline-flex items-center rounded-full border border-primary bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold shadow-sm">
                Most Popular
              </span>
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Pro</h3>
              <p className="text-sm text-slate-500 mt-2">For serious developers and freelancers.</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-black text-slate-900 dark:text-white">$29</span>
              <span className="text-slate-500">/month</span>
            </div>
            <button className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-4 py-2 mb-8">
              Upgrade to Pro
            </button>
            <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-300 flex-1">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-lg">check</span>
                <span>Everything in Starter</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-lg">check</span>
                <span>Unlimited private projects</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-lg">check</span>
                <span>Advanced Context-Aware AI</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-lg">check</span>
                <span>Priority email support</span>
              </li>
            </ul>
          </div>

          {/* Team Plan */}
          <div className="rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-8 flex flex-col shadow-sm hover:shadow-md transition-shadow animate-fade-in-up delay-300">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Team</h3>
              <p className="text-sm text-slate-500 mt-2">Collaborate and manage organization.</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-black text-slate-900 dark:text-white">$49</span>
              <span className="text-slate-500">/seat/mo</span>
            </div>
            <button className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-slate-200 dark:border-border-dark bg-transparent hover:bg-slate-100 dark:hover:bg-surface-hover text-slate-900 dark:text-white h-10 px-4 py-2 mb-8">
              Contact Sales
            </button>
            <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-300 flex-1">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-lg">check</span>
                <span>Everything in Pro</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-lg">check</span>
                <span>Real-time collaboration tools</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-lg">check</span>
                <span>SSO & Admin Dashboard</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-lg">check</span>
                <span>Dedicated success manager</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
