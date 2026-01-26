// src/pages/PrintableVoucher.tsx
import { forwardRef, useMemo } from "react";
import dayjs from "dayjs";

type Line = {
  accountNo?: string;
  name?: string;
  desc?: string;
  debit?: number;
  credit?: number;
  currency?: string;
  rate?: number;
};

type Props = {
  companyName?: string;      // اختياري
  voucherNo?: string;
  date?: string;             // ISO أو أي فورمات
  branchName?: string;       // اختياري
  voucherTypeLabel?: string; // مثل: "قيد يومية"
  isPosted?: boolean;
  generalDesc?: string;
  lines: Line[];
  localCurrency: string;     // YER
};

const num = (v: number) => (Number(v || 0)).toLocaleString();

const PrintableVoucher = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const {
    companyName = "اسم الشركة",
    voucherNo,
    date,
    branchName,
    voucherTypeLabel = "قيد يومية",
    isPosted,
    generalDesc,
    lines = [],
    localCurrency,
  } = props;

  const { totalDebit, totalCredit, diff } = useMemo(() => {
    const t = lines.reduce(
      (acc, l) => {
        if (!acc.debit) acc.debit = 0;
        if (!acc.credit) acc.credit = 0;
        const rate = Number(l?.rate || 1);
        acc.debit  += Number(l?.debit || 0) * rate;
        acc.credit += Number(l?.credit || 0) * rate;
        return acc;
      },
      { debit: 0, credit: 0 }
    );
    if (!t.debit) t.debit = 0;
    if (!t.credit) t.credit = 0;
    return { totalDebit: t.debit, totalCredit: t.credit, diff: t.debit - t.credit };
  }, [lines]);

  return (
    <div ref={ref} dir="rtl" style={{ padding: 20, fontFamily: "Tahoma, Arial, sans-serif", color: "#000" }}>
      {/* أنماط الطباعة */}
      <style>{`
        @page { size: A4; margin: 14mm; }
        * { box-sizing: border-box; }
        h1,h2,h3,h4,p { margin: 0; }
        .header { display:flex; align-items:center; justify-content:space-between; margin-bottom: 6px; }
        .brand { font-size: 18px; font-weight: 700; }
        .title { font-size: 16px; font-weight: 700; text-align:center; margin: 6px 0 10px; }
        .meta { display:grid; grid-template-columns: repeat(4, 1fr); gap: 8px; font-size: 12px; margin-bottom: 10px; }
        .box { border: 1px solid #999; padding: 6px; border-radius: 6px; background: #fafafa; }
        .badge { display:inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; border: 1px solid #999; }
        .badge.green { background: #e8f5e9; }
        .badge.red { background: #ffebee; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }
        th, td { border: 1px solid #999; padding: 6px 8px; vertical-align: top; }
        th { background: #f2f2f2; text-align: center; }
        td.num { text-align: left; direction: ltr; unicode-bidi: plaintext; }
        .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 12px; gap: 12px; }
        .totals { display: flex; gap: 16px; font-weight: 700; }
        .signs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 16px; }
        .sign { border-top: 1px solid #999; text-align: center; padding-top: 6px; font-size: 12px; }
        .notice { font-size: 11px; color: #333; margin-top: 4px; }
        tr { page-break-inside: avoid; }
      `}</style>

      <div className="header">
        <div className="brand">{companyName}</div>
        <div className={`badge ${isPosted ? "green" : "red"}`}>
          {isPosted ? "مرحل" : "غير مرحل"}
        </div>
      </div>

      <div className="title">{voucherTypeLabel}</div>

      <div className="meta">
        <div className="box"><b>رقم القيد:</b> {voucherNo || "-"}</div>
        <div className="box"><b>التاريخ:</b> {date ? dayjs(date).format("YYYY-MM-DD") : "-"}</div>
        <div className="box"><b>الفرع:</b> {branchName || "-"}</div>
        <div className="box"><b>العملة المحلية:</b> {localCurrency}</div>
      </div>

      <div className="box" style={{ marginBottom: 8 }}>
        <b>البيان العام:</b> {generalDesc || "-"}
      </div>

      <table>
        <thead>
          <tr>
            <th style={{minWidth:110}}>رقم الحساب</th>
            <th>اسم الحساب</th>
            <th>بيان البند</th>
            <th style={{minWidth:70}}>العملة</th>
            <th style={{minWidth:70}}>سعر الصرف</th>
            <th style={{minWidth:100}}>مدين</th>
            <th style={{minWidth:100}}>دائن</th>
            <th style={{minWidth:120}}>مدين ({localCurrency})</th>
            <th style={{minWidth:120}}>دائن ({localCurrency})</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l, idx) => {
            const rate = Number(l?.rate || 1);
            const ld = Number(l?.debit || 0) * rate;
            const lc = Number(l?.credit || 0) * rate;
            return (
              <tr key={idx}>
                <td>{l.accountNo || ""}</td>
                <td>{l.name || ""}</td>
                <td>{(l.desc || "").trim() || generalDesc || ""}</td>
                <td style={{textAlign:"center"}}>{l.currency || localCurrency}</td>
                <td className="num">{num(rate)}</td>
                <td className="num">{num(Number(l?.debit || 0))}</td>
                <td className="num">{num(Number(l?.credit || 0))}</td>
                <td className="num">{num(ld)}</td>
                <td className="num">{num(lc)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="footer">
        <div className="totals">
          <span>المجموع مدين ({localCurrency}): {num(totalDebit)}</span>
          <span>المجموع دائن ({localCurrency}): {num(totalCredit)}</span>
          <span>الفرق: {num(diff)}</span>
        </div>
        <div className="notice">
          * المبالغ المحلية = المبالغ × سعر الصرف.
        </div>
      </div>

      <div className="signs">
        <div className="sign">أعدّه</div>
        <div className="sign">راجعه</div>
        <div className="sign">اعتمده</div>
      </div>
    </div>
  );
});

export default PrintableVoucher;
