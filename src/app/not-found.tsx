'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Blobs */}
      <div
        className="absolute top-[-20%] left-[30%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-pulse"
        style={{ animationDuration: '4s' }}
      />
      <div className="absolute bottom-[-20%] right-[20%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center max-w-md animate-fade-in-up">
        <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-8 ring-1 ring-primary/30 shadow-[0_0_40px_-10px_rgba(54,226,123,0.4)]">
          <span className="material-symbols-outlined text-5xl text-primary">explore_off</span>
        </div>

        <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400 mb-4">
          404
        </h1>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Page Not Found</h2>

        <p className="text-slate-600 dark:text-slate-400 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you
          back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[20px]">home</span>
            Go Home
          </Link>

          <Link
            href="/editor"
            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-surface-hover transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[20px]">code</span>
            Open Editor
          </Link>
        </div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-6 text-xs text-slate-500 dark:text-slate-600">
        © 2024 AI CodeMate Inc.
      </p>
    </div>
  );
}
