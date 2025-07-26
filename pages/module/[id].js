import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { moduleData } from '../../lib/moduleData'
import Link from 'next/link'

export default function ModulePage() {
  const router = useRouter()
  const { id } = router.query
  const [module, setModule] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [iframeError, setIframeError] = useState(false)

  useEffect(() => {
    if (id) {
      const moduleId = parseInt(id)
      const foundModule = moduleData.find(m => m.id === moduleId)
      setModule(foundModule)
    }
  }, [id])

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
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

        {/* Interactive HTML Module Content */}
        <div className="bg-[#181e29] rounded-xl overflow-hidden mb-8">
          <div className="p-4 bg-[#232a39] flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Module Content</h3>
            <button
              onClick={toggleFullscreen}
              className="text-blue-400 hover:text-blue-300 transition-colors px-3 py-1 rounded-md hover:bg-blue-600 hover:bg-opacity-20"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? '🗗 Exit Fullscreen' : '⛶ Fullscreen'}
            </button>
          </div>
          
          <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'relative'}`}>
            {isFullscreen && (
              <button
                onClick={toggleFullscreen}
                className="absolute top-4 right-4 z-10 text-white text-2xl hover:text-gray-300 bg-black bg-opacity-70 rounded-full w-12 h-12 flex items-center justify-center transition-all"
              >
                ✕
              </button>
            )}
            
            {!iframeError ? (
              <iframe
                src={`/modules/mod${module.id}.html`}
                className={`w-full border-0 ${isFullscreen ? 'h-full' : 'h-96 lg:h-[600px]'}`}
                title={`Module ${module.id} Interactive Content`}
                sandbox="allow-scripts allow-same-origin allow-modals allow-forms allow-popups"
                allow="autoplay; fullscreen; microphone; camera"
                onError={() => setIframeError(true)}
              />
            ) : (
              <div className="flex items-center justify-center h-96 bg-gray-800">
                <div className="text-center text-white">
                  <div className="text-4xl mb-4">📹</div>
                  <h3 className="text-xl font-bold mb-2">Module Content Loading</h3>
                  <p className="text-gray-300">HTML presentation will appear here</p>
                  <p className="text-sm text-gray-400 mt-2">File: /modules/mod{module.id}.html</p>
                </div>
              </div>
            )}
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