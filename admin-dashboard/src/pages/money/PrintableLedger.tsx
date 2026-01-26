import { forwardRef, useMemo } from "react";
import dayjs from "dayjs";

type Row = {
  _id: string;
  date: string;
  description: string;
  reference: string;
  accountCode?: string;
  accountName?: string;
  accountId?: string;
  debit: number;
  credit: number;
};

type Props = {
  title: string;
  accountLabel: string;
  dateRange?: string;
  openingBalance?: number;
  rows: Row[];
  pageDebit: number;
  pageCredit: number;
  pageDiff: number;
};

const num = (v: number) => (v ?? 0).toLocaleString();

const PrintableLedger = forwardRef<HTMLDivElement, Props>(({
  title, accountLabel, dateRange, openingBalance = 0,
  rows, pageDebit, pageCredit, pageDiff
}, ref) => {

  // احسب الرصيد التراكمي حسب ترتيب زمني، بداية من الرصيد الافتتاحي
  const printableRows = useMemo(() => {
    let bal = openingBalance;
    const chron = [...rows].sort(
      (a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime() ||
        (a.reference || "").localeCompare(b.reference || "") ||
        a._id.localeCompare(b._id)
    );
    return chron.map(r => {
      bal += (r.debit || 0) - (r.credit || 0);
      return { ...r, __balance: bal } as Row & { __balance: number };
    });
  }, [rows, openingBalance]);

  return (
    <div ref={ref} dir="rtl" style={{ padding: 24, fontFamily: "Tahoma, Arial, sans-serif" }}>
      <style>{`
        @page { size: A4; margin: 14mm; }
        h2 { margin: 0 0 8px; text-align:center; }
        .meta { display:flex; justify-content:space-between; margin-bottom:12px; font-size:12px; }
        table { width:100%; border-collapse:collapse; font-size:12px; }
        th, td { border:1px solid #999; padding:6px 8px; vertical-align:top; }
        th { text-align:center; background:#f2f2f2; }
        td.num { text-align:left; direction:ltr; unicode-bidi:plaintext; }
        tr { page-break-inside: avoid; }
        .footer { display:flex; gap:24px; justify-content:flex-end; margin-top:12px; font-weight:600; }
        @media screen { .print-only { display:none; } }
      `}</style>

      <h2>{title}</h2>
      <div className="meta">
        <div>الحساب: {accountLabel}</div>
        <div>{dateRange || ""}</div>
      </div>

      <table>
        <thead>
          <tr>
            <th>التاريخ</th>
            <th>الوصف</th>
            <th>مرجع</th>
            <th>الحساب</th>
            <th>مدين</th>
            <th>دائن</th>
            <th>الرصيد التراكمي</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={4}><b>الرصيد الافتتاحي</b></td>
            <td className="num">0</td>
            <td className="num">0</td>
            <td className="num">{openingBalance.toLocaleString()}</td>
          </tr>

          {printableRows.map(r => (
            <tr key={r._id}>
              <td>{dayjs(r.date).format("YYYY-MM-DD")}</td>
              <td>{r.description}</td>
              <td>{r.reference}</td>
              <td>{`${r.accountCode ?? ""} - ${r.accountName ?? ""}`}</td>
              <td className="num">{num(r.debit || 0)}</td>
              <td className="num">{num(r.credit || 0)}</td>
              <td className="num">{num((r).__balance)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="footer">
        <span>المجموع في الصفحة:</span>
        <span>مدين: {num(pageDebit)}</span>
        <span>دائن: {num(pageCredit)}</span>
        <span>الفرق: {num(pageDiff)}</span>
      </div>
    </div>
  );
});

export default PrintableLedger;
