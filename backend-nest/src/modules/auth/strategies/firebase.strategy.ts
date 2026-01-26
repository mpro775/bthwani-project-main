import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import * as admin from 'firebase-admin';

interface FirebaseUser {
  id: string;
  uid: string;
  email?: string;
  authType: string;
}

@Injectable()
export class FirebaseStrategy extends PassportStrategy(Strategy, 'firebase') {
  async validate(request: Request): Promise<FirebaseUser> {
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException({
        code: 'TOKEN_MISSING',
        message: 'Firebase token is missing',
        userMessage: 'يجب تسجيل الدخول أولاً',
        suggestedAction: 'يرجى تسجيل الدخول مرة أخرى',
      });
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(token, true);

      return {
        id: decodedToken.uid,
        uid: decodedToken.uid,
        email: decodedToken.email,
        authType: 'firebase',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new UnauthorizedException({
        code: 'INVALID_FIREBASE_TOKEN',
        message: errorMessage,
        userMessage: 'رمز Firebase غير صالح أو منتهي الصلاحية',
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
}
