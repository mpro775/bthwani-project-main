// src/pages/kenz/Kenz.tsx
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Snackbar,
  Alert,
} from '@mui/material';
import {
  KenzList,
  KenzDetails,
  KenzForm,
  useKenz,
  useKenzList,
  type KenzItem,
  type CreateKenzPayload,
  type UpdateKenzPayload,
} from '../../features/kenz';

const KenzPage: React.FC = () => {
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
  const { item: currentItem, createItem, updateItem, deleteItem, loading: itemLoading } = useKenz(id);
  const { updateItem: updateListItem, removeItem: removeListItem, addItem: addListItem } = useKenzList();

  // Handle view item
  const handleViewItem = (item: KenzItem) => {
    navigate(`/kenz/${item._id}`);
  };

  // Handle create item
  const handleCreateItem = () => {
    navigate('/kenz/new');
  };

  // Handle edit item
  const handleEditItem = (item: KenzItem) => {
    navigate(`/kenz/${item._id}/edit`);
  };

  // Handle delete item
  const handleDeleteItem = async (item: KenzItem) => {
    if (window.confirm(`هل أنت متأكد من حذف إعلان "${item.title}"؟`)) {
      try {
        await deleteItem();
        removeListItem(item._id);
        setSnackbar({
          open: true,
          message: 'تم حذف الإعلان بنجاح',
          severity: 'success',
        });
        navigate('/kenz');
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'فشل في حذف الإعلان',
          severity: 'error',
        });
      }
    }
  };

  // Handle form submit
  const handleFormSubmit = async (data: CreateKenzPayload | UpdateKenzPayload) => {
    try {
      const isCreate = id === 'new';
      if (isCreate) {
        const newItem = await createItem(data as CreateKenzPayload);
        addListItem(newItem);
        setSnackbar({
          open: true,
          message: 'تم نشر الإعلان بنجاح',
          severity: 'success',
        });
        navigate(`/kenz/${newItem._id}`);
      } else if (id && action === 'edit' && currentItem) {
        const updatedItem = await updateItem(data as UpdateKenzPayload);
        updateListItem(updatedItem);
        setSnackbar({
          open: true,
          message: 'تم تحديث الإعلان بنجاح',
          severity: 'success',
        });
        navigate(`/kenz/${updatedItem._id}`);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'فشل في حفظ الإعلان',
        severity: 'error',
      });
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate('/kenz');
  };

  // Determine what to render based on route
  const renderContent = () => {
    // Show details page
    if (id && !action) {
      return (
        <KenzDetails
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
        <KenzForm
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
      <KenzList
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

export default KenzPage;
