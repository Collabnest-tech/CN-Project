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
    <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] text-white px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            {t("AI for Making Money Online")}
          </h1>
          <p className="text-blue-200 text-xl max-w-3xl mx-auto">
            {t("Master 8 modules to build your AI income streams")}
          </p>
        </div>

        {/* Course Modules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {moduleData.map((module) => (
            <div
              key={module.id}
              className="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 rounded-xl overflow-hidden shadow-2xl border border-blue-800/30 hover:shadow-blue-500/10 transition-all duration-300"
            >
              {/* Module Image/Thumbnail */}
              <div className="relative h-48 bg-gradient-to-br from-blue-600 to-purple-600">
                <Image
                  src={module.thumbnail}
                  alt={t(module.title)}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
                
                {/* Module Number & Status Badge */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  <span className="bg-white text-purple-700 px-3 py-1 rounded-full text-sm font-bold">
                    {t("Module")} {module.id}
                  </span>
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    {t("Available")}
                  </span>
                </div>

                {/* Play Button for Paid Users */}
                {userPaid && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                    <button
                      onClick={() => router.push(`/module/${module.id}`)}
                      className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-4 transition-all shadow-lg"
                    >
                      <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Module Content */}
              <div className="p-6 space-y-4">
                {/* Title */}
                <h3 className="text-lg font-bold text-white line-clamp-2 min-h-[3.5rem]">
                  {t(module.title)}
                </h3>
                
                {/* Description */}
                <p className="text-blue-200 text-sm line-clamp-3 min-h-[4rem]">
                  {t(module.description)}
                </p>

                {/* Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">{t("Duration")}:</span>
                    <span className="text-white font-semibold text-sm">{t(module.duration)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">{t("Estimated Earnings")}:</span>
                    <span className="text-green-400 font-semibold text-sm">{t(module.earnings)}</span>
                  </div>
                </div>

                {/* Tools */}
                <div>
                  <p className="text-gray-300 text-xs mb-2">{t("Tools Covered")}:</p>
                  <div className="flex flex-wrap gap-1">
                    {module.tools.slice(0, 3).map((tool, index) => (
                      <span
                        key={index}
                        className="bg-blue-800/50 text-blue-200 px-2 py-1 rounded text-xs"
                      >
                        {tool}
                      </span>
                    ))}
                    {module.tools.length > 3 && (
                      <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                        +{module.tools.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  {userPaid ? (
                    <button
                      onClick={() => router.push(`/module/${module.id}`)}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 rounded-lg font-bold transition-all duration-200"
                    >
                      {t("Start Learning")} →
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                        <p className="text-gray-300 text-sm font-medium">{t("Access Restricted")}</p>
                        <p className="text-gray-400 text-xs">{t("Purchase the course to unlock all modules")}</p>
                      </div>
                      <button
                        onClick={() => router.push('/checkout')}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-lg font-bold transition-all duration-200"
                      >
                        {t("Purchase Course")} - $25
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link href="/">
            <a className="text-blue-400 hover:text-blue-300 font-semibold text-lg">
              ← {t("Back to Home")}
            </a>
          </Link>
        </div>
      </div>
    </div>
  )
}


