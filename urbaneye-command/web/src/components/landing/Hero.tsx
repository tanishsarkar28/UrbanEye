import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface HeroProps {
  onLoginClick?: () => void;
}

export default function Hero({ onLoginClick }: HeroProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const gridOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.15]);
  const gridY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  const container: any = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  };

  const rise: any = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <section
      ref={ref}
      className="relative min-h-[100svh] overflow-hidden flex flex-col justify-between bg-[#081325] text-white"
    >
      {/* Top Floating Navigation Header */}
      <header className="relative z-20 mx-auto w-full max-w-6xl px-6 pt-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden bg-[#1E7F73]/10 border border-[#1E7F73]/30 shadow-sm">
            <img src="/logo.png" alt="UrbanEye" className="w-full h-full object-contain p-1" />
          </div>
          <div>
            <span className="font-display text-lg font-bold tracking-tight text-white">
              UrbanEye
            </span>
            <span className="ml-2 hidden text-[11px] font-semibold sm:inline text-slate-400">
              MoRTH · SIH 2026
            </span>
          </div>
        </div>

        <nav className="flex items-center space-x-4 sm:space-x-6 text-xs">
          <a
            href="#how-it-works"
            className="hidden transition sm:inline font-medium text-slate-300 hover:text-white"
          >
            How it works
          </a>
          <a
            href="#features"
            className="hidden transition md:inline font-medium text-slate-300 hover:text-white"
          >
            Features
          </a>
          <a
            href="#impact"
            className="hidden transition md:inline font-medium text-slate-300 hover:text-white"
          >
            Impact
          </a>

          {/* Officer Login Button */}
          <button
            type="button"
            onClick={onLoginClick}
            className="rounded-full bg-[#1E7F73] hover:bg-[#166c62] px-5 py-2 font-bold text-white shadow-md shadow-[#1E7F73]/25 transition-all hover:shadow-lg hover:shadow-[#1E7F73]/40 flex items-center space-x-1.5"
          >
            <span>Officer Login</span>
            <span>→</span>
          </button>
        </nav>
      </header>

      {/* Detection grid background */}
      <motion.div
        style={{ opacity: gridOpacity, y: gridY }}
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        <svg className="h-full w-full" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="hero-grid" width="56" height="56" patternUnits="userSpaceOnUse">
              <path
                d="M 56 0 L 0 0 0 56"
                fill="none"
                stroke="#1E7F73"
                strokeOpacity={0.22}
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
          {[
            [12, 22], [38, 61], [67, 34], [81, 74], [23, 83], [54, 15], [92, 48],
          ].map(([cx, cy], i) => (
            <motion.circle
              key={i}
              cx={`${cx}%`}
              cy={`${cy}%`}
              r={4.5}
              fill="#D98E04"
              initial={{ opacity: 0.2, scale: 0.8 }}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.4, 0.8] }}
              transition={{ duration: 3.2, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
            />
          ))}
        </svg>
      </motion.div>

      {/* Hero Content */}
      <motion.div
        style={{ y: contentY }}
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto flex w-full max-w-6xl flex-col justify-center px-6 py-20 md:px-12 my-auto"
      >
        <motion.p
          variants={rise}
          className="mb-4 text-xs sm:text-sm font-semibold tracking-wide flex items-center space-x-2 px-3 py-1 rounded-full w-fit bg-[#1E7F73]/20 border border-[#1E7F73]/40 text-[#2dd4bf]"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-[#1E7F73] animate-ping" />
          <span>Bharat Electronics Limited · Smart India Hackathon</span>
        </motion.p>

        <motion.h1
          variants={rise}
          className="font-display max-w-3xl text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl text-white"
        >
          Every bus, a sensor.
          <br />
          Every road, watched.
        </motion.h1>

        <motion.p
          variants={rise}
          className="mt-6 max-w-prose text-lg md:text-xl leading-relaxed text-slate-300"
        >
          UrbanEye turns an ordinary public-transport fleet into a live map of
          potholes, congestion, and road defects — no new hardware, no manual
          reporting.
        </motion.p>

        <motion.div variants={rise} className="mt-10 flex flex-wrap items-center gap-4 sm:gap-6">
          <a
            href="#how-it-works"
            className="rounded-full bg-[#1E7F73] hover:bg-[#166c62] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-[#1E7F73]/30 transition-all hover:shadow-xl hover:shadow-[#1E7F73]/40 hover:-translate-y-0.5"
          >
            See how it works
          </a>
          <span
            className="text-sm font-medium text-slate-400"
          >
            Scroll to explore ↓
          </span>
        </motion.div>
      </motion.div>

      {/* Subtle bottom spacing */}
      <div className="h-6" />
    </section>
  );
}
