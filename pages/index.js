import { supabase } from '../lib/supabase';
import CourseCard from '../components/CourseCard';

export default function Home({ courses }) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {courses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  const { data: courses } = await supabase.from('courses').select('*');
  return { props: { courses } };
}