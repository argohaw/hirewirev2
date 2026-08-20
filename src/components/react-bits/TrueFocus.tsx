import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';

interface TrueFocusProps {
  words: string[];
  className?: string;
  onSelect?: (word: string) => void;
  active?: string;
}

export default function TrueFocus({
  words,
  className = '',
  onSelect,
  active,
}: TrueFocusProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const current = hovered ?? active ?? words[0];

  return (
    <div className={cn('relative flex flex-wrap items-center gap-2', className)}>
      {words.map((word) => {
        const isActive = current === word;
        return (
          <button
            key={word}
            type="button"
            onMouseEnter={() => setHovered(word)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(word)}
            onBlur={() => setHovered(null)}
            onClick={() => onSelect?.(word)}
            className={cn(
              'relative rounded-full px-3 py-1 text-xs font-semibold tracking-[0.16em] uppercase transition-colors',
              isActive ? 'text-[var(--fg)]' : 'text-[var(--fg-muted)]',
            )}
          >
            {isActive && (
              <motion.span
                layoutId="true-focus-frame"
                className="absolute inset-0 rounded-full border border-[var(--hw-gold)] shadow-[0_0_18px_color-mix(in_srgb,var(--hw-neon)_35%,transparent)]"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative z-10">{word}</span>
          </button>
        );
      })}
    </div>
  );
}
