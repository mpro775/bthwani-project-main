import axiosInstance from "./axios-instance";
import type { User } from "../types";

interface OnboardingData {
  steps: Array<{
    id: string;
    title: string;
    description: string;
    image?: string;
    completed: boolean;
  }>;
  completedSteps: string[];
}

interface BootstrapData {
  appConfig: {
    name: string;
    version: string;
    maintenance: boolean;
    features: {
      delivery: boolean;
      utility: boolean;
      marketplace: boolean;
    };
  };
  userPreferences?: {
    language: string;
    currency: string;
    notifications: boolean;
  };
}

interface PageData {
  id: string;
  slug: string;
  title: string;
  content: string;
  meta?: {
    description?: string;
    keywords?: string;
    image?: string;
  };
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

// Fetch onboarding data for new users
export const fetchOnboarding = async (): Promise<OnboardingData> => {
  const response = await axiosInstance.get<OnboardingData>("/cms/onboarding");
  return response.data;
};

// Mark onboarding step as completed
export const completeOnboardingStep = async (
  stepId: string
): Promise<OnboardingData> => {
  const response = await axiosInstance.patch<OnboardingData>(
    "/cms/onboarding/step",
    { stepId }
  );
  return response.data;
};

// Fetch bootstrap data (app configuration)
export const fetchBootstrap = async (): Promise<BootstrapData> => {
  const response = await axiosInstance.get<BootstrapData>("/cms/bootstrap");
  return response.data;
};

// Update user preferences
export const updateUserPreferences = async (preferences: {
  language?: string;
  currency?: string;
  notifications?: boolean;
}): Promise<User> => {
  const response = await axiosInstance.patch<User>(
    "/cms/preferences",
    preferences
  );
  return response.data;
};

// Fetch CMS pages (terms, privacy, about, etc.)
export const fetchPages = async (): Promise<PageData[]> => {
  const response = await axiosInstance.get<PageData[]>("/cms/pages");
  return response.data;
};

// Fetch specific page by slug
export const fetchPageBySlug = async (slug: string): Promise<PageData> => {
  const response = await axiosInstance.get<PageData>(`/cms/pages/${slug}`);
  return response.data;
};

export default {
  fetchOnboarding,
  completeOnboardingStep,
  fetchBootstrap,
  updateUserPreferences,
  fetchPages,
  fetchPageBySlug,
};
