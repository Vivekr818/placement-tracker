import { useState } from 'react';
import { todayStr, formatDisplay } from '../utils/dateUtils.js';
import styles from './Topbar.module.css';

export default function Topbar({ pageTitle, onMenuToggle, user, onNavigate, onSignOut }) {
  const [open, setOpen] = useState(false);
  const dateDisplay = formatDisplay(todayStr());
  const initial = user?.email ? user.email[0].toUpperCase() : '?';

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <button
          className={styles.hamburger}
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          ☰
        </button>
        <h1 className={styles.title}>{pageTitle}</h1>
      </div>

      <div className={styles.rightSection}>
        <span className={styles.date}>{dateDisplay}</span>
        {user ? (
  <div className={styles.profileWrapper}>
    <button
      className={styles.profileCircle}
      onClick={() => setOpen((prev) => !prev)}
      aria-label="Profile menu"
      title={user.email}
    >
      {initial}
    </button>

    {open && (
      <div className={styles.dropdown}>
        <div
          className={styles.dropdownItem}
          onClick={() => {
            onNavigate('profile');
            setOpen(false);
          }}
        >
          Profile
        </div>

        <div
          className={styles.dropdownItem}
          onClick={() => {
            setOpen(false);
            onSignOut?.();
          }}
        >
          Logout
        </div>
      </div>
    )}
  </div>
) : (
  <button
    className={styles.loginButton}
    onClick={() => onNavigate('profile')}
  >
    Login
  </button>
)}
      </div>
    </header>
  );
}
