import Hero from "./components/landing/Hero.jsx";
import Problem from "./components/landing/Problem.jsx";
import HowItWorks from "./components/landing/HowItWorks.jsx";
import Features from "./components/landing/Features.jsx";
import MapPreview from "./components/landing/MapPreview.jsx";
import Impact from "./components/landing/Impact.jsx";
import Footer from "./components/landing/Footer.jsx";

export default function LandingPage() {
  return (
    <main className="font-body">
      <Hero />
      <Problem />
      <HowItWorks />
      <Features />
      <MapPreview />
      <Impact />
      <Footer />
    </main>
  );
}
