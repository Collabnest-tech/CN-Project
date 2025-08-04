import { createContext, useContext, useState } from 'react'

const UrduContext = createContext()

export function UrduProvider({ children }) {
  const [isUrdu, setIsUrdu] = useState(false)

  const translations = {
    // Navigation
    "Home": "ہوم",
    "Courses": "کورسز",
    "Profile & Referrals": "پروفائل اور ریفرل",
    "Login": "لاگ ان",
    "Sign Up": "سائن اپ",
    "Sign Out": "سائن آؤٹ",
    "Signed in as:": "لاگ ان ہیں بطور:",
    "Loading...": "لوڈ ہو رہا ہے...",

    // Referral banner
    "Great news! You have a $5 discount!": "بہترین خبر! آپ کو $5 کی چھوٹ ملی ہے!",
    "Referral code": "ریفرل کوڈ",
    "applied": "لاگو کیا گیا",

    // Alert boxes
    "Market Alert": "مارکیٹ الرٹ",
    "The AI revolution is accelerating faster than experts predicted. Early adopters who started 6 months ago are already earning 5-figure monthly incomes.": "AI انقلاب ماہرین کی پیشن گوئی سے زیادہ تیزی سے بڑھ رہا ہے۔ جن لوگوں نے 6 ماہ پہلے شروعات کی تھی وہ پہلے سے ہی پانچ ہندسوں کی ماہانہ آمدنی کما رہے ہیں۔",
    "The question isn't if AI will change everything - it's whether you'll be prepared when it does.": "سوال یہ نہیں ہے کہ آیا AI سب کچھ بدل دے گا - سوال یہ ہے کہ جب ایسا ہوگا تو کیا آپ تیار ہوں گے۔",
    
    "Who We Are & Why This Matters": "ہم کون ہیں اور یہ کیوں اہم ہے",
    "We're not just another online course company. Our team includes a": "ہم صرف ایک اور آن لائن کورس کمپنی نہیں ہیں۔ ہماری ٹیم میں شامل ہے",
    "Software Developer from Durham University": "Durham یونیورسٹی کا سافٹ ویئر ڈیولپر",
    "and a": "اور ایک",
    "Senior Project Manager": "سینیر پروجیکٹ منیجر",
    "who have witnessed firsthand how AI is reshaping entire industries.": "جنہوں نے اپنی آنکھوں سے دیکھا ہے کہ AI کیسے پوری صنعتوں کو تبدیل کر رہا ہے۔",
    "Our mission goes beyond education - we're building pathways out of financial uncertainty through practical AI skills that are in massive demand right now.": "ہمارا مشن تعلیم سے آگے ہے - ہم عملی AI مہارتوں کے ذریعے مالی غیر یقینی صورتحال سے نکلنے کے راستے بنا رہے ہیں جن کی اس وقت بہت زیادہ مانگ ہے۔",

    // Hero section
    "While Most People Wonder": "جبکہ زیادہ تر لوگ سوچتے ہیں",
    "What If?": "کیا ہوگا؟",
    "Smart individuals are already building automated income streams with AI tools. The gap between those who act and those who wait is widening every day.": "ہوشیار افراد پہلے سے ہی AI ٹولز کے ساتھ خودکار آمدنی کے ذرائع بنا رہے ہیں۔ جو عمل کرتے ہیں اور جو انتظار کرتے ہیں ان کے درمیان فرق ہر دن بڑھتا جا رہا ہے۔",

    // Stats
    "Students Learning": "طلباء سیکھ رہے ہیں",
    "Student Earnings": "طلباء کی آمدنی",
    "See Results": "نتائج دیکھیں",

    // Pricing section
    "Investment in Your Future:": "آپ کے مستقبل میں سرمایہ کاری:",
    "One-time payment": "ایک بار ادائیگی",
    "Lifetime access": "زندگی بھر رسائی",
    "discount applied with referral code!": "ریفرل کوڈ کے ساتھ رعایت لاگو!",
    "Get Started Now": "ابھی شروع کریں",
    "Sign In to Purchase": "خریدنے کے لیے داخل ہوں",
    "Explore What's Inside": "اندر کیا ہے دیکھیں",

    // Welcome section for paid users
    "Welcome Back!": "واپس خوش آمدید!",
    "You're already part of our AI Mastery community. Continue your journey and unlock your potential!": "آپ پہلے سے ہی ہماری AI Mastery کمیونٹی کا حصہ ہیں۔ اپنا سفر جاری رکھیں اور اپنی صلاحیت کو کھولیں!",
    "Continue Learning": "سیکھنا جاری رکھیں",

    // Referral Program
    "Referral Program": "ریفرل پروگرام",
    "Friends get $5 OFF": "دوستوں کو $5 کی چھوٹ ملتی ہے",
    "with your referral code!": "آپ کے ریفرل کوڈ کے ساتھ!",
    "You earn $5": "آپ $5 کماتے ہیں",
    "for each successful referral": "ہر کامیاب ریفرل کے لیے",
    "Get your referral link:": "اپنا ریفرل لنک حاصل کریں:",
    "Go to Profile & Referrals to generate your unique code": "اپنا منفرد کوڈ بنانے کے لیے پروفائل اور ریفرل میں جائیں",

    // Carousel slides
    "While Others Hesitate, Fortunes Are Being Made": "جبکہ دوسرے ہچکچاتے ہیں، دولت بنائی جا رہی ہے",
    "Every day you wait, someone else is building their AI-powered income stream. The early adopters are already pulling ahead.": "ہر دن جو آپ انتظار کرتے ہیں، کوئی اور اپنا AI سے چلنے والا آمدنی کا ذریعہ بنا رہا ہے۔ جلدی اپنانے والے پہلے سے ہی آگے نکل رہے ہیں۔",

    "The Opportunity That Only Comes Once": "وہ موقع جو صرف ایک بار آتا ہے",
    "Just like the internet boom of the 90s, AI is creating a new class of entrepreneurs. The window is still open, but not for long.": "بالکل 90 کی دہائی کے انٹرنیٹ بوم کی طرح، AI کاروباری افراد کا ایک نیا طبقہ بنا رہا ہے۔ یہ موقع ابھی کھلا ہے، لیکن زیادہ دیر نہیں۔",

    "Success Stories Are Being Written Right Now": "کامیابی کی کہانیاں ابھی لکھی جا رہی ہیں",
    "People with no technical background are earning thousands monthly. They started where you are today - curious and ready to learn.": "بغیر تکنیکی پس منظر کے لوگ ماہانہ ہزاروں کما رہے ہیں۔ انہوں نے وہیں سے شروعات کی جہاں آپ آج ہیں - متجسس اور سیکھنے کے لیے تیار۔",

    "The Skills That Separate the Successful": "وہ مہارتیں جو کامیاب لوگوں کو الگ کرتی ہیں",
    "While most people struggle with traditional methods, our students master AI tools that multiply their productivity and income potential.": "جبکہ زیادہ تر لوگ روایتی طریقوں سے جدوجہد کرتے ہیں، ہمارے طلباء AI ٹولز میں مہارت حاصل کرتے ہیں جو ان کی پیداوار اور آمدنی کی صلاحیت کو بڑھاتے ہیں۔",

    // Module showcase
    "What Successful Students Are Learning": "کامیاب طلباء کیا سیکھ رہے ہیں",
    "These aren't just lessons - they're the exact strategies our students use to build income streams": "یہ صرف اسباق نہیں ہیں - یہ وہی حکمت عملیاں ہیں جو ہمارے طلباء آمدنی کے ذرائع بنانے کے لیے استعمال کرتے ہیں",
    "See All 8 Income-Generating Modules": "تمام 8 آمدنی پیدا کرنے والے ماڈیولز دیکھیں",

    // Final CTA
    "Your Future Self Is Waiting": "آپ کا مستقبل کا نفس انتظار کر رہا ہے",
    "Every skill you don't learn, every opportunity you don't explore, every day you postpone - someone else is moving ahead. But it's never too late to start.": "ہر وہ مہارت جو آپ نہیں سیکھتے، ہر وہ موقع جس کی آپ تلاش نہیں کرتے، ہر وہ دن جو آپ ملتوی کرتے ہیں - کوئی اور آگے بڑھ رہا ہے۔ لیکن شروعات کے لیے کبھی دیر نہیں ہوتی۔",
    "Begin Your Transformation": "اپنی تبدیلی شروع کریں",
    "Lifetime Access": "زندگی بھر رسائی",
    "Start Immediately": "فوری طور پر شروع کریں",
    "Expert Support": "ماہرانہ سپورٹ",
    "Real Results": "حقیقی نتائج",

    // Support section
    "Need Support?": "مدد چاہیے؟",
    "Have questions about the course or need assistance? We're here to help!": "کورس کے بارے میں سوالات ہیں یا مدد چاہیے؟ ہم یہاں مدد کے لیے ہیں!",
    "WhatsApp Support": "واٹس ایپ سپورٹ",
    "Available Monday - Friday, 9 AM - 6 PM GMT": "دستیاب پیر سے جمعہ، صبح 9 بجے سے شام 6 بجے GMT",
    "All rights reserved.": "تمام حقوق محفوظ ہیں۔"
  }

  const t = (text) => {
    if (!isUrdu) return text
    return translations[text] || text
  }

  return (
    <UrduContext.Provider value={{ isUrdu, setIsUrdu, t }}>
      {children}
    </UrduContext.Provider>
  )
}

export function useUrdu() {
  const context = useContext(UrduContext)
  if (!context) {
    throw new Error('useUrdu must be used within UrduProvider')
  }
  return context
}