// src/pages/ReportsPage.tsx
import { useState, useEffect } from "react";
import { Tabs, DatePicker, Select, Table, message } from "antd";
import type { Dayjs } from "dayjs";
import axios from "../../utils/axios";
const { RangePicker } = DatePicker;

interface Account {
  _id: string;
  code: string;
  name: string;
}

interface TrialBalanceItem {
  accountId: string;
  code: string;
  name: string;
  debit: number;
  credit: number;
  balance: number;
}

interface JournalEntry {
  _id: string;
  date: string;
  description: string;
  debit?: number;
  credit?: number;
}

interface SummaryItem {
  accountId: string;
  name: string;
  count: number;
  lastEntry: string;
  debit: number;
  credit: number;
}

export default function ReportsPage() {
  const [tab, setTab] = useState<string>("trial");
  const [dates, setDates] = useState<[Dayjs | null, Dayjs | null]>([
    null,
    null,
  ]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [data, setData] = useState<
    (TrialBalanceItem | JournalEntry | SummaryItem)[]
  >([]);

  // جلب الحسابات التحليلية (للكشف)
  useEffect(() => {
    if (tab === "account") {
      axios
        .get("/accounts/chart?onlyLeaf=1")
        .then((res) => setAccounts(res.data));
    }
  }, [tab]);

  // جلب البيانات حسب نوع التقرير والفترة
  useEffect(() => {
    const [from, to] = dates;
    if (tab === "trial" && from && to) {
      axios
        .get("/reports/trial-balance", {
          params: {
            from: from.format("YYYY-MM-DD"),
            to: to.format("YYYY-MM-DD"),
          },
        })
        .then((res) => setData(res.data))
        .catch(() => message.error("خطأ في تحميل الميزان"));
    }
    if (tab === "account" && selectedAccount && from && to) {
      axios
        .get("/journals", {
          params: {
            accountId: selectedAccount,
            from: from.format("YYYY-MM-DD"),
            to: to.format("YYYY-MM-DD"),
          },
        })
        .then((res) => setData(res.data.entries))
        .catch(() => message.error("خطأ في تحميل كشف الحساب"));
    }
    if (tab === "summary" && from && to) {
      axios
        .get("/reports/summary", {
          params: {
            from: from.format("YYYY-MM-DD"),
            to: to.format("YYYY-MM-DD"),
          },
        })
        .then((res) => setData(res.data))
        .catch(() => message.error("خطأ في ملخص الحركة"));
    }
  }, [tab, dates, selectedAccount]);

  return (
    <div>
      <h2>التقارير المحاسبية</h2>
      <Tabs
        activeKey={tab}
        onChange={setTab}
        items={[
          { key: "trial", label: "ميزان المراجعة" },
          { key: "account", label: "كشف حساب" },
          { key: "summary", label: "ملخص الحركة" },
        ]}
        style={{ marginBottom: 16 }}
      />
      <div style={{ marginBottom: 16 }}>
        <RangePicker
          value={dates}
          onChange={(dates) => setDates(dates || [null, null])}
        />
        {tab === "account" && (
          <Select
            showSearch
            style={{ width: 250, marginRight: 12 }}
            placeholder="اختر حسابًا تحليليًا"
            options={accounts.map((acc) => ({
              value: acc._id,
              label: `${acc.code} - ${acc.name}`,
            }))}
            value={selectedAccount}
            onChange={setSelectedAccount}
          />
        )}
      </div>
      {tab === "trial" && (
        <Table
          dataSource={data.filter(
            (item): item is TrialBalanceItem => "accountId" in item
          )}
          rowKey={(row) => row.accountId}
          columns={[
            { title: "الكود", dataIndex: "code" },
            { title: "اسم الحساب", dataIndex: "name" },
            { title: "مدين", dataIndex: "debit" },
            { title: "دائن", dataIndex: "credit" },
            { title: "الرصيد", dataIndex: "balance" },
          ]}
          pagination={false}
          summary={() => {
            const trialData = data.filter(
              (item): item is TrialBalanceItem => "accountId" in item
            );
            const totalDebit = trialData.reduce(
              (sum: number, d: TrialBalanceItem) => sum + (d.debit || 0),
              0
            );
            const totalCredit = trialData.reduce(
              (sum: number, d: TrialBalanceItem) => sum + (d.credit || 0),
              0
            );
            const totalBalance = trialData.reduce(
              (sum: number, d: TrialBalanceItem) => sum + (d.balance || 0),
              0
            );
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}>المجموع</Table.Summary.Cell>
                <Table.Summary.Cell index={1} />
                <Table.Summary.Cell index={2}>{totalDebit}</Table.Summary.Cell>
                <Table.Summary.Cell index={3}>{totalCredit}</Table.Summary.Cell>
                <Table.Summary.Cell index={4}>
                  {totalBalance}
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      )}
      {tab === "account" && (
        <Table
          dataSource={data.filter(
            (item): item is JournalEntry => "_id" in item
          )}
          rowKey={(row) => row._id}
          columns={[
            { title: "التاريخ", dataIndex: "date" },
            { title: "الوصف", dataIndex: "description" },
            { title: "مدين", dataIndex: "debit" },
            { title: "دائن", dataIndex: "credit" },
            {
              title: "الرصيد",
              render: (_: unknown, _record: JournalEntry, idx: number) => {
                const journalData = data.filter(
                  (item): item is JournalEntry => "_id" in item
                );
                return journalData
                  .slice(0, idx + 1)
                  .reduce(
                    (bal: number, e: JournalEntry) =>
                      bal + (e.debit || 0) - (e.credit || 0),
                    0
                  );
              },
            },
          ]}
          pagination={false}
        />
      )}
      {tab === "summary" && (
        <Table
          dataSource={data.filter(
            (item): item is SummaryItem => "accountId" in item
          )}
          rowKey={(row) => row.accountId}
          columns={[
            { title: "الحساب", dataIndex: "name" },
            { title: "عدد القيود", dataIndex: "count" },
            { title: "آخر حركة", dataIndex: "lastEntry" },
            { title: "إجمالي مدين", dataIndex: "debit" },
            { title: "إجمالي دائن", dataIndex: "credit" },
          ]}
          pagination={false}
        />
      )}
    </div>
  );
}
