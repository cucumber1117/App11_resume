export const TECHNOLOGY_GROUPS = [
  {
    label: '言語',
    items: [
      'HTML',
      'CSS',
      'JavaScript',
      'TypeScript',
      'Python',
      'Java',
      'C',
      'C++',
      'C#',
      'PHP',
      'Ruby',
      'Go',
      'Kotlin',
      'Swift'
    ]
  },
  {
    label: 'フレームワーク',
    items: [
      'React',
      'Next.js',
      'Vue.js',
      'Node.js',
      'Express',
      'Django',
      'Flask',
      'Laravel',
      'Ruby on Rails',
      'Spring Boot',
      'Unity',
      'DirectX',
      'Flutter',
      'React Native',
      'Jetpack Compose'
    ]
  },
  {
    label: 'プラットフォーム',
    items: ['Android', 'iOS', 'Web']
  },
  {
    label: 'データベース',
    items: ['MySQL', 'PostgreSQL', 'SQLite', 'MongoDB']
  },
  {
    label: 'クラウド・サービス',
    items: [
      'AWS',
      'Firebase',
      'Supabase',
      'Vercel',
      'Netlify',
      'Expo',
      'Git',
      'GitHub',
      'Docker',
      'WordPress'
    ]
  },
  {
    label: 'デザイン',
    items: ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator']
  },
  {
    label: '3D・CAD',
    items: [
      'Maya',
      'Blender',
      'AutoCAD',
      'Fusion 360',
      'SolidWorks',
      'SketchUp',
      'Rhinoceros',
      '3ds Max'
    ]
  }
]

export function parseTechnologies(value = '') {
  return value
    .split(/[,、\n]/)
    .map((technology) => technology.trim())
    .filter(Boolean)
}

export function groupTechnologies(technologies = [], categoryAssignments = {}) {
  const assigned = new Set()
  const groups = TECHNOLOGY_GROUPS.map((group) => {
    const items = technologies.filter((technology) => (
      categoryAssignments[technology] === group.label ||
      (
        !categoryAssignments[technology] &&
        group.items.some(
          (item) => item.toLowerCase() === technology.toLowerCase()
        )
      )
    ))
    items.forEach((item) => assigned.add(item))
    return { label: group.label, items }
  }).filter((group) => group.items.length > 0)
  const otherItems = technologies.filter((technology) => (
    !assigned.has(technology) ||
    categoryAssignments[technology] === 'その他'
  ))

  return otherItems.length > 0
    ? [...groups, { label: 'その他', items: otherItems }]
    : groups
}

export function createPortfolioScreenshot() {
  return {
    id: crypto.randomUUID?.() || `screenshot-${Date.now()}-${Math.random()}`,
    image: '',
    caption: ''
  }
}

export function createPortfolioProject() {
  return {
    id: crypto.randomUUID?.() || `project-${Date.now()}-${Math.random()}`,
    title: '',
    role: '',
    description: '',
    technologies: '',
    url: '',
    showUrl: false,
    image: '',
    screenshots: [createPortfolioScreenshot()]
  }
}
