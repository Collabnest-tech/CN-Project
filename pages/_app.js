import '../styles/globals.css'
import Head from 'next/head'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function MyApp({ Component, pageProps }) {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription?.unsubscribe()
  }, [])

  return (
    <>
      <Head>
        <title>www.collab-nest.com</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Collab-Nest: AI-powered online courses" />
      </Head>
      <Component {...pageProps} supabase={supabase} session={session} />
    </>
  )
}

export default MyApp
