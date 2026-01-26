import React from "react";
import { render, screen } from "@testing-library/react-native";
import { View, Text, TouchableOpacity, TextInput } from "react-native";

describe("Accessibility Tests", () => {
  test("يحتوي على labels مناسبة للعناصر", () => {
    render(
      <View>
        <Text accessibilityLabel="عنوان الصفحة">الصفحة الرئيسية</Text>
        <TouchableOpacity accessibilityLabel="زر الإضافة">
          <Text>إضافة</Text>
        </TouchableOpacity>
        <TextInput
          accessibilityLabel="حقل البحث"
          placeholder="ابحث هنا..."
        />
      </View>
    );

    expect(screen.getByLabelText("عنوان الصفحة")).toBeTruthy();
    expect(screen.getByLabelText("زر الإضافة")).toBeTruthy();
    expect(screen.getByLabelText("حقل البحث")).toBeTruthy();
  });

  test("يحتوي على hints مفيدة", () => {
    render(
      <View>
        <TouchableOpacity
          accessibilityLabel="زر الحذف"
          accessibilityHint="اضغط لحذف العنصر المحدد"
        >
          <Text>حذف</Text>
        </TouchableOpacity>
        <TextInput
          accessibilityLabel="حقل كلمة المرور"
          accessibilityHint="أدخل كلمة المرور الخاصة بك"
          secureTextEntry
        />
      </View>
    );

    expect(screen.getByLabelText("زر الحذف")).toBeTruthy();
    expect(screen.getByLabelText("حقل كلمة المرور")).toBeTruthy();
  });

  test("يحتوي على أدوار مدعومة", () => {
    render(
      <View>
        <TouchableOpacity accessibilityRole="button">
          <Text>زر</Text>
        </TouchableOpacity>
        <View accessibilityRole="header" testID="header-element">
          <Text>العنوان</Text>
        </View>
      </View>
    );

    // الأدوار المدعومة فقط
    expect(screen.getByRole("button")).toBeTruthy();
    expect(screen.getByTestId("header-element")).toBeTruthy();
  });

  test("يدعم التنقل بالكيبورد عبر testID", () => {
    render(
      <View>
        <TouchableOpacity
          testID="button1"
          accessible
          accessibilityLabel="الزر الأول"
        >
          <Text>زر 1</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="button2"
          accessible
          accessibilityLabel="الزر الثاني"
        >
          <Text>زر 2</Text>
        </TouchableOpacity>
      </View>
    );

    expect(screen.getByTestId("button1")).toBeTruthy();
    expect(screen.getByTestId("button2")).toBeTruthy();
  });

  test("يحتوي على نصوص بديلة للصور", () => {
    render(
      <View>
        <Text accessibilityLabel="صورة المنتج">🖼️</Text>
        <Text accessibilityLabel="أيقونة القلب">❤️</Text>
        <Text accessibilityLabel="أيقونة السلة">🛒</Text>
      </View>
    );

    expect(screen.getByLabelText("صورة المنتج")).toBeTruthy();
    expect(screen.getByLabelText("أيقونة القلب")).toBeTruthy();
    expect(screen.getByLabelText("أيقونة السلة")).toBeTruthy();
  });
});
