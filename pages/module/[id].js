import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { moduleData } from '../../lib/moduleData'
import Link from 'next/link'
import Quiz from '../../components/Quiz'

export default function ModulePage() {
  const router = useRouter()
  const { id } = router.query
  const [module, setModule] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [videoEnded, setVideoEnded] = useState(false)

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

  const handleVideoEnded = () => {
    setVideoEnded(true)
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] flex items-center justify-center">
        <div className="text-white text-xl">Loading module...</div>
      </div>
    )
  }

  if (showQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] text-white px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setShowQuiz(false)}
            className="text-blue-400 hover:text-blue-300 mb-6"
          >
            ← Back to Module
          </button>
          <Quiz moduleId={module.id} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] text-white px-4 py-10">
      <div className="max-w-6xl mx-auto">
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

        {/* Video Player */}
        <div className="bg-[#181e29] rounded-xl overflow-hidden mb-8">
          <div className="p-4 bg-[#232a39] flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Module Video</h3>
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
            
            <video
              controls
              className={`w-full ${isFullscreen ? 'h-full object-contain' : 'aspect-video'}`}
              onEnded={handleVideoEnded}
              preload="metadata"
            >
              <source src={`/modules/Mod${module.id}.mp4`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>

        {/* Quiz Button */}
        <div className="text-center mb-8">
          <button
            onClick={() => setShowQuiz(true)}
            className={`px-8 py-4 rounded-lg font-bold text-lg transition-all ${
              videoEnded 
                ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white transform hover:scale-105'
                : 'bg-gray-600 text-gray-300'
            }`}
            disabled={!videoEnded}
          >
            {videoEnded ? '🎯 Take Module Quiz' : '📹 Complete Video to Unlock Quiz'}
          </button>
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