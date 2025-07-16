import { useState, useEffect } from 'react';

export default function Quiz({ moduleId }) {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch(`/api/questions?moduleId=${moduleId}`)
      .then(res => res.json())
      .then(data => setQuestions(data));
  }, [moduleId]);

  const handleAnswer = async (option) => {
    const question = questions[current];
    await fetch('/api/answer-question', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ questionId: question.id, selected: option })
    });
    setCurrent(prev => prev + 1);
  };

  if (!questions.length) return <div>Loading quiz...</div>;
  if (current >= questions.length) return <div>Quiz complete!</div>;

  const q = questions[current];
  return (
    <div className="p-4 border rounded">
      <p>{q.question_text}</p>
      {['A','B','C','D'].map(opt => (
        <button key={opt} onClick={() => handleAnswer(opt)} className="block mt-2 btn">
          {q[`option_${opt.toLowerCase()}`]}
        </button>
      ))}
    </div>
  );
}