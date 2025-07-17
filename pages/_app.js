// pages/_app.js
import '../styles/globals.css'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function MyApp({ Component, pageProps }) {
  const [session, setSession] = useState(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    // Listen for changes
    const { subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    // Pass both the raw client and current session down
    <Component {...pageProps} supabase={supabase} session={session} />
  )
}

export default MyApp