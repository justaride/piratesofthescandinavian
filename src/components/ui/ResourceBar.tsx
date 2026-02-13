import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';

interface ResourceBarProps {
  icon: ReactNode;
  label: string;
  value: number;
  color?: 'gold' | 'green' | 'blue' | 'red';
}

const colorMap = {
  gold: 'from-amber-400 to-orange-500',
  green: 'from-moss-400 to-moss-500',
  blue: 'from-sky-400 to-cyan-500',
  red: 'from-rose-400 to-red-500'
};

export function ResourceBar({ icon, label, value, color = 'gold' }: ResourceBarProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="rounded-xl border border-white/10 bg-black/35 px-3 py-2 shadow-hud backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br', colorMap[color])}>
          <span aria-hidden>{icon}</span>
        </div>
        <div className="min-w-[72px]">
          <div className="text-[10px] uppercase tracking-[0.12em] text-slate-300/75">{label}</div>
          <motion.div
            key={value}
            initial={reduceMotion ? false : { scale: 1.15, color: '#fcd34d' }}
            animate={{ scale: 1, color: '#f8fafc' }}
            className="font-mono text-base font-bold tabular-nums"
          >
            {Math.round(value)}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
