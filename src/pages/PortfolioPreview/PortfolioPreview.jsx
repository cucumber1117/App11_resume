import styles from './PortfolioPreview.module.css'
import { parseTechnologies } from '../../utils/portfolio'
import TechnologyDisplay from './TechnologyDisplay'

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
        className={`${styles.sheet} ${styles.profileSheet}`}
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
            <code>{data.email || 'student@example.com'}</code>
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
          <TechnologyDisplay
            technologies={technologies}
            categoryAssignments={data.technologyCategories}
            emptyLabel="使用技術"
          />
        </section>

        <PortfolioFooter data={data} school={school} page="01" />
      </div>

      <div
        className={`${styles.sheet} ${styles.worksSheet}`}
        data-sheet="a4"
        style={{ '--portfolio-accent': data.accentColor }}
      >
        <section className={styles.works}>
          <div className={styles.worksHeading}>
            <div>
              <span className={styles.kicker}>SELECTED WORKS</span>
              <h2>制作物一覧</h2>
            </div>
            <span>{String(projects.length).padStart(2, '0')} WORKS</span>
          </div>
          <div className={styles.projectGrid}>
            {(projects.length > 0
              ? projects
              : [{ id: 'empty', screenshots: [], links: [] }])
              .map((project, index) => (
                <article className={styles.project} key={project.id}>
                  <div className={styles.projectBody}>
                    <strong className={styles.projectNumber}>
                      {String(index + 1).padStart(2, '0')}
                    </strong>
                    <h3>{project.title || '制作物名'}</h3>
                    <div className={styles.projectSummary}>
                      <strong>制作物の説明</strong>
                      <p>{project.description || '制作物の説明がここに表示されます。'}</p>
                    </div>
                    {project.selectedTechnologies?.length > 0 && (
                      <div className={styles.projectTechnologySummary}>
                        <strong>使用技術</strong>
                        <TechnologyDisplay
                          technologies={project.selectedTechnologies}
                          categoryAssignments={data.technologyCategories}
                          compact
                          grouped={false}
                        />
                      </div>
                    )}
                  </div>
                </article>
              ))}
          </div>
        </section>

        <PortfolioFooter data={data} school={school} page="02" />
      </div>

      {projects.map((project, projectIndex) => {
        const screenshots = project.screenshots.filter(
          (screenshot) => screenshot.image || screenshot.caption
        )
        const visibleLinks = project.links.filter(
          (link) => link.show && link.url
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
              <div className={styles.detailDescription}>
                <span>制作物の説明</span>
                <p>{project.description || '制作物の説明'}</p>
              </div>
              {project.responsibility && (
                <div className={styles.detailResponsibility}>
                  <span>担当箇所・役割</span>
                  <p>{project.responsibility}</p>
                </div>
              )}
              {project.selectedTechnologies?.length > 0 && (
                <div className={styles.detailTechnologies}>
                  <span>使用技術</span>
                  <TechnologyDisplay
                    technologies={project.selectedTechnologies}
                    categoryAssignments={data.technologyCategories}
                    grouped={false}
                  />
                </div>
              )}
              {visibleLinks.length > 0 && (
                <div className={styles.detailUrl}>
                  <span>URL</span>
                  <div>
                    {visibleLinks.map((link) => (
                      <div className={styles.detailLink} key={link.id}>
                        <strong>{link.label || 'Link'}</strong>
                        <code>{displayUrl(link.url)}</code>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </header>

            <div
              className={[
                styles.screenshotGrid,
                screenshots.length === 1 ? styles.singleScreenshotGrid : ''
              ].filter(Boolean).join(' ')}
            >
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
              page={String(projectIndex + 3).padStart(2, '0')}
            />
          </div>
        )
      })}
    </div>
  )
}
