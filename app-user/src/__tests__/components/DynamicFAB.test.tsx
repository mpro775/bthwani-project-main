import { NavigationContainer } from "@react-navigation/native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";

// ====== Mocks ======
const mockNavigate = jest.fn();

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
  useRoute: () => ({
    name: "DeliveryHome",
  }),
}));

// ====== Import after mocks ======
import DynamicFAB from "../../components/DynamicFAB";

describe("DynamicFAB", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  test("يظهر في DeliveryHome ويملك زر داخلي", async () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <DynamicFAB />
      </NavigationContainer>
    );

    await waitFor(() => {
      const container = getByTestId("dynamic-fab");
      expect(container).toBeTruthy();

      const btn = getByTestId("fab-button");
      expect(btn).toBeTruthy();
    });
  });

  test("الضغط على الزر الداخلي يوجّه إلى CartScreen", async () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <DynamicFAB />
      </NavigationContainer>
    );

    await waitFor(() => {
      const btn = getByTestId("fab-button");
      fireEvent.press(btn);
      expect(mockNavigate).toHaveBeenCalledWith("CartScreen");
    });
  });

  test("الحاوية لها style (تحقق عام)", async () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <DynamicFAB />
      </NavigationContainer>
    );

    await waitFor(() => {
      const container = getByTestId("dynamic-fab");
      expect(container.props.style).toBeDefined();
    });
  });
  test("لا يظهر خارج DeliveryHome (يرجع null)", async () => {
    jest.isolateModules(() => {
      jest.doMock("@react-navigation/native", () => ({
        ...jest.requireActual("@react-navigation/native"),
        useNavigation: () => ({ navigate: jest.fn() }),
        useRoute: () => ({ name: "OtherScreen" }), // ليس DeliveryHome
      }));
      const {
        default: DynamicFABLocal,
      } = require("../../components/DynamicFAB");
      const { render } = require("@testing-library/react-native");
      const { queryByTestId } = render(
        <NavigationContainer>
          <DynamicFABLocal />
        </NavigationContainer>
      );
      expect(queryByTestId("dynamic-fab")).toBeNull();
    });
  });
});
