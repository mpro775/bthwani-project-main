/**
 * Legal System Types
 */

export interface PrivacyPolicy {
  id: string;
  version: string;
  content: {
    ar: string;
    en: string;
  };
  effectiveDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface TermsOfService {
  id: string;
  version: string;
  content: {
    ar: string;
    en: string;
  };
  effectiveDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface UserConsent {
  id: string;
  userId: string;
  type: 'privacy_policy' | 'terms_of_service';
  documentId: string;
  version: string;
  consentGiven: boolean;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export interface ConsentStatistics {
  totalUsers: number;
  privacyPolicyConsents: number;
  termsOfServiceConsents: number;
  pendingConsents: number;
  consentRate: number;
}

export interface CreatePrivacyPolicyDto {
  version: string;
  content: {
    ar: string;
    en: string;
  };
  effectiveDate: string;
}

export interface CreateTermsOfServiceDto {
  version: string;
  content: {
    ar: string;
    en: string;
  };
  effectiveDate: string;
}

export interface RecordConsentDto {
  type: 'privacy_policy' | 'terms_of_service';
  consentGiven: boolean;
  ipAddress?: string;
  userAgent?: string;
}

export interface LegalResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

