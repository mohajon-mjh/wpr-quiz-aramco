import { useState } from 'react'
import './App.css'
import questionsData from './questions.json'

function App() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('All')
  
  const questions = questionsData.questions
  const categories = ['All', ...new Set(questions.map(q => q.category))]
  
  const filteredQuestions = categoryFilter === 'All' 
    ? questions 
    : questions.filter(q => q.category === categoryFilter)

  const handleAnswer = (index) => {
    setSelectedOption(index)
    if (index === filteredQuestions[currentQuestion].correct) {
      setScore(score + 1)
    }
  }

  const nextQuestion = () => {
    if (currentQuestion + 1 < filteredQuestions.length) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedOption(null)
    } else {
      setShowResult(true)
    }
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setScore(0)
    setShowResult(false)
    setSelectedOption(null)
    setCategoryFilter('All')
  }

  if (showResult) {
    const percentage = (score / filteredQuestions.length) * 100
    return (
      <div className="quiz-container">
        <h1>📊 Saudi Aramco Permit Quiz Result</h1>
        <div className="result-box">
          <h2>{score}/{filteredQuestions.length}</h2>
          <p>✅ Score: {percentage}%</p>
          <p>{percentage >= 80 ? "🎉 Congratulations! You are eligible for Saudi Aramco work permit!" : "❌ Please review the safety rules and try again. You need 80% to pass."}</p>
          <button onClick={resetQuiz} className="reset-btn">🔄 Retry Quiz</button>
        </div>
      </div>
    )
  }

  return (
    <div className="quiz-container">
      <h1>🛢️ Saudi Aramco Work Permit Quiz</h1>
      
      <div className="category-filter">
        <select 
          value={categoryFilter} 
          onChange={(e) => {
            setCategoryFilter(e.target.value)
            setCurrentQuestion(0)
            setSelectedOption(null)
            setScore(0)
          }}
          className="category-select"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="question-box">
        <div className="question-header">
          <h3>Question {currentQuestion + 1}/{filteredQuestions.length}</h3>
          <span className="category-tag">{filteredQuestions[currentQuestion].category}</span>
        </div>
        <p className="question">{filteredQuestions[currentQuestion].question}</p>
        <div className="options">
          {filteredQuestions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              className={`option-btn ${selectedOption === index ? 'selected' : ''}`}
              disabled={selectedOption !== null}
            >
              {option}
            </button>
          ))}
        </div>
        {selectedOption !== null && (
          <button onClick={nextQuestion} className="next-btn">
            {currentQuestion + 1 === filteredQuestions.length ? "📊 Show Results" : "➡️ Next Question"}
          </button>
        )}
      </div>
    </div>
  )
}

export default App
