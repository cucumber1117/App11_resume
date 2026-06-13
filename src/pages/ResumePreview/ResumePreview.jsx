/* eslint-disable no-irregular-whitespace */
import { useState } from 'react'
import styles from './ResumePreview.module.css'

function getTextDensity(text = '') {
  const value = String(text)
  const lines = value.split('\n')
  const longestLine = Math.max(0, ...lines.map((line) => line.length))

  return value.length + Math.max(0, lines.length - 1) * 18 +
    Math.max(0, longestLine - 60) * 0.3
}

function getAdaptiveTextStyle(text) {
  const density = getTextDensity(text)

  if (density <= 140) {
    return { fontSize: '11px', lineHeight: 1.6, letterSpacing: '0.04em' }
  }
  if (density <= 280) {
    return { fontSize: '10px', lineHeight: 1.5, letterSpacing: '0.02em' }
  }
  if (density <= 450) {
    return { fontSize: '9px', lineHeight: 1.38, letterSpacing: '0' }
  }
  if (density <= 650) {
    return { fontSize: '8px', lineHeight: 1.28, letterSpacing: '-0.01em' }
  }

  return { fontSize: '7.2px', lineHeight: 1.2, letterSpacing: '-0.02em' }
}

function getAdaptiveBoxStyle(text) {
  const density = getTextDensity(text)
  return {
    flexGrow: Math.min(3.2, Math.max(1, density / 180))
  }
}

function getAdaptiveBasicInfoStyle(text, type = 'standard') {
  const length = String(text || '').length

  if (type === 'address') {
    const addressLevels = [
      { max: 18, fontSize: '15px', lineHeight: 1.35, letterSpacing: '0.04em' },
      { max: 28, fontSize: '13.5px', lineHeight: 1.3, letterSpacing: '0.02em' },
      { max: 40, fontSize: '12px', lineHeight: 1.25, letterSpacing: '0' },
      { max: 55, fontSize: '10.5px', lineHeight: 1.2, letterSpacing: '-0.01em' },
      { max: Infinity, fontSize: '9px', lineHeight: 1.15, letterSpacing: '-0.02em' }
    ]
    const level = addressLevels.find((item) => length <= item.max)

    return {
      fontSize: level.fontSize,
      lineHeight: level.lineHeight,
      letterSpacing: level.letterSpacing
    }
  }

  const settings = {
    name: {
      steps: [12, 20, 30],
      sizes: ['18px', '16px', '14px', '12px'],
      spacing: ['0.1em', '0.06em', '0.02em', '0']
    },
    furigana: {
      steps: [20, 32, 44],
      sizes: ['11px', '10px', '9px', '8px'],
      spacing: ['0.04em', '0.02em', '0', '-0.01em']
    },
    contact: {
      steps: [16, 24, 34],
      sizes: ['11px', '10px', '9px', '8px'],
      spacing: ['0', '-0.01em', '-0.02em', '-0.03em']
    },
    standard: {
      steps: [18, 28, 40],
      sizes: ['11px', '10px', '9px', '8px'],
      spacing: ['0.02em', '0', '-0.01em', '-0.02em']
    }
  }
  const config = settings[type] || settings.standard
  const level = length <= config.steps[0]
    ? 0
    : length <= config.steps[1]
      ? 1
      : length <= config.steps[2]
        ? 2
        : 3

  return {
    fontSize: config.sizes[level],
    letterSpacing: config.spacing[level],
    lineHeight: 1.25
  }
}

export default function ResumePreview({ data, sections = {} }) {
  const [currentPage, setCurrentPage] = useState(0)
  const d = data || {}
  const seenHistoryHeadings = new Set()
  const gridItems = (d.gridItems || []).filter((item) => {
    const content = (item.content || '').replaceAll('　', '').trim()
    if (content === '賞罰' || content === 'なし') {
      return false
    }

    if (content === '学歴' || content === '職歴') {
      if (seenHistoryHeadings.has(content)) {
        return false
      }
      seenHistoryHeadings.add(content)
    }

    return true
  })
  
  // Fill remaining items to keep the grid size fixed to 21 rows
  const displayGridItems = [...gridItems]
  while (displayGridItems.length < 21) {
    displayGridItems.push({ year: '', month: '', content: '', align: 'left' })
  }
  // Page 1: 14 rows, Page 2: 7 rows
  const page1GridItems = displayGridItems.slice(0, 14)
  const page2GridItems = displayGridItems.slice(14, 21)

  // Licenses: 5 rows
  const licenseItems = d.licenseItems || []
  const displayLicenseItems = [...licenseItems]
  while (displayLicenseItems.length < 5) {
    displayLicenseItems.push({ year: '', month: '', content: '' })
  }
  const slicedLicenseItems = displayLicenseItems.slice(0, 5)
  const hasPageTwo = Boolean(
    (sections.history && sections.historyContinuation) ||
    sections.licenses ||
    sections.motivation ||
    sections.selfPR ||
    sections.personalRequest
  )
  const pageCount = hasPageTwo ? 2 : 1
  const visiblePage = hasPageTwo ? currentPage : 0
  const historyTitle = '学　　歴　　・　　職　　歴'

  return (
    <div id="resume-preview" className={styles.previewContainer}>
      {/* Page Navigation */}
      <div className={styles.pageNav}>
        <button
          type="button"
          className={`${styles.pageNavBtn} ${visiblePage === 0 ? styles.pageNavBtnActive : ''}`}
          onClick={() => setCurrentPage(0)}
          aria-pressed={visiblePage === 0}
        >
          1ページ目
        </button>
        {hasPageTwo && (
          <button
            type="button"
            className={`${styles.pageNavBtn} ${visiblePage === 1 ? styles.pageNavBtnActive : ''}`}
            onClick={() => setCurrentPage(1)}
            aria-pressed={visiblePage === 1}
          >
            2ページ目
          </button>
        )}
        <span className={styles.pageIndicator}>
          {visiblePage + 1} / {pageCount}
        </span>
      </div>

      <div className={styles.sheetsWrapper}>
        {/* ================= PAGE 1: 履歴書 1ページ目 ================= */}
        <div className={`${styles.a4Sheet} ${visiblePage === 0 ? styles.pageActive : styles.pageHidden}`} data-sheet="a4">
          
          {/* Top Header Row with Date and Photo */}
          <div className={`${styles.topHeaderArea} ${!sections.photo ? styles.topHeaderWithoutPhoto : ''}`}>
            <div className={styles.headerLeft}>
              <div className={styles.dateHeader}>
                {d.resumeDate?.year || '　　'} 年 {d.resumeDate?.month || '　'} 月 {d.resumeDate?.day || '　'} 日現在
              </div>
              <div className={styles.documentTitle}>履　歴　書</div>
            </div>
            
            {sections.photo && (
              <div className={styles.photoContainer}>
              {d.photo ? (
                <img src={d.photo} alt="証明写真" className={styles.uploadedPhoto} />
              ) : (
                <div className={styles.photoPlaceholder}>
                  <div className={styles.photoTitle}>写真を貼る位置</div>
                  <span className={styles.photoSub}>
                    写真を貼る必要が<br />ある場合<br />
                    1. 縦 36～40mm<br />
                    &nbsp;&nbsp;&nbsp;横 24～30mm<br />
                    2. 本人単身胸から上<br />
                    3. 裏面のりづけ<br />
                    4. 裏面に氏名記入
                  </span>
                </div>
              )}
              </div>
            )}
          </div>

          {/* Personal Details Table */}
          <table className={styles.personalTable}>
            <tbody>
              <tr className={styles.rowFurigana}>
                <td className={styles.labelCell} style={{ borderBottom: '1px dashed #000' }}>ふりがな</td>
                <td
                  className={styles.valCell}
                  style={{ borderBottom: '1px dashed #000' }}
                  colSpan={sections.gender ? 1 : 3}
                >
                  <span style={getAdaptiveBasicInfoStyle(d.nameFurigana, 'furigana')}>
                    {d.nameFurigana}
                  </span>
                </td>
                {sections.gender && (
                  <>
                    <td className={styles.genderLabelCell} rowSpan="2">※性別</td>
                    <td className={styles.genderValCell} rowSpan="2">{d.gender}</td>
                  </>
                )}
              </tr>
              <tr className={styles.rowName}>
                <td className={styles.labelCell}>氏　　名</td>
                <td className={styles.valNameCell} colSpan={sections.gender ? 1 : 3}>
                  <span
                    className={styles.nameValue}
                    style={getAdaptiveBasicInfoStyle(d.name, 'name')}
                  >
                    {d.name}
                  </span>
                </td>
              </tr>
              <tr className={styles.rowBirth}>
                <td className={styles.labelCell}>生年月日</td>
                <td className={styles.valBirthCell} colSpan="3">
                  {d.birthDate?.year || '　　　　'} 年 {d.birthDate?.month || '　　'} 月 {d.birthDate?.day || '　　'} 日生 （満 {d.birthDate?.age || '　　'} 歳）
                </td>
              </tr>
            </tbody>
          </table>

          {/* Address and Contacts Table */}
          <table className={styles.addressTable}>
            <tbody>
              {/* Current Address Furigana */}
              <tr className={styles.rowAddrFuri}>
                <td className={styles.labelCell} style={{ borderBottom: '1px dashed #000' }}>ふりがな</td>
                <td className={styles.valFuriCell} style={{ borderBottom: '1px dashed #000' }}>
                  <span style={getAdaptiveBasicInfoStyle(d.addressFurigana, 'furigana')}>
                    {d.addressFurigana}
                  </span>
                </td>
                <td className={styles.contactLabelCell} style={{ borderBottom: '1px dashed #000' }}>電話</td>
                <td className={styles.contactValCell} style={{ borderBottom: '1px dashed #000' }}>
                  <span style={getAdaptiveBasicInfoStyle(d.tel, 'contact')}>{d.tel}</span>
                </td>
              </tr>
              {/* Current Address Main */}
              <tr className={styles.rowAddrMain}>
                <td className={styles.labelCell}>現住所</td>
                <td className={styles.valAddrCell}>
                  <span className={styles.addressPostal}>
                    〒（{d.addressZip ? `${d.addressZip.slice(0,3)}　－　${d.addressZip.slice(3)}` : '　　　　－　　　　'}）
                  </span>
                  <span
                    className={styles.addressValue}
                    style={getAdaptiveBasicInfoStyle(d.address, 'address')}
                  >
                    {d.address}
                  </span>
                </td>
                <td className={styles.contactLabelCell}>E-mail</td>
                <td className={styles.contactValCell}>
                  <span style={getAdaptiveBasicInfoStyle(d.email, 'contact')}>{d.email}</span>
                </td>
              </tr>

              {sections.alternateContact && (
                <>
                  <tr className={styles.rowAddrFuri}>
                    <td className={styles.labelCell} style={{ borderBottom: '1px dashed #000' }}>ふりがな</td>
                    <td className={styles.valFuriCell} style={{ borderBottom: '1px dashed #000' }}>
                      <span style={getAdaptiveBasicInfoStyle(d.altAddressFurigana, 'furigana')}>
                        {d.altAddressFurigana}
                      </span>
                    </td>
                    <td className={styles.contactLabelCell} style={{ borderBottom: '1px dashed #000' }}>電話</td>
                    <td className={styles.contactValCell} style={{ borderBottom: '1px dashed #000' }}>
                      <span style={getAdaptiveBasicInfoStyle(d.altTel, 'contact')}>{d.altTel}</span>
                    </td>
                  </tr>
                  <tr className={styles.rowAddrMain}>
                    <td className={styles.labelCell}>連絡先</td>
                    <td className={styles.valAddrCell}>
                      <span className={styles.addressPostal}>
                        〒（{d.altAddressZip ? `${d.altAddressZip.slice(0,3)}　－　${d.altAddressZip.slice(3)}` : '　　　　－　　　　'}）
                        <span className={styles.altNote}>（現住所以外に連絡を希望する場合のみ記入）</span>
                      </span>
                      <span
                        className={styles.addressValue}
                        style={getAdaptiveBasicInfoStyle(d.altAddress, 'address')}
                      >
                        {d.altAddress}
                      </span>
                    </td>
                    <td className={styles.contactLabelCell}>E-mail</td>
                    <td className={styles.contactValCell}>
                      <span style={getAdaptiveBasicInfoStyle(d.altEmail, 'contact')}>
                        {d.altEmail}
                      </span>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>

          {/* Education & Work Experience Table (Page 1: 14 rows) */}
          {sections.history && (
            <table className={styles.historyTable}>
            <thead>
              <tr>
                <th className={styles.colYear}>年</th>
                <th className={styles.colMonth}>月</th>
                <th className={styles.colContent}>{historyTitle}</th>
              </tr>
            </thead>
            <tbody>
              {page1GridItems.map((item, idx) => (
                <tr key={idx} className={styles.historyRow}>
                  <td className={styles.cellYear}>{item.year}</td>
                  <td className={styles.cellMonth}>{item.month}</td>
                  <td className={`${styles.cellContent} ${styles[item.align || 'left']}`}>
                    {item.content}
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          )}

          {/* Gender note at the bottom of Page 1 */}
          {sections.gender && (
            <div className={styles.genderNote}>
              ※「性別」欄：記載は任意です。未記載とすることも可能です。
            </div>
          )}
        </div>

        {/* ================= PAGE 2: 履歴書 2ページ目 ================= */}
        {hasPageTwo && (
          <div className={`${styles.a4Sheet} ${visiblePage === 1 ? styles.pageActive : styles.pageHidden}`} data-sheet="a4">
          {/* Education & Work Experience Table (Page 2: 7 rows) */}
          {sections.history && sections.historyContinuation && (
            <table className={styles.historyTable} style={{ marginTop: 0 }}>
            <thead>
              <tr>
                <th className={styles.colYear}>年</th>
                <th className={styles.colMonth}>月</th>
                <th className={styles.colContent}>続　　き</th>
              </tr>
            </thead>
            <tbody>
              {page2GridItems.map((item, idx) => (
                <tr key={idx} className={styles.historyRow}>
                  <td className={styles.cellYear}>{item.year}</td>
                  <td className={styles.cellMonth}>{item.month}</td>
                  <td className={`${styles.cellContent} ${styles[item.align || 'left']}`}>
                    {item.content}
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          )}

          {/* Licenses & Qualifications Table (5 rows) */}
          {sections.licenses && (
            <table className={styles.licenseTable}>
            <thead>
              <tr>
                <th className={styles.colYear}>年</th>
                <th className={styles.colMonth}>月</th>
                <th className={styles.colContent}>免　　許　　・　　資　　格</th>
              </tr>
            </thead>
            <tbody>
              {slicedLicenseItems.map((item, idx) => (
                <tr key={idx} className={styles.licenseRow}>
                  <td className={styles.cellYear}>{item.year}</td>
                  <td className={styles.cellMonth}>{item.month}</td>
                  <td className={styles.cellContent}>{item.content}</td>
                </tr>
              ))}
            </tbody>
            </table>
          )}

          {/* Motivation, Self PR & Personal Request area */}
          {(sections.motivation || sections.selfPR || sections.personalRequest) && (
            <div className={styles.largeTextBoxes}>
            {/* Motivation Box */}
            {sections.motivation && (
              <div
                className={styles.motivationContainer}
                style={getAdaptiveBoxStyle(d.motivation)}
              >
              <div className={styles.boxLabel}>志望理由</div>
              <div
                className={styles.boxBodyText}
                style={getAdaptiveTextStyle(d.motivation)}
              >
                {d.motivation}
              </div>
              </div>
            )}

            {/* Self PR Box */}
            {sections.selfPR && (
              <div
                className={styles.selfPRContainer}
                style={getAdaptiveBoxStyle(d.selfPR)}
              >
              <div className={styles.boxLabel}>自己 PR</div>
              <div
                className={styles.boxBodyText}
                style={getAdaptiveTextStyle(d.selfPR)}
              >
                {d.selfPR}
              </div>
              </div>
            )}

            {/* Personal Request Box */}
            {sections.personalRequest && (
              <div
                className={styles.requestContainer}
                style={getAdaptiveBoxStyle(d.personalRequest)}
              >
              <div className={styles.boxLabelWithDoubleBorder}>
                本人希望記入欄（特に給与、職種、勤務時間、勤務地、その他についての希望などがあれば記入）
              </div>
              <div
                className={styles.boxBodyText}
                style={getAdaptiveTextStyle(d.personalRequest)}
              >
                {d.personalRequest}
              </div>
              </div>
            )}
            </div>
          )}
          </div>
        )}
      </div>

    </div>
  )
}
