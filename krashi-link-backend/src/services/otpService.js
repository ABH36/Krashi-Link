class OTPService {
  constructor() {
    this.otpStore = new Map(); // In production, use Redis
  }

  generateOTP(length = 6) {
    return Math.floor(Math.pow(10, length-1) + Math.random() * 9 * Math.pow(10, length-1)).toString();
  }

  storeOTP(bookingId, type, otp, expiresInMinutes = 10) {
    const key = `${bookingId}_${type}`;
    const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;
    
    this.otpStore.set(key, {
      otp,
      expiresAt,
      attempts: 0,
      maxAttempts: 3
    });

    // Auto cleanup
    setTimeout(() => {
      this.otpStore.delete(key);
    }, expiresInMinutes * 60 * 1000);
  }

  verifyOTP(bookingId, type, inputOTP) {
    const key = `${bookingId}_${type}`;
    const stored = this.otpStore.get(key);

    if (!stored) {
      return { valid: false, reason: 'OTP_NOT_FOUND' };
    }

    if (Date.now() > stored.expiresAt) {
      this.otpStore.delete(key);
      return { valid: false, reason: 'OTP_EXPIRED' };
    }

    if (stored.attempts >= stored.maxAttempts) {
      this.otpStore.delete(key);
      return { valid: false, reason: 'MAX_ATTEMPTS_EXCEEDED' };
    }

    stored.attempts++;

    if (stored.otp !== inputOTP) {
      return { 
        valid: false, 
        reason: 'INVALID_OTP',
        attemptsLeft: stored.maxAttempts - stored.attempts
      };
    }

    // Valid OTP - clear it
    this.otpStore.delete(key);
    return { valid: true };
  }

  getRemainingTime(bookingId, type) {
    const key = `${bookingId}_${type}`;
    const stored = this.otpStore.get(key);
    
    if (!stored) return 0;
    return Math.max(0, Math.ceil((stored.expiresAt - Date.now()) / 1000));
  }
}

module.exports = new OTPService();