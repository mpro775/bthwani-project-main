import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import OfflineScreen from "../../screens/OfflineScreen";

describe("OfflineScreen", () => {
  const mockOnRetry = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(OfflineScreen).toBeDefined();
    expect(typeof OfflineScreen).toBe("function");
  });

  it("should render without crashing", () => {
    expect(() => render(<OfflineScreen onRetry={mockOnRetry} />)).not.toThrow();
  });

  it("should display the offline message", () => {
    const { getByText } = render(<OfflineScreen onRetry={mockOnRetry} />);

    expect(getByText("عذراً")).toBeTruthy();
    expect(getByText("يرجى توصيل الإنترنت لإتمام عمل التطبيق.")).toBeTruthy();
  });

  it("should display the retry button", () => {
    const { getByText } = render(<OfflineScreen onRetry={mockOnRetry} />);

    expect(getByText("إعادة المحاولة")).toBeTruthy();
  });

  it("should call onRetry when retry button is pressed", () => {
    const { getByText } = render(<OfflineScreen onRetry={mockOnRetry} />);

    const retryButton = getByText("إعادة المحاولة");
    fireEvent.press(retryButton);

    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });
});
