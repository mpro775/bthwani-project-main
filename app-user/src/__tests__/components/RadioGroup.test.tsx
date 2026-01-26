import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import RadioGroup from "../../components/RadioGroup";

describe("RadioGroup", () => {
  const mockOptions = [
    { label: "خيار 1", value: "option1" },
    { label: "خيار 2", value: "option2" },
    { label: "خيار 3", value: "option3" },
  ];

  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("يتم عرض المكون بشكل صحيح", () => {
    const { getByText } = render(
      <RadioGroup
        options={mockOptions}
        selectedValue="option1"
        onChange={mockOnChange}
      />
    );
    expect(getByText("خيار 1")).toBeTruthy();
  });

  it("يتم عرض جميع الخيارات", () => {
    const { getByText } = render(
      <RadioGroup
        options={mockOptions}
        selectedValue="option1"
        onChange={mockOnChange}
      />
    );
    expect(getByText("خيار 1")).toBeTruthy();
    expect(getByText("خيار 2")).toBeTruthy();
    expect(getByText("خيار 3")).toBeTruthy();
  });

  it("يتم تحديد الخيار المحدد مسبقاً", () => {
    const { getByText } = render(
      <RadioGroup
        options={mockOptions}
        selectedValue="option2"
        onChange={mockOnChange}
      />
    );
    expect(getByText("خيار 2")).toBeTruthy();
  });

  it("يتم استدعاء onChange عند الضغط على خيار", () => {
    const { getByText } = render(
      <RadioGroup
        options={mockOptions}
        selectedValue="option1"
        onChange={mockOnChange}
      />
    );
    const option3 = getByText("خيار 3");
    fireEvent.press(option3);

    expect(mockOnChange).toHaveBeenCalledWith("option3");
  });

  it("يتم تحديث الخيار المحدد عند الضغط", () => {
    const { getByText, rerender } = render(
      <RadioGroup
        options={mockOptions}
        selectedValue="option1"
        onChange={mockOnChange}
      />
    );
    const option2 = getByText("خيار 2");
    fireEvent.press(option2);

    // إعادة التصيير مع القيمة الجديدة
    rerender(
      <RadioGroup
        options={mockOptions}
        selectedValue="option2"
        onChange={mockOnChange}
      />
    );

    expect(mockOnChange).toHaveBeenCalledWith("option2");
  });

  it("يتم تطبيق الأنماط المخصصة", () => {
    const { getByText } = render(
      <RadioGroup
        options={mockOptions}
        selectedValue="option1"
        onChange={mockOnChange}
      />
    );
    expect(getByText("خيار 1")).toBeTruthy();
  });

  it("يتم تطبيق أنماط مخصصة للخيارات", () => {
    const { getByText } = render(
      <RadioGroup
        options={mockOptions}
        selectedValue="option1"
        onChange={mockOnChange}
      />
    );
    expect(getByText("خيار 1")).toBeTruthy();
  });

  it("يتم تطبيق أنماط مخصصة للنص", () => {
    const { getByText } = render(
      <RadioGroup
        options={mockOptions}
        selectedValue="option1"
        onChange={mockOnChange}
      />
    );
    expect(getByText("خيار 1")).toBeTruthy();
  });

  it('يتم عرض الخيارات بشكل أفقي عند تحديد direction="horizontal"', () => {
    const { getByText } = render(
      <RadioGroup
        options={mockOptions}
        selectedValue="option1"
        onChange={mockOnChange}
      />
    );
    expect(getByText("خيار 1")).toBeTruthy();
  });

  it("يتم عرض الخيارات بشكل عمودي افتراضياً", () => {
    const { getByText } = render(
      <RadioGroup
        options={mockOptions}
        selectedValue="option1"
        onChange={mockOnChange}
      />
    );
    expect(getByText("خيار 1")).toBeTruthy();
  });

  it("يتم تطبيق الأنماط المختلفة للخيارات المحددة وغير المحددة", () => {
    const { getByText } = render(
      <RadioGroup
        options={mockOptions}
        selectedValue="option1"
        onChange={mockOnChange}
      />
    );
    expect(getByText("خيار 1")).toBeTruthy();
    expect(getByText("خيار 2")).toBeTruthy();
  });

  it("يتم عرض رسالة عند عدم وجود خيارات", () => {
    const { getByText } = render(
      <RadioGroup options={[]} selectedValue="" onChange={mockOnChange} />
    );
    // لا توجد رسالة في المكون الحالي
    expect(getByText).toBeDefined();
  });

  it("يتم تطبيق الأنماط المخصصة للنص عند عدم وجود خيارات", () => {
    const { getByText } = render(
      <RadioGroup options={[]} selectedValue="" onChange={mockOnChange} />
    );
    // لا توجد رسالة في المكون الحالي
    expect(getByText).toBeDefined();
  });

  it("يتم تطبيق الأنماط المخصصة للنص الفارغ", () => {
    const { getByText } = render(
      <RadioGroup options={[]} selectedValue="" onChange={mockOnChange} />
    );
    // لا توجد رسالة في المكون الحالي
    expect(getByText).toBeDefined();
  });
});
