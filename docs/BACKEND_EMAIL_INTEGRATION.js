// Backend Integration Guide for QuickEmailVerification
// Add this to your Node.js/Express backend

// 1. Install the package in your backend project:
// npm install quickemailverification

// 2. Add these endpoints to your backend API:

const express = require('express');
const router = express.Router();

// Initialize QuickEmailVerification client
const quickemailverification = require('quickemailverification').client(process.env.QUICKEMAIL_API_KEY).quickemailverification();

// Email verification endpoint
router.post('/verify-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email is required' 
      });
    }

    // Determine if we should use sandbox or production
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      // Production verification
      quickemailverification.verify(email, function (err, response) {
        if (err) {
          console.error('Email verification error:', err);
          return res.status(500).json({
            success: false,
            error: 'Email verification failed',
            details: err.message
          });
        }
        
        const result = response.body;
        res.json({
          success: true,
          result: {
            isValid: result.result === 'valid' && result.safe_to_send,
            isDisposable: result.disposable,
            isFree: result.free,
            isRole: result.role,
            isSafeToSend: result.safe_to_send,
            result: result.result,
            reason: result.reason,
            suggestion: result.did_you_mean || null,
            email: result.email,
            domain: result.domain
          }
        });
      });
    } else {
      // Sandbox verification
      quickemailverification.sandbox(email, function (err, response) {
        if (err) {
          console.error('Email verification error:', err);
          return res.status(500).json({
            success: false,
            error: 'Email verification failed',
            details: err.message
          });
        }
        
        const result = response.body;
        res.json({
          success: true,
          result: {
            isValid: result.result === 'valid' && result.safe_to_send,
            isDisposable: result.disposable,
            isFree: result.free,
            isRole: result.role,
            isSafeToSend: result.safe_to_send,
            result: result.result,
            reason: result.reason,
            suggestion: result.did_you_mean || null,
            email: result.email,
            domain: result.domain
          }
        });
      });
    }
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Email verification failed',
      details: error.message
    });
  }
});

// Test endpoint to verify API connection
router.get('/test-email-verification', (req, res) => {
  const testEmail = 'valid@example.com';
  
  // Always use sandbox for test endpoint
  quickemailverification.sandbox(testEmail, function (err, response) {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'API connection failed',
        error: err.message
      });
    }
    
    res.json({
      success: true,
      message: 'API connection successful',
      testResult: response.body
    });
  });
});

module.exports = router;

// 3. Add to your main app.js:
// app.use('/api/email', require('./routes/email-verification'));

// 4. Add environment variable to your backend .env:
// QUICKEMAIL_API_KEY=34ff32cf0bdaad7d5c4e760268ff05c68cb8d74d0f1bd566b25e2e8c132c
