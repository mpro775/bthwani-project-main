// state/intent.ts
type Intent = null | (() => Promise<any> | any);

let pending: Intent = null;

export const IntentManager = {
  set(fn: Intent) {
    pending = fn;
  },
  async runIfAny() {
    const fn = pending;
    pending = null;
    if (fn)
      try {
        await fn();
      } catch {
        /* silent */
      }
  },
  has() {
    return !!pending;
  },
};
