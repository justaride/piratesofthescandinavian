import { motion, useReducedMotion } from 'framer-motion';

import { cn } from '../../lib/cn';

interface MeterProps {
  value: number;
  label: string;
}

export function Meter({ value, label }: MeterProps) {
  const reduceMotion = useReducedMotion();
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-slate-300">
        <span>{label}</span>
        <span className="font-mono tabular-nums">{Math.round(clamped)}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-600/35">
        <motion.div
          className={cn(
            'h-full rounded-full',
            clamped >= 60 ? 'bg-gradient-to-r from-moss-400 to-emerald-300' : 'bg-gradient-to-r from-amber-400 to-orange-400'
          )}
          initial={reduceMotion ? false : { width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 120, damping: 18 }}
        />
      </div>
    </div>
  );
}
