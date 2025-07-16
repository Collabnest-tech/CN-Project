import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import ModuleCard from '../../components/ModuleCard';

export default function CourseDetail({ course, modules }) {
  const router = useRouter();
  if (router.isFallback) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{course.title}</h1>
      <div className="grid grid-cols-1 gap-4">
        {modules.map(module => (
          <ModuleCard key={module.id} module={module} />
        ))}
      </div>
    </div>
  );
}

export async function getStaticPaths() {
  const { data: courses } = await supabase.from('courses').select('id');
  const paths = courses.map(c => ({ params: { id: c.id.toString() } }));
  return { paths, fallback: true };
}

export async function getStaticProps({ params }) {
  const { data: course } = await supabase.from('courses').select('*').eq('id', params.id).single();
  const { data: modules } = await supabase.from('modules').select('*').eq('course_id', params.id);
  return { props: { course, modules }, revalidate: 10 };
}