'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Language = 'en' | 'ar';

export interface Translations {
  // Navigation & General
  brand: string;
  brandTagline: string;
  roles: string;
  howItWorks: string;
  features: string;
  signIn: string;
  getStarted: string;
  createAccount: string;
  signOut: string;
  dashboard: string;
  cases: string;
  millingQueue: string;
  labDirectory: string;
  shippingQueue: string;
  overview: string;

  // Hero Section
  heroBadge: string;
  heroTitle1: string;
  heroTitle2: string;
  heroDescription: string;
  heroCreateBtn: string;
  heroSignInBtn: string;
  statConnectedRoles: string;
  statSharedRecord: string;
  statZeroLost: string;

  // Roles Section
  rolesSubtitle: string;
  rolesTitle: string;
  rolesDescription: string;
  dentistTitle: string;
  dentistDesc: string;
  dentistP1: string;
  dentistP2: string;
  dentistP3: string;
  dentistP4: string;
  labTitle: string;
  labDesc: string;
  labP1: string;
  labP2: string;
  labP3: string;
  labP4: string;
  shippingTitle: string;
  shippingDesc: string;
  shippingP1: string;
  shippingP2: string;
  shippingP3: string;
  shippingP4: string;

  // Process Steps
  processSubtitle: string;
  processTitle: string;
  processDescription: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  step4Title: string;
  step4Desc: string;

  // Features
  featuresSubtitle: string;
  featuresTitle: string;
  featuresDescription: string;
  feat1Title: string;
  feat1Desc: string;
  feat2Title: string;
  feat2Desc: string;
  feat3Title: string;
  feat3Desc: string;
  feat4Title: string;
  feat4Desc: string;
  feat5Title: string;
  feat5Desc: string;
  feat6Title: string;
  feat6Desc: string;

  // CTA & Footer
  ctaReady: string;
  ctaTitle: string;
  ctaDesc: string;
  footerRights: string;

  // Authentication (Login / Signup)
  loginTitle: string;
  loginSubtitle: string;
  identifierLabel: string;
  identifierPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  confirmPasswordLabel: string;
  confirmPasswordPlaceholder: string;
  passwordMismatchError: string;
  agreePolicyPrefix: string;
  privacyPolicyLink: string;
  policyRequiredError: string;
  phoneLabel: string;
  phonePlaceholder: string;
  nameLabel: string;
  namePlaceholder: string;
  usernameLabel: string;
  usernamePlaceholder: string;
  selectRole: string;
  clinicNameLabel: string;
  labNameLabel: string;
  companyNameLabel: string;
  turnaroundLabel: string;
  specialtiesLabel: string;
  selectedBadge: string;
  locationLabel: string;
  locationPlaceholder: string;
  locationHelp: string;
  openInMaps: string;
  authenticating: string;
  creatingAccount: string;
  createAccountBtn: string;
  haveAccount: string;
  needAccount: string;
  alreadyHaveAccount: string;
  signInHere: string;

  // Onboarding Questionnaire (Dentist vs Lab)
  onboardingTitle: string;
  onboardingSubtitle: string;
  qRoleTitle: string;
  qRoleDentistTitle: string;
  qRoleDentistDesc: string;
  qRoleLabTitle: string;
  qRoleLabDesc: string;
  qPracticeDetailsTitle: string;
  qLabDetailsTitle: string;
  qSpecialtiesTitle: string;
  qClinicalSpecialtyTitle: string;
  qTurnaroundTitle: string;
  qAddressTitle: string;
  qAddressPlaceholder: string;
  completeSetupBtn: string;
  savingWorkspace: string;

  // Email Verification
  checkEmailTitle: string;
  checkEmailBody: string;
  verifySuccessTitle: string;
  verifySuccessBody: string;
  verifyMissingToken: string;
  verifyFailed: string;
  resendVerification: string;
  resendSent: string;
  verifyCodePlaceholder: string;
  verifyCodeButton: string;
  verifyCodeLabel: string;
  verifyLinkLabel: string;

  // Dashboard & Workflows
  welcomeBack: string;
  dentistSubtitle: string;
  labSubtitle: string;
  shippingSubtitle: string;
  createNewCase: string;
  viewIncomingCases: string;
  openShippingQueue: string;
  totalCaseVolume: string;
  activePipeline: string;
  yourRolePrivilege: string;
  orgDetails: string;
  recentCases: string;
  viewAllCases: string;
  noCases: string;
  caseCode: string;
  assignedTo: string;
  statusPipeline: string;
  submissionDate: string;
  preferredLab: string;
  addressLocation: string;
  contactPhone: string;
  searchPlaceholder: string;
  preferredBadge: string;
  setAsPreferred: string;
}

export const DICTIONARY: Record<Language, Translations> = {
  en: {
    brand: 'Dentrio',
    brandTagline: 'Connected Dental Logistics Network',
    roles: 'Roles',
    howItWorks: 'How it works',
    features: 'Features',
    signIn: 'Sign In',
    getStarted: 'Get Started',
    createAccount: 'Create Account',
    signOut: 'Sign Out',
    dashboard: 'Dashboard',
    cases: 'Cases',
    millingQueue: 'Milling',
    labDirectory: 'Lab Directory',
    shippingQueue: 'Shipping Queue',
    overview: 'Overview',

    heroBadge: 'The Connected Dental Platform',
    heroTitle1: 'One platform.',
    heroTitle2: 'Three connected worlds.',
    heroDescription:
      'Dentrio connects dentists, dental labs, and shipping companies in one shared case workflow — built around in-browser 3D dental scan previews instead of lost emails and scattered files.',
    heroCreateBtn: 'Create Account',
    heroSignInBtn: 'Sign In',
    statConnectedRoles: 'Connected Roles',
    statSharedRecord: 'Shared Case Record',
    statZeroLost: 'Lost Attachments',

    rolesSubtitle: "Who it's for",
    rolesTitle: 'Built for every participant',
    rolesDescription: 'Each role sees exactly what they need — no more, no less.',
    dentistTitle: 'Dentist',
    dentistDesc:
      'Upload 3D scans, set structured prescriptions, preview models in-browser, approve designs, and track every case.',
    dentistP1: 'In-browser 3D scan viewer',
    dentistP2: 'Lab directory & selection',
    dentistP3: 'Case chat with photo uploads',
    dentistP4: '1-click design approval',
    labTitle: 'Dental Lab',
    labDesc:
      'Receive organized cases with scan files and prescriptions. Upload design proposals and advance production stages.',
    labP1: 'Full prescription specs',
    labP2: '3D inspection & rotation',
    labP3: 'Design file responses',
    labP4: 'Ready-for-pickup trigger',
    shippingTitle: 'Shipping',
    shippingDesc:
      'Privacy-separated view — see pickup and delivery addresses with Case ID only. No clinical data exposed.',
    shippingP1: 'Pickup confirmation',
    shippingP2: 'Tracking number assignment',
    shippingP3: 'Live delivery status',
    shippingP4: 'Automated case closing',

    processSubtitle: 'Process',
    processTitle: 'How it works',
    processDescription: 'From first scan to final delivery in four seamless steps.',
    step1Title: 'Create your account',
    step1Desc:
      'Sign up as a Dentist, Dental Lab, or Shipping company. Each role sees its own tailored workspace.',
    step2Title: 'Submit a dental case',
    step2Desc:
      'Upload the 3D scan (STL/PLY), fill in the structured prescription, and assign it to your preferred lab.',
    step3Title: 'Collaborate in real time',
    step3Desc:
      'Chat, share reference photos, review the CAD design, and approve or request revisions — all in one place.',
    step4Title: 'Track to the door',
    step4Desc:
      'The shipping partner picks up, enters tracking, and the case closes automatically on confirmed delivery.',

    featuresSubtitle: 'Capabilities',
    featuresTitle: 'Core Features',
    featuresDescription:
      'Everything that makes Dentrio the next-generation dental orchestration tool.',
    feat1Title: '3D In-Browser Preview',
    feat1Desc:
      'View, rotate, and inspect STL/PLY dental scans directly in your browser — no desktop software required.',
    feat2Title: 'Structured Prescriptions',
    feat2Desc:
      'Capture tooth number, restoration type, shade, material, and notes in one consistent digital form.',
    feat3Title: 'Case-Attached Chat',
    feat3Desc:
      'Every question, photo, and clarification stays attached directly to the specific case — zero lost emails.',
    feat4Title: 'Live Status Pipeline',
    feat4Desc:
      'From upload to delivery, one synchronized pipeline tells every participant exactly where a case stands.',
    feat5Title: 'Lab Response Files',
    feat5Desc:
      'Labs upload CAD designs and revisions back to the case thread before milling begins.',
    feat6Title: 'Privacy-Preserved Shipping',
    feat6Desc:
      'Couriers receive only the Case ID and addresses — clinical scans and patient data stay protected.',

    ctaReady: 'Ready?',
    ctaTitle: 'Streamline your dental workflow today.',
    ctaDesc:
      'Join Dentrio and connect your clinic or dental lab to a unified, privacy-first 3D pipeline.',
    footerRights: '© 2026 Dentrio. Connecting dental clinics, labs, and logistics.',

    loginTitle: 'Sign in to your account',
    loginSubtitle: 'Dental clinic, lab & logistics orchestration',
    identifierLabel: 'Username, Email, or Phone Number',
    identifierPlaceholder: 'e.g. user, user@email.com, or +1555...',
    passwordLabel: 'Password',
    passwordPlaceholder: '••••••••',
    confirmPasswordLabel: 'Confirm Password',
    confirmPasswordPlaceholder: '••••••••',
    passwordMismatchError: 'Passwords do not match. Please verify and try again.',
    agreePolicyPrefix: 'I have read and agree to the',
    privacyPolicyLink: 'Dentrio Global Privacy Policy & Data Agreement',
    policyRequiredError: 'You must review and agree to the Privacy Policy to create an account.',
    phoneLabel: 'Phone Number (11 digits) *',
    phonePlaceholder: '+1 (555) 000-0000',
    nameLabel: 'Full Name / Title *',
    namePlaceholder: 'e.g. Dr. John Smith',
    usernameLabel: 'Username *',
    usernamePlaceholder: 'e.g. dr_smith',
    selectRole: 'Select Your Role',
    clinicNameLabel: 'Clinic / Practice Name',
    labNameLabel: 'Dental Lab Name *',
    companyNameLabel: 'Logistics Company Name',
    turnaroundLabel: 'Typical Turnaround Time (Business Days)',
    specialtiesLabel: 'Lab Specialties (Select All That Apply)',
    selectedBadge: 'Selected',
    locationLabel: '📍 Physical Street Address / Google Maps Location',
    locationPlaceholder: 'e.g. 450 Lexington Ave, New York, NY or https://maps.app.goo.gl/...',
    locationHelp:
      'Enter your street address or paste a Google Maps link for automated courier routing and partner discovery.',
    openInMaps: 'Open in Google Maps ↗',
    authenticating: 'Authenticating…',
    creatingAccount: 'Creating account & setting up…',
    createAccountBtn: 'Register & Enter Platform',
    haveAccount: 'Already have an account?',
    needAccount: 'Need a clinic or lab account?',
    alreadyHaveAccount: 'Already have an account?',
    signInHere: 'Sign In Here',

    onboardingTitle: 'Complete Your Workspace Setup',
    onboardingSubtitle: 'Answer a few quick questions to personalize your dental experience',
    qRoleTitle: 'What best describes your daily workflow?',
    qRoleDentistTitle: 'Dental Practice / Clinic',
    qRoleDentistDesc: 'I treat patients, capture 3D intraoral scans or impressions, and prescribe custom dental restorations to laboratories.',
    qRoleLabTitle: 'Dental Laboratory / Milling Center',
    qRoleLabDesc: 'I receive 3D scans, design CAD restorations, mill zirconia/ceramics, and manufacture prosthetics.',
    qPracticeDetailsTitle: 'Clinic / Practice Information',
    qLabDetailsTitle: 'Laboratory & Production Information',
    qSpecialtiesTitle: 'Laboratory Specialties (Select All That Apply)',
    qClinicalSpecialtyTitle: 'Primary Clinical Focus',
    qTurnaroundTitle: 'Standard Turnaround Time (Business Days)',
    qAddressTitle: '📍 Practice or Lab Location / Google Maps Link',
    qAddressPlaceholder: 'e.g. 450 Lexington Ave, New York, NY or https://maps.app.goo.gl/...',
    completeSetupBtn: 'Complete Setup & Enter Platform',
    savingWorkspace: 'Configuring your workspace…',

    checkEmailTitle: 'Check your inbox',
    checkEmailBody:
      'A verification link was sent to your email address. Click it to activate your account, then sign in.',
    verifySuccessTitle: 'Email verified',
    verifySuccessBody: 'Your account is active. You can now sign in.',
    verifyMissingToken: 'This verification link is incomplete or has expired.',
    verifyFailed: 'Verification failed',
    resendVerification: 'Resend verification email',
    resendSent: 'A new verification email has been sent. Check your inbox.',
    verifyCodePlaceholder: 'Enter the 6-digit code',
    verifyCodeButton: 'Verify',
    verifyCodeLabel: 'Enter the code from your email',
    verifyLinkLabel: 'Use the link from your email',

    welcomeBack: 'Welcome back',
    dentistSubtitle:
      'Send 3D scans to dental labs, preview CAD designs, and track order stages.',
    labSubtitle:
      'Manage incoming digital prescriptions, design CAD models, and hand off to production.',
    shippingSubtitle: 'Pickup, track, and complete shipping logistics for finalized cases.',
    createNewCase: 'Create New Case',
    viewIncomingCases: 'View Incoming Cases',
    openShippingQueue: 'Open Shipping Queue',
    totalCaseVolume: 'Total Case Volume',
    activePipeline: 'Active Pipeline',
    yourRolePrivilege: 'Your Role & Privilege',
    orgDetails: 'Organization & Profile Details',
    recentCases: 'Recent Case Orders',
    viewAllCases: 'View All Cases →',
    noCases: 'No cases submitted yet.',
    caseCode: 'Case Code',
    assignedTo: 'Assigned Partner',
    statusPipeline: 'Status Pipeline',
    submissionDate: 'Submission Date',
    preferredLab: 'Preferred Lab',
    addressLocation: 'Address & Location',
    contactPhone: 'Contact Phone',
    searchPlaceholder: 'Search by specialty, location…',
    preferredBadge: '★ Preferred Lab Partner',
    setAsPreferred: 'Set as Preferred Lab',
  },
  ar: {
    brand: 'دينتريو',
    brandTagline: 'شبكة اللوجستيات وطب الأسنان الرقمي المتصلة',
    roles: 'الأدوار',
    howItWorks: 'كيف يعمل',
    features: 'الميزات',
    signIn: 'تسجيل الدخول',
    getStarted: 'ابدأ الآن',
    createAccount: 'إنشاء حساب',
    signOut: 'تسجيل الخروج',
    dashboard: 'لوحة التحكم',
    cases: 'الحالات',
    millingQueue: 'الخراطة والإنتاج',
    labDirectory: 'دليل المعامل',
    shippingQueue: 'قائمة الشحن',
    overview: 'نظرة عامة',

    heroBadge: 'منصة طب الأسنان الرقمي الموحدة',
    heroTitle1: 'منصة واحدة.',
    heroTitle2: 'ثلاثة عوالم متصلة.',
    heroDescription:
      'تربط دينتريو أطباء الأسنان، معامل التركيبات، وشركات الشحن في مسار عمل موحد — متمحور حول فحص ومعاينة الماسحات ثلاثية الأبعاد (3D STL/PLY) مباشرة عبر المتصفح بدلاً من الإيميلات والملفات المفقودة.',
    heroCreateBtn: 'إنشاء حساب جديد',
    heroSignInBtn: 'تسجيل الدخول',
    statConnectedRoles: 'أدوار متصلة',
    statSharedRecord: 'سجل حالة موحد',
    statZeroLost: 'ملفات مفقودة',

    rolesSubtitle: 'لمن هذه المنصة',
    rolesTitle: 'مصممة لكل مشارك في المنظومة',
    rolesDescription: 'كل دور يرى بالضبط ما يحتاجه لإنجاز عمله بأعلى دقة وخصوصية.',
    dentistTitle: 'طبيب الأسنان',
    dentistDesc:
      'ارفع الماسحات ثلاثية الأبعاد، حدد الوصفات السريرية، عاين النماذج بالمتصفح، واعتمد التصاميم بضغطة واحدة.',
    dentistP1: 'معاين 3D للملفات عبر المتصفح',
    dentistP2: 'دليل واختيار المعامل المعتمدة',
    dentistP3: 'محادثة فورية ملحقة مع رفع الصور',
    dentistP4: 'اعتماد التصميم بنقرة واحدة',
    labTitle: 'معمل الأسنان',
    labDesc:
      'استقبل الحالات المنظمة مع ملفات المسح والوصفات الرقمية. ارفع مقترحات CAD وقُد مراحل الإنتاج بسلاسة.',
    labP1: 'مواصفات وصفة رقمية كاملة',
    labP2: 'فحص وتدوير 3D ثلاثي الأبعاد',
    labP3: 'رفع ملفات واستجابات التصميم',
    labP4: 'إشعار جاهزية الاستلام والتسليم',
    shippingTitle: 'الشحن واللوجستيات',
    shippingDesc:
      'واجهة منفصلة تحمي الخصوصية — تعرض عناوين الاستلام والتوصيل مع كود الحالة فقط دون كشف البيانات الطبية.',
    shippingP1: 'تأكيد استلام الشحنة من المعمل',
    shippingP2: 'تعيين وتتبع أرقام الشحنات',
    shippingP3: 'مراحل التوصيل الحية والمباشرة',
    shippingP4: 'إغلاق الحالة تلقائياً عند التسليم',

    processSubtitle: 'خطوات العمل',
    processTitle: 'كيف تعمل المنصة',
    processDescription: 'من أول مسح رقمي حتى التسليم النهائي في 4 خطوات سلسة.',
    step1Title: 'أنشئ حسابك',
    step1Desc:
      'سجل كطبيب أسنان، معمل أسنان، أو شركة شحن. يحصل كل دور على مساحة عمل مخصصة لاحتياجاته.',
    step2Title: 'أرسل حالة رقمية',
    step2Desc:
      'ارفع الماسح ثلاثي الأبعاد (STL/PLY)، املأ الوصفة الرقمية المحددة، وعين الحالة لمعملك المفضل.',
    step3Title: 'تعاون لحظياً',
    step3Desc:
      'تواصل عبر الشات المدمج، شارك الصور المرجعية، راجع تصميم الـ CAD، واعتمد أو اطلب تعديلات في مكان واحد.',
    step4Title: 'تتبع حتى باب العيادة',
    step4Desc:
      'يستلم مندوب الشحن الطرد، يسجل رقم التتبع، وتُغلق الحالة تلقائياً فور تأكيد الاستلام والتوقيع.',

    featuresSubtitle: 'الإمكانيات والقدرات',
    featuresTitle: 'الميزات الأساسية',
    featuresDescription:
      'كل ما يجعل دينتريو الجيل القادم في إدارة وتنظيم تدفقات طب الأسنان الرقمي.',
    feat1Title: 'معاينة 3D عبر المتصفح',
    feat1Desc:
      'عاين، دوّر، وافحص ملفات STL و PLY ثلاثية الأبعاد فوراً داخل المتصفح دون الحاجة لأي برامج مكتبية ثقيلة.',
    feat2Title: 'وصفات سريرية منظمة',
    feat2Desc:
      'وثّق رقم السن، نوع التركيبة، درجة اللون (Shade)، والملاحظات في نموذج رقمي موحد ودقيق.',
    feat3Title: 'محادثة مرتبطة بكل حالة',
    feat3Desc:
      'كل استفسار، توضيح، أو صورة تظل ملحقة ومؤرشفة مباشرة مع ملف الحالة الخاص بها دون تشتت.',
    feat4Title: 'تتبع حي لمراحل الحالة',
    feat4Desc:
      'من الرفع إلى الإنتاج والشحن والتسليم، خط تتبع متزامن يوضح لكل طرف أين وصلت الحالة لحظياً.',
    feat5Title: 'ملفات تصميم المعمل المباشرة',
    feat5Desc:
      'ترفع المعامل ملفات الـ CAD ومقترحات التصميم لمراجعتها مع الطبيب واعتمادها قبل بدء الخراطة والإنتاج.',
    feat6Title: 'شحن يحمي خصوصية المريض',
    feat6Desc:
      'يحصل مندوبو التوصيل على كود الحالة والعناوين فقط دون الوصول للماسحات أو البيانات السريرية السرية.',

    ctaReady: 'مستعد للبدء؟',
    ctaTitle: 'طوّر ونظّم عمل عيادتك ومعملك اليوم.',
    ctaDesc:
      'انضم إلى دينتريو واربط عيادتك أو معملك بمسار عمل ثلاثي الأبعاد سريع، آمن، وعالي الدقة.',
    footerRights: '© 2026 دينتريو. ربط عيادات الأسنان، المعامل، واللوجستيات.',

    loginTitle: 'تسجيل الدخول إلى حسابك',
    loginSubtitle: 'إدارة وتنسيق العيادات والمعامل واللوجستيات',
    identifierLabel: 'اسم المستخدم، البريد الإلكتروني، أو رقم الهاتف',
    identifierPlaceholder: 'مثال: dr_smith أو user@email.com أو +9665...',
    passwordLabel: 'كلمة المرور',
    passwordPlaceholder: '••••••••',
    confirmPasswordLabel: 'تأكيد كلمة المرور',
    confirmPasswordPlaceholder: '••••••••',
    passwordMismatchError: 'كلمتا المرور غير متطابقتين. يرجى التأكد والمحاولة مرة أخرى.',
    agreePolicyPrefix: 'قرأت وأوافق على',
    privacyPolicyLink: 'سياسة الخصوصية العالمية واتفاقية معالجة البيانات لـ Dentrio',
    policyRequiredError: 'يجب الموافقة على سياسة الخصوصية واتفاقية البيانات لإنشاء الحساب.',
    phoneLabel: 'رقم الهاتف (11 رقماً) *',
    phonePlaceholder: '+966 50 000 0000',
    nameLabel: 'الاسم الكامل / اللقب *',
    namePlaceholder: 'مثال: د. أحمد المنصوري',
    usernameLabel: 'اسم المستخدم *',
    usernamePlaceholder: 'مثال: dr_ahmed',
    selectRole: 'حدد نوع الحساب',
    clinicNameLabel: 'اسم العيادة / المركز الطبي',
    labNameLabel: 'اسم معمل الأسنان *',
    companyNameLabel: 'اسم شركة الشحن والخدمات اللوجستية',
    turnaroundLabel: 'مدة التنفيذ المعتادة (أيام عمل)',
    specialtiesLabel: 'تخصصات المعمل (اختر كل ما ينطبق)',
    selectedBadge: 'محدد',
    locationLabel: '📍 العنوان الفعلي / موقع خرائط جوجل (Google Maps)',
    locationPlaceholder: 'مثال: شارع العليا، الرياض أو رابط https://maps.app.goo.gl/...',
    locationHelp:
      'أدخل العنوان أو الصق رابط خرائط جوجل لتسهيل وصول مندوبي الشحن وتوجيه أطباء الأسنان لمركزكم.',
    openInMaps: 'فتح في خرائط جوجل ↗',
    authenticating: 'جارٍ التحقق وتأكيد الدخول…',
    creatingAccount: 'جارٍ إنشاء الحساب وتجهيز المساحة…',
    createAccountBtn: 'تسجيل الدخول وبدء العمل',
    haveAccount: 'لديك حساب بالفعل؟',
    needAccount: 'تحتاج حساب عيادة أو معمل جديد؟',
    alreadyHaveAccount: 'لديك حساب مسجل؟',
    signInHere: 'سجل دخولك هنا',

    onboardingTitle: 'أكمل إعداد مساحة عملك',
    onboardingSubtitle: 'أجب على هذه الأسئلة البسيطة لتخصيص دورك وتجربتك في المنصة',
    qRoleTitle: 'ما هو الوصف الأنسب لعملك وطبيعة نشاطك؟',
    qRoleDentistTitle: 'عيادة أو طبيب أسنان',
    qRoleDentistDesc: 'أعالج المرضى، وأرفع المسحات ثلاثية الأبعاد (STL/PLY)، وأرسل طلبات التركيبات والتقويم للمعمل.',
    qRoleLabTitle: 'معمل أسنان أو مركز تصنيع',
    qRoleLabDesc: 'أستلم المسحات الرقمية، وأصمم CAD، وأصنّع التيجان، الزيركون، وعدسات والتقويم والتركيبات.',
    qPracticeDetailsTitle: 'بيانات العيادة أو المركز الطبي',
    qLabDetailsTitle: 'بيانات معمل الأسنان والتصنيع',
    qSpecialtiesTitle: 'تخصصات وخدمات المعمل (اختر كل ما ينطبق)',
    qClinicalSpecialtyTitle: 'التخصص السريري الرئيسي',
    qTurnaroundTitle: 'متوسط مدة التنفيذ والتسليم (أيام عمل)',
    qAddressTitle: '📍 موقع العيادة أو المعمل / رابط خرائط جوجل',
    qAddressPlaceholder: 'مثال: شارع العليا، الرياض أو رابط https://maps.app.goo.gl/...',
    completeSetupBtn: 'إكمال الإعداد والدخول للمنصة',
    savingWorkspace: 'جارٍ إعداد وتجهيز مساحة عملك…',

    checkEmailTitle: 'تحقق من بريدك الإلكتروني',
    checkEmailBody:
      'تم إرسال رابط التحقق إلى بريدك الإلكتروني. اضغط عليه لتفعيل حسابك ثم سجل الدخول.',
    verifySuccessTitle: 'تم التحقق من البريد',
    verifySuccessBody: 'حسابك الآن نشط. يمكنك تسجيل الدخول.',
    verifyMissingToken: 'رابط التحقق هذا غير مكتمل أو منتهي الصلاحية.',
    verifyFailed: 'فشل التحقق',
    resendVerification: 'إعادة إرسال بريد التحقق',
    resendSent: 'تم إرسال بريد تحقق جديد. تفقد بريدك الإلكتروني.',
    verifyCodePlaceholder: 'أدخل رمز التحقق المكون من 6 أرقام',
    verifyCodeButton: 'تحقق',
    verifyCodeLabel: 'أدخل الرمز المرسل إلى بريدك',
    verifyLinkLabel: 'استخدم الرابط المرسل إلى بريدك',

    welcomeBack: 'مرحباً بك مجدداً',
    dentistSubtitle:
      'أرسل الماسحات ثلاثية الأبعاد للمعامل، عاين تصاميم الـ CAD، وتابع مراحل التنفيذ.',
    labSubtitle:
      'أدر الوصفات الرقمية الواردة، صمم النماذج ثلاثية الأبعاد، ووجه الحالات للإنتاج.',
    shippingSubtitle: 'استلم الطرود، أدر أرقام التتبع، وأكمل لوجستيات التوصيل للحالات الجاهزة.',
    createNewCase: 'إنشاء حالة جديدة',
    viewIncomingCases: 'عرض الحالات الواردة',
    openShippingQueue: 'فتح قائمة الشحن',
    totalCaseVolume: 'إجمالي حجم الحالات',
    activePipeline: 'الحالات الجارية في المسار',
    yourRolePrivilege: 'نوع الحساب والصلاحية',
    orgDetails: 'بيانات الحساب والمنشأة',
    recentCases: 'أحدث طلبات الحالات',
    viewAllCases: 'عرض كل الحالات ←',
    noCases: 'لا توجد حالات مسجلة حتى الآن.',
    caseCode: 'كود الحالة',
    assignedTo: 'الطرف المعين',
    statusPipeline: 'مرحلة الحالة',
    submissionDate: 'تاريخ الإرسال',
    preferredLab: 'المعمل المفضل',
    addressLocation: 'العنوان والموقع',
    contactPhone: 'هاتف التواصل',
    searchPlaceholder: 'ابحث حسب التخصص، الموقع…',
    preferredBadge: '★ شريك معمل مفضل',
    setAsPreferred: 'تعيين كمعمل مفضل',
  },
};

interface LanguageContextType {
  lang: Language;
  t: Translations;
  isRTL: boolean;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  t: DICTIONARY.en,
  isRTL: false,
  toggleLanguage: () => {},
  setLanguage: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');

  const updateHtmlAttributes = (l: Language) => {
    const root = document.documentElement;
    root.lang = l;
    root.dir = l === 'ar' ? 'rtl' : 'ltr';
    if (l === 'ar') {
      root.classList.add('rtl-active');
    } else {
      root.classList.remove('rtl-active');
    }
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('dentrio_lang') as Language | null;
      if (saved === 'ar' || saved === 'en') {
        // One-time localStorage hydration after first paint (runs only on mount).
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLangState(saved);
        updateHtmlAttributes(saved);
      }
    } catch {
      // Local storage unavailable
    }
  }, []);

  const setLanguage = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem('dentrio_lang', newLang);
    } catch {
      // Ignore storage write error
    }
    updateHtmlAttributes(newLang);
  };

  const toggleLanguage = () => {
    setLanguage(lang === 'en' ? 'ar' : 'en');
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        t: DICTIONARY[lang],
        isRTL: lang === 'ar',
        toggleLanguage,
        setLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
