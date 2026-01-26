import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  I18nManager,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { Card } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import axiosInstance from "../api/axiosInstance";
import { COLORS } from "../constants/colors";

// --- Types ---
interface SettlementRequest {
  id: string;
  amount: number;
  status: "pending" | "completed" | "rejected";
  requestedDate: string;
  processedDate?: string;
  bankAccount: string;
}

interface SaleRecord {
  id: string;
  orderId: string;
  amount: number;
  date: string;
  customerName: string;
  commission: number;
  netAmount: number;
}

// --- Helpers ---
const formatCurrency = (value: number) =>
  `${new Intl.NumberFormat("ar-OM").format(value || 0)} ر.ي`;

const STATUS_LABEL: Record<SettlementRequest["status"], string> = {
  pending: "قيد التنفيذ",
  completed: "تم التحويل",
  rejected: "مرفوض",
};

const STATUS_COLOR: Record<SettlementRequest["status"], string> = {
  pending: "#F59E0B", // amber-500
  completed: "#10B981", // emerald-500
  rejected: "#EF4444", // red-500
};

// --- Component ---
const VendorAccountStatementScreen: React.FC = () => {
  // Ensure RTL (does not force app-wide, just sets direction for layouts we control)
  const isRTL = I18nManager.isRTL;

  const [currentBalance, setCurrentBalance] = useState(0);
  const [settlementRequests, setSettlementRequests] = useState<
    SettlementRequest[]
  >([]);
  const [salesHistory, setSalesHistory] = useState<SaleRecord[]>([]);

  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [settlementAmount, setSettlementAmount] = useState("");
  const [settlementType, setSettlementType] = useState<'full' | 'custom'>('custom');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [stmt, settlements, sales] = await Promise.all([
          axiosInstance.get("/vendors/account/statement"),
          axiosInstance.get("/vendors/settlements"),
          axiosInstance.get("/vendors/sales?limit=100"),
        ]);

        setCurrentBalance(stmt.data.currentBalance || 0);

        setSettlementRequests(
          (settlements.data || []).map((r: any) => ({
            id: r.id,
            amount: r.amount,
            status: r.status,
            requestedDate: r.requestedDate,
            processedDate: r.processedDate,
            bankAccount: r.bankAccount,
          }))
        );

        setSalesHistory(
          (sales.data || []).map((s: any) => ({
            id: s.id,
            orderId: s.orderId,
            amount: s.amount,
            date: s.date,
            // ⚠️ الباك-إند أصلاً لا يعيد أسماء عملاء
            customerName: s.customerCode, // رمز بديل لتمييز السجلات
            commission: s.commission,
            netAmount: s.netAmount,
          }))
        );
      } catch (e: any) {
        // اعرض مودال الخطأ لديك
        showError(e.response?.data?.message || "تعذر تحميل البيانات");
      }
    })();
  }, []);

  const totals = useMemo(() => {
    const pending = settlementRequests
      .filter((r) => r.status === "pending")
      .reduce((sum, r) => sum + r.amount, 0);
    const lastCompleted = settlementRequests
      .filter((r) => r.status === "completed")
      .sort((a, b) =>
        (b.processedDate || "").localeCompare(a.processedDate || "")
      )[0];
    return { pending, lastCompleted };
  }, [settlementRequests]);

  // --- Handlers ---
  const showError = (message: string) => {
    setErrorMessage(message);
    setShowErrorModal(true);
  };

  const showSuccess = () => {
    setShowSuccessModal(true);
  };

  const handleSettlementRequest = async () => {
    let amount = 0;
    if (settlementType === 'full') {
      amount = currentBalance;
    } else {
      if (!settlementAmount || parseFloat(settlementAmount) <= 0) {
        showError("الرجاء إدخال مبلغ صحيح");
        return;
      }
      amount = parseFloat(settlementAmount);
    }

    if (amount < 30000) {
      showError("أقل مبلغ للسحب هو 30,000 ريال يمني");
      return;
    }

    if (amount > currentBalance) {
      showError("المبلغ المطلوب أكبر من الرصيد المتاح");
      return;
    }

    try {
      const res = await axiosInstance.post("/vendors/settlements", {
        amount,
        bankAccount: "YE09 1234 5678 9012 3456 7890", // أو خذه من نموذج إدخال
      });
      // أضِف الناتج للقائمة مباشرةً (تفاؤليًا)
      const r = res.data;
      setSettlementRequests(prev => [{
        id: r._id,
        amount: r.amount,
        status: r.status,
        requestedDate: new Date(r.createdAt || r.requestedAt).toISOString().slice(0,10),
        bankAccount: r.bankAccount || "",
      }, ...prev]);

      setShowSettlementModal(false);
      setSettlementAmount("");
      setSettlementType('custom');
      showSuccess();
    } catch (e: any) {
      showError(e.response?.data?.message || "تعذر إرسال الطلب");
    }
  };

  // --- Helpers ---
  const maskName = (n: string) => {
    if (!n) return "عميل";
    const first = n.trim()[0] || "ع";
    return first + "***";
  };

  // --- Renders ---
  const renderSale = ({ item }: { item: SaleRecord }) => (
    <Card style={styles.saleCard}>
      <View style={styles.saleHeaderRow}>
        <View style={styles.rowCenter}>
          <Ionicons name="receipt-outline" size={18} color={COLORS.primary} />
          <Text style={styles.orderId}> {item.orderId}</Text>
        </View>
        <Text style={styles.saleDate}>{item.date}</Text>
      </View>
      <Text style={styles.customerName}>{maskName(item.customerName)}</Text>
      <View style={styles.saleAmountsRow}>
        <Text style={styles.amountText}>
          المبلغ:{" "}
          <Text style={styles.amountStrong}>{formatCurrency(item.amount)}</Text>
        </Text>
        <Text style={styles.commissionText}>
          العمولة: {formatCurrency(item.commission)}
        </Text>
      </View>
      <View style={styles.netPill}>
        <Ionicons name="checkmark-circle" size={16} color="#10B981" />
        <Text style={styles.netText}>
          الصافي: {formatCurrency(item.netAmount)}
        </Text>
      </View>
    </Card>
  );

  const renderSettlement = ({ item }: { item: SettlementRequest }) => (
    <Card style={styles.settlementCard}>
        <View style={styles.settlementHeaderRow}>
          <Text style={styles.settlementAmount}>
            {formatCurrency(item.amount)}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: STATUS_COLOR[item.status] },
            ]}
          >
            <Text style={styles.statusText}>{STATUS_LABEL[item.status]}</Text>
          </View>
        </View>
        <View style={styles.settlementMetaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar" size={14} color="#6B7280" />
            <Text style={styles.metaText}> {item.requestedDate}</Text>
          </View>
          {item.processedDate ? (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color="#6B7280" />
              <Text style={styles.metaText}> {item.processedDate}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="card-outline" size={14} color={COLORS.primary} />
          <Text style={[styles.metaText, { color: COLORS.primary }]}>
            {" "}
            {item.bankAccount}
          </Text>
        </View>
      </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>كشف الحساب</Text>
        <Text style={styles.headerSubtitle}>
          نظرة عامة على الرصيد والمعاملات
        </Text>
      </LinearGradient>

      {/* Balance Card */}
      <Card style={styles.balanceCard}>
        <LinearGradient
          colors={[COLORS.primary + "E6", COLORS.primary + "99"]}
          style={styles.gradientBar}
        />
        <View style={styles.balanceHeaderRow}>
          <View style={styles.rowCenter}>
            <Ionicons name="wallet-outline" size={22} color={COLORS.primary} />
            <Text style={styles.balanceTitle}>الرصيد المتاح</Text>
          </View>
          <TouchableOpacity
            style={styles.primaryPill}
            onPress={() => setShowSettlementModal(true)}
          >
            <Ionicons name="cash-outline" size={16} color="#FFFFFF" />
            <Text style={styles.primaryPillText}>طلب تصفية</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.balanceAmount}>
          {formatCurrency(currentBalance)}
        </Text>
        <Text style={styles.balanceHint}>آخر تحديث: اليوم</Text>

        <View style={styles.quickStatsRow}>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatLabel}>طلبات معلّقة</Text>
            <Text style={styles.quickStatValue}>
              {formatCurrency(totals.pending)}
            </Text>
          </View>
          <View style={[styles.quickStat, styles.quickDivider]}>
            <Text style={styles.quickStatLabel}>آخر تحويل</Text>
            <Text style={styles.quickStatValue}>
              {totals.lastCompleted
                ? formatCurrency(totals.lastCompleted.amount)
                : "—"}
            </Text>
          </View>
        </View>
      </Card>

      {/* Sales Section */}
      <View style={styles.sectionWrap}>
        <Text style={styles.sectionTitle}>كشف المبيعات</Text>
        <FlatList
          data={salesHistory}
          keyExtractor={(item) => item.id}
          renderItem={renderSale}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>لا توجد بيانات مبيعات.</Text>
          }
        />
      </View>

      {/* Settlement Section */}
      <View style={styles.sectionWrap}>
        <Text style={styles.sectionTitle}>سجل طلبات التصفية</Text>
        <FlatList
          data={settlementRequests}
          keyExtractor={(item) => item.id}
          renderItem={renderSettlement}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>لا توجد طلبات بعد.</Text>
          }
        />
      </View>

      {/* Create Settlement Modal */}
      <Modal
        visible={showSettlementModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSettlementModal(false)}
      >
        <View style={styles.modalContainer}>
          <Card style={styles.modalCard}>
            <Text style={styles.modalHeader}>طلب تصفية حساب</Text>
            <Text style={styles.modalSubtitle}>
              الرصيد المتاح: {formatCurrency(currentBalance)}
            </Text>
            
            {/* Settlement Type Options */}
            <View style={styles.settlementTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.settlementTypeOption,
                  settlementType === 'full' && styles.settlementTypeSelected
                ]}
                onPress={() => setSettlementType('full')}
              >
                <Ionicons 
                  name="wallet-outline" 
                  size={20} 
                  color={settlementType === 'full' ? '#FFFFFF' : COLORS.primary} 
                />
                <Text style={[
                  styles.settlementTypeText,
                  settlementType === 'full' && styles.settlementTypeTextSelected
                ]}>
                  المبلغ كاملاً
                </Text>
                <Text style={[
                  styles.settlementTypeAmount,
                  settlementType === 'full' && styles.settlementTypeAmountSelected
                ]}>
                  {formatCurrency(currentBalance)}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.settlementTypeOption,
                  settlementType === 'custom' && styles.settlementTypeSelected
                ]}
                onPress={() => setSettlementType('custom')}
              >
                <Ionicons 
                  name="calculator-outline" 
                  size={20} 
                  color={settlementType === 'custom' ? '#FFFFFF' : COLORS.primary} 
                />
                <Text style={[
                  styles.settlementTypeText,
                  settlementType === 'custom' && styles.settlementTypeTextSelected
                ]}>
                  مبلغ محدد
                </Text>
                <Text style={[
                  styles.settlementTypeAmount,
                  settlementType === 'custom' && styles.settlementTypeAmountSelected
                ]}>
                  أدخل المبلغ
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Custom Amount Input */}
            {settlementType === 'custom' && (
              <View style={styles.customAmountContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="أدخل المبلغ المطلوب"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={settlementAmount}
                  onChangeText={setSettlementAmount}
                />
                <Text style={styles.minAmountText}>
                  أقل مبلغ للسحب: 30,000 ريال يمني
                </Text>
              </View>
            )}
            
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.btnGhost]}
                onPress={() => {
                  setShowSettlementModal(false);
                  setSettlementAmount("");
                  setSettlementType('custom');
                }}
              >
                <Text style={styles.btnGhostText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.btnPrimary]}
                onPress={handleSettlementRequest}
              >
                <Text style={styles.btnPrimaryText}>إرسال الطلب</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      </Modal>


      {/* Error Modal */}
      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.errorModalCard}>
            <View style={styles.errorIconContainer}>
              <Ionicons name="alert-circle" size={48} color="#EF4444" />
            </View>
            <Text style={styles.errorModalTitle}>تنبيه</Text>
            <Text style={styles.errorModalMessage}>{errorMessage}</Text>
            <TouchableOpacity
              style={styles.errorModalButton}
              onPress={() => setShowErrorModal(false)}
            >
              <Text style={styles.errorModalButtonText}>حسناً</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.successModalCard}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={48} color="#10B981" />
            </View>
            <Text style={styles.successModalTitle}>تم إرسال الطلب</Text>
            <Text style={styles.successModalMessage}>
              طلبك قيد المراجعة، سنرد عليك في أقرب وقت ممكن
            </Text>
            <TouchableOpacity
              style={styles.successModalButton}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.successModalButtonText}>حسناً</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA", direction: "rtl" },

  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: 28,
    color: 'white',
    marginBottom: 4,
    textAlign: 'center',
    fontFamily: 'Cairo-Bold',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Cairo-Regular',
    textAlign: 'center',
  },

  balanceCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    overflow: "hidden",
  },
  gradientBar: { position: "absolute", top: 0, left: 0, right: 0, height: 4 },
  balanceHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  rowCenter: { flexDirection: "row", alignItems: "center" },
  balanceTitle: {
    fontSize: 16,
    color: COLORS.primary,
    marginHorizontal: 8,
    fontFamily: "Cairo-SemiBold",
  },
  primaryPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  primaryPillText: {
    color: "#FFFFFF",
    fontFamily: "Cairo-Bold",
    fontSize: 13,
    marginHorizontal: 6,
  },
  balanceAmount: {
    fontSize: 28,
    fontFamily: "Cairo-Bold",
    color: COLORS.primary,
    textAlign: "center",
  },
  balanceHint: {
    marginTop: 4,
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    fontFamily: "Cairo-Regular",
  },
  quickStatsRow: {
    flexDirection: "row",
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  quickStat: { flex: 1, paddingVertical: 12, alignItems: "center" },
  quickDivider: { borderLeftWidth: 1, borderLeftColor: "#F3F4F6" },
  quickStatLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "Cairo-Regular",
  },
  quickStatValue: {
    marginTop: 4,
    fontSize: 16,
    color: COLORS.primary,
    fontFamily: "Cairo-Bold",
  },

  sectionWrap: { marginHorizontal: 16, marginTop: 8 },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Cairo-SemiBold",
    color: COLORS.primary,
    marginBottom: 12,
  },

  // Sales
  saleCard: {
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    padding: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  saleHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderId: {
    fontSize: 14,
    color: COLORS.primary,
    fontFamily: "Cairo-SemiBold",
  },
  saleDate: { fontSize: 12, color: "#6B7280", fontFamily: "Cairo-Regular" },
  customerName: {
    marginTop: 6,
    fontSize: 14,
    color: "#111827",
    fontFamily: "Cairo-Medium",
  },
  saleAmountsRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  amountText: { fontSize: 13, color: "#111827", fontFamily: "Cairo-Regular" },
  amountStrong: { fontFamily: "Cairo-Bold", color: COLORS.primary },
  commissionText: {
    fontSize: 12,
    color: "#EF4444",
    fontFamily: "Cairo-SemiBold",
  },
  netPill: {
    marginTop: 10,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  netText: {
    marginHorizontal: 6,
    fontSize: 12,
    color: "#065F46",
    fontFamily: "Cairo-SemiBold",
  },

  // Settlements
  settlementPressable: { borderRadius: 14 },
  settlementCard: {
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    padding: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  settlementHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settlementAmount: {
    fontSize: 16,
    color: "#111827",
    fontFamily: "Cairo-Bold",
  },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  statusText: { color: "#FFFFFF", fontSize: 12, fontFamily: "Cairo-Bold" },
  settlementMetaRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaItem: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  metaText: { fontSize: 12, color: "#6B7280", fontFamily: "Cairo-Regular" },

  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    fontFamily: "Cairo-Regular",
    paddingVertical: 12,
  },

  // Modals
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  modalHeader: {
    fontSize: 18,
    fontFamily: "Cairo-Bold",
    color: COLORS.primary,
    textAlign: "center",
  },
  modalSubtitle: {
    marginTop: 6,
    marginBottom: 12,
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    fontFamily: "Cairo-Regular",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    fontFamily: "Cairo-Regular",
  },
  modalButtonsRow: { flexDirection: "row", marginTop: 12 },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  btnPrimary: { backgroundColor: COLORS.primary },
  btnPrimaryText: { color: "#FFFFFF", fontSize: 15, fontFamily: "Cairo-Bold" },
  btnGhost: { backgroundColor: "#F3F4F6" },
  btnGhostText: { color: "#111827", fontSize: 15, fontFamily: "Cairo-Bold" },

  statusRowBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 8,
  },
  statusBtnText: {
    color: "#FFFFFF",
    fontFamily: "Cairo-Bold",
    fontSize: 15,
    marginHorizontal: 6,
  },
  
  // Settlement Type Styles
  settlementTypeContainer: {
    marginVertical: 16,
  },
  settlementTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  settlementTypeSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  settlementTypeText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Cairo-SemiBold',
    color: '#111827',
    marginHorizontal: 12,
  },
  settlementTypeTextSelected: {
    color: '#FFFFFF',
  },
  settlementTypeAmount: {
    fontSize: 14,
    fontFamily: 'Cairo-Regular',
    color: '#6B7280',
  },
  settlementTypeAmountSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  customAmountContainer: {
    marginBottom: 16,
  },
  minAmountText: {
    fontSize: 12,
    color: '#EF4444',
    fontFamily: 'Cairo-Regular',
    textAlign: 'center',
    marginTop: 8,
  },
  
  // Error Modal Styles
  errorModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    maxWidth: 320,
    width: '100%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorModalTitle: {
    fontSize: 20,
    fontFamily: 'Cairo-Bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorModalMessage: {
    fontSize: 16,
    fontFamily: 'Cairo-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  errorModalButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 120,
  },
  errorModalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Cairo-Bold',
    textAlign: 'center',
  },
  
  // Success Modal Styles
  successModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    maxWidth: 320,
    width: '100%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successModalTitle: {
    fontSize: 20,
    fontFamily: 'Cairo-Bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  successModalMessage: {
    fontSize: 16,
    fontFamily: 'Cairo-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  successModalButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 120,
  },
  successModalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Cairo-Bold',
    textAlign: 'center',
  },
});

export default VendorAccountStatementScreen;
