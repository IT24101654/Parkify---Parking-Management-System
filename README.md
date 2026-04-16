# Parkify - Payment Management Module

## Setup Instructions

### Backend Configuration
Copy the template and fill in your credentials:

```bash
cp backend/src/main/resources/application.properties.template \
   backend/src/main/resources/application.properties
```

Then edit `application.properties` and fill in:
- `spring.datasource.password` — your MySQL password
- `stripe.api.key` — from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
- `stripe.webhook.secret` — from Stripe webhooks
- `twilio.account.sid` — from [Twilio Console](https://www.twilio.com/console)
- `twilio.auth.token` — from Twilio Console
- `twilio.phone.number` — your Twilio phone number

### Running the App

**Backend:**
```bash
cd backend
mvn spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

App will be available at: http://localhost:5173
