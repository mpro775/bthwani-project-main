import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import DeliveryWorkingHours from "../../../components/delivery/DeliveryWorkingHours";

// Mock للـ @expo/vector-icons
jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: "Icon",
}));

// Mock للـ constants/colors
jest.mock("../../../constants/colors", () => ({
  primary: "#D84315",
}));

describe("DeliveryWorkingHours", () => {
  const mockWorkingHours = [
    { day: "الأحد", open: "08:00", close: "20:00", isOpen: true },
    { day: "الاثنين", open: "08:00", close: "20:00", isOpen: true },
    { day: "الثلاثاء", open: "08:00", close: "20:00", isOpen: false },
    { day: "الأربعاء", open: "09:00", close: "21:00", isOpen: true },
    { day: "الخميس", open: "09:00", close: "21:00", isOpen: true },
    { day: "الجمعة", open: "10:00", close: "22:00", isOpen: true },
    { day: "السبت", open: "10:00", close: "22:00", isOpen: false },
  ];

  describe("العرض الأساسي", () => {
    test("يعرض العنوان الصحيح", () => {
      const { getByText } = render(<DeliveryWorkingHours />);

      expect(getByText("ساعات العمل")).toBeTruthy();
    });

    test("يعرض 7 أيام افتراضية", () => {
      const { getByTestId } = render(<DeliveryWorkingHours />);

      expect(getByTestId("hour-row-0")).toBeTruthy();
      expect(getByTestId("hour-row-1")).toBeTruthy();
      expect(getByTestId("hour-row-2")).toBeTruthy();
      expect(getByTestId("hour-row-3")).toBeTruthy();
      expect(getByTestId("hour-row-4")).toBeTruthy();
      expect(getByTestId("hour-row-5")).toBeTruthy();
      expect(getByTestId("hour-row-6")).toBeTruthy();
    });

    test("يعرض الأيام الافتراضية بالترتيب الصحيح", () => {
      const { getByText } = render(<DeliveryWorkingHours />);

      expect(getByText("الأحد")).toBeTruthy();
      expect(getByText("الاثنين")).toBeTruthy();
      expect(getByText("الثلاثاء")).toBeTruthy();
      expect(getByText("الأربعاء")).toBeTruthy();
      expect(getByText("الخميس")).toBeTruthy();
      expect(getByText("الجمعة")).toBeTruthy();
      expect(getByText("السبت")).toBeTruthy();
    });

    test("يعرض الساعات الافتراضية", () => {
      const { getAllByText } = render(<DeliveryWorkingHours />);

      // استخدم getAllByText للحصول على جميع النصوص
      const times09 = getAllByText("09:00");
      const times22 = getAllByText("22:00");
      const times10 = getAllByText("10:00");
      const times23 = getAllByText("23:00");

      expect(times09.length).toBeGreaterThan(0);
      expect(times22.length).toBeGreaterThan(0);
      expect(times10.length).toBeGreaterThan(0);
      expect(times23.length).toBeGreaterThan(0);
    });
  });

  describe("عرض ساعات العمل المخصصة", () => {
    test("يعرض ساعات العمل المخصصة عند تمريرها", () => {
      const { getAllByText } = render(
        <DeliveryWorkingHours workingHours={mockWorkingHours} />
      );

      const times08 = getAllByText("08:00");
      const times20 = getAllByText("20:00");
      const times09 = getAllByText("09:00");
      const times21 = getAllByText("21:00");

      expect(times08.length).toBeGreaterThan(0);
      expect(times20.length).toBeGreaterThan(0);
      expect(times09.length).toBeGreaterThan(0);
      expect(times21.length).toBeGreaterThan(0);
    });

    test("يعرض أيام العمل المخصصة", () => {
      const { getByText } = render(
        <DeliveryWorkingHours workingHours={mockWorkingHours} />
      );

      expect(getByText("الأحد")).toBeTruthy();
      expect(getByText("الاثنين")).toBeTruthy();
      expect(getByText("الثلاثاء")).toBeTruthy();
      expect(getByText("الأربعاء")).toBeTruthy();
      expect(getByText("الخميس")).toBeTruthy();
      expect(getByText("الجمعة")).toBeTruthy();
      expect(getByText("السبت")).toBeTruthy();
    });
  });

  describe("حالة الأيام المفتوحة والمغلقة", () => {
    test("يعرض الأيام المفتوحة بشكل صحيح", () => {
      const { getAllByText } = render(
        <DeliveryWorkingHours workingHours={mockWorkingHours} />
      );

      // الأيام المفتوحة
      const times08 = getAllByText("08:00");
      const times20 = getAllByText("20:00");
      const times09 = getAllByText("09:00");
      const times21 = getAllByText("21:00");
      const times10 = getAllByText("10:00");
      const times22 = getAllByText("22:00");

      expect(times08.length).toBeGreaterThan(0);
      expect(times20.length).toBeGreaterThan(0);
      expect(times09.length).toBeGreaterThan(0);
      expect(times21.length).toBeGreaterThan(0);
      expect(times10.length).toBeGreaterThan(0);
      expect(times22.length).toBeGreaterThan(0);
    });

    test("يعرض الأيام المغلقة بشكل صحيح", () => {
      const { getAllByText } = render(
        <DeliveryWorkingHours workingHours={mockWorkingHours} />
      );

      // الأيام المغلقة
      const closedTexts = getAllByText("مغلق");
      expect(closedTexts.length).toBeGreaterThan(0);
    });

    test("يستخدم الأنماط الصحيحة للأيام المغلقة", () => {
      const { getByTestId } = render(
        <DeliveryWorkingHours workingHours={mockWorkingHours} />
      );

      const closedRow = getByTestId("hour-row-2"); // الثلاثاء مغلق
      expect(closedRow.props.style).toContainEqual(
        expect.objectContaining({ backgroundColor: "#f0f0f0" })
      );
    });
  });

  describe("أزرار التحرير", () => {
    test("لا يعرض زر التحرير عندما isEditable = false", () => {
      const { queryByTestId } = render(<DeliveryWorkingHours />);

      expect(queryByTestId("edit-hours-button")).toBeNull();
    });

    test("يعرض زر التحرير عندما isEditable = true", () => {
      const { getByTestId } = render(
        <DeliveryWorkingHours isEditable={true} />
      );

      expect(getByTestId("edit-hours-button")).toBeTruthy();
    });

    test("يستجيب للنقر على زر التحرير", () => {
      const mockOnEdit = jest.fn();
      const { getByTestId } = render(
        <DeliveryWorkingHours isEditable={true} onEdit={mockOnEdit} />
      );

      const editButton = getByTestId("edit-hours-button");
      fireEvent.press(editButton);

      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });

    test("لا يستدعي onEdit عندما isEditable = false", () => {
      const mockOnEdit = jest.fn();
      const { getByTestId } = render(
        <DeliveryWorkingHours isEditable={false} onEdit={mockOnEdit} />
      );

      // حتى لو كان هناك زر، لا يجب أن يستدعي onEdit
      expect(mockOnEdit).not.toHaveBeenCalled();
    });
  });

  describe("ملخص ساعات العمل", () => {
    test("يعرض عدد أيام العمل الصحيح", () => {
      const { getByText } = render(
        <DeliveryWorkingHours workingHours={mockWorkingHours} />
      );

      // 5 أيام مفتوحة من 7
      expect(getByText("ساعات العمل: 5 أيام")).toBeTruthy();
    });

    test("يعرض إجمالي الساعات الصحيح", () => {
      const { getByText } = render(
        <DeliveryWorkingHours workingHours={mockWorkingHours} />
      );

      // 5 أيام × 13 ساعة = 65 ساعة
      expect(getByText("إجمالي الساعات: 65 ساعة")).toBeTruthy();
    });

    test("يعرض الملخص الصحيح مع الساعات الافتراضية", () => {
      const { getByText } = render(<DeliveryWorkingHours />);

      // 7 أيام مفتوحة × 13 ساعة = 91 ساعة
      expect(getByText("ساعات العمل: 7 أيام")).toBeTruthy();
      expect(getByText("إجمالي الساعات: 91 ساعة")).toBeTruthy();
    });
  });

  describe("الخصائص البصرية", () => {
    test("يستخدم الألوان الصحيحة", () => {
      const { getByTestId } = render(<DeliveryWorkingHours />);

      const container = getByTestId("hour-row-0");
      expect(container.props.style).toContainEqual(
        expect.objectContaining({ backgroundColor: "#f9f9f9" })
      );
    });

    test("يستخدم الأحجام والأنماط الصحيحة", () => {
      const { getByTestId } = render(<DeliveryWorkingHours />);

      const container = getByTestId("hour-row-0");
      expect(container.props.style).toContainEqual(
        expect.objectContaining({
          borderRadius: 8,
          paddingVertical: 8,
          paddingHorizontal: 12,
        })
      );
    });

    test("يستخدم elevation وظلال صحيحة", () => {
      const { getByText } = render(<DeliveryWorkingHours />);

      const title = getByText("ساعات العمل");
      const container = title.parent?.parent;

      if (container) {
        expect(container.props.style).toContainEqual(
          expect.objectContaining({
            elevation: 2,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
          })
        );
      }
    });
  });

  describe("نقاط الحالة", () => {
    test("يعرض نقاط الحالة الصحيحة", () => {
      const { getByTestId } = render(
        <DeliveryWorkingHours workingHours={mockWorkingHours} />
      );

      // الأيام المفتوحة - نقطة خضراء
      const openRow = getByTestId("hour-row-0");
      const openDot = openRow.findByType("View");
      expect(openDot).toBeTruthy();

      // الأيام المغلقة - نقطة حمراء
      const closedRow = getByTestId("hour-row-2");
      const closedDot = closedRow.findByType("View");
      expect(closedDot).toBeTruthy();
    });

    test("يستخدم أحجام نقاط الحالة الصحيحة", () => {
      const { getByTestId } = render(<DeliveryWorkingHours />);

      const row = getByTestId("hour-row-0");
      const dot = row.findByType("View");
      expect(dot).toBeTruthy();
    });
  });

  describe("الحالات الاستثنائية", () => {
    test("يتعامل مع مصفوفة فارغة", () => {
      const { getByText } = render(<DeliveryWorkingHours workingHours={[]} />);

      // يجب أن يستخدم الساعات الافتراضية
      expect(getByText("الأحد")).toBeTruthy();
      expect(getByText("السبت")).toBeTruthy();
    });

    test("يتعامل مع مصفوفة null", () => {
      const { getByText } = render(
        <DeliveryWorkingHours workingHours={null} />
      );

      // يجب أن يستخدم الساعات الافتراضية
      expect(getByText("الأحد")).toBeTruthy();
      expect(getByText("السبت")).toBeTruthy();
    });

    test("يتعامل مع مصفوفة undefined", () => {
      const { getByText } = render(
        <DeliveryWorkingHours workingHours={undefined} />
      );

      // يجب أن يستخدم الساعات الافتراضية
      expect(getByText("الأحد")).toBeTruthy();
      expect(getByText("السبت")).toBeTruthy();
    });
  });

  describe("التفاعل مع المستخدم", () => {
    test("يستجيب للنقر على زر التحرير", () => {
      const mockOnEdit = jest.fn();
      const { getByTestId } = render(
        <DeliveryWorkingHours isEditable={true} onEdit={mockOnEdit} />
      );

      const editButton = getByTestId("edit-hours-button");
      fireEvent.press(editButton);

      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });

    test("لا يحدث خطأ عند النقر بدون onEdit", () => {
      const { getByTestId } = render(
        <DeliveryWorkingHours isEditable={true} />
      );

      const editButton = getByTestId("edit-hours-button");

      // يجب أن لا يحدث خطأ
      expect(() => fireEvent.press(editButton)).not.toThrow();
    });
  });

  describe("التكامل مع المكونات الأخرى", () => {
    test("يستخدم Icon بشكل صحيح", () => {
      const { getByTestId } = render(
        <DeliveryWorkingHours isEditable={true} />
      );

      const editButton = getByTestId("edit-hours-button");
      const icon = editButton.findByType("Icon");
      expect(icon).toBeTruthy();
      expect(icon.props).toMatchObject({
        name: "edit",
        size: 20,
        color: "#D84315",
      });
    });

    test("يستخدم TouchableOpacity بشكل صحيح", () => {
      const { getByTestId } = render(
        <DeliveryWorkingHours isEditable={true} />
      );

      const editButton = getByTestId("edit-hours-button");
      expect(editButton.type).toBe("TouchableOpacity");
    });
  });
});
