import { useState } from 'react'
import styles from './PortfolioForm.module.css'
import {
  createPortfolioLink,
  createPortfolioProject,
  createPortfolioScreenshot,
  groupTechnologies,
  parseTechnologies,
  TECHNOLOGY_GROUPS
} from '../../utils/portfolio'

const MAX_PROJECTS = 6
const MAX_SCREENSHOTS = 4
const MAX_LINKS = 5
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
  const [technologyInput, setTechnologyInput] = useState('')
  const [technologyCategory, setTechnologyCategory] = useState(
    TECHNOLOGY_GROUPS[0].label
  )
  const technologies = parseTechnologies(data.skills)

  function updateField(field, value) {
    onChange({ ...data, [field]: value })
  }

  function addTechnology(value = technologyInput, category = technologyCategory) {
    const additions = parseTechnologies(value)
    if (additions.length === 0) return
    const nextTechnologies = [...technologies]
    const technologyCategories = { ...(data.technologyCategories || {}) }

    additions.forEach((technology) => {
      if (!nextTechnologies.some(
        (item) => item.toLowerCase() === technology.toLowerCase()
      )) {
        nextTechnologies.push(technology)
      }
      technologyCategories[technology] = category
    })

    onChange({
      ...data,
      skills: nextTechnologies.join(', '),
      technologyCategories
    })
    setTechnologyInput('')
  }

  function removeTechnology(technology) {
    const technologyCategories = { ...(data.technologyCategories || {}) }
    delete technologyCategories[technology]
    onChange({
      ...data,
      skills: technologies.filter((item) => item !== technology).join(', '),
      technologyCategories
    })
  }

  function updateProject(id, field, value) {
    onChange({
      ...data,
      projects: data.projects.map((project) => (
        project.id === id ? { ...project, [field]: value } : project
      ))
    })
  }

  function toggleProjectTechnology(projectId, technology) {
    onChange({
      ...data,
      projects: data.projects.map((project) => {
        if (project.id !== projectId) return project
        const selectedTechnologies = project.selectedTechnologies || []
        return {
          ...project,
          selectedTechnologies: selectedTechnologies.includes(technology)
            ? selectedTechnologies.filter((item) => item !== technology)
            : [...selectedTechnologies, technology]
        }
      })
    })
  }

  function addProjectLink(projectId) {
    onChange({
      ...data,
      projects: data.projects.map((project) => (
        project.id === projectId && project.links.length < MAX_LINKS
          ? { ...project, links: [...project.links, createPortfolioLink()] }
          : project
      ))
    })
  }

  function updateProjectLink(projectId, linkId, field, value) {
    onChange({
      ...data,
      projects: data.projects.map((project) => (
        project.id === projectId
          ? {
            ...project,
            links: project.links.map((link) => (
              link.id === linkId ? { ...link, [field]: value } : link
            ))
          }
          : project
      ))
    })
  }

  function removeProjectLink(projectId, linkId) {
    onChange({
      ...data,
      projects: data.projects.map((project) => (
        project.id === projectId
          ? {
            ...project,
            links: project.links.filter((link) => link.id !== linkId)
          }
          : project
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
          <div className={`${styles.fullWidth} ${styles.technologyField}`}>
            使用技術
            <div className={styles.technologyInputRow}>
              <select
                value={technologyCategory}
                onChange={(event) => setTechnologyCategory(event.target.value)}
                aria-label="追加先のカテゴリ"
              >
                {[
                  ...TECHNOLOGY_GROUPS.map((group) => group.label),
                  'その他'
                ].map((label) => (
                  <option value={label} key={label}>{label}</option>
                ))}
              </select>
              <input
                value={technologyInput}
                onChange={(event) => {
                  const value = event.target.value
                  if (value.endsWith(',') || value.endsWith('、')) {
                    addTechnology(value.slice(0, -1))
                    return
                  }
                  setTechnologyInput(value)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    addTechnology()
                  }
                }}
                placeholder="例: React"
              />
              <button type="button" onClick={() => addTechnology()}>
                追加
              </button>
            </div>
            {technologies.length > 0 && (
              <div className={styles.technologyTags}>
                {technologies.map((technology) => (
                  <span key={technology}>
                    <small>
                      {data.technologyCategories?.[technology] || '自動分類'}
                    </small>
                    <strong>{technology}</strong>
                    <button
                      type="button"
                      onClick={() => removeTechnology(technology)}
                      aria-label={`${technology}を削除`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className={styles.technologySuggestions}>
              <small>主要な言語・サービスから追加</small>
              {TECHNOLOGY_GROUPS.map((group) => {
                const availableItems = group.items.filter((technology) => (
                  !technologies.some(
                    (item) => item.toLowerCase() === technology.toLowerCase()
                  )
                ))
                if (availableItems.length === 0) return null

                return (
                  <div className={styles.technologySuggestionGroup} key={group.label}>
                    <strong>{group.label}</strong>
                    <div>
                      {availableItems.map((technology) => (
                        <button
                          type="button"
                          key={technology}
                          onClick={() => addTechnology(technology, group.label)}
                        >
                          ＋ {technology}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
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
                  担当箇所・役割（共同制作の場合）
                  <textarea
                    rows="3"
                    maxLength="250"
                    value={project.responsibility}
                    onChange={(event) => updateProject(
                      project.id,
                      'responsibility',
                      event.target.value
                    )}
                    placeholder="例：画面設計、フロントエンド実装、Firebaseとの連携を担当"
                  />
                  <small>
                    自分が担当した機能や工程を具体的に記入してください。
                  </small>
                </label>
                <div className={`${styles.fullWidth} ${styles.projectTechnologies}`}>
                  <div>
                    <strong>この制作物で使用した技術</strong>
                    <small>上の「使用技術」に追加した項目から選択できます。</small>
                  </div>
                  {technologies.length > 0 ? (
                    <div className={styles.projectTechnologyGroups}>
                      {groupTechnologies(
                        technologies,
                        data.technologyCategories
                      ).map((group) => (
                        <div
                          className={styles.projectTechnologyGroup}
                          key={group.label}
                        >
                          <strong>{group.label}</strong>
                          <div>
                            {group.items.map((technology) => (
                              <label key={technology}>
                                <input
                                  type="checkbox"
                                  checked={Boolean(
                                    project.selectedTechnologies?.includes(technology)
                                  )}
                                  onChange={() => toggleProjectTechnology(
                                    project.id,
                                    technology
                                  )}
                                />
                                <span>{technology}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>先に「使用技術」へ技術を追加してください。</p>
                  )}
                </div>
                <div className={`${styles.fullWidth} ${styles.projectLinks}`}>
                  <div className={styles.projectLinksHeader}>
                    <div>
                      <strong>制作物URL</strong>
                      <small>GitHub、公開サイト、動画などを複数登録できます。</small>
                    </div>
                    <button
                      type="button"
                      onClick={() => addProjectLink(project.id)}
                      disabled={project.links.length >= MAX_LINKS}
                    >
                      ＋ URLを追加
                    </button>
                  </div>
                  {project.links.length === 0 && (
                    <p>必要な場合はURLを追加してください。</p>
                  )}
                  {project.links.map((link, linkIndex) => (
                    <div className={styles.projectLinkRow} key={link.id}>
                      <label>
                        表示名
                        <input
                          value={link.label}
                          onChange={(event) => updateProjectLink(
                            project.id,
                            link.id,
                            'label',
                            event.target.value
                          )}
                          placeholder={linkIndex === 0 ? 'GitHub' : '公開サイト'}
                        />
                      </label>
                      <label>
                        URL
                        <input
                          type="url"
                          value={link.url}
                          onChange={(event) => updateProjectLink(
                            project.id,
                            link.id,
                            'url',
                            event.target.value
                          )}
                          placeholder="https://example.com"
                        />
                      </label>
                      <label className={styles.urlToggle}>
                        <input
                          type="checkbox"
                          checked={Boolean(link.show)}
                          onChange={(event) => updateProjectLink(
                            project.id,
                            link.id,
                            'show',
                            event.target.checked
                          )}
                        />
                        <span aria-hidden="true" />
                        PDF表示
                      </label>
                      <button
                        type="button"
                        className={styles.removeLinkButton}
                        onClick={() => removeProjectLink(project.id, link.id)}
                        aria-label={`${link.label || `URL ${linkIndex + 1}`}を削除`}
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </div>
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
        <button type="submit">一時保存する</button>
      </div>
    </form>
  )
}
