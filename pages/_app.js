import '../styles/globals.css';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from '../lib/supabase';

function MyApp({ Component, pageProps }) {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <Component {...pageProps} />
    </SessionContextProvider>
  );
}

export default MyApp;