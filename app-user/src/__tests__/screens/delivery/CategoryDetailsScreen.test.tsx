import CategoryDetailsScreen from "../../../screens/delivery/CategoryDetailsScreen";

// Mock dependencies
jest.mock("@react-navigation/native");

describe("CategoryDetailsScreen", () => {
  it("should be defined", () => {
    expect(CategoryDetailsScreen).toBeDefined();
    expect(typeof CategoryDetailsScreen).toBe("function");
  });

  it("should be a valid React component", () => {
    expect(CategoryDetailsScreen).toBeDefined();
    expect(typeof CategoryDetailsScreen).toBe("function");
  });
});
