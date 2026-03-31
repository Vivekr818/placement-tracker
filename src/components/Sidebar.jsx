import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',   icon: '⊞' },
  { id: 'companies', label: 'Applications',   icon: '🏢' },
  { id: 'tracker',   label: 'Tracker',     icon: '📊' },
  { id: 'prep',      label: 'Study Path',  icon: '📚' },
  { id: 'tasks',     label: 'Daily Tasks', icon: '✅' },
  { id: 'profile',   label: 'Profile',     icon: '👤' },
  { id: 'about',     label: 'About',       icon: 'ℹ️' },
];

export default function Sidebar({ activePage, onNavigate, streak, user, onSignOut, isOpen }) {
  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      <div className={styles.brand}>
        <div
  className={styles.brandName}
  onClick={() => window.location.href = '/'}
  style={{ cursor: 'pointer' }}
  title="Go to home page"
>
  Placement<span className={styles.brandIcon}> Tracker</span>
</div>
        <div className={styles.brandSub}>Your placement companion</div>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`${styles.navItem} ${activePage === item.id ? styles.active : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className={styles.streakBadge}>
        <div className={styles.streakPill}>
          <span className={styles.streakIcon}>🔥</span>
          <div className={styles.streakInfo}>
            <span className={styles.streakCount}>{streak}</span>
            <span className={styles.streakLabel}>day streak</span>
          </div>
        </div>
      </div>

      <div className={styles.userSection}>
        {user ? (
          <>
            {user.email && <span className={styles.userEmail}>{user.email}</span>}
            {onSignOut && (
              <button className={styles.signOutBtn} onClick={onSignOut}>Sign out</button>
            )}
          </>
        ) : (
          <span className={styles.notLoggedIn}>Not logged in</span>
        )}
      </div>
    </aside>
  );
}
