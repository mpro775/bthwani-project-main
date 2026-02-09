// src/pages/kenz/Kenz.tsx - مطابق لـ app-user
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import { Snackbar, Alert } from "@mui/material";
import {
  KenzList,
  KenzDetails,
  KenzForm,
  KenzFavoritesView,
  KenzDealsView,
  useKenz,
  useKenzList,
  useKenzFavoriteIds,
  markKenzAsSold,
  reportKenz,
  createKenzConversation,
  buyWithEscrow,
  placeBid,
  type KenzItem,
  type CreateKenzPayload,
  type UpdateKenzPayload,
} from "../../features/kenz";

const KenzPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id, action } = useParams<{ id?: string; action?: string }>();
  const currentUserId = user?._id ?? user?.id ?? null;
  const favorites = useKenzFavoriteIds(!!currentUserId);

  const [bidsRefreshKey, setBidsRefreshKey] = useState(0);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Hooks for data management
  const {
    item: currentItem,
    createItem,
    updateItem,
    deleteItem,
    loadItem: refetchItem,
    loading: itemLoading,
  } = useKenz(id);
  const {
    updateItem: updateListItem,
    removeItem: removeListItem,
    addItem: addListItem,
  } = useKenzList();

  // Handle view item
  const handleViewItem = (item: KenzItem) => {
    navigate(`/kenz/${item._id}`);
  };

  // Handle create item - يتطلب تسجيل الدخول (مطابق لـ app-user)
  const handleCreateItem = () => {
    if (!currentUserId) {
      navigate("/login", { state: { from: "/kenz/new" } });
      return;
    }
    navigate("/kenz/new");
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
          message: "تم حذف الإعلان بنجاح",
          severity: "success",
        });
        navigate("/kenz");
      } catch (error) {
        setSnackbar({
          open: true,
          message: "فشل في حذف الإعلان",
          severity: "error",
        });
      }
    }
  };

  // Handle form submit
  const handleFormSubmit = async (
    data: CreateKenzPayload | UpdateKenzPayload
  ) => {
    try {
      const isCreate = id === "new";
      if (isCreate) {
        const newItem = await createItem(data as CreateKenzPayload);
        addListItem(newItem);
        setSnackbar({
          open: true,
          message: "تم نشر الإعلان بنجاح",
          severity: "success",
        });
        navigate(`/kenz/${newItem._id}`);
      } else if (id && action === "edit" && currentItem) {
        const updatedItem = await updateItem(data as UpdateKenzPayload);
        updateListItem(updatedItem);
        setSnackbar({
          open: true,
          message: "تم تحديث الإعلان بنجاح",
          severity: "success",
        });
        navigate(`/kenz/${updatedItem._id}`);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "فشل في حفظ الإعلان",
        severity: "error",
      });
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate("/kenz");
  };

  // Determine what to render based on route
  const renderContent = () => {
    // صفحة إعلاناتي المفضلة
    if (id === "favorites") {
      if (!currentUserId) {
        navigate("/login", { state: { from: "/kenz/favorites" } });
        return null;
      }
      return (
        <KenzFavoritesView
          onViewItem={(item) => navigate(`/kenz/${item._id}`)}
        />
      );
    }

    // صفحة صفقاتي (الإيكرو)
    if (id === "deals") {
      if (!currentUserId) {
        navigate("/login", { state: { from: "/kenz/deals" } });
        return null;
      }
      return (
        <KenzDealsView onViewKenz={(kenzId) => navigate(`/kenz/${kenzId}`)} />
      );
    }

    // Show details page
    if (id && !action) {
      const ownerIdStr =
        currentItem &&
        (typeof currentItem.ownerId === "object" &&
        (currentItem.ownerId as { _id?: string })?._id
          ? String((currentItem.ownerId as { _id: string })._id)
          : String(currentItem.ownerId || ""));
      const isOwner = !!(
        currentUserId &&
        currentItem &&
        ownerIdStr === currentUserId
      );
      return (
        <KenzDetails
          item={currentItem!}
          loading={itemLoading}
          onBack={handleBack}
          onEdit={handleEditItem}
          onDelete={handleDeleteItem}
          isOwner={isOwner}
          onChat={async (it) => {
            if (!currentUserId) {
              navigate("/login", { state: { from: `/kenz/${it._id}` } });
              return;
            }
            try {
              const conv = await createKenzConversation(it._id);
              navigate(`/kenz/chat/${conv._id}`);
            } catch (e) {
              setSnackbar({
                open: true,
                message: "فشل في فتح المحادثة",
                severity: "error",
              });
            }
          }}
          onMarkSold={async (it) => {
            try {
              const updated = await markKenzAsSold(it._id);
              updateListItem(updated);
              if (refetchItem) refetchItem();
              setSnackbar({
                open: true,
                message: "تم تعليم الإعلان كمباع",
                severity: "success",
              });
            } catch (e) {
              setSnackbar({
                open: true,
                message: "فشل في تعليم الإعلان كمباع",
                severity: "error",
              });
            }
          }}
          onReport={async (it, payload) => {
            try {
              await reportKenz(it._id, payload);
              toast.success("تم إرسال البلاغ بنجاح");
            } catch (e) {
              toast.error(
                "فشل في إرسال البلاغ أو أنك أبلغت مسبقاً عن هذا الإعلان"
              );
            }
          }}
          isFavorited={
            currentUserId && currentItem
              ? favorites.isFavorited(currentItem._id)
              : false
          }
          onFavoriteToggle={
            currentUserId ? (it) => favorites.toggle(it._id) : undefined
          }
          onBuyWithEscrow={
            currentUserId
              ? async (it, amount) => {
                  try {
                    await buyWithEscrow(it._id, amount);
                    setSnackbar({
                      open: true,
                      message:
                        "تم إنشاء الصفقة بنجاح. يمكنك متابعة الصفقة من صفقاتي.",
                      severity: "success",
                    });
                    navigate("/kenz/deals");
                  } catch (e) {
                    setSnackbar({
                      open: true,
                      message: "فشل في إنشاء الصفقة. تحقق من رصيد المحفظة.",
                      severity: "error",
                    });
                  }
                }
              : undefined
          }
          onPlaceBid={
            currentUserId
              ? async (it, amount) => {
                  try {
                    await placeBid(it._id, amount);
                    setSnackbar({
                      open: true,
                      message: "تمت المزايدة بنجاح",
                      severity: "success",
                    });
                    refetchItem?.();
                    setBidsRefreshKey((k) => k + 1);
                  } catch (e) {
                    setSnackbar({
                      open: true,
                      message:
                        e instanceof Error
                          ? e.message
                          : "فشل في المزايدة. تأكد أن المبلغ أكبر من أعلى مزايدة.",
                      severity: "error",
                    });
                  }
                }
              : undefined
          }
          bidsRefreshKey={bidsRefreshKey}
        />
      );
    }

    // Show form (create/edit)
    if (id === "new" || (id && action === "edit")) {
      const isEdit = id !== "new" && action === "edit";
      const ownerId = String(currentUserId ?? "");
      return (
        <KenzForm
          item={isEdit ? currentItem ?? undefined : undefined}
          loading={itemLoading}
          mode={isEdit ? "edit" : "create"}
          onSubmit={handleFormSubmit}
          onCancel={handleBack}
          ownerId={ownerId}
        />
      );
    }

    // Show list page (default)
    return (
      <KenzList
        onViewItem={handleViewItem}
        onCreateItem={handleCreateItem}
        isFavorited={currentUserId ? favorites.isFavorited : undefined}
        onFavoriteToggle={
          currentUserId ? (item) => favorites.toggle(item._id) : undefined
        }
        onNavigateToFavorites={
          currentUserId ? () => navigate("/kenz/favorites") : undefined
        }
        onNavigateToDeals={
          currentUserId ? () => navigate("/kenz/deals") : undefined
        }
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
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default KenzPage;
