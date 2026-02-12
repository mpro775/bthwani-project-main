import { utils as xlsxUtils, write as xlsxWrite } from 'xlsx';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

// دالة مساعدة لتحويل حالة الطلب إلى نص عربي
const getStatusText = (status: string) => {
  const statusMap: { [key: string]: string } = {
    'pending_confirmation': 'بانتظار التأكيد',
    'under_review': 'قيد المراجعة',
    'preparing': 'قيد التحضير',
    'out_for_delivery': 'في الطريق',
    'delivered': 'تم التوصيل',
    'cancelled': 'ملغي',
  };
  return statusMap[status] || status;
};

export const exportToExcel = async (orders: any[]) => {
  // حول الطلبات إلى بيانات للإكسل مع تفاصيل أكثر
  const excelData = orders.map((order: any) => ({
    'رقم الطلب': order._id || '',
    'الحالة': getStatusText(order.status),
    'المبلغ الإجمالي': order.totalAmount || 0,
    'تاريخ الطلب': order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-SA') : '',
    'وقت الطلب': order.createdAt ? new Date(order.createdAt).toLocaleTimeString('ar-SA') : '',
    'اسم العميل': order.customer?.name || '',
    'هاتف العميل': order.customer?.phone || '',
    'وسيلة الدفع': order.paymentMethod || '',
    'عدد العناصر': order.items?.length || 0,
    'ملاحظات': order.notes || '',
  }));

  // أنشئ ملف إكسل
  const ws = xlsxUtils.json_to_sheet(excelData);
  const wb = xlsxUtils.book_new();
  xlsxUtils.book_append_sheet(wb, ws, 'Orders');
  const wbout = xlsxWrite(wb, { type: 'base64', bookType: 'xlsx' });

  // احفظه على الجهاز
  const cacheDir = FileSystem.cacheDirectory ?? '';
  const uri = cacheDir + `orders_${Date.now()}.xlsx`;
  await FileSystem.writeAsStringAsync(uri, wbout, { encoding: FileSystem.EncodingType.Base64 });

  // شارك أو حمّل الملف
  await Sharing.shareAsync(uri, {
    mimeType:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    dialogTitle: 'تصدير الطلبات',
    UTI: 'com.microsoft.excel.xlsx',
  });
};
