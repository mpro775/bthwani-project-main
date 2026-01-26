// toastConfig.ts
import React from "react";
import { BaseToast, ErrorToast, BaseToastProps } from "react-native-toast-message";

const baseStyle = {
  borderLeftWidth: 6,
  borderRadius: 12,
  paddingVertical: 10,
  paddingHorizontal: 12,
  marginHorizontal: 16,
  marginTop: 8,
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 3 },
  elevation: 5,
};

export const toastConfig = {
  success: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={{
        ...baseStyle,
        borderLeftColor: "#4CAF50",
        backgroundColor: "#FFFFFF",
      }}
      contentContainerStyle={{ paddingHorizontal: 12 }}
      text1Style={{
        fontSize: 16,
        fontFamily: "Cairo-Bold",
        color: "#2E7D32",
      }}
      text2Style={{
        fontSize: 14,
        fontFamily: "Cairo-Regular",
        color: "#4E342E",
      }}
    />
  ),

  error: (props: BaseToastProps) => (
    <ErrorToast
      {...props}
      style={{
        ...baseStyle,
        borderLeftColor: "#D84315",
        backgroundColor: "#FFF5F2",
      }}
      contentContainerStyle={{ paddingHorizontal: 12 }}
      text1Style={{
        fontSize: 16,
        fontFamily: "Cairo-Bold",
        color: "#D84315",
      }}
      text2Style={{
        fontSize: 14,
        fontFamily: "Cairo-Regular",
        color: "#6E0000",
      }}
    />
  ),

  info: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={{
        ...baseStyle,
        borderLeftColor: "#1976D2",
        backgroundColor: "#F0F8FF",
      }}
      contentContainerStyle={{ paddingHorizontal: 12 }}
      text1Style={{
        fontSize: 16,
        fontFamily: "Cairo-Bold",
        color: "#1976D2",
      }}
      text2Style={{
        fontSize: 14,
        fontFamily: "Cairo-Regular",
        color: "#0D47A1",
      }}
    />
  ),
};
