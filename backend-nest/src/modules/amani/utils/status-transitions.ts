import { AmaniStatus } from '../entities/amani.entity';
import { BadRequestException } from '@nestjs/common';

/**
 * State Machine للحالات المسموحة في نظام أماني
 * 
 * التدفق المسموح:
 * draft → pending → confirmed → in_progress → completed
 *                    ↓
 *                 cancelled (في أي وقت قبل completed)
 */

const VALID_TRANSITIONS: Record<AmaniStatus, AmaniStatus[]> = {
  [AmaniStatus.DRAFT]: [AmaniStatus.PENDING, AmaniStatus.CANCELLED],
  [AmaniStatus.PENDING]: [AmaniStatus.CONFIRMED, AmaniStatus.CANCELLED],
  [AmaniStatus.CONFIRMED]: [AmaniStatus.IN_PROGRESS, AmaniStatus.CANCELLED],
  [AmaniStatus.IN_PROGRESS]: [AmaniStatus.COMPLETED, AmaniStatus.CANCELLED],
  [AmaniStatus.COMPLETED]: [], // لا يمكن الانتقال من completed
  [AmaniStatus.CANCELLED]: [], // لا يمكن الانتقال من cancelled
};

/**
 * التحقق من صحة انتقال الحالة
 * @param currentStatus الحالة الحالية
 * @param newStatus الحالة الجديدة
 * @throws BadRequestException إذا كان الانتقال غير مسموح
 */
export function validateStatusTransition(
  currentStatus: AmaniStatus,
  newStatus: AmaniStatus,
): void {
  // السماح بالانتقال لنفس الحالة (idempotent)
  if (currentStatus === newStatus) {
    return;
  }

  const allowedTransitions = VALID_TRANSITIONS[currentStatus];

  if (!allowedTransitions.includes(newStatus)) {
    throw new BadRequestException(
      `لا يمكن الانتقال من الحالة "${currentStatus}" إلى "${newStatus}". الحالات المسموحة: ${allowedTransitions.join(', ')}`,
    );
  }
}

/**
 * الحصول على الحالات المسموحة من حالة معينة
 * @param currentStatus الحالة الحالية
 * @returns قائمة بالحالات المسموحة
 */
export function getAllowedTransitions(
  currentStatus: AmaniStatus,
): AmaniStatus[] {
  return VALID_TRANSITIONS[currentStatus];
}

/**
 * التحقق من إمكانية الإلغاء
 * @param status الحالة الحالية
 * @returns true إذا كان يمكن الإلغاء
 */
export function canCancel(status: AmaniStatus): boolean {
  return status !== AmaniStatus.COMPLETED && status !== AmaniStatus.CANCELLED;
}

/**
 * التحقق من إمكانية التعديل
 * @param status الحالة الحالية
 * @returns true إذا كان يمكن التعديل
 */
export function canEdit(status: AmaniStatus): boolean {
  return status === AmaniStatus.DRAFT || status === AmaniStatus.PENDING;
}
