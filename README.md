# RayGPT Server

Backend server for the RayGPT application with Firebase Firestore database integration.

## Project Structure

```
server/
├── config/
│   └── firebase.js              # Firebase configuration and initialization
├── database/
│   └── initDatabase.js          # Database initialization with sample data
├── routes/
│   ├── users.js                 # User management routes
│   ├── businessManual.js        # Business manual submission/response routes
│   └── kyc.js                   # KYC submission and verification routes
├── services/
│   ├── userService.js           # User service layer
│   ├── businessManualService.js # Business manual service layer
│   └── kycService.js            # KYC service layer
├── .env                         # Environment variables
├── package.json                 # Dependencies and scripts
├── index.js                     # Main server file
└── raygpt-42372-firebase-adminsdk-fbsvc-6ca0a609fc.json # Firebase service account key
```

## Database Collections

The Firebase Firestore database includes the following collections:

### 1. `users`

- User account information
- Profile data
- KYC status
- User preferences

### 2. `business_manual_submission`

- Business manual requests from users
- Business information and requirements
- Submission status and metadata

### 3. `business_manual_response`

- AI-generated business manuals
- Response data linked to submissions
- Generated content and metadata

### 4. `kyc_submission`

- KYC documentation submissions
- Personal and business information
- Document verification status
- Review notes and approval data

## Quick Start

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Initialize the database:**

   ```bash
   npm run init-db
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

4. **Start the production server:**
   ```bash
   npm start
   ```

## Environment Variables

The following environment variables are required:

### Required

- `FIREBASE_PROJECT_ID`: Firebase project ID
- `FIREBASE_SERVICE_ACCOUNT_KEY`: Path to Firebase service account key JSON file
- `JWT_SECRET`: Secret key for JWT token signing
- `FRONTEND_URL`: Frontend application URL for CORS and redirects

### API Keys

- `DIDIT_API_KEY`: API key for DIDit KYC verification service
- `OPENROUTER_API_KEY`: API key for OpenRouter (Mistral AI) service
- `STRIPE_SECRET_KEY`: Stripe secret key for payment processing
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret for payment verification

### Optional

- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)
- `CLIENT_URL`: Client base URL for email templates
- `EMAIL_USER`: Email address for sending notifications
- `EMAIL_PASS`: Email password/app password

Copy `.env.example` to `.env` and fill in your actual values.

## Deployment

### Production Setup

1. **Set up environment variables:**

   ```bash
   cp .env.example .env
   # Edit .env with your production values
   ```

2. **Install dependencies:**

   ```bash
   npm install --production
   ```

3. **Initialize database (if needed):**

   ```bash
   npm run init-db
   ```

4. **Start production server:**
   ```bash
   npm start
   ```

### Environment Variables for Production

For production deployment, ensure you:

- Set `NODE_ENV=production`
- Use production Firebase project and service account
- Set `FRONTEND_URL` to your production frontend domain
- Use production API keys and secrets
- Configure proper email settings
- Set up Stripe webhook endpoints with production secrets

### Security Considerations

- Never commit `.env` file to version control
- Firebase service account keys should not be committed
- Use strong, unique secrets for JWT and API keys
- Configure CORS properly for your domains
- Set up proper firewall rules
- Use HTTPS in production

## API Endpoints

### Users (`/api/users`)

- `GET /` - Get all users
- `GET /:id` - Get user by ID
- `GET /email/:email` - Get user by email
- `POST /` - Create new user
- `PUT /:id` - Update user
- `DELETE /:id` - Delete user

### Business Manual (`/api/business-manual`)

- `POST /submit` - Submit business manual request
- `GET /submissions/:id` - Get submission by ID
- `GET /user/:userId` - Get user's submissions
- `PUT /submissions/:id/status` - Update submission status
- `POST /response` - Create manual response
- `GET /response/submission/:submissionId` - Get response by submission ID
- `GET /responses/user/:userId` - Get user's responses
- `GET /pending` - Get pending submissions (admin)

### KYC (`/api/kyc`)

- `POST /submit` - Submit KYC documentation
- `GET /:id` - Get KYC submission by ID
- `GET /user/:userId` - Get KYC by user ID
- `PUT /:id/status` - Update KYC status
- `PUT /:id/document/:documentType/status` - Update document status
- `GET /` - Get all KYC submissions (admin)
- `GET /status/pending` - Get pending KYC submissions
- `GET /admin/statistics` - Get KYC statistics

## Security Features

- Helmet.js for security headers
- CORS configuration
- Request body size limits
- Input validation
- Error handling

## Development

- Uses ES6 modules
- Express.js framework
- Firebase Admin SDK
- Environment-based configuration
- Nodemon for development

## Database Initialization

Run `npm run init-db` to initialize the database with sample data for testing and development.
