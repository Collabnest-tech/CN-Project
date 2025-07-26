import { moduleData } from '../lib/moduleData'
import Link from 'next/link'

export default function ModuleCard({ moduleId, isLocked }) {
  const module = moduleData.find(m => m.id === moduleId)
  
  if (!module) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg">
        <p className="text-white">Module not found</p>
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-br from-[#181e29] to-[#232a39] p-6 rounded-xl border ${isLocked ? 'border-gray-600 opacity-60' : 'border-blue-500/30'}`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-white">{module.title}</h3>
        <span className="text-sm text-blue-400">{module.duration}</span>
      </div>
      
      <p className="text-gray-300 mb-4">{module.description}</p>
      
      <div className="space-y-2 mb-4">
        {module.keyPoints.map((point, idx) => (
          <div key={idx} className="flex items-start text-sm text-blue-200">
            <span className="mr-2">•</span>
            <span>{point}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-green-400 font-semibold">{module.earnings}</span>
        
        {isLocked ? (
          <button className="bg-gray-600 text-gray-400 px-4 py-2 rounded-lg cursor-not-allowed">
            🔒 Locked
          </button>
        ) : (
          <Link href={`/module/${module.id}`}>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              Start Module
            </button>
          </Link>
        )}
      </div>
    </div>
  )
}