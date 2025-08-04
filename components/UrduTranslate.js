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

    // Duration
    "25 mins": "25 منٹ",
    "30 mins": "30 منٹ",
    "20 mins": "20 منٹ",
    "45 mins": "45 منٹ",
    "50 mins": "50 منٹ",
    "55 mins": "55 منٹ",
    "60 mins": "60 منٹ",
    "70 mins": "70 منٹ",

    // Earnings
    "Earn $500-2000/month": "ماہانہ $500-2000 کمائیں",
    "Earn $1000-3000/month": "ماہانہ $1000-3000 کمائیں",
    "Earn $800-2500/month": "ماہانہ $800-2500 کمائیں",
    "Earn $1000-5000/month": "ماہانہ $1000-5000 کمائیں",
    "Earn $500-2500/month": "ماہانہ $500-2500 کمائیں",
    "Earn $600-2000/month": "ماہانہ $600-2000 کمائیں",
    "Earn $2000-10000/month": "ماہانہ $2000-10000 کمائیں",

    // Module Titles (from your actual moduleData.js)
    "ChatGPT Mastery for Content Creation": "مواد تخلیق کے لیے ChatGPT میں مہارت",
    "AI Writing Assistant Business": "AI رائٹنگ اسسٹنٹ کاروبار",
    "MidJourney Art & Design Profits": "MidJourney آرٹ اور ڈیزائن کے فوائد",
    "AI Video Content Creation": "AI ویڈیو مواد کی تخلیق",
    "YouTube Automation with AI": "AI کے ساتھ یوٹیوب آٹومیشن",
    "AI Tools for E-commerce Success": "ای کامرس کامیابی کے لیے AI ٹولز",
    "AI in Social Media Marketing": "سوشل میڈیا مارکیٹنگ میں AI",
    "Advanced AI Integration & Scaling": "ایڈوانسڈ AI انٹیگریشن اور اسکیلنگ",

    // Module Descriptions (from your actual moduleData.js)
    "Learn to create high-quality content using ChatGPT and monetize it across multiple platforms.": "ChatGPT استعمال کرتے ہوئے اعلیٰ معیار کا مواد بنانا اور اسے متعدد پلیٹ فارمز پر منیٹائز کرنا سیکھیں۔",
    "Build a profitable writing service using AI tools to serve clients worldwide.": "دنیا بھر کے کلائنٹس کی خدمت کے لیے AI ٹولز استعمال کرتے ہوئے منافع بخش رائٹنگ سروس بنائیں۔",
    "Create and sell AI-generated artwork, logos, and designs for multiple income streams.": "متعدد آمدنی کے ذرائع کے لیے AI سے بنے آرٹ ورک، لوگوز، اور ڈیزائن بنائیں اور بیچیں۔",
    "Produce engaging video content using AI tools for YouTube, TikTok, and social media.": "یوٹیوب، ٹک ٹاک، اور سوشل میڈیا کے لیے AI ٹولز استعمال کرتے ہوئے دلچسپ ویڈیو مواد بنائیں۔",
    "Automate video creation, optimization, and marketing for YouTube success.": "یوٹیوب کامیابی کے لیے ویڈیو بنانا، بہتری، اور مارکیٹنگ کو خودکار بنائیں۔",
    "Utilize AI to enhance product research, store optimization, and customer engagement.": "پروڈکٹ ریسرچ، اسٹور کی بہتری، اور کسٹمر انگیجمنٹ بڑھانے کے لیے AI کا استعمال کریں۔",
    "Leverage AI for content creation, scheduling, and analytics across social platforms.": "سوشل پلیٹ فارمز میں مواد کی تخلیق، شیڈولنگ، اور تجزیات کے لیے AI کا فائدہ اٹھائیں۔",
    "Master advanced AI workflows and scale your income streams to 6-figure levels.": "ایڈوانسڈ AI ورک فلوز میں مہارت حاصل کریں اور اپنی آمدنی کو 6 ہندسوں کی سطح تک بڑھائیں۔",

    // Auth pages
    "Create Account": "اکاؤنٹ بنائیں",
    "Full Name": "مکمل نام",
    "Email Address": "ای میل ایڈریس",
    "Password": "پاس ورڈ",
    "Confirm Password": "پاس ورڈ کی تصدیق",
    "Creating Account": "اکاؤنٹ بنایا جا رہا ہے",
    "Already have an account?": "پہلے سے اکاؤنٹ ہے؟",
    "Don't have an account?": "اکاؤنٹ نہیں ہے؟",
    "Sign up": "رجسٹر کریں",
    "Welcome Back": "واپس خوش آمدید",
    "Sign in to your account": "اپنے اکاؤنٹ میں داخل ہوں",
    "Email": "ای میل",
    "Join thousands learning AI for income": "آمدنی کے لیے AI سیکھنے والے ہزاروں لوگوں میں شامل ہوں",
    "What you get:": "آپ کو کیا ملتا ہے:",
    "Access to 8 comprehensive AI modules": "8 جامع AI ماڈیولز تک رسائی",
    "Lifetime course access": "کورس تک زندگی بھر رسائی",
    "Referral program - earn $5 per referral": "ریفرل پروگرام - ہر ریفرل پر $5 کمائیں",
    "Real income-generating strategies": "حقیقی آمدنی پیدا کرنے کی حکمت عملیاں",
    "Passwords don't match": "پاس ورڈ میں فرق ہے",
    "Registration successful! Please check your email to verify your account.": "رجسٹریشن کامیاب! اپنا ای میل چیک کریں",

    // Courses page
    "AI Mastery Course Modules": "AI مہارت کورس کے ماڈیولز",
    "Complete training program to build multiple income streams with AI": "AI کے ساتھ متعدد آمدنی کے ذرائع بنانے کا مکمل تربیتی پروگرام",
    "Play Video": "ویڈیو چلائیں",
    "Module": "ماڈیول",
    "Duration": "مدت",
    "Start Module": "ماڈیول شروع کریں",
    "Estimated Earnings": "متوقع آمدنی",
    "Tools Covered": "شامل ٹولز",
    "Access Restricted": "رسائی محدود",
    "Purchase the course to unlock all modules": "تمام ماڈیولز کو کھولنے کے لیے کورس خریدیں",
    "Purchase Course": "کورس خریدیں",

    // Profile page
    "User Profile & Referrals": "صارف پروفائل اور ریفرل",
    "Manage your account and track your referral earnings": "اپنا اکاؤنٹ منظم کریں اور اپنی ریفرل آمدنی کو ٹریک کریں",
    "Profile Information": "پروفائل کی معلومات",
    "Name": "نام",
    "Account Status": "اکاؤنٹ کی حالت",
    "Premium Member": "پریمیم ممبر",
    "Free Member": "مفت ممبر",
    "Upgrade to Premium": "پریمیم میں اپگریڈ کریں",
    "Referral Dashboard": "ریفرل ڈیش بورڈ",
    "Your Referral Code": "آپ کا ریفرل کوڈ",
    "Generate Code": "کوڈ بنائیں",
    "Copy": "کاپی کریں",
    "Copied!": "کاپی ہو گیا!",
    "Share Your Referral Link": "اپنا ریفرل لنک شیئر کریں",
    "Copy Link": "لنک کاپی کریں",
    "Link Copied!": "لنک کاپی ہو گیا!",
    "Referral Stats": "ریفرل کے اعداد و شمار",
    "Total Referrals": "کل ریفرل",
    "Successful Purchases": "کامیاب خریداریاں",
    "Total Earnings": "کل آمدنی",
    "How It Works": "یہ کیسے کام کرتا ہے",
    "Share your referral link with friends": "دوستوں کے ساتھ اپنا ریفرل لنک شیئر کریں",
    "They get $5 off their purchase": "انہیں اپنی خریداری پر $5 کی چھوٹ ملتی ہے",
    "You earn $5 for each successful referral": "آپ ہر کامیاب ریفرل کے لیے $5 کماتے ہیں",
    "Recent Referral Activity": "حالیہ ریفرل سرگرمی",
    "No referral activity yet": "ابھی تک کوئی ریفرل سرگرمی نہیں",
    "Start sharing your link to earn rewards!": "انعامات کمانے کے لیے اپنا لنک شیئر کرنا شروع کریں!",

    // Checkout page
    "Complete Your Purchase": "اپنی خریداری مکمل کریں",
    "AI Mastery Course - Lifetime Access": "AI مہارت کورس - زندگی بھر رسائی",
    "Order Summary": "آرڈر کا خلاصہ",
    "Course Price": "کورس کی قیمت",
    "Referral Discount": "ریفرل ڈسکاؤنٹ",
    "Total": "کل",
    "Payment Information": "ادائیگی کی معلومات",
    "Card Number": "کارڈ نمبر",
    "Expiry Date": "ختم ہونے کی تاریخ",
    "CVC": "CVC",
    "Cardholder Name": "کارڈ ہولڈر کا نام",
    "Processing...": "عمل درآمد...",
    "Complete Purchase": "خریداری مکمل کریں",
    "Secure Payment": "محفوظ ادائیگی",
    "Your payment information is encrypted and secure": "آپ کی ادائیگی کی معلومات خفیہ اور محفوظ ہیں",
    "Enter your full name": "اپنا مکمل نام درج کریں",
    "This is your account email and cannot be changed": "یہ آپ کا اکاؤنٹ ای میل ہے اور تبدیل نہیں ہو سکتا",
    "Country": "ملک",
    "United Kingdom": "برطانیہ",
    "United States": "ریاستہائے متحدہ",
    "Canada": "کینیڈا",
    "Australia": "آسٹریلیا",
    "United Arab Emirates": "متحدہ عرب امارات",
    "Pakistan": "پاکستان",
    "Italy": "اٹلی",
    "Spain": "اسپین",
    "Netherlands": "نیدرلینڈز",
    "Belgium": "بیلجیم",
    "Sweden": "سویڈن",
    "Norway": "ناروے",
    "Denmark": "ڈنمارک",
    "Finland": "فن لینڈ",
    "Card Information": "کارڈ کی معلومات",
    "Your payment information is secure and encrypted": "آپ کی ادائیگی کی معلومات محفوظ اور خفیہ ہیں",
    "Processing Payment...": "ادائیگی کی کارروائی...",
    "Complete Payment": "ادائیگی مکمل کریں",
    "Payment Issues?": "ادائیگی میں مسئلہ؟",
    "Having trouble with your payment? Contact us directly for immediate assistance:": "ادائیگی میں پریشانی؟ فوری مدد کے لیے ہم سے رابطہ کریں:",
    "Pakistani Customers": "پاکستانی کسٹمرز",
    "For": "کے لیے",
    "payments, contact the same number above": "ادائیگی، اوپر دیے گئے نمبر سے رابطہ کریں",
    "WhatsApp • Fast response • Available now": "واٹس ایپ • تیز جواب • ابھی دستیاب",
    "Your payment is secured by Stripe's industry-leading encryption": "آپ کی ادائیگی Stripe کی صنعت کی بہترین خفیہ کاری سے محفوظ ہے",
    "We never store your card information": "ہم کبھی آپ کا کارڈ کی معلومات محفوظ نہیں کرتے",
    "Have a Referral Code?": "ریفرل کوڈ ہے؟",
    "Enter referral code": "ریفرل کوڈ درج کریں",
    "Checking...": "چیک ہو رہا ہے...",
    "Apply": "لاگو کریں",
    "Valid referral code applied! You saved $5!": "درست ریفرل کوڈ لاگو! آپ نے $5 بچائے!",
    "Invalid referral code. Please check and try again.": "غلط ریفرل کوڈ۔ براہ کرم چیک کریں اور دوبارہ کوشش کریں۔",
    "Enter a valid referral code to save $5 on your purchase!": "اپنی خریداری پر $5 بچانے کے لیے درست ریفرل کوڈ درج کریں!",
    "Referral discount applied - You saved $5!": "ریفرل ڈسکاؤنٹ لاگو - آپ نے $5 بچائے!",
    
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
    "All rights reserved.": "تمام حقوق محفوظ ہیں۔",

    // Profile & Referrals page missing translations
    "Back to Courses": "کورسز میں واپس",
    "Account Details": "اکاؤنٹ کی تفصیلات",
    "Update Profile": "پروفائل اپ ڈیٹ کریں",
    "Bank Account Details": "بینک اکاؤنٹ کی تفصیلات",
    "Provide your bank details for international wire transfers when withdrawing earnings.": "آمدنی نکالتے وقت بین الاقوامی وائر ٹرانسفرز کے لیے اپنے بینک کی تفصیلات فراہم کریں۔",
    "Bank Name": "بینک کا نام",
    "Account Holder Name": "اکاؤنٹ ہولڈر کا نام",
    "SWIFT/BIC Code": "SWIFT/BIC کوڈ",
    "Account Number / IBAN": "اکاؤنٹ نمبر / IBAN",
    "Routing Number": "روٹنگ نمبر",
    "Account Currency": "اکاؤنٹ کرنسی",
    "Bank Address": "بینک کا پتہ",
    "Enter your bank name": "اپنے بینک کا نام درج کریں",
    "Full name as on bank account": "بینک اکاؤنٹ پر موجود مکمل نام",
    "e.g. ABCDUS33XXX": "مثال: ABCDUS33XXX",
    "Your account number or IBAN": "آپ کا اکاؤنٹ نمبر یا IBAN",
    "9-digit routing number": "9 ہندسوں کا روٹنگ نمبر",
    "Select currency": "کرنسی منتخب کریں",
    "Complete bank address including country": "ملک سمیت بینک کا مکمل پتہ",
    "Secure & Encrypted": "محفوظ اور خفیہ",
    "Your banking information is encrypted and stored securely. We only use this for processing your referral earnings withdrawals.": "آپ کی بینکنگ معلومات خفیہ اور محفوظ طریقے سے محفوظ کی جاتی ہیں۔ ہم اسے صرف آپ کی ریفرل آمدنی نکالنے کے لیے استعمال کرتے ہیں۔",
    "Save Bank Details": "بینک کی تفصیلات محفوظ کریں",
    "Clear": "صاف کریں",
    "Your Referrals": "آپ کے ریفرل",
    "All": "تمام",
    "Email": "ای میل",
    "Date": "تاریخ",
    "Earnings": "آمدنی",
    "Successful Referrals": "کامیاب ریفرل",
    "They get $5 off their purchase": "انہیں اپنی خریداری پر $5 کی چھوٹ ملتی ہے",
    "Earnings are tracked automatically": "آمدنی خودکار طور پر ٹریک ہوتی ہے",
    "Status": "حالت",
    "Per Referral": "فی ریفرل",

    // Course page missing translations
    "AI for Making Money Online": "آن لائن پیسہ کمانے کے لیے AI",
    "Master 8 modules to build your AI income streams": "اپنے AI آمدنی کے ذرائع بنانے کے لیے 8 ماڈیولز میں مہارت حاصل کریں",
    "Available": "دستیاب",
    "Start Learning": "سیکھنا شروع کریں",

    // Additional course-related translations
    "ChatGPT": "ChatGPT",
    "Canva": "Canva", 
    "WordPress": "WordPress",
    "Jasper": "Jasper",
    "Copy.ai": "Copy.ai",
    "MidJourney": "MidJourney",
    "Adobe Creative": "Adobe Creative",
    "Etsy": "Etsy",
    "Synthesia": "Synthesia",
    "InVideo": "InVideo",
    "Descript": "Descript",
    "TubeBuddy": "TubeBuddy",
    "VidIQ": "VidIQ",
    "Shopify": "Shopify",
    "Oberlo": "Oberlo",
    "Google Analytics": "Google Analytics",
    "Hootsuite": "Hootsuite",
    "Buffer": "Buffer",
    "Canva AI": "Canva AI",
    "Zapier": "Zapier",
    "Make": "Make",
    "Back to Home": "ہوم واپس جائیں",
    "Multiple AI APIs": "متعدد AI APIs",

    // Additional Course page translations
    "Course Locked": "کورس بند ہے",
    "Unlock Course": "کورس کھولیں",
    "Locked": "بند",
    "Unlock Course First": "پہلے کورس کھولیں",
    "Ready to Start?": "شروع کرنے کے لیے تیار؟",
    "Get instant access to all modules and start your AI journey today!": "تمام ماڈیولز تک فوری رسائی حاصل کریں اور آج ہی اپنا AI سفر شروع کریں!",
    "Get Started": "شروع کریں",
    "Your Learning Journey": "آپ کا سیکھنے کا سفر",
    "more": "مزید",

    // Quiz component translations
    "Quiz": "کوئز",
    "Question": "سوال",
    "of": "میں سے",
    "Next": "اگلا",
    "Submit Quiz": "کوئز جمع کریں",
    "Quiz Complete!": "کوئز مکمل!",
    "Your Score": "آپ کا اسکور",
    "Correct": "درست",
    "Incorrect": "غلط",
    "Try Again": "دوبارہ کوشش کریں",
    "Continue to Next Module": "اگلے ماڈیول پر جائیں",
    "Well done! You can now proceed to the next module.": "شاباش! اب آپ اگلے ماڈیول پر جا سکتے ہیں۔",
    "Don't worry, you can retake the quiz to improve your score.": "پریشان نہ ہوں، آپ اپنا اسکور بہتر بنانے کے لیے کوئز دوبارہ لے سکتے ہیں۔",
    "Loading quiz...": "کوئز لوڈ ہو رہا ہے...",
    "Error loading quiz questions": "کوئز کے سوالات لوڈ کرنے میں خرابی",

    // Module 1 Questions
    "What are the two main AI tools introduced in Module 1?": "ماڈیول 1 میں متعارف کرائے گئے دو اہم AI ٹولز کیا ہیں؟",
    "ChatGPT and MidJourney": "ChatGPT اور MidJourney",
    "Jasper and Copy.ai": "Jasper اور Copy.ai",
    "Canva and InVideo": "Canva اور InVideo",
    "Synthesia and Descript": "Synthesia اور Descript",

    "What is the estimated earning potential mentioned for AI freelancing?": "AI فری لانسنگ کے لیے مذکور متوقع آمدنی کی صلاحیت کیا ہے؟",
    "$50-100/month": "ماہانہ $50-100",
    "$100-500/month": "ماہانہ $100-500",
    "$500-1000/month": "ماہانہ $500-1000",
    "$1000-5000/month": "ماہانہ $1000-5000",

    "Which platform was mentioned for selling AI-generated designs?": "AI سے بنے ڈیزائن بیچنے کے لیے کون سا پلیٹ فارم بتایا گیا؟",
    "Amazon": "Amazon",
    "eBay": "eBay",
    "Fiverr": "Fiverr",
    "Shopify": "Shopify",

    "How many AI tools are covered in the complete course?": "مکمل کورس میں کتنے AI ٹولز شامل ہیں؟",
    "15+ tools": "15+ ٹولز",
    "20+ tools": "20+ ٹولز",
    "25+ tools": "25+ ٹولز",
    "30+ tools": "30+ ٹولز",

    "What is the main advantage of using AI for online earning?": "آن لائن کمانے کے لیے AI استعمال کرنے کا اہم فائدہ کیا ہے؟",
    "No skills required": "کوئی مہارت درکار نہیں",
    "Automation and efficiency": "خودکاری اور کارکردگی",
    "Guaranteed income": "مضمون آمدنی",
    "No competition": "کوئی مقابلہ نہیں",

    // Module 2 Questions
    "What is the main benefit of content creation mentioned in Module 2?": "ماڈیول 2 میں مذکور مواد تخلیق کا اہم فائدہ کیا ہے؟",
    "It's easy to do": "یہ آسان ہے",
    "Content is King Online": "آن لائن مواد بادشاہ ہے",
    "It requires no investment": "اس میں سرمایہ کاری کی ضرورت نہیں",
    "It's automated": "یہ خودکار ہے",

    "Which tool is mentioned for SEO-optimized content creation?": "SEO کے لیے بہتر مواد بنانے کے لیے کون سا ٹول بتایا گیا؟",
    "Canva": "Canva",
    "MidJourney": "MidJourney",
    "Jasper AI": "Jasper AI",
    "Synthesia": "Synthesia",

    "What type of content can help build brand authority?": "کون سا مواد برانڈ کی اتھارٹی بنانے میں مدد کر سکتا ہے؟",
    "Random posts": "بے ترتیب پوسٹس",
    "SEO-optimized articles": "SEO کے لیے بہتر مضامین",
    "Personal photos": "ذاتی تصاویر",
    "Product reviews only": "صرف پروڈکٹ ریویوز",

    "How can content creators monetize their work?": "مواد بنانے والے اپنے کام کو کیسے منیٹائز کر سکتے ہیں؟",
    "Sponsorships only": "صرف اسپانسرشپ",
    "Ads only": "صرف اشتہارات",
    "Sponsorships and brand partnerships": "اسپانسرشپ اور برانڈ پارٹنرشپ",
    "Selling products only": "صرف پروڈکٹس بیچنا",

    "What is Copy.ai primarily used for?": "Copy.ai بنیادی طور پر کس کے لیے استعمال ہوتا ہے؟",
    "Image generation": "تصاویر بنانا",
    "Video editing": "ویڈیو ایڈٹنگ",
    "AI copywriting": "AI کاپی رائٹنگ",
    "Social media scheduling": "سوشل میڈیا شیڈولنگ",

    // Module 3 Questions
    "What type of content can Synthesia create?": "Synthesia کون سا مواد بنا سکتا ہے؟",
    "Text articles": "متنی مضامین",
    "AI avatar videos": "AI اوتار ویڈیوز",
    "Social media graphics": "سوشل میڈیا گرافکس",
    "Audio podcasts": "آڈیو پوڈکاسٹس",

    "What is Descript primarily used for?": "Descript بنیادی طور پر کس کے لیے استعمال ہوتا ہے؟",
    "Creating avatars": "اوتار بنانا",
    "Writing content": "مواد لکھنا",
    "Text-based video editing": "متن پر مبنی ویڈیو ایڈٹنگ",
    "Generating images": "تصاویر بنانا",

    "What's the earning potential for freelance video projects?": "فری لانس ویڈیو پروجیکٹس کی آمدنی کی صلاحیت کیا ہے؟",
    "$10-50 per project": "فی پروجیکٹ $10-50",
    "$20-200 per project": "فی پروجیکٹ $20-200",
    "$200-500 per project": "فی پروجیکٹ $200-500",
    "$500-1000 per project": "فی پروجیکٹ $500-1000",

    "Which tool helps with professional video editing?": "کون سا ٹول پیشہ ورانہ ویڈیو ایڈٹنگ میں مدد کرتا ہے؟",
    "InVideo": "InVideo",
    "ChatGPT": "ChatGPT",
    "MidJourney": "MidJourney",
    "Jasper AI": "Jasper AI",

    "What makes AI video creation accessible to beginners?": "AI ویڈیو بنانا ابتدائی افراد کے لیے کیا آسان بناتا ہے؟",
    "No learning required": "سیکھنے کی ضرورت نہیں",
    "Text-to-video conversion": "متن سے ویڈیو میں تبدیلی",
    "Free tools only": "صرف مفت ٹولز",
    "Automatic editing": "خودکار ایڈٹنگ",

    // Module 4 Questions
    "Which platform is recommended for AI-powered e-commerce?": "AI سے چلنے والی ای کامرس کے لیے کون سا پلیٹ فارم تجویز ہے؟",
    "WordPress": "WordPress",
    "Shopify": "Shopify",
    "Wix": "Wix",
    "Squarespace": "Squarespace",

    "What's the monthly earning potential for e-commerce?": "ای کامرس کی ماہانہ آمدنی کی صلاحیت کیا ہے؟",
    "$100-500/month": "ماہانہ $100-500",
    "$500-2000/month": "ماہانہ $500-2000",
    "$2000-5000/month": "ماہانہ $2000-5000",
    "$5000+/month": "ماہانہ $5000+",

    "How does AI enhance e-commerce sales?": "AI ای کامرس کی فروخت کو کیسے بہتر بناتا ہے؟",
    "Product recommendations": "پروڈکٹ کی سفارشات",
    "Automated marketing": "خودکار مارکیٹنگ",
    "Customer service": "کسٹمر سروس",
    "All of the above": "اوپر کے تمام",

    "What advantage does e-commerce offer?": "ای کامرس کیا فائدہ فراہم کرتا ہے؟",
    "Local market only": "صرف مقامی مارکیٹ",
    "Global market access": "عالمی مارکیٹ تک رسائی",
    "Limited products": "محدود پروڈکٹس",
    "High startup costs": "زیادہ ابتدائی لاگت",

    "Which AI feature helps with product research?": "کون سی AI خصوصیت پروڈکٹ ریسرچ میں مدد کرتی ہے؟",
    "Product Research AI": "پروڈکٹ ریسرچ AI",
    "Content AI": "Content AI",
    "Video AI": "Video AI",
    "Social AI": "Social AI",

    // Module 5 Questions
    "Which tool is mentioned for social media scheduling?": "سوشل میڈیا شیڈولنگ کے لیے کون سا ٹول بتایا گیا؟",
    "Buffer": "Buffer",
    "Canva": "Canva",
    "ChatGPT": "ChatGPT",
    "InVideo": "InVideo",

    "What's the earning potential for social media management?": "سوشل میڈیا منیجمنٹ کی آمدنی کی صلاحیت کیا ہے؟",
    "$50-200/month": "ماہانہ $50-200",
    "$200-1000/month": "ماہانہ $200-1000",
    "$1000-2000/month": "ماہانہ $1000-2000",
    "$2000+/month": "ماہانہ $2000+",

    "What does Predis AI specialize in?": "Predis AI کس میں مہارت رکھتا ہے؟",
    "Video editing": "ویڈیو ایڈٹنگ",
    "Social media content": "سوشل میڈیا مواد",
    "Email marketing": "ای میل مارکیٹنگ",
    "SEO optimization": "SEO بہتری",

    "How does AI improve social media management?": "AI سوشل میڈیا منیجمنٹ کو کیسے بہتر بناتا ہے؟",
    "Smart scheduling": "ہوشمند شیڈولنگ",
    "Analytics insights": "تجزیاتی بصیرت",
    "Content automation": "مواد کی خودکاری",
    "All of the above": "اوپر کے تمام",

    "Which platform offers comprehensive social media management?": "کون سا پلیٹ فارم جامع سوشل میڈیا منیجمنٹ فراہم کرتا ہے؟",
    "Hootsuite": "Hootsuite",
    "InVideo": "InVideo",
    "Synthesia": "Synthesia",
    "Jasper AI": "Jasper AI",

    // Module 6 Questions
    "What is the earning range mentioned for content writing services?": "مواد لکھنے کی خدمات کے لیے مذکور آمدنی کی رینج کیا ہے؟",
    "$5-20": "$5-20",
    "$20-100": "$20-100",
    "$100-200": "$100-200",
    "$200-500": "$200-500",

    "How much can graphic design projects earn?": "گرافک ڈیزائن کے پروجیکٹس کتنا کما سکتے ہیں؟",
    "$10-50": "$10-50",
    "$30-150": "$30-150",
    "$150-300": "$150-300",
    "$300-500": "$300-500",

    "What's the project earning range for freelancing?": "فری لانسنگ کے لیے پروجیکٹ کی آمدنی کی رینج کیا ہے؟",
    "$25-250/project": "فی پروجیکٹ $25-250",
    "$50-500/project": "فی پروجیکٹ $50-500",
    "$100-1000/project": "فی پروجیکٹ $100-1000",
    "$200-2000/project": "فی پروجیکٹ $200-2000",

    "How does AI help freelancers scale their business?": "AI فری لانسرز کو اپنا کاروبار بڑھانے میں کیسے مدد کرتا ہے؟",
    "Automation tools": "خودکاری کے ٹولز",
    "Faster delivery": "تیز ڈیلیوری",
    "Better quality": "بہتر معیار",
    "All of the above": "اوپر کے تمام",

    "What type of AI tools help with project management?": "کون سے AI ٹولز پروجیکٹ منیجمنٹ میں مدد کرتے ہیں؟",
    "Writing tools only": "صرف لکھنے کے ٹولز",
    "Design tools only": "صرف ڈیزائن کے ٹولز",
    "Project Management AI": "پروجیکٹ منیجمنٹ AI",
    "Video tools only": "صرف ویڈیو ٹولز",

    // Module 7 Questions
    "What is the hourly rate mentioned for online tutoring?": "آن لائن ٹیوٹرنگ کے لیے مذکور فی گھنٹہ ریٹ کیا ہے؟",
    "$10-50/hour": "فی گھنٹہ $10-50",
    "$20-100/hour": "فی گھنٹہ $20-100",
    "$50-150/hour": "فی گھنٹہ $50-150",
    "$100-200/hour": "فی گھنٹہ $100-200",

    "What advantage does online tutoring offer?": "آن لائن ٹیوٹرنگ کیا فائدہ فراہم کرتا ہے؟",
    "Local students only": "صرف مقامی طلباء",
    "Global student access": "عالمی طلباء تک رسائی",
    "Limited subjects": "محدود مضامین",
    "Fixed schedules": "مقرر وقت",

    "How does AI enhance the learning experience?": "AI سیکھنے کے تجربے کو کیسے بہتر بناتا ہے؟",
    "Personalized content": "ذاتی مواد",
    "Automated grading": "خودکار گریڈنگ",
    "Interactive lessons": "انٹرایکٹو اسباق",
    "All of the above": "اوپر کے تمام",

    "What makes online tutoring a scalable business?": "آن لائن ٹیوٹرنگ کو ایک قابل توسیع کاروبار کیا بناتا ہے؟",
    "One-on-one only": "صرف ایک پر ایک",
    "Group sessions and courses": "گروپ سیشن اور کورسز",
    "Limited hours": "محدود گھنٹے",
    "Single subject focus": "ایک مضمون پر توجہ",

    "Which AI tools help with course creation?": "کون سے AI ٹولز کورس بنانے میں مدد کرتے ہیں؟",
    "Course Creation AI": "کورس کریشن AI",
    "Video AI": "Video AI",
    "Content AI": "Content AI",
    "All of the above": "اوپر کے تمام",

    // Module 8 Questions
    "What type of business model is affiliate marketing?": "ایفلیٹ مارکیٹنگ کیا قسم کا کاروباری ماڈل ہے؟",
    "Active income": "فعال آمدنی",
    "Passive income": "غیر فعال آمدنی",
    "Freelance work": "فری لانس کام",
    "Product sales": "پروڈکٹ کی فروخت",

    "What's the monthly earning potential for affiliate marketing?": "ایفلیٹ مارکیٹنگ کی ماہانہ آمدنی کی صلاحیت کیا ہے؟",
    "$100-1000/month": "ماہانہ $100-1000",
    "$500-3000/month": "ماہانہ $500-3000",
    "$1000-5000/month": "ماہانہ $1000-5000",
    "$3000+/month": "ماہانہ $3000+",

    "How does AI improve affiliate marketing results?": "AI ایفلیٹ مارکیٹنگ کے نتائج کو کیسے بہتر بناتا ہے؟",
    "Better analytics": "بہتر تجزیات",
    "Content optimization": "مواد کی بہتری",
    "Audience targeting": "سامعین کو نشانہ بنانا",
    "All of the above": "اوپر کے تمام",

    "What advantage does affiliate marketing offer?": "ایفلیٹ مارکیٹنگ کیا فائدہ فراہم کرتا ہے؟",
    "Global opportunities": "عالمی مواقع",
    "Local market only": "صرف مقامی مارکیٹ",
    "Limited products": "محدود پروڈکٹس",
    "High startup costs": "زیادہ ابتدائی لاگت",

    "Which AI tools help optimize affiliate campaigns?": "کون سے AI ٹولز ایفلیٹ مہمات کو بہتر بنانے میں مدد کرتے ہیں؟",
    "Analytics AI": "Analytics AI",
    "Content AI": "Content AI",
    "Tracking AI": "Tracking AI",
    "All of the above": "اوپر کے تمام"
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