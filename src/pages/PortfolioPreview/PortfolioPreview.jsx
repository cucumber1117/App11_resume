import styles from './PortfolioPreview.module.css'
import {
  groupTechnologies,
  parseTechnologies
} from '../../utils/portfolio'

function PortfolioFooter({ data, school, page }) {
  return (
    <footer className={styles.pageFooter}>
      <strong>{data.name || 'Student Portfolio'}</strong>
      <span>{school || 'University Student'} / {page}</span>
    </footer>
  )
}

function displayUrl(value = '') {
  return value.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

export default function PortfolioPreview({ data }) {
  const technologies = parseTechnologies(data.skills)
  const technologyGroups = groupTechnologies(
    technologies,
    data.technologyCategories
  )
  const projects = data.projects.filter((project) => (
    project.title ||
    project.description ||
    project.screenshots.some((screenshot) => screenshot.image || screenshot.caption)
  ))
  const school = [
    data.universityName,
    data.facultyName,
    data.departmentName
  ].filter(Boolean).join('　')

  return (
    <div id="portfolio-preview" className={styles.preview}>
      <div
        className={styles.sheet}
        data-sheet="a4"
        style={{ '--portfolio-accent': data.accentColor }}
      >
        <header className={styles.header}>
          <div>
            <span className={styles.kicker}>STUDENT PORTFOLIO</span>
            <h1>{data.name || '氏名'}</h1>
            <p className={styles.school}>{school || '大学名　学部　学科'}</p>
          </div>
          <div className={styles.contact}>
            <span>CONTACT</span>
            <strong>{data.email || 'student@example.com'}</strong>
          </div>
        </header>

        <section className={styles.aboutSection}>
          <div className={styles.aboutBlock}>
            <h2>自己紹介</h2>
            <p>{data.bio || '自己紹介を入力すると、ここに表示されます。'}</p>
          </div>
        </section>

        <section className={styles.technologies}>
          <h2>使用技術</h2>
          <div className={styles.technologyGroups}>
            {(technologyGroups.length > 0
              ? technologyGroups
              : [{ label: '技術', items: ['使用技術'] }]
            ).map((group) => (
              <div className={styles.technologyGroup} key={group.label}>
                <strong>{group.label}</strong>
                <div className={styles.technologyList}>
                  {group.items.map((technology, index) => (
                    <span key={`${technology}-${index}`}>{technology}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.works}>
          <div className={styles.worksHeading}>
            <h2>制作物一覧</h2>
            <span>{String(projects.length).padStart(2, '0')} WORKS</span>
          </div>
          <div className={styles.projectGrid}>
            {(projects.length > 0 ? projects : [{ id: 'empty', screenshots: [] }])
              .map((project, index) => {
                const coverImage = project.screenshots.find(
                  (screenshot) => screenshot.image
                )?.image

                return (
                  <article className={styles.project} key={project.id}>
                    <div className={styles.projectImage}>
                      {coverImage ? (
                        <img src={coverImage} alt="" />
                      ) : (
                        <span>{String(index + 1).padStart(2, '0')}</span>
                      )}
                    </div>
                    <div className={styles.projectBody}>
                      <h3>{project.title || '制作物名'}</h3>
                      <p>{project.description || '制作物の説明がここに表示されます。'}</p>
                      {project.showUrl && project.url && (
                        <span className={styles.projectUrl}>
                          {displayUrl(project.url)}
                        </span>
                      )}
                    </div>
                  </article>
                )
              })}
          </div>
        </section>

        <PortfolioFooter data={data} school={school} page="01" />
      </div>

      {projects.map((project, projectIndex) => {
        const screenshots = project.screenshots.filter(
          (screenshot) => screenshot.image || screenshot.caption
        )

        return (
          <div
            className={`${styles.sheet} ${styles.detailSheet}`}
            data-sheet="a4"
            style={{ '--portfolio-accent': data.accentColor }}
            key={project.id}
          >
            <header className={styles.detailHeader}>
              <span>PROJECT {String(projectIndex + 1).padStart(2, '0')}</span>
              <h2>{project.title || '制作物名'}</h2>
              <p>{project.description || '制作物の説明'}</p>
              {project.showUrl && project.url && (
                <div className={styles.detailUrl}>
                  <span>URL</span>
                  <strong>{displayUrl(project.url)}</strong>
                </div>
              )}
            </header>

            <div className={styles.screenshotGrid}>
              {(screenshots.length > 0
                ? screenshots
                : [{ id: 'empty', image: '', caption: '' }]
              ).map((screenshot, screenshotIndex) => (
                <figure className={styles.screenshot} key={screenshot.id}>
                  <div className={styles.screenshotImage}>
                    {screenshot.image ? (
                      <img src={screenshot.image} alt="" />
                    ) : (
                      <span>IMAGE {String(screenshotIndex + 1).padStart(2, '0')}</span>
                    )}
                  </div>
                  <figcaption>
                    <strong>
                      {String(screenshotIndex + 1).padStart(2, '0')}
                    </strong>
                    <p>
                      {screenshot.caption ||
                        'この画像で伝えたい機能や工夫した点を説明します。'}
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>

            <PortfolioFooter
              data={data}
              school={school}
              page={String(projectIndex + 2).padStart(2, '0')}
            />
          </div>
        )
      })}
    </div>
  )
}
