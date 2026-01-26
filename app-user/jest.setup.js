// Note: Modal component will be mocked in individual test files when needed

// Mock expo-linear-gradient
jest.mock("expo-linear-gradient", () => {
  const React = require("react");
  const MockLinearGradient = ({
    children,
    colors,
    style,
    start,
    end,
    ...props
  }) => {
    return React.createElement(
      "div",
      {
        style: { backgroundColor: colors ? colors[0] : "#000", ...style },
        "data-testid": "linear-gradient",
        ...props,
      },
      children
    );
  };
  return { LinearGradient: MockLinearGradient };
});

// Mock @expo/vector-icons
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const MockIcon = ({ name, size, color, ...props }) => {
    return React.createElement(
      "div",
      {
        style: { width: size, height: size, backgroundColor: color || "#000" },
        "data-testid": `icon-${name}`,
        ...props,
      },
      []
    );
  };
  return { Ionicons: MockIcon };
});

// fetch
require("jest-fetch-mock").enableMocks();

// AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// Expo Location (موك افتراضي مع إحداثيات صنعاء)
jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest
    .fn()
    .mockResolvedValue({ status: "granted" }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: { latitude: 15.3547, longitude: 44.2067, accuracy: 10 },
  }),
  hasServicesEnabledAsync: jest.fn().mockResolvedValue(true),
  getLastKnownPositionAsync: jest.fn().mockResolvedValue({
    coords: { latitude: 15.3547, longitude: 44.2067, accuracy: 10 },
  }),
  startLocationUpdatesAsync: jest.fn(),
  stopLocationUpdatesAsync: jest.fn(),
  Accuracy: {
    Highest: "highest",
    High: "high",
    Balanced: "balanced",
    Low: "low",
    Passive: "passive",
  },
}));

// Expo Notifications (إن وُجدت)
jest.mock("expo-notifications", () => ({
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  getExpoPushTokenAsync: jest
    .fn()
    .mockResolvedValue({ data: "EXPO_PUSH_TOKEN" }),
  setNotificationHandler: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(() => ({
    remove: jest.fn(),
  })),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  AndroidImportance: {
    HIGH: "high",
    DEFAULT: "default",
  },
  setNotificationChannelAsync: jest.fn(),
}));

// Expo Localization
jest.mock("expo-localization", () => ({
  locale: "en",
  locales: ["en", "ar"],
  isRTL: false,
  getLocales: () => [
    {
      languageCode: "en",
      countryCode: "US",
      languageTag: "en-US",
      decimalSeparator: ".",
      groupingSeparator: ",",
    },
  ],
}));

// React Navigation (محسن للاختبارات)
jest.mock("@react-navigation/native", () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    push: jest.fn(),
    pop: jest.fn(),
    replace: jest.fn(),
    reset: jest.fn(),
    canGoBack: jest.fn(() => true),
    isFocused: jest.fn(() => true),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatch: jest.fn(),
  };

  return {
    NavigationContainer: ({ children }) => children,
    useNavigation: () => mockNavigation,
    useIsFocused: jest.fn(() => true),
    useRoute: () => ({
      name: "TestScreen",
      key: "test-key",
      params: {
        product: {
          id: "test-product-1",
          name: "Test Product",
          image: "test-image.jpg",
          price: 25.99,
          originalPrice: 30.99,
          description: "Test product description",
        },
        storeId: "test-store-1",
        store: "Test Store",
        storeType: "grocery",
      },
    }),
    useFocusEffect: jest.fn((callback) => callback()),
  };
});

// React Navigation Stack
jest.mock("@react-navigation/stack", () => ({
  createStackNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

// React Navigation Bottom Tabs
jest.mock("@react-navigation/bottom-tabs", () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

// React Navigation Material Top Tabs
jest.mock("@react-navigation/material-top-tabs", () => ({
  createMaterialTopTabNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

// React Navigation Drawer
jest.mock("@react-navigation/drawer", () => ({
  createDrawerNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

// Suppress React Navigation warnings about inline functions
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    args[0] &&
    typeof args[0] === "string" &&
    args[0].includes("inline function for 'component' prop")
  ) {
    return; // Suppress this specific warning
  }
  originalWarn(...args);
};

// Mock axios directly
const mockAxiosInstance = {
  get: jest.fn().mockResolvedValue({
    data: {
      items: [
        {
          productId: "p1",
          name: "Test Product",
          image: "test.jpg",
          price: 100,
        },
      ],
    },
    status: 200,
    statusText: "OK",
  }),
  post: jest.fn().mockResolvedValue({
    data: { success: true },
    status: 200,
    statusText: "OK",
  }),
  put: jest.fn().mockResolvedValue({
    data: { success: true },
    status: 200,
    statusText: "OK",
  }),
  delete: jest.fn().mockResolvedValue({
    data: { success: true },
    status: 200,
    statusText: "OK",
  }),
  patch: jest.fn().mockResolvedValue({
    data: { success: true },
    status: 200,
    statusText: "OK",
  }),
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() },
  },
};

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    ...mockAxiosInstance,
    create: jest.fn(() => mockAxiosInstance),
  },
  create: jest.fn(() => mockAxiosInstance),
}));

// Mock the specific axiosInstance module
jest.mock("@/utils/api/axiosInstance", () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue({
      data: {
        items: [
          {
            productId: "p1",
            name: "Test Product",
            image: "test.jpg",
            price: 100,
          },
        ],
      },
      status: 200,
      statusText: "OK",
    }),
    post: jest.fn().mockResolvedValue({
      data: { success: true },
      status: 200,
      statusText: "OK",
    }),
    put: jest.fn().mockResolvedValue({
      data: { success: true },
      status: 200,
      statusText: "OK",
    }),
    delete: jest.fn().mockResolvedValue({
      data: { success: true },
      status: 200,
      statusText: "OK",
    }),
    patch: jest.fn().mockResolvedValue({
      data: { success: true },
      status: 200,
      statusText: "OK",
    }),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  },
}));

// React Native Alert
// Provide a mock that matches the module shape expected when importing
// `Alert` from `react-native`. Without the `default` export the named
// import `Alert` resolves to `undefined`, causing tests to crash when
// accessing `Alert.alert`. Exposing `alert` on the default export
// mirrors the React Native implementation and allows tests to safely
// spy on the alert function.
jest.mock("react-native/Libraries/Alert/Alert", () => ({
  __esModule: true,
  default: { alert: jest.fn() },
  alert: jest.fn(),
}));

// React Native WebView
jest.mock("react-native-webview", () => ({
  WebView: "WebView",
}));

// React Native Maps
jest.mock("@/shims/MapView", () => ({
  MapView: "MapView",
  Marker: "Marker",
  Callout: "Callout",
}));

// React Native Gesture Handler
jest.mock("react-native-gesture-handler", () => ({
  PanGestureHandler: "PanGestureHandler",
  TapGestureHandler: "TapGestureHandler",
  State: {},
}));

// React Native Reanimated
jest.mock("react-native-reanimated", () => ({
  View: "View",
  Text: "Text",
  Image: "Image",
  ScrollView: "ScrollView",
  FlatList: "FlatList",
  TouchableOpacity: "TouchableOpacity",
  TouchableHighlight: "TouchableHighlight",
  TouchableWithoutFeedback: "TouchableWithoutFeedback",
  TouchableNativeFeedback: "TouchableNativeFeedback",
  createAnimatedComponent: jest.fn((component) => component),
  useSharedValue: jest.fn((initialValue) => ({ value: initialValue })),
  useAnimatedStyle: jest.fn(() => ({})),
  withTiming: jest.fn((value) => value),
  withSpring: jest.fn((value) => value),
  runOnJS: jest.fn((fn) => fn),
}));

// React Native Platform
jest.mock("react-native/Libraries/Utilities/Platform", () => ({
  __esModule: true,
  default: {
    OS: "ios",
    select: (obj) => obj.ios || obj.default,
    Version: 12,
    isTV: false,
    isTesting: true,
  },
  OS: "ios",
  select: (obj) => obj.ios || obj.default,
  Version: 12,
  isTV: false,
  isTesting: true,
}));

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve([
        {
          place_id: 123456,
          licence:
            "Data © OpenStreetMap contributors, ODbL 1.0. https://osm.org/copyright",
          osm_type: "way",
          osm_id: 123456,
          boundingbox: ["15.24", "15.55", "44.05", "44.35"],
          lat: "15.3547",
          lon: "44.2067",
          display_name: "صنعاء، اليمن",
          class: "place",
          type: "city",
          importance: 0.9,
          icon: "https://nominatim.openstreetmap.org/ui/mapicons/poi_place_city.p.20.png",
        },
      ]),
    status: 200,
    statusText: "OK",
  })
);
