const otpStore = new Map();

const otpService = {
    // 1. Generate OTP
    generateOTP: (length = 6) => {
        const digits = '0123456789';
        let otp = '';
        for (let i = 0; i < length; i++) {
            otp += digits[Math.floor(Math.random() * 10)];
        }
        return otp;
    },

    // 2. Store OTP
    storeOTP: (key, type, otp, ttlMinutes = 10) => {
        try {
            const strKey = String(key); // ObjectId ko String banana jaruri hai
            const fullKey = `${strKey}_${type}`;
            const expiresAt = Date.now() + ttlMinutes * 60 * 1000;
            
            otpStore.set(fullKey, { otp, expiresAt });

            // 👇 DEBUG LOG
            console.log(`✅ [OTP STORED] Key: ${fullKey} | OTP: ${otp}`);
            console.log(`📊 Current Store Size: ${otpStore.size}`);

            // Auto cleanup
            setTimeout(() => {
                if (otpStore.has(fullKey)) {
                    otpStore.delete(fullKey);
                    console.log(`🗑️ [OTP EXPIRED/CLEANED] Key: ${fullKey}`);
                }
            }, ttlMinutes * 60 * 1000);
            
            return true;
        } catch (error) {
            console.error("Store OTP Error:", error);
            return false;
        }
    },

    // 3. Verify OTP
    verifyOTP: (key, type, inputOTP) => {
        try {
            const strKey = String(key);
            const fullKey = `${strKey}_${type}`;
            
            // 👇 DEBUG LOGS (Ye terminal me check karein)
            console.log(`🔍 [OTP VERIFY START] Checking Key: ${fullKey}`);
            console.log(`📥 Input OTP: '${inputOTP}'`);

            const data = otpStore.get(fullKey);

            if (!data) {
                console.log(`❌ [OTP FAILED] No data found for key: ${fullKey}`);
                console.log(`📋 Available Keys in Store:`, [...otpStore.keys()]); // Ye batayega ki store khali to nahi ho gaya
                return { valid: false, message: 'OTP expired or not found' };
            }

            if (Date.now() > data.expiresAt) {
                otpStore.delete(fullKey);
                console.log(`❌ [OTP FAILED] OTP Expired`);
                return { valid: false, message: 'OTP expired' };
            }

            // Loose equality (==) handles string vs number issues
            if (data.otp == inputOTP) {
                otpStore.delete(fullKey); // Delete after success
                console.log(`✅ [OTP SUCCESS] Matched!`);
                return { valid: true, message: 'Verified' };
            }

            console.log(`❌ [OTP FAILED] Mismatch! Stored: '${data.otp}' vs Input: '${inputOTP}'`);
            return { valid: false, message: 'Incorrect OTP' };

        } catch (error) {
            console.error("Verify OTP Error:", error);
            return { valid: false, message: 'Error verifying OTP' };
        }
    },

    // 4. Send OTP (Hybrid)
    sendOTP: async (phone, otp, purpose = 'Verification') => {
        // ... (Send Logic Same as before)
        console.log('=================================================');
        console.log(`🔔 [SMS SIMULATION] To: ${phone}`);
        console.log(`💬 Message: KrishiLink OTP for ${purpose} is: ${otp}`);
        console.log('=================================================');
        return true;
    }
};

module.exports = otpService;