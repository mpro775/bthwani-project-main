// src/pages/arabon/Arabon.tsx
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Snackbar,
  Alert,
} from '@mui/material';
import {
  ArabonList,
  ArabonDetails,
  ArabonForm,
  useArabon,
  useArabonList,
  type ArabonItem,
  type CreateArabonPayload,
  type UpdateArabonPayload,
} from '../../features/arabon';

const ArabonPage: React.FC = () => {
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
  const { item: currentItem, createItem, updateItem, deleteItem, loading: itemLoading } = useArabon(id);
  const { updateItem: updateListItem, removeItem: removeListItem, addItem: addListItem } = useArabonList();

  // Handle view item
  const handleViewItem = (item: ArabonItem) => {
    navigate(`/arabon/${item._id}`);
  };

  // Handle create item
  const handleCreateItem = () => {
    navigate('/arabon/new');
  };

  // Handle edit item
  const handleEditItem = (item: ArabonItem) => {
    navigate(`/arabon/${item._id}/edit`);
  };

  // Handle delete item
  const handleDeleteItem = async (item: ArabonItem) => {
    if (window.confirm(`هل أنت متأكد من حذف عربون "${item.title}"؟`)) {
      try {
        await deleteItem();
        removeListItem(item._id);
        setSnackbar({
          open: true,
          message: 'تم حذف العربون بنجاح',
          severity: 'success',
        });
        navigate('/arabon');
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'فشل في حذف العربون',
          severity: 'error',
        });
      }
    }
  };

  // Handle form submit
  const handleFormSubmit = async (data: CreateArabonPayload | UpdateArabonPayload) => {
    try {
      const isCreate = id === 'new';
      if (isCreate) {
        const newItem = await createItem(data as CreateArabonPayload);
        addListItem(newItem);
        setSnackbar({
          open: true,
          message: 'تم إنشاء العربون بنجاح',
          severity: 'success',
        });
        navigate(`/arabon/${newItem._id}`);
      } else if (id && action === 'edit' && currentItem) {
        const updatedItem = await updateItem(data as UpdateArabonPayload);
        updateListItem(updatedItem);
        setSnackbar({
          open: true,
          message: 'تم تحديث العربون بنجاح',
          severity: 'success',
        });
        navigate(`/arabon/${updatedItem._id}`);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'فشل في حفظ العربون',
        severity: 'error',
      });
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate('/arabon');
  };

  // Determine what to render based on route
  const renderContent = () => {
    // Show details page
    if (id && !action) {
      return (
        <ArabonDetails
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
        <ArabonForm
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
      <ArabonList
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

export default ArabonPage;
