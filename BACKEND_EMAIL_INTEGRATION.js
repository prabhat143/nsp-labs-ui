// Backend Email Verification Integration
// Add this to your Node.js/Express server to handle email verification

const express = require('express');
const cors = require('cors');
const { QuickEmailVerification } = require('quickemailverification');

const app = express();

// Enable CORS for your frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://yourdomain.com'],
  credentials: true
}));

app.use(express.json());

// Initialize QuickEmailVerification with your API key
const qev = new QuickEmailVerification(process.env.QUICK_EMAIL_VERIFICATION_API_KEY);

// Email verification endpoint
app.post('/api/verify-email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.json({
        result: 'invalid',
        reason: 'Invalid email format',
        disposable: false,
        accept_all: false,
        role: false,
        free: false,
        email: email,
        user: email.split('@')[0] || '',
        domain: email.split('@')[1] || '',
        mx_found: false,
        mx_record: '',
        safe_to_send: false,
        did_you_mean: null,
        success: true,
        message: 'Email format validation completed'
      });
    }

    // Use sandbox for development, production for live
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    let result;
    if (isDevelopment) {
      // Sandbox endpoint for testing
      result = await qev.verify_sandbox(email);
    } else {
      // Production endpoint
      result = await qev.verify(email);
    }

    // Transform the response to match our interface
    const response = {
      result: result.result || 'unknown',
      reason: result.reason || '',
      disposable: result.disposable || false,
      accept_all: result.accept_all || false,
      role: result.role || false,
      free: result.free || false,
      email: result.email || email,
      user: result.user || '',
      domain: result.domain || '',
      mx_found: result.mx_found || false,
      mx_record: result.mx_record || '',
      safe_to_send: result.safe_to_send || false,
      did_you_mean: result.did_you_mean || null,
      success: true,
      message: 'Email verification completed'
    };

    res.json(response);

  } catch (error) {
    console.error('Email verification error:', error);
    
    res.status(500).json({
      result: 'unknown',
      reason: 'Verification service error',
      disposable: false,
      accept_all: false,
      role: false,
      free: false,
      email: req.body.email || '',
      user: '',
      domain: '',
      mx_found: false,
      mx_record: '',
      safe_to_send: false,
      did_you_mean: null,
      success: false,
      message: 'Email verification service temporarily unavailable'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', service: 'Email Verification' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Email verification server running on port ${PORT}`);
});

module.exports = app;

/* 
SETUP INSTRUCTIONS:

1. Install required packages:
   npm install express cors quickemailverification

2. Set environment variables:
   QUICK_EMAIL_VERIFICATION_API_KEY=your_api_key_here
   NODE_ENV=development  // or production

3. Add this code to your backend server

4. Test the endpoint:
   curl -X POST http://localhost:8080/api/verify-email \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'

5. For testing in sandbox mode, use these test emails:
   - valid@example.com (returns valid)
   - invalid@example.com (returns invalid)
   - disposable@example.com (returns disposable)
   - role@example.com (returns role-based)

*/
