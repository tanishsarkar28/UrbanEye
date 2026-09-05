import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="bg-ink px-6 py-20 text-paper md:px-12">
      <div className="mx-auto max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="font-display max-w-2xl text-3xl font-medium leading-tight md:text-4xl"
        >
          The fleet is already on the road.
          <br />
          Let it start reporting.
        </motion.h2>

        <div className="mt-16 flex flex-col justify-between gap-8 border-t border-paper/15 pt-8 text-sm text-paper/60 md:flex-row md:items-center">
          <p>UrbanEye — built for Bharat Electronics Limited, Smart India Hackathon.</p>
          <p>Lovely Professional University</p>
        </div>
      </div>
    </footer>
  );
}
