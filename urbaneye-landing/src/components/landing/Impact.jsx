import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";

function Counter({ to, suffix = "" }) {
  const ref = useRef(null);
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

export default function Impact() {
  return (
    <section className="border-b border-line bg-paper px-6 py-28 md:px-12">
      <div className="mx-auto max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="font-display mb-16 max-w-xl text-3xl font-medium leading-tight text-ink md:text-4xl"
        >
          Built to scale with the fleet, not replace it.
        </motion.h2>

        <div className="grid gap-10 sm:grid-cols-3">
          <div className="border-t border-line pt-4">
            <div className="font-display text-4xl text-ink">
              <Counter to={2} suffix=" states" />
            </div>
            <p className="mt-2 text-sm text-slate">onboarded in the pilot phase, Punjab first</p>
          </div>
          <div className="border-t border-line pt-4">
            <div className="font-display text-4xl text-ink">
              <Counter to={0} />
            </div>
            <p className="mt-2 text-sm text-slate">new hardware required per bus — the phone is the sensor</p>
          </div>
          <div className="border-t border-line pt-4">
            <div className="font-display text-4xl text-ink">
              <Counter to={100} suffix="%" />
            </div>
            <p className="mt-2 text-sm text-slate">of detections traceable to a specific bus and timestamp</p>
          </div>
        </div>
      </div>
    </section>
  );
}
