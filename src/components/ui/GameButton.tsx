import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';

interface GameButtonProps extends HTMLMotionProps<'button'> {
  children: ReactNode;
  tone?: 'primary' | 'secondary' | 'ghost';
}

const toneClasses: Record<NonNullable<GameButtonProps['tone']>, string> = {
  primary: 'bg-gradient-to-r from-ember-500 to-amber-300 text-fjord-900 shadow-md hover:brightness-105',
  secondary: 'bg-fjord-700 text-amber-50 border border-amber-200/25 hover:bg-fjord-800',
  ghost: 'bg-transparent text-slate-100 border border-slate-300/20 hover:bg-white/10'
};

export function GameButton({ children, className, tone = 'primary', ...props }: GameButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 420, damping: 24 }}
      className={cn(
        'rounded-xl px-4 py-2 text-sm font-semibold tracking-wide transition disabled:cursor-not-allowed disabled:opacity-50',
        toneClasses[tone],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
