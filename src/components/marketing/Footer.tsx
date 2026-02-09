import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-border-dark bg-background-light dark:bg-background-dark py-12 px-4">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between gap-10">
        <div className="flex flex-col gap-4 max-w-[300px]">
          <div className="flex items-center gap-3 text-slate-900 dark:text-white">
            <span className="material-symbols-outlined text-primary">terminal</span>
            <span className="font-bold text-xl">AI CodeMate</span>
          </div>
          <p className="text-slate-500 text-sm">
            The next-generation browser-based IDE powered by AI. Design, code, and ship from
            anywhere.
          </p>
          <div className="flex gap-4 mt-2">
            <a className="text-slate-400 hover:text-primary transition-colors" href="#">
              <span className="material-symbols-outlined">code</span>
            </a>
            <a className="text-slate-400 hover:text-primary transition-colors" href="#">
              <span className="material-symbols-outlined">forum</span>
            </a>
            <a className="text-slate-400 hover:text-primary transition-colors" href="#">
              <span className="material-symbols-outlined">alternate_email</span>
            </a>
          </div>
        </div>

        <div className="flex gap-10 md:gap-20 flex-wrap">
          <div className="flex flex-col gap-3">
            <h4 className="text-slate-900 dark:text-white font-bold mb-1">Product</h4>
            <a className="text-slate-500 hover:text-primary text-sm transition-colors" href="#">
              Features
            </a>
            <a
              className="text-slate-500 hover:text-primary text-sm transition-colors"
              href="#pricing"
            >
              Pricing
            </a>
            <a className="text-slate-500 hover:text-primary text-sm transition-colors" href="#">
              Changelog
            </a>
            <a className="text-slate-500 hover:text-primary text-sm transition-colors" href="#">
              Docs
            </a>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-slate-900 dark:text-white font-bold mb-1">Company</h4>
            <a className="text-slate-500 hover:text-primary text-sm transition-colors" href="#">
              About
            </a>
            <a className="text-slate-500 hover:text-primary text-sm transition-colors" href="#">
              Careers
            </a>
            <a className="text-slate-500 hover:text-primary text-sm transition-colors" href="#">
              Blog
            </a>
            <a className="text-slate-500 hover:text-primary text-sm transition-colors" href="#">
              Contact
            </a>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-slate-900 dark:text-white font-bold mb-1">Legal</h4>
            <a className="text-slate-500 hover:text-primary text-sm transition-colors" href="#">
              Privacy
            </a>
            <a className="text-slate-500 hover:text-primary text-sm transition-colors" href="#">
              Terms
            </a>
          </div>
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto mt-12 pt-8 border-t border-slate-200 dark:border-border-dark text-center md:text-left">
        <p className="text-slate-500 text-sm">© 2024 AI CodeMate Inc. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
