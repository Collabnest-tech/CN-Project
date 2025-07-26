import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import ModuleViewer from '../../components/ModuleViewer'
import { moduleData } from '../../lib/moduleData'
import Link from 'next/link'

export default function ModulePage() {
  const router = useRouter()
  const { id } = router.query
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (id) {
      checkAccess()
    }
  }, [id])

  async function checkAccess() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        // For development, allow access without login
        // Comment out this line for production
        // router.push('/login')
        // return
        setHasAccess(true)
        setLoading(false)
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
        // For development, allow access
        setHasAccess(true)
        // router.push('/courses?message=payment-required')
        // return
      }
    } catch (error) {
      console.error('Error checking access:', error)
      // For development, allow access even on error
      setHasAccess(true)
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

  const currentModule = moduleData.find(m => m.id === parseInt(id))

  if (!currentModule) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl mb-4">Module {id} not found</h1>
          <Link href="/courses" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
            Back to Courses
          </Link>
        </div>
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
              ← Back to Courses
            </Link>
            
            <div className="text-center">
              <h1 className="text-xl font-bold">Module {id} of 8</h1>
              <p className="text-sm text-gray-400">{currentModule.title}</p>
            </div>

            <div className="w-24"></div> {/* Spacer for alignment */}
          </div>
        </div>
      </div>

      {/* Main Module Content */}
      <div className="container mx-auto px-4 py-8">
        <ModuleViewer moduleId={id} />
      </div>
    </div>
  )
}