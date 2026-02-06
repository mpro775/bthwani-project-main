import { useState, useCallback, useEffect } from "react";
import { getKenzFavorites, addKenzFavorite, removeKenzFavorite } from "../api";

/** يحتفظ بمجموعة معرفات الإعلانات المفضلة ويوفّر التبديل (للمستخدم المصادق) */
export function useKenzFavoriteIds(enabled: boolean) {
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setFavoritedIds(new Set());
      return;
    }
    let cancelled = false;
    setLoading(true);
    getKenzFavorites()
      .then((res) => {
        if (cancelled) return;
        const ids = new Set((res?.items ?? []).map((i) => i._id));
        setFavoritedIds(ids);
      })
      .catch(() => {
        if (!cancelled) setFavoritedIds(new Set());
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  const toggle = useCallback(async (kenzId: string) => {
    const isFavorited = favoritedIds.has(kenzId);
    setFavoritedIds((prev) => {
      const next = new Set(prev);
      if (isFavorited) next.delete(kenzId);
      else next.add(kenzId);
      return next;
    });
    try {
      if (isFavorited) await removeKenzFavorite(kenzId);
      else await addKenzFavorite(kenzId);
    } catch (e) {
      setFavoritedIds((prev) => {
        const next = new Set(prev);
        if (isFavorited) next.add(kenzId);
        else next.delete(kenzId);
        return next;
      });
      throw e;
    }
  }, [favoritedIds]);

  return { favoritedIds, isFavorited: (id: string) => favoritedIds.has(id), toggle, loading };
}
