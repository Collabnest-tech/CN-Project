import { useState, useEffect } from 'react'

export default function Quiz({ moduleId }) {
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadQuestions()
  }, [moduleId])

  async function loadQuestions() {
    try {
      const response = await fetch(`/api/questions?moduleId=${moduleId}`)
      const data = await response.json()
      setQuestions(data)
      setLoading(false)
    } catch (error) {
      console.error('Error loading questions:', error)
      setLoading(false)
    }
  }

  function handleAnswerSelect(questionIndex, answer) {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }))
  }

  function handleSubmit() {
    let correctCount = 0
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct_answer) {
        correctCount++
      }
    })
    setScore(correctCount)
    setShowResults(true)
    
    // Save progress to database
    saveQuizResults(correctCount, questions.length)
  }

  async function saveQuizResults(correct, total) {
    try {
      await fetch('/api/save-quiz-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId,
          score: correct,
          totalQuestions: total,
          passed: correct >= Math.ceil(total * 0.7) // 70% pass rate
        })
      })
    } catch (error) {
      console.error('Error saving quiz results:', error)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-white text-xl">Loading quiz...</div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-white text-xl">No quiz available for this module</div>
      </div>
    )
  }

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100)
    const passed = percentage >= 70
    
    return (
      <div className="text-center py-8">
        <div className={`text-6xl mb-4 ${passed ? 'text-green-400' : 'text-red-400'}`}>
          {passed ? '🎉' : '😞'}
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">
          Quiz {passed ? 'Completed!' : 'Failed'}
        </h2>
        <div className="text-xl text-blue-200 mb-6">
          You scored {score} out of {questions.length} ({percentage}%)
        </div>
        {passed ? (
          <div className="bg-green-900 bg-opacity-30 p-6 rounded-lg max-w-md mx-auto">
            <p className="text-green-300 mb-4">
              Congratulations! You've successfully completed this module.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Retake Quiz
            </button>
          </div>
        ) : (
          <div className="bg-red-900 bg-opacity-30 p-6 rounded-lg max-w-md mx-auto">
            <p className="text-red-300 mb-4">
              You need at least 70% to pass. Review the module and try again.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">
            Module {moduleId} Quiz
          </h2>
          <div className="text-blue-300">
            {Object.keys(selectedAnswers).length} / {questions.length} answered
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(Object.keys(selectedAnswers).length / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-8">
        {questions.map((question, idx) => (
          <div key={idx} className="bg-blue-900 bg-opacity-30 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">
              {idx + 1}. {question.question_text}
            </h3>
            
            <div className="space-y-3">
              {['A', 'B', 'C', 'D'].map(option => (
                <button
                  key={option}
                  onClick={() => handleAnswerSelect(idx, option)}
                  className={`w-full text-left p-4 rounded-lg transition-all ${
                    selectedAnswers[idx] === option
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-blue-200 hover:bg-gray-600'
                  }`}
                >
                  <span className="font-semibold mr-3">{option}.</span>
                  {question[`option_${option.toLowerCase()}`]}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="text-center mt-8">
        <button
          onClick={handleSubmit}
          disabled={Object.keys(selectedAnswers).length < questions.length}
          className={`px-8 py-4 rounded-lg font-bold text-lg transition-all ${
            Object.keys(selectedAnswers).length < questions.length
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white transform hover:scale-105'
          }`}
        >
          Submit Quiz
        </button>
      </div>
    </div>
  )
}