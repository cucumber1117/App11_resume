export default function ResumePreview({ data }) {
  const d = data || {}

  return (
    <div id="resume-preview" className="resume-preview">
      <div className="resume-sheet">
        <header className="r-header">
          <h1 className="r-name">{d.name || '氏名'} </h1>
          <div className="r-meta">
            <div className="r-title">{d.title}</div>
            <div className="r-contact">{d.contact}</div>
          </div>
        </header>

        <section className="r-section">
          <h3>プロフィール</h3>
          <p>{d.summary}</p>
        </section>

        <section className="r-section">
          <h3>職務経歴</h3>
          {(d.experiences || []).map((ex, i) => (
            <div key={i} className="r-exp">
              <div className="r-exp-head">
                <strong>{ex.title}</strong>
                <span className="r-company">{ex.company}</span>
                <span className="r-dates">{ex.dates}</span>
              </div>
              <p>{ex.description}</p>
            </div>
          ))}
        </section>

        <section className="r-section">
          <h3>学歴</h3>
          <p>{d.education}</p>
        </section>
      </div>
    </div>
  )
}
