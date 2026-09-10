import { motion } from "framer-motion";

const markers = [
  { x: 22, y: 30, type: "pothole" },
  { x: 48, y: 18, type: "congestion" },
  { x: 65, y: 42, type: "pothole" },
  { x: 35, y: 58, type: "accident" },
  { x: 78, y: 65, type: "pothole" },
  { x: 58, y: 75, type: "congestion" },
];

const colorFor: Record<string, string> = {
  pothole: "#D98E04",
  congestion: "#1E7F73",
  accident: "#DC2626",
};

interface MapPreviewProps {
  theme?: 'dark' | 'light';
}

export default function MapPreview({ theme = 'dark' }: MapPreviewProps) {
  const isDark = theme === 'dark';

  return (
    <section
      className={`border-b px-4 sm:px-6 py-14 sm:py-20 md:py-28 md:px-12 transition-colors duration-300 ${
        isDark ? 'bg-[#081325] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
      }`}
    >
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1fr_1.2fr] md:items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2
            className={`font-display text-3xl font-bold leading-tight md:text-4xl ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            One dashboard, every district.
          </h2>
          <p
            className={`mt-4 max-w-prose leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            District heads see only their stretch of road. State officials see
            all of it. Every marker traces back to a bus, a timestamp, and an edge inference
            frame.
          </p>

          <div className="mt-8 flex flex-wrap gap-6 text-sm">
            {Object.entries(colorFor).map(([k, c]) => (
              <div key={k} className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full shadow-sm"
                  style={{ backgroundColor: c }}
                />
                <span
                  className={`capitalize font-medium ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  {k}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={`relative aspect-[4/3] w-full overflow-hidden rounded-2xl border shadow-2xl ${
            isDark ? 'bg-[#050e1c] border-slate-700/80' : 'bg-white border-slate-300'
          }`}
        >
          <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
            <defs>
              <pattern id="mapgrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke={isDark ? '#1E7F73' : '#cbd5e1'}
                  strokeOpacity={isDark ? 0.18 : 0.4}
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#mapgrid)" />

            {/* Stylised transit route paths */}
            <path
              d="M 40 180 Q 140 140 240 160 T 440 220"
              fill="none"
              stroke={isDark ? '#1E7F73' : '#0f766e'}
              strokeOpacity={0.65}
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            <path
              d="M 100 80 Q 200 120 300 240 T 480 280"
              fill="none"
              stroke={isDark ? '#1E7F73' : '#0f766e'}
              strokeOpacity={0.45}
              strokeWidth="1.5"
            />
            <path
              d="M 80 260 C 160 220, 240 300, 360 240"
              fill="none"
              stroke="#D98E04"
              strokeOpacity={0.5}
              strokeWidth="1.5"
            />
          </svg>

          {/* Top-right floating telemetry badge */}
          <div className="absolute top-4 right-4 rounded-xl px-3 py-1.5 text-[11px] font-semibold backdrop-blur-md shadow-lg border bg-slate-900/85 text-white border-white/10 flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-[#2dd4bf] animate-ping" />
            <span>Telemetry Stream Active</span>
          </div>

          {/* Render markers */}
          {markers.map((m, i) => (
            <motion.div
              key={i}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{ left: `${m.x}%`, top: `${m.y}%` }}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              whileHover={{ scale: 1.3 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.08, type: "spring", stiffness: 300 }}
            >
              <span
                className="relative flex h-5 w-5 items-center justify-center rounded-full shadow-lg"
                style={{ backgroundColor: colorFor[m.type] }}
              >
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                  style={{ backgroundColor: colorFor[m.type] }}
                />
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              </span>
            </motion.div>
          ))}

          {/* Mock floating district badge */}
          <div
            className={`absolute bottom-4 left-4 rounded-xl px-3.5 py-2 text-xs font-semibold backdrop-blur-md shadow-lg border ${
              isDark
                ? 'bg-slate-900/85 text-white border-white/15'
                : 'bg-white/90 text-slate-800 border-slate-200'
            }`}
          >
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#1E7F73] animate-pulse" />
            District Command · PB-KAP / Kapurthala
          </div>
        </motion.div>
      </div>
    </section>
  );
}
