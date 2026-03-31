import { useRef, useState, useEffect, useCallback } from 'react';
import { PREP, PREP_MODES } from '../constants/prep.js';
import styles from './StudyPath.module.css';

const PRIORITY_META = {
  high:   { label: 'High',   className: 'priorityHigh' },
  medium: { label: 'Medium', className: 'priorityMedium' },
  low:    { label: 'Low',    className: 'priorityLow' },
};

const SCROLL_AMOUNT = 160; // px per arrow click

export default function StudyPath({ state, actions }) {
  const { prepType, expandedTopics } = state;
  const { setPrepType, toggleTopic } = actions;

  const topics = PREP[prepType] ?? [];

  // ── Scroll arrow logic ────────────────────────────────────────────────────
  const tabBarRef = useRef(null);
  const [canScrollLeft,  setCanScrollLeft]  = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = tabBarRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  // Check on mount and whenever the window resizes
  useEffect(() => {
    updateArrows();
    window.addEventListener('resize', updateArrows);
    return () => window.removeEventListener('resize', updateArrows);
  }, [updateArrows]);

  const scrollLeft  = () => tabBarRef.current?.scrollBy({ left: -SCROLL_AMOUNT, behavior: 'smooth' });
  const scrollRight = () => tabBarRef.current?.scrollBy({ left:  SCROLL_AMOUNT, behavior: 'smooth' });

  return (
    <div className={styles.page}>

      {/* ── Tab bar with scroll arrows ── */}
      <div className={styles.tabWrapper}>
        {canScrollLeft && (
          <button
            className={`${styles.scrollArrow} ${styles.scrollArrowLeft}`}
            onClick={scrollLeft}
            aria-label="Scroll tabs left"
            tabIndex={-1}
          >
            ‹
          </button>
        )}

        <div
          ref={tabBarRef}
          className={styles.tabBar}
          role="tablist"
          aria-label="Study path"
          onScroll={updateArrows}
        >
          {PREP_MODES.map((mode) => (
            <button
              key={mode.id}
              role="tab"
              aria-selected={prepType === mode.id}
              className={`${styles.tab} ${prepType === mode.id ? styles.tabActive : ''}`}
              onClick={() => setPrepType(mode.id)}
            >
              <span className={styles.tabEmoji}>{mode.emoji}</span>
              {mode.label}
            </button>
          ))}
        </div>

        {canScrollRight && (
          <button
            className={`${styles.scrollArrow} ${styles.scrollArrowRight}`}
            onClick={scrollRight}
            aria-label="Scroll tabs right"
            tabIndex={-1}
          >
            ›
          </button>
        )}
      </div>

      {/* ── Topic cards ── */}
      <div className={styles.topicList}>
        {topics.map((topic) => {
          const isExpanded = !!expandedTopics[topic.id];
          const priority = PRIORITY_META[topic.priority] ?? PRIORITY_META.medium;

          return (
            <div
              key={topic.id}
              className={`${styles.topicCard} ${isExpanded ? styles.expanded : ''}`}
            >
              <button
                className={styles.topicHeader}
                onClick={() => toggleTopic(topic.id)}
                aria-expanded={isExpanded}
              >
                <div className={styles.headerLeft}>
                  <div className={styles.iconWrap}>{topic.icon}</div>
                  <div className={styles.headerText}>
                    <span className={styles.topicTitle}>{topic.title}</span>
                    <span className={styles.topicMeta}>{topic.subtopics.length} topics</span>
                  </div>
                </div>

                <div className={styles.headerRight}>
                  <span className={`${styles.priorityTag} ${styles[priority.className]}`}>
                    {priority.label}
                  </span>
                  <span className={styles.weekTag}>Week {topic.week}</span>
                  <span className={styles.chevron}>{isExpanded ? '▲' : '▼'}</span>
                </div>
              </button>

              {isExpanded && (
                <ul className={styles.subtopicList}>
                  {topic.subtopics.map((sub, i) => (
                    <li key={i} className={styles.subtopic}>
                      <span className={styles.bullet} />
                      {sub}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
