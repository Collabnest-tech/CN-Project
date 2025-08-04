import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { moduleData } from '../../lib/moduleData'
import Link from 'next/link'
import Quiz from '../../components/Quiz'
import { useUrdu } from '../../components/UrduTranslate'

export default function ModulePage() {
  const { t } = useUrdu()
  const router = useRouter()
  const { id } = router.query
  const [module, setModule] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [videoEnded, setVideoEnded] = useState(false)
  const [isPortrait, setIsPortrait] = useState(false)

  useEffect(() => {
    if (id) {
      const moduleId = parseInt(id)
      const foundModule = moduleData.find(m => m.id === moduleId)
      setModule(foundModule)
    }

    // Check orientation
    const checkOrientation = () => {
      if (window.innerHeight > window.innerWidth) {
        setIsPortrait(true)
      } else {
        setIsPortrait(false)
      }
    }

    checkOrientation()
    window.addEventListener('resize', checkOrientation)
    window.addEventListener('orientationchange', checkOrientation)

    return () => {
      window.removeEventListener('resize', checkOrientation)
      window.removeEventListener('orientationchange', checkOrientation)
    }
  }, [id])

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    
    if (!isFullscreen) {
      // Entering fullscreen
      const video = document.querySelector('video')
      if (video) {
        if (video.requestFullscreen) {
          video.requestFullscreen()
        } else if (video.webkitRequestFullscreen) {
          video.webkitRequestFullscreen()
        } else if (video.mozRequestFullScreen) {
          video.mozRequestFullScreen()
        }
      }
    } else {
      // Exiting fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen()
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen()
      }
    }
  }

  const handleVideoEnded = () => {
    setVideoEnded(true)
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] flex items-center justify-center">
        <div className="text-white text-xl">{t("Loading module...")}</div>
      </div>
    )
  }

  if (showQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] text-white px-4 py-6">
        <div className="max-w-sm mx-auto">
          <button
            onClick={() => setShowQuiz(false)}
            className="text-blue-400 hover:text-blue-300 mb-4 flex items-center text-sm"
          >
            ← {t("Back to Module")}
          </button>
          <Quiz 
            moduleId={module.id} 
            onComplete={(score, total) => {
              console.log(`Quiz completed: ${score}/${total}`)
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] text-white px-4 py-6">
      <div className="max-w-sm mx-auto">
        {/* Back Button */}
        <Link href="/courses">
          <a className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4 text-sm">
            ← {t("Back to Courses")}
          </a>
        </Link>

        {/* Module Header */}
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-xl p-6 mb-6">
          <div className="text-center">
            <div className="text-3xl mb-2">📚</div>
            <h1 className="text-xl font-bold text-white mb-2">{t("Module")} {module.id}: {t(module.title)}</h1>
            <p className="text-blue-200 text-sm mb-3">{t(module.description)}</p>
            <div className="flex justify-center gap-4 text-xs text-blue-200">
              <span>⏱️ {t(module.duration)}</span>
              <span>💰 {t(module.earnings)}</span>
            </div>
          </div>
        </div>

        {/* Video Player */}
        <div className="bg-[#181e29] rounded-xl overflow-hidden mb-6">
          <div className="p-3 bg-[#232a39] flex justify-between items-center">
            <h3 className="text-base font-semibold text-white">{t("Module Video")}</h3>
            <button
              onClick={toggleFullscreen}
              className="text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 rounded-md text-sm"
              title={t("Toggle Fullscreen")}
            >
              {isFullscreen ? '🗗' : '⛶'}
            </button>
          </div>
          
          {/* Video Container with Rotation Warning */}
          <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
            {/* Rotation Warning Overlay for Mobile Portrait Mode in Fullscreen */}
            {isFullscreen && isPortrait && (
              <div className="absolute inset-0 z-10 bg-black bg-opacity-90 flex items-center justify-center">
                <div className="text-center text-white p-8">
                  <div className="text-6xl mb-4">📱↻</div>
                  <h2 className="text-2xl font-bold mb-4">{t("Rotate Your Device")}</h2>
                  <p className="text-lg mb-4">{t("Please rotate your phone to landscape mode for the best viewing experience.")}</p>
                  <div className="text-4xl animate-pulse">↻</div>
                </div>
              </div>
            )}
            
            {isFullscreen && (
              <button
                onClick={toggleFullscreen}
                className="absolute top-4 right-4 z-20 text-white text-2xl hover:text-gray-300 bg-black bg-opacity-70 rounded-full w-10 h-10 flex items-center justify-center transition-all"
              >
                ✕
              </button>
            )}
            
            <video
              controls
              className={`w-full ${isFullscreen ? 'h-full object-contain' : 'aspect-video'}`}
              onEnded={handleVideoEnded}
              preload="metadata"
              style={{
                display: isFullscreen && isPortrait ? 'none' : 'block'
              }}
            >
              <source src={`/modules/Mod${module.id}.mp4`} type="video/mp4" />
              {t("Your browser does not support the video tag.")}
            </video>
          </div>
        </div>

        {/* Quiz Button */}
        <div className="text-center mb-6">
          <button
            onClick={() => setShowQuiz(true)}
            className={`w-full px-6 py-3 rounded-lg font-bold text-base transition-all ${
              videoEnded 
                ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white'
                : 'bg-gray-600 text-gray-300'
            }`}
            disabled={!videoEnded}
          >
            {videoEnded ? `🎯 ${t("Take Module Quiz")}` : `📹 ${t("Complete Video to Unlock Quiz")}`}
          </button>
        </div>

        {/* Tools Section */}
        <div className="bg-[#181e29] rounded-xl p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-3">{t("Tools Covered")}</h2>
          <div className="flex flex-wrap gap-2">
            {module.tools.map((tool, idx) => (
              <span key={idx} className="px-2 py-1 bg-blue-600 bg-opacity-50 text-blue-100 rounded-full text-xs">
                {t(tool)}
              </span>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          {module.id > 1 && (
            <Link href={`/module/${module.id - 1}`}>
              <a className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-3 rounded-lg font-semibold transition-all text-center text-sm">
                ← {t("Previous")}
              </a>
            </Link>
          )}
          
          {module.id < 8 && (
            <Link href={`/module/${module.id + 1}`}>
              <a className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-lg font-semibold transition-all text-center text-sm">
                {t("Next")} →
              </a>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}