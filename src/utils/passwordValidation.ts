export interface PasswordRequirement {
  met: boolean;
  text: string;
}

export interface PasswordValidation {
  isValid: boolean;
  requirements: PasswordRequirement[];
  score: number; // 0-5
}

export const validatePassword = (password: string): PasswordValidation => {
  const requirements: PasswordRequirement[] = [
    {
      met: password.length >= 8,
      text: 'At least 8 characters long'
    },
    {
      met: /[A-Z]/.test(password),
      text: 'Contains at least one uppercase letter'
    },
    {
      met: /[a-z]/.test(password),
      text: 'Contains at least one lowercase letter'
    },
    {
      met: /\d/.test(password),
      text: 'Contains at least one number'
    },
    {
      met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      text: 'Contains at least one special character'
    }
  ];

  const metRequirements = requirements.filter(req => req.met).length;
  const isValid = metRequirements >= 4 && password.length >= 8;

  return {
    isValid,
    requirements,
    score: metRequirements
  };
};

export const getPasswordStrengthText = (score: number): { text: string; color: string } => {
  switch (score) {
    case 0:
    case 1:
      return { text: 'Very Weak', color: 'text-red-600' };
    case 2:
      return { text: 'Weak', color: 'text-orange-600' };
    case 3:
      return { text: 'Fair', color: 'text-yellow-600' };
    case 4:
      return { text: 'Good', color: 'text-blue-600' };
    case 5:
      return { text: 'Strong', color: 'text-green-600' };
    default:
      return { text: 'Very Weak', color: 'text-red-600' };
  }
};

export const getPasswordStrengthColor = (score: number): string => {
  switch (score) {
    case 0:
    case 1:
      return 'bg-red-500';
    case 2:
      return 'bg-orange-500';
    case 3:
      return 'bg-yellow-500';
    case 4:
      return 'bg-blue-500';
    case 5:
      return 'bg-green-500';
    default:
      return 'bg-gray-300';
  }
};

export const getPasswordSuggestions = (password: string): string[] => {
  const suggestions: string[] = [];
  const validation = validatePassword(password);

  // If password is empty, show general tips
  if (!password) {
    return [
      "Start with a memorable word or phrase",
      "Use a combination of uppercase and lowercase letters",
      "Add numbers and special characters",
      "Consider using a passphrase like 'Coffee@Morning2024!'",
      "Avoid common passwords like 'password123'"
    ];
  }

  // Specific suggestions based on what's missing
  validation.requirements.forEach((req, index) => {
    if (!req.met) {
      switch (index) {
        case 0: // Length
          suggestions.push("Make it at least 8 characters long");
          break;
        case 1: // Uppercase
          suggestions.push("Add an uppercase letter (A-Z)");
          break;
        case 2: // Lowercase
          suggestions.push("Include a lowercase letter (a-z)");
          break;
        case 3: // Number
          suggestions.push("Add a number (0-9)");
          break;
        case 4: // Special character
          suggestions.push("Include a special character (!@#$%^&*)");
          break;
      }
    }
  });

  // If all requirements are met, give encouragement
  if (validation.isValid) {
    suggestions.push("Great! Your password is strong and secure.");
  } else if (validation.score >= 3) {
    suggestions.push("Almost there! Just a few more improvements needed.");
  }

  return suggestions;
};

export const getPasswordExamples = (): string[] => {
  return [
    "MyDog@Home2024!",
    "Coffee&Morning123",
    "Secure#Password99",
    "BlueOcean$Wave2024",
    "Tech@Innovation456"
  ];
};
