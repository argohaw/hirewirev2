import { useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import Aurora from '../react-bits/Aurora';

export default function ReactBitsBg() {
  const { theme } = useTheme();
  const colorStops = useMemo(
    () =>
      theme === 'dark'
        ? ['#990000', '#D4AF37', '#39FF14']
        : ['#D4AF37', '#FFFFF0', '#E53E3E'],
    [theme],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[420px] opacity-80">
        <Aurora colorStops={colorStops} amplitude={1.15} blend={0.6} speed={0.7} />
      </div>
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--fg) 55%, transparent) 1px, transparent 0)',
          backgroundSize: '22px 22px',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--bg)]" />
    </div>
  );
}
