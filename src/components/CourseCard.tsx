import Link from 'next/link';

export default function CourseCard({ course }) {
  const isPaid = false; // placeholder, fetch from user context
  return (
    <div className={`p-4 border rounded ${!isPaid ? 'opacity-50 cursor-not-allowed' : 'hover:shadow'}`}>
      <h2 className="text-xl font-semibold">{course.title}</h2>
      <Link href={`/courses/${course.id}`}>
        <a className={`mt-2 inline-block text-blue-600 ${!isPaid ? 'pointer-events-none' : ''}`}>
          View Course
        </a>
      </Link>
    </div>
  );
}