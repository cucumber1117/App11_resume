import { useState, useEffect } from 'react'
import styles from './ResumeForm.module.css'

export default function ResumeForm({ data, onChange, onSave }) {
  const [local, setLocal] = useState(data)

  useEffect(() => setLocal(data), [data])

  function updateField(path, value) {
    const next = { ...local }
    const keys = path.split('.')
    let obj = next
    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]]
    }
    obj[keys[keys.length - 1]] = value
    setLocal(next)
    onChange(next)
  }

  function addExperience() {
    const next = { ...local, experiences: [...(local.experiences || []), { title: '', company: '', dates: '', description: '' }] }
    setLocal(next)
    onChange(next)
  }

  function updateExperience(idx, field, value) {
    const ex = (local.experiences || []).map((e, i) => i === idx ? { ...e, [field]: value } : e)
    const next = { ...local, experiences: ex }
    setLocal(next)
    onChange(next)
  }

  function removeExperience(idx) {
    const ex = (local.experiences || []).filter((_, i) => i !== idx)
    const next = { ...local, experiences: ex }
    setLocal(next)
    onChange(next)
  }

  function handleFileChange(e) {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => updateField('photo', reader.result)
    reader.readAsDataURL(file)
  }

  function handlePaste(e) {
    const items = e.clipboardData && e.clipboardData.items
    if (!items) return
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type.indexOf('image') !== -1) {
        const blob = item.getAsFile()
        const reader = new FileReader()
        reader.onload = () => updateField('photo', reader.result)
        reader.readAsDataURL(blob)
        e.preventDefault()
        return
      }
    }
  }

  return (
    <form className={styles.resumeForm} onSubmit={(e) => { e.preventDefault(); onSave(local) }} onPaste={handlePaste}>
      <label className={styles.label}>
        氏名
        <input className={styles.input} value={local.name || ''} onChange={(e) => updateField('name', e.target.value)} />
      </label>

      <label className={styles.label}>
        職種/肩書き
        <input className={styles.input} value={local.title || ''} onChange={(e) => updateField('title', e.target.value)} />
      </label>

      <label className={styles.label}>
        連絡先
        <input className={styles.input} value={local.contact || ''} onChange={(e) => updateField('contact', e.target.value)} />
      </label>

      <label className={styles.label}>
        用途
        <select className={styles.input} value={local.type || 'job'} onChange={(e) => updateField('type', e.target.value)}>
          <option value="job">就職用</option>
          <option value="intern">インターン用</option>
          <option value="parttime">バイト用</option>
        </select>
      </label>

      <label className={styles.label}>
        証明写真（アップロード / 貼り付け可）
        <input className={styles.input} type="file" accept="image/*" onChange={handleFileChange} />
        {local.photo && (
          <div style={{ marginTop: 8 }}>
            <img src={local.photo} alt="photo" style={{ width: 96, height: 120, objectFit: 'cover', border: '1px solid #ddd' }} />
          </div>
        )}
      </label>

      <label className={styles.label}>
        プロフィール
        <textarea className={styles.textarea} value={local.summary || ''} onChange={(e) => updateField('summary', e.target.value)} />
      </label>

      <section className={styles.section}>
        <h3>職務経歴</h3>
        {(local.experiences || []).map((ex, idx) => (
          <div key={idx} className={styles.expItem}>
            <input className={styles.input} placeholder="役職" value={ex.title} onChange={(e) => updateExperience(idx, 'title', e.target.value)} />
            <input className={styles.input} placeholder="会社" value={ex.company} onChange={(e) => updateExperience(idx, 'company', e.target.value)} />
            <input className={styles.input} placeholder="期間" value={ex.dates} onChange={(e) => updateExperience(idx, 'dates', e.target.value)} />
            <textarea className={styles.textarea} placeholder="詳細" value={ex.description} onChange={(e) => updateExperience(idx, 'description', e.target.value)} />
            <button className={styles.removeBtn} type="button" onClick={() => removeExperience(idx)}>削除</button>
          </div>
        ))}
        <button className={styles.addBtn} type="button" onClick={addExperience}>経歴を追加</button>
      </section>

      <section className={styles.section}>
        <h3>学歴</h3>
        <label className={styles.label}>
          学歴（概要）
          <textarea className={styles.textarea} value={local.education || ''} onChange={(e) => updateField('education', e.target.value)} />
        </label>
      </section>

      <div className={styles.formActions}>
        <button type="submit">保存</button>
      </div>
    </form>
  )
}
