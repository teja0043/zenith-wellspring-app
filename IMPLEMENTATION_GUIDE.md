# Backend Implementation Guide - Clarity Connect

This guide provides detailed implementation instructions for the Node.js/Express backend to complement the completed React frontend.

## 🚀 Quick Implementation Steps

### 1. Initialize Backend Project

```bash
mkdir clarity-connect-backend
cd clarity-connect-backend
npm init -y

# Install dependencies
npm install express mongoose bcryptjs jsonwebtoken
npm install socket.io cors helmet morgan rate-limit
npm install dotenv nodemailer crypto
npm install express-validator express-rate-limit
npm install cron node-cron

# Development dependencies
npm install --save-dev nodemon jest supertest
```

### 2. Project Structure Setup

```bash
mkdir -p src/{controllers,models,routes,middleware,services,utils}
mkdir -p tests/{unit,integration}
mkdir scripts
```

## 🔐 Critical Security Implementation

### JWT Authentication Middleware

```javascript
// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ userCode: decoded.userCode });
    
    if (!user || user.isDeleted) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Admin role checking
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { authenticateToken, requireAdmin };
```

### Admin Gate Verification

```javascript
// src/controllers/admin.js
const verifyGateCode = (req, res) => {
  const { adminCode } = req.body;
  
  if (adminCode !== process.env.ADMIN_GATE_CODE) {
    return res.status(401).json({ 
      error: 'Invalid admin access code',
      message: 'Unauthorized access attempt logged'
    });
  }
  
  res.json({ 
    success: true, 
    message: 'Admin gate code verified' 
  });
};
```

## 📊 Database Models Implementation

### User Model with Crypto UserCode

```javascript
// src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  userCode: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  emailHash: {
    type: String,
    unique: true,
    required: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date,
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
});

// Generate unique user code
userSchema.statics.generateUserCode = function() {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = 'U-';
  
  // Use crypto for secure random generation
  const randomBytes = crypto.randomBytes(4);
  for (let i = 0; i < 8; i++) {
    code += chars[randomBytes[i % 4] % chars.length];
  }
  
  return code;
};

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
```

### Assessment Models

```javascript
// src/models/Assessment.js
const mongoose = require('mongoose');

const phqSchema = new mongoose.Schema({
  userCode: {
    type: String,
    required: true,
    index: true
  },
  dateUTC: {
    type: Date,
    default: Date.now
  },
  answers: [{
    type: Number,
    min: 0,
    max: 3,
    required: true
  }],
  score: {
    type: Number,
    required: true
  },
  severity: {
    type: String,
    enum: ['Minimal', 'Mild', 'Moderate', 'Moderately Severe', 'Severe'],
    required: true
  }
});

const gadSchema = new mongoose.Schema({
  userCode: {
    type: String,
    required: true,
    index: true
  },
  dateUTC: {
    type: Date,
    default: Date.now
  },
  answers: [{
    type: Number,
    min: 0,
    max: 3,
    required: true
  }],
  score: {
    type: Number,
    required: true
  },
  severity: {
    type: String,
    enum: ['Minimal', 'Mild', 'Moderate', 'Severe'],
    required: true
  }
});

// Calculate PHQ-9 severity
phqSchema.statics.calculateSeverity = function(score) {
  if (score <= 4) return 'Minimal';
  if (score <= 9) return 'Mild';
  if (score <= 14) return 'Moderate';
  if (score <= 19) return 'Moderately Severe';
  return 'Severe';
};

// Calculate GAD-7 severity
gadSchema.statics.calculateSeverity = function(score) {
  if (score <= 4) return 'Minimal';
  if (score <= 9) return 'Mild';
  if (score <= 14) return 'Moderate';
  return 'Severe';
};

module.exports = {
  PHQEntry: mongoose.model('PHQEntry', phqSchema),
  GADEntry: mongoose.model('GADEntry', gadSchema)
};
```

## ⚛️ Atomic Booking System

```javascript
// src/controllers/booking.js
const mongoose = require('mongoose');
const Slot = require('../models/Slot');
const Booking = require('../models/Booking');

const bookSession = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      const { slotId, userTimezone, notes } = req.body;
      const userCode = req.user.userCode;

      // Find and lock the slot document
      const slot = await Slot.findOneAndUpdate(
        { 
          slotId: slotId,
          remainingSlots: { $gt: 0 },
          isActive: true
        },
        { 
          $inc: { remainingSlots: -1 } 
        },
        { 
          new: true,
          session: session
        }
      );

      if (!slot) {
        throw new Error('Session is no longer available');
      }

      // Check if user already has booking for this slot
      const existingBooking = await Booking.findOne({
        userCode: userCode,
        slotId: slotId,
        status: { $in: ['Pending', 'Confirmed'] }
      }).session(session);

      if (existingBooking) {
        throw new Error('You already have a booking for this session');
      }

      // Create booking
      const booking = new Booking({
        userCode: userCode,
        slotId: slotId,
        datetimeUTC: slot.datetimeUTC,
        type: slot.type,
        status: 'Pending', // Admin can confirm
        notes: notes,
        remindersSent: {
          twentyFourHour: false,
          oneHour: false
        }
      });

      await booking.save({ session });

      // Schedule reminders
      scheduleBookingReminders(booking);

      res.status(201).json({
        success: true,
        booking: booking,
        message: 'Session booked successfully'
      });
    });
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  } finally {
    session.endSession();
  }
};
```

## 🤖 AI Service with Fallback

```javascript
// src/services/aiService.js
const axios = require('axios');

class AIService {
  constructor() {
    this.timeout = parseInt(process.env.AI_TIMEOUT_MS) || 10000;
    this.fallbackResponses = [
      "I hear you, and your feelings are completely valid.",
      "Remember, you're not alone in this journey. Support is available.",
      "It sounds like you're going through a difficult time. Have you considered talking to a counselor?",
      "Taking care of your mental health is important. What's one small step you could take today?",
      "These feelings can be overwhelming. Would it help to try some breathing exercises?",
      "Your wellbeing matters. If you're in crisis, please reach out to a helpline immediately."
    ];
  }

  async getChatResponse(message, userHistory = {}) {
    try {
      // Check for crisis keywords first
      const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'not worth living'];
      const hasCrisisContent = crisisKeywords.some(keyword => 
        message.toLowerCase().includes(keyword)
      );

      if (hasCrisisContent) {
        return {
          response: "I'm concerned about what you're sharing. Please reach out for immediate support: National Suicide Prevention Lifeline: 988. You matter, and help is available.",
          flagged: true,
          severity: 'high'
        };
      }

      // Build context from user history
      const systemPrompt = this.buildSystemPrompt(userHistory);
      
      const response = await axios.post(
        process.env.AI_API_URL,
        {
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          max_tokens: 300,
          temperature: 0.7,
          timeout: this.timeout
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.AI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: this.timeout
        }
      );

      return {
        response: response.data.choices[0].message.content,
        flagged: false,
        fallback: false
      };

    } catch (error) {
      console.error('AI Service Error:', error.message);
      
      return {
        response: this.getFallbackResponse(message),
        fallback: true,
        flagged: false,
        error: 'AI service temporarily unavailable'
      };
    }
  }

  buildSystemPrompt(userHistory) {
    let prompt = `You are a supportive mental health companion for students. Your responses should be:
    - Empathetic and non-judgmental
    - Based on evidence-based practices
    - Encouraging seeking professional help when appropriate
    - Brief but supportive (under 300 characters)
    
    NEVER provide medical advice or diagnosis.
    ALWAYS refer to crisis resources for mentions of self-harm.`;

    if (userHistory.latestPHQ && userHistory.latestPHQ > 9) {
      prompt += `\nUser has elevated depression scores. Be especially supportive and gently suggest professional counseling.`;
    }

    if (userHistory.latestGAD && userHistory.latestGAD > 9) {
      prompt += `\nUser has elevated anxiety scores. Acknowledge their anxiety and suggest coping strategies.`;
    }

    return prompt;
  }

  getFallbackResponse(message) {
    const response = this.fallbackResponses[
      Math.floor(Math.random() * this.fallbackResponses.length)
    ];
    
    return response + "\n\n*Fallback mode active - limited responses available. Please try again later or contact support.*";
  }
}

module.exports = new AIService();
```

## 🔄 Real-time Socket.io Implementation

```javascript
// src/utils/socketManager.js
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

class SocketManager {
  constructor(server) {
    this.io = socketIo(server, {
      cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true
      }
    });

    this.setupMiddleware();
    this.setupHandlers();
  }

  setupMiddleware() {
    // Socket authentication
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userCode = decoded.userCode;
        socket.role = decoded.role;
        next();
      } catch (err) {
        next(new Error('Authentication error'));
      }
    });
  }

  setupHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.userCode}`);

      // Join user-specific room
      socket.join(`user-${socket.userCode}`);
      
      // Join role-based rooms
      if (socket.role === 'admin') {
        socket.join('admin-dashboard');
      }

      // Community feed
      socket.on('join-community', () => {
        socket.join('community-feed');
      });

      // Direct messaging
      socket.on('send-message', async (data) => {
        try {
          const { receiverCode, content } = data;
          
          // Save message to database
          const message = await this.saveMessage({
            senderCode: socket.userCode,
            receiverCode: receiverCode,
            content: content,
            senderType: socket.role === 'admin' ? 'admin' : 'user'
          });

          // Send to receiver
          this.io.to(`user-${receiverCode}`).emit('new-message', message);
          
          // Confirm to sender
          socket.emit('message-sent', { messageId: message._id });
          
        } catch (error) {
          socket.emit('message-error', { error: error.message });
        }
      });

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.userCode}`);
      });
    });
  }

  // Emit to specific user
  emitToUser(userCode, event, data) {
    this.io.to(`user-${userCode}`).emit(event, data);
  }

  // Emit to admin dashboard
  emitToAdmins(event, data) {
    this.io.to('admin-dashboard').emit(event, data);
  }

  // Emit to community feed
  emitToCommunity(event, data) {
    this.io.to('community-feed').emit(event, data);
  }
}

module.exports = SocketManager;
```

## 📊 Admin Dashboard Metrics

```javascript
// src/controllers/admin.js
const User = require('../models/User');
const { PHQEntry, GADEntry } = require('../models/Assessment');
const Booking = require('../models/Booking');
const CommunityPost = require('../models/CommunityPost');

const getDashboardMetrics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Active users (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: twentyFourHoursAgo },
      isDeleted: false
    });

    // Total registered users
    const totalUsers = await User.countDocuments({
      isDeleted: false
    });

    // Counseling sessions booked
    const sessionsBooked = await Booking.countDocuments({
      createdAt: { $gte: start, $lte: end },
      status: 'Confirmed'
    });

    // Average wellbeing score (combined PHQ/GAD)
    const latestAssessments = await Promise.all([
      PHQEntry.aggregate([
        { $match: { dateUTC: { $gte: start, $lte: end } } },
        { $sort: { userCode: 1, dateUTC: -1 } },
        { $group: { _id: '$userCode', latestScore: { $first: '$score' } } },
        { $group: { _id: null, avgScore: { $avg: '$latestScore' } } }
      ]),
      GADEntry.aggregate([
        { $match: { dateUTC: { $gte: start, $lte: end } } },
        { $sort: { userCode: 1, dateUTC: -1 } },
        { $group: { _id: '$userCode', latestScore: { $first: '$score' } } },
        { $group: { _id: null, avgScore: { $avg: '$latestScore' } } }
      ])
    ]);

    const avgPHQ = latestAssessments[0][0]?.avgScore || 0;
    const avgGAD = latestAssessments[1][0]?.avgScore || 0;
    
    // Combined wellbeing score (normalized)
    const avgWellbeingScore = Math.round(
      ((27 - avgPHQ) / 27 + (21 - avgGAD) / 21) * 50
    );

    // Community engagement
    const communityPosts = await CommunityPost.countDocuments({
      createdAt: { $gte: start, $lte: end },
      isDeleted: false
    });

    // Time series data for charts
    const dailyMetrics = await generateDailyMetrics(start, end);

    res.json({
      metrics: {
        activeUsers,
        totalUsers,
        sessionsBooked,
        avgWellbeingScore,
        communityPosts,
        chatbotUtilization: Math.round(Math.random() * 100) // Implement based on chat logs
      },
      timeSeriesData: dailyMetrics,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

## 🚨 Crisis Detection & Flags

```javascript
// src/services/crisisDetection.js
const Flag = require('../models/Flag');
const SocketManager = require('../utils/socketManager');

class CrisisDetectionService {
  constructor() {
    this.crisisKeywords = [
      'suicide', 'kill myself', 'end it all', 'not worth living',
      'better off dead', 'want to die', 'hurt myself'
    ];
    
    this.severeKeywords = [
      'plan to kill', 'suicide plan', 'going to end it'
    ];
  }

  async analyzeContent(content, userCode, source = 'chatbot') {
    const lowerContent = content.toLowerCase();
    
    let severity = 'low';
    let reason = '';

    // Check for severe crisis indicators
    if (this.severeKeywords.some(keyword => lowerContent.includes(keyword))) {
      severity = 'critical';
      reason = 'Explicit suicide plan or imminent self-harm mentioned';
    }
    // Check for general crisis indicators  
    else if (this.crisisKeywords.some(keyword => lowerContent.includes(keyword))) {
      severity = 'high';
      reason = 'Suicidal ideation or self-harm content detected';
    }

    // Create flag if concerning content detected
    if (severity !== 'low') {
      await this.createFlag(userCode, reason, severity, source);
    }

    return { severity, reason, flagged: severity !== 'low' };
  }

  async analyzeAssessment(answers, score, type, userCode) {
    let flagged = false;
    let severity = 'low';
    let reason = '';

    if (type === 'PHQ') {
      // Check question 9 (suicidal ideation)
      if (answers[8] > 0) {
        severity = answers[8] >= 2 ? 'high' : 'moderate';
        reason = 'PHQ-9 indicates suicidal ideation';
        flagged = true;
      } else if (score >= 20) {
        severity = 'moderate';
        reason = 'Severe depression score (PHQ-9 >= 20)';
        flagged = true;
      }
    } else if (type === 'GAD') {
      if (score >= 15) {
        severity = 'moderate';
        reason = 'Severe anxiety score (GAD-7 >= 15)';
        flagged = true;
      }
    }

    if (flagged) {
      await this.createFlag(userCode, reason, severity, 'assessment');
    }

    return { flagged, severity, reason };
  }

  async createFlag(userCode, reason, severity, source) {
    const flag = new Flag({
      userCode: userCode,
      reason: reason,
      severity: severity,
      source: source,
      resolved: false
    });

    await flag.save();

    // Notify admins immediately
    SocketManager.emitToAdmins('new-crisis-flag', {
      flagId: flag._id,
      userCode: userCode,
      severity: severity,
      reason: reason,
      createdAt: flag.createdAt
    });

    return flag;
  }
}

module.exports = new CrisisDetectionService();
```

## ⚡ Performance Optimizations

### Rate Limiting

```javascript
// src/middleware/rateLimit.js
const rateLimit = require('express-rate-limit');

const createRateLimit = (windowMs, max, message) => 
  rateLimit({
    windowMs: windowMs,
    max: max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false
  });

module.exports = {
  // General API rate limit
  generalLimit: createRateLimit(
    15 * 60 * 1000, // 15 minutes
    100, // 100 requests per window
    'Too many requests, please try again later'
  ),

  // Strict rate limit for auth endpoints
  authLimit: createRateLimit(
    15 * 60 * 1000,
    5, // 5 attempts per 15 minutes
    'Too many authentication attempts, please try again later'
  ),

  // Chatbot rate limit
  chatbotLimit: createRateLimit(
    1 * 60 * 1000, // 1 minute
    10, // 10 messages per minute
    'Too many messages, please wait before sending another'
  )
};
```

## 📧 Notification System

```javascript
// src/services/notificationService.js
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const Booking = require('../models/Booking');

class NotificationService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    this.setupCronJobs();
  }

  setupCronJobs() {
    // Check for booking reminders every hour
    cron.schedule('0 * * * *', () => {
      this.sendBookingReminders();
    });
  }

  async sendBookingReminders() {
    const now = new Date();
    const twentyFourHours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const oneHour = new Date(now.getTime() + 60 * 60 * 1000);

    // 24-hour reminders
    const booking24h = await Booking.find({
      datetimeUTC: { 
        $gte: new Date(twentyFourHours.getTime() - 30 * 60 * 1000),
        $lte: new Date(twentyFourHours.getTime() + 30 * 60 * 1000)
      },
      status: 'Confirmed',
      'remindersSent.twentyFourHour': false
    }).populate('slotId');

    for (const booking of booking24h) {
      await this.sendReminderEmail(booking, '24-hour');
      booking.remindersSent.twentyFourHour = true;
      await booking.save();
    }

    // 1-hour reminders
    const bookings1h = await Booking.find({
      datetimeUTC: { 
        $gte: new Date(oneHour.getTime() - 15 * 60 * 1000),
        $lte: new Date(oneHour.getTime() + 15 * 60 * 1000)
      },
      status: 'Confirmed',
      'remindersSent.oneHour': false
    }).populate('slotId');

    for (const booking of bookings1h) {
      await this.sendReminderEmail(booking, '1-hour');
      booking.remindersSent.oneHour = true;
      await booking.save();
    }
  }

  async sendReminderEmail(booking, type) {
    const timeframe = type === '24-hour' ? '24 hours' : '1 hour';
    
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: booking.userEmail, // You'll need to store this
      subject: `Reminder: Counseling Session in ${timeframe}`,
      html: `
        <h2>Counseling Session Reminder</h2>
        <p>You have a ${booking.type} counseling session scheduled in ${timeframe}.</p>
        <p><strong>Date & Time:</strong> ${booking.datetimeUTC.toLocaleString()}</p>
        <p><strong>Type:</strong> ${booking.type}</p>
        <p>If you need to reschedule, please log into your dashboard.</p>
        <p>Need crisis support? Call 988 (US) anytime.</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`${type} reminder sent for booking ${booking._id}`);
    } catch (error) {
      console.error(`Failed to send ${type} reminder:`, error);
    }
  }
}

module.exports = new NotificationService();
```

## 🧪 Testing Implementation

```javascript
// tests/integration/booking.test.js
const request = require('supertest');
const app = require('../../src/app');
const mongoose = require('mongoose');

describe('Booking System', () => {
  let userToken;
  let slotId;

  beforeAll(async () => {
    // Setup test database connection
    await mongoose.connect(process.env.TEST_MONGODB_URI);
    
    // Create test user and get token
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'testpassword123'
      });
    
    userToken = response.body.token;
  });

  test('should prevent double booking of same slot', async () => {
    // Create a test slot
    const slot = await request(app)
      .post('/api/admin/slots')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Session',
        datetimeUTC: new Date(Date.now() + 86400000),
        capacity: 1,
        type: 'Video'
      });

    slotId = slot.body.slot.slotId;

    // First booking should succeed
    const firstBooking = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ slotId: slotId });

    expect(firstBooking.status).toBe(201);

    // Second booking should fail
    const secondBooking = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ slotId: slotId });

    expect(secondBooking.status).toBe(400);
    expect(secondBooking.body.error).toContain('no longer available');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
```

## 🔧 Environment Configuration

```bash
# .env.example
# Copy to .env and fill in your values

# Database
MONGODB_URI=mongodb://localhost:27017/clarity-connect
# MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/clarity-connect

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_REFRESH_SECRET=your-refresh-token-secret-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Admin Security (CRITICAL: Change in production)
ADMIN_GATE_CODE=admin4u

# AI Integration
AI_API_URL=https://api.openai.com/v1/chat/completions
AI_API_KEY=your-openai-api-key
AI_TIMEOUT_MS=10000

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password

# Application Configuration
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
BACKEND_PORT=3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Session Management
COOKIE_SECRET=your-cookie-secret-key
SESSION_TIMEOUT_MS=86400000
```

## 🚀 Deployment Checklist

### Pre-deployment Security

- [ ] Change ADMIN_GATE_CODE from default
- [ ] Generate strong JWT secrets
- [ ] Configure CORS for production domain
- [ ] Set up rate limiting
- [ ] Enable HTTPS
- [ ] Configure MongoDB authentication
- [ ] Set up error logging (Sentry)
- [ ] Configure backup strategy

### Production Deployment

```bash
# 1. Build and deploy backend
npm install --production
npm run build  # If using TypeScript
pm2 start server.js --name "clarity-connect-api"

# 2. Configure reverse proxy (nginx)
# 3. Set up SSL certificate
# 4. Configure monitoring
# 5. Test all critical flows
```

This implementation guide provides the complete backend architecture to complement your React frontend. The system emphasizes security, scalability, and user safety with robust crisis detection and anonymous user management.