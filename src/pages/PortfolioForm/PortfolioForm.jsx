import styles from './PortfolioForm.module.css'
import {
  createPortfolioProject,
  createPortfolioScreenshot
} from '../../utils/portfolio'

const MAX_PROJECTS = 6
const MAX_SCREENSHOTS = 4

function readImage(file, onLoad) {
  if (!file || !file.type.startsWith('image/')) return
  if (file.size > 10 * 1024 * 1024) {
    alert('画像は10MB以下のファイルを選択してください。')
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    const image = new Image()
    image.onload = () => {
      const maxSize = 1200
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(image.width * scale))
      canvas.height = Math.max(1, Math.round(image.height * scale))
      const context = canvas.getContext('2d')
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      onLoad(canvas.toDataURL('image/jpeg', 0.78))
    }
    image.onerror = () => alert('画像を読み込めませんでした。')
    image.src = reader.result
  }
  reader.readAsDataURL(file)
}

export default function PortfolioForm({ data, onChange, onSave }) {
  function updateField(field, value) {
    onChange({ ...data, [field]: value })
  }

  function updateProject(id, field, value) {
    onChange({
      ...data,
      projects: data.projects.map((project) => (
        project.id === id ? { ...project, [field]: value } : project
      ))
    })
  }

  function addProject() {
    if (data.projects.length >= MAX_PROJECTS) return
    onChange({
      ...data,
      projects: [...data.projects, createPortfolioProject()]
    })
  }

  function removeProject(id) {
    if (data.projects.length === 1) {
      onChange({ ...data, projects: [createPortfolioProject()] })
      return
    }
    onChange({
      ...data,
      projects: data.projects.filter((project) => project.id !== id)
    })
  }

  function updateScreenshot(projectId, screenshotId, field, value) {
    onChange({
      ...data,
      projects: data.projects.map((project) => (
        project.id === projectId
          ? {
            ...project,
            screenshots: project.screenshots.map((screenshot) => (
              screenshot.id === screenshotId
                ? { ...screenshot, [field]: value }
                : screenshot
            ))
          }
          : project
      ))
    })
  }

  function addScreenshot(projectId) {
    onChange({
      ...data,
      projects: data.projects.map((project) => (
        project.id === projectId && project.screenshots.length < MAX_SCREENSHOTS
          ? {
            ...project,
            screenshots: [...project.screenshots, createPortfolioScreenshot()]
          }
          : project
      ))
    })
  }

  function removeScreenshot(projectId, screenshotId) {
    onChange({
      ...data,
      projects: data.projects.map((project) => {
        if (project.id !== projectId) return project
        const screenshots = project.screenshots.filter(
          (screenshot) => screenshot.id !== screenshotId
        )
        return {
          ...project,
          screenshots: screenshots.length > 0
            ? screenshots
            : [createPortfolioScreenshot()]
        }
      })
    })
  }

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault()
        onSave(data)
      }}
    >
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <span>Student Information</span>
            <h2>学生情報</h2>
          </div>
        </div>
        <div className={styles.grid}>
          <label>
            氏名
            <input
              value={data.name}
              onChange={(event) => updateField('name', event.target.value)}
              placeholder="山田 太郎"
            />
          </label>
          <label>
            連絡先メール
            <input
              type="email"
              value={data.email}
              onChange={(event) => updateField('email', event.target.value)}
              placeholder="student@example.com"
            />
          </label>
          <label>
            大学名
            <input
              value={data.universityName}
              onChange={(event) => updateField('universityName', event.target.value)}
              placeholder="○○大学"
            />
          </label>
          <label>
            学部
            <input
              value={data.facultyName}
              onChange={(event) => updateField('facultyName', event.target.value)}
              placeholder="情報学部"
            />
          </label>
          <label>
            学科
            <input
              value={data.departmentName}
              onChange={(event) => updateField('departmentName', event.target.value)}
              placeholder="情報システム学科"
            />
          </label>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <span>About Me</span>
            <h2>自己紹介・使用技術</h2>
          </div>
        </div>
        <div className={styles.grid}>
          <label className={styles.fullWidth}>
            自己紹介
            <textarea
              rows="5"
              maxLength="500"
              value={data.bio}
              onChange={(event) => updateField('bio', event.target.value)}
              placeholder="興味のある分野や、現在学んでいることを紹介します。"
            />
            <small>{data.bio.length} / 500文字</small>
          </label>
          <label className={styles.fullWidth}>
            使用技術
            <input
              value={data.skills}
              onChange={(event) => updateField('skills', event.target.value)}
              placeholder="React, JavaScript, HTML, CSS, Figma"
            />
            <small>カンマ区切りで入力してください。</small>
          </label>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <span>Projects</span>
            <h2>制作物</h2>
          </div>
          <button
            type="button"
            className={styles.addButton}
            onClick={addProject}
            disabled={data.projects.length >= MAX_PROJECTS}
          >
            ＋ 制作物を追加
          </button>
        </div>

        <div className={styles.projects}>
          {data.projects.map((project, index) => (
            <article className={styles.project} key={project.id}>
              <div className={styles.projectHeader}>
                <strong>制作物 {index + 1}</strong>
                <button
                  type="button"
                  onClick={() => removeProject(project.id)}
                  aria-label={`制作物${index + 1}を削除`}
                >
                  削除
                </button>
              </div>
              <div className={styles.grid}>
                <label className={styles.fullWidth}>
                  制作物名
                  <input
                    value={project.title}
                    onChange={(event) => updateProject(project.id, 'title', event.target.value)}
                    placeholder="アプリ・Webサイト・作品名"
                  />
                </label>
                <label className={styles.fullWidth}>
                  制作物の説明
                  <textarea
                    rows="4"
                    maxLength="350"
                    value={project.description}
                    onChange={(event) => updateProject(project.id, 'description', event.target.value)}
                    placeholder="制作した目的、特徴、工夫した点などを記入します。"
                  />
                </label>
                <label className={styles.fullWidth}>
                  制作物の画像と説明
                  <small>
                    画面、機能、工夫した部分などを画像ごとに説明できます。
                  </small>
                </label>
                <div className={styles.screenshotList}>
                  {project.screenshots.map((screenshot, screenshotIndex) => (
                    <div className={styles.screenshotEditor} key={screenshot.id}>
                      <div className={styles.screenshotHeader}>
                        <strong>画像 {screenshotIndex + 1}</strong>
                        <button
                          type="button"
                          onClick={() => removeScreenshot(project.id, screenshot.id)}
                        >
                          削除
                        </button>
                      </div>
                      <div className={styles.screenshotFields}>
                        <label className={styles.imagePicker}>
                          {screenshot.image ? (
                            <img src={screenshot.image} alt="" />
                          ) : (
                            <span>画像を選択</span>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(event) => readImage(
                              event.target.files?.[0],
                              (image) => updateScreenshot(
                                project.id,
                                screenshot.id,
                                'image',
                                image
                              )
                            )}
                          />
                        </label>
                        <label>
                          この画像の説明
                          <textarea
                            rows="4"
                            maxLength="240"
                            value={screenshot.caption}
                            onChange={(event) => updateScreenshot(
                              project.id,
                              screenshot.id,
                              'caption',
                              event.target.value
                            )}
                            placeholder="何を示す画面か、工夫した点や操作方法を説明します。"
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className={styles.addScreenshotButton}
                  onClick={() => addScreenshot(project.id)}
                  disabled={project.screenshots.length >= MAX_SCREENSHOTS}
                >
                  ＋ 画像と説明を追加
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className={styles.footer}>
        <button type="submit">下書きを保存</button>
      </div>
    </form>
  )
}
