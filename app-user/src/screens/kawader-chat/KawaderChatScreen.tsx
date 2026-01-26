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
import { KawaderMessage } from "@/types/types";
import { getConversation, getMessages, sendMessage, markAsRead } from "@/api/kawaderChatApi";
import { connectKawaderChatSocket } from "@/hooks/useKawaderChatSocket";
import { useAuth } from "@/auth/AuthContext";
import { refreshIdToken } from "@/api/authService";
import COLORS from "@/constants/colors";

type RouteProps = RouteProp<RootStackParamList, "KawaderChat">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, "KawaderChat">;

const KawaderChatScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { conversationId } = route.params;
  const { user } = useAuth();

  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<KawaderMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [loadingMore, setLoadingMore] = useState(false);
  const [typing, setTyping] = useState<{ userId: string; isTyping: boolean } | null>(null);

  const socketRef = useRef<ReturnType<typeof connectKawaderChatSocket> | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  const loadConversation = useCallback(async () => {
    try {
      const conv = await getConversation(conversationId);
      setConversation(conv);
    } catch (error) {
      console.error("خطأ في تحميل المحادثة:", error);
      Alert.alert("خطأ", "فشل في تحميل المحادثة");
      navigation.goBack();
    }
  }, [conversationId, navigation]);

  const loadMessages = useCallback(async (cursor?: string, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await getMessages(conversationId, cursor, 25);

      if (isLoadMore) {
        setMessages(prev => [...response.items, ...prev]);
      } else {
        setMessages(response.items);
      }

      setNextCursor(response.nextCursor);
    } catch (error) {
      console.error("خطأ في تحميل الرسائل:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [conversationId]);

  const handleSend = useCallback(async () => {
    if (!messageText.trim() || sending) return;

    const text = messageText.trim();
    setMessageText("");
    setSending(true);

    try {
      // إرسال عبر WebSocket إذا كان متصل
      if (socketRef.current) {
        socketRef.current.sendMessage(text);
      } else {
        // Fallback إلى REST API
        const newMessage = await sendMessage(conversationId, text);
        setMessages(prev => [...prev, newMessage]);
      }
    } catch (error) {
      console.error("خطأ في إرسال الرسالة:", error);
      Alert.alert("خطأ", "فشل في إرسال الرسالة");
      setMessageText(text); // استعادة النص
    } finally {
      setSending(false);
    }
  }, [messageText, sending, conversationId]);

  const handleTyping = useCallback((isTyping: boolean) => {
    if (socketRef.current) {
      socketRef.current.sendTyping(isTyping);
    }
  }, []);

  // إعداد WebSocket
  useEffect(() => {
    let mounted = true;

    const setupSocket = async () => {
      try {
        const token = await refreshIdToken();
        if (!mounted) return;

        const socket = connectKawaderChatSocket(
          token,
          conversationId,
          (newMessage) => {
            setMessages(prev => {
              // تجنب التكرار
              if (prev.some(m => m._id === newMessage._id)) return prev;
              return [...prev, newMessage];
            });
            // تحديث حالة القراءة
            if (socketRef.current) {
              socketRef.current.markAsRead();
            }
          },
          (typingData) => {
            if (typingData.userId !== user?.uid) {
              setTyping(typingData);
              if (typingData.isTyping) {
                setTimeout(() => setTyping(null), 3000);
              }
            }
          },
          () => {
            // onRead - لا حاجة لعمل شيء
          }
        );

        socketRef.current = socket;
      } catch (error) {
        console.error("خطأ في إعداد WebSocket:", error);
      }
    };

    setupSocket();

    return () => {
      mounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [conversationId, user]);

  // تحميل البيانات الأولية
  useEffect(() => {
    loadConversation();
    loadMessages();
    markAsRead(conversationId);
  }, [conversationId, loadConversation, loadMessages]);

  // Auto-scroll عند وصول رسالة جديدة
  useEffect(() => {
    if (messages.length > 0 && !loading) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, loading]);

  const loadMoreMessages = useCallback(() => {
    if (nextCursor && !loadingMore) {
      loadMessages(nextCursor, true);
    }
  }, [nextCursor, loadingMore, loadMessages]);

  const formatTime = (date?: Date | string) => {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
  };

  const renderMessage = ({ item }: { item: KawaderMessage }) => {
    const isMyMessage = item.senderId._id === user?.uid;

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessage : styles.otherMessage,
        ]}
      >
        {!isMyMessage && (
          <Text style={styles.senderName}>
            {item.senderId.name || item.senderId.email || "مستخدم"}
          </Text>
        )}
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

  if (!conversation) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>لم يتم العثور على المحادثة</Text>
      </View>
    );
  }

  const otherUser =
    conversation.ownerId._id === user?.uid
      ? conversation.interestedUserId
      : conversation.ownerId;

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
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            {conversation.kawaderId?.title || "عرض وظيفي"}
          </Text>
          <Text style={styles.headerSubtitle}>
            {otherUser?.name || otherUser?.email || "مستخدم"}
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderMessage}
        onEndReached={loadMoreMessages}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          loadingMore ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          ) : null
        }
        contentContainerStyle={styles.messagesList}
        inverted={false}
        showsVerticalScrollIndicator={false}
      />

      {typing && typing.isTyping && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>يكتب...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={messageText}
          onChangeText={(text) => {
            setMessageText(text);
            handleTyping(text.length > 0);
          }}
          placeholder="اكتب رسالة..."
          placeholderTextColor={COLORS.textLight}
          multiline
          maxLength={1000}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!messageText.trim() || sending) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!messageText.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Ionicons name="send" size={20} color={COLORS.white} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.danger,
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
  headerInfo: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  messagesList: {
    padding: 16,
  },
  loadingMore: {
    padding: 16,
    alignItems: "center",
  },
  messageContainer: {
    maxWidth: "75%",
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.primary,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 4,
  },
  myMessageText: {
    color: COLORS.white,
  },
  messageTime: {
    fontSize: 12,
    color: COLORS.gray,
    alignSelf: "flex-end",
  },
  myMessageTime: {
    color: COLORS.white,
    opacity: 0.8,
  },
  typingIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingText: {
    fontSize: 14,
    fontStyle: "italic",
    color: COLORS.gray,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    color: COLORS.text,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.gray,
    opacity: 0.5,
  },
});

export default KawaderChatScreen;
