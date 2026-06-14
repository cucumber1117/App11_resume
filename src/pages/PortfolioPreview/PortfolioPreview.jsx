import styles from './PortfolioPreview.module.css'

function displayUrl(value = '') {
  return value.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

export default function PortfolioPreview({ data }) {
  const skills = data.skills
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean)
  const projects = data.projects.filter((project) => (
    project.title || project.description || project.image
  ))

  return (
    <div id="portfolio-preview" className={styles.preview}>
      <div
        className={styles.sheet}
        data-sheet="a4"
        style={{ '--portfolio-accent': data.accentColor }}
      >
        <header className={styles.header}>
          <div>
            <span className={styles.kicker}>PORTFOLIO</span>
            <h1>{data.name || 'Your Name'}</h1>
            <p className={styles.jobTitle}>{data.jobTitle || 'Your Profession'}</p>
          </div>
          <div className={styles.contact}>
            {data.email && <span>{data.email}</span>}
            {data.website && <span>{displayUrl(data.website)}</span>}
          </div>
        </header>

        <section className={styles.profile}>
          <h2>About</h2>
          <p>{data.bio || '自己紹介を入力すると、ここに表示されます。'}</p>
          {skills.length > 0 && (
            <div className={styles.skills}>
              {skills.map((skill) => <span key={skill}>{skill}</span>)}
            </div>
          )}
        </section>

        <section className={styles.works}>
          <div className={styles.worksHeading}>
            <h2>Selected Works</h2>
            <span>{String(projects.length).padStart(2, '0')} PROJECTS</span>
          </div>
          <div className={styles.projectGrid}>
            {(projects.length > 0 ? projects : [{ id: 'empty' }]).map((project, index) => (
              <article className={styles.project} key={project.id}>
                <div className={styles.projectImage}>
                  {project.image ? (
                    <img src={project.image} alt="" />
                  ) : (
                    <span>{String(index + 1).padStart(2, '0')}</span>
                  )}
                </div>
                <div className={styles.projectBody}>
                  <div className={styles.projectTitle}>
                    <h3>{project.title || 'プロジェクト名'}</h3>
                    {project.role && <span>{project.role}</span>}
                  </div>
                  <p>{project.description || '制作実績の概要がここに表示されます。'}</p>
                  <footer>
                    <span>{project.technologies}</span>
                    {project.url && <span>{displayUrl(project.url)}</span>}
                  </footer>
                </div>
              </article>
            ))}
          </div>
        </section>

        <footer className={styles.pageFooter}>
          <strong>{data.name || 'Portfolio'}</strong>
          <span>Created with Resume Studio</span>
        </footer>
      </div>
    </div>
  )
}
