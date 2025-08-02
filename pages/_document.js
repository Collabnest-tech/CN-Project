import { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'

export default function Document() {
  return (
    <Html>
      <Head />
      <body>
        <Main />
        <NextScript />
        
        {/* Invisible Google Translate */}
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
            
            // Function to change language programmatically
            function changeLanguage(langCode) {
              const selectElement = document.querySelector('.goog-te-combo');
              if (selectElement) {
                selectElement.value = langCode;
                selectElement.dispatchEvent(new Event('change'));
                localStorage.setItem('preferred_language', langCode);
              }
            }
            
            // Auto-load saved language
            window.addEventListener('load', function() {
              setTimeout(() => {
                const savedLang = localStorage.getItem('preferred_language');
                if (savedLang && savedLang !== 'en') {
                  changeLanguage(savedLang);
                }
              }, 2000);
            });
          `}
        </Script>
        
        {/* Hide Google Translate Widget */}
        <style jsx global>{`
          /* Hide the Google Translate widget completely */
          #google_translate_element {
            display: none !important;
          }
          
          /* Hide Google Translate banner */
          .goog-te-banner-frame.skiptranslate {
            display: none !important;
          }
          
          body {
            top: 0px !important;
          }
          
          /* Hide Google branding */
          .goog-te-gadget {
            display: none !important;
          }
        `}</style>
        
        {/* Hidden Google Translate Element */}
        <div id="google_translate_element" style={{display: 'none'}}></div>
      </body>
    </Html>
  )
}