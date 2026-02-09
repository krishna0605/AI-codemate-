import React from 'react';

const Features: React.FC = () => {
  return (
    <>
      <section className="py-12 bg-white dark:bg-[#0c1410] border-y border-slate-100 dark:border-border-dark">
        <div className="flex justify-center w-full px-4 md:px-10 lg:px-40 animate-fade-in-up delay-300">
          <div className="flex flex-col max-w-[800px] text-center">
            <h2 className="text-slate-900 dark:text-white tracking-tight text-3xl md:text-4xl font-bold leading-tight pb-4">
              Intelligence Meets Execution
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Traditional cloud environments are slow. Local setups are tedious. AI CodeMate bridges
              the gap by running Node.js directly in your browser, augmented by a context-aware AI
              that understands your entire project structure.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24" id="features">
        <div className="flex flex-col items-center px-4 md:px-10 lg:px-40 w-full">
          <div className="max-w-[1200px] w-full">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 animate-fade-in-up">
              <div className="max-w-[600px]">
                <h2 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black tracking-tight mb-4">
                  Core Technologies
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-lg">
                  Leveraging cutting-edge tech to deliver a seamless coding experience.
                </p>
              </div>
              <a
                className="text-primary font-bold hover:underline flex items-center gap-1 transition-transform hover:translate-x-1"
                href="#advanced-features"
              >
                See technical deep dive{' '}
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(280px,auto)]">
              {/* Feature 1 - Large */}
              <div className="md:col-span-2 rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-8 flex flex-col relative overflow-hidden group hover:shadow-xl hover:border-primary/50 transition-all duration-300 animate-fade-in-up delay-100">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                  <span className="material-symbols-outlined text-[120px] text-primary">
                    terminal
                  </span>
                </div>
                <div className="z-10 mt-auto">
                  <div className="size-10 rounded-md bg-primary/10 flex items-center justify-center mb-4 text-primary">
                    <span className="material-symbols-outlined text-xl">rocket_launch</span>
                  </div>
                  <h3 className="text-slate-900 dark:text-white text-2xl font-bold mb-2">
                    Browser-Native Execution
                  </h3>
                  <p className="text-slate-600 dark:text-[#95c6a9] text-base leading-relaxed max-w-lg">
                    Run full-stack Node.js environments directly in your browser tab via
                    WebAssembly. Achieve native performance with zero server-side latency and
                    enterprise-grade security.
                  </p>
                </div>
              </div>

              {/* Feature 2 - Small */}
              <div className="md:col-span-1 rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-8 flex flex-col relative overflow-hidden hover:shadow-xl hover:border-primary/50 transition-all duration-300 animate-fade-in-up delay-200">
                <div className="z-10">
                  <div className="size-10 rounded-md bg-primary/10 flex items-center justify-center mb-4 text-primary">
                    <span className="material-symbols-outlined text-xl">psychology</span>
                  </div>
                  <h3 className="text-slate-900 dark:text-white text-xl font-bold mb-2">
                    Context-Aware AI
                  </h3>
                  <p className="text-slate-600 dark:text-[#95c6a9] text-sm leading-relaxed">
                    Our local RAG pipeline indexes your entire file tree. The AI understands
                    imports, types, and project structure for hyper-relevant code generation.
                  </p>
                </div>
              </div>

              {/* Feature 3 - Small */}
              <div className="md:col-span-1 rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-8 flex flex-col relative overflow-hidden hover:shadow-xl hover:border-primary/50 transition-all duration-300 animate-fade-in-up delay-300">
                <div className="z-10">
                  <div className="size-10 rounded-md bg-primary/10 flex items-center justify-center mb-4 text-primary">
                    <span className="material-symbols-outlined text-xl">edit_note</span>
                  </div>
                  <h3 className="text-slate-900 dark:text-white text-xl font-bold mb-2">
                    Semantic Editing
                  </h3>
                  <p className="text-slate-600 dark:text-[#95c6a9] text-sm leading-relaxed">
                    Edit code based on intent and meaning using natural language commands, not just
                    syntax matching or simple find-and-replace.
                  </p>
                </div>
              </div>

              {/* Feature 4 - Large */}
              <div className="md:col-span-2 rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group hover:shadow-xl hover:border-primary/50 transition-all duration-300 animate-fade-in-up delay-300">
                <div className="flex-1 z-10">
                  <div className="size-10 rounded-md bg-primary/10 flex items-center justify-center mb-4 text-primary">
                    <span className="material-symbols-outlined text-xl">group_add</span>
                  </div>
                  <h3 className="text-slate-900 dark:text-white text-2xl font-bold mb-2">
                    Real-time Collaboration
                  </h3>
                  <p className="text-slate-600 dark:text-[#95c6a9] text-base leading-relaxed">
                    Pair program with your team or your AI assistant instantly. Share a URL and
                    you&apos;re coding together in seconds with low-latency sync.
                  </p>
                </div>
                <div className="w-full md:w-1/2 h-40 bg-slate-100 dark:bg-[#122118] rounded-xl border border-slate-200 dark:border-border-dark flex items-center justify-center relative overflow-hidden">
                  <div
                    className="absolute top-10 left-10 flex flex-col gap-1 animate-bounce"
                    style={{ animationDuration: '2s' }}
                  >
                    <span className="material-symbols-outlined text-[#ff5f56] text-lg rotate-[-15deg]">
                      near_me
                    </span>
                    <span className="bg-[#ff5f56] text-white text-[10px] px-1.5 py-0.5 rounded-md">
                      Sarah
                    </span>
                  </div>
                  <div
                    className="absolute bottom-10 right-14 flex flex-col gap-1 animate-bounce"
                    style={{ animationDuration: '2.5s' }}
                  >
                    <span className="material-symbols-outlined text-primary text-lg rotate-[-15deg]">
                      near_me
                    </span>
                    <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-md font-bold">
                      AI
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Features;
