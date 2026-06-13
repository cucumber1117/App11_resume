/* eslint-disable no-irregular-whitespace */
import { useState } from 'react'
import styles from './ResumePreview.module.css'

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
    sections.history ||
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
                  {d.nameFurigana}
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
                  {d.name}
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
                <td className={styles.valFuriCell} style={{ borderBottom: '1px dashed #000' }}>{d.addressFurigana}</td>
                <td className={styles.contactLabelCell} style={{ borderBottom: '1px dashed #000' }}>電話</td>
                <td className={styles.contactValCell} style={{ borderBottom: '1px dashed #000' }}>{d.tel}</td>
              </tr>
              {/* Current Address Main */}
              <tr className={styles.rowAddrMain}>
                <td className={styles.labelCell}>現住所</td>
                <td className={styles.valAddrCell}>
                  〒（{d.addressZip ? `${d.addressZip.slice(0,3)}　－　${d.addressZip.slice(3)}` : '　　　　－　　　　'}）<br />
                  {d.address}
                </td>
                <td className={styles.contactLabelCell}>E-mail</td>
                <td className={styles.contactValCell}>{d.email}</td>
              </tr>

              {sections.alternateContact && (
                <>
                  <tr className={styles.rowAddrFuri}>
                    <td className={styles.labelCell} style={{ borderBottom: '1px dashed #000' }}>ふりがな</td>
                    <td className={styles.valFuriCell} style={{ borderBottom: '1px dashed #000' }}>{d.altAddressFurigana}</td>
                    <td className={styles.contactLabelCell} style={{ borderBottom: '1px dashed #000' }}>電話</td>
                    <td className={styles.contactValCell} style={{ borderBottom: '1px dashed #000' }}>{d.altTel}</td>
                  </tr>
                  <tr className={styles.rowAddrMain}>
                    <td className={styles.labelCell}>連絡先</td>
                    <td className={styles.valAddrCell}>
                      〒（{d.altAddressZip ? `${d.altAddressZip.slice(0,3)}　－　${d.altAddressZip.slice(3)}` : '　　　　－　　　　'}）
                      <span className={styles.altNote}>（現住所以外に連絡を希望する場合のみ記入）</span><br />
                      {d.altAddress}
                    </td>
                    <td className={styles.contactLabelCell}>E-mail</td>
                    <td className={styles.contactValCell}>{d.altEmail}</td>
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
          {sections.history && (
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
              <div className={styles.motivationContainer}>
              <div className={styles.boxLabel}>志望理由</div>
              <div className={styles.boxBodyText}>{d.motivation}</div>
              </div>
            )}

            {/* Self PR Box */}
            {sections.selfPR && (
              <div className={styles.selfPRContainer}>
              <div className={styles.boxLabel}>自己 PR</div>
              <div className={styles.boxBodyText}>{d.selfPR}</div>
              </div>
            )}

            {/* Personal Request Box */}
            {sections.personalRequest && (
              <div className={styles.requestContainer}>
              <div className={styles.boxLabelWithDoubleBorder}>
                本人希望記入欄（特に給与、職種、勤務時間、勤務地、その他についての希望などがあれば記入）
              </div>
              <div className={styles.boxBodyText}>{d.personalRequest}</div>
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
