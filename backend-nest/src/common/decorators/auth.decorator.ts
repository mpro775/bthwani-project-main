import {
  SetMetadata,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { AuthType } from '../guards/unified-auth.guard';
import { User } from '../../modules/auth/entities/user.entity';

// Auth Type Decorator - يدعم نوع واحد أو عدة أنواع
export const Auth = (...types: AuthType[]) => {
  if (types.length === 0) {
    types = [AuthType.JWT];
  }
  return SetMetadata('authType', types.length === 1 ? types[0] : types);
};

// Public Route Decorator
export const Public = () => SetMetadata('isPublic', true);

// Roles Decorator
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// Current User Decorator
export const CurrentUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext): unknown => {
    const request = ctx.switchToHttp().getRequest<{ user?: User }>();
    const user = request.user;
    if (!user) return undefined;
    return data ? user[data] : user;
  },
);

// Current Driver Decorator - يستخرج driverId من التوكن (للمسارات المحمية بـ @Roles('driver'))
export const CurrentDriver = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: { id?: string; driverId?: string; role?: string } }>();
    const user = request.user;
    if (!user) return undefined;
    return (user as any).driverId ?? (user.role === 'driver' ? user.id : undefined);
  },
);
