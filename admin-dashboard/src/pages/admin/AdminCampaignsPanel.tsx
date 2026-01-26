import  { useEffect, useState, useCallback } from "react";
import axios from "../../utils/axios";
import { auth } from "../../config/firebaseConfig";





// Types --------------------------------------------------------------
interface CampaignMessage {
  title: string;
  body: string;
  data?: Record<string, string>;
  channelId?: string; // android channel ("orders" | "promos")
  collapseId?: string;
}

interface Audience {
  apps?: ("user" | "driver" | "vendor")[];
  platforms?: ("android" | "ios" | "web")[];
  cities?: string[];
  minOrders?: number; // users only
  lastActiveDays?: number;
  optedInPromosOnly?: boolean; // users only
}

interface ScheduleCfg {
  type: "now" | "cron" | "datetime";
  when?: string | Date | null;
  cron?: string | null;
}

interface Campaign {
  _id?: string;
  title: string;
  message: CampaignMessage;
  audience: Audience;
  schedule: ScheduleCfg;
  status?:
    | "draft"
    | "scheduled"
    | "running"
    | "completed"
    | "cancelled"
    | "failed";
  stats?: {
    queued: number;
    sent: number;
    delivered: number;
    failed: number;
    uniqueUsers: number;
  };
  createdAt?: string;
}

function clsx(...xs: (string | false | undefined)[]) {
    return xs.filter(Boolean).join(" ");
  }
// Main component -----------------------------------------------------
export default function AdminCampaignsPanel() {
  const [items, setItems] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = auth.currentUser;
  const token = user?.getIdToken(true);

  const [creating, setCreating] = useState<boolean>(false);
  const [form, setForm] = useState<Campaign>({
    title: "حملة جديدة",
    message: {
      title: "عنوان الإشعار",
      body: "نص الإشعار",
      channelId: "promos",
      collapseId: "promo:general",
    },
    audience: {
      apps: ["user"],
      platforms: ["android", "ios"],
      lastActiveDays: 30,
      optedInPromosOnly: false,
    },
    schedule: { type: "now" },
  });
  const [audPreview, setAudPreview] = useState<{
    count: number;
    sample: string[];
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await axios.get<Campaign[]>("/admin/notifications/campaigns", {
        headers: { Authorization: `Bearer ${token}` },
      } );
      setItems(data.data);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  

  // Handlers ---------------------------------------------------------
  function update<K extends keyof Campaign>(k: K, v: Campaign[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  function updateMsg<K extends keyof CampaignMessage>(
    k: K,
    v: CampaignMessage[K]
  ) {
    setForm((f) => ({ ...f, message: { ...f.message, [k]: v } }));
  }
  function updateAud<K extends keyof Audience>(k: K, v: Audience[K]) {
    setForm((f) => ({ ...f, audience: { ...f.audience, [k]: v } }));
  }

  async function onCreate() {
    setSubmitting(true);
    try {
      const created = await axios.post<Campaign>("/admin/notifications/campaigns", {
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      setCreating(false);
      setForm({ ...form, _id: created.data._id });
      await load();
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert(e.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function onPreviewAudience() {
    if (!form._id) {
      // أنشئ مسودة أولاً
      await onCreate();
      if (!form._id) return;
    }
    try {
      const p = await axios.post<{ count: number; sample: string[] }>(
        `/admin/notifications/campaigns/${form._id}/audience-preview`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAudPreview(p.data);
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert(e.message);
      }
    }
  }

  async function onSend() {
    if (!form._id) {
      await onCreate();
      if (!form._id) return;
    }
    setSubmitting(true);
    try {
      await axios.post(`/admin/notifications/campaigns/${form._id}/send`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await load();
      alert("تمت جدولة/إرسال الحملة بنجاح ✅");
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert(e.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  // UI ---------------------------------------------------------------
  return (
    <div className="mx-auto max-w-7xl p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">حملات الإشعارات</h1>
        <button
          onClick={() => {
            setCreating(true);
            setForm({
              title: "حملة جديدة",
              message: {
                title: "عنوان الإشعار",
                body: "نص الإشعار",
                channelId: "promos",
                collapseId: "promo:general",
              },
              audience: {
                apps: ["user"],
                platforms: ["android", "ios"],
                lastActiveDays: 30,
              },
              schedule: { type: "now" },
            });
            setAudPreview(null);
          }}
          className="rounded-xl bg-black px-4 py-2 text-white shadow"
        >
          حملة جديدة
        </button>
      </header>

      {/* List */}
      <section className="rounded-2xl border p-4">
        {loading ? (
          <p>تحميل…</p>
        ) : error ? (
          <p className="text-red-600">خطأ: {error}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-2">العنوان</th>
                <th className="p-2">الحالة</th>
                <th className="p-2">الجدولة</th>
                <th className="p-2">إحصاءات</th>
                <th className="p-2">تاريخ</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c._id} className="border-t">
                  <td className="p-2">
                    <div className="font-medium">{c.title}</div>
                    <div className="text-gray-500">
                      {c.message?.title} — {c.message?.body?.slice(0, 60)}
                    </div>
                  </td>
                  <td className="p-2">
                    <span
                      className={clsx(
                        "rounded-full px-2 py-1 text-xs",
                        c.status === "completed" &&
                          "bg-green-100 text-green-700",
                        c.status === "scheduled" &&
                          "bg-yellow-100 text-yellow-700",
                        c.status === "running" && "bg-blue-100 text-blue-700",
                        c.status === "failed" && "bg-red-100 text-red-700"
                      )}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="p-2">
                    {c.schedule?.type === "now"
                      ? "فوري"
                      : c.schedule?.type === "datetime"
                      ? `وقت: ${new Date(
                          c.schedule.when || ""
                        ).toLocaleString()}`
                      : `كرون: ${c.schedule.cron}`}
                  </td>
                  <td className="p-2">
                    <div>مستهدَفون: {c.stats?.queued ?? 0}</div>
                    <div>
                      مُرسَل: {c.stats?.sent ?? 0}، فشل: {c.stats?.failed ?? 0}
                    </div>
                  </td>
                  <td className="p-2 text-gray-500">
                    {c.createdAt ? new Date(c.createdAt).toLocaleString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Drawer / Modal — Create/Edit */}
      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">إنشاء/تعديل حملة</h2>
              <button
                onClick={() => setCreating(false)}
                className="rounded-lg border px-3 py-1"
              >
                إغلاق
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <label className="block">
                  <span className="mb-1 block text-sm">اسم داخلي للحملة</span>
                  <input
                    value={form.title}
                    onChange={(e) => update("title", e.target.value)}
                    className="w-full rounded-xl border px-3 py-2"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm">عنوان الإشعار</span>
                  <input
                    value={form.message.title}
                    onChange={(e) => updateMsg("title", e.target.value)}
                    className="w-full rounded-xl border px-3 py-2"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm">نص الإشعار</span>
                  <textarea
                    value={form.message.body}
                    onChange={(e) => updateMsg("body", e.target.value)}
                    className="w-full rounded-xl border px-3 py-2"
                    rows={4}
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-1 block text-sm">Android Channel</span>
                    <select
                      value={form.message.channelId || "promos"}
                      onChange={(e) => updateMsg("channelId", e.target.value)}
                      className="w-full rounded-xl border px-3 py-2"
                    >
                      <option value="promos">promos</option>
                      <option value="orders">orders</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm">
                      Collapse ID (اختياري)
                    </span>
                    <input
                      value={form.message.collapseId || ""}
                      onChange={(e) => updateMsg("collapseId", e.target.value)}
                      className="w-full rounded-xl border px-3 py-2"
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="mb-1 block text-sm">
                    Data (JSON اختياري)
                  </span>
                  <textarea
                    value={JSON.stringify(form.message.data ?? {}, null, 2)}
                    onChange={(e) => {
                      try {
                        updateMsg("data", JSON.parse(e.target.value || "{}"));
                      } catch {
                        /* ignore */
                      }
                    }}
                    className="font-mono w-full rounded-xl border px-3 py-2"
                    rows={6}
                  />
                </label>
              </div>

              {/* Audience + Schedule */}
              <div className="space-y-4">
                <fieldset className="rounded-xl border p-3">
                  <legend className="px-2 text-sm">الجمهور</legend>
                  <div className="mb-2 text-xs text-gray-500">
                    اختر التطبيقات/المنصات والفلاتر
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.audience.apps?.includes("user") || false}
                        onChange={(e) => {
                          const v = new Set(form.audience.apps || []);
                          if (e.target.checked) {
                            v.add("user");
                          } else {
                            v.delete("user");
                          }
                          updateAud("apps", Array.from(v) as ("user"|"driver"|"vendor")[]);
                        }}
                      />{" "}
                      المستخدمون
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={
                          form.audience.apps?.includes("driver") || false
                        }
                        onChange={(e) => {
                          const v = new Set(form.audience.apps || []);
                          if (e.target.checked) {
                            v.add("driver");
                          } else {
                            v.delete("driver");
                          }
                          updateAud("apps", Array.from(v) as ("user"|"driver"|"vendor")[]);
                        }}
                      />{" "}
                      السائقون
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={
                          form.audience.apps?.includes("vendor") || false
                        }
                        onChange={(e) => {
                          const v = new Set(form.audience.apps || []);
                          if (e.target.checked) {
                            v.add("vendor");
                          } else {
                            v.delete("vendor");
                          }
                          updateAud("apps", Array.from(v) as ("user"|"driver"|"vendor")[]);
                        }}
                      />{" "}
                      التجار
                    </label>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {(["android", "ios", "web"] as const).map((p) => (
                      <label key={p} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={
                            form.audience.platforms?.includes(p) || false
                          }
                          onChange={(e) => {
                            const v = new Set(form.audience.platforms || []);
                            if (e.target.checked) {
                              v.add(p);
                            } else {
                              v.delete(p);
                            }
                            updateAud("platforms", Array.from(v) as ("android"|"ios"|"web")[]);
                          }}
                        />{" "}
                        {p}
                      </label>
                    ))}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <label className="block">
                      <span className="mb-1 block text-sm">
                        المدن (افصل بينها بفاصلة)
                      </span>
                      <input
                        value={(form.audience.cities || []).join(",")}
                        onChange={(e) =>
                          updateAud(
                            "cities",
                            e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean)
                          )
                        }
                        className="w-full rounded-xl border px-3 py-2"
                        placeholder="Sana'a,Aden"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-sm">
                        نشط خلال (أيام)
                      </span>
                      <input
                        type="number"
                        value={form.audience.lastActiveDays || 0}
                        onChange={(e) =>
                          updateAud("lastActiveDays", +e.target.value)
                        }
                        className="w-full rounded-xl border px-3 py-2"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-sm">
                        حد أدنى للطلبات (للمستخدمين)
                      </span>
                      <input
                        type="number"
                        value={form.audience.minOrders || 0}
                        onChange={(e) =>
                          updateAud("minOrders", +e.target.value)
                        }
                        className="w-full rounded-xl border px-3 py-2"
                      />
                    </label>
                    <label className="mt-6 flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={!!form.audience.optedInPromosOnly}
                        onChange={(e) =>
                          updateAud("optedInPromosOnly", e.target.checked)
                        }
                      />{" "}
                      أرسل فقط لمن فعَّل العروض
                    </label>
                  </div>
                </fieldset>

                <fieldset className="rounded-xl border p-3">
                  <legend className="px-2 text-sm">الجدولة</legend>
                  <div className="grid grid-cols-3 gap-2">
                    {(["now", "datetime", "cron"] as const).map((t) => (
                      <label key={t} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="sch"
                          checked={form.schedule.type === t}
                          onChange={() =>
                            update("schedule", { ...form.schedule, type: t })
                          }
                        />{" "}
                        {t}
                      </label>
                    ))}
                  </div>
                  {form.schedule.type === "datetime" && (
                    <div className="mt-2">
                      <input
                        type="datetime-local"
                        onChange={(e) =>
                          update("schedule", {
                            ...form.schedule,
                            when: e.target.value,
                          })
                        }
                        className="rounded-xl border px-3 py-2"
                      />
                    </div>
                  )}
                  {form.schedule.type === "cron" && (
                    <div className="mt-2">
                      <input
                        placeholder="0 10 * * *"
                        onChange={(e) =>
                          update("schedule", {
                            ...form.schedule,
                            cron: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border px-3 py-2"
                      />
                      <div className="mt-1 text-xs text-gray-500">
                        صيغة كرون (UTC)
                      </div>
                    </div>
                  )}
                </fieldset>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={onCreate}
                    disabled={submitting}
                    className="rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50"
                  >
                    حفظ كمسودة
                  </button>
                  <button
                    onClick={onPreviewAudience}
                    className="rounded-xl border px-4 py-2"
                  >
                    معاينة الجمهور
                  </button>
                  <button
                    onClick={onSend}
                    disabled={submitting}
                    className="rounded-xl bg-green-600 px-4 py-2 text-white disabled:opacity-50"
                  >
                    إرسال/جدولة
                  </button>
                </div>

                {audPreview && (
                  <div className="mt-3 rounded-xl border p-3 text-sm">
                    <div>
                      عدد المستهدَفين: <b>{audPreview.count}</b>
                    </div>
                    <div className="mt-1 text-gray-500">
                      عينة (حتى 50):
                      <pre className="mt-1 max-h-40 overflow-auto rounded bg-gray-50 p-2">
                        {JSON.stringify(audPreview.sample, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
