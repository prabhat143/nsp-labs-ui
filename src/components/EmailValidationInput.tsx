import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { verifyEmailWithAPI, EmailVerificationResult } from '../utils/emailVerification';

interface EmailValidationInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean, result: EmailVerificationResult | null) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  validateOnRegistration?: boolean; // Only validate during registration
}

const EmailValidationInput: React.FC<EmailValidationInputProps> = ({
  value,
  onChange,
  onValidationChange,
  placeholder = "Email address",
  required = false,
  disabled = false,
  validateOnRegistration = false
}) => {
  const [validationResult, setValidationResult] = useState<EmailVerificationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [hasBlurred, setHasBlurred] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [lastValidatedEmail, setLastValidatedEmail] = useState<string>('');

  const validateEmailAsync = async (email: string) => {
    if (!email.trim() || !validateOnRegistration) {
      setValidationResult(null);
      setShowValidation(false);
      onValidationChange?.(true, null);
      return;
    }

    // Prevent duplicate validation for the same email
    if (isValidating || lastValidatedEmail === email) {
      return;
    }

    setIsValidating(true);
    setShowValidation(true);
    setLastValidatedEmail(email);

    try {
      // Use the real API verification
      const result = await verifyEmailWithAPI(email);
      setValidationResult(result);
      const isValid = result.smtp_check;
      onValidationChange?.(isValid, result);
    } catch (error) {
      console.error('Email validation error:', error);
      const errorResult: EmailVerificationResult = {
        email: email,
        did_you_mean: '',
        user: email.split('@')[0] || '',
        domain: email.split('@')[1] || '',
        format_valid: false,
        mx_found: false,
        smtp_check: false,
        catch_all: false,
        role: false,
        disposable: false,
        free: false,
        score: 0.0
      };
      setValidationResult(errorResult);
      onValidationChange?.(false, errorResult);
    } finally {
      setIsValidating(false);
    }
  };

  // Debounced validation
  useEffect(() => {
    if (!hasBlurred || !validateOnRegistration) return;

    const timeoutId = setTimeout(() => {
      validateEmailAsync(value);
    }, 800); // 800ms debounce

    return () => clearTimeout(timeoutId);
  }, [value, hasBlurred, validateOnRegistration]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Clear previous validation when typing
    if (hasBlurred && validationResult) {
      setValidationResult(null);
      setShowValidation(false);
      setLastValidatedEmail(''); // Clear last validated email to allow re-validation
    }
  };

  const handleBlur = () => {
    setHasBlurred(true);
    // Email validation will be triggered by useEffect with debounce
    // No need to call validateEmailAsync here to avoid duplicate calls
  };

  const getValidationIcon = () => {
    if (!showValidation || !hasBlurred) return null;

    if (isValidating) {
      return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
    }

    if (!validationResult) return null;

    const isValid = validationResult.smtp_check;

    if (!isValid) {
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    }

    if (isValid) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }

    return null;
  };

  const getInputBorderClass = () => {
    if (!showValidation || !hasBlurred) {
      return 'border-gray-300 focus:ring-cyan-500 focus:border-transparent';
    }

    if (isValidating) {
      return 'border-blue-300 focus:ring-blue-500 focus:border-transparent';
    }

    if (!validationResult) {
      return 'border-gray-300 focus:ring-cyan-500 focus:border-transparent';
    }

    const isValid = validationResult.smtp_check;

    if (!isValid) {
      return 'border-red-300 focus:ring-red-500 focus:border-transparent';
    }

    if (isValid) {
      return 'border-green-300 focus:ring-green-500 focus:border-transparent';
    }

    return 'border-gray-300 focus:ring-cyan-500 focus:border-transparent';
  };

  const getValidationMessage = () => {
    if (!showValidation || !hasBlurred || !validationResult) return null;

    if (!validationResult.format_valid) {
      return (
        <div className="flex items-center space-x-2 text-sm text-red-600 mt-2">
          <AlertCircle className="h-4 w-4" />
          <span>Invalid email format</span>
        </div>
      );
    }

    const isValid = validationResult.smtp_check;

    if (isValid) {
      return (
        <div className="flex items-center space-x-2 text-sm text-green-600 mt-2">
          <CheckCircle className="h-4 w-4" />
          <span>Email address verified successfully</span>
          {validationResult.did_you_mean && (
            <div className="text-sm text-blue-600 mt-1">
              Did you mean: <span className="font-medium">{validationResult.did_you_mean}</span>?
            </div>
          )}
        </div>
      );
    }

    if (!isValid) {
      return (
        <div className="flex items-center space-x-2 text-sm text-red-600 mt-2">
          <AlertCircle className="h-4 w-4" />
          <span>Email address is not valid</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-1">
      <div className="relative">
        <Mail className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
        <input
          type="email"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          className={`w-full pl-14 pr-14 py-5 text-lg border rounded-xl focus:ring-2 transition-all duration-200 bg-gray-50/50 ${getInputBorderClass()}`}
          placeholder={placeholder}
          autoComplete="email"
        />
        <div className="absolute right-5 top-1/2 transform -translate-y-1/2">
          {getValidationIcon()}
        </div>
      </div>

      {/* Validation Messages */}
      {getValidationMessage()}
    </div>
  );
};

export default EmailValidationInput;
