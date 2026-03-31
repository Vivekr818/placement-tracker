import React from 'react';
import styles from './ProgressBar.module.css';

/**
 * ProgressBar — renders a labeled ratio bar.
 * Fill is clamped to [0, 100]% regardless of input values.
 * No business logic or state.
 */
export default function ProgressBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <span className={styles.count}>{value} / {max}</span>
      </div>
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{ width: `${pct}%`, backgroundColor: color || 'var(--color-accent)' }}
        />
      </div>
    </div>
  );
}
