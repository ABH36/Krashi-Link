const crypto = require('crypto');

// Temporary in-memory store for OTPs (Development ke liye fast hai)
// Production mein Redis use karna behtar hota hai, par abhi ye chalega via Global Map
const otpStore = new Map(); 

// SMS API Config (Future ke liye placeholder)
// const axios = require('axios'); // Jab SMS API lagayenge tab iska use hoga

const otpService = {
    
    // 1. Generate Numeric OTP
    generateOTP: (length = 6) => {
        // Sirf numbers (farmers ke liye easy)
        const digits = '0123456789';
        let otp = '';
        for (let i = 0; i < length; i++) {
            otp += digits[Math.floor(Math.random() * 10)];
        }
        return otp;
    },

    // 2. Store OTP (With Expiry)
    storeOTP: (key, type, otp, ttlMinutes = 10) => {
        const fullKey = `${key}_${type}`; // e.g., "9876543210_login" or "bookingId_arrival"
        const expiresAt = Date.now() + ttlMinutes * 60 * 1000;
        
        otpStore.set(fullKey, { otp, expiresAt });

        // Auto cleanup after expiry
        setTimeout(() => {
            if (otpStore.has(fullKey)) otpStore.delete(fullKey);
        }, ttlMinutes * 60 * 1000);
        
        return true;
    },

    // 3. Verify OTP
    verifyOTP: (key, type, inputOTP) => {
        const fullKey = `${key}_${type}`;
        const data = otpStore.get(fullKey);

        if (!data) {
            return { valid: false, message: 'OTP expired or not found' };
        }

        if (Date.now() > data.expiresAt) {
            otpStore.delete(fullKey);
            return { valid: false, message: 'OTP expired' };
        }

        if (data.otp === inputOTP) {
            otpStore.delete(fullKey); // Valid hote hi delete karo (Security)
            return { valid: true, message: 'Verified' };
        }

        return { valid: false, message: 'Incorrect OTP' };
    },

    // 4. Send OTP (HYBRID LOGIC IS HERE) 🚜
    sendOTP: async (phone, otp, purpose = 'Verification') => {
        try {
            // CHECK: Kya hum REAL SMS bhejna chahte hain?
            const isProduction = process.env.NODE_ENV === 'production';
            const smsApiKey = process.env.SMS_API_KEY; // .env check karega

            if (isProduction && smsApiKey) {
                // --- 🔴 REAL SMS LOGIC (FUTURE) ---
                // Jab aap API khareed lenge, ye code chalega
                console.log(`📲 Sending Real SMS to ${phone}...`);
                
                // Example: Fast2SMS / Twilio code here
                // await axios.post('https://api.sms-provider.com/send', {
                //     to: phone,
                //     message: `KrishiLink: Your OTP is ${otp}. Valid for 10 mins.`
                // });

                return true;
            } else {
                // --- 🟢 FREE TESTING LOGIC (CURRENT) ---
                // Ye console me OTP print karega taaki aap bina paise kharch kiye test kar sakein
                console.log('=================================================');
                console.log(`🔔 [SMS SIMULATION] To: ${phone}`);
                console.log(`💬 Message: KrishiLink OTP for ${purpose} is: ${otp}`);
                console.log('=================================================');
                return true;
            }
        } catch (error) {
            console.error('SMS Sending Failed:', error);
            return false;
        }
    }
};

module.exports = otpService;