# Clarity Connect - Anonymous Mental Health Support Platform

A comprehensive mental health support platform designed for students, providing anonymous peer support, professional counseling, AI wellness companion, and mood tracking in a safe, judgment-free environment.

## 🎯 Project Overview

**Current Status**: Frontend implementation complete in Lovable
**Tech Stack**: React + TypeScript + Tailwind CSS (Frontend) | Node.js + Express + MongoDB + Socket.io (Backend - to be implemented)

### Key Features Implemented (Frontend)
- ✅ Anonymous user registration with unique User Codes (U-XXXXXXXX)
- ✅ Admin gate system with secure access code verification
- ✅ PHQ-9 and GAD-7 mental health assessments with scoring
- ✅ Interactive virtual pet that reflects user mood
- ✅ Responsive dashboard with wellness tracking
- ✅ Calm, accessible UI with pastel design system
- ✅ Complete authentication flows
- ✅ Mobile-first responsive design

## 🚀 Quick Start (Frontend Only - Current State)

This Lovable project contains the complete frontend implementation. To run locally:

1. **Clone the repository**
```bash
git clone <repository-url>
cd clarity-connect
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

The frontend will be available at `http://localhost:8080`

## 🏗️ Complete Production Setup

To deploy the full application (frontend + backend), follow these implementation steps:

### Backend Implementation Required

The frontend is ready for integration. You need to implement the Node.js/Express backend with the following structure:

```
backend/
├── src/
│   ├── controllers/
│   │   ├── auth.js          # Authentication & user management
│   │   ├── assessments.js   # PHQ-9/GAD-7 handling
│   │   ├── mood.js          # Mood tracking
│   │   ├── booking.js       # Counseling session booking
│   │   ├── community.js     # Peer community posts
│   │   ├── admin.js         # Admin dashboard & management
│   │   ├── messaging.js     # Real-time messaging
│   │   └── chatbot.js       # AI wellness companion
│   ├── models/
│   │   ├── User.js          # User model with userCode
│   │   ├── Assessment.js    # PHQ/GAD entries
│   │   ├── Mood.js          # Mood tracking entries
│   │   ├── Booking.js       # Counseling bookings
│   │   ├── CommunityPost.js # Community posts & comments
│   │   ├── Message.js       # Direct messaging
│   │   └── Flag.js          # Safety escalation flags
│   ├── middleware/
│   │   ├── auth.js          # JWT verification
│   │   ├── admin.js         # Admin role checking
│   │   ├── rateLimit.js     # Rate limiting
│   │   └── validation.js    # Input sanitization
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   ├── assessments.js   # Assessment endpoints
│   │   ├── mood.js          # Mood tracking endpoints
│   │   ├── booking.js       # Booking management
│   │   ├── community.js     # Community features
│   │   ├── admin.js         # Admin dashboard
│   │   └── messaging.js     # Messaging endpoints
│   ├── services/
│   │   ├── emailService.js  # Email notifications
│   │   ├── aiService.js     # AI chatbot integration
│   │   ├── cryptoService.js # UserCode generation
│   │   └── notificationService.js # Multi-channel notifications
│   ├── utils/
│   │   ├── database.js      # MongoDB connection
│   │   ├── socketManager.js # Socket.io setup
│   │   ├── cronJobs.js      # Reminder scheduling
│   │   └── validators.js    # Input validation
│   └── app.js              # Express app configuration
├── tests/
│   ├── auth.test.js        # Authentication tests
│   ├── booking.test.js     # Booking atomicity tests
│   ├── assessments.test.js # PHQ/GAD tests
│   └── integration/        # End-to-end tests
├── package.json
├── .env.example
└── server.js              # Entry point
```

## 🔐 Environment Variables

Create `.env` file in your backend directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/clarity-connect
# or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/clarity-connect

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Admin Security
ADMIN_GATE_CODE=admin4u

# AI Integration
AI_API_URL=https://your-ai-service.com/v1/chat/completions
AI_API_KEY=your-ai-api-key
AI_TIMEOUT_MS=10000

# Email Service (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Application
FRONTEND_URL=http://localhost:8080
BACKEND_PORT=3000
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Session Management
COOKIE_SECRET=your-cookie-secret
```

## 🗄️ Database Setup

### MongoDB Collections Schema

```javascript
// Users Collection
{
  userCode: { type: String, unique: true }, // U-XXXXXXXX format
  emailHash: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date,
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date
}

// PHQ Entries
{
  userCode: String,
  dateUTC: { type: Date, default: Date.now },
  score: Number,
  answers: [Number], // Array of 0-3 values
  severity: String   // Calculated severity level
}

// GAD Entries  
{
  userCode: String,
  dateUTC: { type: Date, default: Date.now },
  score: Number,
  answers: [Number],
  severity: String
}

// Mood Entries
{
  userCode: String,
  dateUTC: { type: Date, default: Date.now },
  moodValue: { type: Number, min: 1, max: 7 },
  note: String
}

// Counseling Slots
{
  slotId: { type: String, unique: true },
  name: String,
  description: String,
  datetimeUTC: Date,
  capacity: Number,
  remainingSlots: Number,
  type: { type: String, enum: ['Video', 'Voice', 'In-person'] },
  counselorInfo: {
    name: String,
    specializations: [String],
    bio: String
  },
  isActive: { type: Boolean, default: true }
}

// Bookings
{
  userCode: String,
  slotId: String,
  datetimeUTC: Date,
  type: String,
  status: { type: String, enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'] },
  createdAt: { type: Date, default: Date.now },
  remindersSent: {
    twentyFourHour: Boolean,
    oneHour: Boolean
  }
}
```

## 🔌 Critical API Endpoints

### Authentication
```
POST /api/auth/register
POST /api/auth/login  
POST /api/auth/refresh
POST /api/auth/logout
POST /api/admin/verify-gate-code
```

### Assessments
```
POST /api/assessments/phq
POST /api/assessments/gad
GET /api/assessments/history
```

### Mood Tracking
```
POST /api/mood
GET /api/mood/history
GET /api/mood/streak
```

### Counseling
```
GET /api/slots/available
POST /api/bookings (with atomic slot decrementing)
GET /api/bookings/my
PUT /api/bookings/:id/cancel
```

### Admin Dashboard
```
GET /api/admin/metrics
GET /api/admin/users/active
GET /api/admin/bookings/pending
POST /api/admin/slots
```

## 🧪 Testing

Run the test suite after implementing the backend:

```bash
# Unit tests
npm test

# Integration tests  
npm run test:integration

# Test coverage
npm run test:coverage
```

### Key Test Cases to Implement
1. **Booking Atomicity**: Ensure no double-bookings with concurrent requests
2. **Admin Gate**: Verify ADMIN_GATE_CODE enforcement
3. **PHQ/GAD Scoring**: Validate assessment calculations
4. **User Code Generation**: Test uniqueness and format
5. **Rate Limiting**: Verify protection against abuse
6. **JWT Security**: Test token validation and refresh

## 🔒 Security Implementation Checklist

- [ ] **Admin Gate**: Server-side ADMIN_GATE_CODE validation
- [ ] **Password Hashing**: Use bcrypt with appropriate rounds
- [ ] **Input Sanitization**: Prevent XSS and injection attacks
- [ ] **Rate Limiting**: Per-user and per-IP limits
- [ ] **JWT Security**: Proper secret management and validation
- [ ] **Database Security**: Parameterized queries, no raw inputs
- [ ] **CORS Configuration**: Restrict to allowed origins
- [ ] **Atomic Operations**: Transaction-based booking system

## 🤖 AI Integration

Configure your AI service (recommended: OpenAI GPT-4 or local LLM):

```javascript
// AI Service Implementation
const aiService = {
  async getChatResponse(userMessage, userHistory) {
    try {
      const response = await fetch(process.env.AI_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.AI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'You are a supportive mental health companion...' },
            { role: 'user', content: userMessage }
          ],
          max_tokens: 300,
          temperature: 0.7
        }),
        timeout: parseInt(process.env.AI_TIMEOUT_MS) || 10000
      });

      if (!response.ok) throw new Error('AI service unavailable');
      
      const data = await response.json();
      return data.choices[0].message.content;
      
    } catch (error) {
      // Fallback to rule-based responses
      return this.getRuleBasedResponse(userMessage);
    }
  },

  getRuleBasedResponse(message) {
    const responses = [
      "I hear you. Your feelings are valid.",
      "Remember, you're not alone in this journey.",
      "Consider reaching out to a counselor if these feelings persist.",
      "Have you tried any mindfulness exercises today?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)] + 
           "\n\n*Fallback mode active - limited responses available*";
  }
};
```

## 📱 Real-time Features (Socket.io)

```javascript
// Socket.io Implementation
const io = require('socket.io')(server, {
  cors: { origin: process.env.FRONTEND_URL }
});

io.on('connection', (socket) => {
  // Join user-specific room
  socket.on('join-user-room', (userCode) => {
    socket.join(`user-${userCode}`);
  });

  // Community real-time updates
  socket.on('join-community', () => {
    socket.join('community-feed');
  });

  // Admin dashboard updates
  socket.on('join-admin-dashboard', () => {
    socket.join('admin-updates');
  });

  // Direct messaging
  socket.on('send-message', async (data) => {
    // Validate and save message
    // Emit to recipient's room
    io.to(`user-${data.recipientCode}`).emit('new-message', message);
  });
});
```

## 🚀 Deployment Guide

### Production Deployment

1. **MongoDB Atlas Setup**
```bash
# Create cluster at https://cloud.mongodb.com
# Get connection string and update MONGODB_URI
```

2. **Backend Deployment (Railway/Heroku/DigitalOcean)**
```bash
# Set environment variables
# Deploy backend service
# Configure domain and SSL
```

3. **Frontend Deployment**
```bash
# Build frontend in Lovable and publish
# Update FRONTEND_URL in backend env
```

4. **Monitoring Setup**
```bash
# Set up logging (Winston)
# Configure error tracking (Sentry)
# Monitor performance metrics
```

## 📊 Seed Data

Run the seed script after database setup:

```bash
node scripts/seed.js
```

Creates:
- Sample admin account (use ADMIN_GATE_CODE to create)
- Initial resource library
- Helpline numbers by region
- Zero-initialized metrics

## 🔍 Admin Dashboard Metrics

Implement these calculated metrics:

- **Active Users**: Users with lastLogin within 24h
- **Chatbot Utilization**: Unique chatbot users / active users
- **Average Wellbeing Score**: Combined PHQ/GAD derived metric
- **Sessions Booked**: Confirmed bookings count
- **Community Engagement**: Posts + comments per active user

## 📞 Crisis Support Integration

Configure regional helplines in your database:

```javascript
const helplines = [
  {
    country: 'US',
    name: 'National Suicide Prevention Lifeline',
    number: '988',
    available: '24/7'
  },
  {
    country: 'UK', 
    name: 'Samaritans',
    number: '116 123',
    available: '24/7'
  }
  // Add more regional numbers
];
```

## 🤝 Contributing

This frontend implementation provides the foundation for a complete mental health platform. To contribute:

1. Implement the backend using the specifications above
2. Test all critical user flows
3. Ensure security measures are in place
4. Add comprehensive error handling
5. Document any additional features

## 📄 License

This project is designed for educational and humanitarian purposes. Ensure compliance with healthcare data regulations (HIPAA, GDPR) in production environments.

---

**Frontend Status**: ✅ Complete and ready for backend integration
**Backend Status**: 📋 Implementation guide provided above
**Database Status**: 📋 Schema and setup instructions provided

The frontend includes all specified features with beautiful, accessible design. Follow the backend implementation guide to create a production-ready mental health support platform.