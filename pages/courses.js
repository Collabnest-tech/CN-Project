import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'
import Link from 'next/link'
import DropdownNavbar from '../components/DropdownNavbar'
import { useTranslations } from '../lib/translations'
import Image from 'next/image'
import { moduleData } from '../lib/moduleData'

export default function Courses() {
  const [session, setSession] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { t } = useTranslations()
  const router = useRouter()

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
      // Check if user exists and fetch data
      const { data, error } = await supabase
        .from('users')
        .select('id, email, has_paid')
        .eq('id', session.user.id)
        .single()
      
      if (!error && data) {
        setUserData(data)
      } else {
        // Handle error or user not found
        console.error('User not found or error fetching user data:', error)
        setUserData(null)
      }
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!userData?.has_paid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] text-white">
        <DropdownNavbar session={session} />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">{t.courses.accessDenied}</h1>
            <p className="text-gray-300 mb-6">{t.courses.needPurchase}</p>
            <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
              {t.courses.getAccess}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] text-white">
      <DropdownNavbar session={session} />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{t.courses.title}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Module cards with translations */}
          {moduleData.map(module => (
            <div key={module.id} className="bg-[#1a2233] rounded-xl p-6 relative">
              <div className="absolute top-4 right-4">
                <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                  {t.courses.complete}
                </span>
              </div>
              
              <h3 className="text-xl font-bold mb-2">{module.title}</h3>
              <p className="text-gray-300 mb-4">{module.description}</p>
              
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors">
                {t.courses.continue}
              </button>
              
              <div className="mt-3 text-center text-sm text-gray-400">
                0 {t.courses.of} 5 {t.courses.lessons}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


