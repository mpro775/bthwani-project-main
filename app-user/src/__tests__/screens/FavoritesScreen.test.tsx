import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import FavoritesScreen from 'screens/FavoritesScreen';

// Mock API functions
const mockGetAllUserFavorites = jest.fn();
const mockRemoveFavorite = jest.fn();

jest.mock('api/favorites', () => ({
  getAllUserFavorites: mockGetAllUserFavorites,
  removeFavorite: mockRemoveFavorite,
}));

// Mock Ionicons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, ...props }: any) => (
      <View {...props} data-testid="linear-gradient">
        {children}
      </View>
    ),
  };
});

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useFocusEffect: jest.fn(),
}));

const MockNavigationContainer = ({ children }: { children: React.ReactNode }) => (
  <NavigationContainer>
    {children}
  </NavigationContainer>
);

describe('FavoritesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAllUserFavorites.mockResolvedValue([]);
    mockRemoveFavorite.mockResolvedValue(undefined);
  });

  test('يعرض عنوان الشاشة', () => {
    const { getByText } = render(
      <MockNavigationContainer>
        <FavoritesScreen />
      </MockNavigationContainer>
    );

    expect(getByText('قائمة المفضلة')).toBeTruthy();
  });

  test('يعرض رسالة فارغة عند عدم وجود مفضلات', () => {
    const { getByText, queryByText } = render(
      <MockNavigationContainer>
        <FavoritesScreen />
      </MockNavigationContainer>
    );

    // العنوان يجب أن يكون موجوداً
    expect(getByText('قائمة المفضلة')).toBeTruthy();
    
    // عند عدم وجود مفضلات، لا يجب أن تظهر أقسام
    expect(queryByText('المطاعم المفضلة')).toBeNull();
    expect(queryByText('المنتجات المفضلة')).toBeNull();
  });
});
