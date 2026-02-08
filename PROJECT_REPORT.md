# KRASHI-LINK: Agricultural Machinery Rental Platform
## Complete Project Report

---

## 1. INTRODUCTION

**Krashi-Link** एक modern web-based platform है जो farmers और machinery owners को connect करता है। यह platform machinery rental को easy, transparent और secure बनाता है।

**Project Type:** Full-stack Web Application (MERN Stack)
**Purpose:** Agricultural Machinery Rental & Booking System

---

## 2. PROBLEM STATEMENT

### समस्या:
- Farmers को quality machinery किराए पर मिलना मुश्किल है
- Owners को अपनी machinery किराए पर देने का proper channel नहीं है
- Payment transparency और dispute resolution की कमी है
- Location-based machinery discovery नहीं है
- Trust और rating system नहीं है

### Solution:
एक centralized platform जहाँ:
- Farmers machines को location-based search कर सकें
- Owners अपनी machines list कर सकें
- Secure payment processing हो
- Real-time booking tracking हो
- Dispute resolution हो

---

## 3. OBJECTIVES

1. **Farmer के लिए:**
   - Nearby machines को search करना (location-based)
   - Real-time booking करना
   - OTP-based verification
   - Secure payment करना
   - Reviews छोड़ना

2. **Owner के लिए:**
   - Machines list करना (pricing + availability)
   - Booking requests को accept/reject करना
   - Earnings track करना
   - Real-time notifications

3. **Admin के लिए:**
   - User verification
   - Dispute resolution
   - Analytics & reporting
   - Broadcasting messages

---

## 4. TECHNOLOGY STACK

### **Backend:**
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT (JSON Web Tokens)
- **Real-time:** Socket.IO
- **Payment Gateway:** Razorpay
- **Security:** 
  - bcryptjs (Password hashing)
  - Helmet.js (Security headers)
  - Express-rate-limit (Rate limiting)
- **Validation:** Joi
- **Logging:** Morgan

### **Frontend:**
- **Framework:** React 18
- **Routing:** React Router v6
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Real-time:** Socket.IO Client
- **Maps:** Leaflet + React-Leaflet
- **Charts:** Recharts
- **Internationalization:** i18next (Hindi/English)
- **State Management:** React Context API
- **PWA:** Service Workers

---

## 5. KEY FEATURES

### **Authentication & Authorization:**
- Phone number based registration
- Password hashing (bcryptjs)
- JWT token-based authentication
- Role-based access control (Farmer, Owner, Admin)
- Account verification system

### **Machine Management:**
- Add/Edit/Delete machines by owners
- Machine details: Type, Model, Pricing scheme
- Pricing schemes: Hourly, Daily, Area-based (Bigha)
- Location tracking (Lat/Lng)
- Maintenance tracking
- Rating & review system
- Machine availability status

### **Booking System:**
- Real-time booking requests
- Multi-stage booking status flow:
  - Requested → Owner Confirmed → Arrival OTP Verified → In Progress → Completed → Payment → Paid
- Arrival & Completion OTP verification
- Timer-based billing (Start/Stop)
- Cancellation with reason tracking
- Dispute management

### **Payment Processing:**
- Razorpay integration
- Multiple transaction types (debit, credit, refund, hold, release)
- Payment verification
- Wallet system for owners
- Transaction history

### **Real-time Features:**
- Socket.IO for live notifications
- Real-time booking updates
- Live timer during machine usage
- Real-time status changes

### **Admin Features:**
- User verification & management
- Dispute resolution
- Analytics & metrics
- Broadcasting messages
- Activity logging & audit trails

---

## 6. FUNCTIONAL REQUIREMENTS

| Feature | Description |
|---------|-------------|
| **User Registration** | Phone-based signup with role selection |
| **Login/Authentication** | JWT-based secure authentication |
| **Machine Discovery** | Search machines by location, type, price |
| **Booking Creation** | Create & track machine bookings |
| **OTP Verification** | Arrival & completion OTP verification |
| **Payment Processing** | Razorpay integration for secure payments |
| **Real-time Updates** | Socket.IO for live notifications |
| **Review & Rating** | Rate machines & owners after booking |
| **Wallet Management** | Owner earnings wallet |
| **Dispute System** | Report & resolve disputes |
| **Admin Dashboard** | User management, analytics, verification |

---

## 7. NON-FUNCTIONAL REQUIREMENTS

| Requirement | Details |
|-------------|---------|
| **Security** | JWT auth, bcrypt hashing, CORS, helmet, rate limiting |
| **Performance** | Request timeout: 15s, Compression enabled |
| **Scalability** | MongoDB indexing on key fields, horizontal scaling ready |
| **Availability** | Error handling, auto-logout on 401 |
| **Usability** | Multi-language (Hindi/English), PWA, responsive design |
| **Reliability** | Error boundaries, validation, audit logging |
| **Maintainability** | Modular architecture, clear separation of concerns |

---

## 8. SOFTWARE REQUIREMENTS

### **Backend Dependencies:**
```
- express: 4.18.2 (Web framework)
- mongoose: 7.5.0 (Database ODM)
- jsonwebtoken: 9.0.2 (Authentication)
- bcryptjs: 2.4.3 (Password hashing)
- socket.io: 4.7.2 (Real-time communication)
- razorpay: 2.9.6 (Payment processing)
- joi: 17.9.2 (Validation)
- helmet: 7.0.0 (Security)
- cors: 2.8.5 (Cross-origin)
- morgan: 1.10.0 (Logging)
```

### **Frontend Dependencies:**
```
- react: 18.2.0 (UI framework)
- react-router-dom: 6.30.2 (Routing)
- axios: 1.5.0 (HTTP client)
- socket.io-client: 4.7.2 (Real-time)
- leaflet: 1.9.4 (Maps)
- recharts: 2.8.0 (Charts)
- tailwindcss: 3.3.3 (Styling)
- i18next: 22.5.1 (Translations)
```

---

## 9. HARDWARE REQUIREMENTS

### **Server:**
- Processor: 2+ cores
- RAM: 4+ GB
- Storage: 50+ GB
- Network: Stable internet connection

### **Client:**
- Modern browser (Chrome, Firefox, Safari)
- Mobile device (iOS/Android) for PWA
- Minimum 4GB RAM for smooth operation

---

## 10. DATABASE SCHEMA (ER DIAGRAM)

```
┌─────────────┐
│    User     │
├─────────────┤
│ _id (PK)    │
│ name        │
│ phone (UQ)  │
│ password    │
│ role        │
│ verified    │
│ trustScore  │
│ addresses[] │
│ lang        │
└──────┬──────┘
       │ (1:M)
       │
   ┌───┴────────┬──────────────┬──────────────┐
   │            │              │              │
   ▼            ▼              ▼              ▼
┌──────────┐ ┌─────────┐ ┌────────┐ ┌──────────────┐
│ Machine  │ │Booking  │ │Review  │ │Notification │
├──────────┤ ├─────────┤ ├────────┤ ├──────────────┤
│ _id (PK) │ │ _id(PK) │ │_id(PK) │ │_id (PK)      │
│ ownerId  │ │farmerId │ │ownerId │ │userId        │
│ type     │ │ownerId  │ │machineId││title         │
│ name     │ │machineId│ │bookingId││message       │
│ location │ │ status  │ │farmerId │ │type          │
│ pricing  │ │schedule │ │ rating  │ │read          │
│ images[] │ │ otp     │ │ comment │ │metadata      │
│ reviews[]│ │ billing │ │ created │ │created       │
└──────────┘ │ payment │ │updated  │ └──────────────┘
             │ created │ └────────┘
             └─────────┘
                  │
                  │ (1:M)
                  ▼
            ┌──────────────┐
            │  Transaction │
            ├──────────────┤
            │ _id (PK)     │
            │ bookingId    │
            │ farmerId     │
            │ ownerId      │
            │ type         │
            │ amount       │
            │ status       │
            │ gateway      │
            └──────────────┘
```

---

## 11. DATABASE TABLES

### **Users**
```javascript
{
  _id: ObjectId,
  name: String,
  phone: String (unique, Indian format),
  password: String (hashed),
  role: "farmer" | "owner" | "admin",
  verified: Boolean,
  trustScore: Number (0-100),
  addresses: [{label, location, village, district, state}],
  lang: "hi" | "en",
  timestamps: {createdAt, updatedAt}
}
```

### **Machines**
```javascript
{
  _id: ObjectId,
  ownerId: ObjectId (ref: User),
  type: "tractor" | "harvester" | "sprayer" | "thresher" | "other",
  name: String,
  model: String,
  pricing: {
    scheme: "hourly" | "daily" | "area" | "time",
    rate: Number,
    unit: "hour" | "bigha" | "day"
  },
  location: {lat, lng, addressText},
  availability: Boolean,
  maintenance: {lastServiceAt, nextServiceDueAt, notes},
  images: [String],
  meta: {
    year, condition, fuelType, 
    averageRating, reviewCount
  },
  usageHistory: [{bookingId, startAt, endAt}],
  timestamps
}
```

### **Bookings**
```javascript
{
  _id: ObjectId,
  farmerId: ObjectId (ref: User),
  ownerId: ObjectId (ref: User),
  machineId: ObjectId (ref: Machine),
  status: "requested" | "owner_confirmed" | "arrived_otp_verified" | 
          "in_progress" | "completed_pending_payment" | "paid" | 
          "cancelled" | "disputed",
  schedule: {requestedStartAt, arrivalDeadlineAt, estimatedDuration},
  otp: {arrivalOTP, completionOTP, arrivalVerifiedAt, completionVerifiedAt},
  timer: {startedAt, stoppedAt, durationMinutes},
  billing: {scheme, rate, unit, areaBigha, calculatedAmount, paidAmount},
  payment: {transactionId, status, paidAt},
  cancellation: {reason, by, at},
  dispute: {code, description},
  timestamps
}
```

### **Transactions**
```javascript
{
  _id: ObjectId,
  bookingId: ObjectId (ref: Booking),
  farmerId: ObjectId (ref: User),
  ownerId: ObjectId (ref: User),
  type: "debit" | "credit" | "refund" | "hold" | "release" | "payment",
  amount: Number,
  status: "pending" | "verified" | "failed" | "released" | "refunded" | "completed",
  gateway: String (default: "none"),
  gatewayOrderId: String,
  gatewayPaymentId: String,
  audit: {createdBy, notes},
  timestamps
}
```

### **Reviews**
```javascript
{
  _id: ObjectId,
  ownerId: ObjectId (ref: User),
  machineId: ObjectId (ref: Machine),
  bookingId: ObjectId (ref: Booking, unique),
  farmerId: ObjectId (ref: User),
  rating: Number (1-5),
  comment: String (max 500 chars),
  timestamps
}
```

### **Notifications**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  title: String,
  message: String,
  type: "info" | "success" | "warning" | "error",
  read: Boolean,
  metadata: {bookingId, role},
  timestamps
}
```

---

## 12. FOLDER STRUCTURE

### **Backend:**
```
krashi-link-backend/
├── server.js (Entry point)
├── package.json
├── src/
│   ├── config/
│   │   ├── constants.js (Error codes, enums)
│   │   └── database.js (MongoDB connection)
│   ├── models/
│   │   ├── User.js
│   │   ├── Machine.js
│   │   ├── Booking.js
│   │   ├── Transaction.js
│   │   ├── Review.js
│   │   └── Notification.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── machineController.js
│   │   ├── bookingController.js
│   │   ├── paymentController.js
│   │   ├── reviewController.js
│   │   ├── adminController.js
│   │   └── notificationController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── machines.js
│   │   ├── bookings.js
│   │   ├── payments.js
│   │   ├── reviews.js
│   │   ├── admin.js
│   │   └── notifications.js
│   ├── middlewares/
│   │   ├── auth.js (JWT verification)
│   │   ├── role.js (Role-based access)
│   │   ├── validation.js (Input validation)
│   │   ├── errorHandler.js (Error handling)
│   │   ├── rateLimit.js (Rate limiting)
│   │   └── sanitize.js (XSS protection)
│   ├── services/
│   │   ├── otpService.js
│   │   ├── razorpayService.js
│   │   ├── socketService.js
│   │   ├── walletService.js
│   │   └── smsVoiceStubs.js
│   └── utils/
│       └── notificationHelper.js
```

### **Frontend:**
```
krashi-link-frontend/
├── public/
├── src/
│   ├── App.js
│   ├── index.js
│   ├── components/
│   │   ├── common/ (Navbar, Modal, Button, etc)
│   │   ├── admin/ (Dashboard, UserTable)
│   │   ├── farmer/ (BookingFlow, MachineCard)
│   │   └── owner/ (MachineForm, EarningsTile)
│   ├── pages/
│   │   ├── Admin/
│   │   ├── Auth/
│   │   ├── Farmer/
│   │   ├── Owner/
│   │   ├── Payment/
│   │   └── Review/
│   ├── context/
│   │   ├── AuthContext.js
│   │   ├── SocketContext.js
│   │   └── LocaleContext.js
│   ├── services/
│   │   ├── api.js (Axios instance)
│   │   ├── authService.js
│   │   ├── bookingService.js
│   │   ├── machineService.js
│   │   └── paymentService.js
│   ├── hooks/
│   │   ├── useBookingSocket.js
│   │   └── useBookingTimer.js
│   ├── styles/
│   │   └── index.css
│   └── utils/
│       └── razorpay.js
```

---

## 13. API ROUTES OVERVIEW

### **Authentication:**
```
POST   /api/auth/register     → User registration
POST   /api/auth/login        → User login
GET    /api/auth/me           → Get current user (Protected)
POST   /api/auth/2fa/send     → Send 2FA code (Protected)
POST   /api/auth/2fa/verify   → Verify 2FA (Protected)
```

### **Machines:**
```
GET    /api/machines          → List all machines
POST   /api/machines          → Create machine (Owner)
GET    /api/machines/:id      → Get machine details
PUT    /api/machines/:id      → Update machine (Owner)
DELETE /api/machines/:id      → Delete machine (Owner)
```

### **Bookings:**
```
POST   /api/bookings                    → Create booking (Farmer)
GET    /api/bookings/user               → Get user's bookings (Protected)
GET    /api/bookings/owner/my-bookings  → Get owner's bookings
GET    /api/bookings/:id                → Get booking details
PUT    /api/bookings/:id/confirm        → Confirm booking (Owner)
PUT    /api/bookings/:id/verify-arrival → Verify arrival OTP
PUT    /api/bookings/:id/verify-completion → Verify completion OTP
PUT    /api/bookings/:id/cancel         → Cancel booking
POST   /api/bookings/:id/dispute        → Create dispute
POST   /api/bookings/:id/resend-otp     → Resend OTP
```

### **Payments:**
```
POST   /api/payments/initiate           → Initiate payment (Razorpay)
POST   /api/payments/verify             → Verify payment
POST   /api/payments/history            → Get payment history
```

### **Reviews:**
```
POST   /api/reviews           → Create review (Farmer)
GET    /api/reviews/machine/:id → Get machine reviews
GET    /api/reviews/my        → Get user's reviews
```

### **Admin:**
```
GET    /api/admin/users       → List users (Admin)
PUT    /api/admin/users/:id   → Update user verification (Admin)
POST   /api/admin/broadcast   → Send broadcast message (Admin)
GET    /api/admin/analytics   → Get analytics (Admin)
GET    /api/admin/disputes    → Get disputes (Admin)
```

---

## 14. BOOKING WORKFLOW (State Machine)

```
┌──────────┐
│ Requested│ ← Farmer creates booking
└────┬─────┘
     │ Owner accepts/rejects
     ▼
┌─────────────────┐
│ Owner Confirmed │
└────┬────────────┘
     │ Owner arrives, provides arrival OTP
     ▼
┌──────────────────────┐
│ Arrived OTP Verified │
└────┬─────────────────┘
     │ Farmer starts machine usage (start timer)
     ▼
┌──────────────┐
│ In Progress  │
└────┬─────────┘
     │ Farmer stops machine (stop timer)
     ▼
┌──────────────────────┐
│ Completed Pending    │
│ Payment              │ ← Owner provides completion OTP
└────┬─────────────────┘
     │ Farmer verifies completion OTP
     ▼
┌──────────────────────┐
│ Completed Payment    │ ← Payment amount calculated from timer
│ Verification         │
└────┬─────────────────┘
     │ Farmer makes payment (Razorpay)
     ▼
┌──────────┐
│   Paid   │ ← Booking complete
└──────────┘

Alternative flows:
- Cancelled → Cancellation reason tracked
- Disputed → Dispute code tracked for admin review
```

---

## 15. SECURITY FEATURES

| Feature | Implementation |
|---------|-----------------|
| **Password Security** | bcryptjs with 12-salt rounds |
| **Authentication** | JWT tokens in Bearer header |
| **Authorization** | Role-based middleware checks |
| **Input Validation** | Joi schema validation |
| **Rate Limiting** | Express-rate-limit on auth endpoints |
| **XSS Protection** | Input sanitization middleware |
| **CORS** | Configurable origin whitelist |
| **Security Headers** | Helmet.js |
| **HTTPS** | Ready for SSL/TLS |
| **Phone Validation** | Indian phone format (10 digits, starts with 6-9) |

---

## 16. TESTING CHECKLIST

### **Backend Testing:**
- [ ] Unit tests for models and services
- [ ] API endpoint testing with Jest + Supertest
- [ ] Authentication flow testing
- [ ] Rate limiting verification
- [ ] Payment gateway mocking
- [ ] Error handling validation

### **Frontend Testing:**
- [ ] Component rendering tests
- [ ] Context API state management
- [ ] API integration testing
- [ ] Socket.IO connection testing
- [ ] Navigation and routing tests
- [ ] Form validation tests

### **Integration Testing:**
- [ ] End-to-end booking flow
- [ ] Payment processing flow
- [ ] Real-time notification delivery
- [ ] Admin dispute resolution

---

## 17. LIMITATIONS

1. **SMS/Voice Verification:** Currently using stubs, needs real SMS provider integration
2. **Wallet System:** Basic implementation, needs expansion for settlements
3. **Maps Integration:** Leaflet-based, could optimize with Mapbox for better performance
4. **Offline Support:** Limited offline functionality in PWA
5. **Scalability:** MongoDB single instance, needs replication for production
6. **Payment Gateway:** Razorpay integration needs production setup
7. **Language Support:** Only Hindi & English, easily extendable
8. **Image Storage:** Currently uses URLs, needs cloud storage (AWS S3, Cloudinary)
9. **Search/Filter:** Basic implementation, needs Elasticsearch for complex queries
10. **Mobile App:** Currently web-based only, needs native mobile apps

---

## 18. FUTURE ENHANCEMENTS

### **Short Term (3-6 months):**
1. Real SMS/Email integration (Twilio, SendGrid)
2. Advanced search filters (machine condition, ratings, price range)
3. Machine recommendation engine
4. User ratings for farmers (2-way trust)
5. Subscription plans for owners
6. Analytics dashboard improvements
7. Multi-language support expansion

### **Medium Term (6-12 months):**
1. Native mobile apps (React Native)
2. AI-based dispute resolution
3. Machine tracking with GPS
4. Maintenance reminder system
5. Insurance integration
6. Peer-to-peer messaging
7. Equipment inspection checklist

### **Long Term (12+ months):**
1. Supply chain integration
2. Government scheme integration
3. Insurance marketplace
4. Equipment trade-in system
5. Financing/EMI options
6. AI-powered pricing suggestions
7. Marketplace for spare parts
8. Machine rental analytics for owners

---

## 19. DEPLOYMENT ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│         Deployed on: Vercel / Netlify / AWS S3 + CloudFront │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS
                     │
┌────────────────────▼────────────────────────────────────────┐
│                 API Gateway / Load Balancer                  │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              Backend (Node.js + Express)                     │
│            Deployed on: Heroku / Railway / AWS EC2           │
│                  (Multiple instances)                        │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
         ▼           ▼           ▼
    ┌────────┐  ┌────────┐  ┌──────────┐
    │MongoDB │  │Razorpay│  │Socket.IO │
    │Database│  │Gateway │  │Server    │
    └────────┘  └────────┘  └──────────┘
```

---

## 20. CONCLUSION

**Krashi-Link** एक well-structured, production-ready web application है जो agricultural machinery rental को digitize करता है। 

### **Key Strengths:**
- ✅ Modern tech stack (MERN)
- ✅ Secure authentication & authorization
- ✅ Real-time communication with Socket.IO
- ✅ Comprehensive booking workflow
- ✅ Integrated payment processing
- ✅ Multi-language support
- ✅ PWA-ready architecture
- ✅ Modular & scalable structure

### **Ready for:**
- Production deployment
- User testing
- Mobile app development
- Feature expansion

---

## 21. QUICK START GUIDE

### **Backend Setup:**
```bash
cd krashi-link-backend
npm install
# Create .env file with MongoDB URI, JWT_SECRET, Razorpay keys
npm run dev        # Development
npm start          # Production
```

### **Frontend Setup:**
```bash
cd krashi-link-frontend
npm install
# Create .env file with REACT_APP_API_URL
npm start          # Development
npm run build      # Production
```

---

## CONTACT & SUPPORT

**Repository:** https://github.com/ABH36/Krashi_Link
**Branch:** main

---

**Report Generated:** December 2025
**Status:** Active Development ✅

