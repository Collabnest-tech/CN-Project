import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { moduleData } from '../lib/moduleData'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'

export default function Courses() {
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [userPaid, setUserPaid] = useState(false)
  const [loading, setLoading] = useState(true)
  // const [currentModule, setCurrentModule] = useState(1)

  useEffect(() => {
    checkUserSession()
  }, [])

  async function checkUserSession() {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      router.push('/login')
      return
    }
    
    setSession(session)
    
    if (session) {
      // Check if user has paid
      const { data, error } = await supabase
        .from('users')
        .select('has_paid')
        .eq('id', session.user.id)
        .single()
      
      if (!error && data) {
        setUserPaid(data.has_paid)
        
        // // If user has paid, get their progress
        // if (data.has_paid) {
        //   await fetchUserProgress(session.user.id)
        // }
      }
    }
    setLoading(false)
  }

  // async function fetchUserProgress(userId) {
  //   try {
  //     const { data, error } = await supabase
  //       .from('user_progress')
  //       .select('module_id')
  //       .eq('user_id', userId)
  //       .single()

  //     if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
  //       throw error
  //     }

  //     // Set current module (default to 1 if no progress found)
  //     setCurrentModule(data?.module_id || 1)
  //   } catch (error) {
  //     console.error('Error fetching progress:', error)
  //     setCurrentModule(1) // Default to first module
  //   }
  // }

  const handleModuleClick = async (module) => {
    if (!userPaid) {
      router.push('/checkout')
      return
    }

    try {
      // // Only allow access to current module or completed modules
      // if (module.id > currentModule) {
      //   alert('Complete the previous modules first!')
      //   return
      // }

      // // Update last accessed time
      // await supabase
      //   .from('user_progress')
      //   .upsert({
      //     user_id: session.user.id,
      //     module_id: currentModule,
      //     last_accessed: new Date().toISOString(),
      //   })

      // Navigate to module content
      router.push(`/module/${module.id}`)
    } catch (error) {
      console.error('Error accessing module:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  // const completedModules = currentModule - 1
  // const progressPercentage = (completedModules / moduleData.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] text-white">
      {/* ✅ Responsive Container */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
        <div className="max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-6 lg:mb-12">
            <Image
              src="/logo.jpeg"
              alt="Collab-Nest Logo"
              width={60}
              height={60}
              className="rounded-full shadow-lg mx-auto mb-4 sm:w-16 sm:h-16 lg:w-20 lg:h-20"
            />
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-2 lg:mb-4">AI for Making Money Online</h1>
            <p className="text-blue-200 text-sm lg:text-xl max-w-3xl mx-auto">Master 8 modules to build your AI income streams</p>
          </div>

          {/* ✅ Real Course Progress - COMMENTED OUT */}
          {/* {userPaid && (
            <div className="bg-[#181e29] rounded-xl p-4 lg:p-6 mb-6 lg:mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-semibold text-sm lg:text-base">Course Progress</span>
                <span className="text-blue-400 text-sm lg:text-base">{completedModules}/{moduleData.length} Modules</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 lg:h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-2 lg:h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <p className="text-gray-400 text-xs lg:text-sm mt-2">
                Currently on: Module {currentModule}
              </p>
            </div>
          )} */}

          {/* Payment Status */}
          {!userPaid && (
            <div className="bg-gradient-to-r from-red-900 to-orange-900 rounded-xl p-4 lg:p-6 mb-6 lg:mb-8 text-center">
              <h3 className="text-lg lg:text-xl font-bold text-white mb-2">🔒 Course Locked</h3>
              <p className="text-orange-200 text-sm lg:text-base mb-3">
                Complete your purchase to unlock all 8 modules and start building your AI income streams.
              </p>
              <Link href="/checkout">
                <a className="inline-block bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 lg:px-8 py-2 lg:py-3 rounded-lg font-bold text-sm lg:text-base transition-all">
                  Unlock Course - $25
                </a>
              </Link>
            </div>
          )}

          {/* ✅ Responsive Modules Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {moduleData.map((module) => {
              // // Progress tracking logic - COMMENTED OUT
              // const isCompleted = userPaid && module.id < currentModule
              // const isCurrent = userPaid && module.id === currentModule
              // const isLocked = !userPaid || module.id > currentModule

              // Simple logic - just check if user paid
              const isLocked = !userPaid

              return (
                <div
                  key={module.id}
                  className={`relative rounded-xl shadow-lg overflow-hidden transition-all duration-300 cursor-pointer hover:scale-105 ${
                    isLocked 
                      ? 'bg-gray-800 opacity-75' 
                      : 'bg-gradient-to-br from-blue-900 to-purple-900'
                  }`}
                  onClick={() => handleModuleClick(module)}
                >
                  {/* Module Header */}
                  <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6">
                    <div className="relative w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 flex-shrink-0">
                      <Image
                        src={module.thumbnail}
                        alt={module.title}
                        fill
                        className="rounded-lg object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                      
                      {/* ✅ Status Indicator - SIMPLIFIED */}
                      <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm">
                        {/* {isCompleted && <span className="bg-green-500 w-full h-full rounded-full flex items-center justify-center">✓</span>}
                        {isCurrent && <span className="bg-blue-500 w-full h-full rounded-full flex items-center justify-center">▶</span>} */}
                        {isLocked && <span className="bg-gray-500 w-full h-full rounded-full flex items-center justify-center">🔒</span>}
                        {!isLocked && <span className="bg-blue-500 w-full h-full rounded-full flex items-center justify-center">▶</span>}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-blue-400 font-bold text-sm lg:text-base">Module {module.id}</span>
                        {isLocked && <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">🔒 Locked</span>}
                        {!isLocked && <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Available</span>}
                      </div>
                      <h3 className="text-white font-bold text-sm lg:text-lg mb-1 line-clamp-2">{module.title}</h3>
                      <p className="text-blue-200 text-xs lg:text-sm mb-2 line-clamp-2">{module.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-300">
                          <span>⏱️ {module.duration}</span>
                        </div>
                        <div className="text-green-400 text-xs lg:text-sm font-semibold">
                          💰 {module.earnings}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tools Preview */}
                  <div className="px-4 sm:px-6 pb-4">
                    <div className="flex flex-wrap gap-1">
                      {module.tools.slice(0, 3).map((tool, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-600 bg-opacity-50 text-blue-100 text-xs rounded">
                          {tool}
                        </span>
                      ))}
                      {module.tools.length > 3 && (
                        <span className="px-2 py-1 bg-gray-600 bg-opacity-50 text-gray-300 text-xs rounded">
                          +{module.tools.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                    <button
                      className={`w-full py-2 lg:py-3 rounded-lg font-bold text-center text-sm lg:text-base transition-all ${
                        isLocked 
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                      }`}
                    >
                      {isLocked ? '🔒 Unlock Course First' : 'Start Learning →'}
                    </button>
                  </div>

                  {/* Lock Overlay */}
                  {isLocked && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <div className="text-4xl">🔒</div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Bottom CTA */}
          {!userPaid && (
            <div className="mt-8 lg:mt-16 text-center bg-gradient-to-r from-green-900 to-blue-900 rounded-xl p-6 lg:p-10">
              <h3 className="text-lg lg:text-2xl font-bold text-white mb-2 lg:mb-4">Ready to Start?</h3>
              <p className="text-green-200 text-sm lg:text-base mb-4 lg:mb-6 max-w-2xl mx-auto">
                Get instant access to all 8 modules and start building your AI income streams today!
              </p>
              <Link href="/checkout">
                <a className="inline-block bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 lg:px-12 py-3 lg:py-4 rounded-xl font-bold text-base lg:text-lg transition-all">
                  Get Started - $15
                </a>
              </Link>
            </div>
          )}

          {/* Progress Summary for Paid Users - SIMPLIFIED */}
          {userPaid && (
            <div className="mt-8 lg:mt-16 text-center bg-gradient-to-r from-green-900/50 to-blue-900/50 rounded-xl p-6 lg:p-10">
              <h3 className="text-lg lg:text-2xl font-bold text-white mb-2 lg:mb-4">Your Learning Journey</h3>
              <p className="text-green-200 text-sm lg:text-base mb-4 lg:mb-6 max-w-2xl mx-auto">
                You have access to all {moduleData.length} modules! Start with any module you'd like.
              </p>
              <Link href="/">
                <a className="inline-block bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 lg:px-12 py-3 lg:py-4 rounded-xl font-bold text-base lg:text-lg transition-all">
                  Back to Home
                </a>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


