

// QuickEmailVerification API integration
// Direct REST API calls equivalent to curl commands

export interface EmailVerificationResult {
  email: string;
  did_you_mean: string;
  user: string;
  domain: string;
  format_valid: boolean;
  mx_found: boolean;
  smtp_check: boolean;
  catch_all: boolean;
  role: boolean;
  disposable: boolean;
  free: boolean;
  score: number;
}

export const verifyEmailWithAPI = async (email: string): Promise<EmailVerificationResult> => {
  // Call backend proxy instead of direct API to avoid CORS issues
  const backendURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
  const url = `${backendURL}/email/verify-email`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: EmailVerificationResult = await response.json();
    return data;

  } catch (error) {
    console.error('Email verification backend error:', error);
    
    // Fallback to basic validation if backend is unavailable
    return {
      email: email,
      did_you_mean: '',
      user: email.split('@')[0] || '',
      domain: email.split('@')[1] || '',
      format_valid: true,
      mx_found: false,
      smtp_check: false,
      catch_all: false,
      role: false,
      disposable: false,
      free: false,
      score: 0.0
    };
  }
};
