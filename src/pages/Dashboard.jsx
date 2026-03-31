import { todayStr, formatDisplay, normalizeDate, getTodayStart, getInterviewLabel, formatSafeDate } from '../utils/dateUtils.js';
import { SC } from '../constants/stageConfig.js';
import StatCard from '../components/StatCard.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import styles from './Dashboard.module.css';

export default function Dashboard({ state, actions }) {
  const { companies, tasks, streak } = state;
  const { toggleTask } = actions;

  const today = todayStr();

  // Tasks for today — use task.completed directly (Supabase model)
  const todayTasks = tasks.filter((t) => t.date === today || !t.date);
  const doneTasks  = todayTasks.filter((t) => t.completed);

  // Derived metrics
  const total = companies.length;
  const interviews = companies.filter((c) => c.stage === 'interview').length;
  const offers = companies.filter((c) => c.stage === 'selected').length;

  // Recent applications — last 5 by added date
  const recentApps = [...companies]
    .sort((a, b) => (b.added > a.added ? 1 : -1))
    .slice(0, 5);

  // Upcoming interviews — stage "interview" with date >= today, sorted ascending
  const upcomingInterviews = companies
    .filter(c => {
      if (!c.stage || !c.date) return false;
      if (c.stage.toLowerCase() !== 'interview') return false;
      const d = normalizeDate(c.date);
      if (!d) return false;
      return d >= getTodayStart();
    })
    .sort((a, b) => normalizeDate(a.date) - normalizeDate(b.date));

  // Funnel data per stage
  const funnelData = SC.map((s) => ({
    ...s,
    count: companies.filter((c) => c.stage === s.id).length,
  }));

  return (
    <div className={styles.page}>
      {/* Stats row */}
      <div className={styles.statsGrid}>
        <StatCard label="Total Applications" value={total} color="var(--color-accent)" icon="📋" />
        <StatCard label="Interviews" value={interviews} color="var(--color-warn)" icon="🗓️" />
        <StatCard label="Offers" value={offers} color="var(--color-success)" icon="🎉" />
        <StatCard
          label="Tasks Done Today"
          value={`${doneTasks.length} / ${todayTasks.length}`}
          color="var(--color-accent)"
          icon="✅"
          sub={`${streak} day streak 🔥`}
        />
      </div>

      <div className={styles.columns}>
        {/* Today's Focus */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Today's Focus</h2>
          {todayTasks.length === 0 ? (
            <div className={styles.emptyState}>
              <span>No tasks yet.</span>
              <span className={styles.emptyHint}>Head to Daily Tasks to add your tasks.</span>
            </div>
          ) : doneTasks.length === todayTasks.length ? (
            <div className={styles.allDone}>
              <span>🎉 All tasks done for today!</span>
            </div>
          ) : (
            <ul className={styles.taskList}>
              {todayTasks.map((task) => (
                <li key={task.id} className={`${styles.taskItem} ${task.completed ? styles.taskItemDone : ''}`}>
                  <label className={styles.taskLabel}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                    />
                    <span className={styles.taskTitle}>{task.title}</span>
                  </label>
                  <span className={styles.taskTag} style={{ backgroundColor: task.color }}>{task.tag}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent Applications */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Recent Applications</h2>
          {recentApps.length === 0 ? (
            <div className={styles.emptyState}>No applications tracked yet.</div>
          ) : (
            <ul className={styles.appList}>
              {recentApps.map((c) => (
                <li key={c.id} className={styles.appItem}>
                  <div className={styles.appInfo}>
                    <span className={styles.appName}>{c.name}</span>
                    <span className={styles.appRole}>{c.role}</span>
                  </div>
                  <div className={styles.appMeta}>
                    <span
                      className={styles.stageBadge}
                      style={{ backgroundColor: SC.find((s) => s.id === c.stage)?.color }}
                    >
                      {SC.find((s) => s.id === c.stage)?.label}
                    </span>
                    <span className={styles.appDate}>{formatSafeDate(c.added, { month: 'short', day: 'numeric' })}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Upcoming Interviews */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Upcoming Interviews</h2>
        {upcomingInterviews.length === 0 ? (
          <div className={styles.emptyState}>No upcoming interviews.</div>
        ) : (
          <ul className={styles.appList}>
            {upcomingInterviews.map((c) => (
              <li key={c.id} className={styles.appItem}>
                <div className={styles.appInfo}>
                  <span className={styles.appName}>{c.name}</span>
                  <span className={styles.appRole}>{c.role}</span>
                </div>
                <span className={styles.appDate}>{getInterviewLabel(c.date)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Application Funnel */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Application Funnel</h2>
        <div className={styles.funnel}>
          {funnelData.map((s) => (
            <ProgressBar key={s.id} label={s.label} value={s.count} max={total || 1} color={s.color} />
          ))}
        </div>
      </section>
    </div>
  );
}
