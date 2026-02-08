import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeftIcon, 
    MagnifyingGlassCircleIcon, // Search
    MapPinIcon,          // Location Range
    TruckIcon,           // Machines
    ShieldCheckIcon,     // OTP
    ClockIcon,           // Live Timer
    BanknotesIcon,       // Hybrid Payment
    ChartBarIcon,        // History
    SparklesIcon         // Success
} from '@heroicons/react/24/outline';

const About = () => {
  const navigate = useNavigate();

  // --- 🚜 KRISHILINK POWERFUL FLOW ---
  const flowNodes = [
      { 
        id: 1, 
        label: 'Smart Search Engine', 
        desc: 'खेती की कोई भी मशीन ढूंढें—ट्रैक्टर, हार्वेस्टर, रोटावेटर या ड्रोन।',
        icon: MagnifyingGlassCircleIcon, 
        color: 'bg-blue-500', 
        connectTo: [2] 
      },
      { 
        id: 2, 
        label: 'Local Range Finder', 
        desc: 'GPS तकनीक से सिर्फ आपके गाँव या सेट की गई रेंज (km) में उपलब्ध मशीनें देखें।',
        icon: MapPinIcon, 
        color: 'bg-red-500', 
        size: 'large', // Highlight Location Feature
        connectTo: [3] 
      },
      { 
        id: 3, 
        label: 'Transparent Booking', 
        desc: 'सीधे मालिक से जुड़ें। किराया और शर्तें पहले से साफ।',
        icon: TruckIcon, 
        color: 'bg-orange-500', 
        connectTo: [4] 
      },
      { 
        id: 4, 
        label: 'OTP Verified Work', 
        desc: 'काम शुरू और खत्म करने के लिए डिजिटल OTP। कोई धोखाधड़ी नहीं।',
        icon: ShieldCheckIcon, 
        color: 'bg-emerald-600', 
        connectTo: [5] 
      },
      { 
        id: 5, 
        label: 'Live Work Timer', 
        desc: 'घड़ी के हिसाब से पाई-पाई का हिसाब। (Minute-based calculation).',
        icon: ClockIcon, 
        color: 'bg-purple-600', 
        size: 'large', // Highlight Timer Feature
        connectTo: [6] 
      },
      { 
        id: 6, 
        label: 'Hybrid Payments', 
        desc: 'अपनी मर्जी से भुगतान करें: नकद (Cash) दें या ऑनलाइन (UPI/Wallet)।',
        icon: BanknotesIcon, 
        color: 'bg-green-600', 
        size: 'large', // Highlight Hybrid Payment
        connectTo: [7] 
      },
      { 
        id: 7, 
        label: 'Digital Khata (History)', 
        desc: 'हर बुकिंग और भुगतान का डिजिटल रिकॉर्ड हमेशा के लिए सुरक्षित।',
        icon: ChartBarIcon, 
        color: 'bg-indigo-500', 
        connectTo: [8] 
      },
      { 
        id: 8, 
        label: 'Kisan Ki Jeet', 
        isLogo: true, 
        color: 'bg-white', 
        connectTo: [] 
      },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans overflow-x-hidden text-slate-800 selection:bg-green-200 selection:text-green-900">
      
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-green-100/50 to-transparent pointer-events-none"></div>
      <div className="fixed top-[-10%] right-[-10%] w-96 h-96 bg-yellow-200/20 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-green-100 px-6 py-4 flex items-center gap-4 shadow-sm">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2.5 bg-slate-50 text-slate-600 rounded-full hover:bg-green-50 hover:text-green-600 transition-all border border-slate-200 active:scale-95 shadow-sm"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Platform Features</h2>
      </div>

      <div className="max-w-3xl mx-auto p-6 pb-32">
        
        {/* Intro Section */}
        <div className="text-center mb-16 mt-8 animate-[fadeIn_0.5s_ease-out]">
            <h1 className="text-3xl md:text-5xl font-black text-slate-800 mb-4 tracking-tight">
                Technology for <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">Real India.</span>
            </h1>
            <p className="text-slate-500 max-w-lg mx-auto text-sm md:text-base leading-relaxed font-medium">
                KrishiLink सिर्फ एक ऐप नहीं है, यह खेती को आसान बनाने का एक औजार है। मशीन ढूंढने से लेकर भुगतान तक—सब कुछ आपकी शर्तों पर।
            </p>
        </div>

        {/* 🌳 THE VISUAL FEATURES TREE */}
        <div className="relative border-l-2 border-green-200/60 ml-4 md:ml-10 pl-8 md:pl-12 space-y-12">
            
            {flowNodes.map((node, index) => (
                <div 
                    key={node.id}
                    className="relative animate-[slideUp_0.5s_ease-out]"
                    style={{ animationDelay: `${index * 100}ms` }} 
                >
                    {/* Connection Node Dot */}
                    <div className={`absolute -left-[41px] md:-left-[59px] top-6 w-6 h-6 rounded-full border-4 border-white ${node.isLogo ? 'bg-green-100' : node.color} shadow-md z-10 ring-1 ring-slate-200`}></div>

                    {/* Content Card */}
                    <div className={`
                        relative p-5 rounded-2xl border bg-white shadow-lg shadow-slate-200/50
                        hover:border-green-300 transition-all group cursor-default
                        hover:shadow-xl hover:shadow-green-500/10 hover:-translate-y-1 duration-300
                        ${node.size === 'large' ? 'border-green-200 bg-green-50/30 py-8' : 'border-slate-100'}
                    `}>
                        <div className="flex items-center gap-5">
                            {/* Icon Box */}
                            <div className={`p-3.5 rounded-xl shrink-0 ${node.isLogo ? 'bg-transparent' : 'bg-slate-50 border border-slate-100'} text-white shadow-sm`}>
                                {node.isLogo ? (
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                                        <SparklesIcon className="w-6 h-6 text-white" />
                                    </div>
                                ) : (
                                    <node.icon className={`
                                        ${node.size === 'large' ? 'w-8 h-8' : 'w-6 h-6'}
                                        ${node.color.replace('bg-', 'text-')} 
                                    `} />
                                )}
                            </div>
                            
                            {/* Text Content */}
                            <div>
                                <h3 className={`font-bold text-slate-800 ${node.size === 'large' ? 'text-2xl' : 'text-lg'}`}>
                                    {node.label}
                                </h3>
                                {node.desc && (
                                    <p className="text-slate-500 text-sm mt-1 font-medium">{node.desc}</p>
                                )}
                                {node.size === 'large' && (
                                    <p className="text-green-600 text-[10px] font-bold uppercase tracking-widest mt-2 bg-green-100 w-fit px-2 py-0.5 rounded-full">
                                        Core Feature
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Connector Lines */}
                        {node.connectTo.length > 0 && (
                            <div className="absolute -bottom-12 left-9 w-0.5 h-12 bg-gradient-to-b from-green-200 to-transparent opacity-50"></div>
                        )}
                    </div>
                </div>
            ))}

        </div>

        {/* 👨‍💻 DEVELOPER / MISSION SECTION */}
        <div className="mt-32 relative group animate-[fadeIn_0.8s_ease-out]" style={{ animationDelay: '0.5s' }}>
            
            <div className="bg-white border border-slate-100 rounded-[2rem] p-8 md:p-12 relative overflow-hidden shadow-2xl shadow-green-900/5">
                 
                 {/* Background Decoration */}
                 <div className="absolute right-0 top-0 opacity-5">
                     <TruckIcon className="w-64 h-64 -mr-16 -mt-16 transform rotate-12 text-green-900" />
                 </div>
                 <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500"></div>

                 <div className="relative z-10 md:flex items-center gap-8">
                     
                     {/* Photo Frame */}
                     <div className="mb-6 md:mb-0 shrink-0 flex justify-center md:justify-start">
                          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1.5 bg-gradient-to-tr from-green-400 to-teal-500 shadow-xl shadow-green-500/20">
                             <img 
                                src="/developer.jpg" 
                                onError={(e) => {
                                    e.target.onerror = null; 
                                    e.target.src="https://api.dicebear.com/7.x/avataaars/svg?seed=Abhishek&backgroundColor=b6e3f4"; 
                                }}
                                alt="Abhishek Jain" 
                                className="w-full h-full rounded-full object-cover border-4 border-white bg-slate-100"
                             />
                          </div>
                     </div>

                     <div className="text-center md:text-left">
                         <h3 className="text-xs font-bold text-green-600 tracking-[0.2em] uppercase mb-2 flex items-center justify-center md:justify-start gap-2">
                            <SparklesIcon className="w-4 h-4" /> Founder & Developer
                         </h3>
                         <h2 className="text-3xl font-black text-slate-800 mb-4">Abhishek Jain</h2>
                         <p className="text-slate-500 leading-relaxed text-sm md:text-base font-medium">
                             "Technology is best when it brings people together. KrishiLink is designed to create a transparent, profitable, and fair ecosystem for both Indian Farmers and Machine Owners."
                         </p>
                     </div>
                 </div>
            </div>
        </div>

        <div className="text-center text-slate-400 text-[10px] uppercase tracking-[0.2em] mt-16 font-bold">
           Made with ❤️ for Indian Agriculture
        </div>

      </div>
    </div>
  );
};

export default About;