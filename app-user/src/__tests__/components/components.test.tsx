// __tests__/components.test.tsx
import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import { Text, TextInput, TouchableOpacity } from "react-native";
import CategoryItemCard from "../../components/category/CategoryItemCard";

// Mock navigation
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

describe("Components", () => {
  describe("CategoryItemCard", () => {
    const mockItem = {
      id: "test-1",
      title: "متجر تجريبي",
      subtitle: "صنعاء، اليمن",
      distance: "2.5 كم",
      time: "15 دقيقة",
      rating: 4.5,
      isOpen: true,
      isFavorite: false,
      tags: ["مطعم", "وجبات سريعة"],
      image: { uri: "test-image.jpg" },
      logo: { uri: "test-logo.jpg" },
    };

    test("يعرض بيانات المتجر بشكل صحيح", () => {
      render(
        <CategoryItemCard
          item={mockItem}
          onPress={() => {}}
          onToggleFavorite={() => {}}
        />
      );

      expect(screen.getByText("متجر تجريبي")).toBeTruthy();
      expect(screen.getByText("صنعاء، اليمن")).toBeTruthy();
      expect(screen.getByText("2.5 كم")).toBeTruthy();
      expect(screen.getByText("15 دقيقة")).toBeTruthy();
      expect(screen.getByText("4.5")).toBeTruthy();
    });

    test("يستجيب للنقر على القلب", () => {
      const mockToggleFavorite = jest.fn();

      render(
        <CategoryItemCard
          item={mockItem}
          onPress={() => {}}
          onToggleFavorite={mockToggleFavorite}
        />
      );

      const heartIcon = screen.getByTestId("heart-button");
      fireEvent.press(heartIcon);
      expect(mockToggleFavorite).toHaveBeenCalled();
    });

    test("يعرض العلامات", () => {
      render(
        <CategoryItemCard
          item={mockItem}
          onPress={() => {}}
          onToggleFavorite={() => {}}
        />
      );

      expect(screen.getByText("مطعم")).toBeTruthy();
      expect(screen.getByText("وجبات سريعة")).toBeTruthy();
    });
  });

  describe("UI Components", () => {
    test("Button component يعمل بشكل صحيح", () => {
      const mockOnPress = jest.fn();

      render(
        <TouchableOpacity testID="test-button" onPress={mockOnPress}>
          <Text>زر تجريبي</Text>
        </TouchableOpacity>
      );

      const button = screen.getByTestId("test-button");
      fireEvent.press(button);

      expect(mockOnPress).toHaveBeenCalled();
    });

    test("Input component يعمل بشكل صحيح", () => {
      render(
        <TextInput
          testID="test-input"
          placeholder="أدخل النص هنا"
          value=""
          onChangeText={() => {}}
        />
      );

      const input = screen.getByTestId("test-input");
      expect(input).toBeTruthy();
    });
  });
});
