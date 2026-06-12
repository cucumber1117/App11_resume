import { useState } from 'react'
import './App.css'
import ResumeForm from './pages/ResumeForm/ResumeForm'
import ResumePreview from './pages/ResumePreview/ResumePreview'

const defaultData = {
  // 履歴書 共通日付
  resumeDate: { year: '', month: '', day: '' },
  
  // 履歴書 氏名・基本情報
  nameFurigana: '',
  name: '',
  gender: '男',
  birthDate: { year: '', month: '', day: '', age: '' },
  photo: '',
  
  // 現住所
  addressFurigana: '',
  addressZip: '',
  address: '',
  tel: '',
  mobile: '',
  
  // 帰省先 (連絡先)
  altAddressFurigana: '',
  altAddressZip: '',
  altAddress: '',
  altTel: '',
  
  email: '',
  
  // 学歴・職歴・賞罰 (18行)
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
  ],

  // 自己紹介書
  selfIntroDate: { year: '', month: '', day: '' },
  uniYear: '',
  uniMonth: '',
  uniDept: '',
  uniStatus: '見込', // 卒業 / 見込
  
  // 卒業研究テーマ等
  researchTheme: '',
  supervisor: '',
  researchContent: '',
  
  // テキスト領域
  favoriteSubject: '',
  selfPR: '',
  studentActivities: '',
  hobbies: '',
  qualifications: '',
  motivation: '',
}

function App() {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('resume_full_tdu')
      if (saved) {
        const parsed = JSON.parse(saved)
        // Ensure default properties exist
        return { ...defaultData, ...parsed }
      }
    } catch (e) {
      console.error(e)
    }
    return defaultData
  })

  function handleSave(d) {
    localStorage.setItem('resume_full_tdu', JSON.stringify(d))
    alert('入力データを保存しました（ブラウザに一時保存されます）')
  }

  function handlePrint() {
    window.print()
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
  }

  // Auto-sync basic profile fields from Page 1 to Page 2 if needed
  function handleSyncProfile() {
    setData(prev => ({
      ...prev,
      selfIntroFurigana: prev.nameFurigana,
      selfIntroName: prev.name,
      selfIntroGender: prev.gender,
      selfIntroBirthDate: { ...prev.birthDate },
      selfIntroDate: { ...prev.resumeDate }
    }))
    alert('履歴書の基本情報と日付を自己紹介書へコピーしました')
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-brand">
          <span className="badge">TDU Style</span>
          <h1>履歴書＆自己紹介書 作成ツール</h1>
        </div>
          <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleSyncProfile}>
            基本情報を自己紹介書へ同期
          </button>
          <button className="btn btn-danger" onClick={handleReset}>
            初期化
          </button>
          <button className="btn btn-primary btn-lg" onClick={handleExportPDF}>
            <span>📄</span> PDFダウンロード
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
