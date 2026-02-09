import React from 'react';

const AdvancedFeatures: React.FC = () => {
  return (
    <section
      className="py-24 bg-slate-50 dark:bg-[#0c1410] border-y border-slate-200 dark:border-border-dark relative overflow-hidden"
      id="advanced-features"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full px-4 md:px-10 lg:px-40 relative z-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="flex flex-col gap-10 animate-fade-in-up">
              <div>
                <h2 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black tracking-tight mb-4">
                  The Power of Local Computing
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                  Unlike cloud-based IDEs that suffer from latency, AI CodeMate leverages your
                  device&apos;s power. By moving the compute edge to the browser, we deliver an
                  experience that feels instantaneous.
                </p>
              </div>

              <div className="space-y-8">
                {[
                  {
                    icon: 'memory',
                    title: 'Zero-Latency Editing',
                    desc: 'Type, lint, and format instantly. All heavy lifting happens in a dedicated WebWorker, ensuring the UI thread remains buttery smooth at 60fps.',
                  },
                  {
                    icon: 'security',
                    title: 'Sandboxed Security',
                    desc: "Code execution is isolated within the browser's security model. Run untrusted code safely without risking your local file system or network integrity.",
                  },
                  {
                    icon: 'offline_bolt',
                    title: 'Offline Capability',
                    desc: 'Internet down? Keep coding. AI CodeMate caches your environment and enables full offline editing, syncing changes to the cloud only once you reconnect.',
                  },
                ].map((item, index) => (
                  <div key={index} className="flex gap-5 group">
                    <div className="mt-1 flex-shrink-0 size-10 rounded-md bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark flex items-center justify-center text-primary shadow-sm group-hover:border-primary transition-colors">
                      <span className="material-symbols-outlined text-xl">{item.icon}</span>
                    </div>
                    <div>
                      <h4 className="text-slate-900 dark:text-white text-xl font-bold mb-2">
                        {item.title}
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - System Status Visual */}
            <div className="relative animate-fade-in-up delay-200">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-emerald-500 rounded-xl blur opacity-20 dark:opacity-40"></div>
              <div className="relative rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark p-8 shadow-xl">
                <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-border-dark pb-4">
                  <h3 className="font-bold text-slate-900 dark:text-white">System Status</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    <span className="size-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
                    Connected
                  </span>
                </div>

                <div className="space-y-4 font-mono text-sm">
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span>WebContainer Runtime</span>
                    <span className="text-primary">Active</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-black/30 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-primary h-1.5 rounded-full animate-[pulse_2s_infinite]"
                      style={{ width: '100%' }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 pt-2">
                    <span>Local AI Model (Quantized)</span>
                    <span className="text-primary">Loaded (1.2GB)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-black/30 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: '85%' }}></div>
                  </div>

                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 pt-2">
                    <span>File System Sync</span>
                    <span className="text-emerald-400">Up to date</span>
                  </div>
                </div>

                <div className="mt-8 p-4 rounded-lg bg-slate-50 dark:bg-[#112117] border border-slate-100 dark:border-[#254632]">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-xl mt-0.5">
                      smart_toy
                    </span>
                    <div>
                      <p className="text-slate-800 dark:text-slate-200 text-sm font-semibold mb-1">
                        AI Insight
                      </p>
                      <p className="text-slate-600 dark:text-slate-400 text-xs">
                        I&apos;ve detected a heavy computation loop in <code>worker.ts</code>. Would
                        you like me to move it to a dedicated WebWorker?
                      </p>
                      <div className="flex gap-2 mt-3">
                        <button className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-7 px-3">
                          Fix it
                        </button>
                        <button className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-slate-200 dark:border-border-dark bg-transparent hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-900 dark:text-white h-7 px-3">
                          Ignore
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdvancedFeatures;
