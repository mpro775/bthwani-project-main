/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/**
 * Helper class لإزالة الحقول الحساسة من الـ entities
 * يوحد منطق الـ sanitization عبر المشروع
 */
export class SanitizationHelper {
  /**
   * الحقول الحساسة الافتراضية التي يجب إزالتها
   */
  private static readonly DEFAULT_SENSITIVE_FIELDS = [
    'password',
    'pinCodeHash',
    'refreshToken',
    'resetPasswordToken',
    'emailVerificationToken',
  ];

  /**
   * إزالة حقول حساسة من entity
   *
   * @example
   * ```typescript
   * const sanitized = SanitizationHelper.sanitize<User>(user);
   * // أو مع حقول مخصصة
   * const sanitized = SanitizationHelper.sanitize<Driver>(
   *   driver,
   *   ['password', 'bankAccount']
   * );
   * ```
   */
  static sanitize<T>(
    entity: any,
    fieldsToRemove: string[] = this.DEFAULT_SENSITIVE_FIELDS,
  ): T {
    if (!entity) {
      return entity;
    }

    // تحويل إلى plain object
    const obj = entity.toObject ? entity.toObject() : { ...entity };

    // إزالة الحقول الحساسة
    fieldsToRemove.forEach((field) => {
      this.deleteNestedField(obj, field);
    });

    return obj as T;
  }

  /**
   * إزالة حقول من مصفوفة entities
   */
  static sanitizeMany<T>(entities: any[], fieldsToRemove?: string[]): T[] {
    if (!entities || !Array.isArray(entities)) {
      return [];
    }

    return entities.map((entity) => this.sanitize<T>(entity, fieldsToRemove));
  }

  /**
   * إزالة حقول متداخلة من object
   */
  static sanitizeNested<T>(
    entity: any,
    nestedPath: string,
    fieldsToRemove?: string[],
  ): T {
    const obj: any = this.sanitize(entity, fieldsToRemove);

    const parts = nestedPath.split('.');
    let current: any = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]];
      if (!current) return obj as T;
    }

    const lastPart = parts[parts.length - 1];
    if (current[lastPart]) {
      if (Array.isArray(current[lastPart])) {
        current[lastPart] = this.sanitizeMany(
          current[lastPart],
          fieldsToRemove,
        );
      } else {
        current[lastPart] = this.sanitize(current[lastPart], fieldsToRemove);
      }
    }

    return obj as T;
  }

  /**
   * إزالة حقل متداخل (مثل security.pinCodeHash)
   */
  private static deleteNestedField(obj: any, fieldPath: string): void {
    const parts = fieldPath.split('.');

    if (parts.length === 1) {
      delete obj[fieldPath];
      return;
    }

    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) return;
      current = current[parts[i]];
    }

    delete current[parts[parts.length - 1]];
  }

  /**
   * إزالة جميع الحقول null/undefined
   */
  static removeNullFields<T>(obj: any): T {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const cleaned: any = Array.isArray(obj) ? [] : {};

    Object.keys(obj).forEach((key) => {
      const value = obj[key];

      if (value === null || value === undefined) {
        return; // تخطي
      }

      if (typeof value === 'object') {
        cleaned[key] = this.removeNullFields(value);
      } else {
        cleaned[key] = value;
      }
    });

    return cleaned as T;
  }
}
