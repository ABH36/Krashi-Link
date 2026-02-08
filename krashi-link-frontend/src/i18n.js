import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      app: {
        name: 'Krishi Link',
        tagline: 'Connecting Farmers with Machinery',
      },
      common: {
        welcome: 'Welcome',
        loading: 'Loading...',
        back: 'Back',
        submit: 'Submit',
        cancel: 'Cancel',
        refresh: 'Refresh',
        logout: 'Logout',
        login: 'Login',
        register: 'Register',
        or: 'OR',
        save: 'Save',
        edit: 'Edit',
        delete: 'Delete',
        search: 'Search...',
        filter: 'Filter',
        sort: 'Sort By',
        viewDetails: 'View Details',
        callNow: 'Call Now',
        whatsapp: 'WhatsApp',
        getDirections: 'Get Directions',
        share: 'Share App',
        location: 'Location',
        kmAway: 'km away',
        notifications: 'Notifications',
        language: 'Change Language'
      },

      auth: {
        register: "Create Account",
        name: "Full Name",
        phone: "Mobile Number",
        role: "I am a...",
        farmer: "Farmer (Kisan)",
        owner: "Machine Owner",
        password: "Password",
        confirmPassword: "Confirm Password",
        forgotPassword: "Forgot Password?",
        sendOtp: "Send OTP",
        verify: "Verify",
        
        validation: {
          nameRequired: "Name is required",
          nameMin: "Name must be at least 2 characters",
          phoneRequired: "Phone number is required",
          phoneInvalid: "Enter a valid 10-digit mobile number",
          passwordRequired: "Password is required",
          passwordMin: "Password must be at least 6 characters",
          roleRequired: "Please select your role",
          otpRequired: "Please enter the OTP sent to your phone",
          matchPassword: "Passwords do not match"
        },

        haveAccount: "Already have an account?",
        noAccount: "New to KrishiLink?",
        login: "Login Now",
        otpSent: "OTP sent successfully!",
        verifyOtp: "Verify OTP",
        welcomeBack: "Welcome back!"
      },

      farmer: {
        dashboard: 'Farmer Dashboard',
        activeBookings: 'Ongoing Work',
        completedJobs: 'Completed Jobs',
        totalSpent: 'Total Expense',
        findNearby: 'Find Nearby Machines',
        findMachines: 'Search Machinery',
        findOnMap: 'View on Map',
        bookingHistory: 'My History',
        bookNow: 'Book Now',
        machines: 'Machines',
        myBookings: 'My Bookings',
        needMachine: 'Need a Machine?',
        browseText: 'Browse tractors, harvesters, and more near you.',
        selectDate: 'Select Date & Time',
        enterArea: 'Enter Area / Duration',
        estimatedCost: 'Estimated Cost',
        paymentMode: 'Payment Mode',
        cash: 'Cash',
        online: 'Online (UPI)',
        reviewOwner: 'Rate Owner',
        writeReview: 'How was the work?',
        noMachines: 'No machines found nearby.'
      },

      owner: {
        dashboard: 'Owner Dashboard',
        activeMachines: 'Active Machines',
        pendingRequests: 'New Requests',
        totalEarnings: 'Total Income',
        uniqueCustomers: 'Farmers Served',
        myMachines: 'My Machines',
        rentalRequests: 'Rental Requests',
        earnings: 'My Earnings',
        growBusiness: 'Grow Business',
        addMachineText: 'List your tractor or equipment to get more work.',
        addMachine: 'Add New Machine',
        machineName: 'Machine Name',
        machineType: 'Machine Type',
        ratePerHour: 'Rate (per Hour/Acre)',
        driverName: 'Driver Name',
        driverPhone: 'Driver Phone',
        uploadPhoto: 'Upload Photo',
        availability: 'Availability Status',
        goOnline: 'Go Online',
        goOffline: 'Go Offline'
      },

      machine: {
        status: {
            available: 'Available',
            booked: 'Booked',
            busy: 'Working Now',
            maintenance: 'In Repair',
            offline: 'Offline'
        },
        labels: {
            owner: 'Owner',
            driver: 'Driver',
            trusted: 'Verified',
            new: 'New',
            distance: 'Distance',
            hp: 'HP Power',
            fuel: 'Fuel Type'
        },
        types: {
          tractor: 'Tractor',
          harvester: 'Harvester',
          rotavator: 'Rotavator',
          cultivator: 'Cultivator (Plough)',
          seeder: 'Seeder',
          sprayer: 'Boom Sprayer',
          thresher: 'Thresher',
          trolley: 'Trolley',
          drone: 'Agri Drone',
          jcb: 'JCB / Excavator',
          reaper: 'Reaper Binder',
          baler: 'Baler',
          potatoPlanter: 'Potato Planter',
          laserLeveler: 'Laser Leveler',
          strawReaper: 'Straw Reaper (Bhusa Machine)',
          other: 'Other'
        },
        units: {
            hour: 'Hour',
            acre: 'Acre',
            bigha: 'Bigha',
            day: 'Day',
            hectare: 'Hectare'
        }
      },

      booking: {
        status: {
            requested: 'Request Sent',
            owner_confirmed: 'Confirmed',
            driver_assigned: 'Driver Assigned',
            arrived_otp_verified: 'Work Started',
            completed_pending_payment: 'Work Done (Payment Pending)',
            paid: 'Paid & Closed',
            cancelled: 'Cancelled',
            rejected: 'Rejected by Owner'
        },
        actions: {
            verifyArrival: 'Verify Arrival (OTP)',
            verifyCompletion: 'Verify Completion',
            resendOtp: 'Resend OTP',
            startTimer: 'Start Work',
            stopTimer: 'Stop Work',
            generateBill: 'Generate Bill',
            payNow: 'Pay Now',
            callDriver: 'Call Driver',
            callFarmer: 'Call Farmer'
        },
        messages: {
            otpSent: 'OTP sent to farmer.',
            billGenerated: 'Bill generated successfully.',
            waitingForOwner: 'Waiting for owner confirmation...',
            workInProgress: 'Machine is working...',
            paymentSuccess: 'Payment Successful!'
        }
      },

      profile: {
        title: 'My Profile',
        editProfile: 'Edit Profile',
        helpSupport: 'Help & Support',
        privacyPolicy: 'Privacy Policy',
        aboutUs: 'About Us',
        logoutConfirm: 'Are you sure you want to logout?',
        accountSettings: 'Account Settings'
      },

      errors: {
        network: 'No Internet Connection',
        server: 'Server Error. Please try again.',
        locationDenied: 'Please enable location services.',
        generic: 'Something went wrong.'
      }
    }
  },

  hi: {
    translation: {
      app: {
        name: 'कृषि लिंक',
        tagline: 'किसानों की अपनी मशीनरी ऐप',
      },
      common: {
        welcome: 'नमस्ते',
        loading: 'कृपया प्रतीक्षा करें...',
        back: 'पीछे जाएं',
        submit: 'जमा करें',
        cancel: 'रद्द करें',
        refresh: 'ताज़ा करें',
        logout: 'बाहर निकलें',
        login: 'लॉग इन',
        register: 'नया खाता बनाएं',
        or: 'या',
        save: 'सुरक्षित करें',
        edit: 'बदलाव करें',
        delete: 'हटाएं',
        search: 'खोजें...',
        filter: 'फिल्टर',
        sort: 'क्रम में लगाएं',
        viewDetails: 'पूरी जानकारी देखें',
        callNow: 'कॉल करें',
        whatsapp: 'व्हाट्सएप करें',
        getDirections: 'रास्ता देखें',
        share: 'ऐप शेयर करें',
        location: 'स्थान',
        kmAway: 'किमी दूर',
        notifications: 'सूचनाएं',
        language: 'भाषा बदलें'
      },

      auth: {
        register: "नया खाता बनाएं",
        name: "पूरा नाम",
        phone: "मोबाइल नंबर",
        role: "मैं हूँ एक...",
        farmer: "किसान (खेती करवाने के लिए)",
        owner: "मशीन मालिक (किराये पर देने के लिए)",
        password: "पासवर्ड",
        confirmPassword: "पासवर्ड दोबारा लिखें",
        forgotPassword: "पासवर्ड भूल गए?",
        sendOtp: "OTP भेजें",
        verify: "सत्यापित करें",

        validation: {
          nameRequired: "नाम लिखना जरूरी है",
          nameMin: "नाम थोड़ा और बड़ा लिखें",
          phoneRequired: "मोबाइल नंबर जरूरी है",
          phoneInvalid: "सही 10 अंकों का मोबाइल नंबर लिखें",
          passwordRequired: "पासवर्ड जरूरी है",
          passwordMin: "पासवर्ड कम से कम 6 अक्षरों का हो",
          roleRequired: "कृपया बताएं आप किसान हैं या मालिक",
          otpRequired: "आपके फोन पर आया OTP लिखें",
          matchPassword: "दोनों पासवर्ड एक जैसे होने चाहिए"
        },

        haveAccount: "क्या आपका पहले से खाता है?",
        noAccount: "कृषि लिंक पर नए हैं?",
        login: "लॉगिन करें",
        otpSent: "OTP आपके फोन पर भेज दिया गया है!",
        verifyOtp: "OTP सत्यापित करें",
        welcomeBack: "वापसी पर स्वागत है!"
      },

      farmer: {
        dashboard: 'किसान डैशबोर्ड',
        activeBookings: 'चालू काम',
        completedJobs: 'पूरे हुए काम',
        totalSpent: 'कुल खर्चा',
        findNearby: 'आसपास की मशीनें',
        findMachines: 'मशीन खोजें',
        findOnMap: 'नक्शे पर देखें',
        bookingHistory: 'पुरानी बुकिंग',
        bookNow: 'अभी बुक करें',
        machines: 'मशीनें',
        myBookings: 'मेरी बुकिंग',
        needMachine: 'मशीन चाहिए?',
        browseText: 'अपने गाँव के पास ट्रैक्टर, हार्वेस्टर और अन्य मशीनें देखें।',
        selectDate: 'तारीख और समय चुनें',
        enterArea: 'कितना काम है? (एकड़/बीघा/घंटे)',
        estimatedCost: 'अनुमानित खर्चा',
        paymentMode: 'भुगतान कैसे करेंगे?',
        cash: 'नकद (Cash)',
        online: 'ऑनलाइन (UPI/PhonePe)',
        reviewOwner: 'मालिक को रेटिंग दें',
        writeReview: 'काम कैसा हुआ? यहाँ लिखें...',
        noMachines: 'आसपास कोई मशीन नहीं मिली।'
      },

      owner: {
        dashboard: 'मालिक डैशबोर्ड',
        activeMachines: 'उपलब्ध मशीनें',
        pendingRequests: 'नई बुकिंग',
        totalEarnings: 'कुल कमाई',
        uniqueCustomers: 'कुल ग्राहक',
        myMachines: 'मेरी मशीनें',
        rentalRequests: 'बुकिंग अनुरोध',
        earnings: 'कमाई का हिसाब',
        growBusiness: 'व्यापार बढ़ाएं',
        addMachineText: 'अपनी मशीन जोड़ें और ज्यादा काम पाएं।',
        addMachine: 'नई मशीन जोड़ें',
        machineName: 'मशीन का नाम (जैसे: महिंद्रा 575)',
        machineType: 'मशीन का प्रकार',
        ratePerHour: 'किराया',
        driverName: 'ड्राइवर का नाम',
        driverPhone: 'ड्राइवर का नंबर',
        uploadPhoto: 'मशीन की फोटो लगाएं',
        availability: 'उपलब्धता',
        goOnline: 'काम के लिए तैयार',
        goOffline: 'अभी उपलब्ध नहीं'
      },

      machine: {
        status: {
            available: 'उपलब्ध है',
            booked: 'बुक हो गई',
            busy: 'काम पर है',
            maintenance: 'मरम्मत में (गैराज)',
            offline: 'उपलब्ध नहीं'
        },
        labels: {
            owner: 'मालिक',
            driver: 'ड्राइवर',
            trusted: 'भरोसेमंद',
            new: 'नई',
            distance: 'दूरी',
            hp: 'हार्स पावर (HP)',
            fuel: 'डीजल/पेट्रोल'
        },
        types: {
          tractor: 'ट्रैक्टर',
          harvester: 'हार्वेस्टर (कटाई मशीन)',
          rotavator: 'रोटावेटर (जुताई)',
          cultivator: 'कल्टीवेटर (हल)',
          seeder: 'सीडर (बुवाई मशीन)',
          sprayer: 'स्प्रेयर (दवा छिड़काव)',
          thresher: 'थ्रेशर (गहाई)',
          trolley: 'ट्रॉली',
          drone: 'ड्रोन',
          jcb: 'जेसीबी (JCB)',
          reaper: 'रीपर (फसल काटने वाली)',
          baler: 'बेलर (पराली बांधने वाली)',
          potatoPlanter: 'आलू मशीन',
          laserLeveler: 'लेजर लेवलर (समतल करने वाली)',
          strawReaper: 'भूसा मशीन',
          other: 'अन्य मशीन'
        },
        units: {
            hour: 'प्रति घंटा',
            acre: 'प्रति एकड़',
            bigha: 'प्रति बीघा',
            day: 'प्रति दिन',
            hectare: 'प्रति हेक्टेयर'
        }
      },

      booking: {
        status: {
            requested: 'अनुरोध भेजा गया',
            owner_confirmed: 'मालिक ने स्वीकार किया',
            driver_assigned: 'ड्राइवर निकला',
            arrived_otp_verified: 'काम शुरू (OTP Verified)',
            completed_pending_payment: 'काम पूरा (भुगतान बाकी)',
            paid: 'भुगतान हो गया',
            cancelled: 'रद्द कर दी गई',
            rejected: 'मालिक ने मना कर दिया'
        },
        actions: {
            verifyArrival: 'मशीन आ गई? (OTP दें)',
            verifyCompletion: 'काम पूरा हुआ? (सत्यापित करें)',
            resendOtp: 'OTP दोबारा भेजें',
            startTimer: 'काम शुरू करें',
            stopTimer: 'काम रोकें',
            generateBill: 'बिल बनाएं',
            payNow: 'भुगतान करें',
            callDriver: 'ड्राइवर को कॉल करें',
            callFarmer: 'किसान को कॉल करें'
        },
        messages: {
            otpSent: 'किसान को OTP भेज दिया गया है।',
            billGenerated: 'बिल बन गया है।',
            waitingForOwner: 'मालिक की पुष्टि का इंतज़ार...',
            workInProgress: 'मशीन काम कर रही है...',
            paymentSuccess: 'भुगतान सफल रहा!'
        }
      },

      profile: {
        title: 'मेरी प्रोफाइल',
        editProfile: 'प्रोफाइल बदलें',
        helpSupport: 'मदद और सहायता',
        privacyPolicy: 'गोपनीयता नीति',
        aboutUs: 'हमारे बारे में',
        logoutConfirm: 'क्या आप सच में बाहर निकलना चाहते हैं?',
        accountSettings: 'खाता सेटिंग्स'
      },

      errors: {
        network: 'इंटरनेट नहीं चल रहा है',
        server: 'सर्वर में दिक्कत है, थोड़ी देर बाद कोशिश करें',
        locationDenied: 'कृपया लोकेशन की अनुमति दें',
        generic: 'कुछ गड़बड़ हो गई'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'hi', // Default: Hindi
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;