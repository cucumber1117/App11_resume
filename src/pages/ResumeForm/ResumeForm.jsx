import { useState } from 'react'
import styles from './ResumeForm.module.css'

export default function ResumeForm({ data, onChange, onSave }) {
  const [activeTab, setActiveTab] = useState('basic')

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

  // Paste image handler for certificate photo
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

  // Handle file select
  function handleFileChange(e) {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => updateField('photo', reader.result)
    reader.readAsDataURL(file)
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
          className={`${styles.tabBtn} ${activeTab === 'research' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('research')}
        >
          卒業研究・得意科目
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'intro' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('intro')}
        >
          自己PR・志望動機
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
                <label className={styles.label}>
                  証明写真 (アップロード / 貼り付け)
                  <div className={styles.photoControl}>
                    <input
                      type="file"
                      accept="image/*"
                      className={styles.fileInput}
                      onChange={handleFileChange}
                    />
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
                </label>

                <label className={styles.label}>
                  参照テンプレートをアップロード (右側に表示)
                  <div className={styles.photoControl}>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className={styles.fileInput}
                      onChange={(e) => {
                        const file = e.target.files && e.target.files[0]
                        if (!file) return
                        const reader = new FileReader()
                        reader.onload = () => updateField('referenceImage', reader.result)
                        // For PDFs we can still show an embedded preview if supported by browser as data URL
                        reader.readAsDataURL(file)
                      }}
                    />
                    {data.referenceImage && (
                      <button
                        type="button"
                        className={styles.btnDangerSmall}
                        onClick={() => updateField('referenceImage', '')}
                      >
                        参照テンプレートを削除
                      </button>
                    )}
                  </div>
                </label>

                <div className={styles.genderDobRow}>
                  <label className={styles.label}>
                    性別
                    <select
                      className={styles.input}
                      value={data.gender || '男'}
                      onChange={(e) => updateField('gender', e.target.value)}
                    >
                      <option value="男">男</option>
                      <option value="女">女</option>
                      <option value="その他">その他 / 未回答</option>
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

                <div className={styles.genderDobRow}>
                  <label className={styles.label}>
                    電話番号 (固定)
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="03-XXXX-XXXX"
                      value={data.tel || ''}
                      onChange={(e) => updateField('tel', e.target.value)}
                    />
                  </label>
                  <label className={styles.label}>
                    携帯電話
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="090-XXXX-XXXX"
                      value={data.mobile || ''}
                      onChange={(e) => updateField('mobile', e.target.value)}
                    />
                  </label>
                </div>
              </div>

              <div className={styles.formCol}>
                <label className={styles.label}>
                  連絡先 (帰省先など) ふりがな
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="現住所以外に連絡を希望する場合のみ記入"
                    value={data.altAddressFurigana || ''}
                    onChange={(e) => updateField('altAddressFurigana', e.target.value)}
                  />
                </label>

                <label className={styles.label}>
                  連絡先 郵便番号
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
                  連絡先 住所
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="東京都千代田区千代田1-1"
                    value={data.altAddress || ''}
                    onChange={(e) => updateField('altAddress', e.target.value)}
                  />
                </label>

                <label className={styles.label}>
                  連絡先 電話番号
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="03-YYYY-YYYY"
                    value={data.altTel || ''}
                    onChange={(e) => updateField('altTel', e.target.value)}
                  />
                </label>
              </div>
            </div>

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
        )}

        {/* ================= TAB 2: 学歴・職歴・賞罰 ================= */}
        {activeTab === 'history' && (
          <div className={styles.tabSection}>
            <div className={styles.historyInfo}>
              <h3 className={styles.sectionTitle}>学歴・職歴・賞罰 (全18行)</h3>
              <p className={styles.descText}>
                日本の履歴書仕様のテーブルです。「学歴」「職歴」「賞罰」などの見出し行は中央寄せにして、「以上」は右寄せにすると見栄えが良くなります。
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

        {/* ================= TAB 3: 東京電機大学・卒業研究 ================= */}
        {activeTab === 'research' && (
          <div className={styles.tabSection}>
            <h3 className={styles.sectionTitle}>{data.uniName || data.universityName || '大学名を入力'} 学業情報</h3>
            
            <div className={styles.formGrid}>
              <div className={styles.formCol}>
                <label className={styles.label}>
                  卒業・修了年月日 (自己紹介書上部)
                  <div className={styles.dateInputs}>
                    <input
                      type="text"
                      className={styles.inputShort}
                      placeholder="2027"
                      value={data.uniYear || ''}
                      onChange={(e) => updateField('uniYear', e.target.value)}
                    />
                    <span>年</span>
                    <input
                      type="text"
                      className={styles.inputTiny}
                      placeholder="3"
                      value={data.uniMonth || ''}
                      onChange={(e) => updateField('uniMonth', e.target.value)}
                    />
                    <span>月</span>
                  </div>
                </label>

                <label className={styles.label}>
                  大学名
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="東京電機大学"
                    value={data.uniName || data.universityName || ''}
                    onChange={(e) => updateField('uniName', e.target.value)}
                  />
                </label>

                <label className={styles.label}>
                  研究科・学部名・学系学科名
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="工学部 情報通信工学科"
                    value={data.uniDept || ''}
                    onChange={(e) => updateField('uniDept', e.target.value)}
                  />
                </label>

                <label className={styles.label}>
                  区分
                  <select
                    className={styles.input}
                    value={data.uniStatus || '見込'}
                    onChange={(e) => updateField('uniStatus', e.target.value)}
                  >
                    <option value="見込">卒業見込</option>
                    <option value="卒業">卒業</option>
                    <option value="修了">修了</option>
                    <option value="修了見込">修了見込</option>
                  </select>
                </label>
              </div>

              <div className={styles.formCol}>
                <label className={styles.label}>
                  自己紹介書用の提出日付
                  <div className={styles.dateInputs}>
                    <input
                      type="text"
                      className={styles.inputShort}
                      placeholder="2026"
                      value={data.selfIntroDate?.year || ''}
                      onChange={(e) => updateNestedField('selfIntroDate', 'year', e.target.value)}
                    />
                    <span>年</span>
                    <input
                      type="text"
                      className={styles.inputTiny}
                      placeholder="6"
                      value={data.selfIntroDate?.month || ''}
                      onChange={(e) => updateNestedField('selfIntroDate', 'month', e.target.value)}
                    />
                    <span>月</span>
                    <input
                      type="text"
                      className={styles.inputTiny}
                      placeholder="13"
                      value={data.selfIntroDate?.day || ''}
                      onChange={(e) => updateNestedField('selfIntroDate', 'day', e.target.value)}
                    />
                    <span>日現在</span>
                  </div>
                </label>

                <p className={styles.helpText}>
                  ※ 自己紹介書の「氏名」「ふりがな」「生年月日」は、履歴書側の入力値が自動同期されます。
                  もし変更したい場合は、画面上部の「基本情報を自己紹介書へ同期」ボタンを押すと再ロードされます。
                </p>
              </div>
            </div>

            <h3 className={styles.sectionTitle}>卒業研究情報</h3>
            <div className={styles.formGrid}>
              <div className={styles.formCol}>
                <label className={styles.label}>
                  卒業研究テーマ (卒業研究のテーマ名)
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="深層学習を用いた自動運転画像認識プロトタイプの開発"
                    value={data.researchTheme || ''}
                    onChange={(e) => updateField('researchTheme', e.target.value)}
                  />
                </label>
              </div>
              <div className={styles.formCol}>
                <label className={styles.label}>
                  指導教員
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="電大 太郎 教授"
                    value={data.supervisor || ''}
                    onChange={(e) => updateField('supervisor', e.target.value)}
                  />
                </label>
              </div>
            </div>

            <label className={styles.label}>
              卒業研究内容 (自己紹介書の「内容」欄)
              <textarea
                className={styles.textarea}
                rows="6"
                placeholder="研究の背景、目的、およびアプローチ方法などを記入してください。"
                value={data.researchContent || ''}
                onChange={(e) => updateField('researchContent', e.target.value)}
              />
            </label>
          </div>
        )}

        {/* ================= TAB 4: 自己紹介書 項目 ================= */}
        {activeTab === 'intro' && (
          <div className={styles.tabSection}>
            <h3 className={styles.sectionTitle}>自己紹介書 その他項目</h3>

            <label className={styles.label}>
              得意な科目
              <textarea
                className={styles.textarea}
                rows="3"
                placeholder="アルゴリズム論、システム開発実習など得意な講義や分野を記入してください。"
                value={data.favoriteSubject || ''}
                onChange={(e) => updateField('favoriteSubject', e.target.value)}
              />
            </label>

            <label className={styles.label}>
              自己PR
              <textarea
                className={styles.textarea}
                rows="5"
                placeholder="ご自身の強みや経験などをアピールしてください。"
                value={data.selfPR || ''}
                onChange={(e) => updateField('selfPR', e.target.value)}
              />
            </label>

            <label className={styles.label}>
              学生時代に打ち込んだこと
              <textarea
                className={styles.textarea}
                rows="5"
                placeholder="サークル活動、部活動、アルバイト、趣味の制作などで力を入れたことを記入してください。"
                value={data.studentActivities || ''}
                onChange={(e) => updateField('studentActivities', e.target.value)}
              />
            </label>

            <label className={styles.label}>
              趣味
              <textarea
                className={styles.textarea}
                rows="3"
                placeholder="旅行、プログラミング、読書など趣味を簡潔に記述してください。"
                value={data.hobbies || ''}
                onChange={(e) => updateField('hobbies', e.target.value)}
              />
            </label>

            <label className={styles.label}>
              資格・免許・特技等
              <textarea
                className={styles.textarea}
                rows="4"
                placeholder="基本情報技術者試験 合格 (2025年4月)&#10;普通自動車第一種運転免許 取得 (2024年8月)など"
                value={data.qualifications || ''}
                onChange={(e) => updateField('qualifications', e.target.value)}
              />
            </label>

            <label className={styles.label}>
              志望動機
              <textarea
                className={styles.textarea}
                rows="5"
                placeholder="その企業・組織を志望する動機を記入してください。"
                value={data.motivation || ''}
                onChange={(e) => updateField('motivation', e.target.value)}
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
