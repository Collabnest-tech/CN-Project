import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import { useTranslations } from '../lib/translations'
import LanguageSwitcher from './LanguageSwitcher'

export default function DropdownNavbar({ session }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { t } = useTranslations()
  const router = useRouter()

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="bg-[#1a2233] border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-white">Collab-Nest</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            
            {/* Language Switcher */}
            <LanguageSwitcher />

            <Link href="/" className="text-gray-300 hover:text-white transition-colors">
              {t.nav.home}
            </Link>
            
            {session?.user && (
              <Link href="/courses" className="text-gray-300 hover:text-white transition-colors">
                {t.nav.courses}
              </Link>
            )}
            
            {session?.user && (
              <Link href="/profile-referrals" className="text-gray-300 hover:text-white transition-colors">
                {t.nav.profile}
              </Link>
            )}

            {session?.user ? (
              <button
                onClick={handleSignOut}
                className="text-gray-300 hover:text-red-400 transition-colors"
              >
                {t.nav.signOut}
              </button>
            ) : (
              <Link href="/auth" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                {t.nav.signIn}
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-3">
            
            {/* Mobile Language Switcher */}
            <LanguageSwitcher />

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link href="/" className="block text-gray-300 hover:text-white transition-colors">
              {t.nav.home}
            </Link>
            
            {session?.user && (
              <Link href="/courses" className="block text-gray-300 hover:text-white transition-colors">
                {t.nav.courses}
              </Link>
            )}
            
            {session?.user && (
              <Link href="/profile-referrals" className="block text-gray-300 hover:text-white transition-colors">
                {t.nav.profile}
              </Link>
            )}

            {session?.user ? (
              <button
                onClick={handleSignOut}
                className="block text-gray-300 hover:text-red-400 transition-colors"
              >
                {t.nav.signOut}
              </button>
            ) : (
              <Link href="/auth" className="block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors w-fit">
                {t.nav.signIn}
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}