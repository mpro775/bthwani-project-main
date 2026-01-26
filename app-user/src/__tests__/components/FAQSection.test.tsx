import { render } from "@testing-library/react-native";
import React from "react";
import FAQSection from "../../components/FAQSection";

describe("FAQSection", () => {
  // Simplified tests - just check that component renders
  test("renders correctly", () => {
    expect(() => render(<FAQSection />)).not.toThrow();
  });

  test("displays title", () => {
    const { getByText } = render(<FAQSection />);
    expect(getByText("الأسئلة الشائعة")).toBeTruthy();
  });
});
