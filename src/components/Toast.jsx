import React from 'react';
import styles from './Toast.module.css';

/**
 * Toast — transient notification.
 * Auto-dismiss is managed by the parent (App.jsx) via useEffect + setTimeout.
 * Manual dismiss via close button calls onDismiss.
 */
export default function Toast({ message, type, onDismiss, onAction, actionLabel }) {
  return (
    <div className={`${styles.toast} ${type === 'warn' ? styles.warn : styles.success}`} role="alert">
      <span className={styles.message}>{message}</span>
      {onAction && (
        <button className={styles.actionBtn} onClick={() => { onAction(); onDismiss(); }}>
          {actionLabel ?? 'Undo'}
        </button>
      )}
      <button className={styles.closeBtn} onClick={onDismiss} aria-label="Dismiss notification">✕</button>
    </div>
  );
}
