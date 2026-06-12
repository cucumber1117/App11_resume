import { useState } from 'react'
import styles from './ResumeForm.module.css'

export default function ResumeForm({ data, onChange, onSave }) {
  const [activeTab, setActiveTab] = useState('basic')
  const [isPhotoDragging, setIsPhotoDragging] = useState(false)
  const [photoError, setPhotoError] = useState('')

  // Helper to update flat fields
  function updateField(field, value) {
    onChange({ ...data, [field]: value })
  }

  // Helper to update nested object fields (like birthDate.year)
  function updateNestedField(objectName, field, value) {
    onChange({
      ...data,
      [objectName]: {
        ...(data[objectName] || {}),
        [field]: value
      }
    })
  }

  // Helper to update grid row items
  function updateGridItem(idx, field, value) {
    const nextGrid = [...(data.gridItems || [])]
    nextGrid[idx] = {
      ...nextGrid[idx],
      [field]: value
    }
    onChange({ ...data, gridItems: nextGrid })
  }

  // Helper to update license items
  function updateLicenseItem(idx, field, value) {
    const nextLicense = [...(data.licenseItems || [])]
    nextLicense[idx] = {
      ...nextLicense[idx],
      [field]: value
    }
    onChange({ ...data, licenseItems: nextLicense })
  }

  function loadPhoto(file) {
    if (!file || !file.type.startsWith('image/')) {
      setPhotoError('画像ファイルを選択してください。')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      updateField('photo', reader.result)
      setPhotoError('')
    }
    reader.readAsDataURL(file)
  }

  // Paste image handler for certificate photo
  function handlePaste(e) {
    const items = e.clipboardData && e.clipboardData.items
    if (!items) return
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type.indexOf('image') !== -1) {
        loadPhoto(item.getAsFile())
        e.preventDefault()
        return
      }
    }
  }

  // Handle file select
  function handleFileChange(e) {
    const file = e.target.files && e.target.files[0]
    loadPhoto(file)
    e.target.value = ''
  }

  function handlePhotoDrop(e) {
    e.preventDefault()
    setIsPhotoDragging(false)
    loadPhoto(e.dataTransfer.files && e.dataTransfer.files[0])
  }

  return (
    <div className={styles.formContainer} onPaste={handlePaste}>
      {/* Tab Header Navigation */}
      <nav className={styles.tabsNav}>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'basic' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          基本情報・住所
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'history' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('history')}
        >
          学歴・職歴・賞罰
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'license' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('license')}
        >
          免許・資格
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'intro' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('intro')}
        >
          自己PR・希望欄
        </button>
      </nav>

      {/* Form Content area */}
      <form onSubmit={(e) => { e.preventDefault(); onSave(data) }} className={styles.formBody}>
        
        {/* ================= TAB 1: 基本情報 ================= */}
        {activeTab === 'basic' && (
          <div className={styles.tabSection}>
            <h3 className={styles.sectionTitle}>基本情報</h3>
            
            <div className={styles.formGrid}>
              <div className={styles.formCol}>
                <label className={styles.label}>
                  日付 (履歴書右上の日付)
                  <div className={styles.dateInputs}>
                    <input
                      type="text"
                      className={styles.inputShort}
                      placeholder="2026"
                      value={data.resumeDate?.year || ''}
                      onChange={(e) => updateNestedField('resumeDate', 'year', e.target.value)}
                    />
                    <span>年</span>
                    <input
                      type="text"
                      className={styles.inputTiny}
                      placeholder="6"
                      value={data.resumeDate?.month || ''}
                      onChange={(e) => updateNestedField('resumeDate', 'month', e.target.value)}
                    />
                    <span>月</span>
                    <input
                      type="text"
                      className={styles.inputTiny}
                      placeholder="13"
                      value={data.resumeDate?.day || ''}
                      onChange={(e) => updateNestedField('resumeDate', 'day', e.target.value)}
                    />
                    <span>日現在</span>
                  </div>
                </label>

                <label className={styles.label}>
                  ふりがな
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="とうきょう たろう"
                    value={data.nameFurigana || ''}
                    onChange={(e) => updateField('nameFurigana', e.target.value)}
                  />
                </label>

                <label className={styles.label}>
                  氏名
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="東京 太郎"
                    value={data.name || ''}
                    onChange={(e) => updateField('name', e.target.value)}
                  />
                </label>
              </div>

              <div className={styles.formCol}>
                <div className={styles.label}>
                  証明写真
                  <div
                    className={`${styles.photoDropZone} ${isPhotoDragging ? styles.photoDropZoneActive : ''}`}
                    onDragEnter={(e) => {
                      e.preventDefault()
                      setIsPhotoDragging(true)
                    }}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.dataTransfer.dropEffect = 'copy'
                    }}
                    onDragLeave={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget)) {
                        setIsPhotoDragging(false)
                      }
                    }}
                    onDrop={handlePhotoDrop}
                  >
                    <span className={styles.photoDropText}>
                      画像をここにドラッグ＆ドロップ
                    </span>
                    <span className={styles.photoDropSubText}>
                      またはクリックして選択・画像を貼り付け
                    </span>
                    <input
                      id="resume-photo"
                      type="file"
                      accept="image/*"
                      className={styles.fileInput}
                      onChange={handleFileChange}
                    />
                    <label htmlFor="resume-photo" className={styles.photoSelectBtn}>
                      写真を選択
                    </label>
                    {data.photo && (
                      <img
                        src={data.photo}
                        alt="選択中の証明写真"
                        className={styles.photoThumbnail}
                      />
                    )}
                  </div>
                  {photoError && <span className={styles.photoError}>{photoError}</span>}
                  <div className={styles.photoControl}>
                    {data.photo && (
                      <button
                        type="button"
                        className={styles.btnDangerSmall}
                        onClick={() => updateField('photo', '')}
                      >
                        写真を削除
                      </button>
                    )}
                  </div>
                </div>

                <div className={styles.genderDobRow}>
                  <label className={styles.label}>
                    性別
                    <select
                      className={styles.input}
                      value={data.gender || ''}
                      onChange={(e) => updateField('gender', e.target.value)}
                    >
                      <option value="">未選択 (任意)</option>
                      <option value="男">男</option>
                      <option value="女">女</option>
                      <option value="その他">その他</option>
                    </select>
                  </label>

                  <label className={styles.label}>
                    満年齢
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="22"
                      value={data.birthDate?.age || ''}
                      onChange={(e) => updateNestedField('birthDate', 'age', e.target.value)}
                    />
                  </label>
                </div>
              </div>
            </div>

            <label className={styles.label}>
              生年月日
              <div className={styles.dateInputs}>
                <input
                  type="text"
                  className={styles.inputShort}
                  placeholder="2004"
                  value={data.birthDate?.year || ''}
                  onChange={(e) => updateNestedField('birthDate', 'year', e.target.value)}
                />
                <span>年</span>
                <input
                  type="text"
                  className={styles.inputTiny}
                  placeholder="4"
                  value={data.birthDate?.month || ''}
                  onChange={(e) => updateNestedField('birthDate', 'month', e.target.value)}
                />
                <span>月</span>
                <input
                  type="text"
                  className={styles.inputTiny}
                  placeholder="1"
                  value={data.birthDate?.day || ''}
                  onChange={(e) => updateNestedField('birthDate', 'day', e.target.value)}
                />
                <span>日生</span>
              </div>
            </label>

            <h3 className={styles.sectionTitle}>現住所・連絡先</h3>
            <div className={styles.formGrid}>
              <div className={styles.formCol}>
                <h4 className={styles.subSectionTitle}>現住所</h4>
                <label className={styles.label}>
                  現住所 ふりがな
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="とうきょうとあだちく..."
                    value={data.addressFurigana || ''}
                    onChange={(e) => updateField('addressFurigana', e.target.value)}
                  />
                </label>

                <label className={styles.label}>
                  郵便番号 (ハイフンなし)
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="1208551"
                    maxLength="7"
                    value={data.addressZip || ''}
                    onChange={(e) => updateField('addressZip', e.target.value)}
                  />
                </label>

                <label className={styles.label}>
                  現住所
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="東京都足立区千住東1-1-1"
                    value={data.address || ''}
                    onChange={(e) => updateField('address', e.target.value)}
                  />
                </label>

                <label className={styles.label}>
                  電話番号 (固定または携帯)
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="03-XXXX-XXXX"
                    value={data.tel || ''}
                    onChange={(e) => updateField('tel', e.target.value)}
                  />
                </label>

                <label className={styles.label}>
                  E-mail
                  <input
                    type="email"
                    className={styles.input}
                    placeholder="taro.tokyo@example.com"
                    value={data.email || ''}
                    onChange={(e) => updateField('email', e.target.value)}
                  />
                </label>
              </div>

              <div className={styles.formCol}>
                <h4 className={styles.subSectionTitle}>連絡先 (現住所と異なる場合のみ)</h4>
                <label className={styles.label}>
                  連絡先 ふりがな
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="現住所以外に連絡を希望する場合のみ記入"
                    value={data.altAddressFurigana || ''}
                    onChange={(e) => updateField('altAddressFurigana', e.target.value)}
                  />
                </label>

                <label className={styles.label}>
                  郵便番号 (ハイフンなし)
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="1000001"
                    maxLength="7"
                    value={data.altAddressZip || ''}
                    onChange={(e) => updateField('altAddressZip', e.target.value)}
                  />
                </label>

                <label className={styles.label}>
                  住所
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="東京都千代田区千代田1-1"
                    value={data.altAddress || ''}
                    onChange={(e) => updateField('altAddress', e.target.value)}
                  />
                </label>

                <label className={styles.label}>
                  電話番号
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="03-YYYY-YYYY"
                    value={data.altTel || ''}
                    onChange={(e) => updateField('altTel', e.target.value)}
                  />
                </label>

                <label className={styles.label}>
                  E-mail
                  <input
                    type="email"
                    className={styles.input}
                    placeholder="alt.tokyo@example.com"
                    value={data.altEmail || ''}
                    onChange={(e) => updateField('altEmail', e.target.value)}
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: 学歴・職歴・賞罰 ================= */}
        {activeTab === 'history' && (
          <div className={styles.tabSection}>
            <div className={styles.historyInfo}>
              <h3 className={styles.sectionTitle}>学歴・職歴・賞罰 (全21行)</h3>
              <p className={styles.descText}>
                JIS規格に基づき、1ページ目に14行、2ページ目に7行が自動的に分割されて配置されます。
              </p>
            </div>

            <div className={styles.gridTableScroll}>
              <table className={styles.editGridTable}>
                <thead>
                  <tr>
                    <th style={{ width: '12%' }}>年</th>
                    <th style={{ width: '8%' }}>月</th>
                    <th style={{ width: '58%' }}>内容 (学歴・職歴・賞罰)</th>
                    <th style={{ width: '22%' }}>配置 (寄せ)</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.gridItems || []).map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <input
                          type="text"
                          className={styles.gridInputCenter}
                          placeholder="2022"
                          value={item.year || ''}
                          onChange={(e) => updateGridItem(idx, 'year', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className={styles.gridInputCenter}
                          placeholder="4"
                          value={item.month || ''}
                          onChange={(e) => updateGridItem(idx, 'month', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className={styles.gridInputLeft}
                          placeholder={idx === 0 ? "学歴の見出しなど" : "○○大学 入学"}
                          value={item.content || ''}
                          onChange={(e) => updateGridItem(idx, 'content', e.target.value)}
                        />
                      </td>
                      <td>
                        <select
                          className={styles.gridSelect}
                          value={item.align || 'left'}
                          onChange={(e) => updateGridItem(idx, 'align', e.target.value)}
                        >
                          <option value="left">左寄せ (内容)</option>
                          <option value="center">中央寄せ (見出し)</option>
                          <option value="right">右寄せ (以上など)</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 3: 免許・資格 ================= */}
        {activeTab === 'license' && (
          <div className={styles.tabSection}>
            <div className={styles.historyInfo}>
              <h3 className={styles.sectionTitle}>免許・資格 (全5行)</h3>
              <p className={styles.descText}>
                JIS規格に基づき、2ページ目の上部に表示されます。
              </p>
            </div>

            <div className={styles.gridTableScroll}>
              <table className={styles.editGridTable}>
                <thead>
                  <tr>
                    <th style={{ width: '15%' }}>年</th>
                    <th style={{ width: '10%' }}>月</th>
                    <th style={{ width: '75%' }}>内容 (免許・資格)</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.licenseItems || []).map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <input
                          type="text"
                          className={styles.gridInputCenter}
                          placeholder="2025"
                          value={item.year || ''}
                          onChange={(e) => updateLicenseItem(idx, 'year', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className={styles.gridInputCenter}
                          placeholder="4"
                          value={item.month || ''}
                          onChange={(e) => updateLicenseItem(idx, 'month', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className={styles.gridInputLeft}
                          placeholder="普通自動車第一種運転免許 取得"
                          value={item.content || ''}
                          onChange={(e) => updateLicenseItem(idx, 'content', e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 4: 自己PR・本人希望欄 ================= */}
        {activeTab === 'intro' && (
          <div className={styles.tabSection}>
            <h3 className={styles.sectionTitle}>自己PR・本人希望欄</h3>

            <label className={styles.label}>
              自己PR
              <textarea
                className={styles.textarea}
                rows="8"
                placeholder="ご自身の強みやこれまでの経験、長所などをアピールしてください。"
                value={data.selfPR || ''}
                onChange={(e) => updateField('selfPR', e.target.value)}
              />
            </label>

            <label className={styles.label}>
              本人希望記入欄
              <textarea
                className={styles.textarea}
                rows="8"
                placeholder="特に給与、職種、勤務時間、勤務地、その他についての希望などがあれば記入してください。"
                value={data.personalRequest || ''}
                onChange={(e) => updateField('personalRequest', e.target.value)}
              />
            </label>
          </div>
        )}

        {/* Global Save Button at bottom of form */}
        <div className={styles.formFooterActions}>
          <button type="submit" className={styles.btnSave}>
            💾 一時保存する
          </button>
        </div>
      </form>
    </div>
  )
}
