import { motion } from "framer-motion";

const steps = [
  {
    n: "01",
    title: "The bus drives its route",
    body: "A phone mounted as a dashcam runs edge AI locally — no footage leaves the vehicle unless something is detected.",
  },
  {
    n: "02",
    title: "Edge AI spots the defect",
    body: "Potholes, missing dividers, faded crossings, waterlogging, or an accident are recognised in real time, with location and size.",
  },
  {
    n: "03",
    title: "Paired upload",
    body: "The phone pairs to the government portal with a one-time PIN and pushes only the detection — a coordinate, a clip, a class.",
  },
  {
    n: "04",
    title: "It lands on a district desk",
    body: "State → district hierarchy routes each detection to the head responsible for that stretch of road.",
  },
  {
    n: "05",
    title: "Someone acts on it",
    body: "A verified defect becomes a work order. A repaired road quietly drops off the map.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-ink px-6 py-28 text-paper md:px-12">
      <div className="mx-auto max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="font-display mb-16 max-w-xl text-3xl font-medium leading-tight md:text-4xl"
        >
          One route, five handoffs, no manual reporting.
        </motion.h2>

        <div className="flex flex-col">
          {steps.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0.25 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="grid grid-cols-[auto_1fr] gap-6 border-t border-paper/15 py-8 md:grid-cols-[80px_1fr_1.4fr] md:gap-10"
            >
              <span className="font-display text-lg text-signal">{step.n}</span>
              <h3 className="font-display text-xl md:text-2xl">{step.title}</h3>
              <p className="max-w-prose text-paper/65">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
