import { Link, useNavigate } from "@remix-run/react";
import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "~/Components/AppHeader";
import { ProductForm } from "~/Components/ProductForm";
import type { Category, ProductDraft } from "~/Interfaces/product";
import { usePreferences } from "~/context/preferences-context";
import { useToast } from "~/context/toast-context";
import { createCategory, loadCategories } from "~/utils/categories.client";
import {
  createProduct,
  ensureSeededProducts,
  getProducts,
  updateProduct,
} from "~/utils/products.client";

const emptyDraft: ProductDraft = {
  name: "",
  description: "",
  price: 0,
  stock: 0,
  categoryId: 0,
  imageUrl: "",
};

interface ProductFormPageProps {
  mode: "create" | "edit";
  productId?: number;
}

export const ProductFormPage = ({ mode, productId }: ProductFormPageProps) => {
  const navigate = useNavigate();
  const { t } = usePreferences();
  const { notify } = useToast();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [initialValues, setInitialValues] = useState<ProductDraft>(emptyDraft);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        await ensureSeededProducts();
        const seededCategories = await loadCategories();
        setCategories(seededCategories);

        if (mode === "edit") {
          const product = getProducts().find((item) => item.id === productId);

          if (!product) {
            setNotFound(true);
          } else {
            setInitialValues({
              name: product.name,
              description: product.description,
              price: product.price,
              stock: product.stock,
              categoryId: product.categoryId,
              imageUrl: product.imageUrl,
            });
          }
        }
      } catch {
        notify(t("genericError"), "error");
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [mode, navigate, notify, productId, t]);

  const submitLabel = useMemo(() => t("save"), [t]);

  const handleCreateCategory = (newCategoryName: string) => {
    const result = createCategory(newCategoryName);
    if (!result) {
      return null;
    }

    setCategories((current) => {
      const exists = current.some((category) => category.id === result.category.id);
      if (exists) {
        return current;
      }
      return [...current, result.category];
    });

    notify(
      result.created ? t("newCategoryCreated") : t("newCategoryExists"),
      "info",
    );
    return result;
  };

  const handleSubmit = (draft: ProductDraft) => {
    if (mode === "create") {
      createProduct(draft);
      notify(t("createSuccess"), "success");
      navigate("/dashboard");
      return;
    }

    const updated = updateProduct(productId ?? -1, draft);
    if (!updated) {
      notify(t("productNotFound"), "error");
      return;
    }

    notify(t("updateSuccess"), "success");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <AppHeader />

      <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {mode === "create" ? t("newProductTitle") : t("editProductTitle")}
            </h2>
            <Link
              to="/dashboard"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {t("backToDashboard")}
            </Link>
          </div>

          {loading ? (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {t("loading")}
            </p>
          ) : notFound ? (
            <p className="text-sm text-rose-700 dark:text-rose-300">
              {t("productNotFound")}
            </p>
          ) : (
            <ProductForm
              initialValues={initialValues}
              categories={categories}
              submitLabel={submitLabel}
              onSubmit={handleSubmit}
              onCancel={() => navigate("/dashboard")}
              onCreateCategory={handleCreateCategory}
              t={t}
            />
          )}
        </section>
      </main>
    </div>
  );
};
