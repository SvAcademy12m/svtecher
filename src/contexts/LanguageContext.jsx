import React, { createContext, useContext, useState, useCallback } from 'react';

const translations = {
  en: {
    // Nav
    home: 'Home', services: 'Services', courses: 'Courses', jobs: 'Jobs',
    blog: 'Blog', about: 'About', contact: 'Contact', signIn: 'Sign In',
    signOut: 'Sign Out', getStarted: 'Get Started', dashboard: 'Dashboard',

    // Hero
    heroTag: "Your Tech Training Partner in Ethiopia",
    heroTitle1: 'Build Your Future in',
    heroTitle2: 'Tech',
    heroDesc: 'SVTech helps you learn tech skills, get certified, and find great job opportunities.',
    exploreCourses: 'Explore Courses', ourServices: 'Our Services',

    // Stats
    happyStudents: 'Happy Students', projectsDelivered: 'Projects Delivered',
    businessPartners: 'Business Partners', trainingPrograms: 'Training Programs',

    // Services
    whatWeDo: 'What We Do', techSolutions: 'Technology Solutions & Services',
    webDev: 'Web Development', webDevDesc: 'Modern, responsive websites and web applications built with cutting-edge technology.',
    appDev: 'App Development', appDevDesc: 'Native and cross-platform mobile applications for iOS and Android.',
    techTraining: 'Tech Training', techTrainingDesc: 'Professional training programs in software development, design, and IT.',
    cybersecurity: 'Cybersecurity', cybersecurityDesc: 'Network security, penetration testing, and compliance consulting.',
    dataAnalytics: 'Data & Analytics', dataAnalyticsDesc: 'Business intelligence, data visualization, and insights-driven consulting.',
    itConsulting: 'IT Consulting', itConsultingDesc: 'Strategic technology planning, infrastructure, and digital transformation.',
    digitalProducts: 'Digital Products', digitalProductsDesc: 'Sell web apps, mobile apps, templates, and digital assets on our marketplace.',
    accounting: 'Accounting & Finance', accountingDesc: 'Modern cloud accounting, bookkeeping, and financial consulting services.',

    // Courses
    learnGrow: 'Learn & Grow', popularCourses: 'Popular Courses', viewAll: 'View All',
    allCourses: 'All Courses', enrollNow: 'Enroll Now', noCoursesYet: 'No courses available yet.',

    // Jobs
    careerPortal: 'Career Portal', jobOpportunities: 'Job Opportunities',
    allJobs: 'All Jobs', applyNow: 'Apply Now', noJobsYet: 'No open positions at the moment.',

    // Blog
    techBlog: 'Tech Blog & Articles', blogDesc: 'Insights, tutorials, and news from the tech world',

    // Testimonials
    testimonials: 'Testimonials', whatClientsSay: 'What Our Clients Say',

    // CTA
    readyStart: 'Ready to Get Started?',
    ctaDesc: 'Join thousands of students and professionals who trust SVTech for their technology journey.',
    startLearning: 'Start Learning', contactUs: 'Contact Us',

    // Auth
    welcomeBack: 'Welcome Back', signInAccount: 'Sign in to your SVTech account',
    joinSvtech: 'Join SVTech', startJourney: 'Start your technology journey',
    fullName: 'Full Name', email: 'Email', password: 'Password',
    iAmA: 'I am a', createAccount: 'Create Account', orContinueWith: 'or continue with',
    dontHaveAccount: "Don't have an account?", alreadyHaveAccount: 'Already have an account?',
    signUpNow: 'Sign Up', logIn: 'Log In',

    // Dashboard Admin
    adminConsole: 'Admin Panel', overview: 'Overview', users: 'Users',
    management: 'Management',
    transactions: 'Transactions', referrals: 'Referrals', payments: 'Payments',
    webApps: 'Web & Apps', totalUsers: 'Total Users', activeCourses: 'Active Courses',
    activeJobs: 'Active Jobs', totalRevenue: 'Total Revenue', blogPosts: 'Blog Posts',
    recentUsers: 'Recent Users', recentPosts: 'Recent Posts',
    user_demographics: 'Our Users', growth_metrics: 'Growth Stats',
    job_metrics: 'Job Stats', platform_intelligence: 'Dashboard',
    total_applications: 'Total Applications', no_data_found: 'No Data Found',
    students: 'Students', teachers: 'Instructors', buyers: 'Buyers', sellers: 'Sellers',
    addCourse: 'Add Course', postJob: 'Post Job', newPost: 'New Post',
    edit: 'Edit', delete: 'Delete', publish: 'Publish', unpublish: 'Unpublish',
    search: 'Search', noResults: 'No results found',
    user_management: 'Manage Users', content_curriculum: 'Courses & Lessons',
    labor_market: 'Jobs & Careers', finance_growth: 'Earnings & Growth',
    all_users: 'All Users',
    job_owners: 'Job Owners', websites: 'Websites', job_listings: 'Job Listings',
    job_management: 'Job Management', course_management: 'Course Management',
    maintenance_mode: 'Maintenance Mode', security: 'Security',
    vulnerability_scan: 'Security Scan', system_health: 'System Health',
    change_password: 'Change Password', master_password: 'Master Password',
    open_display: 'Open Front Page', close_display: 'Close Front Page',
    terminateSession: 'Sign Out',
    superAdmin: 'Super Admin',
    chat: 'Messages',
    support: 'Support',
    settings: 'Settings',
    finance: 'Finance',
    system: 'System',
    content: 'Content',
    income: 'Income',
    expenses: 'Expenses',
    liabilities: 'Liabilities',
    netProfit: 'Net Profit',
    supportStatus: 'Support Status',
    activeTickets: 'Active Tickets',
    resolvedTickets: 'Resolved Tickets',
    financialOverview: 'Financial Overview',

    // Transaction & Referral
    transactionHistory: 'Transaction History', amount: 'Amount',
    status: 'Status', date: 'Date', type: 'Type', pending: 'Pending',
    completed: 'Completed', failed: 'Failed', withdrawal: 'Withdrawal',
    deposit: 'Deposit', referralCode: 'Referral Code', referredUsers: 'Referred Users',
    totalEarnings: 'Total Earnings', withdrawable: 'Available to Withdraw', withdrawFunds: 'Withdraw Funds',
    referralRate: 'Referral Rate (10%)', referralDesc: 'Earn 10% commission on every referred user\'s payment.',

    // Payment
    paymentVerification: 'Payment Verification',
    paymentPanel: 'Payments',
    approvePayment: 'Approve',
    declinePayment: 'Decline',
    paymentPending: 'Waiting',
    paymentApproved: 'Approved',
    paymentDeclined: 'Declined',
    noPaymentsFound: 'No Payments Found',
    paymentQueueEmpty: 'There are no payments in this category.',
    transactionRef: 'Transaction Reference',
    submissionDate: 'Submitted On',
    paymentSource: 'Payment Method',

    // Student Dashboard
    studentDashboard: 'Student Portal', myCourses: 'My Courses',
    enrolledCourses: 'My Classes', progress: 'Progress', certificates: 'Certificates',
    browseCourses: 'Find Courses', noCoursesEnrolled: 'No courses yet',

    // Job Finder Dashboard
    careerDashboard: 'Career Portal', applications: 'Applications',
    openJobs: 'Open Jobs', profileStrength: 'Profile Strength', cvStatus: 'CV Status',
    uploadCv: 'Upload CV', updateCv: 'Update CV',

    // Footer
    platform: 'Platform', company: 'Company',
    aboutUs: 'About Us', helpCenter: 'Help Center', termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy Policy', allRightsReserved: 'All rights reserved.',
    footerDesc: 'Empowering the next generation of tech professionals through world-class training, consulting, and career opportunities.',

    // Currency
    currency: 'Currency', usd: 'USD', etb: 'ETB',

    // Common
    loading: 'Please wait...', save: 'Save', cancel: 'Cancel', confirm: 'Confirm',
    language: 'Language', english: 'English', amharic: 'Amharic',
    goToDashboard: 'Go to Dashboard',
    editProfile: 'Edit Profile',
    logout: 'Sign Out',
    contactTitle: "LET'S CONNECT",
    contactDesc: 'NEED ELITE SOFTWARE TRAINING OR PREMIUM IT SUPPORT? OUR TEAM IS READY TO POWERS YOUR DIGITAL CORE.',
    responseTime: 'RESPONSE TIME: < 24HRS',
    responseDesc: 'WE TAKE EVERY INQUIRY SERIOUSLY. WHETHER IT\'S A CORPORATE TRAINING CONTRACT OR A CRITICAL SERVER REPAIR, OUR TEAM RESPONDS PROMPTLY.',
    sendMessage: 'Send a Message',
    instantSupport: 'Instant Support',
    messageSent: 'Message Sent!',
    sendAnother: 'Send Another',
    officialBarcode: 'Official Contact Barcode',
    scanForDetails: 'Scan for SVTech Digital Details',
    subject: 'Subject',
    message: 'Message',
    sendButton: 'Send Message',
    referralSystem: 'Referral System',
    callUs: 'Call Us',
    location: 'Location',
    peachtree: 'Peachtree (FRS)',
    quickbooks: 'QuickBooks',
    compMaintenance: 'Computer Maintenance',
    tvMaintenance: 'TV Maintenance',
    graphics: 'Graphics Design',
    videoEditing: 'Video Editing',
    verifiedBy: 'Verified By',
    principalDirector: 'Samuel Tegegn',
  },
  am: {
    // Nav
    home: 'ዋና ገጽ', services: 'አገልግሎቶች', courses: 'ኮርሶች', jobs: 'ስራዎች',
    blog: 'ብሎግ', about: 'ስለ እኛ', contact: 'አግኙን', signIn: 'ግባ',
    signOut: 'ውጣ', getStarted: 'ጀምር', dashboard: 'ዳሽቦርድ',

    // Hero
    heroTag: 'የኢትዮጵያ ቁንጮ የቴክ ስልጠና አጋር',
    heroTitle1: 'የወደፊትህን ግንባ በ',
    heroTitle2: 'ቴክኖሎጂ',
    heroDesc: 'SVTech ቀጣዩን ትውልድ የቴክ ባለሙያዎች ያበረታታል በዓለም ደረጃ ስልጠና፣ ማማከር እና የሥራ ዕድሎች።',
    exploreCourses: 'ኮርሶችን ያስሱ', ourServices: 'አገልግሎቶቻችን',

    // Stats
    happyStudents: 'ደስተኛ ተማሪዎች', projectsDelivered: 'የተጠናቀቁ ፕሮጀክቶች',
    businessPartners: 'የንግድ አጋሮች', trainingPrograms: 'የስልጠና ፕሮግራሞች',

    // Services
    whatWeDo: 'ምን እናደርጋለን', techSolutions: 'የቴክኖሎጂ መፍትሄዎች እና አገልግሎቶች',
    webDev: 'ድረ-ገጽ ልማት', webDevDesc: 'ዘመናዊ፣ ምላሽ ሰጪ ድረ-ገጾች በቴክኖሎጂ።',
    appDev: 'መተግበሪያ ልማት', appDevDesc: 'የሞባይል መተግበሪያዎች ለ iOS እና Android።',
    techTraining: 'ስልጠና', techTrainingDesc: 'ሙያዊ ስልጠና ፕሮግራሞች በሶፍትዌር ልማት።',
    cybersecurity: 'ሳይበር ደህንነት', cybersecurityDesc: 'የአውታረ መረብ ደህንነት ማማከር።',
    dataAnalytics: 'ዳታ ትንታኔ', dataAnalyticsDesc: 'የቢዝነስ ኢንተሊጀንስ ማማከር።',
    itConsulting: 'አይቲ ማማከር', itConsultingDesc: 'ስትራቴጂክ የቴክኖሎጂ ማማከር።',
    digitalProducts: 'ዲጂታል ምርቶች', digitalProductsDesc: 'ድረ-ገጾችን፣ መተግበሪያዎችን እና ቅንጅቶችን ይሽጡ።',
    accounting: 'ሒሳብ አያያዝ', accountingDesc: 'ዘመናዊ ደመና ሒሳብ አያያዝ አገልግሎት።',

    // Courses
    learnGrow: 'ተማር እና ያድጉ', popularCourses: 'ታዋቂ ኮርሶች', viewAll: 'ሁሉንም ይመልከቱ',
    allCourses: 'ሁሉም ኮርሶች', enrollNow: 'አሁን ተመዝገብ', noCoursesYet: 'ገና ኮርሶች የሉም።',

    // Jobs
    careerPortal: 'የሥራ ፖርታል', jobOpportunities: 'የሥራ ዕድሎች',
    allJobs: 'ሁሉም ስራዎች', applyNow: 'አሁን ያመልክቱ', noJobsYet: 'ለጊዜው ክፍት ቦታ የለም።',

    // Blog
    techBlog: 'የቴክ ብሎግ', blogDesc: 'ግንዛቤዎች እና ዜናዎች ከቴክ ዓ ለም',

    // Testimonials
    testimonials: 'ምስክርነቶች', whatClientsSay: 'ደንበኞቻችን ምን ይላሉ',

    // CTA
    readyStart: 'ለመጀመር ዝግጁ ነዎት?',
    ctaDesc: 'SVTech ን ለቴክኖሎጂ ጉዞአቸው ከሚያምኑ ሺዎች ተማሪዎች ጋር ይቀላቀሉ።',
    startLearning: 'መማር ጀምር', contactUs: 'አግኙን',

    // Auth
    welcomeBack: 'እንኳን ደህና መጡ', signInAccount: 'ወደ SVTech መለያዎ ይግቡ',
    joinSvtech: 'SVTech ይቀላቀሉ', startJourney: 'የቴክኖሎጂ ጉዞዎን ይጀምሩ',
    fullName: 'ሙሉ ስም', email: 'ኢሜይል', password: 'የይለፍ ቃል',
    iAmA: 'እኔ ነኝ', createAccount: 'መለያ ፍጠር', orContinueWith: 'ወይም ቀጥል በ',
    dontHaveAccount: 'መለያ የለዎትም?', alreadyHaveAccount: 'አስቀድመው መለያ አለዎት?',
    signUpNow: 'ተመዝገብ', logIn: 'ግባ',

    // Dashboard Admin
    adminConsole: 'አስተዳደር ፓነል', overview: 'አጠቃላይ', users: 'ተጠቃሚዎች',
    management: 'አስተዳደር',
    transactions: 'ግብይቶች', referrals: 'ሪፈራሎች', payments: 'ክፍያዎች',
    webApps: 'ድረ-ገጽ / መተግበሪያ', totalUsers: 'ጠቅላላ ተጠቃሚዎች', activeCourses: 'ንቁ ኮርሶች',
    activeJobs: 'ንቁ ስራዎች', totalRevenue: 'ጠቅላላ ገቢ', blogPosts: 'ብሎግ ጽሑፎች',
    recentUsers: 'የቅርብ ተጠቃሚዎች', recentPosts: 'የቅርብ ጽሑፎች',
    user_demographics: 'ተጠቃሚ ስነ-ህዝብ', growth_metrics: 'የእድገት መለኪያዎች',
    job_metrics: 'የስራ መለኪያዎች', platform_intelligence: 'የመድረክ አጠቃላይ',
    total_applications: 'ጠቅላላ ማመልከቻዎች', no_data_found: 'ምንም መረጃ አልተገኘም',
    students: 'ተማሪዎች', teachers: 'አስተማሪዎች', buyers: 'ገዢዎች', sellers: 'ሻጮች',
    addCourse: 'ኮርስ ጨምር', postJob: 'ሥራ ለጥፍ', newPost: 'አዲስ ጽሑፍ',
    edit: 'አስተካክል', delete: 'ሰርዝ', publish: 'አሳትም', unpublish: 'አትቅረጽ',
    search: 'ፈልግ', noResults: 'ውጤት አልተገኘም',
    user_management: 'የተጠቃሚ አስተዳደር', content_curriculum: 'ይዘት እና ስርአተ ትምህርት',
    labor_market: 'የሥራ ገበያ', finance_growth: 'ፋይናንስ እና እድገት',
    all_users: 'ሁሉም ተጠቃሚዎች',
    job_owners: 'የሥራ ባለቤቶች', websites: 'ድረ-ገጾች', job_listings: 'የሥራ ዝርዝሮች',
    job_management: 'የስራ አስተዳደር', course_management: 'የኮርስ አስተዳደር',
    maintenance_mode: 'የጥገና ሁኔታ', security: 'ደህንነት',
    vulnerability_scan: 'የደህንነት ፍተሻ', system_health: 'የስርዓት ጤና',
    change_password: 'የይለፍ ቃል ቀይር', master_password: 'ዋና የይለፍ ቃል',
    open_display: 'ዋናውን ገጽ ክፈት', close_display: 'ዋናውን ገጽ ዝጋ',
    terminateSession: 'ውጣ',
    superAdmin: 'ዋና አስተዳዳሪ',
    chat: 'መልእክቶች',
    support: 'ድጋፍ',
    settings: 'ቅንብሮች',
    finance: 'ፋይናንስ',
    system: 'ስርዓት',
    content: 'ይዘት',
    income: 'ገቢ',
    expenses: 'ወጪ',
    liabilities: 'ዕዳዎች',
    netProfit: 'የተጣራ ትርፍ',
    supportStatus: 'የድጋፍ ሁኔታ',
    activeTickets: 'ንቁ ጥያቄዎች',
    resolvedTickets: 'የተፈቱ ጥያቄዎች',
    financialOverview: 'የፋይናንስ አጠቃላይ እይታ',

    // Transaction & Referral
    transactionHistory: 'የግብይት ታሪክ', amount: 'መጠን',
    status: 'ሁኔታ', date: 'ቀን', type: 'ዓይነት', pending: 'በጥበቃ ላይ',
    completed: 'ተጠናቅቋል', failed: 'አልተሳካም', withdrawal: 'ማውጣት',
    deposit: 'ማስቀመጥ', referralCode: 'ሪፈራል ኮድ', referredUsers: 'የተጋበዙ ተጠቃሚዎች',
    totalEarnings: 'ጠቅላላ ገቢ', withdrawable: 'ሊወጣ የሚችል', withdrawFunds: 'ገንዘብ ያውጡ',
    referralRate: 'የሪፈራል ምጣኔ (10%)', referralDesc: 'በእያንዳንዱ ሪፈራል ክፍያ 10% ኮሚሽን ያገኛሉ።',

    // Payment
    paymentVerification: 'የክፍያ ማረጋገጫ',
    paymentPanel: 'ክፍያዎች',
    approvePayment: 'አፅድቅ',
    declinePayment: 'ውድቅ',
    paymentPending: 'በጥበቃ ላይ',
    paymentApproved: 'ጸድቋል',
    paymentDeclined: 'ውድቅ ሆኗል',
    noPaymentsFound: 'ምንም ክፍያ አልተገኘም',
    paymentQueueEmpty: 'በዚህ ምድብ ምንም ክፍያ የለም።',
    transactionRef: 'የግብይት ተመሳሳሽ',
    submissionDate: 'የቀረበ ቀን',
    paymentSource: 'የክፍያ ዘዴ',

    // Student Dashboard
    studentDashboard: 'የተማሪ ዳሽቦርድ', myCourses: 'ኮርሶቼ',
    enrolledCourses: 'የተመዘገቡ ኮርሶች', progress: 'ሂደት', certificates: 'የምስክር ወረቀቶች',
    browseCourses: 'ኮርሶችን ያስሱ', noCoursesEnrolled: 'ገና ኮርስ አልተመዘገቡም',

    // Job Finder
    careerDashboard: 'የሥራ ፖርታል', applications: 'ማመልከቻዎች',
    openJobs: 'ክፍት ስራዎች', profileStrength: 'የመገለጫ ጥንካሬ', cvStatus: 'CV ሁኔታ',
    uploadCv: 'CV ጫን', updateCv: 'CV አዘምን',

    // Footer
    platform: 'መድረክ', company: 'ኩባንያ',
    aboutUs: 'ስለ እኛ', helpCenter: 'የእገዛ ማዕከል', termsOfService: 'የአገልግሎት ውል',
    privacyPolicy: 'የግላዊነት ፖሊሲ', allRightsReserved: 'መብቶች በሙሉ የተጠበቁ ናቸው።',
    footerDesc: 'ቀጣዩን ትውልድ የቴክ ባለሙያዎች የሚያበረታታ ስልጠና እና ማማከር።',

    // Currency
    currency: 'ምንዛሪ', usd: 'ዶላር', etb: 'ብር',

    // Common
    loading: 'እባክዎ ይጠብቁ...', save: 'አስቀምጥ', cancel: 'ሰርዝ', confirm: 'አረጋግጥ',
    language: 'ቋንቋ', english: 'English', amharic: 'አማርኛ',
    goToDashboard: 'ወደ ዳሽቦርድ',
    editProfile: 'መገለጫ አስተካክል',
    logout: 'ውጣ',
    contactTitle: 'እንገናኝ',
    contactDesc: 'ምርጥ የሶፍትዌር ስልጠና ወይም ከፍተኛ የአይቲ ድጋፍ ይፈልጋሉ? ቡድናችን ዝግጁ ነው።',
    responseTime: 'የምላሽ ጊዜ፡ < 24 ሰዓታት',
    responseDesc: 'እያንዳንዱን ጥያቄ በቁም ነገር እንመለከተዋለን። የድርጅት ስልጠናም ይሁን የአገልጋይ ጥገና ቡድናችን በፍጥነት ምላሽ ይሰጣል።',
    sendMessage: 'መልዕክት ይላኩ',
    instantSupport: 'ፈጣን ድጋፍ',
    messageSent: 'መልዕክት ተልኳል!',
    sendAnother: 'ሌላ ይላኩ',
    officialBarcode: 'ይፋዊ የመገናኛ ባርኮድ',
    scanForDetails: 'ለ SVTech ዲጂታል ዝርዝሮች ይቃኙ',
    subject: 'ርዕስ',
    message: 'መልዕክት',
    sendButton: 'መልዕክት ላክ',
    referralSystem: 'የሪፈራል ስርዓት',
    callUs: 'በስልክ ያግኙን',
    location: 'አድራሻ',
    peachtree: 'ፒችትሪ (Peachtree)',
    quickbooks: 'ኩዊክ ቡክስ',
    compMaintenance: 'የኮምፒውተር ጥገና',
    tvMaintenance: 'የቲቪ ጥገና',
    graphics: 'ግራፊክስ ዲዛይን',
    videoEditing: 'ቪዲዮ ኤዲቲንግ',
    verifiedBy: 'የተረጋገጠው በ',
    principalDirector: 'ሳሙኤል ተገኝ',
  },
};

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('svtech_lang') || 'en');

  const t = useCallback((key) => {
    return translations[lang]?.[key] || translations.en?.[key] || key;
  }, [lang]);

  const toggleLanguage = useCallback(() => {
    const next = lang === 'en' ? 'am' : 'en';
    setLang(next);
    localStorage.setItem('svtech_lang', next);
  }, [lang]);

  const setLanguage = useCallback((newLang) => {
    setLang(newLang);
    localStorage.setItem('svtech_lang', newLang);
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
