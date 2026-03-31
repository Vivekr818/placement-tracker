import React, { useState } from 'react';
import { offsetDate, formatDisplay } from '../utils/dateUtils.js';
import styles from './ConsistencyHeatmap.module.css';

/**
 * ConsistencyHeatmap — compact 14-day task activity heatmap.
 * Props:
 *   taskHist: { [dateStr]: { done: string[] } }
 */
export default function ConsistencyHeatmap({ taskHist }) {
  const [tooltip, setTooltip] = useState(null); // { text, x, y }

  const days = Array.from({ length: 14 }, (_, i) => {
    const dateStr = offsetDate(i - 13);
    const count   = taskHist[dateStr]?.done.length ?? 0;
    return { dateStr, count };
  });

  function intensityClass(count) {
    if (count === 0)  return styles.l0;
    if (count <= 2)   return styles.l1;
    if (count <= 4)   return styles.l2;
    return styles.l3;
  }

  function handleMouseEnter(e, day) {
    const label = formatDisplay(day.dateStr, { month: 'short', day: 'numeric' });
    setTooltip(`${day.count} task${day.count !== 1 ? 's' : ''} on ${label}`);
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.title}>Consistency · Last 14 Days</span>
        <span className={styles.legend}>
          <span className={`${styles.dot} ${styles.l0}`} />
          Low
          <span className={`${styles.dot} ${styles.l3}`} style={{ marginLeft: 6 }} />
          High
        </span>
      </div>

      <div
        className={styles.grid}
        onMouseLeave={() => setTooltip(null)}
      >
        {days.map((day) => (
          <div
            key={day.dateStr}
            className={`${styles.cell} ${intensityClass(day.count)}`}
            onMouseEnter={(e) => handleMouseEnter(e, day)}
            aria-label={`${day.count} tasks on ${day.dateStr}`}
          />
        ))}
      </div>

      {tooltip && (
        <div className={styles.tooltip}>{tooltip}</div>
      )}
    </div>
  );
}
