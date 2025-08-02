import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import ModuleViewer from '../components/ModuleViewer'
import { moduleData } from '../lib/moduleData'
import Link from 'next/link'

export default function ModulePage() {
  const router = useRouter()
  const { id } = router.query
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    checkAccess()
  }, [id])

  async function checkAccess() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      setUser(session.user)

      // Check if user has paid for the course
      const { data: userData } = await supabase
        .from('users')
        .select('has_paid')
        .eq('id', session.user.id)
        .single()

      if (userData?.has_paid) {
        setHasAccess(true)
      } else {
        router.push('/courses?message=payment-required')
        return
      }
    } catch (error) {
      console.error('Error checking access:', error)
      router.push('/courses')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] flex items-center justify-center">
        <div className="text-white text-xl">Loading module...</div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Access denied</div>
          <Link href="/courses" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
            Purchase Course
          </Link>
        </div>
      </div>
    )
  }

  const currentModule = moduleData.find(m => m.id === parseInt(id))
  const currentIndex = moduleData.findIndex(m => m.id === parseInt(id))
  const prevModule = currentIndex > 0 ? moduleData[currentIndex - 1] : null
  const nextModule = currentIndex < moduleData.length - 1 ? moduleData[currentIndex + 1] : null

  if (!currentModule) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] flex items-center justify-center">
        <div className="text-white text-xl">Module not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] text-white">
      {/* Navigation Header */}
      <div className="border-b border-gray-600 bg-[#181e29]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/courses" className="text-blue-400 hover:text-blue-300 flex items-center">
              ← Back to Course Overview
            </Link>
            
            <div className="text-center">
              <h1 className="text-xl font-bold">Module {id} of 8</h1>
              <p className="text-sm text-gray-400">AI for Making Money Online</p>
            </div>

            <div className="flex items-center gap-2">
              {prevModule && (
                <Link 
                  href={`/module/${prevModule.id}`}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                >
                  ← Prev
                </Link>
              )}
              {nextModule && (
                <Link 
                  href={`/module/${nextModule.id}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                >
                  Next →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Module Content */}
      <div className="container mx-auto px-4 py-8">
        <ModuleViewer moduleId={id} />
      </div>

      {/* Module Navigation Footer */}
      <div className="border-t border-gray-600 bg-[#181e29] mt-8">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Previous Module */}
            <div>
              {prevModule && (
                <Link href={`/module/${prevModule.id}`} className="block p-4 bg-[#232a39] rounded-lg hover:bg-[#2a3441] transition-colors">
                  <p className="text-sm text-gray-400 mb-1">Previous Module</p>
                  <p className="font-semibold text-white">{prevModule.title}</p>
                </Link>
              )}
            </div>

            {/* Course Overview */}
            <div className="text-center">
              <Link href="/courses" className="block p-4 bg-[#232a39] rounded-lg hover:bg-[#2a3441] transition-colors">
                <p className="text-sm text-gray-400 mb-1">Course Overview</p>
                <p className="font-semibold text-white">View All Modules</p>
              </Link>
            </div>

            {/* Next Module */}
            <div>
              {nextModule && (
                <Link href={`/module/${nextModule.id}`} className="block p-4 bg-[#232a39] rounded-lg hover:bg-[#2a3441] transition-colors">
                  <p className="text-sm text-gray-400 mb-1">Next Module</p>
                  <p className="font-semibold text-white">{nextModule.title}</p>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}