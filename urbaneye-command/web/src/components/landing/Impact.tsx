import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";

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
      className={`border-b px-6 py-28 md:px-12 transition-colors duration-300 ${
        isDark ? 'bg-[#0b1b36] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      <div className="mx-auto max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={`font-display mb-16 max-w-xl text-3xl font-bold leading-tight md:text-4xl ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          Built to scale with the fleet, not replace it.
        </motion.h2>

        <div className="grid gap-10 sm:grid-cols-3">
          <div className={`border-t pt-4 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <div
              className={`font-display text-4xl font-extrabold ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              <Counter to={3} suffix=" states" />
            </div>
            <p className={`mt-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              onboarded in the pilot phase, Punjab first
            </p>
          </div>

          <div className={`border-t pt-4 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <div
              className={`font-display text-4xl font-extrabold ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              <Counter to={0} />
            </div>
            <p className={`mt-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              new hardware required per bus — the phone is the sensor
            </p>
          </div>

          <div className={`border-t pt-4 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <div
              className={`font-display text-4xl font-extrabold ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              <Counter to={100} suffix="%" />
            </div>
            <p className={`mt-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              of detections traceable to a specific bus and timestamp
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
