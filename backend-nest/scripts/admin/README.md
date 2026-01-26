# 🛠️ Admin Scripts

مجموعة من الـ scripts الإدارية للعمليات الحرجة والصيانة.

## ⚠️ تحذير

هذه الـ scripts **خطيرة جداً** ويجب استخدامها بحذر شديد. تتطلب:
- صلاحيات Superadmin
- تأكيد مزدوج
- Backup قبل التنفيذ
- تسجيل في Audit Log

---

## 📜 Scripts المتاحة

### 1. emergency-pause-system.ts
**الوصف**: إيقاف النظام بالكامل للطوارئ

**الاستخدام**:
```bash
npm run script:pause-system -- --reason="Emergency maintenance"
```

**ما يفعله**:
- يضع النظام في وضع الصيانة من خلال قاعدة البيانات
- يحفظ `maintenance_mode = true` في `app_settings`
- يسجل سبب الصيانة في `maintenance_reason`
- يسجل وقت البدء في `maintenance_started_at`
- يتطلب تأكيد "yes" قبل التنفيذ

**الإعدادات التي يتم تحديثها**:
- `maintenance_mode`: `true`
- `maintenance_reason`: السبب المحدد
- `maintenance_started_at`: وقت التنفيذ

**متى تستخدمه**:
- مشكلة أمنية حرجة
- خلل في قاعدة البيانات
- صيانة طارئة
- ترقية النظام

**Output Example**:
```
⚠️  EMERGENCY SYSTEM PAUSE SCRIPT
=====================================

Reason: Database maintenance

⚠️  WARNING: This will affect all users!
Are you sure you want to continue? (yes/no): yes

🔄 Activating maintenance mode...
✅ Maintenance mode disabled

✅ System paused successfully
Reason: Database maintenance
Time: 2025-10-18T12:34:56.789Z

⚠️  MAINTENANCE MODE ACTIVE:
  - All API endpoints are now restricted
  - Users will see maintenance message
  - Use "npm run script:resume-system" to resume
```

---

### 2. emergency-resume-system.ts
**الوصف**: استئناف النظام بعد الصيانة

**الاستخدام**:
```bash
npm run script:resume-system
```

**ما يفعله**:
- يزيل وضع الصيانة من قاعدة البيانات
- يحدث `maintenance_mode = false` في `app_settings`
- يسجل وقت الاستئناف في `last_resumed_at`
- يسمح بالعمليات الجديدة

**الإعدادات التي يتم تحديثها**:
- `maintenance_mode`: `false`
- `last_resumed_at`: وقت التنفيذ

**Output Example**:
```
✅ SYSTEM RESUME SCRIPT
========================

🔄 Removing maintenance mode flag...
✅ Maintenance mode disabled

✅ System resumed successfully
Time: 2025-10-18T12:45:00.123Z

📊 System Status:
  - API: Online ✅
  - Maintenance Mode: OFF ✅
  - Users can now access all services
```

---

### 3. export-data.ts
**الوصف**: تصدير بيانات معينة

**الاستخدام**:
```bash
# Export specific collections
npm run script:export-data -- --collections=users,orders --output=./exports

# Export all data
npm run script:export-data -- --output=./full-export
```

**الأمان**:
- ✅ تشفير البيانات الحساسة
- ✅ تسجيل من قام بالتصدير
- ✅ حذف تلقائي بعد 7 أيام

---

## 🔒 Security Checklist

قبل تشغيل أي script:

- [ ] ✅ لديك صلاحيات Superadmin
- [ ] ✅ تم عمل backup حديث
- [ ] ✅ تم إبلاغ الفريق
- [ ] ✅ تم توثيق السبب
- [ ] ✅ تم الاختبار في staging أولاً
- [ ] ✅ جاهز للـ rollback إذا لزم الأمر

---

## 📝 Adding to package.json

```json
{
  "scripts": {
    "script:pause-system": "ts-node scripts/admin/emergency-pause-system.ts",
    "script:resume-system": "ts-node scripts/admin/emergency-resume-system.ts",
    "script:export-data": "ts-node scripts/admin/export-data.ts"
  }
}
```

---

## 🔧 Technical Details

### Database Integration
جميع السكريبتات تتكامل مع:
- **AppSettings Collection**: لحفظ إعدادات الصيانة
- **SettingsService**: للوصول الآمن للإعدادات

### Maintenance Mode Settings
```typescript
{
  key: 'maintenance_mode',
  value: true/false,
  type: 'boolean',
  category: 'system',
  isPublic: true  // يمكن للعملاء قراءته
}
```

### Related Settings
- `maintenance_reason` - سبب الصيانة (private)
- `maintenance_started_at` - وقت بدء الصيانة (private)
- `last_resumed_at` - آخر وقت استئناف (private)

---

**آخر تحديث**: 2025-10-18  
**الحالة**: ✅ مكتمل ومتكامل مع قاعدة البيانات  
**Integration**: AppSettings + SettingsService

