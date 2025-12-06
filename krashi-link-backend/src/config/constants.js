module.exports = {
  ROLES: {
    FARMER: 'farmer',
    OWNER: 'owner',
    ADMIN: 'admin'
  },
  
  BOOKING_STATUS: {
    REQUESTED: 'requested',
    OWNER_CONFIRMED: 'owner_confirmed',
    ARRIVED_OTP_VERIFIED: 'arrived_otp_verified',
    IN_PROGRESS: 'in_progress',
    COMPLETED_PENDING_PAYMENT: 'completed_pending_payment',
    PAID: 'paid',
    CANCELLED: 'cancelled',
    AUTO_CANCELLED: 'auto_cancelled',
    DISPUTED: 'disputed'
  },
  
  MACHINE_TYPES: {
    TRACTOR: 'tractor',
    HARVESTER: 'harvester',
    SPRAYER: 'sprayer',
    THRESHER: 'thresher',
    OTHER: 'other'
  },
  
  BILLING_SCHEMES: {
    TIME: 'time',
    AREA: 'area',
    DAILY: 'daily'
  },
  
  TRANSACTION_TYPES: {
    DEBIT: 'debit',
    CREDIT: 'credit',
    REFUND: 'refund',
    HOLD: 'hold',
    RELEASE: 'release'
  },
  
  DISPUTE_CODES: {
    LATE_ARRIVAL: 'LATE_ARRIVAL',
    OTP_MISMATCH: 'OTP_MISMATCH',
    BILLING_ISSUE: 'BILLING_ISSUE',
    OTHER: 'OTHER'
  },
  
  ERROR_CODES: {
    AUTH_401: 'AUTH_401',
    AUTH_403: 'AUTH_403',
    VAL_400: 'VAL_400',
    BK_404: 'BK_404',
    MC_404: 'MC_404',
    OTP_400: 'OTP_400',
    BK_STATE_409: 'BK_STATE_409',
    PAY_409: 'PAY_409',
    SYS_500: 'SYS_500'
  },
  
  // Add new constants
  BILLING_UNITS: {
    HOUR: 'hour',
    BIGHA: 'bigha',
    DAY: 'day'
  },
  
  MACHINE_CONDITIONS: {
    EXCELLENT: 'excellent',
    GOOD: 'good',
    FAIR: 'fair',
    POOR: 'poor'
  },
  
  FUEL_TYPES: {
    DIESEL: 'diesel',
    PETROL: 'petrol',
    ELECTRIC: 'electric',
    OTHER: 'other'
  }
};