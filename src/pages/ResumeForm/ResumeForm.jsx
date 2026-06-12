import { useState, useEffect } from 'react'

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

  return (
    <form className="resume-form" onSubmit={(e) => { e.preventDefault(); onSave(local) }}>
      <label>
        氏名
        <input value={local.name || ''} onChange={(e) => updateField('name', e.target.value)} />
      </label>

      <label>
        職種/肩書き
        <input value={local.title || ''} onChange={(e) => updateField('title', e.target.value)} />
      </label>

      <label>
        連絡先
        <input value={local.contact || ''} onChange={(e) => updateField('contact', e.target.value)} />
      </label>

      <label>
        プロフィール
        <textarea value={local.summary || ''} onChange={(e) => updateField('summary', e.target.value)} />
      </label>

      <section>
        <h3>職務経歴</h3>
        {(local.experiences || []).map((ex, idx) => (
          <div key={idx} className="exp-item">
            <input placeholder="役職" value={ex.title} onChange={(e) => updateExperience(idx, 'title', e.target.value)} />
            <input placeholder="会社" value={ex.company} onChange={(e) => updateExperience(idx, 'company', e.target.value)} />
            <input placeholder="期間" value={ex.dates} onChange={(e) => updateExperience(idx, 'dates', e.target.value)} />
            <textarea placeholder="詳細" value={ex.description} onChange={(e) => updateExperience(idx, 'description', e.target.value)} />
            <button type="button" onClick={() => removeExperience(idx)}>削除</button>
          </div>
        ))}
        <button type="button" onClick={addExperience}>経歴を追加</button>
      </section>

      <section>
        <h3>学歴</h3>
        <label>
          学歴（概要）
          <textarea value={local.education || ''} onChange={(e) => updateField('education', e.target.value)} />
        </label>
      </section>

      <div className="form-actions">
        <button type="submit">保存</button>
      </div>
    </form>
  )
}
