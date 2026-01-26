import MyOrdersScreen from "../../../screens/delivery/MyOrdersScreen";

// Mock dependencies
jest.mock("@react-navigation/native");

describe("MyOrdersScreen", () => {
  it("should be defined", () => {
    expect(MyOrdersScreen).toBeDefined();
    expect(typeof MyOrdersScreen).toBe("function");
  });

  it("should be a valid React component", () => {
    expect(MyOrdersScreen).toBeDefined();
    expect(typeof MyOrdersScreen).toBe("function");
  });
});
