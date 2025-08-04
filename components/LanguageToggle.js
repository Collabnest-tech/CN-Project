import { useUrdu } from './UrduTranslate'

export default function LanguageToggle() {
  const { isUrdu, setIsUrdu } = useUrdu()

  return (
    <div className="fixed top-4 left-4 z-50">
      <button
        onClick={() => setIsUrdu(!isUrdu)}
        className="bg-[#181e29] border border-gray-600 hover:border-gray-500 rounded-lg p-2 transition-colors flex items-center space-x-2 min-w-[120px]"
      >
        <span className="text-lg">{isUrdu ? '🇵🇰' : '🇺🇸'}</span>
        <span className="text-white text-sm font-medium">
          {isUrdu ? 'اردو' : 'English'}
        </span>
      </button>
    </div>
  )
}