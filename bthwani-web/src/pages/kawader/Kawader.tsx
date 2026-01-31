// مطابق لـ app-user
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Snackbar, Alert } from "@mui/material";
import {
  KawaderList,
  KawaderDetails,
  KawaderForm,
  useKawader,
  type KawaderItem,
  type CreateKawaderPayload,
  type UpdateKawaderPayload,
} from "../../features/kawader";
import { useAuth } from "../../hooks/useAuth";

const KawaderPage: React.FC = () => {
  const navigate = useNavigate();
  const { id, action } = useParams<{ id?: string; action?: string }>();
  const { user } = useAuth();

  const currentUserId = user?._id ?? user?.id ?? null;

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const { item: currentItem, createItem, updateItem, deleteItem, loading: itemLoading } =
    useKawader(id);

  const handleViewItem = (item: KawaderItem) => {
    navigate(`/kawader/${item._id}`);
  };

  const handleCreateItem = () => {
    if (!currentUserId) {
      navigate("/login", { state: { from: "/kawader/new" } });
      return;
    }
    navigate("/kawader/new");
  };

  const handleEditItem = (item: KawaderItem) => {
    navigate(`/kawader/${item._id}/edit`);
  };

  const handleDeleteItem = async (item: KawaderItem) => {
    if (
      window.confirm(
        "هل أنت متأكد من حذف هذا العرض الوظيفي؟ لا يمكن التراجع عن هذا الإجراء."
      )
    ) {
      try {
        await deleteItem();
        setSnackbar({
          open: true,
          message: "تم حذف العرض الوظيفي بنجاح",
          severity: "success",
        });
        navigate("/kawader");
      } catch (error) {
        setSnackbar({
          open: true,
          message: "فشل في حذف العرض الوظيفي",
          severity: "error",
        });
      }
    }
  };

  const handleChat = (item: KawaderItem) => {
    setSnackbar({
      open: true,
      message: "محادثات الكوادر قريباً على الويب",
      severity: "info",
    });
  };

  const handleFormSubmit = async (
    data: CreateKawaderPayload | UpdateKawaderPayload
  ) => {
    try {
      const isCreate = id === "new";
      if (isCreate) {
        const payload = data as CreateKawaderPayload;
        payload.ownerId = String(currentUserId ?? "");
        const newItem = await createItem(payload);
        setSnackbar({
          open: true,
          message: "تم إنشاء العرض الوظيفي بنجاح",
          severity: "success",
        });
        navigate(`/kawader/${newItem._id}`);
      } else if (id && action === "edit" && currentItem) {
        await updateItem(data as UpdateKawaderPayload);
        setSnackbar({
          open: true,
          message: "تم تحديث العرض الوظيفي بنجاح",
          severity: "success",
        });
        navigate(`/kawader/${currentItem._id}`);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "فشل في حفظ العرض الوظيفي",
        severity: "error",
      });
    }
  };

  const handleBack = () => {
    navigate("/kawader");
  };

  const ownerIdStr =
    currentItem &&
    (typeof currentItem.ownerId === "object" &&
    (currentItem.ownerId as { _id?: string })?._id
      ? String((currentItem.ownerId as { _id: string })._id)
      : String(currentItem.ownerId || "");
  const isOwner = !!(currentUserId && currentItem && ownerIdStr === currentUserId);

  const renderContent = () => {
    if (id && !action) {
      return (
        <KawaderDetails
          item={currentItem!}
          loading={itemLoading}
          onBack={handleBack}
          onEdit={handleEditItem}
          onDelete={handleDeleteItem}
          isOwner={isOwner}
          onChat={handleChat}
        />
      );
    }
    if (id === "new" || (id && action === "edit")) {
      const isEdit = id !== "new" && action === "edit";
      return (
        <KawaderForm
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
      <KawaderList
        onViewItem={handleViewItem}
        onCreateItem={handleCreateItem}
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

export default KawaderPage;
