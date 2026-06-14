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
    image: '',
    screenshots: [createPortfolioScreenshot()]
  }
}
