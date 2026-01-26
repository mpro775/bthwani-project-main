import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

interface RequestUser {
  _id?: string;
  id?: string;
  role?: string;
  uid?: string;
  email?: string;
  authType?: string;
  vendorId?: string;
  marketerId?: string;
}

declare module 'express' {
  interface Request {
    user?: RequestUser;
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException({
        code: 'USER_NOT_FOUND',
        message: 'User not found in request',
        userMessage: 'خطأ في التحقق من الهوية',
        suggestedAction: 'يرجى تسجيل الدخول مرة أخرى',
      });
    }

    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException({
        code: 'INSUFFICIENT_PERMISSIONS',
        message: `User role ${user.role} is not authorized`,
        userMessage: 'ليس لديك صلاحية للوصول إلى هذه الصفحة',
        suggestedAction:
          'يرجى التواصل مع الإدارة للحصول على الصلاحيات المطلوبة',
      });
    }

    return true;
  }
}
