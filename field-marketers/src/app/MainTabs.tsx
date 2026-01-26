import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Svg, Path, G, Rect, Circle } from "react-native-svg";
import DashboardScreen from "../screens/home/DashboardScreen";
import OnboardingListScreen from "../screens/onboarding/OnboardingListScreen";
import OnboardingWizardScreen from "../screens/onboarding/OnboardingWizardScreen";
import OnboardingDetailScreen from "../screens/onboarding/OnboardingDetailScreen";
import ProfileScreen from "../screens/account/ProfileScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import COLORS from "../constants/colors";

const Tab = createBottomTabNavigator();
const OnbStack = createNativeStackNavigator();

// مكونات الأيقونات
function HomeIcon({ focused }: { focused: boolean }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        stroke={focused ? COLORS.primary : COLORS.textLight}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={focused ? COLORS.primary : "none"}
      />
      <Path
        d="M9 22V12h6v10"
        stroke={focused ? COLORS.white : COLORS.textLight}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function OrdersIcon({ focused }: { focused: boolean }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4m-5-4l3-3m0 0l3 3m-3-3v12"
        stroke={focused ? COLORS.primary : COLORS.textLight}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={focused ? COLORS.primary : "none"}
      />
    </Svg>
  );
}

function AddStoreIcon({ focused }: { focused: boolean }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L2 7l10 5 10-5-10-5z"
        stroke={focused ? COLORS.primary : COLORS.textLight}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={focused ? COLORS.primary : "none"}
      />
      <Path
        d="M2 17l10 5 10-5M2 12l10 5 10-5"
        stroke={focused ? COLORS.white : COLORS.textLight}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ProfileIcon({ focused }: { focused: boolean }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
        stroke={focused ? COLORS.primary : COLORS.textLight}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle
        cx={12}
        cy={7}
        r={4}
        stroke={focused ? COLORS.primary : COLORS.textLight}
        strokeWidth={2}
        fill={focused ? COLORS.primary : "none"}
      />
    </Svg>
  );
}


function OnboardingStack() {
  return (
    <OnbStack.Navigator>
      <OnbStack.Screen
        name="OnboardingList"
        component={OnboardingListScreen}
        options={{ headerShown: false }}
      />
      <OnbStack.Screen
        name="OnboardingDetail"
        component={OnboardingDetailScreen}
        options={{ headerShown: false }}
      />
    </OnbStack.Navigator>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: "Cairo_600SemiBold",
        },
        headerStyle: {
          backgroundColor: COLORS.white,
          borderBottomColor: COLORS.border,
          borderBottomWidth: 1,
        },
        headerTitleStyle: {
          fontFamily: "Cairo_700Bold",
          fontSize: 18,
          color: COLORS.text,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: "الرئيسية",
          headerShown: false,
          tabBarIcon: ({ focused }) => <HomeIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Onboarding"
        component={OnboardingStack}
        options={{
          title: "الطلبات",
          headerShown: false,
          tabBarIcon: ({ focused }) => <OrdersIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name="OnboardingNew"
        component={OnboardingWizardScreen}
        options={{
          title: "متجر جديد",
          headerShown: false,
          tabBarIcon: ({ focused }) => <AddStoreIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "حسابي",
          headerShown: false,
          tabBarIcon: ({ focused }) => <ProfileIcon focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}
