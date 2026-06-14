import { useState } from 'react'
import './App.css'
import Home from './pages/Home/Home'
import PortfolioForm from './pages/PortfolioForm/PortfolioForm'
import PortfolioPreview from './pages/PortfolioPreview/PortfolioPreview'
import ResumeForm from './pages/ResumeForm/ResumeForm'
import ResumePreview from './pages/ResumePreview/ResumePreview'
import {
  createPortfolioProject,
  createPortfolioScreenshot
} from './utils/portfolio'

const LEGACY_STORAGE_KEY = 'resume_full_tdu'
const DRAFTS_STORAGE_KEY = 'resume_drafts_v1'
const PORTFOLIO_DRAFTS_STORAGE_KEY = 'portfolio_drafts_v1'
let historyItemIdCounter = 0

function createHistoryItemId() {
  historyItemIdCounter += 1
  return `history-${Date.now().toString(36)}-${historyItemIdCounter.toString(36)}`
}

function createHistoryItem(overrides = {}) {
  return {
    id: createHistoryItemId(),
    year: '',
    month: '',
    content: '',
    align: 'left',
    ...overrides
  }
}

const TEMPLATE_SECTION_PRESETS = {
  internship: {
    photo: true,
    gender: false,
    alternateContact: false,
    history: true,
    historyContinuation: false,
    licenses: false,
    motivation: true,
    selfPR: true,
    personalRequest: false
  },
  employment: {
    photo: true,
    gender: true,
    alternateContact: true,
    history: true,
    historyContinuation: false,
    licenses: true,
    motivation: true,
    selfPR: true,
    personalRequest: true
  },
  parttime: {
    photo: true,
    gender: false,
    alternateContact: false,
    history: true,
    historyContinuation: false,
    licenses: false,
    motivation: false,
    selfPR: false,
    personalRequest: true
  },
  custom: {
    photo: true,
    gender: true,
    alternateContact: true,
    history: true,
    historyContinuation: false,
    licenses: true,
    motivation: true,
    selfPR: true,
    personalRequest: true
  }
}

const SECTION_OPTIONS = [
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

function getTodayParts() {
  const today = new Date()
  return {
    year: String(today.getFullYear()),
    month: String(today.getMonth() + 1),
    day: String(today.getDate())
  }
}

function calculateAge(birthDate, referenceDate) {
  const birthYear = Number(birthDate?.year)
  const birthMonth = Number(birthDate?.month)
  const birthDay = Number(birthDate?.day)
  const referenceYear = Number(referenceDate?.year)
  const referenceMonth = Number(referenceDate?.month)
  const referenceDay = Number(referenceDate?.day)

  if (
    !birthYear || !birthMonth || !birthDay ||
    !referenceYear || !referenceMonth || !referenceDay
  ) {
    return ''
  }

  let age = referenceYear - birthYear
  if (
    referenceMonth < birthMonth ||
    (referenceMonth === birthMonth && referenceDay < birthDay)
  ) {
    age -= 1
  }

  return age >= 0 ? String(age) : ''
}

function formatPhoneNumber(value = '') {
  const digits = String(value).replace(/\D/g, '').slice(0, 11)

  if (digits.length <= 3) {
    return digits
  }

  if (digits.length === 11 || /^(070|080|090|050)/.test(digits)) {
    return [digits.slice(0, 3), digits.slice(3, 7), digits.slice(7)]
      .filter(Boolean)
      .join('-')
  }

  if (/^(03|06)/.test(digits)) {
    return [digits.slice(0, 2), digits.slice(2, 6), digits.slice(6)]
      .filter(Boolean)
      .join('-')
  }

  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6)]
    .filter(Boolean)
    .join('-')
}

const todayParts = getTodayParts()

const defaultData = {
  templateType: 'employment',
  templateSections: TEMPLATE_SECTION_PRESETS.employment,

  // 履歴書 共通日付
  resumeDate: todayParts,
  
  // 履歴書 氏名・基本情報
  nameFurigana: '',
  name: '',
  gender: '',
  birthDate: { year: '', month: '', day: '', age: '' },
  photo: '',
  
  // 現住所
  addressFurigana: '',
  addressZip: '',
  address: '',
  tel: '',
  email: '',
  
  // 連絡先 (現住所と異なる場合のみ)
  altAddressFurigana: '',
  altAddressZip: '',
  altAddress: '',
  altTel: '',
  altEmail: '',

  // 学歴・職歴 (プレビューでは最大21行)
  gridItems: [
    createHistoryItem({ content: '学　　歴', align: 'center' }),
    createHistoryItem(),
    createHistoryItem(),
    createHistoryItem(),
    createHistoryItem(),
    createHistoryItem({ content: '職　　歴', align: 'center' }),
    createHistoryItem(),
    createHistoryItem(),
    createHistoryItem(),
    createHistoryItem(),
    createHistoryItem({ content: '以　　上', align: 'right' }),
    createHistoryItem(),
    createHistoryItem(),
    createHistoryItem(),
    createHistoryItem(),
    createHistoryItem(),
    createHistoryItem(),
    createHistoryItem(),
    createHistoryItem(),
    createHistoryItem(),
    createHistoryItem(),
  ],

  // 免許・資格 (5行)
  licenseItems: [
    { year: '', month: '', content: '' },
    { year: '', month: '', content: '' },
    { year: '', month: '', content: '' },
    { year: '', month: '', content: '' },
    { year: '', month: '', content: '' },
  ],

  // 自己PR
  selfPR: '',

  // 志望理由
  motivation: '',

  // 本人希望記入欄
  personalRequest: '',
  
}

const defaultPortfolioData = {
  name: '',
  universityName: '',
  facultyName: '',
  departmentName: '',
  profile: '',
  bio: '',
  email: '',
  skills: '',
  accentColor: '#6d4aff'
}

function createDefaultPortfolioData() {
  return {
    ...structuredClone(defaultPortfolioData),
    projects: [createPortfolioProject()]
  }
}

function normalizePortfolioData(savedData = {}) {
  const projects = Array.isArray(savedData.projects) && savedData.projects.length > 0
    ? savedData.projects.map((project) => {
      const savedScreenshots = Array.isArray(project.screenshots)
        ? project.screenshots
        : []
      const screenshots = savedScreenshots.length > 0
        ? savedScreenshots.map((screenshot) => ({
          ...createPortfolioScreenshot(),
          ...screenshot
        }))
        : [{
          ...createPortfolioScreenshot(),
          image: project.image || ''
        }]

      return {
        ...createPortfolioProject(),
        ...project,
        screenshots
      }
    })
    : [createPortfolioProject()]

  return {
    ...createDefaultPortfolioData(),
    ...savedData,
    profile: savedData.profile || savedData.jobTitle || '',
    projects
  }
}

function createDefaultData(
  templateType = 'employment',
  templateSections = TEMPLATE_SECTION_PRESETS[templateType]
) {
  return {
    ...structuredClone(defaultData),
    templateType,
    templateSections: {
      ...(TEMPLATE_SECTION_PRESETS[templateType] || TEMPLATE_SECTION_PRESETS.custom),
      ...(templateSections || {})
    },
    resumeDate: getTodayParts()
  }
}

function normalizeHistoryItems(items = []) {
  const seenHeadings = new Set()
  const normalizedItems = items.filter((item) => {
    const content = (item.content || '').replaceAll('　', '').trim()
    if (content === '賞罰' || content === 'なし') {
      return false
    }

    if (content === '学歴' || content === '職歴') {
      if (seenHeadings.has(content)) {
        return false
      }
      seenHeadings.add(content)
    }

    return true
  }).map((item) => ({
    ...item,
    id: item.id || createHistoryItemId()
  }))

  while (normalizedItems.length < 21) {
    normalizedItems.push(createHistoryItem())
  }

  return normalizedItems.slice(0, 21)
}

function normalizeData(savedData = {}) {
  const savedResumeDate = savedData.resumeDate || {}
  const hasSavedResumeDate =
    savedResumeDate.year || savedResumeDate.month || savedResumeDate.day
  const resumeDate = hasSavedResumeDate ? savedResumeDate : getTodayParts()
  const birthDate = {
    ...defaultData.birthDate,
    ...(savedData.birthDate || {})
  }

  if (!birthDate.age) {
    birthDate.age = calculateAge(birthDate, resumeDate)
  }

  return {
    ...createDefaultData(savedData.templateType, savedData.templateSections),
    ...savedData,
    templateSections: {
      ...createDefaultData(savedData.templateType, savedData.templateSections).templateSections,
      awards: undefined
    },
    resumeDate,
    birthDate,
    tel: formatPhoneNumber(savedData.tel),
    altTel: formatPhoneNumber(savedData.altTel),
    gridItems: normalizeHistoryItems(savedData.gridItems)
  }
}

function loadDrafts() {
  try {
    const savedDrafts = localStorage.getItem(DRAFTS_STORAGE_KEY)
    if (savedDrafts) {
      const parsedDrafts = JSON.parse(savedDrafts)
      if (Array.isArray(parsedDrafts)) {
        return parsedDrafts.map((draft) => ({
          ...draft,
          data: normalizeData(draft.data)
        }))
      }
    }

    const legacyDraft = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (legacyDraft) {
      const migratedDraft = {
        id: `draft-${Date.now()}`,
        title: '保存済みの履歴書',
        updatedAt: new Date().toISOString(),
        data: normalizeData(JSON.parse(legacyDraft))
      }
      localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify([migratedDraft]))
      localStorage.removeItem(LEGACY_STORAGE_KEY)
      return [migratedDraft]
    }
  } catch (error) {
    console.error(error)
  }

  return []
}

function loadPortfolioDrafts() {
  try {
    const savedDrafts = localStorage.getItem(PORTFOLIO_DRAFTS_STORAGE_KEY)
    if (!savedDrafts) return []
    const parsedDrafts = JSON.parse(savedDrafts)
    if (!Array.isArray(parsedDrafts)) return []

    return parsedDrafts.map((draft) => ({
      ...draft,
      data: normalizePortfolioData(draft.data)
    }))
  } catch (error) {
    console.error(error)
    return []
  }
}

function App() {
  const [currentView, setCurrentView] = useState('home')
  const [isPdfCheckOpen, setIsPdfCheckOpen] = useState(false)
  const [isSectionSettingsOpen, setIsSectionSettingsOpen] = useState(false)
  const [isExportingPdf, setIsExportingPdf] = useState(false)
  const [drafts, setDrafts] = useState(loadDrafts)
  const [portfolioDrafts, setPortfolioDrafts] = useState(loadPortfolioDrafts)
  const [activeDraftId, setActiveDraftId] = useState(drafts[0]?.id || null)
  const [activePortfolioDraftId, setActivePortfolioDraftId] = useState(
    portfolioDrafts[0]?.id || null
  )
  const [data, setData] = useState(
    () => drafts[0]?.data || createDefaultData()
  )
  const [portfolioData, setPortfolioData] = useState(
    () => portfolioDrafts[0]?.data || createDefaultPortfolioData()
  )

  function handleSave(d) {
    const currentDraft = drafts.find((draft) => draft.id === activeDraftId)
    const title = currentDraft?.title || window.prompt(
      '下書きの名前を入力してください。',
      `${d.name || '名称未設定'}の履歴書`
    )

    if (!title?.trim()) return

    const id = currentDraft?.id || `draft-${Date.now()}`
    const savedDraft = {
      id,
      title: title.trim(),
      updatedAt: new Date().toISOString(),
      data: d
    }
    const nextDrafts = [
      savedDraft,
      ...drafts.filter((draft) => draft.id !== id)
    ]

    setDrafts(nextDrafts)
    setActiveDraftId(id)
    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(nextDrafts))
    alert(`「${savedDraft.title}」を一時保存しました。`)
  }

  function handlePortfolioSave(nextData) {
    const currentDraft = portfolioDrafts.find(
      (draft) => draft.id === activePortfolioDraftId
    )
    const title = currentDraft?.title || window.prompt(
      '下書きの名前を入力してください。',
      `${nextData.name || '名称未設定'}のポートフォリオ`
    )

    if (!title?.trim()) return

    const id = currentDraft?.id || `portfolio-${Date.now()}`
    const savedDraft = {
      id,
      title: title.trim(),
      updatedAt: new Date().toISOString(),
      data: nextData
    }
    const nextDrafts = [
      savedDraft,
      ...portfolioDrafts.filter((draft) => draft.id !== id)
    ]

    try {
      localStorage.setItem(PORTFOLIO_DRAFTS_STORAGE_KEY, JSON.stringify(nextDrafts))
      setPortfolioDrafts(nextDrafts)
      setActivePortfolioDraftId(id)
      alert(`「${savedDraft.title}」を一時保存しました。`)
    } catch (error) {
      console.error(error)
      alert('画像データが多いため保存できませんでした。画像枚数を減らしてください。')
    }
  }

  async function generatePDF({
    previewId = 'resume-preview',
    filePrefix = 'resume'
  } = {}) {
    function loadScript(src) {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve()
        const s = document.createElement('script')
        s.src = src
        s.onload = () => resolve()
        s.onerror = (e) => reject(e)
        document.head.appendChild(s)
      })
    }

    const container = document.getElementById(previewId)
    if (!container) return alert('プレビューが見つかりません')

    setIsExportingPdf(true)
    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js')
      await loadScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js')

      const html2canvas = window.html2canvas
      const jsPDF = window.jspdf && window.jspdf.jsPDF ? window.jspdf.jsPDF : null
      if (!html2canvas || !jsPDF) throw new Error('PDF用ライブラリの読み込みに失敗しました')

      const sheets = Array.from(container.querySelectorAll('[data-sheet="a4"]'))
      if (sheets.length === 0) return alert('A4シートが見つかりません')

      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })

      // Convert A4 mm to CSS pixels (assume 96dpi). This ensures the cloned sheet renders
      // at the correct width for A4 so html2canvas doesn't produce oversized images.
      const mmToPx = (mm) => (mm / 25.4) * 96
      const a4WidthMm = 210
      const a4HeightMm = 297
      const a4WidthPx = Math.round(mmToPx(a4WidthMm))
      const a4HeightPx = Math.round(mmToPx(a4HeightMm))

      for (let i = 0; i < sheets.length; i++) {
        const sheet = sheets[i]
        const clone = sheet.cloneNode(true)
        clone.style.background = '#ffffff'
        clone.style.boxSizing = 'border-box'
        // Force cloned element to A4 CSS width so layout matches print size
        clone.style.width = `${a4WidthPx}px`
        clone.style.maxWidth = `${a4WidthPx}px`
        clone.style.height = `${a4HeightPx}px`
        clone.style.display = 'block'

        const wrapper = document.createElement('div')
        wrapper.style.position = 'fixed'
        wrapper.style.left = '-9999px'
        wrapper.style.top = '0'
        wrapper.appendChild(clone)
        document.body.appendChild(wrapper)

        // Increase canvas scale for higher resolution output. Be aware very large
        // scales may increase memory usage; 4 is a practical high-quality choice here.
        const SCALE = Math.max(window.devicePixelRatio || 1, 4)
        const canvas = await html2canvas(clone, {
          scale: SCALE,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: a4WidthPx,
          height: a4HeightPx,
        })

        // Use PNG (lossless) for maximal fidelity.
        const imgData = canvas.toDataURL('image/png')

        const imgProps = pdf.getImageProperties(imgData)
        const pdfPageWidth = pdf.internal.pageSize.getWidth()
        const pdfPageHeight = pdf.internal.pageSize.getHeight()

        // Fit the rendered image into the A4 PDF page while preserving aspect ratio.
        const widthRatio = pdfPageWidth / imgProps.width
        const heightRatio = pdfPageHeight / imgProps.height
        const fitRatio = Math.min(widthRatio, heightRatio)

        const drawWidth = imgProps.width * fitRatio
        const drawHeight = imgProps.height * fitRatio
        const offsetX = (pdfPageWidth - drawWidth) / 2
        const offsetY = (pdfPageHeight - drawHeight) / 2

        pdf.addImage(imgData, 'PNG', offsetX, offsetY, drawWidth, drawHeight)
        if (i < sheets.length - 1) pdf.addPage()

        document.body.removeChild(wrapper)
      }

      pdf.save(`${filePrefix}-${Date.now()}.pdf`)
      setIsPdfCheckOpen(false)
    } catch (err) {
      console.error(err)
      alert('PDF生成に失敗しました：' + (err.message || err))
    } finally {
      setIsExportingPdf(false)
    }
  }

  function handleReset() {
    if (!confirm('全ての入力内容をクリアして初期化しますか？')) return
    if (currentView === 'portfolio') {
      setPortfolioData(createDefaultPortfolioData())
      return
    }
    setData(createDefaultData(data.templateType, data.templateSections))
  }

  function handleSelectTemplate(templateType, templateSections) {
    setData(createDefaultData(templateType, templateSections))
    setActiveDraftId(null)
    setCurrentView('editor')
  }

  function handleOpenDraft(draftId) {
    const draft = drafts.find((item) => item.id === draftId)
    if (!draft) return
    setData(normalizeData(draft.data))
    setActiveDraftId(draft.id)
    setCurrentView('editor')
  }

  function handleDeleteDraft(draftId) {
    const draft = drafts.find((item) => item.id === draftId)
    if (!draft || !confirm(`「${draft.title}」を削除しますか？`)) return

    const nextDrafts = drafts.filter((item) => item.id !== draftId)
    setDrafts(nextDrafts)
    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(nextDrafts))

    if (activeDraftId === draftId) {
      setActiveDraftId(null)
      setData(createDefaultData())
    }
  }

  function handleCreatePortfolio() {
    setPortfolioData(createDefaultPortfolioData())
    setActivePortfolioDraftId(null)
    setCurrentView('portfolio')
  }

  function handleOpenPortfolioDraft(draftId) {
    const draft = portfolioDrafts.find((item) => item.id === draftId)
    if (!draft) return
    setPortfolioData(normalizePortfolioData(draft.data))
    setActivePortfolioDraftId(draft.id)
    setCurrentView('portfolio')
  }

  function handleDeletePortfolioDraft(draftId) {
    const draft = portfolioDrafts.find((item) => item.id === draftId)
    if (!draft || !confirm(`「${draft.title}」を削除しますか？`)) return

    const nextDrafts = portfolioDrafts.filter((item) => item.id !== draftId)
    setPortfolioDrafts(nextDrafts)
    localStorage.setItem(PORTFOLIO_DRAFTS_STORAGE_KEY, JSON.stringify(nextDrafts))

    if (activePortfolioDraftId === draftId) {
      setActivePortfolioDraftId(null)
      setPortfolioData(createDefaultPortfolioData())
    }
  }

  const templateLabels = {
    internship: 'インターン用',
    employment: '就職用',
    parttime: 'バイト用',
    custom: 'カスタム'
  }
  const selectedTemplateLabel =
    templateLabels[data.templateType] || templateLabels.employment
  const hasBirthDate = Boolean(
    data.birthDate?.year && data.birthDate?.month && data.birthDate?.day
  )
  const hasHistoryEntry = (data.gridItems || []).some((item) => {
    const normalizedContent = (item.content || '').replaceAll('　', '').trim()
    return (item.year || item.month) && normalizedContent
  })
  const pdfChecks = [
    { label: '氏名', complete: Boolean(data.name?.trim()), required: true },
    { label: '生年月日', complete: hasBirthDate, required: true },
    { label: '現住所', complete: Boolean(data.address?.trim()), required: true },
    {
      label: '電話番号またはE-mail',
      complete: Boolean(data.tel?.trim() || data.email?.trim()),
      required: true
    },
    ...(data.templateSections?.history
      ? [{ label: '学歴・職歴', complete: hasHistoryEntry, required: true }]
      : []),
    { label: 'ふりがな', complete: Boolean(data.nameFurigana?.trim()), required: false },
    ...(data.templateSections?.photo
      ? [{ label: '証明写真', complete: Boolean(data.photo), required: false }]
      : []),
    ...(data.templateSections?.motivation
      ? [{ label: '志望理由', complete: Boolean(data.motivation?.trim()), required: false }]
      : []),
    ...(data.templateSections?.selfPR
      ? [{ label: '自己PR', complete: Boolean(data.selfPR?.trim()), required: false }]
      : [])
  ]
  const hasPdfErrors = pdfChecks.some((item) => item.required && !item.complete)

  if (currentView === 'home') {
    return (
      <Home
        drafts={drafts}
        portfolioDrafts={portfolioDrafts}
        onOpenDraft={handleOpenDraft}
        onDeleteDraft={handleDeleteDraft}
        onCreatePortfolio={handleCreatePortfolio}
        onOpenPortfolioDraft={handleOpenPortfolioDraft}
        onDeletePortfolioDraft={handleDeletePortfolioDraft}
        onSelectTemplate={handleSelectTemplate}
      />
    )
  }

  if (currentView === 'portfolio') {
    const portfolioChecks = [
      { label: '氏名', complete: Boolean(portfolioData.name.trim()), required: true },
      { label: '大学名', complete: Boolean(portfolioData.universityName.trim()), required: true },
      {
        label: '学部・学科',
        complete: Boolean(
          portfolioData.facultyName.trim() || portfolioData.departmentName.trim()
        ),
        required: true
      },
      { label: '連絡先メール', complete: Boolean(portfolioData.email.trim()), required: true },
      { label: '自己紹介', complete: Boolean(portfolioData.bio.trim()), required: false },
      { label: 'プロフィール', complete: Boolean(portfolioData.profile.trim()), required: false },
      { label: '使用技術', complete: Boolean(portfolioData.skills.trim()), required: false },
      {
        label: '制作物',
        complete: portfolioData.projects.some((project) => project.title.trim()),
        required: true
      },
      {
        label: '制作物画像',
        complete: portfolioData.projects.some((project) => (
          project.screenshots.some((screenshot) => Boolean(screenshot.image))
        )),
        required: true
      }
    ]
    const hasPortfolioErrors = portfolioChecks.some(
      (item) => item.required && !item.complete
    )

    return (
      <div className="app-container">
        <header className="app-header">
          <div className="header-brand">
            <span className="badge">Student Portfolio</span>
            <h1>学生用ポートフォリオ 作成ツール</h1>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={() => setCurrentView('home')}>
              ホーム
            </button>
            <button className="btn btn-danger" onClick={handleReset}>
              初期化
            </button>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => setIsPdfCheckOpen(true)}
            >
              PDFダウンロード
            </button>
          </div>
        </header>

        <div className="workspace-grid">
          <div className="editor-pane">
            <PortfolioForm
              data={portfolioData}
              onChange={setPortfolioData}
              onSave={handlePortfolioSave}
            />
          </div>
          <div className="preview-pane">
            <div className="preview-sticky-container">
              <div className="preview-info-banner">
                右側はA4ポートフォリオの印刷プレビューです。
              </div>
              <PortfolioPreview data={portfolioData} />
            </div>
          </div>
        </div>

        {isPdfCheckOpen && (
          <div className="pdf-check-backdrop" role="presentation">
            <section
              className="pdf-check-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="portfolio-pdf-check-title"
            >
              <div className="pdf-check-header">
                <div>
                  <span className="pdf-check-eyebrow">Before Export</span>
                  <h2 id="portfolio-pdf-check-title">PDF出力前チェック</h2>
                </div>
                <button
                  className="pdf-check-close"
                  type="button"
                  onClick={() => setIsPdfCheckOpen(false)}
                  disabled={isExportingPdf}
                  aria-label="閉じる"
                >
                  ×
                </button>
              </div>
              <p className="pdf-check-description">
                必須項目を確認してください。
              </p>
              <ul className="pdf-check-list">
                {portfolioChecks.map((item) => (
                  <li
                    key={item.label}
                    className={item.complete ? 'is-complete' : 'is-incomplete'}
                  >
                    <span className="pdf-check-status" aria-hidden="true">
                      {item.complete ? '✓' : '!'}
                    </span>
                    <span>{item.label}</span>
                    <small>{item.required ? '必須' : '推奨'}</small>
                  </li>
                ))}
              </ul>
              {hasPortfolioErrors && (
                <p className="pdf-check-error">
                  未入力の必須項目を入力してからPDFを出力してください。
                </p>
              )}
              <div className="pdf-check-actions">
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => setIsPdfCheckOpen(false)}
                  disabled={isExportingPdf}
                >
                  戻って修正
                </button>
                <button
                  className="btn btn-primary btn-lg"
                  type="button"
                  onClick={() => generatePDF({
                    previewId: 'portfolio-preview',
                    filePrefix: 'portfolio'
                  })}
                  disabled={hasPortfolioErrors || isExportingPdf}
                >
                  {isExportingPdf ? 'PDFを作成中...' : '確認してPDF出力'}
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-brand">
          <span className="badge">{selectedTemplateLabel}</span>
          <h1>履歴書 作成ツール</h1>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => setCurrentView('home')}>
            <svg className="btn-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="m3 11 9-8 9 8v10h-7v-6h-4v6H3V11Zm2 1v7h3v-6h8v6h3v-7l-7-6.2L5 12Z" />
            </svg>
            ホーム
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setIsSectionSettingsOpen(true)}
          >
            <svg className="btn-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 5h10v2H4V5Zm0 6h16v2H4v-2Zm0 6h7v2H4v-2Zm13-13h3v4h-3V4Zm-4 12h3v4h-3v-4Z" />
            </svg>
            項目設定
          </button>
          <button className="btn btn-danger" onClick={handleReset}>
            初期化
          </button>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => setIsPdfCheckOpen(true)}
          >
            <svg
              className="btn-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M6 2.75h8l4 4V13h-1.5V7.5h-3.25V4.25H7.5V13H6V2.75Z" />
              <path d="M12 11.5v7.1l2.45-2.45 1.05 1.05-4.25 4.25L7 17.2l1.05-1.05 2.45 2.45v-7.1H12Z" />
            </svg>
            PDFダウンロード
          </button>
        </div>
      </header>
      
      <div className="workspace-grid">
        <div className="editor-pane">
          <ResumeForm
            data={data}
            onChange={setData}
            onSave={handleSave}
            sections={data.templateSections}
          />
        </div>
        <div className="preview-pane">
          <div className="preview-sticky-container">
            <div className="preview-info-banner">
              <span>💡</span> 右側は印刷プレビューです。A4用紙2枚に印刷・PDF保存できるように最適化されています。
            </div>
            <ResumePreview data={data} sections={data.templateSections} />
          </div>
        </div>
      </div>

      {isPdfCheckOpen && (
        <div
          className="pdf-check-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isExportingPdf) {
              setIsPdfCheckOpen(false)
            }
          }}
        >
          <section
            className="pdf-check-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pdf-check-title"
          >
            <div className="pdf-check-header">
              <div>
                <span className="pdf-check-eyebrow">Before Export</span>
                <h2 id="pdf-check-title">PDF出力前チェック</h2>
              </div>
              <button
                className="pdf-check-close"
                type="button"
                onClick={() => setIsPdfCheckOpen(false)}
                disabled={isExportingPdf}
                aria-label="閉じる"
              >
                ×
              </button>
            </div>

            <p className="pdf-check-description">
              必須項目を確認してください。推奨項目は未入力でもPDFを出力できます。
            </p>

            <ul className="pdf-check-list">
              {pdfChecks.map((item) => (
                <li
                  key={item.label}
                  className={item.complete ? 'is-complete' : 'is-incomplete'}
                >
                  <span className="pdf-check-status" aria-hidden="true">
                    {item.complete ? '✓' : '!'}
                  </span>
                  <span>{item.label}</span>
                  <small>{item.required ? '必須' : '推奨'}</small>
                </li>
              ))}
            </ul>

            {hasPdfErrors && (
              <p className="pdf-check-error">
                未入力の必須項目を入力してからPDFを出力してください。
              </p>
            )}

            <div className="pdf-check-actions">
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => setIsPdfCheckOpen(false)}
                disabled={isExportingPdf}
              >
                戻って修正
              </button>
              <button
                className="btn btn-primary btn-lg"
                type="button"
                onClick={() => generatePDF()}
                disabled={hasPdfErrors || isExportingPdf}
              >
                {isExportingPdf ? 'PDFを作成中...' : '確認してPDF出力'}
              </button>
            </div>
          </section>
        </div>
      )}

      {isSectionSettingsOpen && (
        <div className="pdf-check-backdrop" role="presentation">
          <section
            className="pdf-check-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="section-settings-title"
          >
            <div className="pdf-check-header">
              <div>
                <span className="pdf-check-eyebrow">Resume Sections</span>
                <h2 id="section-settings-title">履歴書の項目設定</h2>
              </div>
              <button
                className="pdf-check-close"
                type="button"
                onClick={() => setIsSectionSettingsOpen(false)}
                aria-label="閉じる"
              >
                ×
              </button>
            </div>
            <p className="pdf-check-description">
              基本情報・生年月日・現住所・連絡先は常に表示されます。
            </p>
            <div className="section-settings-grid">
              {SECTION_OPTIONS.map((option) => (
                <label className="section-setting-option" key={option.id}>
                  <input
                    type="checkbox"
                    checked={Boolean(data.templateSections?.[option.id])}
                    disabled={
                      option.id === 'historyContinuation' &&
                      !data.templateSections?.history
                    }
                    onChange={(event) => {
                      const checked = event.target.checked
                      setData((currentData) => {
                        const templateSections = {
                          ...currentData.templateSections,
                          [option.id]: checked
                        }

                        if (option.id === 'history' && !checked) {
                          templateSections.historyContinuation = false
                        }

                        return {
                          ...currentData,
                          templateType: 'custom',
                          templateSections
                        }
                      })
                    }}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            <div className="pdf-check-actions">
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => setIsSectionSettingsOpen(false)}
              >
                設定を反映
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default App
