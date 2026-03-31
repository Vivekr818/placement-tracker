import styles from './Badge.module.css';

/**
 * Badge — achievement badge display.
 * No business logic or state.
 */
export default function Badge({ icon, label, desc, earned }) {
  return (
    <div className={`${styles.badge} ${earned ? styles.earned : styles.unearned}`}>
      <span className={styles.icon}>{icon}</span>
      <div className={styles.info}>
        <span className={styles.label}>{label}</span>
        <span className={styles.desc}>{desc}</span>
      </div>
    </div>
  );
}
