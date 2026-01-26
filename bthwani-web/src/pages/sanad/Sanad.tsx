// src/pages/sanad/Sanad.tsx
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Snackbar,
  Alert,
} from '@mui/material';
import {
  SanadList,
  SanadDetails,
  SanadForm,
  useSanad,
  type SanadItem,
  type CreateSanadPayload,
  type UpdateSanadPayload,
} from '../../features/sanad';

const SanadPage: React.FC = () => {
  const navigate = useNavigate();
  const { id, action } = useParams<{ id?: string; action?: string }>();

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Hooks for data management
  const { item: currentItem, createItem, updateItem, deleteItem, loading: itemLoading } = useSanad(id);

  // Handle view item
  const handleViewItem = (item: SanadItem) => {
    navigate(`/sanad/${item._id}`);
  };

  // Handle create item
  const handleCreateItem = () => {
    navigate('/sanad/new');
  };

  // Handle edit item
  const handleEditItem = (item: SanadItem) => {
    navigate(`/sanad/${item._id}/edit`);
  };

  // Handle delete item
  const handleDeleteItem = async (item: SanadItem) => {
    if (window.confirm(`هل أنت متأكد من حذف طلب "${item.title}"؟`)) {
      try {
        await deleteItem();
        setSnackbar({
          open: true,
          message: 'تم حذف طلب السند بنجاح',
          severity: 'success',
        });
        navigate('/sanad');
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'فشل في حذف طلب السند',
          severity: 'error',
        });
      }
    }
  };

  // Handle form submit
  const handleFormSubmit = async (data: CreateSanadPayload | UpdateSanadPayload) => {
    try {
      const isCreate = id === 'new';
      if (isCreate) {
        const newItem = await createItem(data as CreateSanadPayload);
        setSnackbar({
          open: true,
          message: 'تم إرسال طلب السند بنجاح',
          severity: 'success',
        });
        navigate(`/sanad/${newItem._id}`);
      } else if (id && action === 'edit' && currentItem) {
        const updatedItem = await updateItem(data as UpdateSanadPayload);
        setSnackbar({
          open: true,
          message: 'تم تحديث طلب السند بنجاح',
          severity: 'success',
        });
        navigate(`/sanad/${updatedItem._id}`);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'فشل في حفظ طلب السند',
        severity: 'error',
      });
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate('/sanad');
  };

  // Determine what to render based on route
  const renderContent = () => {
    // Show details page
    if (id && !action) {
      return (
        <SanadDetails
          item={currentItem!}
          loading={itemLoading}
          onBack={handleBack}
          onEdit={handleEditItem}
          onDelete={handleDeleteItem}
        />
      );
    }

    // Show form (create/edit)
    if ((id === 'new') || (id && action === 'edit')) {
      const isEdit = id !== 'new' && action === 'edit';
      return (
        <SanadForm
          item={isEdit ? (currentItem ?? undefined) : undefined}
          loading={itemLoading}
          mode={isEdit ? 'edit' : 'create'}
          onSubmit={handleFormSubmit}
          onCancel={handleBack}
        />
      );
    }

    // Show list page (default)
    return (
      <SanadList
        onViewItem={handleViewItem}
        onCreateItem={handleCreateItem}
      />
    );
  };

  return (
    <>
      {renderContent()}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SanadPage;
