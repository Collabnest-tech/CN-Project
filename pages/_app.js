// pages/_app.js
import '../styles/globals.css'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Dynamically import so it only renders in the browser
const DropdownNavbar = dynamic(
  () => import('../components/DropdownNavbar'),
  { ssr: false }
)

function MyApp({ Component, pageProps }) {
  const [session, setSession] = useState(null)

  useEffect(() => {
    // fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    // subscribe to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    )
    return () => subscription?.unsubscribe()
  }, [])

  return (
    <>
      <Head>
        <title>Collab‑Nest</title>
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"
        />
        <meta name="theme-color" content="#10151c" />
        <meta
          name="description"
          content="Collab-Nest: AI-powered online courses"
        />
      </Head>

      {/* No flex container wrapping it—let the portal go full‑screen */}
      <DropdownNavbar session={session} />

      <Component
        {...pageProps}
        supabase={supabase}
        session={session}
      />
    </>
  )
}

export default MyApp


