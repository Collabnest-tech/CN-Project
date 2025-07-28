import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { moduleData } from '../lib/moduleData'
import Link from 'next/link'
import Image from 'next/image'

export default function Courses() {
  const [session, setSession] = useState(null)
  const [userPaid, setUserPaid] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUserSession()
  }, [])

  async function checkUserSession() {
    const { data: { session } } = await supabase.auth.getSession()
    setSession(session)
    
    if (session) {
      const { data, error } = await supabase
        .from('users')
        .select('has_paid')
        .eq('id', session.user.id)
        .single()
      
      if (!error && data) {
        setUserPaid(data.has_paid)
      }
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#10151c] via-[#1a2230] to-[#232a39] text-white px-4 py-6">
      <div className="max-w-sm mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <Image
            src="/logo.jpeg"
            alt="Collab-Nest Logo"
            width={60}
            height={60}
            className="rounded-full shadow-lg mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold mb-2">AI for Making Money Online</h1>
          <p className="text-blue-200 text-sm">Master 8 modules to build your AI income streams</p>
        </div>

        {/* Course Progress */}
        <div className="bg-[#181e29] rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white font-semibold text-sm">Course Progress</span>
            <span className="text-blue-400 text-sm">0/8 Modules</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
          </div>
        </div>

        {/* Payment Status */}
        {!userPaid && (
          <div className="bg-gradient-to-r from-red-900 to-orange-900 rounded-xl p-4 mb-6 text-center">
            <h3 className="text-lg font-bold text-white mb-2">🔒 Course Locked</h3>
            <p className="text-orange-200 text-sm mb-3">
              Complete your purchase to unlock all 8 modules and start building your AI income streams.
            </p>
            <Link href="/checkout">
              <a className="inline-block bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-bold text-sm transition-all">
                Unlock Course - $15
              </a>
            </Link>
          </div>
        )}

        {/* Modules Grid */}
        <div className="space-y-4">
          {moduleData.map((module) => (
            <div
              key={module.id}
              className={`relative rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${
                !userPaid ? 'bg-gray-800 opacity-75' : 'bg-gradient-to-br from-blue-900 to-purple-900'
              }`}
            >
              {/* Module Header */}
              <div className="flex items-center gap-4 p-4">
                <div className="relative w-16 h-16 flex-shrink-0">
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
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 items-center justify-center text-2xl hidden">
                    {module.id === 1 ? '🤖' : module.id === 2 ? '✍️' : module.id === 3 ? '🎬' : module.id === 4 ? '🛍️' : module.id === 5 ? '📺' : module.id === 6 ? '🛒' : module.id === 7 ? '📱' : '🧠'}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-blue-400 font-bold text-sm">Module {module.id}</span>
                    {!userPaid && <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">🔒 Locked</span>}
                  </div>
                  <h3 className="text-white font-bold text-sm mb-1 line-clamp-2">{module.title}</h3>
                  <p className="text-blue-200 text-xs mb-2 line-clamp-2">{module.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <span>⏱️ {module.duration}</span>
                    </div>
                    <div className="text-green-400 text-xs font-semibold">
                      💰 {module.earnings}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tools Preview */}
              <div className="px-4 pb-4">
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
              <div className="px-4 pb-4">
                {userPaid ? (
                  <Link href={`/module/${module.id}`}>
                    <a className="block w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-2 rounded-lg font-bold text-center text-sm transition-all">
                      Start Module →
                    </a>
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full bg-gray-600 text-gray-400 py-2 rounded-lg font-bold text-center text-sm cursor-not-allowed"
                  >
                    🔒 Unlock Course First
                  </button>
                )}
              </div>

              {/* Lock Overlay */}
              {!userPaid && (
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <div className="text-4xl">🔒</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        {!userPaid && (
          <div className="mt-8 text-center bg-gradient-to-r from-green-900 to-blue-900 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-2">Ready to Start?</h3>
            <p className="text-green-200 text-sm mb-4">
              Get instant access to all 8 modules and start building your AI income streams today!
            </p>
            <Link href="/checkout">
              <a className="inline-block bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-bold text-base transition-all">
                Get Started - $15
              </a>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}


