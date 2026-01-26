import CommonProductDetailsScreen from "../../../screens/delivery/ProductDetailsScreen";

// Mock dependencies
jest.mock("@react-navigation/native");

describe("ProductDetailsScreen", () => {
  it("should be defined", () => {
    expect(CommonProductDetailsScreen).toBeDefined();
    expect(typeof CommonProductDetailsScreen).toBe("function");
  });

  it("should be a valid React component", () => {
    expect(CommonProductDetailsScreen).toBeDefined();
    expect(typeof CommonProductDetailsScreen).toBe("function");
  });
});
