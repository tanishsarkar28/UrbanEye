import { motion } from "framer-motion";

const stats = [
  {
    value: "3,00,000+",
    label: "road accidents reported across India each year, many on defects that went unlogged",
  },
  {
    value: "Weeks",
    label: "typical gap between a pothole forming and a civic body learning about it",
  },
  {
    value: "0",
    label: "dedicated sensors on most municipal fleets today — the data is invisible, not absent",
  },
];

export default function Problem() {
  return (
    <section className="border-b border-line bg-paper px-6 py-28 md:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 md:grid-cols-[1fr_1.4fr]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="font-display text-3xl font-medium leading-tight text-ink md:text-4xl">
              Cities already know where the problems are.
              <br />
              They just find out too late.
            </h2>
          </motion.div>
          <div className="grid gap-8 sm:grid-cols-3">
            {stats.map((s, i) => (
              <motion.div
                key={s.value}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="border-t border-line pt-4"
              >
                <div className="font-display text-3xl text-signal">{s.value}</div>
                <p className="mt-2 text-sm leading-relaxed text-slate">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
