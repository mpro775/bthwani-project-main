// src/navigation/RootNavigation.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  CommonActions,
  DrawerActions,
  createNavigationContainerRef,
} from "@react-navigation/native";
import { InteractionManager } from "react-native";

export const navigationRef = createNavigationContainerRef<any>();

// طابور يُنفَّذ بعد الجاهزية
const pendingQueue: Array<() => void> = [];
let navReady = false;

export function runWhenNavReady(fn: () => void) {
  if (navigationRef.isReady()) fn();
  else pendingQueue.push(fn);
}

export function onNavReady() {
  navReady = true;
  while (pendingQueue.length) {
    try {
      pendingQueue.shift()?.();
    } catch {}
  }
}

/** ⬅️⬅️ استخدم هذه في أي مكان خارج الشاشات */
export function safeNavigate(name: string, params?: object) {
  const act = () => {
    try {
      // استخدم dispatch لتفادي أخطاء "not initialized" على بعض الحالات
      navigationRef.dispatch(
        CommonActions.navigate(name as never, params as never)
      );
    } catch (e) {
      console.warn("safeNavigate error:", e);
    }
  };
  if (navigationRef.isReady()) act();
  else {
    pendingQueue.push(act);
  }
}

export function safeReset(
  routes: Array<{ name: string; params?: object }>,
  index = routes.length - 1
) {
  const act = () =>
    navigationRef.dispatch(
      CommonActions.reset({ index, routes: routes as any })
    );
  if (navigationRef.isReady()) act();
  else pendingQueue.push(act);
}

export function safeCloseDrawer() {
  const act = () => navigationRef.dispatch(DrawerActions.closeDrawer());
  if (navigationRef.isReady()) act();
  else pendingQueue.push(act);
}

/** تسجيل خروج عالمي */
export async function safeLogout() {
  safeCloseDrawer();
  await AsyncStorage.multiRemove(["authToken", "user", "refreshToken"]);
  InteractionManager.runAfterInteractions(() => {
    safeReset([{ name: "Login" }], 0);
  });
}
