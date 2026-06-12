import { useState } from 'react'
import './App.css'
import Home from './pages/Home/Home'
import ResumeForm from './pages/ResumeForm/ResumeForm'
import ResumePreview from './pages/ResumePreview/ResumePreview'

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

const todayParts = getTodayParts()

const defaultData = {
  templateType: 'employment',

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
  
  // 学歴・職歴・賞罰 (21行)
  gridItems: [
    { year: '', month: '', content: '学　　歴', align: 'center' },
    { year: '', month: '', content: '', align: 'left' },
    { year: '', month: '', content: '', align: 'left' },
    { year: '', month: '', content: '', align: 'left' },
    { year: '', month: '', content: '', align: 'left' },
    { year: '', month: '', content: '職　　歴', align: 'center' },
    { year: '', month: '', content: '', align: 'left' },
    { year: '', month: '', content: '', align: 'left' },
    { year: '', month: '', content: '', align: 'left' },
    { year: '', month: '', content: '', align: 'left' },
    { year: '', month: '', content: '賞　　罰', align: 'center' },
    { year: '', month: '', content: 'な　し', align: 'left' },
    { year: '', month: '', content: '以　　上', align: 'right' },
    { year: '', month: '', content: '', align: 'left' },
    { year: '', month: '', content: '', align: 'left' },
    { year: '', month: '', content: '', align: 'left' },
    { year: '', month: '', content: '', align: 'left' },
    { year: '', month: '', content: '', align: 'left' },
    { year: '', month: '', content: '', align: 'left' },
    { year: '', month: '', content: '', align: 'left' },
    { year: '', month: '', content: '', align: 'left' },
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

  // 本人希望記入欄
  personalRequest: '',
  
}

function App() {
  const [currentView, setCurrentView] = useState('home')
  const [hasSavedData, setHasSavedData] = useState(
    () => Boolean(localStorage.getItem('resume_full_tdu'))
  )
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('resume_full_tdu')
      if (saved) {
        const parsed = JSON.parse(saved)
        const savedResumeDate = parsed.resumeDate || {}
        const hasSavedResumeDate =
          savedResumeDate.year || savedResumeDate.month || savedResumeDate.day
        const resumeDate = hasSavedResumeDate ? savedResumeDate : getTodayParts()
        const birthDate = {
          ...defaultData.birthDate,
          ...(parsed.birthDate || {})
        }

        if (!birthDate.age) {
          birthDate.age = calculateAge(birthDate, resumeDate)
        }

        return {
          ...defaultData,
          ...parsed,
          resumeDate,
          birthDate
        }
      }
    } catch (e) {
      console.error(e)
    }
    return defaultData
  })

  function handleSave(d) {
    localStorage.setItem('resume_full_tdu', JSON.stringify(d))
    setHasSavedData(true)
    alert('入力データを保存しました（ブラウザに一時保存されます）')
  }

  async function handleExportPDF() {
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

    const container = document.getElementById('resume-preview')
    if (!container) return alert('プレビューが見つかりません')

    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js')
      await loadScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js')

      const html2canvas = window.html2canvas
      const jsPDF = window.jspdf && window.jspdf.jsPDF ? window.jspdf.jsPDF : null
      if (!html2canvas || !jsPDF) throw new Error('PDF用ライブラリの読み込みに失敗しました')

      const sheets = Array.from(document.querySelectorAll('[data-sheet="a4"]'))
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

        pdf.addImage(imgData, 'JPEG', offsetX, offsetY, drawWidth, drawHeight)
        if (i < sheets.length - 1) pdf.addPage()

        document.body.removeChild(wrapper)
      }

      pdf.save(`resume-${Date.now()}.pdf`)
    } catch (err) {
      console.error(err)
      alert('PDF生成に失敗しました：' + (err.message || err))
    }
  }

  function handleReset() {
    if (!confirm('全ての入力内容をクリアして初期化しますか？')) return
    setData(defaultData)
    localStorage.removeItem('resume_full_tdu')
    setHasSavedData(false)
  }

  function handleSelectTemplate(templateType) {
    setData((currentData) => ({
      ...currentData,
      templateType
    }))
    setCurrentView('editor')
  }

  const templateLabels = {
    internship: 'インターン用',
    employment: '就職用',
    parttime: 'バイト用'
  }
  const selectedTemplateLabel =
    templateLabels[data.templateType] || templateLabels.employment

  if (currentView === 'home') {
    return (
      <Home
        hasSavedData={hasSavedData}
        onContinue={() => setCurrentView('editor')}
        onSelectTemplate={handleSelectTemplate}
      />
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
          <button className="btn btn-danger" onClick={handleReset}>
            初期化
          </button>
          <button className="btn btn-primary btn-lg" onClick={handleExportPDF}>
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
          <ResumeForm data={data} onChange={setData} onSave={handleSave} />
        </div>
        <div className="preview-pane">
          <div className="preview-sticky-container">
            <div className="preview-info-banner">
              <span>💡</span> 右側は印刷プレビューです。A4用紙2枚に印刷・PDF保存できるように最適化されています。
            </div>
            <ResumePreview data={data} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
