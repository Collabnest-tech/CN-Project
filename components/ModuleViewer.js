import { useState, useEffect, useRef } from 'react'
import Quiz from './Quiz'

export default function ModuleViewer({ moduleId }) {
  const [moduleContent, setModuleContent] = useState(null)
  const [currentSegment, setCurrentSegment] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [videoEnded, setVideoEnded] = useState(false)
  const videoRef = useRef(null)

  useEffect(() => {
    loadModuleContent()
  }, [moduleId])

  async function loadModuleContent() {
    try {
      // For now, we'll create a simple structure since the HTML files need processing
      // You can enhance this later to actually parse the HTML files
      setModuleContent({
        videoSrc: `/edited and compressed vids/Mod${moduleId}.mp4`,
        transcript: [] // Will be populated when HTML parsing is implemented
      })
    } catch (error) {
      console.error('Error loading module content:', error)
    }
  }

  function handleTimeUpdate() {
    if (!videoRef.current || !moduleContent) return
    
    const currentTime = videoRef.current.currentTime
    // Add logic for synchronized content when transcript is available
  }

  function handleVideoEnd() {
    setVideoEnded(true)
    setShowQuiz(true)
  }

  if (!moduleContent) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-white text-xl">Loading module...</div>
      </div>
    )
  }

  if (showQuiz) {
    return (
      <div className="bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] rounded-xl p-6">
        <Quiz moduleId={moduleId} onComplete={() => setShowQuiz(false)} />
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] rounded-xl overflow-hidden">
      {/* Video Player */}
      <div className="relative">
        <video
          ref={videoRef}
          src={moduleContent.videoSrc}
          controls
          className="w-full h-auto"
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={handleVideoEnd}
        />
        
        {/* Interactive Subtitles */}
        {currentSegment && (
          <div className="absolute bottom-16 left-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg">
            <p className="text-lg">{currentSegment.text}</p>
          </div>
        )}
      </div>

      {/* Module Info */}
      <div className="p-6 bg-[#181e29]">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-4">
            Module {moduleId} Content
          </h3>
          <p className="text-blue-200 mb-4">
            Watch the video above to learn about AI tools and strategies for online earning.
          </p>
          
          {videoEnded && (
            <button
              onClick={() => setShowQuiz(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Take Quiz to Complete Module
            </button>
          )}
        </div>
      </div>
    </div>
  )
}