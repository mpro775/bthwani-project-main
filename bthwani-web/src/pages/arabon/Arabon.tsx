// مطابق لـ app-user
import React, { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Snackbar, Alert } from "@mui/material";
import {
  ArabonList,
  ArabonMyList,
  ArabonSearch,
  ArabonDetails,
  ArabonForm,
  useArabon,
  type ArabonItem,
  type CreateArabonPayload,
  type UpdateArabonPayload,
} from "../../features/arabon";
import { updateArabonStatus } from "../../features/arabon/api";
import { useAuth } from "../../hooks/useAuth";

const ArabonPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id, action } = useParams<{ id?: string; action?: string }>();
  const { user } = useAuth();

  const currentUserId = user?._id ?? user?.id ?? null;
  const isMyPage = location.pathname === "/arabon/my";
  const isSearchPage = location.pathname === "/arabon/search";

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const { item: currentItem, createItem, updateItem, deleteItem, loadItem, loading: itemLoading } = useArabon(
    id && id !== "my" && id !== "search" ? id : undefined
  );

  const handleViewItem = (item: ArabonItem) => {
    navigate(`/arabon/${item._id}`);
  };

  const handleCreateItem = () => {
    if (!currentUserId) {
      navigate("/login", { state: { from: "/arabon/new" } });
      return;
    }
    navigate("/arabon/new");
  };

  const handleEditItem = (item: ArabonItem) => {
    navigate(`/arabon/${item._id}/edit`);
  };

  const handleDeleteItem = async (item: ArabonItem) => {
    if (
      window.confirm(
        "هل أنت متأكد من حذف هذا العربون؟ لا يمكن التراجع عن هذا الإجراء."
      )
    ) {
      try {
        await deleteItem();
        setSnackbar({
          open: true,
          message: "تم حذف العربون بنجاح",
          severity: "success",
        });
        navigate("/arabon");
      } catch (error) {
        setSnackbar({
          open: true,
          message: "فشل في حذف العربون",
          severity: "error",
        });
      }
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!id || !currentItem) return;
    try {
      await updateArabonStatus(id, newStatus);
      await loadItem();
      setSnackbar({
        open: true,
        message: "تم تحديث الحالة بنجاح",
        severity: "success",
      });
    } catch {
      setSnackbar({
        open: true,
        message: "تعذر تحديث الحالة",
        severity: "error",
      });
    }
  };

  const handleFormSubmit = async (
    data: CreateArabonPayload | UpdateArabonPayload
  ) => {
    try {
      const isCreate = id === "new";
      if (isCreate) {
        const payload = data as CreateArabonPayload;
        payload.ownerId = String(currentUserId ?? "");
        const newItem = await createItem(payload);
        setSnackbar({
          open: true,
          message: "تم إنشاء العربون بنجاح",
          severity: "success",
        });
        navigate(`/arabon/${newItem._id}`);
      } else if (id && action === "edit" && currentItem) {
        await updateItem(data as UpdateArabonPayload);
        setSnackbar({
          open: true,
          message: "تم تحديث العربون بنجاح",
          severity: "success",
        });
        navigate(`/arabon/${currentItem._id}`);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "فشل في حفظ العربون",
        severity: "error",
      });
    }
  };

  const handleBack = () => {
    navigate("/arabon");
  };

  const ownerIdStr =
    currentItem &&
    (typeof currentItem.ownerId === "object" &&
    (currentItem.ownerId as { _id?: string })?._id
      ? String((currentItem.ownerId as { _id: string })._id)
      : String(currentItem.ownerId || ""));
  const isOwner = !!(currentUserId && currentItem && ownerIdStr === currentUserId);

  const renderContent = () => {
    if (isMyPage) {
      return (
        <ArabonMyList
          onBack={handleBack}
          onViewItem={handleViewItem}
        />
      );
    }
    if (isSearchPage) {
      return (
        <ArabonSearch
          onBack={handleBack}
          onViewItem={handleViewItem}
        />
      );
    }
    if (id && !action && id !== "my" && id !== "search") {
      return (
        <ArabonDetails
          item={currentItem!}
          loading={itemLoading}
          onBack={handleBack}
          onEdit={handleEditItem}
          onDelete={handleDeleteItem}
          isOwner={isOwner}
          onStatusChange={handleStatusChange}
        />
      );
    }
    if (id === "new" || (id && action === "edit")) {
      const isEdit = id !== "new" && action === "edit";
      return (
        <ArabonForm
          item={isEdit ? (currentItem ?? undefined) : undefined}
          loading={itemLoading}
          mode={isEdit ? "edit" : "create"}
          onSubmit={handleFormSubmit}
          onCancel={handleBack}
          ownerId={String(currentUserId ?? "")}
        />
      );
    }
    return (
      <ArabonList
        onViewItem={handleViewItem}
        onCreateItem={handleCreateItem}
        onMyList={() => navigate("/arabon/my")}
        onSearch={() => navigate("/arabon/search")}
      />
    );
  };

  return (
    <>
      {renderContent()}
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

export default ArabonPage;
