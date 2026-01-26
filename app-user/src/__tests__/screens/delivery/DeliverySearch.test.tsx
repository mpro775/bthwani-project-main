import { render } from "@testing-library/react-native";
import React from "react";
import DeliverySearch from "../../../screens/delivery/DeliverySearch";

describe("DeliverySearch", () => {
  // Simplified tests - just check that component renders
  test("renders correctly", () => {
    expect(() => render(<DeliverySearch />)).not.toThrow();
  });
});
