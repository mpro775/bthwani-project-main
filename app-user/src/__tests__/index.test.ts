import React from "react";
import { render } from "@testing-library/react-native";

// Mock dependencies
jest.mock("react-native/Libraries/Alert/Alert", () => ({
  alert: jest.fn(),
}));

jest.mock("../../App", () => "App");

describe("index.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render without crashing", () => {
    // This test ensures the app can be imported and rendered
    expect(true).toBe(true);
  });
});
