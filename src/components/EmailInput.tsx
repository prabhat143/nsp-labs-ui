import React, { useState, useEffect, useCallback } from 'react';
import { Mail, AlertCircle, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { emailValidator, VerifaliaSyntaxValidation } from '../services/verifyEmailService';

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean, errors: string[], warnings: string[]) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  showValidation?: boolean;
  validateOnBlur?: boolean;
  validateOnType?: boolean;
}

const EmailInput: React.FC<EmailInputProps> = ({
  value,
  onChange,
  onValidationChange,
  placeholder = "Email address",
  required = false,
  disabled = false,
  className = "",
  showValidation = true,
  validateOnBlur = true,
  validateOnType = false
}) => {
  const [validationState, setValidationState] = useState<{
    isValidating: boolean;
    isValid: boolean;
    errors: string[];
    warnings: string[];
    info?: VerifaliaSyntaxValidation;
  }>({
    isValidating: false,
    isValid: true,
    errors: [],
    warnings: []
  });

  const [hasBlurred, setHasBlurred] = useState(false);

  const validateEmail = useCallback(async (email: string) => {
    if (!email.trim()) {
      const newState = {
        isValidating: false,
        isValid: !required,
        errors: required ? ['Email is required'] : [],
        warnings: []
      };
      setValidationState(newState);
      onValidationChange?.(newState.isValid, newState.errors, newState.warnings);
      return;
    }

    setValidationState(prev => ({ ...prev, isValidating: true }));

    try {
      const result = await emailValidator.validateQuick(email);
      
      const newState = {
        isValidating: false,
        isValid: result.isValid,
        errors: result.errors,
        warnings: result.warnings,
        info: result.info
      };

      setValidationState(newState);
      onValidationChange?.(newState.isValid, newState.errors, newState.warnings);
    } catch (error) {
      console.error('Email validation error:', error);
      const newState = {
        isValidating: false,
        isValid: false,
        errors: ['Unable to validate email'],
        warnings: []
      };
      setValidationState(newState);
      onValidationChange?.(newState.isValid, newState.errors, newState.warnings);
    }
  }, [onValidationChange, required]);

  // Debounced validation for typing
  useEffect(() => {
    if (!validateOnType || !hasBlurred) return;

    const timeoutId = setTimeout(() => {
      validateEmail(value);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [value, validateEmail, validateOnType, hasBlurred]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Clear validation state when typing (unless validateOnType is enabled)
    if (!validateOnType && hasBlurred) {
      setValidationState(prev => ({
        ...prev,
        errors: [],
        warnings: []
      }));
    }
  };

  const handleBlur = () => {
    setHasBlurred(true);
    if (validateOnBlur) {
      validateEmail(value);
    }
  };

  const getValidationIcon = () => {
    if (validationState.isValidating) {
      return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
    }

    if (!hasBlurred || (!value.trim() && !required)) {
      return null;
    }

    if (validationState.errors.length > 0) {
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    }

    if (validationState.warnings.length > 0) {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }

    if (validationState.isValid) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }

    return null;
  };

  const getInputBorderClass = () => {
    if (!hasBlurred || (!value.trim() && !required)) {
      return 'border-gray-300 focus:ring-cyan-500 focus:border-transparent';
    }

    if (validationState.errors.length > 0) {
      return 'border-red-300 focus:ring-red-500 focus:border-transparent';
    }

    if (validationState.warnings.length > 0) {
      return 'border-yellow-300 focus:ring-yellow-500 focus:border-transparent';
    }

    if (validationState.isValid) {
      return 'border-green-300 focus:ring-green-500 focus:border-transparent';
    }

    return 'border-gray-300 focus:ring-cyan-500 focus:border-transparent';
  };

  return (
    <div className={`space-y-2 ${className}`}>
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
      {showValidation && hasBlurred && (validationState.errors.length > 0 || validationState.warnings.length > 0) && (
        <div className="space-y-1">
          {/* Error Messages */}
          {validationState.errors.map((error, index) => (
            <div key={`error-${index}`} className="flex items-center space-x-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          ))}

          {/* Warning Messages */}
          {validationState.warnings.map((warning, index) => (
            <div key={`warning-${index}`} className="flex items-center space-x-2 text-sm text-yellow-600">
              <AlertTriangle className="h-4 w-4" />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Email Info */}
      {showValidation && hasBlurred && validationState.info && validationState.isValid && (
        <div className="text-xs text-gray-500 space-y-1">
          <div>Domain: {validationState.info.domain}</div>
          {validationState.info.isFreemail && (
            <div className="text-blue-600">Free email provider detected</div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmailInput;
