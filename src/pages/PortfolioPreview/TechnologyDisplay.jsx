import {
  groupTechnologies,
  parseTechnologies
} from '../../utils/portfolio'
import styles from './TechnologyDisplay.module.css'

export default function TechnologyDisplay({
  technologies,
  categoryAssignments = {},
  emptyLabel = '',
  compact = false,
  grouped = true
}) {
  const items = Array.isArray(technologies)
    ? technologies
    : parseTechnologies(technologies)
  const groups = groupTechnologies(items, categoryAssignments)
  const displayGroups = groups.length > 0
    ? groups
    : emptyLabel
      ? [{ label: '技術', items: [emptyLabel] }]
      : []

  if (displayGroups.length === 0) return null

  if (!grouped) {
    const flatItems = displayGroups.flatMap((group) => group.items)

    return (
      <div className={`${styles.list} ${compact ? styles.compactList : ''}`}>
        {flatItems.map((technology, index) => (
          <span key={`${technology}-${index}`}>{technology}</span>
        ))}
      </div>
    )
  }

  return (
    <div className={`${styles.groups} ${compact ? styles.compact : ''}`}>
      {displayGroups.map((group) => (
        <div className={styles.group} key={group.label}>
          <strong>{group.label}</strong>
          <div className={styles.list}>
            {group.items.map((technology, index) => (
              <span key={`${technology}-${index}`}>{technology}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
