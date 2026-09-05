import { motion } from "framer-motion";

const features = [
  {
    title: "Road defect detection",
    body: "Potholes, cracks, missing dividers, faded zebra crossings, and damaged signboards, classified by type and severity as the bus passes.",
  },
  {
    title: "Traffic density heatmap",
    body: "Congestion inferred from fleet speed and dwell time, aggregated into a live heatmap without any external sensors.",
  },
  {
    title: "Accident capture",
    body: "A short clip and number-plate extraction are triggered automatically around a detected collision or hit-and-run.",
  },
  {
    title: "State → district routing",
    body: "Every detection resolves to a district head's queue, so accountability sits with the person who can act on it.",
  },
];

export default function Features() {
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
          What the fleet sees, the dashboard knows.
        </motion.h2>

        <div className="divide-y divide-line border-y border-line">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="grid gap-3 py-10 md:grid-cols-[1fr_1.6fr] md:gap-12"
            >
              <h3 className="font-display text-xl text-ink md:text-2xl">{f.title}</h3>
              <p className="max-w-prose text-slate">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
