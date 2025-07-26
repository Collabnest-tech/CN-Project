export default function ModuleCard({ module }) {
  return (
    <div className="p-3 border rounded hover:shadow">
      <h3 className="text-lg font-medium">{module.title}</h3>
    </div>
  );
}