# Queue Jobs Inventory

**Generated:** ١٥‏/١٠‏/٢٠٢٥، ١٢:٣٧:٤٣ ص

---

## 📊 Summary

| Metric | Count |
|--------|-------|
| **Total Queues** | 7 |
| **Total Jobs** | 12 |
| **Total Processors** | 3 |
| **Jobs with Lifecycle Hooks** | 0 |

## 📋 Registered Queues

| Queue Name | Registered In | Line |
|------------|---------------|------|
| `notifications` | `src/queues/queues.module.ts` | 31 |
| `notifications-dlq` | `src/queues/queues.module.ts` | 32 |
| `emails` | `src/queues/queues.module.ts` | 33 |
| `emails-dlq` | `src/queues/queues.module.ts` | 34 |
| `orders` | `src/queues/queues.module.ts` | 35 |
| `orders-dlq` | `src/queues/queues.module.ts` | 36 |
| `reports` | `src/queues/queues.module.ts` | 37 |

## 🔧 Jobs by Queue

### Queue: `emails` (5 jobs)

| Job Name | Processor | Data Interface | Hooks | File |
|----------|-----------|----------------|-------|------|
| `send-email` | EmailProcessor | `SendEmailJobData` | None | `src/queues/processors/email.processor.ts:25` |
| `send-bulk-emails` | EmailProcessor | `SendBulkEmailsJobData` | None | `src/queues/processors/email.processor.ts:46` |
| `send-order-confirmation` | EmailProcessor | `{ email: string; orderDetails: any }` | None | `src/queues/processors/email.processor.ts:74` |
| `send-password-reset` | EmailProcessor | `{ email: string; resetToken: string }` | None | `src/queues/processors/email.processor.ts:89` |
| `send-welcome-email` | EmailProcessor | `{ email: string; name: string }` | None | `src/queues/processors/email.processor.ts:107` |

### Queue: `notifications` (3 jobs)

| Job Name | Processor | Data Interface | Hooks | File |
|----------|-----------|----------------|-------|------|
| `send-notification` | NotificationProcessor | `SendNotificationJobData` | None | `src/queues/processors/notification.processor.ts:24` |
| `send-bulk-notifications` | NotificationProcessor | `SendBulkNotificationsJobData` | None | `src/queues/processors/notification.processor.ts:55` |
| `send-order-update` | NotificationProcessor | `{ orderId: string; status: string; userId: string }` | None | `src/queues/processors/notification.processor.ts:90` |

### Queue: `orders` (4 jobs)

| Job Name | Processor | Data Interface | Hooks | File |
|----------|-----------|----------------|-------|------|
| `process-order` | OrderProcessor | `ProcessOrderJobData` | None | `src/queues/processors/order.processor.ts:22` |
| `generate-invoice` | OrderProcessor | `GenerateInvoiceJobData` | None | `src/queues/processors/order.processor.ts:52` |
| `calculate-commission` | OrderProcessor | `{ orderId: string; amount: number; marketerId?: string }` | None | `src/queues/processors/order.processor.ts:76` |
| `update-analytics` | OrderProcessor | `{ orderId: string; eventType: string; data: any }` | None | `src/queues/processors/order.processor.ts:99` |

## 🏭 Processors

| Processor | Queue | Jobs Count | Lifecycle Hooks | File |
|-----------|-------|------------|-----------------|------|
| **EmailProcessor** | `emails` | 5 | ❌ None | `src/queues/processors/email.processor.ts` |
| **NotificationProcessor** | `notifications` | 3 | ❌ None | `src/queues/processors/notification.processor.ts` |
| **OrderProcessor** | `orders` | 4 | ❌ None | `src/queues/processors/order.processor.ts` |

---

*Full details available in `jobs_inventory.csv`*
