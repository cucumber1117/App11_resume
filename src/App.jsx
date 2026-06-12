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
          <button className="btn btn-primary btn-lg" onClick={handlePrint}>
            <span>🖨️</span> PDF出力 / 印刷
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
