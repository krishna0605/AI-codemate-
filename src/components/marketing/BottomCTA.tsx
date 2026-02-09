import React from 'react';

const BottomCTA: React.FC = () => {
  return (
    <section className="py-24 px-4">
      <div className="max-w-[960px] mx-auto animate-fade-in-up w-full">
        <div className="rounded-3xl bg-surface-dark border border-border-dark p-10 md:p-16 text-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_rgba(54,226,123,0.15),_transparent_50%)] group-hover:opacity-75 transition-opacity duration-500"></div>
          <div className="relative z-10 flex flex-col items-center gap-6">
            <h2 className="text-white text-3xl md:text-5xl font-black tracking-tight max-w-[700px]">
              Ready to code at the speed of thought?
            </h2>
            <p className="text-[#95c6a9] text-lg max-w-[600px]">
              Join thousands of developers building the future with AI CodeMate. No setup, just
              code.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full justify-center">
              <button className="inline-flex items-center justify-center rounded-md text-base font-bold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-12 px-8">
                Get Started for Free
              </button>
              <button className="inline-flex items-center justify-center rounded-md text-base font-bold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-[#366348] bg-[#254632] text-white hover:bg-[#2f573f] h-12 px-8">
                View Pricing
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BottomCTA;
