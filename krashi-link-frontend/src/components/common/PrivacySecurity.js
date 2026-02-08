import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, LockClosedIcon, ShieldCheckIcon, 
    EyeIcon, ServerIcon, EnvelopeIcon, LanguageIcon 
} from '@heroicons/react/24/outline';

const PrivacySecurity = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState('en'); // 'en' or 'hi'

  const toggleLang = () => setLang(prev => prev === 'en' ? 'hi' : 'en');

  const content = {
      en: {
          title: "Privacy & Security",
          subtitle: "Your trust is our harvest.",
          lastUpdated: "Last Updated: Feb 2026",
          sections: [
              {
                  title: "Data We Collect",
                  icon: EyeIcon,
                  text: "We collect only essential information to facilitate machine rentals: Name, Phone Number (for OTP verification), and Location data (to find nearby machines/farms). We do not share your personal data with third-party advertisers."
              },
              {
                  title: "Secure Transactions",
                  icon: LockClosedIcon,
                  text: "All rental agreements and payments are verified securely. We use a hybrid OTP system to ensure that the person booking the machine and the owner are verified users."
              },
              {
                  title: "Data Storage",
                  icon: ServerIcon,
                  text: "Your data is stored on secure, encrypted servers. We perform regular audits to ensure the integrity of our platform."
              }
          ],
          contactTitle: "Contact Us",
          contactDesc: "For any privacy-related concerns or data deletion requests:"
      },
      hi: {
          title: "गोपनीयता और सुरक्षा",
          subtitle: "आपका भरोसा ही हमारी कमाई है।",
          lastUpdated: "अंतिम अपडेट: फरवरी 2026",
          sections: [
              {
                  title: "हम क्या जानकारी लेते हैं",
                  icon: EyeIcon,
                  text: "हम केवल मशीन किराए पर लेने के लिए आवश्यक जानकारी एकत्र करते हैं: नाम, फोन नंबर (ओटीपी सत्यापन के लिए), और स्थान (पास की मशीनें/खेत खोजने के लिए)। हम आपका डेटा किसी विज्ञापनदाता के साथ साझा नहीं करते हैं।"
              },
              {
                  title: "सुरक्षित लेन-देन",
                  icon: LockClosedIcon,
                  text: "सभी किराये के समझौते और भुगतान सुरक्षित रूप से सत्यापित किए जाते हैं। हम यह सुनिश्चित करने के लिए हाइब्रिड ओटीपी सिस्टम का उपयोग करते हैं कि किसान और मशीन मालिक सत्यापित हैं।"
              },
              {
                  title: "डेटा भंडारण",
                  icon: ServerIcon,
                  text: "आपका डेटा सुरक्षित, एन्क्रिप्टेड सर्वर पर संग्रहीत है। हम अपने प्लेटफॉर्म की सुरक्षा सुनिश्चित करने के लिए नियमित जांच करते हैं।"
              }
          ],
          contactTitle: "संपर्क करें",
          contactDesc: "गोपनीयता संबंधी किसी भी सवाल या डेटा हटाने के अनुरोध के लिए:"
      }
  };

  const t = content[lang];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-10">
      
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
            <button 
            onClick={() => navigate(-1)} 
            className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-green-50 hover:text-green-600 transition-colors"
            >
            <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                {lang === 'en' ? 'Privacy Center' : 'सुरक्षा केंद्र'}
            </h1>
        </div>
        
        {/* Lang Toggle */}
        <button 
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold border border-green-200 hover:bg-green-100 transition-colors"
        >
            <LanguageIcon className="w-4 h-4" />
            {lang === 'en' ? 'हिंदी में देखें' : 'View in English'}
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 animate-[fadeIn_0.3s_ease-out]">
          
          {/* Hero Section */}
          <div className="text-center mb-10">
              <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                  <LockClosedIcon className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">{t.title}</h2>
              <p className="text-gray-500 font-medium">{t.subtitle}</p>
              <p className="text-xs text-gray-400 mt-4 uppercase tracking-wider">{t.lastUpdated}</p>
          </div>

          {/* Policy Cards */}
          <div className="space-y-6">
              {t.sections.map((section, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-green-200 transition-colors">
                      <div className="flex items-start gap-4">
                          <div className="p-2 bg-gray-50 rounded-lg shrink-0">
                              <section.icon className="w-6 h-6 text-gray-600" />
                          </div>
                          <div>
                              <h3 className="font-bold text-gray-800 text-lg mb-2">{section.title}</h3>
                              <p className="text-gray-600 text-sm leading-relaxed text-justify">
                                  {section.text}
                              </p>
                          </div>
                      </div>
                  </div>
              ))}
          </div>

          {/* Contact Section (As requested) */}
          <div className="mt-10 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-6 text-white shadow-lg shadow-green-200">
              <h3 className="font-bold text-xl mb-2 flex items-center gap-2">
                  <EnvelopeIcon className="w-6 h-6" /> {t.contactTitle}
              </h3>
              <p className="text-green-100 text-sm mb-6 border-b border-green-500/50 pb-4">
                  {t.contactDesc}
              </p>
              
              <div className="space-y-3 font-mono text-sm">
                  <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg hover:bg-white/20 transition-colors cursor-pointer" onClick={() => window.location.href = 'mailto:support@krishilink.com'}>
                      <span className="opacity-70">Email:</span>
                      <span className="font-bold select-all">support@krishilink.com</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg hover:bg-white/20 transition-colors cursor-pointer" onClick={() => window.location.href = 'mailto:jainabhi6001@gmail.com'}>
                      <span className="opacity-70">Admin:</span>
                      <span className="font-bold select-all">jainabhi6001@gmail.com</span>
                  </div>
              </div>
          </div>

      </div>
    </div>
  );
};

export default PrivacySecurity;