import React from 'react';
import Hero from '../components/landing/Hero';
import Problem from '../components/landing/Problem';
import HowItWorks from '../components/landing/HowItWorks';
import Features from '../components/landing/Features';
import MapPreview from '../components/landing/MapPreview';
import Impact from '../components/landing/Impact';
import Footer from '../components/landing/Footer';

interface LandingPageProps {
  onLoginClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
  return (
    <main className="font-body bg-paper text-ink selection:bg-signal selection:text-paper min-h-screen">
      <Hero onLoginClick={onLoginClick} />
      <Problem />
      <HowItWorks />
      <Features />
      <MapPreview />
      <Impact />
      <Footer onLoginClick={onLoginClick} />
    </main>
  );
};

export default LandingPage;
