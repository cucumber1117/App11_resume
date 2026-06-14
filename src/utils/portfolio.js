export function createPortfolioProject() {
  return {
    id: crypto.randomUUID?.() || `project-${Date.now()}-${Math.random()}`,
    title: '',
    role: '',
    description: '',
    technologies: '',
    url: '',
    image: ''
  }
}
