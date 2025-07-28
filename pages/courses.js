import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { moduleData } from '../lib/moduleData'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Courses() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)
  const [currentCourse, setCurrentCourse] = useState(1) // Start from course 1

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }
      
      setSession(session)
      await fetchUserProgress(session.user.id)
    } catch (error) {
      console.error('Error checking session:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserProgress = async (userId) => {
    try {
      // Get user's current course number from user_progress table
      const { data, error } = await supabase
        .from('user_progress')
        .select('module_id')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error
      }

      // Set current course (default to 1 if no progress found)
      setCurrentCourse(data?.module_id || 1)

    } catch (error) {
      console.error('Error fetching progress:', error)
      setCurrentCourse(1) // Default to first course
    }
  }

  const handleModuleClick = async (module) => {
    try {
      // Only allow access to current course or completed courses
      if (module.id > currentCourse) {
        alert('Complete the previous modules first!')
        return
      }

      // Navigate to module content
      router.push(`/module/${module.id}`)
    } catch (error) {
      console.error('Error accessing module:', error)
    }
  }

  const markCourseComplete = async (moduleId) => {
    try {
      // Update user progress to next course
      const nextCourse = moduleId + 1
      
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: session.user.id,
          module_id: nextCourse,
          last_accessed: new Date().toISOString(),
          progress_percentage: 100
        })

      if (error) throw error

      setCurrentCourse(nextCourse)
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] flex items-center justify-center">
        <div className="text-white text-xl">Loading your courses...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] text-white">
      <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
        <div className="max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8 lg:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 text-white">
              AI Marketing Mastery Course
            </h1>
            <p className="text-lg lg:text-xl text-blue-200 max-w-3xl mx-auto">
              Transform your income potential with cutting-edge AI marketing strategies
            </p>
            <div className="mt-4 p-3 bg-blue-900/50 rounded-lg inline-block">
              <p className="text-blue-200">
                📍 Currently on: <span className="font-bold text-white">Module {currentCourse}</span>
              </p>
            </div>
          </div>

          {/* ✅ Responsive grid using moduleData */}
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {moduleData.map((module) => {
              const isCompleted = module.id < currentCourse
              const isCurrent = module.id === currentCourse
              const isLocked = module.id > currentCourse

              return (
                <div
                  key={module.id}
                  className={`bg-gradient-to-br rounded-xl border transition-all duration-300 overflow-hidden ${
                    isLocked 
                      ? 'from-gray-900/50 to-gray-800/50 border-gray-500/20 opacity-60' 
                      : isCompleted
                      ? 'from-green-900/50 to-blue-900/50 border-green-500/40'
                      : 'from-blue-900/50 to-purple-900/50 border-blue-500/20 hover:border-blue-400/40'
                  }`}
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-4 mb-4">
                      <div className="relative w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20">
                        <Image
                          src={module.thumbnail || `/module${module.id}.jpg`}
                          alt={module.title}
                          fill
                          className="rounded-lg object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                          }}
                        />
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 items-center justify-center text-xl sm:text-2xl hidden">
                          {module.id === 1 ? '🤖' : module.id === 2 ? '✍️' : module.id === 3 ? '🎬' : '🛍️'}
                        </div>
                        
                        {/* Status overlay */}
                        <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm">
                          {isCompleted && <span className="bg-green-500 w-full h-full rounded-full flex items-center justify-center">✓</span>}
                          {isCurrent && <span className="bg-blue-500 w-full h-full rounded-full flex items-center justify-center">▶</span>}
                          {isLocked && <span className="bg-gray-500 w-full h-full rounded-full flex items-center justify-center">🔒</span>}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2">
                          {module.title}
                        </h3>
                        <p className="text-green-400 text-sm sm:text-base font-semibold">
                          {module.earnings || 'Potential Income Stream'}
                        </p>
                      </div>
                    </div>

                    <p className="text-blue-200 text-sm sm:text-base mb-4 sm:mb-6 line-clamp-3">
                      {module.description}
                    </p>

                    {/* ✅ Simple Status Display */}
                    <div className="mb-4 sm:mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm sm:text-base text-gray-300">Status</span>
                        <span className={`text-sm sm:text-base font-semibold ${
                          isCompleted ? 'text-green-400' : isCurrent ? 'text-blue-400' : 'text-gray-400'
                        }`}>
                          {isCompleted ? 'Completed' : isCurrent ? 'Current' : 'Locked'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 sm:h-3">
                        <div
                          className={`h-2 sm:h-3 rounded-full transition-all duration-500 ease-out ${
                            isCompleted ? 'bg-gradient-to-r from-green-500 to-blue-500' : 
                            isCurrent ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-600'
                          }`}
                          style={{ width: isCompleted ? '100%' : isCurrent ? '50%' : '0%' }}
                        ></div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleModuleClick(module)}
                      disabled={isLocked}
                      className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 ${
                        isLocked 
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : isCompleted
                          ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white transform hover:scale-105'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transform hover:scale-105'
                      }`}
                    >
                      {isLocked ? 'Locked' : isCompleted ? 'Review Module' : isCurrent ? 'Start Learning' : 'Continue'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Progress Summary */}
          <div className="text-center mt-8 sm:mt-12 lg:mt-16">
            <div className="bg-gradient-to-r from-green-900/50 to-blue-900/50 backdrop-blur-sm rounded-xl border border-green-500/20 p-6 sm:p-8 lg:p-10">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4">
                Your Learning Journey
              </h2>
              <p className="text-blue-200 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto">
                You've completed {currentCourse - 1} out of {moduleData.length} modules. 
                {currentCourse <= moduleData.length ? ` Next up: ${moduleData[currentCourse - 1]?.title}` : ' 🎉 All modules completed!'}
              </p>
              <Link href="/">
                <a className="inline-block bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 sm:px-8 lg:px-12 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base lg:text-lg transition-all">
                  Back to Home
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


