import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { RootStackParamList } from "@/types/navigation";
import { ArabonItem } from "@/types/types";
import {
  searchArabon,
  type ArabonListResponse,
  type ArabonStatus,
} from "@/api/arabonApi";
import COLORS from "@/constants/colors";
import ArabonCard from "@/components/arabon/ArabonCard";

const STATUS_OPTIONS: { key: ArabonStatus | ""; label: string }[] = [
  { key: "", label: "الكل" },
  { key: "draft", label: "مسودة" },
  { key: "pending", label: "في الانتظار" },
  { key: "confirmed", label: "مؤكد" },
  { key: "completed", label: "مكتمل" },
  { key: "cancelled", label: "ملغي" },
];

const DEBOUNCE_MS = 400;

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "ArabonSearch">;

const ArabonSearchScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ArabonStatus | "">("");
  const [items, setItems] = useState<ArabonItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(
    async (cursor?: string, isLoadMore = false) => {
      const q = query.trim();
      if (!q) {
        if (!isLoadMore) {
          setItems([]);
          setSearched(true);
        }
        return;
      }
      try {
        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);

        const res: ArabonListResponse = await searchArabon(
          q,
          status || undefined,
          cursor
        );

        if (isLoadMore) {
          setItems((prev) => [...prev, ...res.data]);
        } else {
          setItems(res.data);
        }
        setNextCursor(res.nextCursor);
        setHasMore(res.hasMore);
        setSearched(true);
      } catch (e) {
        console.error("خطأ في البحث:", e);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [query, status]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (!q) {
      setItems([]);
      setNextCursor(undefined);
      setHasMore(false);
      setSearched(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      runSearch();
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, status, runSearch]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    runSearch();
  }, [runSearch]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && nextCursor && !loadingMore) runSearch(nextCursor, true);
  }, [hasMore, nextCursor, loadingMore, runSearch]);

  const renderItem = ({ item }: { item: ArabonItem }) => (
    <ArabonCard
      item={item}
      onPress={() => navigation.navigate("ArabonDetails", { itemId: item._id })}
    />
  );

  const renderEmpty = () => {
    if (loading) return null;
    const q = query.trim();
    if (!q) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color={COLORS.gray} />
          <Text style={styles.emptyTitle}>ابحث في العربونات</Text>
          <Text style={styles.emptySubtitle}>
            اكتب كلمة في العنوان أو الوصف ثم اختر فلتر الحالة إن أردت
          </Text>
        </View>
      );
    }
    if (!searched) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={64} color={COLORS.gray} />
        <Text style={styles.emptyTitle}>لا توجد نتائج</Text>
        <Text style={styles.emptySubtitle}>
          جرّب كلمات أخرى أو غيّر فلتر الحالة
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.footerText}>جاري التحميل...</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>البحث في العربونات</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchInputWrap}>
          <Ionicons name="search" size={20} color={COLORS.textLight} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="عنوان أو وصف..."
            placeholderTextColor={COLORS.textLight}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={20} color={COLORS.gray} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.filterRow}>
        {STATUS_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.key || "all"}
            style={[
              styles.filterChip,
              status === opt.key && styles.filterChipActive,
            ]}
            onPress={() => setStatus(opt.key as ArabonStatus | "")}
          >
            <Text
              style={[
                styles.filterChipText,
                status === opt.key && styles.filterChipTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && !refreshing && items.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>جاري البحث...</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "Cairo-Regular",
    color: COLORS.textLight,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: { padding: 8 },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.text,
    textAlign: "center",
  },
  headerSpacer: { width: 40 },
  searchRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: COLORS.white,
  },
  searchInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: COLORS.lightGray,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Cairo-Regular",
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: COLORS.text,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  filterChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.lightBlue,
  },
  filterChipText: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.text,
  },
  filterChipTextActive: {
    color: COLORS.primary,
    fontFamily: "Cairo-SemiBold",
  },
  listContainer: { padding: 16 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.textLight,
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 32,
  },
  footerLoader: { paddingVertical: 16, alignItems: "center" },
  footerText: { fontSize: 14, fontFamily: "Cairo-Regular", color: COLORS.textLight, marginTop: 8 },
});

export default ArabonSearchScreen;
