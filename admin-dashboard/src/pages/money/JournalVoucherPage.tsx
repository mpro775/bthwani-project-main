import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Form,
  Input,
  DatePicker,
  Button,
  Select,
  Checkbox,
  Row,
  Col,
  Table,
  InputNumber,
  Card,
  Divider,
  Typography,
  Space,
  Modal,
  message,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  SaveOutlined,
  PrinterOutlined,
  SendOutlined,
  UndoOutlined,
  FileAddOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";
import { Tag } from "antd";
import { useReactToPrint } from "react-to-print";
import PrintableVoucher from "./PrintableVoucher";
// ========== إعداد API ==========
const API_BASE = "http://localhost:3000/api/v1";
const http = axios.create({ baseURL: API_BASE });

// ========== Types (UI) ==========
const { Title } = Typography;
const LOCAL_CURRENCY = "YER";

export interface JournalLine {
  key?: string;
  accountId?: string; // 👈 مخفي للباك-إند
  accountNo: string; // code
  name: string; // account name
  desc?: string;
  debit: number;
  credit: number;
  currency: string;
  rate: number;
}

export interface JournalVoucher {
  voucherNo?: string;
  date: string;
  generalDesc: string;
  branchNo: string;
  voucherType: string;
  isPosted: boolean;
  lines: JournalLine[];
}

export interface ChartAccount {
  _id: string;
  code: string;
  name: string;
  isActive: boolean;
  parent?: string | null;
}

// ========== Helpers: map UI <-> Backend ==========
/** Backend Entry line (as saved) */
type BE_Line = {
  account: string; // ObjectId
  name?: string; // اختياري نحتفظ به للعرض السريع
  desc?: string;
  debit: number;
  credit: number;
  currency?: string;
  rate?: number;
};
/** Backend Entry */
type BE_Entry = {
  voucherNo: string;
  date: string;
  description?: string;
  reference?: string;
  branchNo?: string;
  voucherType?: string;
  isPosted: boolean;
  lines: BE_Line[];
};

function uiToBackend(
  values: JournalVoucher
): Omit<BE_Entry, "voucherNo" | "isPosted"> {
  return {
    date: values.date,
    description: values.generalDesc,
    reference: values.voucherNo,
    branchNo: values.branchNo,
    voucherType: values.voucherType || "journal",
    lines: (values.lines || []).map((l) => ({
      account: l.accountId!, // ✅ مهم
      name: l.name,
      desc: l.desc?.trim() || values.generalDesc || "",
      debit: l.debit || 0,
      credit: l.credit || 0,
      currency: l.currency || LOCAL_CURRENCY,
      rate: l.rate || 1,
    })),
  };
}

async function apiGetNextNo() {
  const { data } = await http.get<{ voucherNo: string }>("/entries/next-no");
  return data.voucherNo;
}
function backendToUI(entry: BE_Entry): JournalVoucher {
  return {
    voucherNo: entry.voucherNo,
    date: entry.date,
    generalDesc: entry.description || "",
    branchNo: entry.branchNo || "",
    voucherType: entry.voucherType || "journal",
    isPosted: !!entry.isPosted,
    lines: (entry.lines || []).map((l, i) => ({
      key: String(i + 1),
      accountId: l.account,
      accountNo: "", // لا يرجع من الباك-إند؛ يمكن ملؤه لاحقًا لو أردت
      name: l.name || "",
      desc: l.desc,
      debit: l.debit || 0,
      credit: l.credit || 0,
      currency: l.currency || LOCAL_CURRENCY,
      rate: l.rate || 1,
    })),
  };
}

// ========== API calls ==========
async function apiSearchAccounts(query: string) {
  const { data } = await http.get<ChartAccount[]>("/accounts", {
    params: { query, onlyLeaf: 1, limit: 30 },
  });
  return data;
}
async function apiListEntries(search: string) {
  const { data } = await http.get<BE_Entry[]>("/entries", {
    params: { search },
  });
  return data;
}

async function apiCreateEntry(
  payload: Omit<BE_Entry, "voucherNo" | "isPosted">
) {
  const { data } = await http.post<BE_Entry>("/entries", payload);
  return data;
}
async function apiUpdateEntry(
  voucherNo: string,
  payload: Omit<BE_Entry, "voucherNo" | "isPosted">
) {
  const { data } = await http.put<BE_Entry>(`/entries/${voucherNo}`, payload);
  return data;
}
async function apiPostEntry(voucherNo: string) {
  const { data } = await http.post<BE_Entry>(`/entries/${voucherNo}/post`, {});
  return data;
}

// ========== خيارات ثابتة ==========
const branchOptions = [
  { value: "1", label: "صنعاء" },
  { value: "2", label: "عدن" },
];
const voucherTypes = [{ value: "journal", label: "قيد يومية" }];
const currencyOptions = [
  { value: "YER", label: "ريال يمني" },
  { value: "USD", label: "دولار أمريكي" },
  { value: "SAR", label: "ريال سعودي" },
];

// ========== مودال البحث عن قيد ==========
interface SearchVoucherModalProps {
  visible: boolean;
  onSelect: (record: JournalVoucher) => void;
  onCancel: () => void;
}
const SearchVoucherModal: React.FC<SearchVoucherModalProps> = ({
  visible,
  onSelect,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<BE_Entry[]>([]);
  const [q, setQ] = useState("");

  const columns = [
    { title: "رقم القيد", dataIndex: "voucherNo", key: "voucherNo" },
    {
      title: "التاريخ",
      dataIndex: "date",
      key: "date",
      render: (d: string) => dayjs(d).format("YYYY-MM-DD"),
    },
    { title: "البيان", dataIndex: "description", key: "description" },
    {
      title: "إجراء",
      key: "action",
      render: (_: unknown, rec: BE_Entry) => (
        <Button size="small" onClick={() => onSelect(backendToUI(rec))}>
          اختيار
        </Button>
      ),
    },
  ];

  const doSearch = async () => {
    setLoading(true);
    try {
      const data = await apiListEntries(q);
      setRows(data);
    } catch (e: unknown) {
      message.error(e instanceof Error ? e.message : "تعذر جلب القيود");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) doSearch(); /* أول فتح */
  });

  return (
    <Modal
      title="بحث عن قيد يومية"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={900}
    >
      <Space style={{ marginBottom: 12 }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="ابحث برقم القيد/البيان/المرجع"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onPressEnter={doSearch}
          allowClear
          style={{ width: 360 }}
        />
        <Button onClick={doSearch}>بحث</Button>
      </Space>
      <Table
        dataSource={rows}
        columns={columns}
        rowKey="voucherNo"
        size="small"
        loading={loading}
        onRow={(rec) => ({
          onDoubleClick: () => onSelect(backendToUI(rec)), // 👈 دبل-كليك = اختيار
        })}
      />
    </Modal>
  );
};

// ========== مودال البحث عن حساب ==========
interface SearchAccountModalProps {
  visible: boolean;
  onSelect: (record: ChartAccount) => void;
  onCancel: () => void;
}
const SearchAccountModal: React.FC<SearchAccountModalProps> = ({
  visible,
  onSelect,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<ChartAccount[]>([]);
  const [q, setQ] = useState("");

  const columns = [
    { title: "الكود", dataIndex: "code", key: "code", width: 120 },
    { title: "اسم الحساب", dataIndex: "name", key: "name" },
    {
      title: "إجراء",
      key: "action",
      width: 100,
      render: (_: unknown, rec: ChartAccount) => (
        <Button size="small" onClick={() => onSelect(rec)}>
          اختيار
        </Button>
      ),
    },
  ];

  const doSearch = async () => {
    setLoading(true);
    try {
      const data = await apiSearchAccounts(q);
      setRows(data);
    } catch (e: unknown) {
      message.error(e instanceof Error ? e.message : "تعذر جلب الحسابات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) doSearch();
  });

  return (
    <Modal
      title="بحث عن حساب"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={700}
    >
      <Space style={{ marginBottom: 12 }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="ابحث بالكود/الاسم"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onPressEnter={doSearch}
          allowClear
          style={{ width: 320 }}
        />
        <Button onClick={doSearch}>بحث</Button>
      </Space>
      <Table
        dataSource={rows}
        columns={columns}
        rowKey="_id"
        size="small"
        loading={loading}
        onRow={(rec) => ({
          onDoubleClick: () => onSelect(rec), // 👈 دبل-كليك = اختيار
        })}
      />
    </Modal>
  );
};

// ========== الصفحة الرئيسية ==========
export default function JournalVoucherPage() {
  const [form] = Form.useForm();
  const [mode, setMode] = useState<"new" | "view" | "edit">("new");
  const [currentVoucher, setCurrentVoucher] = useState<JournalVoucher | null>(
    null
  );
  const [isVoucherSearchVisible, setVoucherSearchVisible] =
    useState<boolean>(false);
  const [isAccountSearchVisible, setAccountSearchVisible] =
    useState<boolean>(false);
  const [searchContext, setSearchContext] = useState<{
    fieldIndex: number | null;
  }>({ fieldIndex: null });
  const [modal, modalCtx] = Modal.useModal();
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Voucher-${form.getFieldValue("voucherNo") || "Draft"}`,
    pageStyle: `
          @page { size: A4; margin: 14mm; }
          @media print { .no-print { display: none !important; } }
        `,
  });
  const isReadOnly = mode === "view";
  // داخل الكومبوننت:
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return; // لتفادي التكرار في React 18 StrictMode
    didInit.current = true;
    handleAddNew();
  });
  // --- إجراءات ---
  const handleAddNew = useCallback(async () => {
    form.resetFields();
    try {
      const nextNo = await apiGetNextNo();
      form.setFieldsValue({
        voucherNo: nextNo,
        date: dayjs(),
        voucherType: "journal", // 👈
        branchNo: "1", // 👈
        lines: Array.from({ length: 5 }, () => makeEmptyLine()), // 👈 خمسة سطور
      });
    } catch (e: unknown) {
      message.warning(
        e instanceof Error ? e.message : "تعذر إحضار رقم القيد التالي"
      );
      form.setFieldsValue({
        date: dayjs(),
        voucherType: "journal", // 👈
        branchNo: "1", // 👈
        lines: Array.from({ length: 5 }, () => makeEmptyLine()), // 👈 خمسة سطور
      });
    }
    setCurrentVoucher(null);
    setMode("new");
  }, [form]);

  const handleEdit = () => {
    if (currentVoucher?.isPosted) {
      message.error("لا يمكن تعديل قيد مرحل.");
      return;
    }
    setMode("edit");
  };

  const handleCancelEdit = () => {
    if (currentVoucher) {
      form.setFieldsValue({
        ...currentVoucher,
        date: dayjs(currentVoucher.date),
      });
    }
    setMode("view");
  };

  const handlePost = useCallback(async () => {
    if (!currentVoucher?.voucherNo) {
      message.warning("لا يوجد قيد محدد.");
      return;
    }
    if (currentVoucher.isPosted) {
      message.info("القيد مرحل بالفعل.");
      return;
    }

    const ok = await new Promise<boolean>((resolve) => {
      modal.confirm({
        title: "هل أنت متأكد من ترحيل هذا القيد؟",
        content: "لا يمكن التعديل على القيد بعد الترحيل.",
        okText: "ترحيل",
        cancelText: "إلغاء",
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
    if (!ok) return;

    try {
      console.log("posting...", currentVoucher.voucherNo);
      const res = await apiPostEntry(currentVoucher.voucherNo);
      const ui = backendToUI(res);
      setCurrentVoucher(ui);
      form.setFieldsValue({ ...ui, date: dayjs(ui.date) });
      message.success("تم ترحيل القيد.");
    } catch (e: unknown) {
      message.error(e instanceof Error ? e.message : "تعذر ترحيل القيد");
    }
  }, [currentVoucher, form, modal]);

  const onFinish = async (values: JournalVoucher) => {
    // نظّف السطور
    const cleanedLines = (values.lines || []).filter(isRealLine);

    if (!cleanedLines.length) {
      message.error("لا توجد سطور صحيحة للحفظ.");
      return;
    }

    // احسب التوازن على السطور المنظّفة فقط
    const total = cleanedLines.reduce(
      (acc, line) => {
        const rate = line?.rate || 1;
        acc.debit += (line?.debit || 0) * rate;
        acc.credit += (line?.credit || 0) * rate;
        return acc;
      },
      { debit: 0, credit: 0 }
    );
    if (Math.abs(total.debit - total.credit) > 0.01) {
      message.error(
        `القيد غير متوازن! فرق: ${(total.debit - total.credit).toFixed(2)}`
      );
      return;
    }

    const payload = uiToBackend({
      ...values,
      lines: cleanedLines, // 👈 المهم
      date:
        typeof values.date === "string"
          ? values.date
          : (values.date as Date)?.toISOString?.() || new Date().toISOString(),
    });

    try {
      if (mode === "new") {
        const created = await apiCreateEntry(payload);
        const ui = backendToUI(created);
        const uiPadded = {
          ...ui,
          date: dayjs(ui.date),
          lines: padLines(ui.lines, 5),
        }; // نعرض 5 سطور بعد الحفظ
        setCurrentVoucher(ui);
        form.setFieldsValue(uiPadded);
        setMode("view");
        message.success("تم حفظ القيد الجديد.");
      } else if (mode === "edit" && currentVoucher?.voucherNo) {
        const updated = await apiUpdateEntry(currentVoucher.voucherNo, payload);
        const ui = backendToUI(updated);
        const uiPadded = {
          ...ui,
          date: dayjs(ui.date),
          lines: padLines(ui.lines, 5),
        };
        setCurrentVoucher(ui);
        form.setFieldsValue(uiPadded);
        setMode("view");
        message.success("تم حفظ التعديلات.");
      }
    } catch (e: unknown) {
      message.error(e instanceof Error ? e.message : "تعذر حفظ القيد");
    }
  };

  // --- البحث ---
  const handleVoucherSearch = () => setVoucherSearchVisible(true);
  const handleVoucherSelect = (voucher: JournalVoucher) => {
    setCurrentVoucher(voucher);
    form.setFieldsValue({ ...voucher, date: dayjs(voucher.date) });
    setMode("view");
    setVoucherSearchVisible(false);
  };

  const handleAccountSearch = (fieldIndex: number) => {
    setSearchContext({ fieldIndex });
    setAccountSearchVisible(true);
  };
  const handleAccountSelect = (acc: ChartAccount) => {
    const { fieldIndex } = searchContext;
    const lines = form.getFieldValue("lines") || [];
    if (fieldIndex !== null) {
      lines[fieldIndex] = {
        ...lines[fieldIndex],
        accountId: acc._id, // 👈 مهم للباك-إند
        accountNo: acc.code,
        name: acc.name,
        // currency و rate كما هي
      };
      form.setFieldsValue({ lines });
      setAccountSearchVisible(false);
    }
  };
  const linesWatch = Form.useWatch("lines", form);

  const isRealLine = (l: {
    debit: number;
    credit: number;
    currency: string;
    rate: number;
    accountId?: string;
  }) => {
    const debit = Number(l?.debit || 0);
    const credit = Number(l?.credit || 0);
    const hasAmount = debit > 0 || credit > 0;
    const hasAccount = !!l?.accountId;
    return hasAmount && hasAccount;
  };
  const { totalDebit, totalCredit, diff, balanced } = React.useMemo(() => {
    const cleaned = (linesWatch || []).filter(isRealLine);
    const sum = cleaned.reduce(
      (
        acc: { debit: number; credit: number },
        l: { rate?: number; debit?: number; credit?: number }
      ) => {
        const rate = Number(l?.rate || 1);
        acc.debit += Number(l?.debit || 0) * rate;
        acc.credit += Number(l?.credit || 0) * rate;
        return acc;
      },
      { debit: 0, credit: 0 }
    );
    const d = +(sum.debit - sum.credit).toFixed(2);
    const ok = Math.abs(d) <= 0.01 && sum.debit > 0; // متوازن وبقيمة > 0
    return {
      totalDebit: sum.debit,
      totalCredit: sum.credit,
      diff: d,
      balanced: ok,
    };
  }, [linesWatch]);
  const makeEmptyLine = () => ({
    debit: 0,
    credit: 0,
    currency: LOCAL_CURRENCY,
    rate: 1,
  });
  const padLines = (
    arr: {
      debit: number;
      credit: number;
      currency: string;
      rate: number;
    }[],
    n = 5
  ) =>
    arr.concat(
      Array.from({ length: Math.max(0, n - arr.length) }, makeEmptyLine)
    );

  // ========== UI ==========
  return (
    <>
      {modalCtx}

      <Card>
        <Title level={4}>
          {mode === "new" && "إنشاء قيد يومية جديد"}
          {mode === "view" &&
            `عرض قيد اليومية: ${currentVoucher?.voucherNo || ""}`}
          {mode === "edit" &&
            `تعديل قيد اليومية: ${currentVoucher?.voucherNo || ""}`}
        </Title>
        <Row justify="end">
          <Col>
            {mode === "new" && (
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  form="voucherForm"
                  icon={<SaveOutlined />}
                  disabled={!balanced}
                >
                  حفظ القيد
                </Button>
              </Space>
            )}
            {mode === "edit" && (
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  disabled={!balanced}
                >
                  حفظ التعديلات
                </Button>
                <Button onClick={handleCancelEdit} icon={<UndoOutlined />}>
                  إلغاء التعديل
                </Button>
              </Space>
            )}

            {mode === "view" && (
              <Space>
                <Button onClick={handleAddNew} icon={<FileAddOutlined />}>
                  إضافة جديد
                </Button>
                <Button
                  type="primary"
                  onClick={handleEdit}
                  icon={<EditOutlined />}
                  disabled={currentVoucher?.isPosted}
                >
                  تعديل
                </Button>
                <Button
                  onClick={handlePost}
                  icon={<SendOutlined />}
                  disabled={!currentVoucher || currentVoucher.isPosted}
                >
                  ترحيل
                </Button>
                <Button
                  onClick={handlePrint}
                  icon={<PrinterOutlined />}
                  disabled={!currentVoucher}
                >
                  طباعة
                </Button>
              </Space>
            )}
            {mode === "edit" && (
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                >
                  حفظ التعديلات
                </Button>
                <Button onClick={handleCancelEdit} icon={<UndoOutlined />}>
                  إلغاء التعديل
                </Button>
              </Space>
            )}
          </Col>
        </Row>

        <Divider />

        <Form
          form={form}
          layout="vertical"
          id="voucherForm"
          onFinish={onFinish}
          disabled={isReadOnly}
          initialValues={{
            date: dayjs(), // اليوم افتراضي
            voucherType: "journal", // 👈 افتراضي
            branchNo: "1", // 👈 صنعاء
            lines: Array.from({ length: 5 }, () => makeEmptyLine()), // 👈 خمسة سطور
          }}
        >
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="رقم القيد" name="voucherNo">
                <Input
                  placeholder="اضغط F9 للبحث"
                  onKeyDown={(e) => e.key === "F9" && handleVoucherSearch()}
                  readOnly
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="الفرع"
                name="branchNo"
                rules={[{ required: true }]}
              >
                <Select options={branchOptions} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="نوع الوثيقة"
                name="voucherType"
                rules={[{ required: true }]}
              >
                <Select options={voucherTypes} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="تاريخ القيد"
                name="date"
                rules={[{ required: true }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={18}>
              <Form.Item
                label="البيان العام"
                name="generalDesc"
                rules={[{ required: true }]}
              >
                <Input.TextArea rows={1} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="isPosted" valuePropName="checked">
                <Checkbox disabled>مرحل</Checkbox>
              </Form.Item>
            </Col>
          </Row>

          <Divider>تفاصيل القيد</Divider>

          <Form.List name="lines">
            {(fields, { add, remove }) => (
              <>
                <Table
                  bordered
                  dataSource={fields}
                  pagination={false}
                  rowKey="key"
                  size="small"
                  columns={[
                    {
                      title: "رقم الحساب",
                      width: 120,
                      render: (_, { name }) => (
                        <>
                          {/* accountId مخفي */}
                          <Form.Item name={[name, "accountId"]} noStyle>
                            <Input type="hidden" />
                          </Form.Item>
                          <Form.Item name={[name, "accountNo"]} noStyle>
                            <Input
                              placeholder="F9"
                              onKeyDown={(e) =>
                                e.key === "F9" && handleAccountSearch(name)
                              }
                              onDoubleClick={() => handleAccountSearch(name)} // 👈 هنا
                            />
                          </Form.Item>
                        </>
                      ),
                    },
                    {
                      title: "الاسم",
                      render: (_, { name }) => (
                        <Form.Item name={[name, "name"]} noStyle>
                          <Input
                            placeholder="F9"
                            onKeyDown={(e) =>
                              e.key === "F9" && handleAccountSearch(name)
                            }
                            onDoubleClick={() => handleAccountSearch(name)} // 👈 وهنا
                          />
                        </Form.Item>
                      ),
                    },
                    {
                      title: "العملة",
                      width: 120,
                      render: (_, { name }) => (
                        <Form.Item name={[name, "currency"]} noStyle>
                          <Select options={currencyOptions} />
                        </Form.Item>
                      ),
                    },
                    {
                      title: "سعر الصرف",
                      width: 100,
                      render: (_, { name }) => (
                        <Form.Item name={[name, "rate"]} noStyle>
                          <InputNumber style={{ width: "100%" }} min={1} />
                        </Form.Item>
                      ),
                    },
                    {
                      title: "مدين",
                      width: 120,
                      render: (_, { name }) => (
                        <Form.Item name={[name, "debit"]} noStyle>
                          <InputNumber
                            style={{ width: "100%" }}
                            min={0}
                            formatter={(val) =>
                              `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            parser={(v: string | undefined) =>
                              +(v ?? "").replace(/[^\d.-]/g, "") || 0
                            }
                          />
                        </Form.Item>
                      ),
                    },
                    {
                      title: "دائن",
                      width: 120,
                      render: (_, { name }) => (
                        <Form.Item name={[name, "credit"]} noStyle>
                          <InputNumber
                            style={{ width: "100%" }}
                            min={0}
                            formatter={(val) =>
                              `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            parser={(v: string | undefined) =>
                              +(v ?? "").replace(/[^\d.-]/g, "") || 0
                            }
                          />
                        </Form.Item>
                      ),
                    },
                    {
                      title: `مدين (${LOCAL_CURRENCY})`,
                      width: 120,
                      render: (_, { name }) => (
                        <Form.Item
                          shouldUpdate={(p, c) =>
                            p.lines?.[name] !== c.lines?.[name]
                          }
                          noStyle
                        >
                          {({ getFieldValue }) => {
                            const line = getFieldValue(["lines", name]);
                            if (!line || line.currency === LOCAL_CURRENCY)
                              return null;
                            const localAmount =
                              (line.debit || 0) * (line.rate || 1);
                            return (
                              <InputNumber
                                style={{
                                  width: "100%",
                                  backgroundColor: "#f0f2f5",
                                }}
                                value={localAmount}
                                readOnly
                                formatter={(val) =>
                                  `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                }
                              />
                            );
                          }}
                        </Form.Item>
                      ),
                    },
                    {
                      title: `دائن (${LOCAL_CURRENCY})`,
                      width: 120,
                      render: (_, { name }) => (
                        <Form.Item
                          shouldUpdate={(p, c) =>
                            p.lines?.[name] !== c.lines?.[name]
                          }
                          noStyle
                        >
                          {({ getFieldValue }) => {
                            const line = getFieldValue(["lines", name]);
                            if (!line || line.currency === LOCAL_CURRENCY)
                              return null;
                            const localAmount =
                              (line.credit || 0) * (line.rate || 1);
                            return (
                              <InputNumber
                                style={{
                                  width: "100%",
                                  backgroundColor: "#f0f2f5",
                                }}
                                value={localAmount}
                                readOnly
                                formatter={(val) =>
                                  `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                }
                              />
                            );
                          }}
                        </Form.Item>
                      ),
                    },
                    {
                      title: "بيان البند",
                      width: 220,
                      render: (_, { name }) => (
                        <Form.Item name={[name, "desc"]} noStyle>
                          <Input placeholder="اتركه فارغًا لاستخدام البيان العام" />
                        </Form.Item>
                      ),
                    },

                    {
                      title: "إجراء",
                      width: 80,
                      align: "center",
                      render: (_, { name }) =>
                        !isReadOnly && fields.length > 1 ? (
                          <Button
                            icon={<DeleteOutlined />}
                            danger
                            onClick={() => remove(name)}
                          />
                        ) : null,
                    },
                  ]}
                />
                {!isReadOnly && (
                  <Button
                    type="dashed"
                    onClick={() =>
                      add({
                        debit: 0,
                        credit: 0,
                        currency: LOCAL_CURRENCY,
                        rate: 1,
                      })
                    }
                    block
                    icon={<PlusOutlined />}
                    style={{ marginTop: 16 }}
                  >
                    إضافة سطر جديد
                  </Button>
                )}
              </>
            )}
          </Form.List>

          <Divider />
        </Form>
        <Divider />
        <Row align="middle" justify="space-between">
          <Space size="large">
            <span>
              <b>المجموع (محلي):</b>
            </span>
            <span>مدين: {totalDebit.toLocaleString()}</span>
            <span>دائن: {totalCredit.toLocaleString()}</span>
            <span>الفرق: {diff.toLocaleString()}</span>
          </Space>
          <Tag color={balanced ? "green" : "red"}>
            {balanced ? "متوازن" : "غير متوازن"}
          </Tag>
        </Row>
      </Card>
      {/* خارج الشاشة، للطباعة فقط */}
      <div style={{ position: "absolute", left: -99999, top: -99999 }}>
        <PrintableVoucher
          ref={printRef}
          companyName="اسم الشركة"
          voucherNo={form.getFieldValue("voucherNo")}
          date={
            form.getFieldValue("date")?.toISOString?.() ||
            form.getFieldValue("date")
          }
          branchName={
            branchOptions.find(
              (b) => b.value === form.getFieldValue("branchNo")
            )?.label
          }
          voucherTypeLabel={
            voucherTypes.find(
              (v) => v.value === form.getFieldValue("voucherType")
            )?.label || "قيد يومية"
          }
          isPosted={!!form.getFieldValue("isPosted")}
          generalDesc={form.getFieldValue("generalDesc")}
          lines={form.getFieldValue("lines") || []}
          localCurrency={LOCAL_CURRENCY}
        />
      </div>

      <SearchVoucherModal
        visible={isVoucherSearchVisible}
        onSelect={handleVoucherSelect}
        onCancel={() => setVoucherSearchVisible(false)}
      />
      <SearchAccountModal
        visible={isAccountSearchVisible}
        onSelect={handleAccountSelect}
        onCancel={() => setAccountSearchVisible(false)}
      />
    </>
  );
}
