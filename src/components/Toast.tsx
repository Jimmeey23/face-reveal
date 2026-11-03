import { AnimatePresence, motion } from "motion/react";

export function Toast({ message }: { message: string | null }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[90] flex justify-center px-4">
      <AnimatePresence>
        {message && (
          <motion.div
            key={message}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="glass-strong rounded-2xl px-4 py-2.5 text-sm font-bold text-white shadow-2xl"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
