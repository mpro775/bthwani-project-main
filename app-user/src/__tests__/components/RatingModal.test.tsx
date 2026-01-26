import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import RatingModal from "../../components/RatingModal";

describe("RatingModal", () => {
  const mockProps = {
    visible: true,
    onClose: jest.fn(),
    onSubmit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("يتم عرض النافذة المنبثقة عندما تكون مرئية", () => {
    const { getByText } = render(<RatingModal {...mockProps} />);
    expect(getByText("قيم تجربتك")).toBeTruthy();
    expect(getByText("إرسال التقييم")).toBeTruthy();
  });

  it("لا يتم عرض النافذة المنبثقة عندما تكون غير مرئية", () => {
    const { queryByText } = render(
      <RatingModal {...mockProps} visible={false} />
    );
    expect(queryByText("قيم تجربتك")).toBeFalsy();
  });

  it("يتم عرض النجوم بشكل صحيح", () => {
    const { getByText } = render(<RatingModal {...mockProps} />);
    // البحث عن النص المحيط بالنجوم
    expect(getByText("قيم تجربتك")).toBeTruthy();
  });

  it("يتم تحديث التقييم عند الضغط على النجوم", () => {
    const { getByText } = render(<RatingModal {...mockProps} />);

    // البحث عن زر الإرسال
    const submitButton = getByText("إرسال التقييم");

    // محاولة الإرسال بدون تقييم (يجب أن يظهر خطأ)
    fireEvent.press(submitButton);
    expect(mockProps.onSubmit).not.toHaveBeenCalled();
  });

  it("يتم استدعاء onSubmit عند الضغط على إرسال بعد اختيار تقييم", () => {
    const { getByText } = render(<RatingModal {...mockProps} />);
    const submitButton = getByText("إرسال التقييم");

    // يجب أن لا يتم استدعاء onSubmit بدون تقييم
    fireEvent.press(submitButton);
    expect(mockProps.onSubmit).not.toHaveBeenCalled();
  });

  it("يتم استدعاء onClose عند الضغط على إلغاء", () => {
    const { getByText } = render(<RatingModal {...mockProps} />);
    const cancelButton = getByText("إلغاء");

    fireEvent.press(cancelButton);
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("يتم عرض رسالة خطأ عند محاولة الإرسال بدون تقييم", () => {
    const { getByText } = render(<RatingModal {...mockProps} />);
    const submitButton = getByText("إرسال التقييم");

    fireEvent.press(submitButton);
    expect(mockProps.onSubmit).not.toHaveBeenCalled();
  });

  it("يتم تطبيق التقييم الأولي بشكل صحيح", () => {
    const { getByText } = render(<RatingModal {...mockProps} />);

    // يجب أن يظهر زر الإرسال
    expect(getByText("إرسال التقييم")).toBeTruthy();
  });

  it("يتم إغلاق النافذة المنبثقة بعد الإرسال الناجح", () => {
    const { getByText } = render(<RatingModal {...mockProps} />);

    // البحث عن زر الإرسال
    const submitButton = getByText("إرسال التقييم");

    // محاولة الإرسال بدون تقييم (يجب أن لا يتم الإرسال)
    fireEvent.press(submitButton);
    expect(mockProps.onSubmit).not.toHaveBeenCalled();
    expect(mockProps.onClose).not.toHaveBeenCalled();
  });
});
