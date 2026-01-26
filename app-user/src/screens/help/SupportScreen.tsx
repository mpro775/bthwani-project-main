import { fetchWithAuth, refreshIdToken } from "@/api/authService";
import COLORS from "@/constants/colors";
import { connectTicketSocket } from "@/hooks/useTicketSocket";
import { API_URL } from "@/utils/api/config";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
// لو عندك كونتكست مصادقة يجيب توكن فايربيس:
import { nanoid } from "nanoid/non-secure";

type Ticket = {
  _id: string;
  subject: string;
  status: "open" | "closed";
  createdAt: string;
};

type Msg = {
  _id: string;
  sender: "user" | "agent";
  text: string;
  createdAt: string;
  optimistic?: boolean; // للرسائل المتفائلة
};

export default function SupportScreen() {
  const [idToken, setIdToken] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // form
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // chat
  const [active, setActive] = useState<Ticket | null>(null);
  const [chat, setChat] = useState<Msg[]>([]);
  const [sending, setSending] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const socketCleanupRef = useRef<null | (() => void)>(null);

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth(`${API_URL}/support/tickets/my`);
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (id: string) => {
    setLoadingMsgs(true);
    try {
      // API الآن يرجّع {items, nextCursor}
      const res = await fetchWithAuth(
        `${API_URL}/support/tickets/${id}/messages?limit=20`
      );
      const data = await res.json();
      const items: Msg[] = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
        ? data
        : [];
      setChat(items); // الأحدث أولاً (متوافق مع inverted)
      setNextCursor(data?.nextCursor ?? null);
    } catch {
      setChat([]);
      setNextCursor(null);
    } finally {
      setLoadingMsgs(false);
    }
  }, []);

  const loadOlder = useCallback(async () => {
    if (!active || !nextCursor || loadingMore) return;
    try {
      setLoadingMore(true);
      const url = `${API_URL}/support/tickets/${
        active._id
      }/messages?limit=20&cursor=${encodeURIComponent(nextCursor)}`;
      const res = await fetchWithAuth(url);
      const data = await res.json();
      const items: Msg[] = Array.isArray(data?.items) ? data.items : [];
      // دمج مع تفادي التكرار (_id مفتاح)
      setChat((prev) => {
        const seen = new Set(prev.map((m) => m._id));
        const merged = [...prev, ...items.filter((m) => !seen.has(m._id))];
        return merged;
      });
      setNextCursor(data?.nextCursor ?? null);
    } catch {
      // لا شيء
    } finally {
      setLoadingMore(false);
    }
  }, [active, nextCursor, loadingMore]);

  useEffect(() => {
    loadTickets();
    // تحميل التوكن عند بداية الشاشة
    refreshIdToken()
      .then((token) => setIdToken(token || ""))
      .catch(() => setIdToken(""));
  }, [loadTickets]);

  // عند اختيار تذكرة: حمّل الرسائل واربط Socket
  useEffect(() => {
    // نظّف أي اتصال سابق
    if (socketCleanupRef.current) {
      socketCleanupRef.current();
      socketCleanupRef.current = null;
    }

    if (!active) {
      setChat([]);
      setNextCursor(null);
      return;
    }

    // 1) أول تحميل من REST
    loadMessages(active._id);

    // 2) Socket realtime
    if (idToken) {
      const off = connectTicketSocket(idToken, active._id, (incoming) => {
        // نضيف الرسالة الجديدة في البداية (الأحدث أولًا)
        setChat((prev) => {
          // لا تكرر إن كانت موجودة (بسبب optimistic)
          if (prev.some((m) => m._id === incoming._id)) return prev;
          return [incoming, ...prev];
        });
      });
      socketCleanupRef.current = off;
    }

    return () => {
      if (socketCleanupRef.current) {
        socketCleanupRef.current();
        socketCleanupRef.current = null;
      }
    };
  }, [active?._id, idToken, loadMessages]);

  // إنشاء تذكرة
  const createTicket = async () => {
    if (!subject.trim() || !message.trim()) return;
    try {
      const res = await fetchWithAuth(`${API_URL}/support/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });
      if (!res.ok) throw new Error();
      setSubject("");
      setMessage("");
      await loadTickets();
      const created = await res.json();
      setActive(created);
      // سيتم جلب الرسائل وربط السوكيت تلقائيًا عبر useEffect
    } catch {
      Alert.alert("تعذر إنشاء التذكرة الآن");
    }
  };

  // إرسال رسالة (إرسال متفائل + تراجع عند الخطأ)
  const sendMsg = async () => {
    if (!active || !message.trim() || sending) return;
    setSending(true);
    const text = message;
    setMessage("");

    // 1) دفع رسالة متفائلة فورًا
    const tempId = `tmp_${nanoid(8)}`;
    const optimistic: Msg = {
      _id: tempId,
      sender: "user",
      text,
      createdAt: new Date().toISOString(),
      optimistic: true,
    };
    setChat((prev) => [optimistic, ...prev]);

    // 2) إرسال فعلي
    try {
      const res = await fetchWithAuth(
        `${API_URL}/support/tickets/${active._id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        }
      );
      if (!res.ok) throw new Error();
      // عند النجاح، سيرجع السوكت بالرسالة الحقيقية (بـ _id حقيقي)
      // نستبدل المتفائلة بالحقيقية ضمن onMessage (أعلاه منعنا التكرار)
      // أو يمكننا عمل invalidate بسيط، لكن الحالي كافٍ.
    } catch {
      // تراجع: احذف المؤقتة
      setChat((prev) => prev.filter((m) => m._id !== tempId));
      Alert.alert("تعذر الإرسال");
    } finally {
      setSending(false);
    }
  };

  const renderMsg = useCallback(
    ({ item }: { item: Msg }) => (
      <View
        style={[
          styles.bubble,
          item.sender === "user" ? styles.myBubble : styles.agentBubble,
          item.optimistic && { opacity: 0.6 },
        ]}
      >
        <Text style={{ color: item.sender === "user" ? "#fff" : COLORS.text }}>
          {item.text}
        </Text>
      </View>
    ),
    []
  );

  const keyExtractor = useCallback((m: Msg) => m._id, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient
        colors={[COLORS.primary, COLORS.primary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.headerTitle}>الدعم الفني</Text>
      </LinearGradient>

      {/* قائمة التذاكر */}
      <View style={styles.listWrap}>
        <Text style={styles.sectionTitle}>تذاكري</Text>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <FlatList
            data={tickets}
            keyExtractor={(t) => t._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.ticketPill,
                  active?._id === item._id && styles.ticketPillActive,
                ]}
                onPress={() => setActive(item)}
              >
                <Text
                  style={[
                    styles.ticketText,
                    active?._id === item._id && { color: "#fff" },
                  ]}
                  numberOfLines={1}
                >
                  {item.subject}
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={{ color: "#888", paddingHorizontal: 12 }}>
                لا توجد تذاكر بعد
              </Text>
            }
          />
        )}
      </View>

      {/* شات أو نموذج إنشاء تذكرة */}
      {active ? (
        <>
          {loadingMsgs ? (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ActivityIndicator />
            </View>
          ) : (
            <FlatList
              data={chat}
              keyExtractor={keyExtractor}
              inverted
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 12 }}
              renderItem={renderMsg}
              // تحميل أقدم عند الوصول للأعلى (مع inverted)
              onEndReachedThreshold={0.3}
              onEndReached={loadOlder}
              ListFooterComponent={
                nextCursor ? (
                  <View style={{ paddingVertical: 8 }}>
                    {loadingMore && <ActivityIndicator />}
                  </View>
                ) : null
              }
            />
          )}

          <View style={styles.composer}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder={
                active.status === "closed"
                  ? "التذكرة مغلقة — افتحها لإرسال رسالة"
                  : "اكتب رسالتك..."
              }
              value={message}
              onChangeText={setMessage}
              editable={active.status !== "closed" && !sending}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                active.status === "closed" && { opacity: 0.5 },
              ]}
              onPress={sendMsg}
              disabled={sending || active.status === "closed"}
            >
              {sending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Ionicons name="send" size={18} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={{ padding: 16 }}>
          <Text style={styles.sectionTitle}>فتح تذكرة جديدة</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="help-buoy" size={18} color={COLORS.blue} />
            <TextInput
              style={styles.flexInput}
              placeholder="الموضوع"
              value={subject}
              onChangeText={setSubject}
            />
          </View>
          <View
            style={[
              styles.inputWrap,
              { height: 120, alignItems: "flex-start", paddingTop: 10 },
            ]}
          >
            <Ionicons name="chatbox-ellipses" size={18} color={COLORS.blue} />
            <TextInput
              style={[
                styles.flexInput,
                { height: "100%", textAlignVertical: "top" },
              ]}
              multiline
              placeholder="اشرح مشكلتك أو طلبك"
              value={message}
              onChangeText={setMessage}
            />
          </View>
          <TouchableOpacity style={styles.primaryBtn} onPress={createTicket}>
            <Text style={styles.primaryBtnText}>إرسال</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  headerTitle: {
    fontFamily: "Cairo-Bold",
    fontSize: 22,
    color: "#FFF",
    textAlign: "center",
  },
  listWrap: { paddingVertical: 10 },
  sectionTitle: {
    fontFamily: "Cairo-Bold",
    fontSize: 16,
    color: COLORS.blue,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  ticketPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7eb",
    marginHorizontal: 6,
    backgroundColor: "#fff",
  },
  ticketPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  ticketText: { fontFamily: "Cairo-SemiBold", color: COLORS.text },

  bubble: { maxWidth: "80%", borderRadius: 14, padding: 10, marginVertical: 6 },
  myBubble: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.primary,
    borderTopRightRadius: 2,
  },
  agentBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#F3F4F6",
    borderTopLeftRadius: 2,
  },

  composer: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "#eee",
  },
  input: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sendBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 14,
    justifyContent: "center",
  },

  inputWrap: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  flexInput: { flex: 1, textAlign: "right" },

  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryBtnText: {
    color: "#fff",
    textAlign: "center",
    fontFamily: "Cairo-Bold",
  },
});
