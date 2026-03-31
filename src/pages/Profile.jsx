import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import Badge from '../components/Badge.jsx';
import Modal from '../components/Modal.jsx';
import styles from './Profile.module.css';
import loginStyles from './LoginPage.module.css';


const BADGES = [
  { id: 'first-app',   icon: '🚀', label: 'First Step',    desc: 'Tracked your first application',  check: (c, s) => c.length >= 1 },
  { id: 'ten-apps',    icon: '📋', label: 'On a Roll',     desc: 'Tracked 10 applications',          check: (c, s) => c.length >= 10 },
  { id: 'first-offer', icon: '🎉', label: 'Offer Getter',  desc: 'Received your first offer',        check: (c, s) => c.filter((x) => x.stage === 'selected').length >= 1 },
  { id: 'streak-7',    icon: '🔥', label: 'Week Warrior',  desc: '7-day task streak',                check: (c, s) => s >= 7 },
  { id: 'streak-30',   icon: '⚡', label: 'Month Master',  desc: '30-day task streak',               check: (c, s) => s >= 30 },
  { id: 'tasks-50',    icon: '✅', label: 'Task Champion', desc: 'Completed 50 tasks total',         check: (c, s, th) => Object.values(th).reduce((sum, v) => sum + v.done.length, 0) >= 50 },
];

// ── Inline login panel (shown when user is not authenticated) ─────────────────

function LoginPanel() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleGoogle() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) { setMessage({ text: error.message, type: 'error' }); setLoading(false); }
  }

  async function handleMagicLink(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    setMessage(error
      ? { text: error.message, type: 'error' }
      : { text: 'Check your email for a login link.', type: 'success' }
    );
  }

  return (
    <div className={styles.loginWrap}>
      <div className={styles.loginCard}>
        <h2 className={styles.loginTitle}>Sign in to Placement Tracker</h2>
        <p className={styles.loginSub}>Save your data and access it from anywhere.</p>

        <button className={loginStyles.googleBtn} onClick={handleGoogle} disabled={loading}>
          <span className={loginStyles.googleIcon}>G</span>
          Continue with Google
        </button>

        <div className={loginStyles.divider}><span>or</span></div>

        <form onSubmit={handleMagicLink} className={loginStyles.form}>
          <input
            className={loginStyles.input}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className={loginStyles.submitBtn} type="submit" disabled={loading}>
            {loading ? 'Sending…' : 'Send magic link'}
          </button>
        </form>

        {message && (
          <p className={`${loginStyles.message} ${message.type === 'error' ? loginStyles.error : loginStyles.success}`}>
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main Profile page ─────────────────────────────────────────────────────────

export default function Profile({ state, actions, showToast, user }) {
  const { profile, companies, streak, taskHist } = state;
  const { updateProfile } = actions;

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ ...profile });

  // Prevent background scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = isEditing ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isEditing]);

  const offers = companies.filter((c) => c.stage === 'selected').length;

  const initials = profile.name
    ? profile.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  function handleEdit() {
    setForm({ ...profile });
    setIsEditing(true);
  }

  function handleSubmit(e) {
    e.preventDefault();
    updateProfile({ ...form });
    setIsEditing(false);
    showToast('Profile updated', 'success');
  }

  function handleCopy() {
    const text = `PlaceTrack | ${profile.name || 'User'} | ${companies.length} apps | ${offers} offers | ${streak} day streak`;
    navigator.clipboard?.writeText(text)
      .then(() => showToast('Copied to clipboard', 'success'))
      .catch(() => showToast('Could not copy to clipboard', 'warn'));
  }

  // Not logged in — show login panel
  
  if (!user) return <LoginPanel />;
  

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.avatar}>{initials}</div>
        <div className={styles.heroInfo}>
          <h2 className={styles.name}>{profile.name || 'Your Name'}</h2>
          {profile.handle && <span className={styles.handle}>@{profile.handle}</span>}
          {profile.college && <span className={styles.meta}>{profile.college}</span>}
          {profile.role && <span className={styles.meta}>{profile.role}</span>}
          {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
          <div className={styles.heroActions}>
            <button className={styles.editBtn} onClick={handleEdit}>Edit Profile</button>
            <button className={styles.copyBtn} onClick={handleCopy}>Share Summary</button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{companies.length}</span>
          <span className={styles.statLabel}>Applications</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{offers}</span>
          <span className={styles.statLabel}>Offers</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{streak} 🔥</span>
          <span className={styles.statLabel}>Day Streak</span>
        </div>
      </div>

      {/* Badges */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Achievements</h2>
        <div className={styles.badgeGrid}>
          {BADGES.map((b) => (
            <Badge
              key={b.id}
              icon={b.icon}
              label={b.label}
              desc={b.desc}
              earned={b.check(companies, streak, taskHist)}
            />
          ))}
        </div>
      </section>

      {/* Edit Profile modal */}
      <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} title="Edit Profile">
        <form className={styles.form} onSubmit={handleSubmit}>
          {[
            { field: 'name',    label: 'Name',    placeholder: 'Your full name' },
            { field: 'handle',  label: 'Handle',  placeholder: 'username' },
            { field: 'college', label: 'College', placeholder: 'Your college' },
            { field: 'role',    label: 'Role',    placeholder: 'e.g. CS Student' },
          ].map(({ field, label, placeholder }) => (
            <div key={field} className={styles.field}>
              <label className={styles.label}>{label}</label>
              <input
                className={styles.input}
                value={form[field]}
                onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                placeholder={placeholder}
              />
            </div>
          ))}
          <div className={styles.field}>
            <label className={styles.label}>Bio</label>
            <textarea
              className={styles.textarea}
              rows={3}
              value={form.bio}
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              placeholder="A short bio…"
            />
          </div>
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={() => setIsEditing(false)}>Cancel</button>
            <button type="submit" className={styles.submitBtn}>Save Changes</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
