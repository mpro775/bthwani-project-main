/**
 * Support Page - bthwani-web
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMySupportTickets, createSupportTicket } from '@/api/support';
import type { CreateTicketDto, SupportTicket } from '@/api/support';

export default function SupportPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateTicketDto>({
    subject: '',
    description: '',
    category: 'general',
    priority: 'medium',
  });

  const { data: tickets, isLoading, refetch } = useQuery<SupportTicket[]>({
    queryKey: ['support-tickets'],
    queryFn: getMySupportTickets,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSupportTicket(formData);
      refetch();
      setShowCreateForm(false);
      setFormData({ subject: '', description: '', category: 'general', priority: 'medium' });
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">جاري التحميل...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">الدعم الفني</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          {showCreateForm ? 'إلغاء' : 'تذكرة جديدة'}
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">إنشاء تذكرة دعم جديدة</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">الموضوع</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">الوصف</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">الفئة</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="general">عام</option>
                  <option value="technical">تقني</option>
                  <option value="billing">الفواتير</option>
                  <option value="complaint">شكوى</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">الأولوية</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="low">منخفضة</option>
                  <option value="medium">متوسطة</option>
                  <option value="high">عالية</option>
                  <option value="urgent">عاجلة</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              إرسال
            </button>
          </form>
        </div>
      )}

      {/* Tickets List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">تذاكري</h2>
        {tickets && tickets.length > 0 ? (
          tickets.map((ticket: SupportTicket) => (
            <div key={ticket.id} className="bg-white shadow rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{ticket.subject}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    ticket.status === 'open' ? 'bg-red-100 text-red-800' :
                    ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}
                >
                  {ticket.status}
                </span>
              </div>
              <p className="text-gray-600 mb-2">{ticket.description}</p>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>الفئة: {ticket.category}</span>
                <span>الأولوية: {ticket.priority}</span>
                <span>{new Date(ticket.createdAt).toLocaleDateString('ar-SA')}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">
            لا توجد تذاكر دعم حالياً
          </div>
        )}
      </div>
    </div>
  );
}

