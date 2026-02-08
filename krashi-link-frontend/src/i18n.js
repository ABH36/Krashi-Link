import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      app: {
        name: 'Krashi Link',
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
        or: 'OR'
      },

      auth: {
  register: "Register",
  name: "Full Name",
  phone: "Phone Number",
  role: "Select Role",
  farmer: "Farmer",
  owner: "Owner",
  password: "Password",
  confirmPassword: "Confirm Password",

  validation: {
    nameRequired: "Name is required",
    nameMin: "Name must be at least 2 characters",
    phoneRequired: "Phone number is required",
    phoneInvalid: "Enter a valid 10-digit phone number",
    passwordRequired: "Password is required",
    passwordMin: "Password must be at least 6 characters",
    roleRequired: "Role is required"
  },

  haveAccount: "Already have an account?",
  noAccount: "Are you a new member?",
  login: "Login"
},

      farmer: {
        activeBookings: 'Active Bookings',
        completedJobs: 'Completed Jobs',
        totalSpent: 'Total Spent',
        findNearby: 'Find Nearby',
        findMachines: 'Find Machines',
        findOnMap: 'Find on Map',
        bookingHistory: 'Booking History',
        bookNow: 'Book Now',
        machines: 'Machines',
        myBookings: 'My Bookings',
        needMachine: 'Need a Machine?',
        browseText: 'Browse our wide range of agricultural equipment.'
      },
      owner: {
        activeMachines: 'Active Machines',
        pendingRequests: 'Pending Requests',
        totalEarnings: 'Total Earnings',
        uniqueCustomers: 'Unique Customers',
        myMachines: 'My Machines',
        rentalRequests: 'Rental Requests',
        earnings: 'Earnings',
        growBusiness: 'Grow Your Business',
        addMachineText: 'Add more machines to reach more farmers.',
        addMachine: 'Add Machine'
      },
      machine: {
        available: 'Available',
        booked: 'Booked',
        busy: 'Busy',
        owner: 'Owner',
        trusted: 'Trusted',
        new: 'New Listing',
        types: {
          tractor: 'Tractor',
          harvester: 'Harvester',
          sprayer: 'Sprayer',
          thresher: 'Thresher',
          other: 'Other'
        }
      },
      booking: {
        requested: 'Requested',
        confirmed: 'Confirmed',
        inProgress: 'In Progress',
        completed: 'Completed',
        paid: 'Paid',
        cancelled: 'Cancelled',
        verifyArrival: 'Verify Arrival',
        verifyCompletion: 'Verify Completion',
        resendOtp: 'Resend OTP',
        otpSent: 'OTP Sent',
        billGenerated: 'Bill Generated'
      }
    }
  },
  hi: {
    translation: {
      app: {
        name: 'कृषि लिंक',
        tagline: 'किसानों को मशीनों से जोड़ना',
      },
      common: {
        welcome: 'स्वागत है',
        loading: 'लोड हो रहा है...',
        back: 'वापस',
        submit: 'जमा करें',
        cancel: 'रद्द करें',
        refresh: 'रीफ्रेश',
        logout: 'लॉग आउट',
        login: 'लॉग इन',
        register: 'रजिस्टर',
        or: 'या'
      },

      auth: {
  register: "रजिस्टर करें",
  name: "पूरा नाम",
  phone: "फ़ोन नंबर",
  role: "भूमिका चुनें",
  farmer: "किसान",
  owner: "मालिक",
  password: "पासवर्ड",
  confirmPassword: "पासवर्ड की पुष्टि करें",

  validation: {
    nameRequired: "नाम आवश्यक है",
    nameMin: "नाम कम से कम 2 अक्षरों का होना चाहिए",
    phoneRequired: "फ़ोन नंबर आवश्यक है",
    phoneInvalid: "मान्य 10 अंकों का फ़ोन नंबर दर्ज करें",
    passwordRequired: "पासवर्ड आवश्यक है",
    passwordMin: "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए",
    roleRequired: "भूमिका आवश्यक है"
  },

  haveAccount: "क्या आपका पहले से खाता है?",
  noAccount: "क्या आप नए सदस्य हैं?",
  login: "लॉगिन"
},

      farmer: {
        activeBookings: 'चल रही बुकिंग',
        completedJobs: 'पूर्ण कार्य',
        totalSpent: 'कुल खर्चा',
        findNearby: 'आसपास खोजें',
        findMachines: 'मशीनें खोजें',
        findOnMap: 'मैप पर देखें',
        bookingHistory: 'बुकिंग इतिहास',
        bookNow: 'बुक करें',
        machines: 'मशीनें',
        myBookings: 'मेरी बुकिंग',
        needMachine: 'मशीन चाहिए?',
        browseText: 'कृषि उपकरणों की हमारी विस्तृत श्रृंखला देखें।'
      },
      owner: {
        activeMachines: 'सक्रिय मशीनें',
        pendingRequests: 'लंबित अनुरोध',
        totalEarnings: 'कुल कमाई',
        uniqueCustomers: 'कुल ग्राहक',
        myMachines: 'मेरी मशीनें',
        rentalRequests: 'किराये के अनुरोध',
        earnings: 'कमाई',
        growBusiness: 'व्यापार बढ़ाएं',
        addMachineText: 'अधिक किसानों तक पहुंचने के लिए और मशीनें जोड़ें।',
        addMachine: 'मशीन जोड़ें'
      },
      machine: {
        available: 'उपलब्ध',
        booked: 'बुक किया गया',
        busy: 'व्यस्त',
        owner: 'मालिक',
        trusted: 'भरोसेमंद',
        new: 'नई मशीन',
        types: {
          tractor: 'ट्रैक्टर',
          harvester: 'हार्वेस्टर (कटाई मशीन)',
          sprayer: 'स्प्रेयर',
          thresher: 'थ्रेशर',
          other: 'अन्य'
        }
      },
      booking: {
        requested: 'अनुरोध भेजा गया',
        confirmed: 'पुष्टि की गई',
        inProgress: 'कार्य प्रगति पर',
        completed: 'पूर्ण',
        paid: 'भुगतान किया गया',
        cancelled: 'रद्द',
        verifyArrival: 'आगमन सत्यापित करें',
        verifyCompletion: 'कार्य पूर्णता सत्यापित करें',
        resendOtp: 'ओटीपी पुनः भेजें',
        otpSent: 'ओटीपी भेजा गया',
        billGenerated: 'बिल बन गया'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'hi', // Default Hindi for rural users
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;