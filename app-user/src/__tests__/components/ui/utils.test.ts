// __tests__/components/ui/utils.test.ts
import { cn } from "../../../components/ui/utils";

describe("cn utility function", () => {
  test("يتم دمج الفئات الصحيحة", () => {
    const result = cn("class1", "class2", "class3");
    expect(result).toBe("class1 class2 class3");
  });

  test("يتم تصفية القيم الفارغة", () => {
    const result = cn("class1", "", "class2", null, "class3", undefined);
    expect(result).toBe("class1 class2 class3");
  });

  test("يتم تصفية القيم false", () => {
    const result = cn("class1", false, "class2", true && "class3");
    expect(result).toBe("class1 class2 class3");
  });

  test("يعمل مع مصفوفة فارغة", () => {
    const result = cn();
    expect(result).toBe("");
  });

  test("يعمل مع قيم null وundefined فقط", () => {
    const result = cn(null, undefined, false, "");
    expect(result).toBe("");
  });

  test("يعمل مع فئة واحدة", () => {
    const result = cn("single-class");
    expect(result).toBe("single-class");
  });

  test("يتم تصفية المسافات الفارغة", () => {
    const result = cn("  ", "class1", "   ", "class2");
    expect(result).toBe("   class1     class2");
  });

  test("يعمل مع الشروط المنطقية", () => {
    const condition1 = true;
    const condition2 = false;
    const result = cn(
      "base-class",
      condition1 && "conditional-class1",
      condition2 && "conditional-class2",
      "final-class"
    );
    expect(result).toBe("base-class conditional-class1 final-class");
  });

  test("يتعامل مع القيم المختلطة", () => {
    const result = cn(
      "class1",
      true && "class2",
      false && "hidden",
      null,
      undefined,
      "",
      "class3"
    );
    expect(result).toBe("class1 class2 class3");
  });

  test("يحافظ على ترتيب الفئات", () => {
    const result = cn("z-class", "a-class", "m-class");
    expect(result).toBe("z-class a-class m-class");
  });

  test("يتعامل مع الأرقام كfalsyValues", () => {
    const result = cn("class1", "class2", 1 && "class3");
    expect(result).toBe("class1 class2 class3");
  });

  test("يعمل مع تراكيب معقدة", () => {
    const size = "large";
    const variant = "primary";
    const disabled = false;

    const result = cn(
      "btn",
      size === "large" && "btn-lg",
      variant === "primary" && "btn-primary",
      disabled && "btn-disabled",
      "btn-interactive"
    );

    expect(result).toBe("btn btn-lg btn-primary btn-interactive");
  });

  test("يتعامل مع strings طويلة", () => {
    const longClassName =
      "very-long-class-name-that-might-be-used-in-complex-components";
    const result = cn("short", longClassName, "another");
    expect(result).toBe(`short ${longClassName} another`);
  });

  test("يتعامل مع characters خاصة في أسماء الفئات", () => {
    const result = cn(
      "class-with-dashes",
      "class_with_underscores",
      "class:with:colons"
    );
    expect(result).toBe(
      "class-with-dashes class_with_underscores class:with:colons"
    );
  });
});
