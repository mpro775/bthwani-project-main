// مطابق لـ app-user KawaderDetailsScreen
import React, { useState, useCallback, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  IconButton,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Collapse,
} from "@mui/material";
import {
  ArrowBack,
  Share,
  Edit,
  Delete,
  WorkOutline,
  School,
  Build,
  LocationOn,
  Home,
  Phone,
  ChatBubbleOutline,
  Send,
  Star,
  StarBorder,
  Image as ImageIcon,
} from "@mui/icons-material";
import type {
  KawaderItem,
  KawaderApplicationItem,
  KawaderPortfolioItem,
  KawaderReviewItem,
} from "../types";
import { KawaderStatusLabels, KawaderStatusColors } from "../types";
import {
  applyToKawader,
  getKawaderApplications,
  updateApplicationStatus,
  getPortfolioByUser,
  getReviewsByUser,
  createKawaderReview,
} from "../api";

const normalizePhoneNumber = (phone: string): string | null => {
  if (!phone || typeof phone !== "string") return null;
  const digits = phone.replace(/\D/g, "").replace(/^0+/, "");
  if (digits.length < 8) return null;
  if (/^966\d{9}$/.test(digits)) return `+${digits}`;
  if (/^5\d{8}$/.test(digits)) return `+966${digits}`;
  if (/^05\d{8}$/.test(digits)) return `+966${digits.slice(1)}`;
  if (/^967\d{8,}$/.test(digits)) return `+${digits}`;
  if (/^7\d{8}$/.test(digits)) return `+967${digits}`;
  if (/^0\d{8,}$/.test(digits)) return `+967${digits.slice(1)}`;
  if (digits.length >= 9) return `+${digits}`;
  return null;
};

interface KawaderDetailsProps {
  item: KawaderItem;
  loading?: boolean;
  onBack?: () => void;
  onEdit?: (item: KawaderItem) => void;
  onDelete?: (item: KawaderItem) => void;
  isOwner?: boolean;
  onChat?: (item: KawaderItem) => void;
}

const KawaderDetails: React.FC<KawaderDetailsProps> = ({
  item,
  loading = false,
  onBack,
  onEdit,
  onDelete,
  isOwner = false,
  onChat,
}) => {
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [coverNote, setCoverNote] = useState("");
  const [applying, setApplying] = useState(false);
  const [applications, setApplications] = useState<KawaderApplicationItem[]>([]);
  const [applicationsVisible, setApplicationsVisible] = useState(false);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [portfolioItems, setPortfolioItems] = useState<KawaderPortfolioItem[]>([]);
  const [reviews, setReviews] = useState<KawaderReviewItem[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const ownerIdStr =
    item &&
    (typeof item.ownerId === "object" && (item.ownerId as { _id?: string })?._id
      ? String((item.ownerId as { _id: string })._id)
      : String(item?.ownerId ?? "");

  const loadApplications = useCallback(async () => {
    if (!item?._id) return;
    setLoadingApplications(true);
    try {
      const res = await getKawaderApplications(item._id);
      setApplications(res.items ?? []);
    } catch {
      setApplications([]);
    } finally {
      setLoadingApplications(false);
    }
  }, [item?._id]);

  const loadPortfolio = useCallback(async () => {
    if (!ownerIdStr) return;
    setLoadingPortfolio(true);
    try {
      const res = await getPortfolioByUser(ownerIdStr);
      setPortfolioItems(res.items ?? []);
    } catch {
      setPortfolioItems([]);
    } finally {
      setLoadingPortfolio(false);
    }
  }, [ownerIdStr]);

  const loadReviews = useCallback(async () => {
    if (!ownerIdStr) return;
    setLoadingReviews(true);
    try {
      const res = await getReviewsByUser(ownerIdStr);
      setReviews(res.items ?? []);
      setAverageRating(res.averageRating ?? 0);
      setReviewCount(res.reviewCount ?? 0);
    } catch {
      setReviews([]);
      setAverageRating(0);
      setReviewCount(0);
    } finally {
      setLoadingReviews(false);
    }
  }, [ownerIdStr]);

  useEffect(() => {
    if (item && ownerIdStr) {
      loadPortfolio();
      loadReviews();
    }
  }, [item, ownerIdStr, loadPortfolio, loadReviews]);

  const handleApplySubmit = async () => {
    if (!item?._id) return;
    setApplying(true);
    try {
      await applyToKawader(item._id, coverNote.trim() || undefined);
      setApplyModalOpen(false);
      setCoverNote("");
      window.alert("تم إرسال تقديمك بنجاح.");
    } catch (e: any) {
      window.alert(e?.response?.data?.message || "فشل في إرسال التقديم");
    } finally {
      setApplying(false);
    }
  };

  const handleAcceptReject = async (
    appId: string,
    status: "accepted" | "rejected"
  ) => {
    try {
      await updateApplicationStatus(appId, status);
      loadApplications();
    } catch (e: any) {
      window.alert(e?.response?.data?.message || "فشل في تحديث الحالة");
    }
  };

  const handleReviewSubmit = async () => {
    if (!item?._id) return;
    setSubmittingReview(true);
    try {
      await createKawaderReview(item._id, reviewRating, reviewComment.trim() || undefined);
      setReviewModalOpen(false);
      setReviewComment("");
      setReviewRating(5);
      loadReviews();
    } catch (e: any) {
      window.alert(e?.response?.data?.message || "فشل في إرسال التقييم");
    } finally {
      setSubmittingReview(false);
    }
  };

  const getApplicantName = (app: KawaderApplicationItem) => {
    const u = app.userId;
    if (typeof u === "object" && u && "name" in u) return (u as any).name || "مستخدم";
    return "مستخدم";
  };

  const getPortfolioMediaUrl = (p: KawaderPortfolioItem) => {
    const first = p.mediaIds?.[0];
    if (!first) return null;
    if (typeof first === "object" && first && "url" in first) return (first as any).url ?? null;
    return null;
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "غير محدد";
    return `${amount.toLocaleString("ar-SA")} ريال`;
  };

  const formatDate = (dateInput?: string | Date) => {
    if (!dateInput) return "غير محدد";
    try {
      const d =
        dateInput instanceof Date ? dateInput : new Date(dateInput);
      return d.toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(dateInput);
    }
  };

  const handleShare = async () => {
    if (!item) return;
    const text = `عرض وظيفي: ${item.title}\n\n${item.description || ""}\n\nالنطاق: ${item.scope || "غير محدد"}\nالميزانية: ${formatCurrency(item.budget)}\n${item.metadata?.location ? `الموقع: ${item.metadata.location}\n` : ""}${item.metadata?.remote ? "متاح العمل عن بعد\n" : ""}${item.metadata?.experience ? `الخبرة المطلوبة: ${item.metadata.experience}\n` : ""}${item.metadata?.skills?.length ? `المهارات: ${item.metadata.skills.join(", ")}\n` : ""}\nالحالة: ${KawaderStatusLabels[item.status]}\n\nتاريخ النشر: ${formatDate(item.createdAt)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: item.title, text });
      } else {
        await navigator.clipboard.writeText(text);
      }
    } catch (e) {
      console.error("Share failed:", e);
    }
  };

  const handleCall = () => {
    const raw = item?.metadata?.contact;
    if (!raw) return;
    const normalized = normalizePhoneNumber(raw);
    if (normalized) {
      window.location.href = `tel:${normalized}`;
    }
  };

  const handleChat = () => {
    if (onChat) {
      onChat(item);
    }
  };

  const hasContact = !!(item?.metadata?.contact);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", pb: 4 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 2,
          py: 1.5,
          backgroundColor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        {onBack && (
          <IconButton onClick={onBack} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
        )}
        <Typography variant="h6" sx={{ flex: 1, textAlign: "center" }}>
          تفاصيل العرض الوظيفي
        </Typography>
        <IconButton onClick={handleShare}>
          <Share />
        </IconButton>
        {isOwner && (
          <>
            {onEdit && (
              <IconButton onClick={() => onEdit(item)}>
                <Edit />
              </IconButton>
            )}
            {onDelete && (
              <IconButton onClick={() => onDelete(item)} color="error">
                <Delete />
              </IconButton>
            )}
          </>
        )}
      </Box>

      <Box sx={{ px: 2, py: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box
            sx={{
              backgroundColor: "success.light",
              px: 2,
              py: 1,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" fontWeight={700} color="success.dark">
              {formatCurrency(item.salary ?? item.budget)}
            </Typography>
          </Box>
          <Chip
            label={KawaderStatusLabels[item.status]}
            sx={{
              backgroundColor: KawaderStatusColors[item.status],
              color: "white",
            }}
          />
        </Box>

        <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
          {item.title}
        </Typography>

        {item.description && (
          <Typography variant="body1" sx={{ mb: 3, whiteSpace: "pre-line" }}>
            {item.description}
          </Typography>
        )}

        {item.scope && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              نطاق العمل
            </Typography>
            <Paper sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <WorkOutline color="primary" />
              <Typography variant="body2" color="primary.main" fontWeight={500}>
                {item.scope}
              </Typography>
            </Paper>
          </Box>
        )}

        {(item.offerType || item.jobType || item.location || item.salary != null) && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              التفاصيل
            </Typography>
            <Paper sx={{ p: 2 }}>
              {item.offerType && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">نوع العرض:</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {item.offerType === "job" ? "وظيفة" : "عرض خدمة"}
                  </Typography>
                </Box>
              )}
              {item.jobType && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">نوع الوظيفة:</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {item.jobType === "full_time" ? "دوام كامل" : item.jobType === "part_time" ? "دوام جزئي" : "عن بُعد"}
                  </Typography>
                </Box>
              )}
              {(item.location || item.metadata?.location) && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <LocationOn fontSize="small" color="action" />
                  <Typography variant="body2" fontWeight={500}>
                    {item.location || item.metadata?.location}
                  </Typography>
                </Box>
              )}
              {(item.salary != null || item.budget != null) && (
                <Box>
                  <Typography variant="body2" color="text.secondary">الراتب/الميزانية:</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {formatCurrency(item.salary ?? item.budget)}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        )}

        {item.metadata && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              متطلبات العمل
            </Typography>
            {item.metadata.experience && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1,
                  p: 1,
                  backgroundColor: "grey.50",
                  borderRadius: 1,
                }}
              >
                <School fontSize="small" color="action" />
                <Typography variant="body2">الخبرة المطلوبة:</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {item.metadata.experience}
                </Typography>
              </Box>
            )}
            {item.metadata.skills && item.metadata.skills.length > 0 && (
              <Paper sx={{ p: 2, mb: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Build fontSize="small" color="action" />
                  <Typography variant="body2" fontWeight={600}>
                    المهارات المطلوبة:
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {item.metadata.skills.map((skill, i) => (
                    <Chip key={i} label={skill} size="small" sx={{ mb: 0.5 }} />
                  ))}
                </Box>
              </Paper>
            )}
            {item.metadata.location && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1,
                  p: 1,
                  backgroundColor: "grey.50",
                  borderRadius: 1,
                }}
              >
                <LocationOn fontSize="small" color="action" />
                <Typography variant="body2">الموقع:</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {item.metadata.location}
                  {item.metadata.remote && " (متاح العمل عن بعد)"}
                </Typography>
              </Box>
            )}
            {item.metadata.remote && !item.metadata.location && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  p: 1,
                  backgroundColor: "grey.50",
                  borderRadius: 1,
                }}
              >
                <Home fontSize="small" color="action" />
                <Typography variant="body2">نوع العمل:</Typography>
                <Typography variant="body2" fontWeight={500}>
                  عن بعد
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {isOwner && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              التقديمات على هذا العرض
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setApplicationsVisible((v) => !v);
                if (!applicationsVisible) loadApplications();
              }}
              disabled={loadingApplications}
            >
              {applicationsVisible ? "إخفاء التقديمات" : "عرض التقديمات"}
            </Button>
            <Collapse in={applicationsVisible}>
              {applications.length > 0 ? (
                <Box sx={{ mt: 2 }}>
                  {applications.map((app) => (
                    <Paper key={app._id} sx={{ p: 2, mb: 1.5 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {getApplicantName(app)}
                      </Typography>
                      {app.coverNote && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {app.coverNote}
                        </Typography>
                      )}
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1, flexWrap: "wrap" }}>
                        <Chip
                          size="small"
                          label={
                            app.status === "pending"
                              ? "قيد المراجعة"
                              : app.status === "accepted"
                                ? "مقبول"
                                : "مرفوض"
                          }
                          color={
                            app.status === "accepted"
                              ? "success"
                              : app.status === "rejected"
                                ? "error"
                                : "default"
                          }
                        />
                        {app.status === "pending" && (
                          <>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => handleAcceptReject(app._id, "accepted")}
                            >
                              قبول
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              onClick={() => handleAcceptReject(app._id, "rejected")}
                            >
                              رفض
                            </Button>
                          </>
                        )}
                      </Box>
                    </Paper>
                  ))}
                </Box>
              ) : !loadingApplications && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  لا توجد تقديمات بعد
                </Typography>
              )}
            </Collapse>
          </Box>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
            التواصل
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {!isOwner && (
              <Button
                variant="contained"
                sx={{ bgcolor: "warning.main" }}
                startIcon={<Send />}
                onClick={() => setApplyModalOpen(true)}
              >
                تقدم الآن
              </Button>
            )}
            {!isOwner && onChat && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<ChatBubbleOutline />}
                onClick={handleChat}
              >
                تواصل مع المعلن
              </Button>
            )}
            {hasContact && (
              <Button
                variant="contained"
                color="success"
                startIcon={<Phone />}
                onClick={handleCall}
              >
                اتصال مباشر
              </Button>
            )}
          </Box>
          {hasContact && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              رقم التواصل:{" "}
              {normalizePhoneNumber(item.metadata!.contact!) ??
                item.metadata!.contact}
            </Typography>
          )}
          {!hasContact && !isOwner && onChat && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              لم يُذكر رقم تواصل في هذا الإعلان. يمكنك المحادثة مع المعلن
              أعلاه.
            </Typography>
          )}
        </Box>

        {portfolioItems.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              معرض المعلن
            </Typography>
            {loadingPortfolio ? (
              <CircularProgress size={24} />
            ) : (
              <Box sx={{ display: "flex", gap: 2, overflowX: "auto", pb: 1 }}>
                {portfolioItems.map((p) => {
                  const thumb = getPortfolioMediaUrl(p);
                  return (
                    <Paper
                      key={p._id}
                      sx={{
                        minWidth: 140,
                        overflow: "hidden",
                        borderRadius: 2,
                      }}
                    >
                      {thumb ? (
                        <Box
                          component="img"
                          src={thumb}
                          alt=""
                          sx={{ width: 140, height: 100, objectFit: "cover" }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 140,
                            height: 100,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: "grey.200",
                          }}
                        >
                          <ImageIcon sx={{ fontSize: 32, color: "grey.500" }} />
                        </Box>
                      )}
                      {p.caption && (
                        <Typography variant="caption" sx={{ p: 1, display: "block" }} noWrap>
                          {p.caption}
                        </Typography>
                      )}
                    </Paper>
                  );
                })}
              </Box>
            )}
          </Box>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
            التقييمات
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Star sx={{ color: "warning.main" }} />
            <Typography variant="body2" fontWeight={600}>
              {averageRating > 0 ? averageRating.toFixed(1) : "—"} ({reviewCount})
            </Typography>
            {!isOwner && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => setReviewModalOpen(true)}
              >
                أضف تقييماً
              </Button>
            )}
          </Box>
          {loadingReviews ? (
            <CircularProgress size={24} />
          ) : reviews.length > 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {reviews.slice(0, 5).map((r) => (
                <Paper key={r._id} sx={{ p: 1.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body2" fontWeight={600}>
                      {typeof r.reviewerId === "object" && r.reviewerId && "name" in r.reviewerId
                        ? (r.reviewerId as any).name
                        : "مستخدم"}
                    </Typography>
                    <Box sx={{ display: "flex" }}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          sx={{
                            fontSize: 14,
                            color: i <= r.rating ? "warning.main" : "grey.400",
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                  {r.comment && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {r.comment}
                    </Typography>
                  )}
                </Paper>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              لا توجد تقييمات بعد
            </Typography>
          )}
        </Box>

        <Dialog open={applyModalOpen} onClose={() => setApplyModalOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>تقدم على هذا العرض</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="رسالة تقديم (اختياري)"
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setApplyModalOpen(false)}>إلغاء</Button>
            <Button
              variant="contained"
              onClick={handleApplySubmit}
              disabled={applying}
              startIcon={applying ? <CircularProgress size={16} /> : <Send />}
            >
              إرسال التقديم
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={reviewModalOpen} onClose={() => setReviewModalOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>تقييم المعلن</DialogTitle>
          <DialogContent>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5, py: 2 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <IconButton
                  key={i}
                  onClick={() => setReviewRating(i)}
                  size="large"
                >
                  {i <= reviewRating ? (
                    <Star sx={{ color: "warning.main" }} />
                  ) : (
                    <StarBorder sx={{ color: "warning.main" }} />
                  )}
                </IconButton>
              ))}
            </Box>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="تعليق (اختياري)"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReviewModalOpen(false)}>إلغاء</Button>
            <Button
              variant="contained"
              onClick={handleReviewSubmit}
              disabled={submittingReview}
              startIcon={submittingReview ? <CircularProgress size={16} /> : null}
            >
              إرسال التقييم
            </Button>
          </DialogActions>
        </Dialog>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
            تواريخ مهمة
          </Typography>
          <Typography variant="body2">
            تاريخ النشر: {formatDate(item.createdAt)}
          </Typography>
          <Typography variant="body2">
            آخر تحديث: {formatDate(item.updatedAt)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default KawaderDetails;
