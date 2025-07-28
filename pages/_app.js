import '../styles/globals.css'
import Head from 'next/head'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import DropdownNavbar from '../components/DropdownNavbar'
import { useRouter } from 'next/router'

function MyApp({ Component, pageProps }) {
  const [session, setSession] = useState(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription?.unsubscribe()
  }, [])

  useEffect(() => {
    // ✅ Mobile refresh fix for logo display
    const handleRouteChange = (url) => {
      // Check if it's mobile device
      const isMobile = window.innerWidth <= 768
      
      if (isMobile) {
        // Small delay to ensure page loads, then refresh
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.reload()
          }
        }, 100)
      }
    }

    // Listen for route changes
    router.events.on('routeChangeComplete', handleRouteChange)

    // Cleanup
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router])

  return (
    <>
      <Head>
        <title>www.collab-nest.com</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#10151c" />
        <meta name="description" content="Collab-Nest: AI-powered online courses" />
      </Head>
      {/* Remove flex row layout */}
      <DropdownNavbar session={session} />
      <div>
        <Component {...pageProps} supabase={supabase} session={session} />
      </div>
    </>
  )
}

export default MyApp
