export const validators = {
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  password: (password) => {
    return password && password.length >= 6;
  },

  phone: (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/; // Indian phone number
    return phoneRegex.test(phone);
  },

  required: (value) => {
    return value && value.toString().trim().length > 0;
  },

  minLength: (value, min) => {
    return value && value.length >= min;
  },

  maxLength: (value, max) => {
    return value && value.length <= max;
  }
};

export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const fieldRules = rules[field];
    const fieldValue = data[field];
    
    fieldRules.forEach(rule => {
      if (typeof rule === 'function') {
        const isValid = rule(fieldValue);
        if (!isValid && !errors[field]) {
          errors[field] = `${field} is invalid`;
        }
      } else if (rule.validator && rule.message) {
        const isValid = rule.validator(fieldValue);
        if (!isValid && !errors[field]) {
          errors[field] = rule.message;
        }
      }
    });
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};