import React from 'react';
import { offsetDate, todayStr, formatSafeDate } from '../utils/dateUtils.js';
import { TC } from '../constants/typeConfig.js';
import ProgressBar from '../components/ProgressBar.jsx';
import ConsistencyHeatmap from '../components/ConsistencyHeatmap.jsx';
import LockBlock from '../components/LockBlock.jsx';
import styles from './Tracker.module.css';

// ── Pure helpers (no side effects) ───────────────────────────────────────────

function pct(num, den) {
  if (!den) return 0;
  return Math.round((num / den) * 100);
}

function buildFunnel(companies) {
  const total     = companies.length;
  const applied   = companies.filter((c) => c.stage === 'applied').length;
  const oa        = companies.filter((c) => c.stage === 'oa').length;
  const interview = companies.filter((c) => c.stage === 'interview').length;
  const selected  = companies.filter((c) => c.stage === 'selected').length;
  const rejected  = companies.filter((c) => c.stage === 'rejected').length;
  return {
    total, applied, oa, interview, selected, rejected,
    oaRate:        pct(oa,        total),
    interviewRate: pct(interview, oa + interview + selected),
    offerRate:     pct(selected,  interview + selected),
  };
}

function buildTypeSuccess(companies) {
  return TC.map((t) => {
    const typed  = companies.filter((c) => c.type === t.id);
    const offers = typed.filter((c) => c.stage === 'selected').length;
    return { ...t, count: typed.length, offers };
  }).filter((t) => t.count > 0);
}

function buildWeeklyActivity(companies, tasks) {
  return Array.from({ length: 7 }, (_, i) => {
    const dateStr = offsetDate(i - 6);
    const apps    = companies.filter((c) => c.added?.slice(0, 10) === dateStr).length;
    const done    = tasks.filter((t) => t.completed && t.date === dateStr).length;
    const label   = new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short' });
    return { dateStr, apps, done, label, isToday: dateStr === todayStr() };
  });
}

/** Normalize a YYYY-MM-DD string to midnight local time. Returns null for invalid input. */
function normalizeDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Today at midnight local time */
function getTodayStart() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/** Upcoming interviews: stage=interview (case-insensitive), c.date >= today, sorted ascending */
function buildUpcomingInterviews(companies) {
  const today = getTodayStart();
  return companies
    .filter((c) => {
      if (!c.stage || !c.date) return false;
      if (c.stage.toLowerCase() !== 'interview') return false;
      const d = normalizeDate(c.date);
      if (!d) return false;
      return d >= today;
    })
    .sort((a, b) => normalizeDate(a.date) - normalizeDate(b.date));
}

/** Days until a date string — compares date-only, no time component */
function daysUntil(dateStr) {
  const target = normalizeDate(dateStr);
  const today  = getTodayStart();
  if (!target) return Infinity;
  return Math.round((target - today) / 86400000);
}

/** Smart next action — priority-based, returns { title, message, cta, action, accent, meta? } */
function buildNextAction(funnel, upcoming, tasks, streak) {
  const today = todayStr();
  const todayDone = tasks.filter((t) => t.completed && t.date === today).length;

  // (1) Upcoming interview — highest priority
  if (upcoming.length > 0) {
    const next = upcoming[0];
    const days = daysUntil(next.date);
    const dayLabel = days === 0 ? 'today' : `in ${days} day${days !== 1 ? 's' : ''}`;
    return {
      title:   'Interview Coming Up',
      message: `Prepare for ${next.name} (${next.role}) interview ${dayLabel}. Focus on DSA + core subjects.`,
      cta:     'View Details',
      action:  'GO_TO_COMPANY',
      accent:  'amber',
      meta:    { companyId: next.id },
    };
  }

  // (2) No tasks completed today
  if (todayDone === 0 && tasks.length > 0) {
    return {
      title:   'Start Your Day',
      message: "You haven't completed any tasks today. Start with 1–2 tasks to build momentum.",
      cta:     'Go to Tasks',
      action:  'GO_TO_TASKS',
      accent:  'neutral',
    };
  }

  // (3) Streak at risk (streak active but today not yet completed)
  if (streak > 0 && todayDone === 0) {
    return {
      title:   'Maintain Your Streak',
      message: `You're on a ${streak}-day streak. Complete today's tasks to keep it going.`,
      cta:     'Complete Task',
      action:  'GO_TO_TASKS',
      accent:  'green',
    };
  }

  // (4) Low interview conversion
  if (funnel.applied > 5 && funnel.interview < 2) {
    return {
      title:   'Improve Conversion',
      message: 'You have many applications but few interviews. Focus on DSA and resume improvement.',
      cta:     'Start Practice',
      action:  'GO_TO_STUDY',
      accent:  'neutral',
    };
  }

  // (5) Default
  return {
    title:   "You're On Track",
    message: 'Keep applying and stay consistent with your preparation.',
    cta:     'View Dashboard',
    action:  'GO_TO_DASHBOARD',
    accent:  'subtle',
  };
}

// ── Tracker page ──────────────────────────────────────────────────────────────

export default function Tracker({ state, onNavigate, user }) {
  const { companies, tasks, streak } = state;

  const funnel      = buildFunnel(companies);
  const upcoming    = buildUpcomingInterviews(companies);
  const nextAction  = buildNextAction(funnel, upcoming, tasks, streak);
  const typeSuccess = buildTypeSuccess(companies);
  const weeklyAct   = buildWeeklyActivity(companies, tasks);

  // Derive heatmap-compatible taskHist from tasks
  const taskHistDerived = tasks.reduce((acc, t) => {
    if (!t.completed || !t.date) return acc;
    if (!acc[t.date]) acc[t.date] = { done: [] };
    acc[t.date].done.push(t.id);
    return acc;
  }, {});

  function handleAction(action, meta) {
    switch (action) {
      case 'GO_TO_TASKS':     return onNavigate?.('tasks');
      case 'GO_TO_STUDY':     return onNavigate?.('prep');
      case 'GO_TO_DASHBOARD': return onNavigate?.('dashboard');
      case 'GO_TO_COMPANY':
        return onNavigate?.('companies');
      default: break;
    }
  }

  return (
    <div className={styles.page}>

      {/* ── Hero row: Upcoming Interviews + Next Action ── */}
      <div className={styles.heroRow}>

        {/* Upcoming Interviews — always visible */}
        <section className={`${styles.card} ${styles.upcomingCard}`}>
          <h2 className={styles.cardTitle}>📅 Upcoming Interviews</h2>
          {upcoming.length === 0 ? (
            <p className={styles.empty}>No upcoming interviews scheduled.</p>
          ) : (
            <ul className={styles.interviewList}>
              {upcoming.map((c) => {
                const days = daysUntil(c.date);
                const isUrgent = days <= 2;
                const label = days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `in ${days} days`;
                return (
                  <li key={c.id} className={`${styles.interviewItem} ${isUrgent ? styles.urgent : ''}`}>
                    <div className={styles.interviewInfo}>
                      <span className={styles.interviewCompany}>{c.name}</span>
                      <span className={styles.interviewRole}>{c.role}</span>
                    </div>
                    <div className={styles.interviewMeta}>
                      <span className={`${styles.countdown} ${isUrgent ? styles.countdownUrgent : ''}`}>
                        {label}
                      </span>
                      <span className={styles.interviewDate}>
                        {formatSafeDate(c.date, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Smart Next Action — locked when logged out */}
        <section className={`${styles.card} ${styles.actionCard} ${styles[`accent_${nextAction.accent}`]}`}>
          <h2 className={styles.cardTitle}>⚡ Next Action</h2>
          <LockBlock locked={!user} message="Login to unlock smart actions">
            <div className={styles.actionBody}>
              <div className={styles.actionContent}>
                <div className={styles.actionTitle}>{nextAction.title}</div>
                <p className={styles.actionMessage}>{nextAction.message}</p>
              </div>
              <button
                className={`${styles.ctaBtn} ${styles[`cta_${nextAction.accent}`]}`}
                onClick={() => handleAction(nextAction.action, nextAction.meta)}
              >
                {nextAction.cta} →
              </button>
            </div>
          </LockBlock>
        </section>

      </div>

      {/* ── Conversion Funnel (full width) ── */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>🔄 Conversion Funnel</h2>
        {funnel.total === 0 ? (
          <p className={styles.empty}>No applications tracked yet.</p>
        ) : (
          <div className={styles.funnelSteps}>
            {[
              { label: 'Applied',   count: funnel.applied,   color: '#7c6af7', next: funnel.oaRate },
              { label: 'OA',        count: funnel.oa,        color: '#f5a623', next: funnel.interviewRate },
              { label: 'Interview', count: funnel.interview, color: '#0ea5e9', next: funnel.offerRate },
              { label: 'Selected',  count: funnel.selected,  color: '#3ecf8e', next: null },
              { label: 'Rejected',  count: funnel.rejected,  color: '#f26464', next: null },
            ].map((s) => (
              <React.Fragment key={s.label}>
                <div className={styles.funnelStep}>
                  <div className={styles.funnelBubble} style={{ borderColor: s.color, color: s.color }}>
                    {s.count}
                  </div>
                  <span className={styles.funnelStepLabel}>{s.label}</span>
                </div>
                {s.next !== null && (
                  <div className={styles.funnelArrow}>
                    <span className={styles.funnelPct}>{s.next}%</span>
                    <span className={styles.funnelArrowLine}>→</span>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </section>

      {/* ── Bottom grid: Weekly Activity + Type Success ── */}
      <div className={styles.bottomGrid}>

        {/* Weekly Activity */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>📆 Weekly Activity</h2>
          <div className={styles.weekGrid}>
            {weeklyAct.map(({ dateStr, apps, done, label, isToday }) => (
              <div key={dateStr} className={`${styles.weekDay} ${isToday ? styles.weekDayToday : ''}`}>
                <span className={styles.weekLabel}>{label}</span>
                <div className={styles.weekBars}>
                  <div className={styles.weekBar} style={{ height: `${Math.min(apps * 14, 44)}px`, background: '#7c6af7' }} title={`${apps} apps`} />
                  <div className={styles.weekBar} style={{ height: `${Math.min(done * 8, 44)}px`, background: '#3ecf8e' }} title={`${done} tasks`} />
                </div>
                <span className={styles.weekCount}>{apps > 0 ? `${apps}a` : ''}{done > 0 ? ` ${done}t` : ''}</span>
              </div>
            ))}
          </div>
          <div className={styles.weekLegend}>
            <span className={styles.legendDot} style={{ background: '#7c6af7' }} /> Apps
            <span className={styles.legendDot} style={{ background: '#3ecf8e', marginLeft: 10 }} /> Tasks
          </div>
        </section>

        {/* Success by Type */}
        {typeSuccess.length > 0 && (
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>🏆 Success by Type</h2>
            <div className={styles.typeBars}>
              {typeSuccess.map((t) => (
                <ProgressBar
                  key={t.id}
                  label={`${t.label} (${t.count} apps, ${t.offers} offers)`}
                  value={t.offers}
                  max={t.count}
                  color={t.color}
                />
              ))}
            </div>
          </section>
        )}

      </div>

      {/* ── Consistency heatmap ── */}
      <section className={`${styles.card} ${styles.heatmapCard}`}>
        <h2 className={styles.cardTitle}>🗓️ Consistency</h2>
        <ConsistencyHeatmap taskHist={taskHistDerived} />
      </section>

    </div>
  );
}
