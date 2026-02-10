import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
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
import {
  Es3afniItem,
  Es3afniListResponse,
  BLOOD_TYPES,
  URGENCY_LEVELS,
  URGENCY_LABELS,
} from "@/types/types";
import { getEs3afniList, getMyEs3afni } from "@/api/es3afniApi";
import { useAuth } from "@/auth/AuthContext";
import COLORS from "@/constants/colors";
import Es3afniCard from "@/components/es3afni/Es3afniCard";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Es3afniList"
>;

const Es3afniListScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [items, setItems] = useState<Es3afniItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showMyOnly, setShowMyOnly] = useState(false);
  const [filterBlood, setFilterBlood] = useState<string | undefined>();
  const [filterUrgency, setFilterUrgency] = useState<string | undefined>();

  const loadItems = useCallback(
    async (cursor?: string, isLoadMore = false) => {
      try {
        if (isLoadMore) {
          setLoadingMore(true);
        } else if (!cursor) {
          setLoading(true);
        }

        const response: Es3afniListResponse = showMyOnly
          ? await getMyEs3afni(cursor)
          : await getEs3afniList({
              cursor,
              bloodType: filterBlood,
              status: undefined,
              urgency: filterUrgency,
            });
        const list = response?.items ?? [];

        if (isLoadMore) {
          setItems((prev) => [...prev, ...list]);
        } else {
          setItems(list);
        }

        setNextCursor(response.nextCursor);
        setHasMore(!!response.nextCursor);
      } catch (error) {
        console.error("خطأ في تحميل طلبات التبرع:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [showMyOnly, filterBlood, filterUrgency]
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadItems();
  }, [loadItems]);

  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore && nextCursor) {
      loadItems(nextCursor, true);
    }
  }, [hasMore, loadingMore, nextCursor, loadItems]);

  const handleItemPress = useCallback(
    (item: Es3afniItem) => {
      navigation.navigate("Es3afniDetails", { itemId: item._id });
    },
    [navigation]
  );

  const handleCreatePress = useCallback(() => {
    navigation.navigate("Es3afniCreate");
  }, [navigation]);

  const handleDonorPress = useCallback(() => {
    navigation.navigate("Es3afniDonorProfile" as never);
  }, [navigation]);

  const handleDonorRegisterPress = useCallback(() => {
    navigation.navigate("Es3afniDonorRegister" as never);
  }, [navigation]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const renderItem = ({ item }: { item: Es3afniItem }) => (
    <Es3afniCard item={item} onPress={() => handleItemPress(item)} />
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.footerText}>جاري التحميل...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="water" size={64} color={COLORS.gray} />
        <Text style={styles.emptyTitle}>لا توجد طلبات تبرع</Text>
        <Text style={styles.emptySubtitle}>
          لا توجد طلبات تبرع بالدم في الوقت الحالي
        </Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreatePress}
        >
          <Text style={styles.createButtonText}>إنشاء طلب تبرع</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading && (items?.length ?? 0) === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>جاري تحميل طلبات التبرع...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>اسعفني</Text>
          <Text style={styles.headerSubtitle}>شبكة تبرع بالدم عاجلة</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => setShowMyOnly((v) => !v)}
          >
            <Ionicons
              name={showMyOnly ? "list" : "person"}
              size={24}
              color={showMyOnly ? COLORS.primary : COLORS.text}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.createIconButton}
            onPress={handleCreatePress}
          >
            <Ionicons name="add-circle" size={28} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* فلترة */}
      <View style={styles.filtersRow}>
        <View style={styles.filterChips}>
          <TouchableOpacity
            style={[styles.filterChip, !filterBlood && styles.filterChipActive]}
            onPress={() => setFilterBlood(undefined)}
          >
            <Text style={styles.filterChipText}>كل الفصائل</Text>
          </TouchableOpacity>
          {BLOOD_TYPES.slice(0, 4).map((bt) => (
            <TouchableOpacity
              key={bt}
              style={[
                styles.filterChip,
                filterBlood === bt && styles.filterChipActive,
              ]}
              onPress={() =>
                setFilterBlood(filterBlood === bt ? undefined : bt)
              }
            >
              <Text style={styles.filterChipText}>{bt}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.urgencyFilters}>
          {URGENCY_LEVELS.map((u) => (
            <TouchableOpacity
              key={u}
              style={[
                styles.urgencyChip,
                filterUrgency === u && styles.urgencyChipActive,
              ]}
              onPress={() =>
                setFilterUrgency(filterUrgency === u ? undefined : u)
              }
            >
              <Text style={styles.urgencyChipText}>{URGENCY_LABELS[u]}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* بلاغاتي / كل الطلبات / سجّل متبرع */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.tabButton, !showMyOnly && styles.tabButtonActive]}
          onPress={() => setShowMyOnly(false)}
        >
          <Text
            style={[
              styles.tabButtonText,
              !showMyOnly && { color: COLORS.white },
            ]}
          >
            كل الطلبات
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, showMyOnly && styles.tabButtonActive]}
          onPress={() => setShowMyOnly(true)}
        >
          <Text
            style={[
              styles.tabButtonText,
              showMyOnly && { color: COLORS.white },
            ]}
          >
            بلاغاتي
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.donorButton}
          onPress={handleDonorRegisterPress}
        >
          <Ionicons name="heart-outline" size={18} color={COLORS.white} />
          <Text style={styles.donorButtonText}>سجّل متبرع</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items ?? []}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={
          (items?.length ?? 0) === 0 ? styles.emptyList : styles.list
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Cairo-Bold",
    color: COLORS.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.gray,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIconButton: {
    padding: 8,
    marginRight: 4,
  },
  createIconButton: {
    padding: 4,
  },
  filtersRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  filterChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
    marginRight: 8,
    marginBottom: 4,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontFamily: "Cairo-Regular",
    color: COLORS.text,
  },
  urgencyFilters: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  urgencyChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.lightGray,
    marginRight: 6,
    marginBottom: 4,
  },
  urgencyChipActive: {
    backgroundColor: COLORS.orangeDark,
  },
  urgencyChipText: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.text,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.background,
    gap: 10,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary,
  },
  tabButtonText: {
    fontSize: 14,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.text,
  },
  donorButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.danger,
  },
  donorButtonText: {
    fontSize: 14,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.white,
    marginLeft: 6,
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Cairo-Bold",
    color: COLORS.dark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.gray,
    textAlign: "center",
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    fontFamily: "Cairo-SemiBold",
    color: COLORS.white,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "Cairo-Regular",
    color: COLORS.gray,
  },
  footer: {
    padding: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  footerText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.gray,
  },
});

export default Es3afniListScreen;
