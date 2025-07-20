import React from 'react';
import { Lightbulb, Eye, Shield, Key } from 'lucide-react';
import { getPasswordSuggestions, getPasswordExamples } from '../utils/passwordValidation';

interface PasswordSuggestionsProps {
  password: string;
  isVisible: boolean;
  onClose: () => void;
}

const PasswordSuggestions: React.FC<PasswordSuggestionsProps> = ({
  password,
  isVisible,
  onClose
}) => {
  const suggestions = getPasswordSuggestions(password);
  const examples = getPasswordExamples();

  if (!isVisible) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-10 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <h3 className="font-semibold text-gray-900">Password Tips</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl leading-none"
        >
          ×
        </button>
      </div>

      {/* Current Suggestions */}
      <div className="mb-6">
        <h4 className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-3">
          <Shield className="h-4 w-4" />
          <span>Suggestions for your password:</span>
        </h4>
        <ul className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-2 flex-shrink-0" />
              <span className="text-sm text-gray-600">{suggestion}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Password Examples */}
      <div className="border-t border-gray-100 pt-4">
        <h4 className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-3">
          <Key className="h-4 w-4" />
          <span>Example strong passwords:</span>
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {examples.slice(0, 3).map((example, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg px-3 py-2 font-mono text-sm text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => {
                navigator.clipboard.writeText(example);
                // You could add a toast notification here
              }}
              title="Click to copy"
            >
              {example}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2 flex items-center space-x-1">
          <Eye className="h-3 w-3" />
          <span>Click any example to copy it</span>
        </p>
      </div>

      {/* Security Tips */}
      <div className="border-t border-gray-100 pt-4 mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Security Best Practices:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Use a unique password for each account</li>
          <li>• Consider using a password manager</li>
          <li>• Never share your password with others</li>
          <li>• Enable two-factor authentication when available</li>
        </ul>
      </div>
    </div>
  );
};

export default PasswordSuggestions;
