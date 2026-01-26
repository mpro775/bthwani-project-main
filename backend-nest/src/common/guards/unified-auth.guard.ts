interface JWTPayload {
  sub: string;
  email?: string;
  role?: string;
}

interface VendorJWTPayload {
  vendorId: string;
}

interface MarketerJWTPayload {
  marketerId: string;
}

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as admin from 'firebase-admin';

export enum AuthType {
  FIREBASE = 'firebase',
  JWT = 'jwt',
  VENDOR_JWT = 'vendor_jwt',
  MARKETER_JWT = 'marketer_jwt',
  PUBLIC = 'public',
}

@Injectable()
export class UnifiedAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is public
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );
    if (isPublic) return true;

    // Get auth type from decorator
    const authType =
      this.reflector.get<AuthType>('authType', context.getHandler()) ||
      AuthType.JWT;

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException({
        code: 'TOKEN_MISSING',
        message: 'Authentication token is missing',
        userMessage: 'يجب تسجيل الدخول أولاً',
        suggestedAction: 'يرجى تسجيل الدخول مرة أخرى',
      });
    }

    try {
      switch (authType) {
        case AuthType.FIREBASE:
          request.user = await this.validateFirebaseToken(token);
          break;
        case AuthType.JWT:
          request.user = await this.validateJWT(token);
          break;
        case AuthType.VENDOR_JWT:
          request.user = await this.validateVendorJWT(token);
          break;
        case AuthType.MARKETER_JWT:
          request.user = await this.validateMarketerJWT(token);
          break;
        default:
          throw new UnauthorizedException('Invalid auth type');
      }
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new UnauthorizedException({
        code: 'INVALID_TOKEN',
        message: errorMessage,
        userMessage: 'رمز الدخول غير صالح أو منتهي الصلاحية',
        suggestedAction: 'يرجى تسجيل الدخول مرة أخرى',
      });
    }
  }

  private extractToken(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) return null;
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    return token.replace(/^["'](.*)["']$/, '$1');
  }

  private async validateFirebaseToken(token: string) {
    const decodedToken = await admin.auth().verifyIdToken(token, true);
    return {
      id: decodedToken.uid,
      uid: decodedToken.uid,
      email: decodedToken.email,
      authType: 'firebase',
    };
  }

  private async validateJWT(token: string) {
    const secret = this.configService.get<string>('jwt.secret');
    const payload = await this.jwtService.verifyAsync<JWTPayload>(token, {
      secret,
    });
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      authType: 'jwt',
    };
  }

  private async validateVendorJWT(token: string) {
    const secret = this.configService.get<string>('jwt.vendorSecret');
    const payload = await this.jwtService.verifyAsync<VendorJWTPayload>(token, {
      secret,
    });
    return {
      id: payload.vendorId,
      vendorId: payload.vendorId,
      role: 'vendor',
      authType: 'vendor_jwt',
    };
  }

  private async validateMarketerJWT(token: string) {
    const secret = this.configService.get<string>('jwt.marketerSecret');
    const payload = await this.jwtService.verifyAsync<MarketerJWTPayload>(
      token,
      { secret },
    );
    return {
      id: payload.marketerId,
      marketerId: payload.marketerId,
      role: 'marketer',
      authType: 'marketer_jwt',
    };
  }
}
