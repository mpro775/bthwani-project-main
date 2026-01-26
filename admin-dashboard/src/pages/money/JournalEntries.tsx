// src/pages/JournalEntries.tsx
import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, DatePicker, Select, InputNumber, message } from "antd";
import axios from "../../utils/axios";
interface Account {
    _id: string;
    code: string;
    name: string;
    // ...أي خصائص أخرى تحتاجها
  }

interface JournalLine {
  account: string;
  debit?: number;
  credit?: number;
}
interface JournalEntryForm {
  date: string;
  description?: string;
  reference?: string;
  lines: JournalLine[];
}

interface JournalEntry {
  _id: string;
  date: string;
  description?: string;
  reference?: string;
  lines: {
    account: string;
    debit?: number;
    credit?: number;
  }[];
}

export default function JournalEntries() {
  const [data, setData] = useState<JournalEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm<JournalEntryForm>();

  // جلب القيود اليومية الأخيرة
  useEffect(() => {
    axios.get('/journal-entries').then(res => setData(res.data));
    axios.get('/accounts/chart?onlyLeaf=1').then(res => setAccounts(res.data));
  }, []);

  const openModal = () => {
    form.resetFields();
    form.setFieldsValue({ date: undefined, lines: [{ account: "", debit: 0, credit: 0 }] });
    setModalOpen(true);
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    // تحقق التوازن
    const total = values.lines.reduce((sum: number, l: JournalLine) => sum + (l.debit || 0) - (l.credit || 0), 0);
    if (total !== 0) {
      message.error("إجمالي المدين لا يساوي إجمالي الدائن!");
      return;
    }
    try {
      await axios.post('/journal-entries', values);
      message.success("تمت إضافة القيد!");
      setModalOpen(false);
      // تحديث البيانات
      axios.get('/journal-entries').then(res => setData(res.data));
    } catch {
      message.error("حدث خطأ!");
    }
  };

  return (
    <div>
      <h2>القيود اليومية</h2>
      <Button type="primary" onClick={openModal}>إضافة قيد يومية</Button>
      <Table<JournalEntry>
        dataSource={data}
        columns={[
          { title: "التاريخ", dataIndex: "date" },
          { title: "الوصف", dataIndex: "description" },
          { title: "المرجع", dataIndex: "reference" },
          { title: "عدد الأطراف", dataIndex: ["lines", "length"] }
        ]}
        rowKey={row => row._id}
      />
      <Modal
        open={modalOpen}
        title="إضافة قيد يومية"
        onCancel={() => setModalOpen(false)}
        onOk={handleOk}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="date" label="التاريخ" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="description" label="الوصف">
            <Input />
          </Form.Item>
          <Form.Item name="reference" label="المرجع">
            <Input />
          </Form.Item>
          <Form.List name="lines" initialValue={[{ account: null, debit: 0, credit: 0 }]}>
            {(fields, { add, remove }) => (
              <div>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <Form.Item {...restField} name={[name, "account"]} rules={[{ required: true }]} style={{ flex: 3 }}>
                      <Select
                        showSearch
                        placeholder="اختر الحساب التحليلي"
                        options={accounts.map(acc => ({
                          value: acc._id, label: `${acc.code} - ${acc.name}`
                        }))}
                      />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, "debit"]} rules={[{ type: "number", min: 0 }]} style={{ flex: 1 }}>
                      <InputNumber placeholder="مدين" min={0} style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, "credit"]} rules={[{ type: "number", min: 0 }]} style={{ flex: 1 }}>
                      <InputNumber placeholder="دائن" min={0} style={{ width: "100%" }} />
                    </Form.Item>
                    <Button danger onClick={() => remove(name)} disabled={fields.length <= 2}>حذف</Button>
                  </div>
                ))}
                <Button type="dashed" onClick={() => add()} block>
                  إضافة طرف آخر
                </Button>
              </div>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
}
