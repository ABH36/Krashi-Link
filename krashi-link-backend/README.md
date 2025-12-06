# Krashi Link Backend

This repository contains a scaffolded Node.js/Express backend for a machine-rental and booking system. The code includes models, controllers, routes, middlewares, utilities, services, and a sample cron job.

## Quick start

1. Install dependencies

```powershell
cd "c:/Users/FTT/Desktop/F -ARM/krashi-link-backend"
npm install
```

2. Update `.env` with your config and MongoDB connection string

3. Run in development

```powershell
npm run dev
```

4. Health check

Open http://localhost:5000/ to see a basic health check.

## Folder structure

- `server.js` - Entry point
- `src/config` - DB and configuration
- `src/controllers` - Route handlers
- `src/models` - Mongoose models
- `src/routes` - Express route files
- `src/middlewares` - Authentication, role checks, validation, rate limiting
- `src/services` - Notifications, wallet, SMS/voice stubs
- `src/utils` - Helpers: otp, billing, idempotency, audit logging
- `src/jobs` - Cron and scheduled jobs
- `src/logs` - created for logs

## Next steps (recommended)

- Add JWT auth and secure password hashing using bcrypt
- Create validation using `express-validator`
- Implement actual payment gateway and SMS/email providers
- Add tests and CI

---

This is an initial scaffold; controllers and middlewares are stubs and must be improved for production.
