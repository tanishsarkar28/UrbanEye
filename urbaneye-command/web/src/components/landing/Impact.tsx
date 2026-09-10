import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Map, Smartphone, CheckCheck } from "lucide-react";

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.8 });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: 1600, bounce: 0 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (inView) motionValue.set(to);
  }, [inView, to, motionValue]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => setDisplay(Math.round(v)));
    return unsub;
  }, [spring]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

interface ImpactProps {
  theme?: 'dark' | 'light';
}

export default function Impact({ theme = 'dark' }: ImpactProps) {
  const isDark = theme === 'dark';

  return (
    <section
      id="impact"
      className={`border-b px-4 sm:px-6 py-14 sm:py-20 md:py-28 md:px-12 transition-colors duration-300 relative overflow-hidden ${
        isDark ? 'bg-[#0b1b36] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#1E7F73]/10 blur-[140px] rounded-full pointer-events-none" aria-hidden="true" />

      <div className="mx-auto max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 sm:mb-16"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-[#2dd4bf] mb-2 block">
            ● Proven Scalability
          </span>
          <h2
            className={`font-display max-w-xl text-3xl font-bold leading-tight md:text-4xl ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Built to scale with the fleet, not replace it.
          </h2>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`relative overflow-hidden rounded-2xl p-6 border transition-all duration-300 ${
              isDark
                ? 'bg-slate-900/50 border-slate-800 hover:border-[#1E7F73]/50 hover:shadow-xl hover:shadow-[#1E7F73]/10 backdrop-blur-md'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:shadow-lg backdrop-blur-md'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
                Metric 01
              </span>
              <div className="p-2.5 rounded-xl border bg-[#1E7F73]/15 border-[#1E7F73]/30 text-[#2dd4bf] shrink-0">
                <Map className="w-4 h-4" />
              </div>
            </div>
            <div
              className={`font-display text-3xl sm:text-4xl font-extrabold mb-2 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              <Counter to={3} suffix=" states" />
            </div>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Onboarded in the pilot phase, Punjab leading the national rollout.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`relative overflow-hidden rounded-2xl p-6 border transition-all duration-300 ${
              isDark
                ? 'bg-slate-900/50 border-slate-800 hover:border-[#1E7F73]/50 hover:shadow-xl hover:shadow-[#1E7F73]/10 backdrop-blur-md'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:shadow-lg backdrop-blur-md'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
                Metric 02
              </span>
              <div className="p-2.5 rounded-xl border bg-cyan-500/10 border-cyan-500/20 text-cyan-400 shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
            </div>
            <div
              className={`font-display text-3xl sm:text-4xl font-extrabold mb-2 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              <Counter to={0} />
            </div>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              New hardware required per bus — standard smartphones run edge inference.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`relative overflow-hidden rounded-2xl p-6 border transition-all duration-300 ${
              isDark
                ? 'bg-slate-900/50 border-slate-800 hover:border-[#1E7F73]/50 hover:shadow-xl hover:shadow-[#1E7F73]/10 backdrop-blur-md'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:shadow-lg backdrop-blur-md'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
                Metric 03
              </span>
              <div className="p-2.5 rounded-xl border bg-[#2dd4bf]/15 border-[#2dd4bf]/30 text-[#2dd4bf] shrink-0">
                <CheckCheck className="w-4 h-4" />
              </div>
            </div>
            <div
              className={`font-display text-3xl sm:text-4xl font-extrabold mb-2 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              <Counter to={100} suffix="%" />
            </div>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Of detections fully traceable to a specific bus, GPS coordinate, and timestamp.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
