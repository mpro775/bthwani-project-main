// __tests__/components/business/BusinessInfoCard.test.tsx
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import BusinessInfoCard from "../../../components/business/BusinessInfoCard";

describe("BusinessInfoCard", () => {
  const mockBusiness = {
    name: "مطعم الشرق",
    nameAr: "Eastern Restaurant",
    logo: "https://example.com/logo.jpg",
    rating: 4.5,
    distance: "2.3 كم",
    time: "15 دقيقة",
    isOpen: true,
    categories: ["مطاعم", "عربية"],
    schedule: [
      { day: "monday", open: true, from: "09:00", to: "22:00" },
      { day: "tuesday", open: true, from: "09:00", to: "22:00" },
      { day: "wednesday", open: false, from: "", to: "" },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("يتم عرض معلومات العمل الأساسية", () => {
    const { getByText } = render(<BusinessInfoCard business={mockBusiness} />);

    expect(getByText("مطعم الشرق")).toBeTruthy();
    expect(getByText("Eastern Restaurant")).toBeTruthy();
    expect(getByText("مطاعم • عربية")).toBeTruthy();
    expect(getByText("4.5")).toBeTruthy();
    expect(getByText("15 دقيقة")).toBeTruthy();
    expect(getByText("2.3 كم")).toBeTruthy();
  });

  test("يتم عرض حالة الفتح/الإغلاق", () => {
    const { getByText } = render(<BusinessInfoCard business={mockBusiness} />);
    expect(getByText("مفتوح")).toBeTruthy();
  });

  test("يتم عرض حالة الإغلاق", () => {
    const closedBusiness = { ...mockBusiness, isOpen: false };
    const { getByText } = render(
      <BusinessInfoCard business={closedBusiness} />
    );
    expect(getByText("مغلق")).toBeTruthy();
  });

  test("يتم عرض التصنيفات إذا كانت موجودة", () => {
    const { getByText } = render(<BusinessInfoCard business={mockBusiness} />);
    expect(getByText("مطاعم • عربية")).toBeTruthy();
  });

  test("لا يتم عرض التصنيفات إذا لم تكن موجودة", () => {
    const businessWithoutCategories = {
      ...mockBusiness,
      categories: undefined,
    };
    const { queryByText } = render(
      <BusinessInfoCard business={businessWithoutCategories} />
    );
    expect(queryByText("مطاعم • عربية")).toBeNull();
  });

  test("يتم فتح modal أوقات الدوام عند الضغط على زر التقويم", () => {
    const { getByTestId, getByText } = render(
      <BusinessInfoCard business={mockBusiness} />
    );
    const calendarButton = getByTestId("calendar-button");

    fireEvent.press(calendarButton);
    expect(getByText("أوقات الدوام")).toBeTruthy();
  });

  test("يتم عرض أوقات الدوام في الـ modal", () => {
    const { getByTestId, getByText, getAllByText } = render(
      <BusinessInfoCard business={mockBusiness} />
    );
    const calendarButton = getByTestId("calendar-button");

    fireEvent.press(calendarButton);

    expect(getByText("الاثنين")).toBeTruthy();
    // استخدام getAllByText للعناصر المتعددة
    const timeElements = getAllByText("9:00 ص - 10:00 م");
    expect(timeElements.length).toBeGreaterThan(0);
    expect(getByText("مغلق")).toBeTruthy();
  });

  test("يتم إغلاق الـ modal عند الضغط على زر الإغلاق", () => {
    const { getByTestId, queryByText } = render(
      <BusinessInfoCard business={mockBusiness} />
    );
    const calendarButton = getByTestId("calendar-button");

    fireEvent.press(calendarButton);
    expect(queryByText("أوقات الدوام")).toBeTruthy();

    const closeButton = getByTestId("close-modal-button");
    fireEvent.press(closeButton);
    expect(queryByText("أوقات الدوام")).toBeNull();
  });

  test("يتم عرض رسالة فارغة إذا لم تكن هناك أوقات دوام", () => {
    const businessWithoutSchedule = { ...mockBusiness, schedule: [] };
    const { getByTestId, getByText } = render(
      <BusinessInfoCard business={businessWithoutSchedule} />
    );
    const calendarButton = getByTestId("calendar-button");

    fireEvent.press(calendarButton);
    expect(getByText("لا توجد بيانات")).toBeTruthy();
  });

  test("يتم تنسيق الوقت بشكل صحيح", () => {
    const { getByTestId, getAllByText } = render(
      <BusinessInfoCard business={mockBusiness} />
    );
    const calendarButton = getByTestId("calendar-button");

    fireEvent.press(calendarButton);

    // اختبار تنسيق الوقت - استخدام getAllByText لأن هناك عناصر متعددة
    const timeElements = getAllByText("9:00 ص - 10:00 م");
    expect(timeElements.length).toBeGreaterThan(0);
  });

  test("يتعامل مع rating غير صحيح", () => {
    const businessWithInvalidRating = { ...mockBusiness, rating: NaN };
    const { getByText } = render(
      <BusinessInfoCard business={businessWithInvalidRating} />
    );
    expect(getByText("—")).toBeTruthy();
  });

  test("يتعامل مع rating صفر", () => {
    const businessWithZeroRating = { ...mockBusiness, rating: 0 };
    const { getByText } = render(
      <BusinessInfoCard business={businessWithZeroRating} />
    );
    expect(getByText("0.0")).toBeTruthy();
  });
});
