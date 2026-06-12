import styles from './ResumePreview.module.css'

export default function ResumePreview({ data }) {
  const d = data || {}
  const type = d.type || 'job'

  return (
    <div id="resume-preview" className={styles.preview}>
      <div className={`${styles.sheet} ${type} ${d.template || ''}`}>
        <header className={styles.header}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {d.photo && <img src={d.photo} alt="写真" className={styles.photo} />}
            <div>
              <div className={styles.name}>{d.name || '氏名'}</div>
            </div>
          </div>
          <div className={styles.meta}>
            <div className={styles.title}>{d.title}</div>
            <div className={styles.contact}>{d.contact}</div>
          </div>
        </header>

        <div className={styles.left}>
          <section className={styles.section}>
            <h3>プロフィール</h3>
            <p>{d.summary}</p>
          </section>

          <section className={styles.section}>
            <h3>職務経歴</h3>
            {(d.experiences || []).map((ex, i) => (
              <div key={i} className={styles.exp}>
                <div className={styles['exp-head']}>
                  <strong>{ex.title}</strong>
                  <span className={styles.company}>{ex.company}</span>
                  <span className={styles.dates}>{ex.dates}</span>
                </div>
                {type === 'parttime' ? <p className={styles.compact}>{ex.title} — {ex.company}</p> : <p>{ex.description}</p>}
              </div>
            ))}
          </section>
        </div>

        <aside className={styles.right}>
          <section className={styles.section}>
            <h3>学歴</h3>
            <p>{d.education}</p>
          </section>

          <section className={styles.section}>
            <h3>連絡先</h3>
            <p>{d.contact}</p>
          </section>
        </aside>
      </div>
    </div>
  )
}
