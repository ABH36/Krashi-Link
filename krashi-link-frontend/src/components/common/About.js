import React from 'react';
import { 
    ArrowLeft, ShieldCheck, LayoutDashboard, MapPin, 
    CalendarDays, Clock, CurrencyRupeeIcon, 
    Users, Sprout, Code, Zap, Database, Tractor
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();

  // --- 🚜 KRISHILINK SYSTEM ARCHITECTURE ---
  const flowNodes = [
      { 
        id: 1, 
        label: 'Secure Entry (Hybrid OTP)', 
        icon: ShieldCheck, 
        color: 'bg-emerald-500', 
        connectTo: [2] 
      },
      { 
        id: 2, 
        label: 'Role Based Access', 
        desc: 'Farmer & Machine Owner Ecosystem',
        icon: Users, 
        color: 'bg-blue-600', 
        connectTo: [3] 
      },
      { 
        id: 3, 
        label: 'Geo-Location Engine', 
        desc: 'Finding machines nearby',
        icon: MapPin, 
        color: 'bg-red-500', 
        size: 'large', 
        connectTo: [4, 5] 
      },
      { 
        id: 4, 
        label: 'Machine Listing & Mgmt', 
        icon: Tractor, 
        color: 'bg-orange-500', 
        connectTo: [6] 
      },
      { 
        id: 5, 
        label: 'Smart Booking System', 
        icon: CalendarDays, 
        color: 'bg-purple-500', 
        connectTo: [6] 
      },
      { 
        id: 6, 
        label: 'Live Work Timer', 
        desc: 'Fair billing based on real usage',
        icon: Clock, 
        color: 'bg-indigo-500', 
        size: 'large', 
        connectTo: [7] 
      },
      { 
        id: 7, 
        label: 'Transparent Payments', 
        icon: CurrencyRupeeIcon, 
        color: 'bg-green-600', 
        connectTo: [8] 
      },
      { 
        id: 8, 
        label: 'Rural Prosperity', 
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
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">System Architecture</h2>
      </div>

      <div className="max-w-3xl mx-auto p-6 pb-32">
        
        {/* Intro Section */}
        <div className="text-center mb-16 mt-8 animate-[fadeIn_0.5s_ease-out]">
            <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-4 tracking-tight">
                Inside <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">KrishiLink.</span>
            </h1>
            <p className="text-slate-500 max-w-lg mx-auto text-sm md:text-base leading-relaxed font-medium">
                Bridging the gap between machinery owners and farmers. A transparent, tech-driven marketplace for rural India.
            </p>
        </div>

        {/* 🌳 THE VISUAL TREE STRUCTURE */}
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
                            <div className={`p-3.5 rounded-xl ${node.isLogo ? 'bg-transparent' : 'bg-slate-50 border border-slate-100'} text-white shadow-sm`}>
                                {node.isLogo ? (
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                                        <Sprout size={24} className="text-white" />
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
                                    <p className="text-slate-500 text-xs mt-1">{node.desc}</p>
                                )}
                                {node.size === 'large' && (
                                    <p className="text-green-600 text-[10px] font-bold uppercase tracking-widest mt-1 bg-green-100 w-fit px-2 py-0.5 rounded-full">
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

        {/* 👨‍💻 DEVELOPER SECTION */}
        <div className="mt-32 relative group animate-[fadeIn_0.8s_ease-out]" style={{ animationDelay: '0.5s' }}>
            
            <div className="bg-white border border-slate-100 rounded-[2rem] p-8 md:p-12 relative overflow-hidden shadow-2xl shadow-green-900/5">
                 
                 {/* Background Decoration */}
                 <div className="absolute right-0 top-0 opacity-5">
                     <Code className="w-64 h-64 -mr-16 -mt-16 transform rotate-12 text-green-900" />
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
                            <Zap size={14} fill="currentColor" /> Architect & Founder
                         </h3>
                         <h2 className="text-3xl font-black text-slate-800 mb-4">Abhishek Jain</h2>
                         <p className="text-slate-500 leading-relaxed text-sm md:text-base font-medium">
                             Building the digital backbone for Indian Agriculture.
                             <br className="hidden md:block"/>
                             "KrishiLink connects the hardworking farmer with the technology they need to thrive."
                         </p>
                         
                         <div className="flex gap-3 mt-6 justify-center md:justify-start flex-wrap">
                            <span className="px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600 flex items-center gap-1">
                                <Database size={12}/> MERN Stack
                            </span>
                            <span className="px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600 flex items-center gap-1">
                                <LayoutDashboard size={12}/> PWA
                            </span>
                            <span className="px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600 flex items-center gap-1">
                                <ShieldCheck size={12}/> Secure Auth
                            </span>
                         </div>
                     </div>
                 </div>
            </div>
        </div>

        <div className="text-center text-slate-400 text-[10px] uppercase tracking-[0.2em] mt-16 font-bold">
           v1.0 • System Operational • Made in India
        </div>

      </div>
    </div>
  );
};

export default About;