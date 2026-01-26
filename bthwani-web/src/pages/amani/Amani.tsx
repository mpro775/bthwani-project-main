// src/pages/amani/Amani.tsx
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Snackbar,
  Alert,
} from '@mui/material';
import {
  AmaniList,
  AmaniDetails,
  AmaniForm,
  useAmani,
  useAmaniList,
  type AmaniItem,
  type CreateAmaniPayload,
  type UpdateAmaniPayload,
} from '../../features/amani';

const AmaniPage: React.FC = () => {
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
  const { item: currentItem, createItem, updateItem, deleteItem, loading: itemLoading } = useAmani(id);
  const { updateItem: updateListItem, removeItem: removeListItem, addItem: addListItem } = useAmaniList();

  // Handle view item
  const handleViewItem = (item: AmaniItem) => {
    navigate(`/amani/${item._id}`);
  };

  // Handle create item
  const handleCreateItem = () => {
    navigate('/amani/new');
  };

  // Handle edit item
  const handleEditItem = (item: AmaniItem) => {
    navigate(`/amani/${item._id}/edit`);
  };

  // Handle delete item
  const handleDeleteItem = async (item: AmaniItem) => {
    if (window.confirm(`هل أنت متأكد من حذف طلب "${item.title}"؟`)) {
      try {
        await deleteItem();
        removeListItem(item._id);
        setSnackbar({
          open: true,
          message: 'تم حذف طلب النقل بنجاح',
          severity: 'success',
        });
        navigate('/amani');
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'فشل في حذف طلب النقل',
          severity: 'error',
        });
      }
    }
  };

  // Handle form submit
  const handleFormSubmit = async (data: CreateAmaniPayload | UpdateAmaniPayload) => {
    try {
      const isCreate = id === 'new';
      if (isCreate) {
        const newItem = await createItem(data as CreateAmaniPayload);
        addListItem(newItem);
        setSnackbar({
          open: true,
          message: 'تم إرسال طلب النقل بنجاح',
          severity: 'success',
        });
        navigate(`/amani/${newItem._id}`);
      } else if (id && action === 'edit' && currentItem) {
        const updatedItem = await updateItem(data as UpdateAmaniPayload);
        updateListItem(updatedItem);
        setSnackbar({
          open: true,
          message: 'تم تحديث طلب النقل بنجاح',
          severity: 'success',
        });
        navigate(`/amani/${updatedItem._id}`);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'فشل في حفظ طلب النقل',
        severity: 'error',
      });
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate('/amani');
  };

  // Determine what to render based on route
  const renderContent = () => {
    // Show details page
    if (id && !action) {
      return (
        <AmaniDetails
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
        <AmaniForm
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
      <AmaniList
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

export default AmaniPage;
