import { useState } from 'react';
import { todayStr, offsetDate } from '../utils/dateUtils.js';
import ConsistencyHeatmap from '../components/ConsistencyHeatmap.jsx';
import LockBlock from '../components/LockBlock.jsx';
import styles from './DailyTasks.module.css';

const QUICK_SUGGESTIONS = [
  { title: 'DSA Practice',          tag: 'DSA',            color: '#7c6af7' },
  { title: 'Core Subject Revision', tag: 'Core CS',        color: '#10b981' },
  { title: 'Mock Interview',        tag: 'Interview Prep', color: '#0ea5e9' },
  { title: 'Aptitude Practice',     tag: 'Aptitude',       color: '#f5a623' },
];

export default function DailyTasks({ state, actions, showToast, user }) {
  const { tasks, streak } = state;
  const { addTask, toggleTask, deleteTask } = actions;

  const locked = !user;

  const [taskInput, setTaskInput] = useState('');

  const today = todayStr();

  const todayTasks = tasks.filter((t) => t.date === today || !t.date);
  const doneTasks  = todayTasks.filter((t) => t.completed);

  const taskHistDerived = tasks.reduce((acc, t) => {
    if (!t.completed) return acc;
    const d = t.date ?? today;
    if (!acc[d]) acc[d] = { done: [] };
    acc[d].done.push(t.id);
    return acc;
  }, {});

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const dateStr = offsetDate(i - 6);
    return { dateStr, count: taskHistDerived[dateStr]?.done.length ?? 0 };
  });

  const handleAddTask = () => {
    const value = taskInput.trim();
    if (!value) return;
    addTask({ title: value, tag: 'Custom', color: '#6b7280' });
    setTaskInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAddTask();
  };

  const handleQuickAdd = (preset) => {
    addTask({ ...preset, date: today });
  };

  return (
    <div className={styles.page}>

      {/* Streak header */}
      <div className={styles.headerRow}>
        <div className={styles.streakDisplay}>
          <span className={styles.streakFire}>🔥</span>
          <span className={styles.streakNum}>{streak}</span>
          <span className={styles.streakLabel}>day streak</span>
        </div>
      </div>

      {/* Manual task input */}
      <LockBlock locked={locked} message="Login to add tasks">
        <div className={styles.inputContainer}>
          <input
            className={styles.taskInput}
            type="text"
            placeholder="Write your task..."
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className={styles.addButton}
            onClick={handleAddTask}
            disabled={!taskInput.trim()}
          >
            + Add
          </button>
        </div>
      </LockBlock>

      {/* Quick-add suggestions */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Quick Add</h2>
        <LockBlock locked={locked} message="Login to add tasks">
          <div className={styles.suggestions}>
            {QUICK_SUGGESTIONS.map((s) => (
              <button
                key={s.title}
                className={styles.suggestionBtn}
                style={{ borderColor: s.color, color: s.color }}
                onClick={() => handleQuickAdd(s)}
              >
                + {s.title}
              </button>
            ))}
          </div>
        </LockBlock>
      </section>

      {/* Today's task list */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Today's Tasks
          <span className={styles.progress}>{doneTasks.length} / {todayTasks.length} done</span>
        </h2>
        {todayTasks.length === 0 ? (
          <p className={styles.empty}>No tasks yet. Add a task or use suggestions below.</p>
        ) : (
          <ul className={styles.taskList}>
            {todayTasks.map((task) => (
              <li key={task.id} className={`${styles.taskItem} ${task.completed ? styles.taskDone : ''}`}>
                <label className={styles.taskLabel}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                  />
                  <span className={styles.taskTitle}>{task.title}</span>
                </label>
                <div className={styles.taskRight}>
                  {task.tag && (
                    <span className={styles.taskTag} style={{ backgroundColor: task.color }}>
                      {task.tag}
                    </span>
                  )}
                  <button
                    className={styles.deleteTaskBtn}
                    onClick={() => deleteTask(task.id)}
                    aria-label="Delete task"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Week summary + heatmap */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>This Week</h2>
        <div className={styles.weekGrid}>
          {weekDays.map(({ dateStr, count }) => {
            const isToday = dateStr === today;
            const label = new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short' });
            return (
              <div key={dateStr} className={`${styles.weekDay} ${isToday ? styles.weekDayToday : ''}`}>
                <span className={styles.weekDayLabel}>{label}</span>
                <div className={`${styles.weekDayDot} ${count > 0 ? styles.weekDayDone : ''}`} />
                <span className={styles.weekDayCount}>{count}</span>
              </div>
            );
          })}
        </div>
        <div className={styles.heatmapWrap}>
          <ConsistencyHeatmap taskHist={taskHistDerived} />
        </div>
      </section>

    </div>
  );
}
