import { useState } from 'react'
import styles from './Home.module.css'

const templates = [
  {
    id: 'internship',
    label: 'インターン用',
    description: '学生向け。学歴、志望理由、自己PRを中心に経験と意欲を伝える履歴書。',
    icon: (
      <path d="M4 6h5V4h6v2h5v14H4V6Zm7 0h2V5.5h-2V6Zm-5 2v10h12V8H6Zm3 3h6v1.5H9V11Zm0 3h4v1.5H9V14Z" />
    )
  },
  {
    id: 'employment',
    label: '就職用',
    description: '新卒・中途採用向け。職歴、資格、志望理由、自己PRを標準形式で整理。',
    icon: (
      <path d="M3 7h5V4h8v3h5v13H3V7Zm7-1.5V7h4V5.5h-4ZM5 9v9h14V9H5Zm5 2h4v1.5h-4V11Z" />
    )
  },
  {
    id: 'parttime',
    label: 'バイト用',
    description: 'アルバイト応募向け。希望条件や勤務可能時間を簡潔に記入。',
    icon: (
      <path d="M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Zm0 2a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm1 2v4.6l3 1.8-1 1.7-4-2.4V7h2Z" />
    )
  },
  {
    id: 'custom',
    label: 'カスタム',
    description: '必要な情報を自分で選択して、用途に合った履歴書を作成。',
    icon: (
      <path d="M4 5h10v2H4V5Zm0 6h16v2H4v-2Zm0 6h7v2H4v-2Zm13-13h3v4h-3V4Zm-4 12h3v4h-3v-4Z" />
    )
  }
]

const templateLabels = {
  internship: 'インターン用',
  employment: '就職用',
  parttime: 'バイト用',
  custom: 'カスタム'
}

const customSectionOptions = [
  { id: 'photo', label: '証明写真' },
  { id: 'gender', label: '性別' },
  { id: 'alternateContact', label: '現住所以外の連絡先' },
  { id: 'history', label: '学歴・職歴' },
  { id: 'historyContinuation', label: '学歴・職歴の続き（2ページ目）' },
  { id: 'licenses', label: '免許・資格' },
  { id: 'motivation', label: '志望理由' },
  { id: 'selfPR', label: '自己PR' },
  { id: 'personalRequest', label: '本人希望記入欄' }
]

function formatUpdatedAt(value) {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value))
}

export default function Home({
  drafts,
  portfolioDrafts,
  onOpenDraft,
  onDeleteDraft,
  onCreatePortfolio,
  onOpenPortfolioDraft,
  onDeletePortfolioDraft,
  onSelectTemplate
}) {
  const latestResumeDraft = drafts[0]
  const latestPortfolioDraft = portfolioDrafts[0]
  const latestDraft = [latestResumeDraft, latestPortfolioDraft]
    .filter(Boolean)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0]
  const latestDraftIsPortfolio = latestDraft?.id === latestPortfolioDraft?.id
  const [isCustomOpen, setIsCustomOpen] = useState(false)
  const [customSections, setCustomSections] = useState({
    photo: true,
    gender: true,
    alternateContact: false,
    history: true,
    historyContinuation: false,
    licenses: true,
    motivation: true,
    selfPR: true,
    personalRequest: true
  })

  function handleTemplateClick(templateId) {
    if (templateId === 'custom') {
      setIsCustomOpen(true)
      return
    }
    onSelectTemplate(templateId)
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.logo} aria-hidden="true">R</span>
          <span>Resume Studio</span>
        </div>
        {latestDraft && (
          <button
            className={styles.continueButton}
            onClick={() => (
              latestDraftIsPortfolio
                ? onOpenPortfolioDraft(latestDraft.id)
                : onOpenDraft(latestDraft.id)
            )}
          >
            編集を続ける
          </button>
        )}
      </header>

      <section className={styles.hero}>
        <div className={styles.copy}>
          <span className={styles.eyebrow}>Standard JIS Resume Builder</span>
          <h1>履歴書を、きれいに。<br />迷わず、すばやく。</h1>
          <p>
            入力内容をリアルタイムで確認しながら、履歴書とポートフォリオを
            A4のPDFとして作成できます。
          </p>
          <div className={styles.actions}>
            <a className={styles.primaryAction} href="#templates">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 3.5h10.5L19 7v13.5H5v-17Zm2 2v13h10V7.8l-2.3-2.3H7Z" />
                <path d="M9 10h6v1.5H9V10Zm0 3h6v1.5H9V13Z" />
              </svg>
              履歴書を作成する
            </a>
            <button
              className={styles.secondaryAction}
              type="button"
              onClick={onCreatePortfolio}
            >
              ポートフォリオを作成する
            </button>
          </div>
        </div>

        <div className={styles.previewCard} aria-hidden="true">
          <div className={styles.paper}>
            <div className={styles.paperTitle}>履 歴 書</div>
            <div className={styles.paperPhoto} />
            <div className={`${styles.paperLine} ${styles.paperLineShort}`} />
            <div className={styles.paperLine} />
            <div className={styles.paperLine} />
            <div className={styles.paperGrid}>
              {Array.from({ length: 8 }, (_, index) => <span key={index} />)}
            </div>
          </div>
        </div>
      </section>

      <section id="templates" className={styles.templates}>
        <div className={styles.templateHeading}>
          <span className={styles.eyebrow}>Create Resume</span>
          <h2>履歴書の作成</h2>
          <p>用途に合ったテンプレートを選んでください。</p>
        </div>
        <div className={styles.templateGrid}>
          {templates.map((template) => (
            <button
              key={template.id}
              className={styles.templateCard}
              onClick={() => handleTemplateClick(template.id)}
            >
              <span className={styles.templateIcon}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  {template.icon}
                </svg>
              </span>
              <span className={styles.templateCardBody}>
                <strong>{template.label}</strong>
                <small>{template.description}</small>
              </span>
              <svg className={styles.templateArrow} viewBox="0 0 24 24" aria-hidden="true">
                <path d="m9 5 7 7-7 7-1.4-1.4 5.6-5.6-5.6-5.6L9 5Z" />
              </svg>
            </button>
          ))}
        </div>

        {isCustomOpen && (
          <div className={styles.customBuilder}>
            <div className={styles.customBuilderHeader}>
              <div>
                <h3>必要な情報を選択</h3>
                <p>基本情報・生年月日・現住所・連絡先は常に含まれます。</p>
              </div>
              <button
                type="button"
                className={styles.customClose}
                onClick={() => setIsCustomOpen(false)}
                aria-label="カスタム設定を閉じる"
              >
                ×
              </button>
            </div>
            <div className={styles.customOptions}>
              {customSectionOptions.map((option) => (
                <label className={styles.customOption} key={option.id}>
                  <input
                    type="checkbox"
                    checked={customSections[option.id]}
                    disabled={
                      option.id === 'historyContinuation' &&
                      !customSections.history
                    }
                    onChange={(event) => {
                      const checked = event.target.checked
                      setCustomSections((current) => {
                        const nextSections = {
                          ...current,
                          [option.id]: checked
                        }

                        if (option.id === 'history' && !checked) {
                          nextSections.historyContinuation = false
                        }

                        return nextSections
                      })
                    }}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            <button
              type="button"
              className={styles.customStartButton}
              onClick={() => onSelectTemplate('custom', customSections)}
            >
              この項目で履歴書を作成
            </button>
          </div>
        )}
      </section>

      <section className={styles.portfolioSection}>
        <div className={styles.portfolioCopy}>
          <span className={styles.eyebrow}>Create Portfolio</span>
          <h2>学生生活の学びと制作物を、ひとつの資料に。</h2>
          <p>
            大学情報、自己紹介、使用技術、制作物を整理して、
            就職・インターン応募に使えるA4ポートフォリオを作成できます。
          </p>
          <button type="button" onClick={onCreatePortfolio}>
            新しいポートフォリオを作成
          </button>
        </div>
        <div className={styles.portfolioMock} aria-hidden="true">
          <span>PORTFOLIO</span>
          <strong>Student Works</strong>
          <div>
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>
      </section>

      {drafts.length > 0 && (
        <section className={styles.drafts}>
          <div className={styles.templateHeading}>
            <span className={styles.eyebrow}>Saved Drafts</span>
            <h2>保存した下書き</h2>
            <p>編集を再開する下書きを選択してください。</p>
          </div>
          <div className={styles.draftGrid}>
            {drafts.map((draft) => (
              <article className={styles.draftCard} key={draft.id}>
                <button
                  className={styles.draftOpenButton}
                  onClick={() => onOpenDraft(draft.id)}
                >
                  <span className={styles.draftType}>
                    {templateLabels[draft.data?.templateType] || '就職用'}
                  </span>
                  <strong>{draft.title}</strong>
                  <small>更新: {formatUpdatedAt(draft.updatedAt)}</small>
                </button>
                <button
                  className={styles.draftDeleteButton}
                  onClick={() => onDeleteDraft(draft.id)}
                  aria-label={`${draft.title}を削除`}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8 3h8l1 2h4v2H3V5h4l1-2Zm1.2 2h5.6l-.3-.5h-5l-.3.5ZM6 9h12l-1 12H7L6 9Zm2.2 2 .7 8h6.2l.7-8H8.2Z" />
                  </svg>
                </button>
              </article>
            ))}
          </div>
        </section>
      )}

      {portfolioDrafts.length > 0 && (
        <section className={styles.drafts}>
          <div className={styles.templateHeading}>
            <span className={styles.eyebrow}>Portfolio Drafts</span>
            <h2>保存したポートフォリオ</h2>
            <p>編集を再開する下書きを選択してください。</p>
          </div>
          <div className={styles.draftGrid}>
            {portfolioDrafts.map((draft) => (
              <article className={styles.draftCard} key={draft.id}>
                <button
                  className={styles.draftOpenButton}
                  onClick={() => onOpenPortfolioDraft(draft.id)}
                >
                  <span className={styles.draftType}>ポートフォリオ</span>
                  <strong>{draft.title}</strong>
                  <small>更新: {formatUpdatedAt(draft.updatedAt)}</small>
                </button>
                <button
                  className={styles.draftDeleteButton}
                  onClick={() => onDeletePortfolioDraft(draft.id)}
                  aria-label={`${draft.title}を削除`}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8 3h8l1 2h4v2H3V5h4l1-2Zm1.2 2h5.6l-.3-.5h-5l-.3.5ZM6 9h12l-1 12H7L6 9Zm2.2 2 .7 8h6.2l.7-8H8.2Z" />
                  </svg>
                </button>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className={styles.features}>
        <article>
          <span className={styles.featureNumber}>01</span>
          <h2>リアルタイム確認</h2>
          <p>入力した内容を、印刷時に近いプレビューですぐ確認できます。</p>
        </article>
        <article>
          <span className={styles.featureNumber}>02</span>
          <h2>一時保存</h2>
          <p>入力途中の内容はブラウザへ保存し、あとから編集を再開できます。</p>
        </article>
        <article>
          <span className={styles.featureNumber}>03</span>
          <h2>PDF出力</h2>
          <p>完成した履歴書とポートフォリオをA4のPDFとしてダウンロードできます。</p>
        </article>
      </section>
    </main>
  )
}
