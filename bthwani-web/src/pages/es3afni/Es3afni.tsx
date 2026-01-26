// src/pages/es3afni/Es3afni.tsx
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Es3afniList,
  Es3afniDetails,
  Es3afniForm,
  useEs3afni,
  useEs3afniList,
  type Es3afniItem,
  type CreateEs3afniPayload,
  type UpdateEs3afniPayload,
} from '../../features/es3afni';

const Es3afniPage: React.FC = () => {
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
  const { item: currentItem, createItem, updateItem, deleteItem, loading: itemLoading } = useEs3afni(id);
  const { updateItem: updateListItem, removeItem: removeListItem, addItem: addListItem } = useEs3afniList();

  // Handle view item
  const handleViewItem = (item: Es3afniItem) => {
    navigate(`/es3afni/${item._id}`);
  };

  // Handle create item
  const handleCreateItem = () => {
    navigate('/es3afni/new');
  };

  // Handle edit item
  const handleEditItem = (item: Es3afniItem) => {
    navigate(`/es3afni/${item._id}/edit`);
  };

  // Handle delete item
  const handleDeleteItem = async (item: Es3afniItem) => {
    if (window.confirm(`هل أنت متأكد من حذف بلاغ "${item.title}"؟`)) {
      try {
        await deleteItem();
        removeListItem(item._id);
        setSnackbar({
          open: true,
          message: 'تم حذف البلاغ بنجاح',
          severity: 'success',
        });
        navigate('/es3afni');
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'فشل في حذف البلاغ',
          severity: 'error',
        });
      }
    }
  };

  // Handle form submit
  const handleFormSubmit = async (data: CreateEs3afniPayload | UpdateEs3afniPayload) => {
    try {
      const isCreate = id === 'new';
      if (isCreate) {
        const newItem = await createItem(data as CreateEs3afniPayload);
        addListItem(newItem);
        setSnackbar({
          open: true,
          message: 'تم نشر البلاغ العاجل بنجاح',
          severity: 'success',
        });
        navigate(`/es3afni/${newItem._id}`);
      } else if (id && action === 'edit' && currentItem) {
        const updatedItem = await updateItem(data as UpdateEs3afniPayload);
        updateListItem(updatedItem);
        setSnackbar({
          open: true,
          message: 'تم تحديث البلاغ بنجاح',
          severity: 'success',
        });
        navigate(`/es3afni/${updatedItem._id}`);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'فشل في حفظ البلاغ',
        severity: 'error',
      });
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate('/es3afni');
  };

  // Determine what to render based on route
  const renderContent = () => {
    // Show details page
    if (id && !action) {
      return (
        <Es3afniDetails
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
        <Es3afniForm
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
      <Es3afniList
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

export default Es3afniPage;
