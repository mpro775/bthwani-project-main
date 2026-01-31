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
import { KawaderConversation, KawaderChatListResponse } from "@/types/types";
import { getConversations } from "@/api/kawaderChatApi";
import { useAuth } from "@/auth/AuthContext";
import COLORS from "@/constants/colors";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "KawaderChatList">;

const KawaderChatListScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<KawaderConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState<"all" | "as-owner" | "as-interested">("all");

  const loadConversations = useCallback(async (cursor?: string, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else if (!cursor) {
        setLoading(true);
      }

      const response: KawaderChatListResponse = await getConversations(cursor, 25);
      const list = Array.isArray(response?.items) ? response.items : [];

      if (isLoadMore) {
        setConversations(prev => [...(Array.isArray(prev) ? prev : []), ...list]);
      } else {
        setConversations(list);
      }

      setNextCursor(response?.nextCursor);
      setHasMore(!!response?.nextCursor);

    } catch (error) {
      console.error("خطأ في تحميل المحادثات:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadConversations();
  }, [loadConversations]);

  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore && nextCursor) {
      loadConversations(nextCursor, true);
    }
  }, [hasMore, loadingMore, nextCursor, loadConversations]);

  const handleConversationPress = useCallback((conversation: KawaderConversation) => {
    navigation.navigate("KawaderChat", { conversationId: conversation._id });
  }, [navigation]);

  const handleFilterChange = useCallback((newFilter: "all" | "as-owner" | "as-interested") => {
    setFilter(newFilter);
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const filteredConversations = (Array.isArray(conversations) ? conversations : []).filter((conv) => {
    if (filter === "all") return true;
    if (filter === "as-owner") {
      return conv.ownerId?._id === user?.uid;
    }
    if (filter === "as-interested") {
      return conv.interestedUserId?._id === user?.uid;
    }
    return true;
  });

  const formatDate = (date?: Date | string) => {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "الآن";
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    if (days < 7) return `منذ ${days} يوم`;
    return d.toLocaleDateString("ar-SA");
  };

  const getUnreadCount = (conversation: KawaderConversation) => {
    if (!user) return 0;
    if (conversation.ownerId?._id === user.uid) {
      return conversation.unreadCountOwner ?? 0;
    }
    return conversation.unreadCountInterested ?? 0;
  };

  const getOtherUser = (conversation: KawaderConversation) => {
    if (!user) return null;
    if (conversation.ownerId?._id === user.uid) {
      return conversation.interestedUserId ?? null;
    }
    return conversation.ownerId ?? null;
  };

  const renderFilterTabs = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[styles.filterTab, filter === "all" && styles.filterTabActive]}
        onPress={() => handleFilterChange("all")}
      >
        <Text style={[styles.filterText, filter === "all" && styles.filterTextActive]}>
          الكل
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterTab, filter === "as-owner" && styles.filterTabActive]}
        onPress={() => handleFilterChange("as-owner")}
      >
        <Text style={[styles.filterText, filter === "as-owner" && styles.filterTextActive]}>
          كمعلن
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterTab, filter === "as-interested" && styles.filterTabActive]}
        onPress={() => handleFilterChange("as-interested")}
      >
        <Text style={[styles.filterText, filter === "as-interested" && styles.filterTextActive]}>
          كمهتم
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderConversationItem = ({ item }: { item: KawaderConversation }) => {
    const otherUser = getOtherUser(item);
    const unreadCount = getUnreadCount(item);
    const isOwner = item.ownerId?._id === user?.uid;

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => handleConversationPress(item)}
      >
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <View style={styles.conversationInfo}>
              <Text style={styles.conversationTitle}>
                {item.kawaderId?.title || "عرض وظيفي"}
              </Text>
              <Text style={styles.conversationUser}>
                {isOwner ? "المهتم: " : "المعلن: "}
                {otherUser?.name || otherUser?.email || "مستخدم"}
              </Text>
            </View>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          {item.lastMessage && (
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage}
            </Text>
          )}
          <Text style={styles.lastMessageTime}>
            {formatDate(item.lastMessageAt)}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
      </TouchableOpacity>
    );
  };

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
        <Ionicons name="chatbubbles-outline" size={64} color={COLORS.gray} />
        <Text style={styles.emptyTitle}>لا توجد محادثات</Text>
        <Text style={styles.emptySubtitle}>
          لا توجد محادثات في هذه الفئة حالياً
        </Text>
      </View>
    );
  };

  if (loading && conversations.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>جاري تحميل المحادثات...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>المحادثات</Text>
        <View style={styles.headerSpacer} />
      </View>

      {renderFilterTabs()}

      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item._id}
        renderItem={renderConversationItem}
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
        contentContainerStyle={filteredConversations.length === 0 ? styles.emptyList : styles.list}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
    alignItems: "center",
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: "500",
  },
  filterTextActive: {
    color: COLORS.white,
    fontWeight: "600",
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  conversationInfo: {
    flex: 1,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  conversationUser: {
    fontSize: 14,
    color: COLORS.gray,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  unreadText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
  },
  lastMessage: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  lastMessageTime: {
    fontSize: 12,
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
    color: COLORS.gray,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.dark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: "center",
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
    color: COLORS.gray,
  },
});

export default KawaderChatListScreen;
