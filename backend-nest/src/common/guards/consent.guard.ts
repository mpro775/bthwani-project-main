import { Injectable, CanActivate, ExecutionContext, ForbiddenException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConsentService } from '../../modules/auth/services/consent.service';
import { ConsentType } from '../../modules/auth/dto/consent.dto';

// Decorator لتحديد الموافقات المطلوبة
export const REQUIRED_CONSENTS_KEY = 'requiredConsents';
export const RequireConsents = (...consents: ConsentType[]) =>
  SetMetadata(REQUIRED_CONSENTS_KEY, consents);

/**
 * Guard للتحقق من موافقات المستخدم
 * يمكن استخدامه مع @RequireConsents decorator
 * 
 * مثال:
 * @RequireConsents(ConsentType.PRIVACY_POLICY, ConsentType.TERMS_OF_SERVICE)
 * @UseGuards(ConsentGuard)
 * async someMethod() {}
 */
@Injectable()
export class ConsentGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly consentService: ConsentService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // الحصول على الموافقات المطلوبة من decorator
    const requiredConsents = this.reflector.getAllAndOverride<ConsentType[]>(
      REQUIRED_CONSENTS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // إذا لم يتم تحديد موافقات، السماح بالوصول
    if (!requiredConsents || requiredConsents.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // التحقق من وجود معلومات المستخدم
    if (!user || !user.id) {
      throw new ForbiddenException('يجب تسجيل الدخول للمتابعة');
    }

    // التحقق من جميع الموافقات المطلوبة
    const missingConsents: ConsentType[] = [];

    for (const consentType of requiredConsents) {
      const hasConsent = await this.consentService.checkConsent(user.id, consentType);
      
      if (!hasConsent) {
        missingConsents.push(consentType);
      }
    }

    // إذا كانت هناك موافقات ناقصة
    if (missingConsents.length > 0) {
      throw new ForbiddenException({
        message: 'يجب الموافقة على الشروط المطلوبة للمتابعة',
        missingConsents,
        code: 'MISSING_CONSENTS',
      });
    }

    return true;
  }
}

/**
 * Guard مبسّط للتحقق من موافقة واحدة فقط
 */
@Injectable()
export class PrivacyPolicyConsentGuard implements CanActivate {
  constructor(private readonly consentService: ConsentService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new ForbiddenException('يجب تسجيل الدخول للمتابعة');
    }

    const hasConsent = await this.consentService.checkConsent(
      user.id,
      ConsentType.PRIVACY_POLICY,
    );

    if (!hasConsent) {
      throw new ForbiddenException({
        message: 'يجب الموافقة على سياسة الخصوصية للمتابعة',
        missingConsents: [ConsentType.PRIVACY_POLICY],
        code: 'MISSING_PRIVACY_POLICY_CONSENT',
      });
    }

    return true;
  }
}

/**
 * Guard للتحقق من موافقة شروط الخدمة
 */
@Injectable()
export class TermsOfServiceConsentGuard implements CanActivate {
  constructor(private readonly consentService: ConsentService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new ForbiddenException('يجب تسجيل الدخول للمتابعة');
    }

    const hasConsent = await this.consentService.checkConsent(
      user.id,
      ConsentType.TERMS_OF_SERVICE,
    );

    if (!hasConsent) {
      throw new ForbiddenException({
        message: 'يجب الموافقة على شروط الخدمة للمتابعة',
        missingConsents: [ConsentType.TERMS_OF_SERVICE],
        code: 'MISSING_TERMS_OF_SERVICE_CONSENT',
      });
    }

    return true;
  }
}

