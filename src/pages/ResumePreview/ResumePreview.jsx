import styles from './ResumePreview.module.css'

export default function ResumePreview({ data }) {
  const d = data || {}
  const gridItems = d.gridItems || []
  
  // Fill remaining items to keep the grid size fixed to 18 rows
  const displayGridItems = [...gridItems]
  while (displayGridItems.length < 18) {
    displayGridItems.push({ year: '', month: '', content: '', align: 'left' })
  }
  // Max 18 rows to avoid overflow
  const slicedGridItems = displayGridItems.slice(0, 18)

  // Sync calculations for self intro info if blank
  const selfIntroFurigana = d.selfIntroFurigana || d.nameFurigana
  const selfIntroName = d.selfIntroName || d.name
  const selfIntroGender = d.selfIntroGender || d.gender
  const selfIntroBirthYear = d.selfIntroBirthDate?.year || d.birthDate?.year
  const selfIntroBirthMonth = d.selfIntroBirthDate?.month || d.birthDate?.month
  const selfIntroBirthDay = d.selfIntroBirthDate?.day || d.birthDate?.day
  const selfIntroBirthAge = d.selfIntroBirthDate?.age || d.birthDate?.age
  const selfIntroDateYear = d.selfIntroDate?.year || d.resumeDate?.year
  const selfIntroDateMonth = d.selfIntroDate?.month || d.resumeDate?.month
  const selfIntroDateDay = d.selfIntroDate?.day || d.resumeDate?.day

  return (
    <div id="resume-preview" className={styles.previewContainer}>
      <div className={styles.sheetsWrapper}>
      {/* ================= PAGE 1: 履歴書 ================= */}
      <div className={styles.a4Sheet} data-sheet="a4">
        {/* Top Date Header */}
        <div className={styles.dateHeader}>
          {d.resumeDate?.year || '　　'} 年 {d.resumeDate?.month || '　'} 月 {d.resumeDate?.day || '　'} 日現在
        </div>

        {/* Title */}
        <div className={styles.documentTitle}>
          履　　歴　　書
        </div>

        {/* Personal Details Block (Name, Gender, DOB, Photo) */}
        <div className={styles.personalBlock}>
          <div className={styles.personalLeft}>
            {/* Furigana Row */}
            <div className={styles.rowFurigana}>
              <span className={styles.labelVerySmall}>ふりがな</span>
              <span className={styles.valFurigana}>{d.nameFurigana}</span>
            </div>
            
            {/* Name & Gender Row */}
            <div className={styles.rowName}>
              <div className={styles.nameCell}>
                <span className={styles.labelSmall}>氏名</span>
                <span className={styles.valName}>{d.name}</span>
              </div>
              <div className={styles.genderCell}>
                <span className={styles.labelCenter}>性別</span>
                <span className={styles.valCenter}>{d.gender}</span>
              </div>
            </div>

            {/* Birth Date Row */}
            <div className={styles.rowBirth}>
              <span className={styles.labelSmall}>生年月日</span>
              <span className={styles.valBirth}>
                {d.birthDate?.year || '　　　　'} 年 {d.birthDate?.month || '　　'} 月 {d.birthDate?.day || '　　'} 日生 （満 {d.birthDate?.age || '　　'} 歳）
              </span>
            </div>
          </div>
          
          <div className={styles.personalRightPhoto}>
            {d.photo ? (
              <img src={d.photo} alt="証明写真" className={styles.uploadedPhoto} />
            ) : (
              <div className={styles.photoPlaceholder}>
                写真貼付窓口
                <span className={styles.photoSub}>
                  (縦 36mm〜40mm<br />横 24mm〜30mm)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Address and Contacts Block */}
        <div className={styles.addressBlock}>
          
          {/* Current Address Row */}
          <div className={styles.addressRow}>
            <div className={styles.addressLeft}>
              <div className={styles.addrFuri}>
                <span className={styles.labelVerySmall}>ふりがな</span>
                <span className={styles.valFuriSmall}>{d.addressFurigana}</span>
              </div>
              <div className={styles.addrMain}>
                <span className={styles.labelAddress}>現住所</span>
                <span className={styles.valAddress}>
                  〒 {d.addressZip ? `${d.addressZip.slice(0,3)}-${d.addressZip.slice(3)}` : '　　　 - 　　　'} <br />
                  {d.address}
                </span>
              </div>
            </div>
            <div className={styles.addressRight}>
              <div className={styles.contactCell}>
                <span className={styles.labelContact}>電話番号</span>
                <span className={styles.valContact}>{d.tel}</span>
              </div>
              <div className={styles.contactCell}>
                <span className={styles.labelContact}>携帯電話</span>
                <span className={styles.valContact}>{d.mobile}</span>
              </div>
            </div>
          </div>

          {/* Alt Address Row */}
          <div className={styles.addressRow}>
            <div className={styles.addressLeft}>
              <div className={styles.addrFuri}>
                <span className={styles.labelVerySmall}>ふりがな</span>
                <span className={styles.valFuriSmall}>{d.altAddressFurigana}</span>
              </div>
              <div className={styles.addrMain}>
                <span className={styles.labelAddress}>連絡先</span>
                <span className={styles.valAddress}>
                  〒 {d.altAddressZip ? `${d.altAddressZip.slice(0,3)}-${d.altAddressZip.slice(3)}` : '　　　 - 　　　'} <br />
                  {d.altAddress}
                </span>
              </div>
            </div>
            <div className={styles.addressRight}>
              <div className={styles.contactCellSingle}>
                <span className={styles.labelContact}>電話番号</span>
                <span className={styles.valContact}>{d.altTel}</span>
              </div>
            </div>
          </div>

          {/* Contact Note Line (under altAddress) */}
          <div className={styles.noteLine}>
            （帰省先欄は、現住所欄以外に連絡を希望する場合のみ記入）
          </div>

          {/* Email Row */}
          <div className={styles.emailRow}>
            <span className={styles.labelEmail}>E-mail</span>
            <span className={styles.valEmail}>{d.email}</span>
          </div>
        </div>

        {/* Education & Work Experience Table */}
        <table className={styles.historyTable}>
          <thead>
            <tr>
              <th className={styles.colYear}>年</th>
              <th className={styles.colMonth}>月</th>
              <th className={styles.colContent}>学歴・職歴・賞罰</th>
            </tr>
          </thead>
          <tbody>
            {slicedGridItems.map((item, idx) => (
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
      </div>

      {/* ================= PAGE 2: 自己紹介書 ================= */}
      <div className={styles.a4Sheet} data-sheet="a4">
        {/* Top Date Header */}
        <div className={styles.dateHeader}>
          {selfIntroDateYear || '　　'} 年 {selfIntroDateMonth || '　'} 月 {selfIntroDateDay || '　'} 日現在
        </div>

        {/* Title */}
        <div className={styles.documentTitle}>
          自己紹介書
        </div>

        {/* University Graduation Block */}
        <div className={styles.uniGradBlock}>
          <div className={styles.uniGradContent}>
            <span>{d.uniYear || '　　'} 年</span>
            <span>{d.uniMonth || '　'} 月</span>
            <span className={styles.uniNameText}>{d.uniName || d.universityName || '　　'}</span>
            <span className={styles.uniDeptText}>{d.uniDept || '　　　　　　　　　　'}</span>
            <span className={styles.uniStatusBadge}>{d.uniStatus || '見込'}</span>
          </div>
        </div>

        {/* Mini Personal profile header */}
        <div className={styles.selfIntroProfile}>
          <div className={styles.sipFuriRow}>
            <div className={styles.sipFuriLabel}>ふりがな</div>
            <div className={styles.sipFuriVal}>{selfIntroFurigana}</div>
            <div className={styles.sipGenderLabel}>性別</div>
            <div className={styles.sipGenderVal}>{selfIntroGender}</div>
          </div>
          <div className={styles.sipNameRow}>
            <div className={styles.sipNameLabel}>氏名</div>
            <div className={styles.sipNameVal}>{selfIntroName}</div>
            <div className={styles.sipBirthLabel}>生年月日</div>
            <div className={styles.sipBirthVal}>
              {selfIntroBirthYear || '　　'} 年 {selfIntroBirthMonth || '　'} 月 {selfIntroBirthDay || '　'} 日生 （満 {selfIntroBirthAge || '　'} 歳）
            </div>
          </div>
        </div>

        {/* Graduation Research block */}
        <div className={styles.researchContainer}>
          <div className={styles.researchHeaderRow}>
            <div className={styles.researchThemeCell}>
              <span className={styles.gridBoxTitle}>卒業研究テーマ</span>
              <span className={styles.gridBoxVal}>{d.researchTheme}</span>
            </div>
            <div className={styles.researchSupervisorCell}>
              <span className={styles.gridBoxTitle}>指導教員</span>
              <span className={styles.gridBoxVal}>{d.supervisor}</span>
            </div>
          </div>
          <div className={styles.researchBodyCell}>
            <div className={styles.researchBodyTitle}>内　　容</div>
            <div className={styles.researchBodyText}>{d.researchContent}</div>
          </div>
        </div>

        {/* Multi-grid for the rest of fields */}
        <div className={styles.gridFormRows}>
          {/* Favorite Subjects */}
          <div className={styles.subjectBox}>
            <div className={styles.boxTitle}>得意な科目</div>
            <div className={styles.boxText}>{d.favoriteSubject}</div>
          </div>

          {/* Self PR */}
          <div className={styles.selfPRBox}>
            <div className={styles.boxTitle}>自己ＰＲ</div>
            <div className={styles.boxText}>{d.selfPR}</div>
          </div>

          {/* Dedicated activity in student years */}
          <div className={styles.activityBox}>
            <div className={styles.boxTitle}>学生時代に打ち込んだこと</div>
            <div className={styles.boxText}>{d.studentActivities}</div>
          </div>

          {/* Hobbies */}
          <div className={styles.hobbyBox}>
            <div className={styles.boxTitle}>趣　味</div>
            <div className={styles.boxText}>{d.hobbies}</div>
          </div>

          {/* Qualifications */}
          <div className={styles.qualifyBox}>
            <div className={styles.boxTitle}>資格・免許・特技等</div>
            <div className={styles.boxText}>{d.qualifications}</div>
          </div>

          {/* Motivation */}
          <div className={styles.motivationBox}>
            <div className={styles.boxTitle}>志望動機</div>
            <div className={styles.boxText}>{d.motivation}</div>
          </div>
        </div>

        {/* School Footer Branding */}
        <footer className={styles.selfIntroFooter}>
          {d.uniName || d.universityName || ''}
        </footer>
      </div>
      </div>

      {/* Reference panel for template images (screen-only) */}
      <div className={styles.refPanel}>
        <div className={styles.refPanelHeader}>参照テンプレート</div>
        {d.referenceImage ? (
          <img src={d.referenceImage} alt="参考テンプレート" className={styles.refImage} />
        ) : (
          <div style={{fontSize:12,color:'#666'}}>ここに参考の履歴書画像をアップロードすると、右側に表示されます。フォームで「参照テンプレートをアップロード」を使ってください。</div>
        )}
      </div>

    </div>
  )
}
