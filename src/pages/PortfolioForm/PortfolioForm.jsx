import styles from './PortfolioForm.module.css'
import { createPortfolioProject } from '../../utils/portfolio'

const MAX_PROJECTS = 6

function readImage(file, onLoad) {
  if (!file || !file.type.startsWith('image/')) return
  const reader = new FileReader()
  reader.onload = () => onLoad(reader.result)
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

  function handleProjectImage(id, file) {
    readImage(file, (image) => updateProject(id, 'image', image))
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
            <span>Profile</span>
            <h2>プロフィール</h2>
          </div>
        </div>
        <div className={styles.grid}>
          <label>
            氏名・活動名
            <input
              value={data.name}
              onChange={(event) => updateField('name', event.target.value)}
              placeholder="山田 太郎"
            />
          </label>
          <label>
            肩書き
            <input
              value={data.jobTitle}
              onChange={(event) => updateField('jobTitle', event.target.value)}
              placeholder="Webデザイナー / フロントエンドエンジニア"
            />
          </label>
          <label className={styles.fullWidth}>
            自己紹介
            <textarea
              rows="5"
              maxLength="500"
              value={data.bio}
              onChange={(event) => updateField('bio', event.target.value)}
              placeholder="得意分野や仕事で大切にしていることを簡潔に紹介します。"
            />
            <small>{data.bio.length} / 500文字</small>
          </label>
          <label>
            メールアドレス
            <input
              type="email"
              value={data.email}
              onChange={(event) => updateField('email', event.target.value)}
              placeholder="hello@example.com"
            />
          </label>
          <label>
            Webサイト・SNS
            <input
              type="url"
              value={data.website}
              onChange={(event) => updateField('website', event.target.value)}
              placeholder="https://example.com"
            />
          </label>
          <label className={styles.fullWidth}>
            スキル
            <input
              value={data.skills}
              onChange={(event) => updateField('skills', event.target.value)}
              placeholder="React, JavaScript, Figma, UI Design"
            />
            <small>カンマ区切りで入力してください。</small>
          </label>
          <label className={styles.colorField}>
            アクセントカラー
            <span>
              <input
                type="color"
                value={data.accentColor}
                onChange={(event) => updateField('accentColor', event.target.value)}
              />
              {data.accentColor}
            </span>
          </label>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <span>Works</span>
            <h2>制作実績</h2>
          </div>
          <button
            type="button"
            className={styles.addButton}
            onClick={addProject}
            disabled={data.projects.length >= MAX_PROJECTS}
          >
            ＋ 実績を追加
          </button>
        </div>

        <div className={styles.projects}>
          {data.projects.map((project, index) => (
            <article className={styles.project} key={project.id}>
              <div className={styles.projectHeader}>
                <strong>実績 {index + 1}</strong>
                <button
                  type="button"
                  onClick={() => removeProject(project.id)}
                  aria-label={`実績${index + 1}を削除`}
                >
                  削除
                </button>
              </div>
              <div className={styles.grid}>
                <label>
                  プロジェクト名
                  <input
                    value={project.title}
                    onChange={(event) => updateProject(project.id, 'title', event.target.value)}
                    placeholder="サービス・作品名"
                  />
                </label>
                <label>
                  担当・役割
                  <input
                    value={project.role}
                    onChange={(event) => updateProject(project.id, 'role', event.target.value)}
                    placeholder="企画、デザイン、実装"
                  />
                </label>
                <label className={styles.fullWidth}>
                  概要・成果
                  <textarea
                    rows="4"
                    maxLength="350"
                    value={project.description}
                    onChange={(event) => updateProject(project.id, 'description', event.target.value)}
                    placeholder="課題、工夫した点、成果などを記入します。"
                  />
                </label>
                <label>
                  使用技術
                  <input
                    value={project.technologies}
                    onChange={(event) => updateProject(project.id, 'technologies', event.target.value)}
                    placeholder="React, CSS, Firebase"
                  />
                </label>
                <label>
                  URL
                  <input
                    type="url"
                    value={project.url}
                    onChange={(event) => updateProject(project.id, 'url', event.target.value)}
                    placeholder="https://..."
                  />
                </label>
                <label className={styles.fullWidth}>
                  メイン画像
                  <span className={styles.imageInput}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleProjectImage(
                        project.id,
                        event.target.files?.[0]
                      )}
                    />
                    {project.image && (
                      <button
                        type="button"
                        onClick={() => updateProject(project.id, 'image', '')}
                      >
                        画像を削除
                      </button>
                    )}
                  </span>
                </label>
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
