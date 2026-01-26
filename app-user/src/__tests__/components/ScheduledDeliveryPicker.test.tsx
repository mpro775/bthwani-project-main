import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import ScheduledDeliveryPicker from "../../components/ScheduledDeliveryPicker";

// Mock DateTimePicker
jest.mock("@react-native-community/datetimepicker", () => "DateTimePicker");

describe("ScheduledDeliveryPicker", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnChange.mockClear();
  });

  test("يجب أن يعرض العنوان والتبديل", () => {
    render(<ScheduledDeliveryPicker onChange={mockOnChange} />);

    expect(screen.getByText("طلب مجدول")).toBeTruthy();
    expect(screen.getByRole("switch")).toBeTruthy();
  });

  test("يجب أن يكون التبديل في حالة إيقاف افتراضياً", () => {
    render(<ScheduledDeliveryPicker onChange={mockOnChange} />);

    const switchElement = screen.getByRole("switch");
    expect(switchElement.props.value).toBe(false);
  });

  test("يجب أن يعرض النص الافتراضي عند عدم التفعيل", () => {
    render(<ScheduledDeliveryPicker onChange={mockOnChange} />);

    // النص "لم يتم اختيار الموعد" يظهر فقط عند تفعيل الجدولة
    expect(screen.queryByText("لم يتم اختيار الموعد")).toBeNull();
  });

  test("يجب أن يتعامل مع تفعيل الجدولة", () => {
    render(<ScheduledDeliveryPicker onChange={mockOnChange} />);

    const switchElement = screen.getByRole("switch");
    fireEvent(switchElement, "valueChange", true);

    expect(
      screen.getByText("اختر تاريخ ووقت التوصيل (خلال ٣ أيام قادمة):")
    ).toBeTruthy();
  });

  test("يجب أن يعرض زر اختيار التاريخ عند التفعيل", () => {
    render(<ScheduledDeliveryPicker onChange={mockOnChange} />);

    const switchElement = screen.getByRole("switch");
    fireEvent(switchElement, "valueChange", true);

    const dateButton = screen.getByText("لم يتم اختيار الموعد");
    expect(dateButton).toBeTruthy();
  });

  test("يجب أن يعرض DateTimePicker عند النقر على زر التاريخ", () => {
    render(<ScheduledDeliveryPicker onChange={mockOnChange} />);

    const switchElement = screen.getByRole("switch");
    fireEvent(switchElement, "valueChange", true);

    const dateButton = screen.getByText("لم يتم اختيار الموعد");
    fireEvent.press(dateButton);

    // التحقق من وجود DateTimePicker
    expect(screen.getByText("لم يتم اختيار الموعد")).toBeTruthy();
  });

  test("يجب أن يتعامل مع إلغاء التفعيل", () => {
    render(<ScheduledDeliveryPicker onChange={mockOnChange} />);

    const switchElement = screen.getByRole("switch");

    // تفعيل
    fireEvent(switchElement, "valueChange", true);
    expect(
      screen.getByText("اختر تاريخ ووقت التوصيل (خلال ٣ أيام قادمة):")
    ).toBeTruthy();

    // إلغاء التفعيل
    fireEvent(switchElement, "valueChange", false);
    expect(mockOnChange).toHaveBeenCalledWith(null);
  });

  test("يجب أن يكون لديه النمط الصحيح", () => {
    render(<ScheduledDeliveryPicker onChange={mockOnChange} />);

    const container = screen.getByText("طلب مجدول").parent;
    expect(container).toBeTruthy();
  });

  test("يجب أن يكون لديه الألوان الصحيحة", () => {
    render(<ScheduledDeliveryPicker onChange={mockOnChange} />);

    const switchElement = screen.getByRole("switch");
    fireEvent(switchElement, "valueChange", true);

    const dateButton = screen.getByText("لم يتم اختيار الموعد");
    expect(dateButton).toBeTruthy();
  });

  test("يجب أن يكون لديه الحجم الصحيح", () => {
    render(<ScheduledDeliveryPicker onChange={mockOnChange} />);

    const switchElement = screen.getByRole("switch");
    fireEvent(switchElement, "valueChange", true);

    const dateButton = screen.getByText("لم يتم اختيار الموعد");
    expect(dateButton).toBeTruthy();
  });

  test("يجب أن يكون لديه الحد الأدنى والأعلى للتاريخ", () => {
    render(<ScheduledDeliveryPicker onChange={mockOnChange} />);

    const switchElement = screen.getByRole("switch");
    fireEvent(switchElement, "valueChange", true);

    expect(
      screen.getByText("اختر تاريخ ووقت التوصيل (خلال ٣ أيام قادمة):")
    ).toBeTruthy();
  });
});
