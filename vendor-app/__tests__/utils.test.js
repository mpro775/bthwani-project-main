// Utility functions for testing
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // Password must be at least 8 characters with uppercase, lowercase, and number
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/\d/.test(password)) return false;
  return true;
};

const formatCurrency = (amount, currency = 'ريال') => {
  return `${amount.toFixed(2)} ${currency}`;
};

describe('Utility Functions', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('test+tag@example.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      expect(validatePassword('Password123')).toBe(true);
      expect(validatePassword('StrongP@ss1')).toBe(true);
      expect(validatePassword('MyP@ssw0rd')).toBe(true);
    });

    it('should reject weak passwords', () => {
      expect(validatePassword('weak')).toBe(false);
      expect(validatePassword('12345678')).toBe(false);
      expect(validatePassword('abcdefgh')).toBe(false);
      expect(validatePassword('ABCDEFGH')).toBe(false);
      expect(validatePassword('Password')).toBe(false);
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(100)).toBe('100.00 ريال');
      expect(formatCurrency(99.99)).toBe('99.99 ريال');
      expect(formatCurrency(0)).toBe('0.00 ريال');
    });

    it('should handle custom currency', () => {
      expect(formatCurrency(100, 'دولار')).toBe('100.00 دولار');
      expect(formatCurrency(99.99, 'يورو')).toBe('99.99 يورو');
    });
  });
});
