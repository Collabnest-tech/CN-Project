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
                autoDisplay: false,
                multilanguagePage: true
              }, 'google_translate_element');
              
              // Auto-detect user's country and set language
              setTimeout(() => {
                try {
                  // Check if user has a saved language preference
                  const savedLang = localStorage.getItem('preferred_language');
                  if (savedLang && savedLang !== 'en') {
                    const selectElement = document.querySelector('.goog-te-combo');
                    if (selectElement) {
                      selectElement.value = savedLang;
                      selectElement.dispatchEvent(new Event('change'));
                    }
                  } else {
                    // Auto-detect based on browser language
                    const userLang = navigator.language || navigator.userLanguage;
                    const langCode = userLang.split('-')[0];
                    
                    // Map common languages to Google Translate codes
                    const langMap = {
                      'ur': 'ur', 'ar': 'ar', 'es': 'es', 'fr': 'fr', 
                      'de': 'de', 'hi': 'hi', 'bn': 'bn', 'tr': 'tr',
                      'pt': 'pt', 'it': 'it', 'nl': 'nl', 'sv': 'sv',
                      'no': 'no', 'da': 'da', 'fi': 'fi', 'zh': 'zh',
                      'ja': 'ja', 'ko': 'ko', 'ru': 'ru'
                    };
                    
                    if (langMap[langCode] && langCode !== 'en') {
                      const selectElement = document.querySelector('.goog-te-combo');
                      if (selectElement) {
                        selectElement.value = langMap[langCode];
                        selectElement.dispatchEvent(new Event('change'));
                      }
                    }
                  }
                } catch (error) {
                  console.log('Language detection error:', error);
                }
              }, 2000);
              
              // Save language preference when changed
              setTimeout(() => {
                const selectElement = document.querySelector('.goog-te-combo');
                if (selectElement) {
                  selectElement.addEventListener('change', function() {
                    localStorage.setItem('preferred_language', this.value);
                  });
                }
              }, 2000);
            }
          `}
        </Script>
        
        {/* Custom CSS for Google Translate */}
        <style jsx global>{`
          /* Hide Google Translate banner */
          .goog-te-banner-frame.skiptranslate {
            display: none !important;
          }
          
          body {
            top: 0px !important;
          }
          
          /* Custom styling for translate widget */
          #google_translate_element {
            position: fixed !important;
            top: 20px !important;
            left: 20px !important;
            z-index: 9999 !important;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            padding: 8px 12px !important;
            border-radius: 12px !important;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
            border: none !important;
          }
          
          /* Style the select dropdown */
          .goog-te-combo {
            background: rgba(255,255,255,0.9) !important;
            border: none !important;
            border-radius: 8px !important;
            padding: 6px 10px !important;
            font-size: 13px !important;
            font-weight: 600 !important;
            color: #1a202c !important;
            cursor: pointer !important;
            outline: none !important;
            transition: all 0.3s ease !important;
          }
          
          .goog-te-combo:hover {
            background: rgba(255,255,255,1) !important;
            transform: translateY(-1px) !important;
          }
          
          .goog-te-combo:focus {
            background: rgba(255,255,255,1) !important;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3) !important;
          }
          
          /* Add language icon before dropdown */
          #google_translate_element::before {
            content: "🌍";
            margin-right: 6px;
            font-size: 16px;
          }
          
          /* Mobile responsive */
          @media (max-width: 768px) {
            #google_translate_element {
              top: 15px !important;
              left: 15px !important;
              padding: 6px 10px !important;
            }
            
            .goog-te-combo {
              font-size: 12px !important;
              padding: 5px 8px !important;
            }
          }
          
          /* Remove Google branding */
          .goog-te-gadget {
            font-family: inherit !important;
          }
          
          .goog-te-gadget .goog-te-combo {
            margin: 0 !important;
          }
          
          /* Hide "Powered by Google" */
          .goog-te-gadget span {
            display: none !important;
          }
          
          .goog-te-gadget > span > a {
            display: none !important;
          }
          
          /* Show only the dropdown */
          #google_translate_element .goog-te-gadget-simple {
            background: transparent !important;
            border: none !important;
            padding: 0 !important;
          }
        `}</style>
        
        {/* ✅ Global Google Translate Widget - Top Left with Custom Styling */}
        <div id="google_translate_element"></div>
      </body>
    </Html>
  )
}