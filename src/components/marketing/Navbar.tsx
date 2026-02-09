'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check initial theme state
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-solid border-slate-200 dark:border-border-dark bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md transition-colors duration-300">
      <div className="flex flex-col w-full">
        <div className="px-4 md:px-10 lg:px-40 flex justify-center py-3">
          <div className="flex flex-1 items-center justify-between max-w-[1200px] w-full">
            {/* Logo Area */}
            <div className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
              <div className="size-8 text-primary flex items-center justify-center bg-primary/10 rounded-md">
                <span className="material-symbols-outlined !text-[24px]">terminal</span>
              </div>
              <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">
                AI CodeMate
              </h2>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex flex-1 justify-end gap-8 items-center">
              <nav className="flex items-center gap-6">
                <a
                  className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors"
                  href="#features"
                >
                  Features
                </a>
                <a
                  className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors"
                  href="#pricing"
                >
                  Pricing
                </a>
                <a
                  className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors"
                  href="#docs"
                >
                  Docs
                </a>
              </nav>

              <div className="flex items-center gap-4">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  aria-label="Toggle theme"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {isDark ? 'light_mode' : 'dark_mode'}
                  </span>
                </button>

                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                >
                  Get Started
                </Link>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="md:hidden flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors focus-visible:outline-none"
                aria-label="Toggle theme"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {isDark ? 'light_mode' : 'dark_mode'}
                </span>
              </button>

              {/* Mobile Menu Toggle */}
              <button
                className="text-slate-900 dark:text-white"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                <span className="material-symbols-outlined">{isMenuOpen ? 'close' : 'menu'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-border-dark bg-background-light dark:bg-background-dark p-4">
            <nav className="flex flex-col space-y-4">
              <a
                className="text-slate-600 dark:text-slate-300 hover:text-primary font-medium"
                href="#features"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </a>
              <a
                className="text-slate-600 dark:text-slate-300 hover:text-primary font-medium"
                href="#pricing"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </a>
              <a
                className="text-slate-600 dark:text-slate-300 hover:text-primary font-medium"
                href="#docs"
                onClick={() => setIsMenuOpen(false)}
              >
                Docs
              </a>
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-4 py-2"
              >
                Get Started
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
