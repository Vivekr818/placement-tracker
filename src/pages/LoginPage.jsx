import { useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { text, type }

  async function handleGoogleLogin() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      setMessage({ text: error.message, type: 'error' });
      setLoading(false);
    }
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
    if (error) {
      setMessage({ text: error.message, type: 'error' });
    } else {
      setMessage({ text: 'Check your email for a login link.', type: 'success' });
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          Placement<span className={styles.brandAccent}> Tracker</span>
        </div>
        <p className={styles.sub}>Placement Assistant</p>

        <button
          className={styles.googleBtn}
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <span className={styles.googleIcon}>G</span>
          Continue with Google
        </button>

        <div className={styles.divider}><span>or</span></div>

        <form onSubmit={handleMagicLink} className={styles.form}>
          <input
            className={styles.input}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? 'Sending…' : 'Send magic link'}
          </button>
        </form>

        {message && (
          <p className={`${styles.message} ${message.type === 'error' ? styles.error : styles.success}`}>
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}
