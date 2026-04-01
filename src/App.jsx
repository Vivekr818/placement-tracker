import { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabaseClient.js';
import { useAuth } from './hooks/useAuth.js';
import { usePlaceTrackState } from './hooks/usePlaceTrackState.js';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import Toast from './components/Toast.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Companies from './pages/Companies.jsx';
import Tracker from './pages/Tracker.jsx';
import StudyPath from './pages/StudyPath.jsx';
import DailyTasks from './pages/DailyTasks.jsx';
import Profile from './pages/Profile.jsx';
import About from './pages/About.jsx';
import styles from './App.module.css';

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  companies: 'Applications',
  tracker:   'Tracker',
  prep:      'Study Path',
  tasks:     'Daily Tasks',
  profile:   'Profile',
  about:     'About',
};

export default function App({ isDemo }) {
  const { user, loading } = useAuth();
  useEffect(() => {
  if (!loading && !user && !isDemo) {
    window.location.href = '/app/demo';
  }
}, [user, loading, isDemo]);

  const [activePage, setActivePage] = useState('dashboard');
  const [toast, setToast]           = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = useCallback((message, type = 'success', onAction = null) => {
    setToast({ message, type, onAction });
  }, []);

  const handleDbError = useCallback((message) => {
    showToast(message, 'warn');
  }, [showToast]);

  // ── Single hook instance — all pages share this state ──
  const userId = isDemo ? null : user?.id;

const { state, actions } = usePlaceTrackState(userId, handleDbError);

  const handleNavigate = useCallback((pageId) => {
    setActivePage(pageId);
    setSidebarOpen(false); // close sidebar on mobile after navigation
  }, []);

  async function handleSignOut() {
  const app = document.getElementById('app-root');

  app.classList.add('fade-out');

  setTimeout(async () => {
    await supabase.auth.signOut();
    window.location.href = '/app/demo';
  }, 250);
}
  function renderPage() {
  const shared = { state, actions };

  switch (activePage) {
    case 'dashboard': return <Dashboard {...shared} />;
    case 'companies': return <Companies {...shared} showToast={showToast} user={user} />;
    case 'tracker':   return <Tracker {...shared} onNavigate={handleNavigate} user={user} />;
    case 'prep':      return <StudyPath {...shared} />;
    case 'tasks':     return <DailyTasks {...shared} showToast={showToast} user={user} />;
    case 'profile':   return <Profile {...shared} showToast={showToast} user={user} />;
    case 'about':     return <About />;
    default:          return <Dashboard {...shared} />;
  }
}

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--text3)', fontFamily: 'var(--font-m)', fontSize: 13 }}>
        Loading…
      </div>
    );
  }
  if (!user && !isDemo) {
  return null;
}

  return (
    <div id="app-root" className={`page-transition ${styles.appShell}`}>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className={styles.backdrop} onClick={() => setSidebarOpen(false)} />
      )}
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        streak={state.streak}
        user={user}
        onSignOut={handleSignOut}
        isOpen={sidebarOpen}
      />
      <div className={styles.mainArea}>
        <Topbar
          pageTitle={PAGE_TITLES[activePage]}
          onMenuToggle={() => setSidebarOpen((o) => !o)}
          user={user}
          onNavigate={handleNavigate}
          onSignOut={handleSignOut}
        />
        <main className={styles.pageContent}>
          {renderPage()}
        </main>
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
          onAction={toast.onAction}
        />
      )}
    </div>
  );
}
