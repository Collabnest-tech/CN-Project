// pages/_app.js
import '../styles/globals.css'
import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const u = session.user
        // upsert so we don't duplicate
        await supabase
          .from('users')
          .insert([{ id: u.id, email: u.email, has_paid: false }], {
            ignoreDuplicates: true,
          })
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  return <Component {...pageProps} />
}

export default MyApp
