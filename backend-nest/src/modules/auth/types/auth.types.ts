export interface AuthResponse {
  user: {
    id?: string;
    fullName?: string;
    aliasName?: string;
    email?: string;
    phone?: string;
    profileImage?: string;
    emailVerified?: boolean;
    classification?: string;
    role?: string;
    addresses?: unknown[];
    defaultAddressId?: unknown;
    language?: string;
    theme?: string;
    wallet?: unknown;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  };
  token: {
    accessToken: string;
    tokenType: string;
    expiresIn: string;
  };
}

export interface VerifyOtpResponse extends AuthResponse {
  verified: boolean;
}
