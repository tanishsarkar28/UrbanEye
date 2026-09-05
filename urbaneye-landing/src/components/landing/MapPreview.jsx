import { motion } from "framer-motion";

const markers = [
  { x: 22, y: 30, type: "pothole" },
  { x: 48, y: 18, type: "congestion" },
  { x: 65, y: 42, type: "pothole" },
  { x: 35, y: 58, type: "accident" },
  { x: 78, y: 65, type: "pothole" },
  { x: 58, y: 75, type: "congestion" },
];

const colorFor = {
  pothole: "#D98E04",
  congestion: "#1E7F73",
  accident: "#B3261E",
};

export default function MapPreview() {
  return (
    <section className="bg-paper px-6 py-28 md:px-12">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1fr_1.2fr] md:items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="font-display text-3xl font-medium leading-tight text-ink md:text-4xl">
            One dashboard, every district.
          </h2>
          <p className="mt-4 max-w-prose text-slate">
            District heads see only their stretch of road. State officials see
            all of it. Every marker traces back to a bus, a timestamp, and a
            frame.
          </p>
          <div className="mt-8 flex flex-wrap gap-6 text-sm">
            {Object.entries(colorFor).map(([k, c]) => (
              <div key={k} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: c }}
                />
                <span className="capitalize text-slate">{k}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-line bg-ink"
        >
          <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
            <defs>
              <pattern id="mapgrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#F3F4F1" strokeOpacity="0.06" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#mapgrid)" />
          </svg>

          {markers.map((m, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.8 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.12, ease: "backOut" }}
              className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-4 ring-white/10"
              style={{
                left: `${m.x}%`,
                top: `${m.y}%`,
                backgroundColor: colorFor[m.type],
              }}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
