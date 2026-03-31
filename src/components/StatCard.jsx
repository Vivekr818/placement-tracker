import React from 'react';
import styles from './StatCard.module.css';

/**
 * StatCard — displays a single metric with label, value, optional sub-text, icon, and accent color.
 * No business logic or state.
 */
export default function StatCard({ label, value, color, sub, icon }) {
  return (
    <div className={styles.card} style={color ? { borderTopColor: color } : undefined}>
      <div className={styles.top}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <span className={styles.value}>{value}</span>
      </div>
      <span className={styles.label}>{label}</span>
      {sub && <span className={styles.sub}>{sub}</span>}
    </div>
  );
}
