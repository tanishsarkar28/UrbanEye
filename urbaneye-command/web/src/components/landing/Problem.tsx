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

interface ProblemProps {
  theme?: 'dark' | 'light';
}

export default function Problem({ theme = 'dark' }: ProblemProps) {
  const isDark = theme === 'dark';

  return (
    <section
      className={`border-b px-4 sm:px-6 py-14 sm:py-20 md:py-28 md:px-12 transition-colors duration-300 ${
        isDark ? 'bg-[#0b1b36] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 md:grid-cols-[1fr_1.4fr]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2
              className={`font-display text-3xl font-bold leading-tight md:text-4xl ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
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
                className={`border-t pt-4 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}
              >
                <div
                  className={`font-display text-3xl font-black ${
                    isDark ? 'text-[#2dd4bf]' : 'text-[#0f766e]'
                  }`}
                >
                  {s.value}
                </div>
                <p
                  className={`mt-2 text-sm leading-relaxed ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  {s.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
