// مطابق لـ app-user
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Snackbar, Alert } from "@mui/material";
import {
  MaaroufList,
  MaaroufDetails,
  MaaroufForm,
  useMaarouf,
  type MaaroufItem,
  type CreateMaaroufPayload,
  type UpdateMaaroufPayload,
} from "../../features/maarouf";
import { useAuth } from "../../hooks/useAuth";

const MaaroufPage: React.FC = () => {
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
    useMaarouf(id);

  const handleViewItem = (item: MaaroufItem) => {
    navigate(`/maarouf/${item._id}`);
  };

  const handleCreateItem = () => {
    if (!currentUserId) {
      navigate("/login", { state: { from: "/maarouf/new" } });
      return;
    }
    navigate("/maarouf/new");
  };

  const handleEditItem = (item: MaaroufItem) => {
    navigate(`/maarouf/${item._id}/edit`);
  };

  const handleDeleteItem = async (item: MaaroufItem) => {
    if (
      window.confirm(
        "هل أنت متأكد من حذف هذا الإعلان؟ لا يمكن التراجع عن هذا الإجراء."
      )
    ) {
      try {
        await deleteItem();
        setSnackbar({
          open: true,
          message: "تم حذف الإعلان بنجاح",
          severity: "success",
        });
        navigate("/maarouf");
      } catch (error) {
        setSnackbar({
          open: true,
          message: "فشل في حذف الإعلان",
          severity: "error",
        });
      }
    }
  };

  const handleChat = (item: MaaroufItem) => {
    setSnackbar({
      open: true,
      message: "محادثات المعروف قريباً على الويب",
      severity: "info",
    });
  };

  const handleFormSubmit = async (
    data: CreateMaaroufPayload | UpdateMaaroufPayload
  ) => {
    try {
      const isCreate = id === "new";
      if (isCreate) {
        const payload = data as CreateMaaroufPayload;
        payload.ownerId = String(currentUserId ?? "");
        const newItem = await createItem(payload);
        setSnackbar({
          open: true,
          message: "تم إنشاء الإعلان بنجاح",
          severity: "success",
        });
        navigate(`/maarouf/${newItem._id}`);
      } else if (id && action === "edit" && currentItem) {
        await updateItem(data as UpdateMaaroufPayload);
        setSnackbar({
          open: true,
          message: "تم تحديث الإعلان بنجاح",
          severity: "success",
        });
        navigate(`/maarouf/${currentItem._id}`);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "فشل في حفظ الإعلان",
        severity: "error",
      });
    }
  };

  const handleBack = () => {
    navigate("/maarouf");
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
        <MaaroufDetails
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
        <MaaroufForm
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
      <MaaroufList
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

export default MaaroufPage;
