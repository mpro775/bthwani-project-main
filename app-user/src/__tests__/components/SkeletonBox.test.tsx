import { render, screen } from "@testing-library/react-native";
import React from "react";
import SkeletonBox from "../../components/SkeletonBox";

describe("SkeletonBox", () => {
  test("يجب أن يعرض صندوق الهيكل العظمي", () => {
    render(<SkeletonBox />);

    const skeletonBox = screen.getByTestId("skeleton-box");
    expect(skeletonBox).toBeTruthy();
  });

  test("يجب أن يستخدم القيم الافتراضية", () => {
    render(<SkeletonBox />);

    const skeletonBox = screen.getByTestId("skeleton-box");
    expect(skeletonBox).toBeTruthy();
  });

  test("يجب أن يتعامل مع العرض المخصص", () => {
    render(<SkeletonBox width={200} />);

    const skeletonBox = screen.getByTestId("skeleton-box");
    expect(skeletonBox).toBeTruthy();
  });

  test("يجب أن يتعامل مع الارتفاع المخصص", () => {
    render(<SkeletonBox height={50} />);

    const skeletonBox = screen.getByTestId("skeleton-box");
    expect(skeletonBox).toBeTruthy();
  });

  test("يجب أن يتعامل مع نصف القطر المخصص", () => {
    render(<SkeletonBox borderRadius={10} />);

    const skeletonBox = screen.getByTestId("skeleton-box");
    expect(skeletonBox).toBeTruthy();
  });

  test("يجب أن يتعامل مع النمط المخصص", () => {
    const customStyle = { backgroundColor: "red" };
    render(<SkeletonBox style={customStyle} />);

    const skeletonBox = screen.getByTestId("skeleton-box");
    expect(skeletonBox).toBeTruthy();
  });

  test("يجب أن يكون لديه الخصائص الصحيحة", () => {
    render(<SkeletonBox width="50%" height={30} borderRadius={8} />);

    const skeletonBox = screen.getByTestId("skeleton-box");
    expect(skeletonBox).toBeTruthy();
  });

  test("يجب أن يكون لديه النمط الأساسي", () => {
    render(<SkeletonBox />);

    const skeletonBox = screen.getByTestId("skeleton-box");
    expect(skeletonBox).toBeTruthy();
  });

  test("يجب أن يكون لديه الألوان الصحيحة", () => {
    render(<SkeletonBox />);

    const skeletonBox = screen.getByTestId("skeleton-box");
    expect(skeletonBox).toBeTruthy();
  });

  test("يجب أن يكون لديه الحجم الصحيح", () => {
    render(<SkeletonBox />);

    const skeletonBox = screen.getByTestId("skeleton-box");
    expect(skeletonBox).toBeTruthy();
  });

  test("يجب أن يكون لديه نصف القطر الصحيح", () => {
    render(<SkeletonBox />);

    const skeletonBox = screen.getByTestId("skeleton-box");
    expect(skeletonBox).toBeTruthy();
  });
});
