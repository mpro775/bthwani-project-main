// src/pages/OpeningBalanceModal.tsx
import { useState } from "react";
import { Modal, Form, Select, DatePicker, InputNumber, Input,  Space, message } from "antd";
import dayjs, { Dayjs } from "dayjs";
import axios from "axios";

const http = axios.create({ baseURL: "http://localhost:3000/api/v1" });

type AccountOption = { value: string; label: string };

interface Props {
  open: boolean;
  onClose: () => void;
  accounts: AccountOption[];            // مرر حسابات تحليلية فقط
  defaultAccountId?: string | null;
  defaultBranchNo?: string;
  onSaved?: () => void;                 // استدعِ إعادة تحميل التقرير بعد الحفظ
}

export default function OpeningBalanceModal({
  open, onClose, accounts, defaultAccountId, defaultBranchNo = "1", onSaved
}: Props) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const handleOk = async () => {
    try {
      const v = await form.validateFields();
      setSaving(true);

      const year: Dayjs = v.year;                  // DatePicker picker="year"
      const dateStr = dayjs(year).startOf("year").format("YYYY-MM-DD");

      // حول الإدخال إلى سطر مدين/دائن واحد
      const debit  = v.side === "debit"  ? Number(v.amount || 0) : 0;
      const credit = v.side === "credit" ? Number(v.amount || 0) : 0;

      await http.post("/opening-balance", {
        date: dateStr,
        branchNo: v.branchNo || defaultBranchNo,
        lines: [{
          account: v.accountId,
          debit,
          credit,
          desc: v.desc?.trim() || "رصيد افتتاحي",
        }],
      });

      message.success("تم حفظ الرصيد الافتتاحي");
      onClose();
      onSaved?.();
    } catch {
      message.error("تعذر حفظ الرصيد الافتتاحي");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="إدخال رصيد افتتاحي"
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={saving}
      okText="حفظ"
      cancelText="إلغاء"
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          year: dayjs(),                   // السنة الحالية
          side: "debit",
          amount: 0,
          branchNo: defaultBranchNo,
          accountId: defaultAccountId || undefined,
        }}
      >
        <Form.Item name="branchNo" label="الفرع" rules={[{ required: true }]}>
          <Select
            options={[{ value: "1", label: "صنعاء" }, { value: "2", label: "عدن" }]}
            style={{ width: 200 }}
          />
        </Form.Item>

        <Form.Item name="year" label="السنة" rules={[{ required: true }]}>
          <DatePicker picker="year" style={{ width: 200 }} />
        </Form.Item>

        <Form.Item name="accountId" label="الحساب التحليلي" rules={[{ required: true }]}>
          <Select
            showSearch
            placeholder="اختر حسابًا"
            options={accounts}
            style={{ width: "100%" }}
            filterOption={(i, opt) => (opt?.label as string)?.toLowerCase().includes(i.toLowerCase())}
          />
        </Form.Item>

        <Form.Item label="المبلغ" required>
          <Space.Compact style={{ width: "100%" }}>
            <Form.Item name="side" noStyle rules={[{ required: true }]}>
              <Select style={{ width: 120 }} options={[
                { value: "debit", label: "مدين" },
                { value: "credit", label: "دائن" },
              ]}/>
            </Form.Item>
            <Form.Item name="amount" noStyle rules={[{ required: true, type: "number", min: 0.01 }]}>
              <InputNumber style={{ width: "100%" }} min={0} step={0.01}/>
            </Form.Item>
          </Space.Compact>
        </Form.Item>

        <Form.Item name="desc" label="البيان">
          <Input placeholder="اختياري (مثال: رصيد افتتاحي 2025)" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
