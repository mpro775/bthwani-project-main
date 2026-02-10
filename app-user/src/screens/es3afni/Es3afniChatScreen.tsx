import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { RootStackParamList } from "@/types/navigation";
import {
  getEs3afniConversation,
  getEs3afniMessages,
  sendEs3afniMessage,
  markEs3afniChatAsRead,
  type Es3afniChatMessage,
} from "@/api/es3afniChatApi";
import { useAuth } from "@/auth/AuthContext";
import COLORS from "@/constants/colors";

type RouteProps = RouteProp<RootStackParamList, "Es3afniChat">;
type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Es3afniChat"
>;

const Es3afniChatScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { conversationId } = route.params;
  const { user } = useAuth();

  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<Es3afniChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const loadConversation = useCallback(async () => {
    try {
      const conv = await getEs3afniConversation(conversationId);
      setConversation(conv);
    } catch (error) {
      console.error("خطأ في تحميل المحادثة:", error);
      Alert.alert("خطأ", "فشل في تحميل المحادثة");
      navigation.goBack();
    }
  }, [conversationId, navigation]);

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getEs3afniMessages(conversationId, undefined, 50);
      setMessages(res.items || []);
      markEs3afniChatAsRead(conversationId).catch(() => {});
    } catch (error) {
      console.error("خطأ في تحميل الرسائل:", error);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    loadConversation();
    loadMessages();
  }, [loadConversation, loadMessages]);

  const handleSend = useCallback(async () => {
    if (!messageText.trim() || sending) return;
    const text = messageText.trim();
    setMessageText("");
    setSending(true);
    try {
      const newMsg = await sendEs3afniMessage(conversationId, text);
      setMessages((prev) => [...prev, newMsg]);
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        100
      );
    } catch (error) {
      Alert.alert("خطأ", "فشل في إرسال الرسالة");
      setMessageText(text);
    } finally {
      setSending(false);
    }
  }, [conversationId, messageText, sending]);

  const formatTime = (date?: Date | string) => {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSenderId = (msg: Es3afniChatMessage) =>
    typeof msg.senderId === "object" && msg.senderId !== null
      ? (msg.senderId as any)._id
      : String(msg.senderId);

  const renderMessage = ({ item }: { item: Es3afniChatMessage }) => {
    const isMyMessage = getSenderId(item) === user?.uid;
    const senderName =
      typeof item.senderId === "object" && item.senderId !== null
        ? (item.senderId as any).name || (item.senderId as any).email || "متبرع"
        : "متبرع";

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessage : styles.otherMessage,
        ]}
      >
        {!isMyMessage && <Text style={styles.senderName}>{senderName}</Text>}
        <Text style={[styles.messageText, isMyMessage && styles.myMessageText]}>
          {item.text}
        </Text>
        <Text style={[styles.messageTime, isMyMessage && styles.myMessageTime]}>
          {formatTime(item.createdAt)}
        </Text>
      </View>
    );
  };

  if (loading && !conversation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>جاري تحميل المحادثة...</Text>
      </View>
    );
  }

  if (!conversation) return null;

  const title =
    conversation.requestId?.title || conversation.requestId?.bloodType
      ? `طلب ${conversation.requestId?.bloodType || ""} - ${
          conversation.requestId?.title || "تبرع"
        }`
      : "محادثة تبرع";

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />

      {conversation.status === "closed" && (
        <View style={styles.closedBanner}>
          <Text style={styles.closedText}>المحادثة مغلقة بعد 48 ساعة</Text>
        </View>
      )}

      {conversation.status !== "closed" && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={messageText}
            onChangeText={setMessageText}
            placeholder="اكتب رسالة..."
            placeholderTextColor={COLORS.textLight}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!messageText.trim() || sending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!messageText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Ionicons name="send" size={22} color={COLORS.white} />
            )}
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  messagesList: { padding: 16, paddingBottom: 24 },
  messageContainer: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.primary,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.lightGray,
  },
  senderName: {
    fontSize: 12,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.primary,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    fontFamily: "Cairo-Regular",
    color: COLORS.text,
  },
  myMessageText: { color: COLORS.white },
  messageTime: {
    fontSize: 11,
    fontFamily: "Cairo-Regular",
    color: COLORS.textLight,
    marginTop: 4,
  },
  myMessageTime: { color: "rgba(255,255,255,0.8)" },
  closedBanner: {
    padding: 12,
    backgroundColor: COLORS.lightGray,
    alignItems: "center",
  },
  closedText: {
    fontSize: 14,
    fontFamily: "Cairo-Regular",
    color: COLORS.gray,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: "Cairo-Regular",
    color: COLORS.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  sendButtonDisabled: { opacity: 0.5 },
});

export default Es3afniChatScreen;
