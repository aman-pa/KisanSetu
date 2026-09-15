import React from 'react';
import { Globe } from 'lucide-react';

export const TRANSLATIONS = {
  en: {
    heroTitle: 'Government Benefits, Made Simple.',
    heroSubtitle: 'Discover government schemes, subsidies, agriculture updates and support programs available for farmers.',
    searchPlaceholder: 'Search schemes, subsidies, benefits...',
    verifiedTrust: 'Verified Government Information',
    filterAll: 'All',
    filterSchemes: 'Schemes',
    filterSubsidies: 'Subsidies',
    filterNews: 'News',
    filterInsurance: 'Insurance',
    filterLoans: 'Loans',
    filterAgriculture: 'Agriculture',
    filterStateSchemes: 'State Schemes',
    cardGovtSchemes: 'Government Schemes',
    cardGovtSchemesDesc: 'Find schemes and benefits you may be eligible for.',
    cardSubsidies: 'Subsidies & Financial Support',
    cardSubsidiesDesc: 'Explore subsidies, financial assistance and farmer support programs.',
    cardNews: 'Latest Agriculture News',
    cardNewsDesc: 'Stay updated with government announcements and agriculture news.',
    cardAlerts: 'Important Alerts',
    cardAlertsDesc: 'Never miss deadlines, application windows or major farmer announcements.',
    featuredSchemesTitle: 'Featured Government Schemes',
    findSchemesTitle: 'Find Schemes For You',
    stateSupportTitle: 'State-Specific Farmer Support',
    latestNewsTitle: 'Latest Farmer Updates',
    alertsTitle: 'Important Government Alerts',
    viewDetails: 'View Details',
    applyOfficial: 'Apply / Official Website',
    findRelevantBtn: 'Find Relevant Schemes',
    selectState: 'Select State',
    farmerType: 'Farmer Type',
    crop: 'Primary Crop',
    landSize: 'Land Size (Acres)',
    irrigationType: 'Irrigation Type',
    ageGroup: 'Age Group',
    farmingCategory: 'Farming Category',
    completeProfilePrompt: 'Complete your farmer profile to receive personalized scheme recommendations.',
    completeProfileBtn: 'Complete Profile',
    goodMorning: 'Good morning',
    goodAfternoon: 'Good afternoon',
    goodEvening: 'Good evening',
    updatesForYou: 'Here are updates relevant to you.',
    showingUpdatesFor: 'Showing farmer updates for',
    recommendedFor: 'Recommended schemes for',
  },
  hi: {
    heroTitle: 'सरकारी योजनाएं और लाभ, अब बेहद आसान।',
    heroSubtitle: 'किसानों के लिए उपलब्ध सरकारी योजनाएं, सब्सिडी, कृषि घोषणाएं और कल्याणकारी कार्यक्रम खोजें।',
    searchPlaceholder: 'योजनाएं, सब्सिडी, लाभ खोजें...',
    verifiedTrust: 'सत्यापित सरकारी जानकारी',
    filterAll: 'सभी',
    filterSchemes: 'योजनाएं',
    filterSubsidies: 'सब्सिडी',
    filterNews: 'समाचार',
    filterInsurance: 'बीमा',
    filterLoans: 'ऋण / केसीसी',
    filterAgriculture: 'कृषि',
    filterStateSchemes: 'राज्य योजनाएं',
    cardGovtSchemes: 'सरकारी योजनाएं',
    cardGovtSchemesDesc: 'पात्र सरकारी योजनाएं और लाभ खोजें।',
    cardSubsidies: 'सब्सिडी और वित्तीय सहायता',
    cardSubsidiesDesc: 'सब्सिडी, वित्तीय सहायता और सहायता कार्यक्रम देखें।',
    cardNews: 'ताज़ा कृषि समाचार',
    cardNewsDesc: 'सरकारी घोषणाओं और कृषि समाचारों से अपडेट रहें।',
    cardAlerts: 'ज़रूरी अलर्ट व समय-सीमा',
    cardAlertsDesc: 'आवेदन की समय-सीमा और प्रमुख घोषणाएं कभी न चूकें।',
    featuredSchemesTitle: 'प्रमुख सरकारी योजनाएं',
    findSchemesTitle: 'अपने लिए उपयुक्त योजनाएं खोजें',
    stateSupportTitle: 'राज्य-विशिष्ट किसान सहायता',
    latestNewsTitle: 'नवीनतम किसान अपडेट',
    alertsTitle: 'महत्वपूर्ण सरकारी अलर्ट',
    viewDetails: 'विवरण देखें',
    applyOfficial: 'आवेदन करें / आधिकारिक पोर्टल',
    findRelevantBtn: 'प्रासंगिक योजनाएं खोजें',
    selectState: 'राज्य चुनें',
    farmerType: 'किसान श्रेणी',
    crop: 'मुख्य फसल',
    landSize: 'जमीन का आकार (एकड़)',
    irrigationType: 'सिंचाई का साधन',
    ageGroup: 'आयु वर्ग',
    farmingCategory: 'खेती का प्रकार',
    completeProfilePrompt: 'व्यक्तिगत योजना सुझाव प्राप्त करने के लिए अपनी प्रोफ़ाइल पूरी करें।',
    completeProfileBtn: 'प्रोफ़ाइल पूरी करें',
    goodMorning: 'सुप्रभात',
    goodAfternoon: 'शुभ दोपहर',
    goodEvening: 'शुभ संध्या',
    updatesForYou: 'यहाँ आपके लिए प्रासंगिक जानकारी दी गई है।',
    showingUpdatesFor: 'के किसानों के लिए अपडेट:',
    recommendedFor: 'के किसानों के लिए अनुशंसित योजनाएं:',
  },
  pa: {
    heroTitle: 'ਸਰਕਾਰੀ ਲਾਭ ਅਤੇ ਸਕੀਮਾਂ, ਹੁਣ ਆਸਾਨ।',
    heroSubtitle: 'ਕਿਸਾਨਾਂ ਲਈ ਉਪਲਬਧ ਸਰਕਾਰੀ ਸਕੀਮਾਂ, ਸਬਸਿਡੀਆਂ, ਖੇਤੀਬਾੜੀ ਅੱਪਡੇਟ ਅਤੇ ਭਲਾਈ ਪ੍ਰੋਗਰਾਮਾਂ ਦੀ ਖੋਜ ਕਰੋ।',
    searchPlaceholder: 'ਸਕੀਮਾਂ, ਸਬਸਿਡੀਆਂ, ਲਾਭ ਖੋਜੋ...',
    verifiedTrust: 'ਤਸਦੀਕਸ਼ੁਦਾ ਸਰਕਾਰੀ ਜਾਣਕਾਰੀ',
    filterAll: 'ਸਾਰੇ',
    filterSchemes: 'ਸਕੀਮਾਂ',
    filterSubsidies: 'ਸਬਸਿਡੀ',
    filterNews: 'ਖ਼ਬਰਾਂ',
    filterInsurance: 'ਬੀਮਾ',
    filterLoans: 'ਕਰਜ਼ਾ / ਕੇਸੀਸੀ',
    filterAgriculture: 'ਖੇਤੀਬਾੜੀ',
    filterStateSchemes: 'ਰਾਜ ਸਕੀਮਾਂ',
    cardGovtSchemes: 'ਸਰਕਾਰੀ ਸਕੀਮਾਂ',
    cardGovtSchemesDesc: 'ਯੋਗ ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਅਤੇ ਲਾਭ ਲੱਭੋ।',
    cardSubsidies: 'ਸਬਸਿਡੀਆਂ ਅਤੇ ਵਿੱਤੀ ਸਹਾਇਤਾ',
    cardSubsidiesDesc: 'ਸਬਸਿਡੀ ਅਤੇ ਵਿੱਤੀ ਸਹਾਇਤਾ ਪ੍ਰੋਗਰਾਮ ਵੇਖੋ।',
    cardNews: 'ਤਾਜ਼ਾ ਖੇਤੀਬਾੜੀ ਖ਼ਬਰਾਂ',
    cardNewsDesc: 'ਸਰਕਾਰੀ ਐਲਾਨਾਂ ਅਤੇ ਖੇਤੀ ਖ਼ਬਰਾਂ ਨਾਲ ਜੁੜੇ ਰਹੋ।',
    cardAlerts: 'ਮਹੱਤਵਪੂਰਨ ਚੇਤਾਵਨੀਆਂ',
    cardAlertsDesc: 'ਮਿਆਦ ਅਤੇ ਅਹਿਮ ਐਲਾਨ ਕਦੇ ਨਾ ਖੁੰਝਾਓ।',
    featuredSchemesTitle: 'ਮੁੱਖ ਸਰਕਾਰੀ ਸਕੀਮਾਂ',
    findSchemesTitle: 'ਆਪਣੇ ਲਈ ਸਕੀਮਾਂ ਲੱਭੋ',
    stateSupportTitle: 'ਰਾਜ-ਵਿਸ਼ੇਸ਼ ਕਿਸਾਨ ਸਹਾਇਤਾ',
    latestNewsTitle: 'ਤਾਜ਼ਾ ਕਿਸਾਨ ਅੱਪਡੇਟ',
    alertsTitle: 'ਮਹੱਤਵਪੂਰਨ ਸਰਕਾਰੀ ਚੇਤਾਵਨੀਆਂ',
    viewDetails: 'ਵੇਰਵੇ ਵੇਖੋ',
    applyOfficial: 'ਅਪਲਾਈ ਕਰੋ / ਅਧਿਕਾਰਤ ਪੋਰਟਲ',
    findRelevantBtn: 'ਸਕੀਮਾਂ ਲੱਭੋ',
    selectState: 'ਰਾਜ ਚੁਣੋ',
    farmerType: 'ਕਿਸਾਨ ਸ਼੍ਰੇਣੀ',
    crop: 'ਮੁੱਖ ਫ਼ਸਲ',
    landSize: 'ਜ਼ਮੀਨ ਦਾ ਆਕਾਰ (ਏਕੜ)',
    irrigationType: 'ਸਿੰਚਾਈ ਦੀ ਕਿਸਮ',
    ageGroup: 'ਉਮਰ ਵਰਗ',
    farmingCategory: 'ਖੇਤੀ ਦੀ ਕਿਸਮ',
    completeProfilePrompt: 'ਵਿਅਕਤੀਗਤ ਸਕੀਮ ਸਿਫ਼ਾਰਸ਼ਾਂ ਪ੍ਰਾਪਤ ਕਰਨ ਲਈ ਆਪਣਾ ਪ੍ਰੋਫਾਈਲ ਪੂਰਾ ਕਰੋ।',
    completeProfileBtn: 'ਪ੍ਰੋਫਾਈਲ ਪੂਰਾ ਕਰੋ',
    goodMorning: 'ਸ਼ੁਭ ਸਵੇਰ',
    goodAfternoon: 'ਸ਼ੁਭ ਦੁਪਹਿਰ',
    goodEvening: 'ਸ਼ੁਭ ਸੰਝ',
    updatesForYou: 'ਇੱਥੇ ਤੁਹਾਡੇ ਲਈ ਸੰਬੰਧਿਤ ਅੱਪਡੇਟ ਹਨ।',
    showingUpdatesFor: 'ਲਈ ਕਿਸਾਨ ਅੱਪਡੇਟ:',
    recommendedFor: 'ਦੇ ਕਿਸਾਨਾਂ ਲਈ ਸਿਫ਼ਾਰਸ਼ੀ ਸਕੀਮਾਂ:',
  },
};

const LanguageSelector = ({ currentLang, onSelectLang }) => {
  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ' },
  ];

  return (
    <div className="inline-flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-2xs">
      <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
      {languages.map((lang) => {
        const isActive = currentLang === lang.code;
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => onSelectLang(lang.code)}
            className={`px-2.5 py-1 text-xs font-extrabold rounded-lg transition-all ${
              isActive
                ? 'bg-agri-primary text-white shadow-2xs'
                : 'text-slate-600 hover:text-agri-primary hover:bg-slate-50'
            }`}
          >
            {lang.label}
          </button>
        );
      })}
    </div>
  );
};

export default LanguageSelector;
