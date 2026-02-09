'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const themes = [
  {
    id: 'vscode',
    name: 'VS Dark',
    colors: {
      bg: '#1e1e1e',
      header: '#252526',
      text: '#d4d4d4',
      keyword: '#569cd6',
      function: '#dcdcaa',
      string: '#ce9178',
      variable: '#9cdcfe',
      comment: '#6a9955',
      tag: '#569cd6',
      attr: '#9cdcfe',
      attrValue: '#ce9178',
      number: '#b5cea8',
      border: '#333333',
    },
  },
  {
    id: 'dracula',
    name: 'Dracula',
    colors: {
      bg: '#282a36',
      header: '#21222c',
      text: '#f8f8f2',
      keyword: '#ff79c6',
      function: '#50fa7b',
      string: '#f1fa8c',
      variable: '#f8f8f2',
      comment: '#6272a4',
      tag: '#ff79c6',
      attr: '#50fa7b',
      attrValue: '#f1fa8c',
      number: '#bd93f9',
      border: '#44475a',
    },
  },
  {
    id: 'monokai',
    name: 'Monokai',
    colors: {
      bg: '#272822',
      header: '#1e1f1c',
      text: '#f8f8f2',
      keyword: '#f92672',
      function: '#a6e22e',
      string: '#e6db74',
      variable: '#f8f8f2',
      comment: '#75715e',
      tag: '#f92672',
      attr: '#a6e22e',
      attrValue: '#e6db74',
      number: '#ae81ff',
      border: '#3e3d32',
    },
  },
  {
    id: 'solarized',
    name: 'Solarized',
    colors: {
      bg: '#002b36',
      header: '#073642',
      text: '#839496',
      keyword: '#859900',
      function: '#268bd2',
      string: '#2aa198',
      variable: '#839496',
      comment: '#586e75',
      tag: '#268bd2',
      attr: '#93a1a1',
      attrValue: '#2aa198',
      number: '#d33682',
      border: '#073642',
    },
  },
];

const Hero: React.FC = () => {
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
  const theme = themes[currentThemeIndex];

  const cycleTheme = () => {
    setCurrentThemeIndex((prev) => (prev + 1) % themes.length);
  };

  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden pt-10 pb-16 md:py-24">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] animate-blob mix-blend-multiply dark:mix-blend-screen"></div>
        <div
          className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] animate-blob mix-blend-multiply dark:mix-blend-screen"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] animate-blob mix-blend-multiply dark:mix-blend-screen"
          style={{ animationDelay: '4s' }}
        ></div>
      </div>

      <div className="flex h-full grow flex-col w-full max-w-[1200px] px-4 md:px-10 lg:px-40 relative z-10">
        <div className="@container">
          <div className="flex flex-col-reverse gap-10 lg:flex-row items-center justify-between">
            {/* Left Content */}
            <div className="flex flex-col gap-6 flex-1 text-center lg:text-left z-10 max-w-[600px] animate-fade-in-up">
              <div className="flex flex-col gap-4">
                <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary transition-colors focus:outline-none w-fit mx-auto lg:mx-0">
                  Now in Public Beta
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-slate-900 dark:text-white">
                  Browser-Native.
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
                    AI-Augmented.
                  </span>
                  <br />
                  Build Instantly.
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-[540px] mx-auto lg:mx-0">
                  Experience a zero-setup development environment powered by WebContainers and
                  intelligent context-aware AI. Code at the speed of thought.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-md text-base font-bold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow-md hover:bg-primary/90 h-11 px-8 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20 duration-300"
                >
                  Start Coding Free
                </Link>
                <button className="inline-flex items-center justify-center rounded-md text-base font-bold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-slate-200 dark:border-border-dark bg-transparent shadow-sm hover:bg-slate-50 dark:hover:bg-white/5 text-slate-900 dark:text-white h-11 px-8 hover:border-slate-300 dark:hover:border-slate-600">
                  <span className="material-symbols-outlined mr-2 text-sm">menu_book</span>
                  Documentation
                </button>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-6 text-sm text-slate-500 dark:text-slate-400 pt-4">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-primary">
                    check_circle
                  </span>
                  <span>No setup required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-primary">bolt</span>
                  <span>Instant boot</span>
                </div>
              </div>
            </div>

            {/* Right Content - IDE Visual */}
            <div className="flex-1 w-full max-w-[600px] z-10 animate-fade-in-up delay-200 animate-float">
              <div
                className="relative rounded-xl overflow-hidden shadow-2xl transition-colors duration-300 border"
                style={{ backgroundColor: theme.colors.bg, borderColor: theme.colors.border }}
              >
                <div
                  className="flex items-center justify-between px-4 py-3 border-b transition-colors duration-300"
                  style={{ backgroundColor: theme.colors.header, borderColor: theme.colors.border }}
                >
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                  </div>
                  <div
                    className="text-xs font-mono opacity-60 flex items-center gap-2"
                    style={{ color: theme.colors.text }}
                  >
                    <span>main.tsx</span>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={cycleTheme}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                      title="Switch Theme"
                    >
                      <span
                        className="material-symbols-outlined text-[14px]"
                        style={{ color: theme.colors.text }}
                      >
                        palette
                      </span>
                      <span
                        className="text-[10px] font-medium"
                        style={{ color: theme.colors.text }}
                      >
                        {theme.name}
                      </span>
                    </button>
                  </div>
                </div>
                <div
                  className="p-6 font-mono text-sm leading-6 overflow-hidden relative min-h-[300px] transition-colors duration-300"
                  style={{ color: theme.colors.text }}
                >
                  <div className="absolute right-6 top-6">
                    <span
                      className="material-symbols-outlined text-primary animate-spin-slow"
                      style={{ animationDuration: '3s' }}
                    >
                      auto_awesome
                    </span>
                  </div>
                  <span style={{ color: theme.colors.keyword }}>import</span>{' '}
                  <span style={{ color: theme.colors.function }}>{`{ useState }`}</span>{' '}
                  <span style={{ color: theme.colors.keyword }}>from</span>{' '}
                  <span style={{ color: theme.colors.string }}>&apos;react&apos;</span>;<br />
                  <span style={{ color: theme.colors.keyword }}>import</span>{' '}
                  <span style={{ color: theme.colors.function }}>{`{ WebContainer }`}</span>{' '}
                  <span style={{ color: theme.colors.keyword }}>from</span>{' '}
                  <span style={{ color: theme.colors.string }}>&apos;@webcontainer/api&apos;</span>;
                  <br />
                  <br />
                  <span style={{ color: theme.colors.keyword }}>export default function</span>{' '}
                  <span style={{ color: theme.colors.function }}>App</span>() {'{'}
                  <br />
                  &nbsp;&nbsp;<span style={{ color: theme.colors.keyword }}>const</span> [
                  <span style={{ color: theme.colors.variable }}>booting</span>,{' '}
                  <span style={{ color: theme.colors.variable }}>setBooting</span>] ={' '}
                  <span style={{ color: theme.colors.function }}>useState</span>(
                  <span style={{ color: theme.colors.keyword }}>true</span>);
                  <br />
                  <br />
                  &nbsp;&nbsp;
                  <span
                    style={{ color: theme.colors.comment }}
                  >{`// AI Suggestion: Optimize boot sequence`}</span>
                  <br />
                  &nbsp;&nbsp;
                  <div className="inline-block bg-primary/10 border-l-2 border-primary pl-2 pr-1 py-0.5 rounded-r my-1 w-full animate-pulse">
                    <span className="text-primary text-xs font-bold block mb-1">
                      AI CodeMate Suggestion
                    </span>
                    <span style={{ color: theme.colors.function }}>useEffect(() =&gt; {'{'}</span>
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <span style={{ color: theme.colors.variable }}>
                      WebContainer.boot().then(() =&gt; setBooting(false));
                    </span>
                    <br />
                    &nbsp;&nbsp;<span style={{ color: theme.colors.function }}>{'}'}, []);</span>
                  </div>
                  <br />
                  &nbsp;&nbsp;<span style={{ color: theme.colors.keyword }}>return</span> (<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&lt;<span style={{ color: theme.colors.tag }}>
                    div
                  </span>{' '}
                  <span style={{ color: theme.colors.attr }}>className</span>=
                  <span style={{ color: theme.colors.attrValue }}>&quot;ide-container&quot;</span>
                  &gt;
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{'{'}
                  <span style={{ color: theme.colors.variable }}>booting</span> ? &lt;
                  <span style={{ color: theme.colors.tag }}>Loader</span> /&gt; : &lt;
                  <span style={{ color: theme.colors.tag }}>Editor</span> /&gt;{'}'}
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&lt;/<span style={{ color: theme.colors.tag }}>div</span>
                  &gt;
                  <br />
                  &nbsp;&nbsp;);
                  <br />
                  {'}'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
