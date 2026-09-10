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
  const gridY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  const container: any = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  };

  const rise: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <section
      ref={ref}
      className="relative min-h-[100svh] overflow-hidden flex flex-col justify-between bg-[#081325] text-white pt-safe"
    >
      {/* Top Floating Navigation Header */}
      <header className="relative z-20 mx-auto w-full max-w-6xl px-4 sm:px-6 pt-4 sm:pt-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden bg-[#1E7F73]/10 border border-[#1E7F73]/30 shadow-sm shrink-0">
            <img src="/logo.png" alt="UrbanEye" className="w-full h-full object-contain p-1" />
          </div>
          <div>
            <span className="font-display text-base sm:text-lg font-bold tracking-tight text-white">
              UrbanEye
            </span>
            <span className="ml-2 hidden text-[11px] font-semibold sm:inline text-slate-400">
              MoRTH · SIH 2026
            </span>
          </div>
        </div>

        <nav className="flex items-center space-x-3 sm:space-x-6 text-xs">
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

          {/* Officer Login Button (min 44px touch target) */}
          <button
            type="button"
            onClick={onLoginClick}
            className="rounded-full bg-[#1E7F73] hover:bg-[#166c62] px-4 sm:px-5 py-2.5 font-bold text-xs sm:text-sm text-white shadow-md shadow-[#1E7F73]/25 transition-all hover:shadow-lg hover:shadow-[#1E7F73]/40 flex items-center space-x-1.5 min-h-[44px] active:scale-95"
            aria-label="Officer Login"
          >
            <span>Officer Login</span>
            <span>→</span>
          </button>
        </nav>
      </header>

      {/* Detection grid background - optimized for mobile GPU */}
      <motion.div
        style={{ opacity: gridOpacity, y: gridY }}
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        <svg className="h-full w-full" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="hero-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path
                d="M 48 0 L 0 0 0 48"
                fill="none"
                stroke="#1E7F73"
                strokeOpacity={0.18}
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
          {[
            [15, 25], [38, 55], [67, 34], [81, 70], [25, 80], [75, 18],
          ].map(([cx, cy], i) => (
            <circle
              key={i}
              cx={`${cx}%`}
              cy={`${cy}%`}
              r={4}
              fill="#D98E04"
              opacity={0.65}
            />
          ))}
        </svg>
      </motion.div>

      {/* Hero Content with proportionate responsive typography */}
      <motion.div
        style={{ y: contentY }}
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto flex w-full max-w-6xl flex-col justify-center px-4 sm:px-6 py-12 sm:py-16 md:px-12 my-auto"
      >
        <motion.p
          variants={rise}
          className="mb-3 sm:mb-4 text-xs sm:text-sm font-semibold tracking-wide flex items-center space-x-2 px-3 py-1.5 rounded-full w-fit bg-[#1E7F73]/20 border border-[#1E7F73]/40 text-[#2dd4bf]"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-[#1E7F73] animate-ping" />
          <span>Bharat Electronics Limited · Smart India Hackathon</span>
        </motion.p>

        <motion.h1
          variants={rise}
          className="font-display max-w-3xl text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-white"
        >
          Every bus, a sensor.
          <br className="hidden sm:inline" />{' '}
          Every road, watched.
        </motion.h1>

        <motion.p
          variants={rise}
          className="mt-4 sm:mt-6 max-w-prose text-base sm:text-lg md:text-xl leading-relaxed text-slate-300"
        >
          UrbanEye turns an ordinary public-transport fleet into a live map of
          potholes, road distress, and traffic flow — no new hardware, no manual
          reporting.
        </motion.p>

        <motion.div variants={rise} className="mt-8 sm:mt-10 flex flex-wrap items-center gap-3 sm:gap-6">
          <a
            href="#how-it-works"
            className="rounded-full bg-[#1E7F73] hover:bg-[#166c62] px-6 sm:px-7 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-[#1E7F73]/30 transition-all hover:shadow-xl hover:shadow-[#1E7F73]/40 min-h-[44px] flex items-center justify-center active:scale-95"
          >
            See how it works
          </a>
          <span className="text-xs sm:text-sm font-medium text-slate-400">
            Scroll to explore ↓
          </span>
        </motion.div>
      </motion.div>

      <div className="h-4 sm:h-6" />
    </section>
  );
}
