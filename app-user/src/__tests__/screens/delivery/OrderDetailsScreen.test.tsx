import OrderDetailsScreen from "../../../screens/delivery/OrderDetailsScreen";

// Mock dependencies
jest.mock("@react-navigation/native");

describe("OrderDetailsScreen", () => {
  it("should be defined", () => {
    expect(OrderDetailsScreen).toBeDefined();
    expect(typeof OrderDetailsScreen).toBe("function");
  });

  it("should be a valid React component", () => {
    expect(OrderDetailsScreen).toBeDefined();
    expect(typeof OrderDetailsScreen).toBe("function");
  });
});
