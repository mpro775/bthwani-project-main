export type AuthBannerType = "login" | "verify";
export type AuthBannerController = {
  show: (type: AuthBannerType) => void;
  hide: () => void;
};

let controller: AuthBannerController | null = null;

export function setAuthBannerController(c: AuthBannerController | null) {
  controller = c;
}

export function getAuthBanner(): AuthBannerController | null {
  return controller;
}
