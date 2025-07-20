import React from 'react';
import { Check, X } from 'lucide-react';
import { PasswordValidation, getPasswordStrengthText, getPasswordStrengthColor } from '../utils/passwordValidation';

interface PasswordStrengthIndicatorProps {
  validation: PasswordValidation;
  showRequirements?: boolean;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ 
  validation, 
  showRequirements = true 
}) => {
  const { text, color } = getPasswordStrengthText(validation.score);
  const strengthColor = getPasswordStrengthColor(validation.score);

  return (
    <div className="mt-3 space-y-3">
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Password Strength</span>
          <span className={`text-sm font-medium ${color}`}>{text}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${strengthColor}`}
            style={{ width: `${(validation.score / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Requirements List */}
      {showRequirements && (
        <div className="space-y-1">
          <span className="text-sm text-gray-600 font-medium">Requirements:</span>
          {validation.requirements.map((requirement, index) => (
            <div key={index} className="flex items-center space-x-2">
              {requirement.met ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <X className="h-4 w-4 text-gray-400" />
              )}
              <span 
                className={`text-sm ${
                  requirement.met ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                {requirement.text}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
