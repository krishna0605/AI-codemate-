import Navbar from '@/components/marketing/Navbar';
import Hero from '@/components/marketing/Hero';
import Features from '@/components/marketing/Features';
import AdvancedFeatures from '@/components/marketing/AdvancedFeatures';
import Pricing from '@/components/marketing/Pricing';
import BottomCTA from '@/components/marketing/BottomCTA';
import Footer from '@/components/marketing/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Features />
        <AdvancedFeatures />
        <Pricing />
        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
}
