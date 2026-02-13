import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

interface GameModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function GameModal({ open, title, children, footer }: GameModalProps) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 p-4"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="w-full max-w-xl rounded-2xl border border-amber-200/30 bg-gradient-to-br from-fjord-800 to-fjord-900 p-5 shadow-2xl"
            initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
          >
            <h2 className="text-lg font-semibold text-amber-200">{title}</h2>
            <div className="mt-3 text-slate-100">{children}</div>
            {footer ? <div className="mt-5">{footer}</div> : null}
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
