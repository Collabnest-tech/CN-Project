import '../styles/globals.css'
import Head from 'next/head'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import DropdownNavbar from '../components/DropdownNavbar'
import LanguageToggle from '../components/LanguageToggle'
import { UrduProvider } from '../components/UrduTranslate'
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
    const handleRouteChangeComplete = () => {
      if (typeof window !== 'undefined') {
        window.scrollTo(0, 0)
      }
    }

    router.events.on('routeChangeComplete', handleRouteChangeComplete)
    return () => router.events.off('routeChangeComplete', handleRouteChangeComplete)
  }, [router])

  return (
    <UrduProvider>
      <Head>
        <title>www.collab-nest.com</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#10151c" />
        <meta name="description" content="Collab-Nest: AI-powered online courses" />
      </Head>
      
      <LanguageToggle />
      <DropdownNavbar session={session} />
      
      <div>
        <Component {...pageProps} supabase={supabase} session={session} />
      </div>
    </UrduProvider>
  )
}

export default MyApp
