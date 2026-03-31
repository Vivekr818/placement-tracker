import styles from './About.module.css';

export default function About() {
  return (
    <div className={styles.page}>
      <section className={styles.card}>
        <h2 className={styles.heading}>About Placement Tracker</h2>
        <p className={styles.text}>
          Placement Tracker is a personal placement assistant designed to help students
          track job applications, manage preparation tasks, and stay consistent
          during their placement journey.
        </p>
        <ul className={styles.list}>
          <li>Track applications and interview stages</li>
          <li>Manage daily preparation tasks</li>
          <li>Maintain streaks and consistency</li>
        </ul>
      </section>

      <section className={styles.card}>
        <h2 className={styles.heading}>About Me</h2>
        <p className={styles.text}>
          <h2>Vivek.R</h2>
          Never Needed Introduction.
        </p>
      </section>
    </div>
  );
}
