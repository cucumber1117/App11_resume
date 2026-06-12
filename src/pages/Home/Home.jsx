import styles from './Home.module.css'

const templates = [
  {
    id: 'internship',
    label: 'インターン用',
    description: '学生向け。学歴や自己PRを中心に、経験と意欲を伝える履歴書。',
    icon: (
      <path d="M4 6h5V4h6v2h5v14H4V6Zm7 0h2V5.5h-2V6Zm-5 2v10h12V8H6Zm3 3h6v1.5H9V11Zm0 3h4v1.5H9V14Z" />
    )
  },
  {
    id: 'employment',
    label: '就職用',
    description: '新卒・中途採用向け。職歴、資格、自己PRを標準形式で整理。',
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
  }
]

export default function Home({ hasSavedData, onContinue, onSelectTemplate }) {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.logo} aria-hidden="true">R</span>
          <span>Resume Studio</span>
        </div>
        {hasSavedData && (
          <button className={styles.continueButton} onClick={onContinue}>
            編集を続ける
          </button>
        )}
      </header>

      <section className={styles.hero}>
        <div className={styles.copy}>
          <span className={styles.eyebrow}>Standard JIS Resume Builder</span>
          <h1>履歴書を、きれいに。<br />迷わず、すばやく。</h1>
          <p>
            入力内容をリアルタイムで確認しながら、JIS形式の履歴書を
            A4・2ページのPDFとして作成できます。
          </p>
          <div className={styles.actions}>
            <a className={styles.primaryAction} href="#templates">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 3.5h10.5L19 7v13.5H5v-17Zm2 2v13h10V7.8l-2.3-2.3H7Z" />
                <path d="M9 10h6v1.5H9V10Zm0 3h6v1.5H9V13Z" />
              </svg>
              履歴書を作成する
            </a>
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
              onClick={() => onSelectTemplate(template.id)}
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
      </section>

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
          <p>完成した履歴書をA4・2ページのPDFとしてダウンロードできます。</p>
        </article>
      </section>
    </main>
  )
}
