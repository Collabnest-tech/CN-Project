import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Quiz({ moduleId, onComplete }) {
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(true)
  const [score, setScore] = useState(0)
  const [session, setSession] = useState(null)

  useEffect(() => {
    fetchQuestions()
    checkSession()
  }, [moduleId])

  async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession()
    setSession(session)
  }

  async function fetchQuestions() {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('module_id', moduleId)
        .order('id')

      if (error) throw error
      setQuestions(data || [])
    } catch (error) {
      console.error('Error fetching questions:', error)
    }
    setLoading(false)
  }

  const handleAnswerSelect = (questionId, answer) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      calculateResults()
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const calculateResults = async () => {
    let correctCount = 0
    const results = {}

    questions.forEach(question => {
      const userAnswer = selectedAnswers[question.id]
      const isCorrect = userAnswer === question.correct_answer
      if (isCorrect) correctCount++
      
      results[question.id] = {
        question: question.question,
        userAnswer,
        correctAnswer: question.correct_answer,
        isCorrect,
        explanation: question.explanation
      }
    })

    setScore(correctCount)
    setShowResults(true)

    // Save quiz attempt to database
    if (session?.user?.id) {
      try {
        await supabase
          .from('quiz_attempts')
          .insert({
            user_id: session.user.id,
            module_id: moduleId,
            score: correctCount,
            total_questions: questions.length,
            answers: results
          })
      } catch (error) {
        console.error('Error saving quiz attempt:', error)
      }
    }

    // Call completion callback if provided
    if (onComplete) {
      onComplete(correctCount, questions.length)
    }
  }

  const restartQuiz = () => {
    setCurrentQuestion(0)
    setSelectedAnswers({})
    setShowResults(false)
    setScore(0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white text-xl">Loading quiz...</div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="bg-[#181e29] rounded-xl p-8 text-center">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-bold text-white mb-2">Quiz Coming Soon</h3>
        <p className="text-gray-300">Quiz questions for Module {moduleId} will be available soon.</p>
      </div>
    )
  }

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100)
    const passed = percentage >= 70

    return (
      <div className="bg-[#181e29] rounded-xl p-8">
        <div className="text-center mb-8">
          <div className={`text-6xl mb-4 ${passed ? '🎉' : '📚'}`}>
            {passed ? '🎉' : '📚'}
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Quiz {passed ? 'Completed!' : 'Results'}
          </h2>
          <div className={`text-4xl font-bold mb-4 ${passed ? 'text-green-400' : 'text-yellow-400'}`}>
            {score}/{questions.length} ({percentage}%)
          </div>
          <p className={`text-lg ${passed ? 'text-green-300' : 'text-yellow-300'}`}>
            {passed 
              ? 'Congratulations! You have mastered this module.' 
              : 'Good effort! Review the material and try again to improve your score.'}
          </p>
        </div>

        {/* Detailed Results */}
        <div className="space-y-4 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Review Your Answers:</h3>
          {questions.map((question, index) => {
            const userAnswer = selectedAnswers[question.id]
            const isCorrect = userAnswer === question.correct_answer
            
            return (
              <div key={question.id} className={`p-4 rounded-lg ${isCorrect ? 'bg-green-900 bg-opacity-30' : 'bg-red-900 bg-opacity-30'}`}>
                <div className="flex items-start gap-3 mb-2">
                  <span className={`text-2xl ${isCorrect ? '✅' : '❌'}`}>
                    {isCorrect ? '✅' : '❌'}
                  </span>
                  <div className="flex-1">
                    <p className="text-white font-semibold mb-2">
                      {index + 1}. {question.question}
                    </p>
                    <p className="text-sm text-gray-300 mb-1">
                      Your answer: <span className={isCorrect ? 'text-green-400' : 'text-red-400'}>
                        {userAnswer}) {question[`option_${userAnswer?.toLowerCase()}`]}
                      </span>
                    </p>
                    {!isCorrect && (
                      <p className="text-sm text-green-400 mb-2">
                        Correct answer: {question.correct_answer}) {question[`option_${question.correct_answer.toLowerCase()}`]}
                      </p>
                    )}
                    {question.explanation && (
                      <p className="text-sm text-blue-200 italic">
                        💡 {question.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={restartQuiz}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-bold transition-all"
          >
            🔄 Retake Quiz
          </button>
          {passed && (
            <button
              onClick={() => window.location.href = `/module/${moduleId + 1}`}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-bold transition-all"
              disabled={moduleId >= 8}
            >
              ➡️ Next Module
            </button>
          )}
        </div>
      </div>
    )
  }

  const currentQ = questions[currentQuestion]
  const isAnswered = selectedAnswers[currentQ?.id]

  return (
    <div className="bg-[#181e29] rounded-xl p-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold text-white">Module {moduleId} Quiz</h2>
          <span className="text-blue-300">
            {currentQuestion + 1} of {questions.length}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-white mb-6">
          {currentQuestion + 1}. {currentQ?.question}
        </h3>
        
        <div className="space-y-3">
          {['A', 'B', 'C', 'D'].map(option => (
            <button
              key={option}
              onClick={() => handleAnswerSelect(currentQ.id, option)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selectedAnswers[currentQ?.id] === option
                  ? 'border-blue-500 bg-blue-900 bg-opacity-30 text-white'
                  : 'border-gray-600 bg-gray-800 hover:border-gray-500 text-gray-300 hover:text-white'
              }`}
            >
              <span className="font-bold mr-3">{option})</span>
              {currentQ?.[`option_${option.toLowerCase()}`]}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-bold transition-all"
        >
          ← Previous
        </button>
        
        <button
          onClick={handleNext}
          disabled={!isAnswered}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-bold transition-all"
        >
          {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next →'}
        </button>
      </div>
    </div>
  )
}