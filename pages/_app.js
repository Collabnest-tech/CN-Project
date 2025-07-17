// pages/_app.js
import '../styles/globals.css'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function MyApp({ Component, pageProps }) {
  const [session, setSession] = useState(null)

  useEffect(() => {
    // 1) Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // 2) Subscribe to future changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    // 3) Cleanup
    return () => {
      if (subscription) subscription.unsubscribe()
    }
  }, [])

  return <Component {...pageProps} supabase={supabase} session={session} />
}

export default MyApp
