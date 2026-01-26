// src/pages/admin/delivery/DeliveryStoreDetailsPage.tsx
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  useTheme,
  Stack,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import axios from "../../utils/axios";
import { uploadFileToBunny } from "../../services/uploadFileToCloudinary";

import type {
  DeliveryStore,
  DeliveryProductSubCategory,
  DeliveryProduct,
} from "../../type/delivery";

import StoreInfo from "./components/StoreInfo";
import SubCategoryTable from "./components/SubCategoryTable";
import ProductTable from "./components/ProductTable";
import SubCategoryDialog from "./components/SubCategoryDialog";
import ProductDialog from "./components/ProductDialog";

// عدّل هذا للباث الفعلي الذي ثبّتّ عليه راوتر الميرشنت/الكاتالوج (مثال: "/mckathi")
const MCK_PREFIX = "/groceries";

/** ------- Types من الـ MerchantProduct ------- */
interface MerchantProductProduct {
  _id: string;
  name: string;
  description?: string;
  image?: string;
}

interface MerchantProductSection {
  _id: string;
  name: string;
}

type IdOrObj<T extends { _id: string }> = string | T;

interface MerchantProductItem {
  _id: string;
  store: IdOrObj<{ _id: string }>;
  section?: IdOrObj<MerchantProductSection> | null;
  product?: MerchantProductProduct | null;
  price: number;
  originalPrice?: number;
  appliedPromotion?: unknown;
  isAvailable: boolean;
  customImage?: string;
  customDescription?: string;
}

/** لتوسيع المنتج بالـ originalPrice اختياريًا دون كسر الأنواع */
interface DeliveryProductForUI extends DeliveryProduct {
  originalPrice?: number;
}

/** ------- Utilities ------- */
function toObjectIdString(
  val: IdOrObj<{ _id: string }> | null | undefined
): string {
  if (!val) return "";
  return typeof val === "string" ? val : val._id;
}

function getSectionName(
  section: IdOrObj<MerchantProductSection> | null | undefined
): string {
  if (!section) return "غير مصنف";
  return typeof section === "string" ? "غير مصنف" : section.name;
}

function adaptFromMerchantProducts(
  mps: ReadonlyArray<MerchantProductItem>,
  storeId: string
): {
  sections: DeliveryProductSubCategory[];
  products: DeliveryProductForUI[];
} {
  // تجميع الأقسام الفريدة من StoreSection
  const secMap = new Map<
    string,
    { _id: string; name: string; storeId: string }
  >();
  mps.forEach((mp) => {
    if (mp.section) {
      const sid = toObjectIdString(mp.section);
      const sname = getSectionName(mp.section);
      if (sid && !secMap.has(sid)) {
        secMap.set(sid, { _id: sid, name: sname, storeId });
      }
    }
  });

  const sections: DeliveryProductSubCategory[] = Array.from(
    secMap.values()
  ).map((s) => ({
    _id: s._id,
    name: s.name,
    storeId: s.storeId,
  }));

  const products: DeliveryProductForUI[] = mps.map((mp) => {
    const image = mp.customImage ?? mp.product?.image ?? "";
    const name = mp.product?.name ?? "منتج";
    const description = mp.customDescription ?? mp.product?.description ?? "";
    const subCategoryId = mp.section ? toObjectIdString(mp.section) : undefined;

    const uiProd: DeliveryProductForUI = {
      _id: mp._id,
      name,
      description,
      image,
      price: mp.price,
      isAvailable: mp.isAvailable,
      subCategoryId,
      storeId, // لتوافق الجداول الحالية
      originalPrice: mp.originalPrice,
    };
    return uiProd;
  });

  return { sections, products };
}

/** ------- Component ------- */
export default function DeliveryStoreDetailsPage() {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();

  const [store, setStore] = useState<DeliveryStore | null>(null);
  const [subs, setSubs] = useState<DeliveryProductSubCategory[]>([]);
  const [prods, setProds] = useState<DeliveryProductForUI[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // نحدد إن كانت الصفحة تعرض "مقاضي" بناءً على مصدر البيانات
  const [isGroceryView, setIsGroceryView] = useState<boolean>(false);

  // Sub-category dialog state
  const [subCatDialogOpen, setSubCatDialogOpen] = useState<boolean>(false);
  const [editingSubCat, setEditingSubCat] =
    useState<DeliveryProductSubCategory | null>(null);
  const [subCatName, setSubCatName] = useState<string>("");

  // Product dialog state
  interface ProductFormState {
    name: string;
    description: string;
    price: string;
    subCategoryId: string;
    isAvailable: boolean;
    image: File | null;
  }

  const [productDialogOpen, setProductDialogOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] =
    useState<DeliveryProductForUI | null>(null);
  const [productForm, setProductForm] = useState<ProductFormState>({
    name: "",
    description: "",
    price: "",
    subCategoryId: "",
    isAvailable: true,
    image: null,
  });

  const fetchAll = async () => {
    if (!id) return;
    setLoading(true);
    try {
      // المتجر
      const storeRes = await axios.get<DeliveryStore>(`/delivery/stores/${id}`);
      setStore(storeRes.data);

      // أولًا: جرّب بيانات المقاضي (MerchantProduct)
      const mpRes = await axios.get<MerchantProductItem[]>(
        `${MCK_PREFIX}/merchant-products`,
        { params: { store: id, channel: "app" } }
      );

      if (Array.isArray(mpRes.data) && mpRes.data.length > 0) {
        const { sections, products } = adaptFromMerchantProducts(
          mpRes.data,
          id
        );
        setSubs(sections);
        setProds(products);
        setIsGroceryView(true);
        setError(null);
        return;
      }

      // ثانيًا: فولباك للأنواع الأخرى (Delivery*)
      const [subRes, prodRes] = await Promise.all([
        axios
          .get<DeliveryProductSubCategory[]>(`/delivery/subcategories`, {
            params: { storeId: id },
          })
          .catch(async () => {
            const r = await axios.get<DeliveryProductSubCategory[]>(
              `/delivery/subcategories`
            );
            // تصفية محلية آمنة
            const filtered = r.data.filter((s) => s.storeId === id);
            return { data: filtered };
          }),
        axios
          .get<DeliveryProduct[]>(`/delivery/products`, {
            params: { store: id },
          })
          .catch(async () => {
            const r = await axios.get<DeliveryProduct[]>(`/delivery/products`);
            // بعض المشاريع تسمي الحقل store بدل storeId — ندعم الحالتين
            type DeliveryProductPossiblyHasStore = DeliveryProduct & {
              store?: string;
            };
            const filtered = (
              r.data as DeliveryProductPossiblyHasStore[]
            ).filter((p) => p.storeId === id || p.store === id);
            return { data: filtered as DeliveryProduct[] };
          }),
      ]);

      setSubs(subRes.data);
      // نسمح بحقل originalPrice الاختياري دون كسر الأنواع
      setProds((prodRes.data as DeliveryProduct[]).map((p) => ({ ...p })));
      setIsGroceryView(false);
      setError(null);
    } catch {
      setError("فشل في جلب بيانات المتجر.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // --- Sub-category handlers
  const openSubCatDialog = (sub?: DeliveryProductSubCategory) => {
    if (sub) {
      setEditingSubCat(sub);
      setSubCatName(sub.name);
    } else {
      setEditingSubCat(null);
      setSubCatName("");
    }
    setSubCatDialogOpen(true);
  };

  const saveSubCategory = async () => {
    if (!id) return;
    try {
      if (editingSubCat) {
        await axios.put(`/delivery/subcategories/${editingSubCat._id}`, {
          name: subCatName,
        });
      } else {
        await axios.post(`/delivery/subcategories`, {
          storeId: id,
          name: subCatName,
        });
      }
      setSubCatDialogOpen(false);
      await fetchAll();
    } catch {
      alert("خطأ عند حفظ الفئة الداخلية.");
    }
  };

  const deleteSubCategory = async (subId: string) => {
    if (!confirm("هل أنت متأكد من حذف الفئة؟")) return;
    try {
      await axios.delete(`/delivery/subcategories/${subId}`);
      await fetchAll();
    } catch {
      alert("خطأ عند حذف الفئة.");
    }
  };

  // --- Product handlers
  const openProductDialog = (prod?: DeliveryProductForUI) => {
    if (prod) {
      setEditingProduct(prod);
      setProductForm({
        name: prod.name,
        description: prod.description ?? "",
        price: String(prod.price ?? ""),
        subCategoryId: prod.subCategoryId ?? "",
        isAvailable: Boolean(prod.isAvailable),
        image: null,
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: "",
        description: "",
        price: "",
        subCategoryId: "",
        isAvailable: true,
        image: null,
      });
    }
    setProductDialogOpen(true);
  };

  const saveProduct = async () => {
    if (!id) return;
    try {
      if (isGroceryView) {
        // المقاضي: تحديث MerchantProduct فقط (الإضافة تتم من الكاتالوج المركزي)
        if (!editingProduct?._id) {
          alert("إضافة منتج جديد للمقاضي تتم عبر الكاتالوج المركزي.");
          return;
        }

        const payload: {
          price: number;
          isAvailable: boolean;
          section?: string;
          store: string;
          customImage?: string;
          customDescription?: string;
        } = {
          price: parseFloat(productForm.price || "0"),
          isAvailable: productForm.isAvailable,
          store: id,
        };

        if (productForm.subCategoryId)
          payload.section = productForm.subCategoryId;
        if (productForm.image)
          payload.customImage = await uploadFileToBunny(productForm.image);
        if (productForm.description)
          payload.customDescription = productForm.description;

        await axios.put(
          `${MCK_PREFIX}/merchant-products/${editingProduct._id}`,
          payload
        );
        setProductDialogOpen(false);
        await fetchAll();
        return;
      }

      // الأنواع الأخرى: DeliveryProduct
      let imageUrl = editingProduct?.image ?? "";
      if (productForm.image) {
        imageUrl = await uploadFileToBunny(productForm.image);
      }

      const payloadDelivery = {
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price || "0"),
        subCategoryId: productForm.subCategoryId || "",
        storeId: id,
        isAvailable: productForm.isAvailable,
        image: imageUrl,
      };

      if (editingProduct) {
        await axios.put(
          `/delivery/products/${editingProduct._id}`,
          payloadDelivery
        );
      } else {
        await axios.post(`/delivery/products`, payloadDelivery);
      }
      setProductDialogOpen(false);
      await fetchAll();
    } catch {
      alert("خطأ عند حفظ المنتج.");
    }
  };

  const deleteProduct = async (prodId: string) => {
    if (!confirm("هل تريد حذف المنتج؟")) return;
    try {
      if (isGroceryView) {
        await axios.delete(`${MCK_PREFIX}/merchant-products/${prodId}`);
      } else {
        await axios.delete(`/delivery/products/${prodId}`);
      }
      await fetchAll();
    } catch {
      alert("خطأ عند حذف المنتج.");
    }
  };

  const noSubs = subs.length === 0;
  const noProds = prods.length === 0;

  const pageTitle = useMemo(
    () => (store ? `${store.name} — تفاصيل المتجر` : "تفاصيل المتجر"),
    [store]
  );

  if (loading) {
    return (
      <Box p={3} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !store) {
    return (
      <Box p={3}>
        <Alert severity="error">{error ?? "المتجر غير موجود."}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography
        variant="h4"
        fontWeight="bold"
        mb={4}
        sx={{ color: theme.palette.primary.main }}
      >
        {pageTitle}
      </Typography>

      <StoreInfo store={store} />

      {/* Sub-categories */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 2 }}
      >
        <Typography variant="h5">الفئات الداخلية</Typography>
        <Button
          startIcon={<Add />}
          onClick={() => openSubCatDialog()}
          variant="contained"
          sx={{ borderRadius: "8px", px: 3 }}
          disabled={isGroceryView} // في المقاضي تُدار تلقائيًا عبر الكاتالوج
          title={
            isGroceryView
              ? "في المقاضي تُدار الفئات تلقائيًا من الكاتالوج"
              : undefined
          }
        >
          إضافة فئة
        </Button>
      </Box>

      {noSubs ? (
        <Stack alignItems="center" p={4} sx={{ opacity: 0.8 }}>
          <Typography>لا توجد فئات داخلية بعد لهذا المتجر.</Typography>
          <Button
            sx={{ mt: 2 }}
            onClick={() => openSubCatDialog()}
            variant="outlined"
            disabled={isGroceryView}
          >
            أنشئ أول فئة
          </Button>
        </Stack>
      ) : (
        <SubCategoryTable
          items={subs}
          onEdit={openSubCatDialog}
          onDelete={deleteSubCategory}
        />
      )}

      {/* Products */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        mt={6}
        sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 2 }}
      >
        <Typography variant="h5">المنتجات</Typography>
        <Button
          startIcon={<Add />}
          onClick={() => openProductDialog()}
          variant="contained"
          sx={{ borderRadius: "8px", px: 3 }}
          title={
            isGroceryView
              ? "إضافة منتج مقاضي تتم من الكاتالوج المركزي"
              : undefined
          }
        >
          إضافة منتج
        </Button>
      </Box>

      {noProds ? (
        <Stack alignItems="center" p={4} sx={{ opacity: 0.8 }}>
          <Typography>لا توجد منتجات بعد لهذا المتجر.</Typography>
          <Button
            sx={{ mt: 2 }}
            onClick={() => openProductDialog()}
            variant="outlined"
            title={
              isGroceryView
                ? "إضافة منتج مقاضي تتم من الكاتالوج المركزي"
                : undefined
            }
          >
            أضف أول منتج
          </Button>
        </Stack>
      ) : (
        <ProductTable
          products={prods}
          subCategories={subs}
          onEdit={openProductDialog}
          onDelete={deleteProduct}
          onDetail={() => {}}
        />
      )}

      {/* Dialogs */}
      <SubCategoryDialog
        open={subCatDialogOpen}
        editing={editingSubCat}
        name={subCatName}
        onChange={setSubCatName}
        onClose={() => setSubCatDialogOpen(false)}
        onSave={saveSubCategory}
      />
      <ProductDialog
        open={productDialogOpen}
        editing={editingProduct as DeliveryProduct} // آمن لأن DeliveryProductForUI يوسّع DeliveryProduct
        form={productForm}
        subCategories={subs}
        onChange={(upd) => setProductForm((f) => ({ ...f, ...upd }))}
        onClose={() => setProductDialogOpen(false)}
        onSave={saveProduct}
      />
    </Box>
  );
}
