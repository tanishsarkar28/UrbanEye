import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const gridOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.15]);
  const gridY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  };

  const rise = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[640px] overflow-hidden bg-ink text-paper">
      {/* Detection grid background — the one orchestrated ambient motion on the page */}
      <motion.div
        style={{ opacity: gridOpacity, y: gridY }}
        className="absolute inset-0"
        aria-hidden="true"
      >
        <svg className="h-full w-full" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="grid" width="56" height="56" patternUnits="userSpaceOnUse">
              <path d="M 56 0 L 0 0 0 56" fill="none" stroke="#1E7F73" strokeOpacity="0.18" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {[
            [12, 22], [38, 61], [67, 34], [81, 74], [23, 83], [54, 15], [92, 48],
          ].map(([cx, cy], i) => (
            <motion.circle
              key={i}
              cx={`${cx}%`}
              cy={`${cy}%`}
              r={4}
              fill="#D98E04"
              initial={{ opacity: 0.2, scale: 0.8 }}
              animate={{ opacity: [0.2, 0.9, 0.2], scale: [0.8, 1.3, 0.8] }}
              transition={{ duration: 3.2, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
            />
          ))}
        </svg>
      </motion.div>

      <motion.div
        style={{ y: contentY }}
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-center px-6 md:px-12"
      >
        <motion.p variants={rise} className="mb-4 text-sm text-signal">
          Bharat Electronics Limited · Smart India Hackathon
        </motion.p>
        <motion.h1
          variants={rise}
          className="font-display max-w-3xl text-5xl font-medium leading-[1.05] tracking-tight md:text-7xl"
        >
          Every bus, a sensor.
          <br />
          Every road, watched.
        </motion.h1>
        <motion.p variants={rise} className="mt-6 max-w-prose text-lg text-paper/70 md:text-xl">
          UrbanEye turns an ordinary public-transport fleet into a live map of
          potholes, congestion, and accidents — no new hardware, no manual
          reporting.
        </motion.p>
        <motion.div variants={rise} className="mt-10 flex items-center gap-6">
          <a
            href="#how-it-works"
            className="rounded-full bg-signal px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-signal/90"
          >
            See how it works
          </a>
          <span className="text-sm text-paper/50">Scroll to explore ↓</span>
        </motion.div>
      </motion.div>
    </section>
  );
}
