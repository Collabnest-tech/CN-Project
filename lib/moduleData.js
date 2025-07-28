export const moduleData = [
  {
    id: 1,
    title: "AI Automation Mastery",
    description: "Learn to automate your marketing processes using cutting-edge AI tools and workflows.",
    thumbnail: "/module1.jpg",
    earnings: "Potential: $2,000-5,000/month",
    totalLessons: 12,
    completedLessons: 3,
    lessons: [
      { id: 1, title: "Introduction to AI Automation", completed: true },
      { id: 2, title: "Setting Up Your AI Toolkit", completed: true },
      { id: 3, title: "Creating Your First Automation", completed: true },
      { id: 4, title: "Advanced Workflow Design", completed: false }
    ]
  },
  {
    id: 2,
    title: "AI Content Creation",
    description: "Master AI-powered content creation for blogs, social media, and marketing campaigns.",
    thumbnail: "/module2.jpg",
    earnings: "Potential: $1,500-4,000/month",
    totalLessons: 10,
    completedLessons: 7,
    lessons: [
      { id: 1, title: "Introduction to AI Content Creation", completed: true },
      { id: 2, title: "AI Tools for Bloggers", completed: true },
      { id: 3, title: "Social Media Content with AI", completed: true },
      { id: 4, title: "AI in Email Marketing", completed: true },
      { id: 5, title: "Advanced Content Strategies", completed: false }
    ]
  },
  {
    id: 3,
    title: "AI Video Production",
    description: "Create professional videos using AI tools for marketing and content creation.",
    thumbnail: "/module3.jpg",
    earnings: "Potential: $3,000-8,000/month",
    totalLessons: 8,
    completedLessons: 2,
    lessons: [
      { id: 1, title: "Getting Started with AI Video", completed: true },
      { id: 2, title: "Scripting and Storyboarding", completed: true },
      { id: 3, title: "AI Tools for Video Editing", completed: false },
      { id: 4, title: "Publishing and Promoting AI Videos", completed: false }
    ]
  },
  {
    id: 4,
    title: "AI E-commerce Optimization",
    description: "Optimize your online store with AI-powered tools for maximum conversions.",
    thumbnail: "/module4.jpg",
    earnings: "Potential: $2,500-6,000/month",
    totalLessons: 15,
    completedLessons: 0,
    lessons: [
      { id: 1, title: "Introduction to AI in E-commerce", completed: false },
      { id: 2, title: "Product Research with AI", completed: false },
      { id: 3, title: "AI for Inventory Management", completed: false },
      { id: 4, title: "Optimizing Product Pages", completed: false },
      { id: 5, title: "AI Chatbots for Customer Service", completed: false }
    ]
  },
  {
    id: 5,
    title: "AI in Social Media Marketing",
    description: "Leverage AI for content creation, scheduling, and analytics across social platforms.",
    duration: "45 mins",
    earnings: "Earn $600-2000/month",
    tools: ["Hootsuite", "Buffer", "Canva AI"],
    videoPath: "/modules/Mod7.mp4",
    thumbnail: "/module-thumbnails/mod7.jpg"
  },
  {
    id: 6,
    title: "AI Tools for E-commerce Success",
    description: "Utilize AI to enhance product research, store optimization, and customer engagement.",
    duration: "50 mins",
    earnings: "Earn $500-2500/month",
    tools: ["Shopify", "Oberlo", "Google Analytics"],
    videoPath: "/modules/Mod6.mp4",
    thumbnail: "/module-thumbnails/mod6.jpg"
  },
  {
    id: 7,
    title: "YouTube Automation with AI",
    description: "Automate video creation, optimization, and marketing for YouTube success.",
    duration: "60 mins",
    earnings: "Earn $1000-5000/month",
    tools: ["TubeBuddy", "VidIQ", "Canva"],
    videoPath: "/modules/Mod5.mp4",
    thumbnail: "/module-thumbnails/mod5.jpg"
  },
  {
    id: 8,
    title: "Advanced AI Integration & Scaling",
    description: "Master advanced AI workflows and scale your income streams to 6-figure levels.",
    duration: "70 mins",
    earnings: "Earn $2000-10000/month",
    tools: ["Zapier", "Make", "Multiple AI APIs"],
    videoPath: "/modules/Mod8.mp4",
    thumbnail: "/module-thumbnails/mod8.jpg"
  }
];

export const courseData = {
  id: 1,
  title: "AI for Making Money Online",
  description: "Master ChatGPT, MidJourney & 20+ AI tools to build multiple passive income streams",
  price: 20,
  discountPrice: 15,
  currency: "USD",
  totalModules: 8,
  totalDuration: "6+ hours",
  level: "Beginner to Advanced",
  modules: moduleData
};