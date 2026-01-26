// src/pages/GeneralLedger.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Table, Select, DatePicker, Button, message, Checkbox } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import axios from "axios";
import { PrinterOutlined } from "@ant-design/icons";
import { useReactToPrint } from "react-to-print";
import PrintableLedger from "./PrintableLedger";
import OpeningBalanceModal from "./OpeningBalanceModal";

const { RangePicker } = DatePicker;
const http = axios.create({ baseURL: "http://localhost:3000/api/v1" });

interface Account {
  _id: string;
  code: string;
  name: string;
  parent?: string | null;
}
interface JournalEntry {
  _id: string;
  date: string;
  description: string;
  reference: string;
  debit: number;
  credit: number;
  accountId: string;
  voucherNo?: string;
  accountCode?: string;
  accountName?: string; // لو رجّعهم الباك-إند
  __balance?: number; // الرصيد التراكمي
  __rowKey?: string; // مفتاح الصف الفريد
}

export default function GeneralLedger() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [includeDesc, setIncludeDesc] = useState(true);
  const [obOpen, setObOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [voucherType, setVoucherType] = useState<string | undefined>(undefined);
  const [dates, setDates] = useState<[Dayjs | null, Dayjs | null]>([
    null,
    null,
  ]);
  const [openingBalance, setOpeningBalance] = useState(0);

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const { pageDebit, pageCredit, pageDiff } = useMemo(() => {
    const d = entries.reduce((s, e) => s + (e.debit || 0), 0);
    const c = entries.reduce((s, e) => s + (e.credit || 0), 0);
    return { pageDebit: d, pageCredit: c, pageDiff: d - c };
  }, [entries]);
  const printRef = useRef<HTMLDivElement>(null);

  const accountLabel =
    selectedAccount === "ALL"
      ? "الكل (كل الحسابات)"
      : accounts.find((a) => a._id === selectedAccount)?.name || "";

  const dateRange =
    dates[0] || dates[1]
      ? `من ${dates[0]?.format("YYYY-MM-DD") || "…"} إلى ${
          dates[1]?.format("YYYY-MM-DD") || "…"
        }`
      : "";

  // 1) جلب الحسابات مرة + اختيار افتراضي ("ALL" أو آخر حساب)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingAccounts(true);
        const { data } = await http.get("/accounts", {
          params: { onlyLeaf: 1, limit: 1000 },
        });
        const list: Account[] = Array.isArray(data) ? data : data?.data ?? [];
        if (cancelled) return;
        setAccounts(list);
        const last = localStorage.getItem("gl.selectedAccount");
        const def = last && list.find((a) => a._id === last) ? last : "ALL"; // 👈 افتراضي الكل
        setSelectedAccount(def);
      } catch (e: unknown) {
        if (!cancelled)
          message.error(
            (e as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "تعذر جلب الحسابات"
          );
      } finally {
        if (!cancelled) setLoadingAccounts(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (selectedAccount)
      localStorage.setItem("gl.selectedAccount", selectedAccount);
  }, [selectedAccount]);
  const enriched = useMemo(() => {
    const chron = [...entries].sort(
      (a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime() ||
        (a.voucherNo || "").localeCompare(b.voucherNo || "") ||
        a._id.localeCompare(b._id)
    );

    // حالة حساب واحد (حتى لو شامل التفرعات)
    if (selectedAccount && selectedAccount !== "ALL") {
      let run = openingBalance;
      return chron.map((e, i) => {
        run += Number(e.debit || 0) - Number(e.credit || 0);
        return { ...e, __balance: run, __rowKey: `${e._id}-${i}` };
      });
    }

    // حالة ALL: رصيد تراكمي لكل حساب مستقل
    const runByAcc: Record<string, number> = {};
    return chron.map((e, i) => {
      const k = e.accountId;
      const next =
        (runByAcc[k] ?? 0) + Number(e.debit || 0) - Number(e.credit || 0);
      runByAcc[k] = next;
      return { ...e, __balance: next, __rowKey: `${e._id}-${k}-${i}` };
    });
  }, [entries, selectedAccount, openingBalance]);

  // 2) اعرضه بالأحدث أولًا لو تحب
  const dataForTable = useMemo(() => {
    return [...enriched].sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime() ||
        (b.voucherNo || "").localeCompare(a.voucherNo || "") ||
        b._id.localeCompare(a._id)
    );
  }, [enriched]);

  // 2) خيارات السلكت (مع خيار "الكل")
  const accountOptions = useMemo(
    () => [
      { value: "ALL", label: "الكل (كل الحسابات)" },
      ...(accounts ?? []).map((a) => ({
        value: a._id,
        label: `${a.code} - ${a.name}`,
      })),
    ],
    [accounts]
  );

  const fetchOpeningBalance = useCallback(async () => {
    if (!selectedAccount || selectedAccount === "ALL") {
      setOpeningBalance(0);
      return;
    }

    // حدد السنة من الفلاتر: لو فيه تاريخ "من" استخدم سنته، وإلا السنة الحالية
    const year = dates[0]?.year() || dayjs().year();

    try {
      const { data } = await http.get("/opening-balance", {
        params: {
          accountId: selectedAccount,
          year,
          includeDescendants: includeDesc ? 1 : 0,
        },
      });
      setOpeningBalance(Number(data?.openingBalance || 0));
    } catch {
      setOpeningBalance(0);
    }
  }, [selectedAccount, dates, includeDesc]);

  useEffect(() => {
    fetchOpeningBalance();
  }, [fetchOpeningBalance]);
  // 3) تحميل الحركات من /journals (صح)
  const loadEntries = useCallback(async () => {
    if (!selectedAccount) {
      setEntries([]);
      setTotal(0);
      return;
    }
    setLoadingEntries(true);
    try {
      const params: {
        page?: number;
        pageSize?: number;
        voucherType?: string;
        from?: string;
        to?: string;
        all?: number;
        accountId?: string;
        includeDescendants?: number;
      } = { page, pageSize };
      if (dates[0]) params.from = dates[0].format("YYYY-MM-DD");
      if (dates[1]) params.to = dates[1].format("YYYY-MM-DD");
      if (voucherType) params.voucherType = voucherType;

      if (selectedAccount === "ALL") {
        params.all = 1; // 👈 إجلب الكل
      } else {
        params.accountId = selectedAccount;
        if (includeDesc) params.includeDescendants = 1; // 👈 الحساب + أولاده
      }

      // ✅ هنا كان الخطأ: لازم نطلب /journals وليس /accounts
      const { data } = await http.get("/journals", { params });
      setEntries(Array.isArray(data?.entries) ? data.entries : []);
      setTotal(Number(data?.total ?? 0));
    } catch {
      message.error("تعذر جلب دفتر الأستاذ");
      setEntries([]);
      setTotal(0);
    } finally {
      setLoadingEntries(false);
    }
  }, [selectedAccount, dates, voucherType, includeDesc, page, pageSize]);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "الأستاذ العام (دفتر الإسناد)",
    pageStyle: `
      @page { size: A4; margin: 14mm; }
      @media print {
        .no-print { display: none !important; }
        body { -webkit-print-color-adjust: exact; }
        table { page-break-inside: auto; }
        tr { page-break-inside: avoid; }
      }
    `,
  });
  // نادِ التحميل لما تتغيّر المعايير
  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // لو تغيّر الحساب/الفلاتر → ارجع لأول صفحة
  useEffect(() => {
    setPage(1);
  }, [selectedAccount, dates, voucherType, includeDesc]);

  const pageD = dataForTable.reduce((s, r) => s + (r.debit || 0), 0);
  const pageC = dataForTable.reduce((s, r) => s + (r.credit || 0), 0);
  const pageBal =
    selectedAccount && selectedAccount !== "ALL"
      ? openingBalance + pageD - pageC
      : undefined;

  return (
    <div>
      <h2>الأستاذ العام (دفتر الإسناد)</h2>

      <div
        style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}
        className="no-print"
      >
        <Select
          showSearch
          placeholder="اختر حسابًا"
          style={{ width: 340 }}
          value={selectedAccount ?? undefined}
          onChange={setSelectedAccount}
          loading={loadingAccounts}
          options={accountOptions}
          filterOption={(input, option) =>
            (option?.label as string)
              ?.toLowerCase()
              .includes(input.toLowerCase())
          }
          allowClear
        />

        <RangePicker
          value={dates}
          onChange={(ds) => setDates(ds || [null, null])}
          allowClear
        />

        <Select
          placeholder="نوع الوثيقة"
          allowClear
          style={{ width: 180 }}
          value={voucherType}
          onChange={setVoucherType}
          options={[{ value: "journal", label: "قيد يومية" }]}
        />

        <Checkbox
          checked={includeDesc}
          onChange={(e) => setIncludeDesc(e.target.checked)}
          disabled={selectedAccount === "ALL"}
        >
          شامل التفرعات
        </Checkbox>
        <Button
          onClick={handlePrint}
          icon={<PrinterOutlined />}
          className="no-print"
        >
          طباعة
        </Button>

        <Button
          onClick={() => {
            setDates([null, null]);
            setVoucherType(undefined);
            setPage(1);
          }}
        >
          مسح الفلاتر
        </Button>
        <Button onClick={() => setObOpen(true)}>رصيد افتتاحي</Button>
      </div>

      <Table
        dataSource={dataForTable}
        loading={loadingEntries}
        rowKey={(row) => row.__rowKey || `${row._id}-${row.accountId || ""}`}
        columns={[
          {
            title: "التاريخ",
            dataIndex: "date",
            render: (d: string) => dayjs(d).format("YYYY-MM-DD"),
          },
          { title: "الوصف", dataIndex: "description" },
          { title: "مرجع", dataIndex: "reference" },
          {
            title: "الحساب",
            render: (_: unknown, r: JournalEntry) =>
              `${r.accountCode || ""} - ${r.accountName || ""}`,
          },
          {
            title: "مدين",
            dataIndex: "debit",
            render: (v: number) => v?.toLocaleString(),
          },
          {
            title: "دائن",
            dataIndex: "credit",
            render: (v: number) => v?.toLocaleString(),
          },
          {
            title: "الرصيد التراكمي",
            dataIndex: "__balance",
            render: (v: number) => v?.toLocaleString(),
          }, // ← هنا
        ]}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => `الإجمالي: ${t}`,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
        }}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0}>المجموع في الصفحة</Table.Summary.Cell>
            <Table.Summary.Cell index={1} /> {/* التاريخ */}
            <Table.Summary.Cell index={2} /> {/* الوصف */}
            <Table.Summary.Cell index={3} /> {/* المرجع/الحساب */}
            <Table.Summary.Cell index={4}>
              {pageD.toLocaleString()}
            </Table.Summary.Cell>{" "}
            {/* مدين */}
            <Table.Summary.Cell index={5}>
              {pageC.toLocaleString()}
            </Table.Summary.Cell>{" "}
            {/* دائن */}
            <Table.Summary.Cell index={6}>
              {pageBal !== undefined ? pageBal.toLocaleString() : ""}{" "}
              {/* الرصيد التراكمي */}
            </Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
      <div
        style={{
          marginTop: 12,
          display: "flex",
          gap: 24,
          justifyContent: "flex-end",
          alignItems: "center",
          fontWeight: 600,
        }}
      >
        <span>المجموع في الصفحة:</span>
        <span>مدين: {pageDebit.toLocaleString()}</span>
        <span>دائن: {pageCredit.toLocaleString()}</span>
        <span>الفرق: {pageDiff.toLocaleString()}</span>
      </div>
      <div style={{ position: "absolute", left: -99999, top: -99999 }}>
        <PrintableLedger
          ref={printRef}
          title="الأستاذ العام (دفتر الإسناد)"
          accountLabel={accountLabel}
          dateRange={dateRange}
          rows={enriched}
          openingBalance={openingBalance}
          pageDebit={pageDebit}
          pageCredit={pageCredit}
          pageDiff={pageDiff}
        />
      </div>
      <OpeningBalanceModal
        open={obOpen}
        onClose={() => setObOpen(false)}
        accounts={accountOptions.filter((x) => x.value !== "ALL")} // تحليلية فقط
        defaultAccountId={
          selectedAccount && selectedAccount !== "ALL"
            ? selectedAccount
            : undefined
        }
        onSaved={() => {
          setObOpen(false);
          fetchOpeningBalance();
          loadEntries();
        }}
      />
    </div>
  );
}
