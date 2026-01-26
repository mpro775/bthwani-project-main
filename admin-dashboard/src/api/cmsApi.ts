import axiosInstance from "../utils/axios";

export type Lang = "ar" | "en";

export type OnboardingSlide = {
  _id?: string;
  key: string;
  title?: { ar?: string; en?: string };
  subtitle?: { ar?: string; en?: string };
  media?: { type: "lottie" | "image"; url: string };
  cta?: { label?: { ar?: string; en?: string }; action?: string };
  order?: number;
  active?: boolean;
};

export type CmsPage = {
  _id?: string;
  slug: string;
  title: { ar?: string; en?: string };
  content: { ar?: string; en?: string };
  isPublic: boolean;
};

export type CmsString = {
  _id?: string;
  key: string;
  ar?: string;
  en?: string;
  group?: string;
};

export type HomeLayout = {
  _id?: string;
  sections: { key: string; enabled: boolean; limit?: number; title?: { ar?: string; en?: string } }[];
  channel?: "app" | "web";
  city?: string;
  order?: number;
  active?: boolean;
  validFrom?: string | null;
  validTo?: string | null;
};

// ---- Onboarding Slides
export async function listSlides() {
  const { data } = await axiosInstance.get<OnboardingSlide[]>("/admin/onboarding-slides", { headers: { "x-silent-401": "1" } });
  return data;
}
export async function upsertSlide(v: OnboardingSlide) {
  if (v._id) return (await axiosInstance.put(`/admin/onboarding-slides/${v._id}`, v)).data;
  return (await axiosInstance.post(`/admin/onboarding-slides`, v)).data;
}
export async function deleteSlide(id: string) {
  return (await axiosInstance.delete(`/admin/onboarding-slides/${id}`)).data;
}
export async function createSlide(body: OnboardingSlide) {
  return (await axiosInstance.post("/admin/onboarding-slides", body)).data;
}

// ---- CMS Pages
export async function listPages() {
  const { data } = await axiosInstance.get<CmsPage[]>("/admin/pages", { headers: { "x-silent-401": "1" } });
  return data;
}
export async function upsertPage(v: CmsPage) {
  if (v._id) return (await axiosInstance.put(`/admin/pages/${v._id}`, v)).data;
  return (await axiosInstance.post(`/admin/pages`, v)).data;
}
export async function deletePage(id: string) {
  return (await axiosInstance.delete(`/admin/pages/${id}`)).data;
}
export async function createPage(body: CmsPage) {
  return (await axiosInstance.post("/admin/pages", body)).data;
}

// ---- Strings
export async function listStrings(q?: string) {
  const { data } = await axiosInstance.get<CmsString[]>(`/admin/strings${q ? `?q=${encodeURIComponent(q)}` : ""}`, { headers: { "x-silent-401": "1" } });
  return data;
}
export async function upsertString(v: CmsString) {
  if (v._id) return (await axiosInstance.put(`/admin/strings/${v._id}`, v)).data;
  return (await axiosInstance.post(`/admin/strings`, v)).data;
}
export async function deleteString(id: string) {
  return (await axiosInstance.delete(`/admin/strings/${id}`)).data;
}

// ---- Home Layout
export async function listHomeLayouts() {
  const { data } = await axiosInstance.get<HomeLayout[]>(`/admin/home-layouts`, { headers: { "x-silent-401": "1" } });
  return data;
}
export async function upsertHomeLayout(v: HomeLayout) {
  if (v._id) return (await axiosInstance.put(`/admin/home-layouts/${v._id}`, v)).data;
  return (await axiosInstance.post(`/admin/home-layouts`, v)).data;
}
export async function deleteHomeLayout(id: string) {
  return (await axiosInstance.delete(`/admin/home-layouts/${id}`)).data;
}