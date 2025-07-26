// Script to generate placeholder images - run this in browser console or create actual images

const images = [
  {
    name: 'ai-revolution.jpg',
    content: 'AI Revolution - Don\'t Miss Out',
    color: '#FF6B6B'
  },
  {
    name: 'prosperity.jpg', 
    content: 'From Poverty to Prosperity',
    color: '#4ECDC4'
  },
  {
    name: 'team.jpg',
    content: 'Expert Team - Durham University',
    color: '#45B7D1'
  },
  {
    name: 'transformation.jpg',
    content: 'Your Transformation Awaits',
    color: '#96CEB4'
  }
]

// Create SVG placeholders
images.forEach(img => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${img.color};stop-opacity:1" />
        <stop offset="100%" style="stop-color:#000000;stop-opacity:0.8" />
      </linearGradient>
    </defs>
    <rect width="800" height="400" fill="url(#grad)"/>
    <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-size="32" font-weight="bold">${img.content}</text>
  </svg>`
  
  console.log(`Save as ${img.name}:`, svg)
})