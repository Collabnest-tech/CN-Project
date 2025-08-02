import { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'

export default function Document() {
  return (
    <Html>
      <Head />
      <body>
        <Main />
        <NextScript />
        
        {/* Google Translate */}
        <Script
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
        <Script id="google-translate" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'en,ur,ar,es,fr,de,hi,bn,tr,pt,it,nl,sv,no,da,fi,zh,ja,ko,ru',
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false
              }, 'google_translate_element');
            }
          `}
        </Script>
        
        {/* ✅ Global Google Translate Widget - Appears on Every Page */}
        <div 
          id="google_translate_element" 
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: '9999',
            backgroundColor: 'white',
            padding: '8px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
          }}
        ></div>
      </body>
    </Html>
  )
}