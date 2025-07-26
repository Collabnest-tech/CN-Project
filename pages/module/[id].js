import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { moduleData } from '../../lib/moduleData'
import Link from 'next/link'

export default function ModulePage() {
  const router = useRouter()
  const { id } = router.query
  const [module, setModule] = useState(null)

  useEffect(() => {
    if (id) {
      const moduleId = parseInt(id)
      const foundModule = moduleData.find(m => m.id === moduleId)
      setModule(foundModule)
    }
  }, [id])

  if (!module) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] flex items-center justify-center">
        <div className="text-white text-xl">Loading module...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] text-white px-4 py-10">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link href="/courses">
          <a className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6">
            ← Back to Courses
          </a>
        </Link>

        {/* Module Header */}
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-xl p-8 mb-8">
          <div className="flex items-center mb-4">
            <div className="text-4xl mr-4">📚</div>
            <div>
              <h1 className="text-3xl font-bold text-white">Module {module.id}: {module.title}</h1>
              <p className="text-blue-200 mt-2">{module.description}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm text-blue-200">
            <span>⏱️ {module.duration}</span>
            <span>💰 {module.earnings}</span>
          </div>
        </div>

        {/* Video Placeholder */}
        <div className="bg-[#181e29] rounded-xl p-8 mb-8">
          <div className="aspect-video bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
            <div className="text-center text-white">
              <div className="text-6xl mb-4">🎬</div>
              <h3 className="text-xl font-bold">Video Content Coming Soon</h3>
              <p className="text-blue-200">Module {module.id} video will be available here</p>
            </div>
          </div>
        </div>

        {/* Module Content */}
        <div className="bg-[#181e29] rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">What You'll Learn</h2>
          <div className="space-y-3">
            <div className="flex items-start">
              <span className="text-green-400 mr-3">✓</span>
              <span className="text-blue-200">How to use {module.tools.join(', ')} effectively</span>
            </div>
            <div className="flex items-start">
              <span className="text-green-400 mr-3">✓</span>
              <span className="text-blue-200">Step-by-step implementation guide</span>
            </div>
            <div className="flex items-start">
              <span className="text-green-400 mr-3">✓</span>
              <span className="text-blue-200">Real-world examples and case studies</span>
            </div>
            <div className="flex items-start">
              <span className="text-green-400 mr-3">✓</span>
              <span className="text-blue-200">Income generation strategies</span>
            </div>
          </div>
        </div>

        {/* Tools Section */}
        <div className="bg-[#181e29] rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Tools Covered</h2>
          <div className="flex flex-wrap gap-2">
            {module.tools.map((tool, idx) => (
              <span key={idx} className="px-3 py-1 bg-blue-600 bg-opacity-50 text-blue-100 rounded-full">
                {tool}
              </span>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          {module.id > 1 && (
            <Link href={`/module/${module.id - 1}`}>
              <a className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-lg font-semibold transition-all">
                ← Previous Module
              </a>
            </Link>
          )}
          
          {module.id < 8 && (
            <Link href={`/module/${module.id + 1}`}>
              <a className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all ml-auto">
                Next Module →
              </a>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}