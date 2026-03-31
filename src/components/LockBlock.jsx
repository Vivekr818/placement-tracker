import styles from './LockBlock.module.css';

/**
 * LockBlock — wraps any UI that requires auth.
 *
 * When `locked` is true:
 *   - children are rendered at reduced opacity
 *   - pointer events are disabled
 *   - a small centered pill overlay says "Login to unlock"
 *
 * When `locked` is false: renders children normally, zero overhead.
 *
 * Props:
 *   locked   {boolean}  — true when user is null / not authenticated
 *   message  {string}   — optional override for the lock label
 *   children {ReactNode}
 */
export default function LockBlock({ locked, message = 'Login to unlock', children }) {
  if (!locked) return children;

  return (
    <div className={styles.wrapper}>
      <div className={styles.dimmed}>{children}</div>
      <div className={styles.pill}>
        <span className={styles.icon}>🔒</span>
        {message}
      </div>
    </div>
  );
}
