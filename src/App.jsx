import { useState } from 'react'
import './App.css'
import ResumeForm from './pages/ResumeForm/ResumeForm'
import ResumePreview from './pages/ResumePreview/ResumePreview'

const defaultData = {
  name: '',
  title: '',
  contact: '',
  summary: '',
  experiences: [],
  education: '',
  type: 'job',
  template: 'classic',
}

function App() {
  const [data, setData] = useState(() => JSON.parse(localStorage.getItem('resume') || 'null') || defaultData)

  function handleSave(d) {
    localStorage.setItem('resume', JSON.stringify(d))
    alert('履歴書を保存しました')
  }

  function handlePrint() {
    const el = document.getElementById('resume-preview')
    if (!el) return
    const w = window.open('', '_blank')
    w.document.write('<html><head><title>Resume</title>')
    // basic styles to keep the print readable
    w.document.write('<style>body{font-family:system-ui, -apple-system, \"Helvetica Neue\", Arial; padding:20px} .resume-sheet{max-width:800px;margin:0 auto}</style>')
    w.document.write('</head><body>')
    w.document.write(el.innerHTML)
    w.document.write('</body></html>')
    w.document.close()
    w.focus()
    w.print()
  }

  function handleDownloadPDF() {
    const el = document.getElementById('resume-preview')
    if (!el) return
    const w = window.open('', '_blank')
    w.document.write('<html><head><title>Resume PDF</title>')
    w.document.write('<style>body{font-family:system-ui, -apple-system, "Helvetica Neue", Arial; padding:20px} .resume-sheet{max-width:800px;margin:0 auto}</style>')
    w.document.write('</head><body>')
    w.document.write(el.innerHTML)
    w.document.write('</body></html>')
    w.document.close()
    w.focus()
    setTimeout(() => w.print(), 300)
  }

  function handleReset() {
    if (!confirm('内容を初期化しますか？')) return
    setData(defaultData)
    localStorage.removeItem('resume')
  }

  return (
    <div className="app-container">
      <h1>履歴書作成アプリ</h1>
      <div className="workspace-grid">
        <div className="left">
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>テンプレート</label>
            <select value={data.template || 'classic'} onChange={(e) => setData({ ...data, template: e.target.value })}>
              <option value="classic">クラシック</option>
              <option value="simple">シンプル</option>
              <option value="modern">モダン</option>
            </select>
          </div>
          <ResumeForm data={data} onChange={setData} onSave={handleSave} />
          <div className="small-actions">
            <button onClick={handlePrint}>プレビューを印刷</button>
            <button onClick={handleDownloadPDF}>PDFダウンロード</button>
            <button onClick={handleReset}>初期化</button>
          </div>
        </div>
        <div className="right">
          <ResumePreview data={data} />
        </div>
      </div>
    </div>
  )
}

export default App
