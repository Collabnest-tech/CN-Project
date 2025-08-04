import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { moduleData } from '../lib/moduleData'
import Image from 'next/image'
import Link from 'next/link'
import { useUrdu } from '../components/UrduTranslate'

export default function Courses() {
  const { t } = useUrdu()
  const [session, setSession] = useState(null)
  const [userPaid, setUserPaid] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      
      if (session) {
        await checkPaymentStatus(session.user.id)
      }
    } catch (error) {
      console.error('Error checking session:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkPaymentStatus = async (userId) => {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('has_paid')
        .eq('id', userId)
        .single()

      if (!error && user?.has_paid) {
        setUserPaid(true)
      }
    } catch (error) {
      console.error('Error checking payment status:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] flex items-center justify-center">
        <div className="text-white text-xl">{t("Loading...")}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] text-white px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 lg:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            {t("AI for Making Money Online")}
          </h1>
          <p className="text-blue-200 text-lg lg:text-xl max-w-3xl mx-auto">
            {t("Master 8 modules to build your AI income streams")}
          </p>
        </div>

        {/* Course Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {moduleData.map((module) => (
            <div
              key={module.id}
              className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-xl overflow-hidden shadow-xl"
            >
              {/* Module Header */}
              <div className="relative">
                <div className="relative w-full h-48">
                  <Image
                    src={module.thumbnail}
                    alt={t(module.title)}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 items-center justify-center text-4xl hidden">
                    {module.id === 1 ? '🤖' : module.id === 2 ? '✍️' : module.id === 3 ? '🎬' : module.id === 4 ? '📹' : module.id === 5 ? '📺' : module.id === 6 ? '🛍️' : module.id === 7 ? '📱' : '🚀'}
                  </div>
                </div>
                
                {/* Module Number & Status */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="bg-white text-purple-700 px-3 py-1 rounded-full text-sm font-bold">
                    {t("Module")} {module.id}
                  </span>
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    {t("Available")}
                  </span>
                </div>

                {/* Play Button Overlay */}
                {userPaid && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={() => router.push(`/module/${module.id}`)}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-4 transition-all backdrop-blur-sm"
                    >
                      <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Module Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">
                  {t(module.title)}
                </h3>
                
                <p className="text-blue-200 text-sm mb-4 line-clamp-3">
                  {t(module.description)}
                </p>

                {/* Module Stats */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">{t("Duration")}:</span>
                    <span className="text-white font-semibold">{t(module.duration)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">{t("Estimated Earnings")}:</span>
                    <span className="text-green-400 font-semibold">{t(module.earnings)}</span>
                  </div>
                </div>

                {/* Tools */}
                <div className="mb-4">
                  <p className="text-gray-300 text-xs mb-2">{t("Tools Covered")}:</p>
                  <div className="flex flex-wrap gap-1">
                    {module.tools.map((tool, index) => (
                      <span
                        key={index}
                        className="bg-blue-800 text-blue-200 px-2 py-1 rounded text-xs"
                      >
                        {t(tool)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                {userPaid ? (
                  <button
                    onClick={() => router.push(`/module/${module.id}`)}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 rounded-lg font-bold transition-all"
                  >
                    {t("Start Learning")} →
                  </button>
                ) : (
                  <div className="text-center">
                    <div className="bg-gray-800 rounded-lg p-3 mb-3">
                      <p className="text-gray-300 text-sm font-medium">{t("Access Restricted")}</p>
                      <p className="text-gray-400 text-xs">{t("Purchase the course to unlock all modules")}</p>
                    </div>
                    <button
                      onClick={() => router.push('/checkout')}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-lg font-bold transition-all"
                    >
                      {t("Purchase Course")} - $25
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link href="/">
            <a className="text-blue-400 hover:text-blue-300 font-semibold">
              ← {t("Back to Home")}
            </a>
          </Link>
        </div>
      </div>
    </div>
  )
}


