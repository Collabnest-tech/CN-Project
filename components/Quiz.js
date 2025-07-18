// components/Quiz.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Quiz({ moduleId }) {
  const [questions, setQuestions] = useState([])
  const [current, setCurrent]     = useState(0)
  const [answers, setAnswers]     = useState({})
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  useEffect(() => {
    if (!moduleId) return
    setLoading(true)
    supabase
      .from('questions')
      .select('id,question_text,option_a,option_b,option_c,option_d,correct_option')
      .eq('module_id', moduleId)
      .order('id', { ascending: true })
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else      setQuestions(data)
        setLoading(false)
      })
  }, [moduleId])

  if (loading) return <p>Loading quiz…</p>
  if (error)   return <p className="text-red-500">Error: {error}</p>
  if (!questions.length) return <p>No quiz available.</p>

  const q = questions[current]
  const handleSelect = (opt) => {
    setAnswers({ ...answers, [q.id]: opt })
  }
  const handleNext = () => {
    if (current < questions.length - 1) setCurrent(current + 1)
    else {
      // all done: log completion
      supabase
        .from('quiz_completions')
        .insert([{ user_id: supabase.auth.user().id, module_id: moduleId }])
      alert('Quiz complete!')
    }
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <p className="font-semibold mb-2">{q.question_text}</p>
      {['option_a','option_b','option_c','option_d'].map((optKey) => (
        <button
          key={optKey}
          onClick={() => handleSelect(optKey)}
          className={`block w-full text-left px-3 py-2 mb-2 rounded border ${
            answers[q.id] === optKey
              ? 'bg-purple-200 border-purple-400'
              : 'border-gray-300'
          }`}
        >
          {q[optKey]}
        </button>
      ))}
      <button
        onClick={handleNext}
        className="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
      >
        {current < questions.length - 1 ? 'Next' : 'Finish'}
      </button>
    </div>
  )
}
