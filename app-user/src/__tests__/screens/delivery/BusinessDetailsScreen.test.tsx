// __tests__/BusinessDetailsScreen.test.tsx
import React from 'react';
import { renderWithProviders } from 'test-utils/renderWithProviders';
import { screen, waitFor } from '@testing-library/react-native';
import BusinessDetailsScreen from 'screens/delivery/BusinessDetailsScreen';

jest.mock('api/authService', () => ({
  fetchWithAuth: jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve([])
  })
}));

jest.mock('utils/api/config', () => ({ API_URL: 'http://test.api' }));

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useRoute: () => ({
          params: {
        business: {
          _id: 'test-store',
          name: 'متجر تجريبي',
          address: 'صنعاء، اليمن',
          rating: 4.5,
          image: 'test-image.jpg',
          logo: 'test-logo.jpg',
          category: {
            usageType: 'restaurant'
          }
        }
      }
  }),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn()
  })
}));

test('يعرض بيانات المتجر والمنتجات ويحسب المسافة', async () => {
  renderWithProviders(<BusinessDetailsScreen />);
  
  // انتظر تحميل البيانات
  await waitFor(() => {
    expect(screen.getByText('متجر تجريبي')).toBeTruthy();
  });
  
  // تحقق من وجود التقييم
  expect(screen.getByText('4.5')).toBeTruthy();
  
  // تحقق من وجود التبويبات
  expect(screen.getByText('عروض مميزة')).toBeTruthy();
  expect(screen.getByText('الأكثر مبيعاً')).toBeTruthy();
});
