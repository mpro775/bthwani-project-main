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
  getEs3afniConversations,
  type Es3afniConversation,
} from "@/api/es3afniChatApi";
import COLORS from "@/constants/colors";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Es3afniChatList"
>;

const Es3afniChatListScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [items, setItems] = useState<Es3afniConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();

  const load = useCallback(async (cursor?: string, append = false) => {
    try {
      if (!append) setLoading(true);
      const res = await getEs3afniConversations(cursor, 25);
      const list = res.items || [];
      if (append) {
        setItems((prev) => [...prev, ...list]);
      } else {
        setItems(list);
      }
      setNextCursor(res.nextCursor);
    } catch (error) {
      console.error("خطأ في تحميل محادثات اسعفني:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const formatDate = (date?: Date | string) => {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("ar-SA", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderItem = ({ item }: { item: Es3afniConversation }) => {
    const title =
      item.requestId?.title ||
      (item.requestId?.bloodType
        ? `طلب ${item.requestId.bloodType}`
        : "محادثة");
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate("Es3afniChat", { conversationId: item._id })
        }
      >
        <View style={styles.cardHeader}>
          <View style={styles.bloodBadge}>
            <Text style={styles.bloodText}>
              {item.requestId?.bloodType || "—"}
            </Text>
          </View>
          <Text style={styles.dateText}>
            {formatDate(item.lastMessageAt || item.updatedAt)}
          </Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {item.lastMessage && (
          <Text style={styles.preview} numberOfLines={1}>
            {item.lastMessage}
          </Text>
        )}
        {(item.unreadCountRequester > 0 || item.unreadCountDonor > 0) && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>
              {item.unreadCountRequester + item.unreadCountDonor}
            </Text>
          </View>
        )}
      </TouchableOpacity>
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
        <Text style={styles.headerTitle}>محادثات اسعفني</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading && items.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
          contentContainerStyle={
            items.length === 0 ? styles.emptyList : styles.list
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="chatbubbles-outline"
                size={64}
                color={COLORS.gray}
              />
              <Text style={styles.emptyText}>لا توجد محادثات</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
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
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "Cairo-Regular",
    color: COLORS.gray,
  },
  list: { padding: 16 },
  emptyList: { flex: 1, justifyContent: "center" },
  emptyContainer: { alignItems: "center", paddingVertical: 40 },
  emptyText: {
    fontSize: 16,
    fontFamily: "Cairo-Regular",
    color: COLORS.gray,
    marginTop: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  bloodBadge: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bloodText: { fontSize: 14, fontFamily: "Cairo-Bold", color: COLORS.white },
  dateText: {
    fontSize: 12,
    fontFamily: "Cairo-Regular",
    color: COLORS.textLight,
  },
  title: {
    fontSize: 16,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.text,
    marginBottom: 4,
  },
  preview: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.textLight,
  },
  unreadBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: {
    fontSize: 12,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.white,
  },
});

export default Es3afniChatListScreen;
