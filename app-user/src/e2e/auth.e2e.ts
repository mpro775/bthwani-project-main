import { device, element, by, expect } from 'detox';

// e2e/auth.e2e.ts
describe('Auth flow', () => {
    beforeAll(async () => { await device.launchApp(); });
  
    it('يسجّل الدخول', async () => {
      await element(by.id('email-input')).typeText('test@bthwani.com');
      await element(by.id('password-input')).typeText('12345678');
      await element(by.id('login-button')).tap();
      await expect(element(by.id('home-screen'))).toBeVisible();
    });
  });
  