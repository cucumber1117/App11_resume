import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import styles from './ResumeForm.module.css'

const SELF_PR_MAX_LENGTH = 800
const MOTIVATION_MAX_LENGTH = 800
const PERSONAL_REQUEST_MAX_LENGTH = 400

function createHistoryRow(overrides = {}) {
  const id = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `history-${Date.now()}-${Math.random().toString(36).slice(2)}`

  return {
    id,
    year: '',
    month: '',
    content: '',
    align: 'left',
    ...overrides
  }
}

function formatPhoneNumber(value = '') {
  const digits = String(value).replace(/\D/g, '').slice(0, 11)

  if (digits.length <= 3) {
    return digits
  }

  if (digits.length === 11 || /^(070|080|090|050)/.test(digits)) {
    return [digits.slice(0, 3), digits.slice(3, 7), digits.slice(7)]
      .filter(Boolean)
      .join('-')
  }

  if (/^(03|06)/.test(digits)) {
    return [digits.slice(0, 2), digits.slice(2, 6), digits.slice(6)]
      .filter(Boolean)
      .join('-')
  }

  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6)]
    .filter(Boolean)
    .join('-')
}

function isEmptyHistoryItem(item = {}) {
  return item.kind !== 'heading' &&
    !item.year &&
    !item.month &&
    !(item.content || '').trim()
}

function normalizeHistoryContent(content = '') {
  return content.replaceAll('　', '').trim()
}

function isHistoryHeading(item = {}) {
  const content = normalizeHistoryContent(item.content)
  return item.kind === 'heading' || content === '学歴' || content === '職歴'
}

function getHistoryPlaceholder(items, index) {
  let section = 'education'

  for (let itemIndex = 0; itemIndex < index; itemIndex += 1) {
    const content = normalizeHistoryContent(items[itemIndex]?.item?.content)
    if (content === '学歴') section = 'education'
    if (content === '職歴') section = 'work'
  }

  if (section === 'work') {
    return index % 2 === 0 ? '株式会社○○ 入社' : '株式会社○○ 退職'
  }

  return index % 2 === 0 ? '○○高等学校 卒業' : '○○大学 入学'
}

function SortableHistoryRow({
  entry,
  index,
  headingRow,
  placeholder,
  onUpdate,
  onClear
}) {
  const { item, originalIndex } = entry
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver
  } = useSortable({ id: item.id })
  const rowStyle = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <tr
      ref={setNodeRef}
      style={rowStyle}
      className={[
        headingRow ? styles.headingEditRow : '',
        isDragging ? styles.draggingRow : '',
        isOver && !isDragging ? styles.dropTargetRow : ''
      ].filter(Boolean).join(' ')}
    >
      <td className={styles.dragHandleCell}>
        <button
          type="button"
          className={styles.dragHandle}
          aria-label={`${index + 1}行目を並び替え`}
          title="ドラッグして並び替え"
          {...attributes}
          {...listeners}
        >
          ≡
        </button>
      </td>
      <td className={styles.rowNumberCell}>{index + 1}</td>
      <td>
        <div className={styles.compactDateInputs}>
          <input
            type="text"
            inputMode="numeric"
            maxLength="4"
            className={styles.gridInputCenter}
            aria-label={`${index + 1}行目の年`}
            placeholder="2022"
            disabled={headingRow}
            value={item.year || ''}
            onChange={(event) => onUpdate(
              originalIndex,
              'year',
              event.target.value.replace(/\D/g, '')
            )}
          />
          <span>年</span>
          <input
            type="text"
            inputMode="numeric"
            maxLength="2"
            className={styles.gridInputCenter}
            aria-label={`${index + 1}行目の月`}
            placeholder="4"
            disabled={headingRow}
            value={item.month || ''}
            onChange={(event) => onUpdate(
              originalIndex,
              'month',
              event.target.value.replace(/\D/g, '')
            )}
          />
          <span>月</span>
        </div>
      </td>
      <td>
        <input
          type="text"
          className={styles.gridInputLeft}
          placeholder={headingRow ? '見出しを入力' : placeholder}
          value={item.content || ''}
          onChange={(event) => onUpdate(originalIndex, 'content', event.target.value)}
        />
      </td>
      <td>
        <select
          className={styles.gridSelect}
          value={headingRow ? 'center' : (item.align || 'left')}
          disabled={headingRow}
          onChange={(event) => onUpdate(originalIndex, 'align', event.target.value)}
        >
          <option value="left">左</option>
          <option value="center">中央</option>
          <option value="right">右</option>
        </select>
      </td>
      <td>
        <div className={styles.rowActions}>
          <button
            type="button"
            className={`${styles.rowActionButton} ${styles.rowDeleteButton}`}
            onClick={() => onClear(originalIndex)}
            aria-label={`${index + 1}行目を削除`}
            title="削除"
          >
            ×
          </button>
        </div>
      </td>
    </tr>
  )
}

export default function ResumeForm({ data, onChange, onSave, sections = {} }) {
  const [activeTab, setActiveTab] = useState('basic')
  const [isPhotoDragging, setIsPhotoDragging] = useState(false)
  const [photoError, setPhotoError] = useState('')
  const [educationEntry, setEducationEntry] = useState({
    schoolType: 'university',
    universityName: '',
    highSchoolName: '',
    facultyName: '',
    departmentName: '',
    admissionYear: '',
    admissionMonth: '',
    completionYear: '',
    completionMonth: '',
    completionStatus: '卒業'
  })
  const [educationEntryMessage, setEducationEntryMessage] = useState('')
  const [historyListMessage, setHistoryListMessage] = useState('')
  const [activeHistoryId, setActiveHistoryId] = useState(null)
  const historySensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 }
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 8 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )
  const showIntroTab =
    sections.motivation || sections.selfPR || sections.personalRequest
  const historyLabel = '学歴・職歴'
  const activeTabIsAvailable =
    activeTab === 'basic' ||
    (activeTab === 'history' && sections.history) ||
    (activeTab === 'license' && sections.licenses) ||
    (activeTab === 'intro' && showIntroTab)
  const visibleTab = activeTabIsAvailable ? activeTab : 'basic'
  const seenHistoryHeadings = new Set()
  const visibleGridItems = (data.gridItems || [])
    .map((item, originalIndex) => ({ item, originalIndex }))
    .filter(({ item }) => {
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
    .slice(0, sections.historyContinuation ? 21 : 14)
  const activeHistoryEntry = visibleGridItems.find(
    ({ item }) => item.id === activeHistoryId
  )

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

  function calculateAge(birthDate, referenceDate) {
    const birthYear = Number(birthDate?.year)
    const birthMonth = Number(birthDate?.month)
    const birthDay = Number(birthDate?.day)
    const referenceYear = Number(referenceDate?.year)
    const referenceMonth = Number(referenceDate?.month)
    const referenceDay = Number(referenceDate?.day)

    if (
      !birthYear || !birthMonth || !birthDay ||
      !referenceYear || !referenceMonth || !referenceDay
    ) {
      return ''
    }

    let age = referenceYear - birthYear
    if (
      referenceMonth < birthMonth ||
      (referenceMonth === birthMonth && referenceDay < birthDay)
    ) {
      age -= 1
    }

    return age >= 0 ? String(age) : ''
  }

  function updateResumeDate(field, value) {
    const resumeDate = {
      ...(data.resumeDate || {}),
      [field]: value
    }
    const age = calculateAge(data.birthDate, resumeDate)

    onChange({
      ...data,
      resumeDate,
      birthDate: {
        ...(data.birthDate || {}),
        age
      }
    })
  }

  function updateBirthDate(field, value) {
    const birthDate = {
      ...(data.birthDate || {}),
      [field]: value
    }
    birthDate.age = calculateAge(birthDate, data.resumeDate)

    onChange({
      ...data,
      birthDate
    })
  }

  // Helper to update grid row items
  function updateGridItem(idx, field, value) {
    const nextGrid = [...(data.gridItems || [])]
    const nextItem = {
      ...nextGrid[idx],
      [field]: value
    }

    if (field === 'content') {
      const normalizedContent = normalizeHistoryContent(value)
      if (normalizedContent === '学歴' || normalizedContent === '職歴') {
        nextItem.year = ''
        nextItem.month = ''
        nextItem.align = 'center'
        nextItem.kind = 'heading'
      }
    }

    nextGrid[idx] = nextItem
    setHistoryListMessage('')
    onChange({ ...data, gridItems: nextGrid })
  }

  function handleHistoryDragEnd({ active, over }) {
    setActiveHistoryId(null)
    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = visibleGridItems.findIndex(({ item }) => item.id === active.id)
    const newIndex = visibleGridItems.findIndex(({ item }) => item.id === over.id)
    if (oldIndex < 0 || newIndex < 0) {
      return
    }

    const reorderedItems = arrayMove(
      visibleGridItems.map(({ item }) => item),
      oldIndex,
      newIndex
    )
    const targetIndexes = visibleGridItems
      .map(({ originalIndex }) => originalIndex)
      .sort((left, right) => left - right)
    const nextGrid = [...(data.gridItems || [])]
    targetIndexes.forEach((originalIndex, index) => {
      nextGrid[originalIndex] = reorderedItems[index]
    })

    setHistoryListMessage('')
    onChange({ ...data, gridItems: nextGrid })
  }

  function clearGridItem(originalIndex) {
    const nextGrid = [...(data.gridItems || [])]
    nextGrid[originalIndex] = {
      id: nextGrid[originalIndex]?.id || createHistoryRow().id,
      year: '',
      month: '',
      content: '',
      align: 'left',
      kind: undefined
    }
    setHistoryListMessage('')
    onChange({ ...data, gridItems: nextGrid })
  }

  function addHistoryListItem(type) {
    const visibleCount = sections.historyContinuation ? 21 : 14
    const currentGrid = [...(data.gridItems || [])]
    while (currentGrid.length < 21) {
      currentGrid.push(createHistoryRow())
    }

    const visibleItems = currentGrid.slice(0, visibleCount)
    if (!visibleItems.some((item) => isEmptyHistoryItem(item))) {
      setHistoryListMessage(
        '空き行がありません。不要な行を削除するか、項目設定で続き欄を追加してください。'
      )
      return
    }

    const findContentIndex = (content) => visibleItems.findIndex(
      (item) => normalizeHistoryContent(item.content) === content
    )
    const workHeadingIndex = findContentIndex('職歴')
    const closingIndex = findContentIndex('以上')
    const firstEmptyIndex = visibleItems.findIndex((item) => isEmptyHistoryItem(item))
    let insertIndex = firstEmptyIndex
    let newItem = createHistoryRow()

    if (type === 'education') {
      insertIndex = workHeadingIndex >= 0 ? workHeadingIndex : firstEmptyIndex
    } else if (type === 'work') {
      insertIndex = closingIndex >= 0 ? closingIndex : firstEmptyIndex
    } else if (type === 'heading') {
      newItem = createHistoryRow({
        content: '',
        align: 'center',
        kind: 'heading'
      })
    } else if (type === 'closing') {
      newItem = createHistoryRow({
        content: '以　　上',
        align: 'right'
      })
    }

    visibleItems.splice(insertIndex, 0, newItem)
    const removableIndex = visibleItems.findLastIndex((item) => isEmptyHistoryItem(item))
    if (removableIndex < 0) {
      setHistoryListMessage('行を追加できませんでした。空行を作ってから再度お試しください。')
      return
    }
    visibleItems.splice(removableIndex, 1)

    setHistoryListMessage('')
    onChange({
      ...data,
      gridItems: [
        ...visibleItems,
        ...currentGrid.slice(visibleCount)
      ].slice(0, 21)
    })
  }

  function compactHistoryRows() {
    const visibleCount = sections.historyContinuation ? 21 : 14
    const currentGrid = [...(data.gridItems || [])]
    const compactedItems = currentGrid
      .slice(0, visibleCount)
      .filter((item) => !isEmptyHistoryItem(item))

    while (compactedItems.length < visibleCount) {
      compactedItems.push(createHistoryRow())
    }

    onChange({
      ...data,
      gridItems: [
        ...compactedItems,
        ...currentGrid.slice(visibleCount)
      ].slice(0, 21)
    })
    setHistoryListMessage('空行を一覧の末尾へ移動しました。')
  }

  function updateEducationEntry(field, value) {
    setEducationEntry((current) => ({
      ...current,
      ...(field === 'schoolType'
        ? {
            universityName: '',
            highSchoolName: '',
            facultyName: '',
            departmentName: ''
          }
        : {}),
      [field]: value
    }))
    setEducationEntryMessage('')
  }

  function addEducationEntry() {
    const {
      schoolType,
      universityName,
      highSchoolName,
      facultyName,
      departmentName,
      admissionYear,
      admissionMonth,
      completionYear,
      completionMonth,
      completionStatus
    } = educationEntry
    const isHighSchool = schoolType === 'highSchool'
    const primarySchoolName = isHighSchool
      ? highSchoolName.trim()
      : universityName.trim()
    const schoolName = [
      primarySchoolName,
      isHighSchool ? '' : facultyName.trim(),
      departmentName.trim()
    ].filter(Boolean).join(' ')

    if (
      !primarySchoolName ||
      !admissionYear ||
      !admissionMonth ||
      !completionYear ||
      !completionMonth
    ) {
      setEducationEntryMessage(
        `${isHighSchool ? '学校名' : '大学名'}と入学・終了年月をすべて入力してください。`
      )
      return
    }

    const nextGrid = [...(data.gridItems || [])]
    while (nextGrid.length < 21) {
      nextGrid.push(createHistoryRow())
    }

    const workHeadingIndex = nextGrid.findIndex((item) => (
      (item.content || '').replaceAll('　', '').trim() === '職歴'
    ))
    const educationHeadingIndex = nextGrid.findIndex((item) => (
      (item.content || '').replaceAll('　', '').trim() === '学歴'
    ))
    if (educationHeadingIndex < 0 || workHeadingIndex < 0) {
      setEducationEntryMessage('「学歴」と「職歴」の見出し行が必要です。')
      return
    }

    const generatedRows = [
      {
        id: createHistoryRow().id,
        year: String(admissionYear),
        month: String(admissionMonth),
        content: `${schoolName} 入学`,
        align: 'left'
      },
      {
        id: createHistoryRow().id,
        year: String(completionYear),
        month: String(completionMonth),
        content: `${schoolName} ${completionStatus}`,
        align: 'left'
      }
    ]

    const isEmptyRow = (item) => (
      !item.year && !item.month && !(item.content || '').trim()
    )
    const existingEducationRows = nextGrid
      .slice(educationHeadingIndex + 1, workHeadingIndex)
      .filter((item) => !isEmptyRow(item))
    const rebuiltGrid = [
      ...nextGrid.slice(0, educationHeadingIndex + 1),
      ...existingEducationRows,
      ...generatedRows,
      ...nextGrid.slice(workHeadingIndex)
    ]

    while (rebuiltGrid.length > 21) {
      const removableIndex = rebuiltGrid.findLastIndex((item) => isEmptyRow(item))
      if (removableIndex < 0) {
        setEducationEntryMessage(
          '履歴欄に2行分の空きがありません。不要な行を空欄にしてから追加してください。'
        )
        return
      }
      rebuiltGrid.splice(removableIndex, 1)
    }

    const lastFilledIndex = rebuiltGrid.findLastIndex((item) => !isEmptyRow(item))
    if (!sections.historyContinuation && lastFilledIndex >= 14) {
      setEducationEntryMessage(
        '1ページ目に収まりません。「項目設定」で学歴・職歴の続き欄を有効にしてください。'
      )
      return
    }

    while (rebuiltGrid.length < 21) {
      rebuiltGrid.push(createHistoryRow())
    }

    onChange({ ...data, gridItems: rebuiltGrid })
    setEducationEntry({
      schoolType: 'university',
      universityName: '',
      highSchoolName: '',
      facultyName: '',
      departmentName: '',
      admissionYear: '',
      admissionMonth: '',
      completionYear: '',
      completionMonth: '',
      completionStatus: '卒業'
    })
    setEducationEntryMessage('学歴へ2行追加しました。下の一覧から修正できます。')
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
          className={`${styles.tabBtn} ${visibleTab === 'basic' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          基本情報・住所
        </button>
        {sections.history && (
          <button
            type="button"
            className={`${styles.tabBtn} ${visibleTab === 'history' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('history')}
          >
            {historyLabel}
          </button>
        )}
        {sections.licenses && (
          <button
            type="button"
            className={`${styles.tabBtn} ${visibleTab === 'license' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('license')}
          >
            免許・資格
          </button>
        )}
        {showIntroTab && (
          <button
            type="button"
            className={`${styles.tabBtn} ${visibleTab === 'intro' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('intro')}
          >
            志望理由・PR
          </button>
        )}
      </nav>

      {/* Form Content area */}
      <form onSubmit={(e) => { e.preventDefault(); onSave(data) }} className={styles.formBody}>
        
        {/* ================= TAB 1: 基本情報 ================= */}
        {visibleTab === 'basic' && (
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
                      onChange={(e) => updateResumeDate('year', e.target.value)}
                    />
                    <span>年</span>
                    <input
                      type="text"
                      className={styles.inputTiny}
                      placeholder="6"
                      value={data.resumeDate?.month || ''}
                      onChange={(e) => updateResumeDate('month', e.target.value)}
                    />
                    <span>月</span>
                    <input
                      type="text"
                      className={styles.inputTiny}
                      placeholder="13"
                      value={data.resumeDate?.day || ''}
                      onChange={(e) => updateResumeDate('day', e.target.value)}
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
                {sections.photo && (
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
                )}

                {sections.gender ? (
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
                ) : (
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
                )}
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
                  onChange={(e) => updateBirthDate('year', e.target.value)}
                />
                <span>年</span>
                <input
                  type="text"
                  className={styles.inputTiny}
                  placeholder="4"
                  value={data.birthDate?.month || ''}
                  onChange={(e) => updateBirthDate('month', e.target.value)}
                />
                <span>月</span>
                <input
                  type="text"
                  className={styles.inputTiny}
                  placeholder="1"
                  value={data.birthDate?.day || ''}
                  onChange={(e) => updateBirthDate('day', e.target.value)}
                />
                <span>日生</span>
              </div>
            </label>

            <h3 className={styles.sectionTitle}>現住所・連絡先</h3>
            <div className={`${styles.formGrid} ${!sections.alternateContact ? styles.formGridSingle : ''}`}>
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
                    type="tel"
                    className={styles.input}
                    placeholder="03-1234-5678"
                    inputMode="numeric"
                    maxLength="13"
                    value={data.tel || ''}
                    onChange={(e) => updateField('tel', formatPhoneNumber(e.target.value))}
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

              {sections.alternateContact && (
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
                    type="tel"
                    className={styles.input}
                    placeholder="03-1234-5678"
                    inputMode="numeric"
                    maxLength="13"
                    value={data.altTel || ''}
                    onChange={(e) => updateField('altTel', formatPhoneNumber(e.target.value))}
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
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 2: 学歴・職歴 ================= */}
        {sections.history && visibleTab === 'history' && (
          <div className={styles.tabSection}>
            <div className={styles.historyInfo}>
              <h3 className={styles.sectionTitle}>
                {historyLabel}（全{sections.historyContinuation ? 21 : 14}行）
              </h3>
              <p className={styles.descText}>
                1ページ目に14行表示されます。続きが必要な場合は「項目設定」から2ページ目の7行を追加できます。
              </p>
            </div>

            <section className={styles.educationHelper}>
              <div className={styles.educationHelperHeader}>
                <div>
                  <h4>学歴かんたん入力</h4>
                  <p>大学または高校を選び、学校情報と年月を入力すると2行を自動で追加します。</p>
                </div>
              </div>

              <label className={styles.educationTypeField}>
                学校種別
                <select
                  className={styles.input}
                  value={educationEntry.schoolType}
                  onChange={(e) => updateEducationEntry('schoolType', e.target.value)}
                >
                  <option value="university">大学</option>
                  <option value="highSchool">高校</option>
                </select>
              </label>

              <div
                className={`${styles.educationSchoolGrid} ${
                  educationEntry.schoolType === 'highSchool'
                    ? styles.educationSchoolGridCompact
                    : ''
                }`}
              >
                <label className={styles.label}>
                  {educationEntry.schoolType === 'highSchool' ? '学校名' : '大学名'}
                  <input
                    type="text"
                    className={styles.input}
                    placeholder={
                      educationEntry.schoolType === 'highSchool'
                        ? '○○高等学校'
                        : '○○大学'
                    }
                    value={
                      educationEntry.schoolType === 'highSchool'
                        ? educationEntry.highSchoolName
                        : educationEntry.universityName
                    }
                    onChange={(e) => updateEducationEntry(
                      educationEntry.schoolType === 'highSchool'
                        ? 'highSchoolName'
                        : 'universityName',
                      e.target.value
                    )}
                  />
                </label>

                {educationEntry.schoolType === 'university' && (
                  <label className={styles.label}>
                    学部
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="○○学部"
                      value={educationEntry.facultyName}
                      onChange={(e) => updateEducationEntry('facultyName', e.target.value)}
                    />
                  </label>
                )}

                <label className={styles.label}>
                  学科{educationEntry.schoolType === 'highSchool' ? '（任意）' : ''}
                  <input
                    type="text"
                    className={styles.input}
                    placeholder={
                      educationEntry.schoolType === 'highSchool'
                        ? '普通科'
                        : '○○学科'
                    }
                    value={educationEntry.departmentName}
                    onChange={(e) => updateEducationEntry('departmentName', e.target.value)}
                  />
                </label>
              </div>

              <div className={styles.educationDetailsGrid}>
                <fieldset className={styles.educationDateField}>
                  <legend>入学年月</legend>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength="4"
                    className={styles.gridInputCenter}
                    placeholder="2022"
                    aria-label="入学年"
                    value={educationEntry.admissionYear}
                    onChange={(e) => updateEducationEntry('admissionYear', e.target.value.replace(/\D/g, ''))}
                  />
                  <span>年</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength="2"
                    className={styles.gridInputCenter}
                    placeholder="4"
                    aria-label="入学月"
                    value={educationEntry.admissionMonth}
                    onChange={(e) => updateEducationEntry('admissionMonth', e.target.value.replace(/\D/g, ''))}
                  />
                  <span>月</span>
                </fieldset>

                <fieldset className={styles.educationDateField}>
                  <legend>
                    {educationEntry.schoolType === 'highSchool' ? '卒業年月' : '終了年月'}
                  </legend>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength="4"
                    className={styles.gridInputCenter}
                    placeholder="2026"
                    aria-label="終了年"
                    value={educationEntry.completionYear}
                    onChange={(e) => updateEducationEntry('completionYear', e.target.value.replace(/\D/g, ''))}
                  />
                  <span>年</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength="2"
                    className={styles.gridInputCenter}
                    placeholder="3"
                    aria-label="終了月"
                    value={educationEntry.completionMonth}
                    onChange={(e) => updateEducationEntry('completionMonth', e.target.value.replace(/\D/g, ''))}
                  />
                  <span>月</span>
                </fieldset>

                <label className={styles.label}>
                  状態
                  <select
                    className={styles.input}
                    value={educationEntry.completionStatus}
                    onChange={(e) => updateEducationEntry('completionStatus', e.target.value)}
                  >
                    <option value="卒業">卒業</option>
                    <option value="中途退学">中退</option>
                    <option value="卒業見込み">卒業見込み</option>
                  </select>
                </label>
              </div>

              <div className={styles.educationHelperActions}>
                {educationEntryMessage && (
                  <p className={styles.educationEntryMessage} role="status">
                    {educationEntryMessage}
                  </p>
                )}
                <button
                  type="button"
                  className={styles.educationAddButton}
                  onClick={addEducationEntry}
                >
                  学歴へ追加
                </button>
              </div>
            </section>

            <div className={styles.historyListHeader}>
              <div>
                <h4>学歴・職歴の編集一覧</h4>
                <p>必要な行を追加して、年月・内容・配置を直接編集できます。</p>
              </div>
              <button
                type="button"
                className={styles.compactRowsButton}
                onClick={compactHistoryRows}
              >
                空行を詰める
              </button>
            </div>

            <div className={styles.historyAddToolbar}>
              <button
                type="button"
                className={styles.historyAddButton}
                onClick={() => addHistoryListItem('education')}
              >
                ＋ 学歴行
              </button>
              <button
                type="button"
                className={styles.historyAddButton}
                onClick={() => addHistoryListItem('work')}
              >
                ＋ 職歴行
              </button>
              <button
                type="button"
                className={styles.historyAddButton}
                onClick={() => addHistoryListItem('heading')}
              >
                ＋ 見出し
              </button>
              <button
                type="button"
                className={styles.historyAddButton}
                onClick={() => addHistoryListItem('closing')}
              >
                ＋ 以上
              </button>
            </div>

            {historyListMessage && (
              <p className={styles.historyListMessage} role="status">
                {historyListMessage}
              </p>
            )}

            <DndContext
              sensors={historySensors}
              collisionDetection={closestCenter}
              onDragStart={({ active }) => setActiveHistoryId(active.id)}
              onDragCancel={() => setActiveHistoryId(null)}
              onDragEnd={handleHistoryDragEnd}
            >
              <div className={styles.gridTableScroll}>
                <table className={styles.editGridTable}>
                  <thead>
                    <tr>
                      <th className={styles.dragHandleColumn}>
                        <span className={styles.visuallyHidden}>並び替え</span>
                      </th>
                      <th className={styles.rowNumberColumn}>行</th>
                      <th className={styles.dateColumn}>年月</th>
                      <th>内容</th>
                      <th className={styles.alignColumn}>配置</th>
                      <th className={styles.rowActionsColumn}>削除</th>
                    </tr>
                  </thead>
                  <SortableContext
                    items={visibleGridItems.map(({ item }) => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <tbody>
                      {visibleGridItems.map((entry, idx) => (
                        <SortableHistoryRow
                          entry={entry}
                          index={idx}
                          headingRow={isHistoryHeading(entry.item)}
                          placeholder={getHistoryPlaceholder(visibleGridItems, idx)}
                          onUpdate={updateGridItem}
                          onClear={clearGridItem}
                          key={entry.item.id}
                        />
                      ))}
                    </tbody>
                  </SortableContext>
                </table>
              </div>
              <DragOverlay>
                {activeHistoryEntry ? (
                  <div className={styles.historyDragOverlay}>
                    <span className={styles.dragOverlayHandle}>≡</span>
                    <span>{activeHistoryEntry.item.content || '空行'}</span>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        )}

        {/* ================= TAB 3: 免許・資格 ================= */}
        {sections.licenses && visibleTab === 'license' && (
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

        {/* ================= TAB 4: 志望理由・自己PR・本人希望欄 ================= */}
        {showIntroTab && visibleTab === 'intro' && (
          <div className={styles.tabSection}>
            <h3 className={styles.sectionTitle}>志望理由・自己PR・本人希望欄</h3>

            {sections.motivation && (
              <label className={styles.label}>
              志望理由
              <textarea
                className={styles.textarea}
                rows="8"
                maxLength={MOTIVATION_MAX_LENGTH}
                placeholder="応募先を志望した理由や、入社後に取り組みたいことを記入してください。"
                value={data.motivation || ''}
                onChange={(e) => updateField('motivation', e.target.value)}
              />
              <span
                className={`${styles.characterCount} ${
                  (data.motivation || '').length >= MOTIVATION_MAX_LENGTH * 0.9
                    ? styles.characterCountWarning
                    : ''
                }`}
              >
                {(data.motivation || '').length} / {MOTIVATION_MAX_LENGTH}文字
                （残り {MOTIVATION_MAX_LENGTH - (data.motivation || '').length}文字）
              </span>
              </label>
            )}

            {sections.selfPR && (
              <label className={styles.label}>
              自己PR
              <textarea
                className={styles.textarea}
                rows="8"
                maxLength={SELF_PR_MAX_LENGTH}
                placeholder="ご自身の強みやこれまでの経験、長所などをアピールしてください。"
                value={data.selfPR || ''}
                onChange={(e) => updateField('selfPR', e.target.value)}
              />
              <span
                className={`${styles.characterCount} ${
                  (data.selfPR || '').length >= SELF_PR_MAX_LENGTH * 0.9
                    ? styles.characterCountWarning
                    : ''
                }`}
              >
                {(data.selfPR || '').length} / {SELF_PR_MAX_LENGTH}文字
                （残り {SELF_PR_MAX_LENGTH - (data.selfPR || '').length}文字）
              </span>
              </label>
            )}

            {sections.personalRequest && (
              <label className={styles.label}>
              本人希望記入欄
              <textarea
                className={styles.textarea}
                rows="8"
                maxLength={PERSONAL_REQUEST_MAX_LENGTH}
                placeholder="特に給与、職種、勤務時間、勤務地、その他についての希望などがあれば記入してください。"
                value={data.personalRequest || ''}
                onChange={(e) => updateField('personalRequest', e.target.value)}
              />
              <span
                className={`${styles.characterCount} ${
                  (data.personalRequest || '').length >= PERSONAL_REQUEST_MAX_LENGTH * 0.9
                    ? styles.characterCountWarning
                    : ''
                }`}
              >
                {(data.personalRequest || '').length} / {PERSONAL_REQUEST_MAX_LENGTH}文字
                （残り {PERSONAL_REQUEST_MAX_LENGTH - (data.personalRequest || '').length}文字）
              </span>
              </label>
            )}
          </div>
        )}

        {/* Global Save Button at bottom of form */}
        <div className={styles.formFooterActions}>
          <button type="submit" className={styles.btnSave}>
            <svg
              className={styles.saveIcon}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M4 3h13l3 3v15H4V3Zm2 2v14h12V7l-2-2H6Z" />
              <path d="M8 5h7v5H8V5Zm1.5 1.5v2h4v-2h-4ZM8 13h8v4H8v-4Z" />
            </svg>
            一時保存する
          </button>
        </div>
      </form>
    </div>
  )
}
