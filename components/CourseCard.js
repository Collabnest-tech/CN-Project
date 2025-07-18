// components/CourseCard.jsx
import Link from 'next/link'

export default function CourseCard({ course, hasPaid }) {
  const locked = !hasPaid
  const cardClasses = locked
    ? 'opacity-50 cursor-not-allowed'
    : 'hover:shadow-lg cursor-pointer'

  const handleClick = () => {
    if (!locked) window.location.href = `/courses/${course.id}`
    else alert('Please purchase to unlock this course')
  }

  return (
    <div
      onClick={handleClick}
      className={`relative bg-white rounded shadow p-4 ${cardClasses}`}
    >
      <h3 className="text-lg font-bold mb-2">{course.title}</h3>
      <p className="text-gray-600 mb-4">{course.description}</p>
      <div className="absolute top-4 right-4">
        {locked && (
          <span className="text-sm text-red-500">Locked</span>
        )}
      </div>
    </div>
  )
}
