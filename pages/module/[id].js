import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { moduleData } from '../../lib/moduleData'
import Link from 'next/link'

export default function ModulePage() {
  const router = useRouter()
  const { id } = router.query
  const [module, setModule] = useState(null)
  const [isVideoFullscreen, setIsVideoFullscreen] = useState(false)
  const [isHtmlFullscreen, setIsHtmlFullscreen] = useState(false)

  useEffect(() => {
    if (id) {
      const moduleId = parseInt(id)
      const foundModule = moduleData.find(m => m.id === moduleId)
      setModule(foundModule)
    }
  }, [id])

  const toggleVideoFullscreen = () => {
    setIsVideoFullscreen(!isVideoFullscreen)
  }

  const toggleHtmlFullscreen = () => {
    setIsHtmlFullscreen(!isHtmlFullscreen)
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] flex items-center justify-center">
        <div className="text-white text-xl">Loading module...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] text-white px-4 py-10">
      <div className="max-w-7xl mx-auto">
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

        {/* Video and HTML Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Video Player Section */}
          <div className="bg-[#181e29] rounded-xl overflow-hidden">
            <div className="p-4 bg-[#232a39] flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Module Video</h3>
              <button
                onClick={toggleVideoFullscreen}
                className="text-blue-400 hover:text-blue-300 transition-colors"
                title="Toggle Fullscreen"
              >
                {isVideoFullscreen ? '🗗' : '⛶'}
              </button>
            </div>
            <div className={`${isVideoFullscreen ? 'fixed inset-0 z-50 bg-black' : 'relative'}`}>
              {isVideoFullscreen && (
                <button
                  onClick={toggleVideoFullscreen}
                  className="absolute top-4 right-4 z-10 text-white text-2xl hover:text-gray-300"
                >
                  ✕
                </button>
              )}
              <video
                controls
                className={`w-full ${isVideoFullscreen ? 'h-full' : 'h-64 lg:h-80'} object-cover`}
                src={module.videoPath}
                poster={module.thumbnail}
              >
                <source src={module.videoPath} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

          {/* Interactive HTML Presentation */}
          <div className="bg-[#181e29] rounded-xl overflow-hidden">
            <div className="p-4 bg-[#232a39] flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Interactive Slides</h3>
              <button
                onClick={toggleHtmlFullscreen}
                className="text-blue-400 hover:text-blue-300 transition-colors"
                title="Toggle Fullscreen"
              >
                {isHtmlFullscreen ? '🗗' : '⛶'}
              </button>
            </div>
            <div className={`${isHtmlFullscreen ? 'fixed inset-0 z-50 bg-black' : 'relative'}`}>
              {isHtmlFullscreen && (
                <button
                  onClick={toggleHtmlFullscreen}
                  className="absolute top-4 right-4 z-10 text-white text-2xl hover:text-gray-300 bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
              <iframe
                src={module.htmlPath}
                className={`w-full border-0 ${isHtmlFullscreen ? 'h-full' : 'h-64 lg:h-80'}`}
                title={`Module ${module.id} Interactive Presentation`}
                sandbox="allow-scripts allow-same-origin"
                allow="autoplay; fullscreen"
              />
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