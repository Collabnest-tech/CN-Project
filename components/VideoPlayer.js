import { useState, useEffect, useRef } from 'react'

export default function ModuleViewer({ moduleId }) {
  const [moduleContent, setModuleContent] = useState(null)
  const [currentSegment, setCurrentSegment] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef(null)

  useEffect(() => {
    loadModuleContent()
  }, [moduleId])

  async function loadModuleContent() {
    try {
      // Load the HTML content
      const response = await fetch(`/edited and compressed vids/mod${moduleId}.html`)
      const htmlContent = await response.text()
      
      // Extract transcript data from the HTML
      const transcriptMatch = htmlContent.match(/const transcript = (\[[\s\S]*?\]);/)
      if (transcriptMatch) {
        const transcriptData = eval(transcriptMatch[1])
        setModuleContent({
          htmlContent,
          transcript: transcriptData,
          videoSrc: `/edited and compressed vids/Mod${moduleId}.mp4`
        })
      }
    } catch (error) {
      console.error('Error loading module content:', error)
    }
  }

  function handleTimeUpdate() {
    if (!videoRef.current || !moduleContent) return
    
    const currentTime = videoRef.current.currentTime
    const segment = moduleContent.transcript.find(item => 
      currentTime >= item.startTime && currentTime <= item.endTime
    )
    
    if (segment && segment !== currentSegment) {
      setCurrentSegment(segment)
    }
  }

  if (!moduleContent) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-white text-xl">Loading module...</div>
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
        />
        
        {/* Interactive Subtitles */}
        {currentSegment && (
          <div className="absolute bottom-16 left-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg">
            <p className="text-lg">{currentSegment.text}</p>
          </div>
        )}
      </div>

      {/* Interactive Slides */}
      {currentSegment?.slideContent && (
        <div className="p-6 bg-[#181e29]">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              {currentSegment.slideContent.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <ul className="space-y-2">
                  {currentSegment.slideContent.points?.map((point, idx) => (
                    <li key={idx} className="text-blue-200 flex items-start">
                      <span className="mr-2">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {currentSegment.slideContent.freeAlternative && (
                <div className="bg-green-900 bg-opacity-30 p-4 rounded-lg">
                  <h4 className="text-green-400 font-semibold mb-2">💡 Free Alternative:</h4>
                  <p className="text-green-200">{currentSegment.slideContent.freeAlternative}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}