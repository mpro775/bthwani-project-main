// src/pages/ChartAccounts.tsx
import  { useEffect, useState } from "react";
import { Tree, Button, Modal, Form, Input,  message, Switch } from "antd";
import {
  getAccountTree,
  createAccount,
  updateAccount,
  deleteAccount,
} from "../../services/chartAccount.api";
import type { Account, AccountTreeNode, AccountFormData, ModalState } from "../../type/er";



function toTreeData(accounts: Account[]): AccountTreeNode[] {
  return accounts.map((acc: Account): AccountTreeNode => ({
    title: (
        <span>
          {acc.code} - {acc.name}
        </span>
      ),
    key: acc._id,
    children: acc.children ? toTreeData(acc.children) : [],
    data: acc,
  }));
}


export default function ChartAccounts() {
  const [treeData, setTreeData] = useState<AccountTreeNode[]>([]);
  const [selected, setSelected] = useState<Account | null>(null);
  const [modal, setModal] = useState<ModalState>({
    open: false,
  });

  const [form] = Form.useForm<AccountFormData>();

  const refresh = async () => {
    const res = await getAccountTree();
    setTreeData(toTreeData(res.data));
  };

  useEffect(() => {
    refresh();
  }, []);

  const onSelect = (keys: React.Key[], info: { node: AccountTreeNode }) => {
    if (keys.length === 0) {
      setSelected(null);
    } else {
      setSelected(info.node.data);
    }
  };

  const isSubAccount = (account: Account | null): boolean => {
    // يعتبر فرعي إذا له أب وليس هو الحساب التحليلي (بدون أبناء)
    return account !== null && account.parent !== null;
  };
  
  const shouldShowSwitch = (): boolean => {
    // إضافة: إذا كنا نضيف حساب تحت أي حساب غير رئيسي
    if (!modal.edit && selected && selected.parent !== undefined && selected.parent !== null) return true;
    // تعديل: إذا الحساب نفسه له parent (أي فرعي أو تحليلي)
    if (modal.edit && selected && selected.parent !== null) return true;
    return false;
  };
  

  const openModal = (edit = false): void => {
    if (edit && selected) {
      // في حالة التعديل، نضع قيم الحساب المحدد
      // ونضيف قيمة افتراضية لـ isActive إذا لم تكن موجودة
      form.setFieldsValue({
        code: selected.code,
        name: selected.name,
        isActive: selected.isActive === undefined ? true : selected.isActive,
      });
    } else {
      // في حالة الإضافة
      form.resetFields(); // نبدأ بفورم نظيف
      // إذا كان الحساب فرعياً أو تحليلياً، نضبط isActive على "مفعل" افتراضياً
      if (selected && selected.parent !== null) {
        form.setFieldsValue({ isActive: true });
      }
    }
    setModal({ open: true, edit });
  };
  

  const handleOk = async (): Promise<void> => {
    const values: AccountFormData = await form.validateFields();
    try {
      if (modal.edit && selected) {
        // لا تغيّر parent أثناء التعديل (إلا إذا عندك UI لنقل الحساب)
        await updateAccount(selected._id, values);
        message.success("تم تحديث الحساب");
      } else {
        // إنشاء: لو في حساب محدد، اعتبره الأب
        const payload: AccountFormData = selected
          ? { ...values, parent: selected._id }
          : values;
        await createAccount(payload);
        message.success("تم إنشاء الحساب");
      }
      setModal({ open: false });
      refresh();
    } catch (err) {
      message.error("خطأ في حفظ الحساب");
      console.error(err);
    }
  };
  
  const handleDelete = async (): Promise<void> => {
    if (!selected) return;
    try {
      await deleteAccount(selected._id);
      message.success("تم الحذف!");
      setSelected(null);
      refresh();
    } catch (err) {
      message.error("خطأ في حذف الحساب");
      console.error(err);
    }
  };

  const getAddButtonLabel = (): string => {
    if (!selected) return "إضافة حساب رئيسي";
    if (!selected.parent) return "إضافة حساب فرعي";
    if (selected.children && selected.children.length > 0) return "إضافة حساب تحليلي";
    return "إضافة حساب تحليلي";
  };

  const handleToggleActive = async (): Promise<void> => {
    if (!selected) return;
    try {
      await updateAccount(selected._id, { isActive: !selected.isActive });
      message.success(selected.isActive ? "تم إيقاف الحساب" : "تم تفعيل الحساب");
      refresh();
    } catch (err) {
      message.error("حدث خطأ في التحديث");
      console.error(err);
    }
  };
  

  return (
    <div>
      <h2>دليل الحسابات</h2>
      <Button type="primary" onClick={() => openModal(false)}>
  {getAddButtonLabel()}
</Button>
      <Button disabled={!selected} onClick={() => openModal(true)} style={{ marginLeft: 8 }}>
        تعديل المحدد
      </Button>
      <Button danger disabled={!selected} onClick={handleDelete} style={{ marginLeft: 8 }}>
  حذف المحدد
</Button>
{selected && isSubAccount(selected) && (
  <Button
    type={selected.isActive ? "default" : "primary"}
    onClick={handleToggleActive}
    style={{ marginLeft: 8 }}
  >
    {selected.isActive ? "إيقاف الحساب" : "تفعيل الحساب"}
  </Button>
)}
<Button style={{ marginLeft: 8 }} disabled={!selected} onClick={() => setSelected(null)}>
  إلغاء التحديد
</Button>


      <Tree
        treeData={treeData}
        onSelect={onSelect}
        selectedKeys={selected ? [selected._id] : []}
        style={{ marginTop: 20 }}
        defaultExpandAll
      />

      <Modal
        open={modal.open}
        title={modal.edit ? "تعديل الحساب" : "إضافة حساب"}
        onCancel={() => setModal({ open: false })}
        onOk={handleOk}
      >
        <Form form={form} layout="vertical">
          
          <Form.Item name="code" label="الكود" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="name" label="الاسم" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          {shouldShowSwitch() && (
  <Form.Item name="isActive" label="الحالة" valuePropName="checked">
    <Switch checkedChildren="مفعل" unCheckedChildren="موقوف" />
  </Form.Item>
)}

        </Form>
      </Modal>
    </div>
  );
}
