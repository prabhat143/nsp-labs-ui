# Verifalia Email Verification Integration

This project includes integration with Verifalia's email verification API to provide real-time email validation and quality assessment.

## Features

- **Real-time email syntax validation**
- **Disposable email detection**
- **Free email provider identification**
- **Role-based email detection**
- **Email deliverability verification** (with API credentials)
- **Visual feedback and suggestions**

## Setup

### 1. Get Verifalia Credentials

1. Sign up at [Verifalia.com](https://verifalia.com)
2. Navigate to your [Client Area](https://verifalia.com/client-area)
3. Create API credentials (username and API key)
4. Free tier includes 25 email verifications per day

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and add your credentials:

```bash
# Verifalia Email Verification API
VITE_VERIFALIA_USERNAME=your_username_here
VITE_VERIFALIA_API_KEY=your_api_key_here
```

### 3. Security Considerations

**Important**: For production applications, consider implementing a server-side proxy to hide your Verifalia credentials from client-side code.

#### Server-side Implementation (Recommended)

Create an API endpoint on your backend:

```javascript
// Example Express.js endpoint
app.post('/api/verify-email', async (req, res) => {
  const { email } = req.body;
  
  const verifalia = new VerifaliaRestClient({
    username: process.env.VERIFALIA_USERNAME,
    password: process.env.VERIFALIA_API_KEY
  });

  try {
    const verification = await verifalia.emailValidations.submit({
      entries: [{ inputData: email }],
      quality: 'high'
    });
    
    res.json({
      isValid: verification.entries[0].classification === 'Deliverable',
      classification: verification.entries[0].classification,
      status: verification.entries[0].status
    });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});
```

## Usage

### EmailInput Component

The `EmailInput` component provides enhanced email validation:

```tsx
import EmailInput from './components/EmailInput';

function MyForm() {
  const [email, setEmail] = useState('');
  const [emailValidation, setEmailValidation] = useState({
    isValid: true,
    errors: [],
    warnings: []
  });

  return (
    <EmailInput
      value={email}
      onChange={setEmail}
      onValidationChange={(isValid, errors, warnings) => 
        setEmailValidation({ isValid, errors, warnings })
      }
      placeholder="Enter your email"
      required
      showValidation={true}
      validateOnBlur={true}
      validateOnType={true}
    />
  );
}
```

### Direct API Usage

```tsx
import { emailValidator } from './services/verifyEmailService';

// Quick validation (client-side only)
const quickValidation = await emailValidator.validateQuick('user@example.com');

// Full validation (requires API credentials)
const fullValidation = await emailValidator.validateFull('user@example.com');
```

## Validation Levels

### Client-side Validation
- Email syntax validation
- Disposable email detection
- Free email provider identification
- Role-based email detection

### API-based Validation (with credentials)
- Real-time deliverability check
- Mailbox existence verification
- Catch-all detection
- SMTP response analysis

## Error Handling

The system gracefully falls back to client-side validation if:
- API credentials are not configured
- API request fails
- Rate limits are exceeded
- Network connection issues

## Rate Limits

- **Free tier**: 25 verifications per day
- **Paid plans**: Higher limits available
- Client-side validation has no limits

## Best Practices

1. **Use client-side validation first** for immediate feedback
2. **Implement server-side proxy** for production security
3. **Cache results** to avoid redundant API calls
4. **Handle rate limits** gracefully with fallbacks
5. **Show progressive validation** (syntax → deliverability)

## Troubleshooting

### Common Issues

1. **API credentials not working**
   - Verify username and API key in Verifalia client area
   - Check environment variable names

2. **CORS errors**
   - Implement server-side proxy for production
   - Verifalia doesn't support direct browser requests for security

3. **Rate limit exceeded**
   - Upgrade Verifalia plan
   - Implement caching to reduce API calls
   - Use client-side validation as fallback

### Debug Mode

Enable debug logging:

```javascript
// Add to your main component
window.verifaliaDebug = true;
```

This will log validation requests and responses to the browser console.

## API Documentation

For detailed API documentation, visit:
- [Verifalia API Reference](https://verifalia.com/developers/api)
- [JavaScript SDK Documentation](https://verifalia.com/developers/javascript)

## Support

- [Verifalia Support](https://verifalia.com/support)
- [Community Forum](https://community.verifalia.com)
- [Status Page](https://status.verifalia.com)
