import { useState, useEffect } from 'react'
import './App.css'
import questionsData from './questions.json'
import { abbreviations, permitGuide, safetyItems, colorCoding } from './referenceData'

const allQuestions = questionsData.questions
const categories = ['All', ...new Set(allQuestions.map(q => q.category))]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function App() {
  const [stage, setStage] = useState('start')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [testQuestions, setTestQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  const navigate = (newStage) => {
    window.history.pushState({ stage: newStage }, '')
    setStage(newStage)
  }

  useEffect(() => {
    window.history.replaceState({ stage: 'start' }, '')
    const onPopState = (e) => {
      setStage(e.state?.stage || 'start')
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    if (stage !== 'test') return
    if (timeLeft <= 0) {
      navigate('result')
      return
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(timer)
  }, [stage, timeLeft])

  useEffect(() => {
    if (!revealed) return
    const t = setTimeout(() => {
      goNext()
    }, 5000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed])

  const startTest = () => {
    const pool = categoryFilter === 'All'
      ? allQuestions
      : allQuestions.filter(q => q.category === categoryFilter)
    const shuffled = shuffle(pool)
    setTestQuestions(shuffled)
    setCurrentIndex(0)
    setAnswers({})
    setRevealed(false)
    setTimeLeft(shuffled.length * 45)
    navigate('test')
  }

  const selectOption = (idx) => {
    if (revealed) return
    setAnswers(prev => ({ ...prev, [currentIndex]: idx }))
    setRevealed(true)
  }

  const goNext = () => {
    setRevealed(false)
    if (currentIndex + 1 < testQuestions.length) {
      setCurrentIndex(currentIndex + 1)
    } else {
      navigate('result')
    }
  }

  const goPrev = () => {
    if (currentIndex > 0) {
      setRevealed(false)
      setCurrentIndex(currentIndex - 1)
    }
  }

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  if (stage === 'start') {
    return (
      <div className="app-container">
        <div className="test-card start-card">
          <div className="logo">🛢️</div>
          <h1>Saudi Aramco Work Permit Quiz</h1>
          <p className="subtitle">Computer-Based Test (CBT) Practice</p>

          <label className="field-label">Select Category</label>
          <select
            className="category-select"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            {categories.map(cat => {
              const count = cat === 'All'
                ? allQuestions.length
                : allQuestions.filter(q => q.category === cat).length
              return (
                <option key={cat} value={cat}>
                  {cat} ({count})
                </option>
              )
            })}
          </select>

          <button className="btn-primary" onClick={startTest}>Start Test</button>
          <button className="btn-secondary ref-btn" onClick={() => navigate('reference')}>
            📖 Reference Guide
          </button>
        </div>
      </div>
    )
  }

  if (stage === 'reference') {
    return (
      <div className="app-container">
        <div className="test-card reference-card">
          <h1 className="ref-title">📖 Work Permit Reference Guide</h1>

          <h2 className="ref-section-title">Common Abbreviations</h2>
          <div className="ref-grid">
            {abbreviations.map((a, i) => (
              <div key={i} className="ref-abbr-item">
                <span className="ref-abbr-term">{a.term}</span>
                <span className="ref-abbr-meaning">{a.meaning}</span>
              </div>
            ))}
          </div>

          <h2 className="ref-section-title">Which Permit for Which Job?</h2>
          <div className="ref-table">
            {permitGuide.map((p, i) => (
              <div key={i} className="ref-table-row">
                <span className="ref-job">{p.job}</span>
                <span className="ref-permit">{p.permit}</span>
              </div>
            ))}
          </div>

          <h2 className="ref-section-title">Permit Color Coding (Common Example)</h2>
          <p className="ref-note">
            Note: Permit colors vary by company/site. Always follow your site's official color code — this is a general reference example.
          </p>
          <div className="ref-color-list">
            {colorCoding.map((c, i) => (
              <div key={i} className="ref-color-row">
                <span className="ref-color-swatch" style={{ background: c.hex }}></span>
                <div className="ref-color-info">
                  <span className="ref-color-name">{c.color}</span>
                  <span className="ref-color-permits">{c.permits.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>

          <h2 className="ref-section-title">Common Safety Items / PPE Checklist</h2>
          <p className="ref-note">Tap any item to see an icon and description.</p>
          <div className="ref-item-grid">
            {safetyItems.map((item, i) => (
              <button key={i} className="ref-item-btn" onClick={() => setSelectedItem(item)}>
                <span className="ref-item-icon">{item.icon}</span>
                <span className="ref-item-name">{item.name}</span>
              </button>
            ))}
          </div>

          <button className="btn-primary" onClick={() => navigate('start')}>Back to Home</button>
        </div>

        {selectedItem && (
          <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <div className="modal-icon">{selectedItem.icon}</div>
              <h3 className="modal-name">{selectedItem.name}</h3>
              <p className="modal-desc">{selectedItem.desc}</p>
              <button className="btn-primary" onClick={() => setSelectedItem(null)}>Close</button>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (stage === 'test') {
    const q = testQuestions[currentIndex]
    const selected = answers[currentIndex]
    const answeredCount = Object.keys(answers).length

    return (
      <div className="app-container">
        <div className="test-header">
          <div className="test-header-top">
            <span className="test-title">Saudi Aramco Work Permit Quiz</span>
            <span className="timer">⏱ {formatTime(timeLeft)}</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${((currentIndex + 1) / testQuestions.length) * 100}%` }}
            />
          </div>
          <div className="progress-text">
            Question {currentIndex + 1} of {testQuestions.length} &middot; Answered {answeredCount}/{testQuestions.length}
          </div>
        </div>

        <div className="test-card">
          <span className="category-badge">{q.category}</span>
          <h2 className="question-text">{q.question}</h2>
          <div className="options-list">
            {q.options.map((opt, idx) => {
              let cls = 'option-item'
              if (revealed) {
                if (idx === q.correct) cls += ' correct'
                else if (idx === selected) cls += ' wrong'
                else cls += ' dimmed'
              } else if (selected === idx) {
                cls += ' selected'
              }
              return (
                <button
                  key={idx}
                  className={cls}
                  onClick={() => selectOption(idx)}
                  disabled={revealed}
                >
                  <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                  <span className="option-text">{opt}</span>
                  {revealed && idx === q.correct && <span className="option-icon correct-icon">✓</span>}
                  {revealed && idx === selected && idx !== q.correct && <span className="option-icon wrong-icon">✗</span>}
                </button>
              )
            })}
          </div>

          {revealed && (
            <div className={`feedback-banner ${selected === q.correct ? 'feedback-correct' : 'feedback-wrong'}`}>
              {selected === q.correct ? '✓ Correct!' : '✗ Incorrect'} &nbsp; Moving to next question...
            </div>
          )}

          <div className="nav-buttons">
            <button className="btn-secondary" onClick={goPrev} disabled={currentIndex === 0}>
              Previous
            </button>
            {currentIndex + 1 < testQuestions.length ? (
              <button className="btn-primary" onClick={goNext}>
                {revealed ? 'Next Now' : 'Skip'}
              </button>
            ) : (
              <button className="btn-primary btn-submit" onClick={() => navigate('result')}>
                Submit Test
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const score = testQuestions.reduce(
    (acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0), 0
  )
  const percent = testQuestions.length ? Math.round((score / testQuestions.length) * 100) : 0
  const passed = percent >= 70

  return (
    <div className="app-container">
      <div className="test-card result-card">
        <div className={`result-badge ${passed ? 'pass' : 'fail'}`}>
          {passed ? '✅ PASS' : '❌ FAIL'}
        </div>
        <h1>Test Result</h1>
        <div className="score-circle">
          <span className="score-number">{percent}%</span>
        </div>
        <p className="score-detail">{score} out of {testQuestions.length} correct</p>

        <div className="review-list">
          {testQuestions.map((q, i) => {
            const userAns = answers[i]
            const isCorrect = userAns === q.correct
            return (
              <div key={i} className={`review-item ${isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="review-question">{i + 1}. {q.question}</div>
                <div className="review-answer">
                  Your answer: {userAns !== undefined ? q.options[userAns] : '(not answered)'}
                </div>
                {!isCorrect && (
                  <div className="review-correct">Correct answer: {q.options[q.correct]}</div>
                )}
              </div>
            )
          })}
        </div>

        <button className="btn-primary" onClick={() => navigate('start')}>Take Another Test</button>
      </div>
    </div>
  )
}

export default App
