import { useState, useEffect, useRef } from 'react'
import Quiz from './Quiz'
import { moduleData } from '../lib/moduleData'

export default function ModuleViewer({ moduleId }) {
  const [moduleContent, setModuleContent] = useState(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [videoEnded, setVideoEnded] = useState(false)
  const [htmlContent, setHtmlContent] = useState('')
  const videoRef = useRef(null)
  const htmlContainerRef = useRef(null)

  const module = moduleData.find(m => m.id === parseInt(moduleId))

  useEffect(() => {
    loadModuleContent()
  }, [moduleId])

  async function loadModuleContent() {
    try {
      // Load the HTML presentation file
      const response = await fetch(`/edited and compressed vids/mod${moduleId}.html`)
      const htmlText = await response.text()
      
      setHtmlContent(htmlText)
      setModuleContent({
        videoSrc: `/edited and compressed vids/Mod${moduleId}.mp4`,
        htmlSrc: `/edited and compressed vids/mod${moduleId}.html`
      })
    } catch (error) {
      console.error('Error loading module content:', error)
      // Fallback if files don't exist yet
      setModuleContent({
        videoSrc: `/edited and compressed vids/Mod${moduleId}.mp4`,
        htmlSrc: null
      })
    }
  }

  function handleTimeUpdate() {
    if (!videoRef.current) return
    
    const time = videoRef.current.currentTime
    setCurrentTime(time)
    
    // Sync HTML presentation with video time
    if (htmlContainerRef.current) {
      // Post message to HTML iframe to sync timing
      const iframe = htmlContainerRef.current.querySelector('iframe')
      if (iframe) {
        iframe.contentWindow?.postMessage({
          type: 'VIDEO_TIME_UPDATE',
          currentTime: time,
          isPlaying: isPlaying
        }, '*')
      }
    }
  }

  function handleVideoEnd() {
    setVideoEnded(true)
    setShowQuiz(true)
  }

  function handlePlay() {
    setIsPlaying(true)
    // Sync play state with HTML
    const iframe = htmlContainerRef.current?.querySelector('iframe')
    if (iframe) {
      iframe.contentWindow?.postMessage({
        type: 'VIDEO_PLAY',
        currentTime: currentTime
      }, '*')
    }
  }

  function handlePause() {
    setIsPlaying(false)
    // Sync pause state with HTML
    const iframe = htmlContainerRef.current?.querySelector('iframe')
    if (iframe) {
      iframe.contentWindow?.postMessage({
        type: 'VIDEO_PAUSE',
        currentTime: currentTime
      }, '*')
    }
  }

  if (!moduleContent) {
    return (
      <div className="flex items-center justify-center h-96 bg-[#181e29] rounded-xl">
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
      {/* Module Header */}
      <div className="p-6 bg-[#181e29] border-b border-gray-600">
        <h2 className="text-2xl font-bold text-white mb-2">{module?.title}</h2>
        <p className="text-gray-300">{module?.description}</p>
        <div className="flex items-center gap-4 mt-3 text-sm text-blue-300">
          <span>Duration: {module?.duration}</span>
          <span>Earning Potential: {module?.earnings}</span>
        </div>
      </div>

      {/* Main Content - Video and Presentation Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {/* Video Player */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">AI Avatar Presentation</h3>
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              src={moduleContent.videoSrc}
              controls
              className="w-full h-auto"
              style={{ aspectRatio: '9/16' }} // 1080x1920 aspect ratio
              onTimeUpdate={handleTimeUpdate}
              onPlay={handlePlay}
              onPause={handlePause}
              onEnded={handleVideoEnd}
            />
          </div>
        </div>

        {/* HTML Presentation */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Interactive Slides</h3>
          <div 
            ref={htmlContainerRef}
            className="bg-white rounded-lg overflow-hidden h-96 lg:h-[600px]"
          >
            {moduleContent.htmlSrc ? (
              <iframe
                src={moduleContent.htmlSrc}
                className="w-full h-full border-0"
                title={`Module ${moduleId} Presentation`}
                sandbox="allow-scripts allow-same-origin"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-100 text-gray-600">
                <div className="text-center">
                  <p>Presentation loading...</p>
                  <p className="text-sm mt-2">HTML slides will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Module Tools & Key Points */}
      <div className="p-6 bg-[#181e29] border-t border-gray-600">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tools Used */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Tools Covered</h4>
            <div className="flex flex-wrap gap-2">
              {module?.tools?.map((tool, idx) => (
                <span 
                  key={idx}
                  className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Key Learning Points */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">What You'll Learn</h4>
            <ul className="space-y-2">
              {module?.keyPoints?.map((point, idx) => (
                <li key={idx} className="flex items-start text-blue-200">
                  <span className="mr-2 text-green-400">✓</span>
                  <span className="text-sm">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Progress and Quiz Section */}
      <div className="p-6 bg-[#232a39]">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <p className="text-sm text-gray-300">Progress</p>
            <div className="w-64 bg-gray-600 rounded-full h-2 mt-1">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: videoRef.current?.duration ? 
                    `${(currentTime / videoRef.current.duration) * 100}%` : '0%' 
                }}
              ></div>
            </div>
          </div>
          
          {videoEnded && (
            <button
              onClick={() => setShowQuiz(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
            >
              Complete Module Quiz →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}