import { Link } from "@remix-run/react";
import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "~/Components/AppHeader";
import type { Category, Product } from "~/Interfaces/product";
import { usePreferences } from "~/context/preferences-context";
import { useToast } from "~/context/toast-context";
import { loadCategories } from "~/utils/categories.client";
import { ensureSeededProducts, getProducts } from "~/utils/products.client";

interface ProductViewPageProps {
  productId?: number;
  canManage: boolean;
}

export const ProductViewPage = ({ productId, canManage }: ProductViewPageProps) => {
  const { t } = usePreferences();
  const { notify } = useToast();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!Number.isInteger(productId)) {
        setLoading(false);
        setProduct(null);
        return;
      }

      try {
        await ensureSeededProducts();
        const seededCategories = await loadCategories();
        setCategories(seededCategories);
        const found = getProducts().find((item) => item.id === productId) ?? null;
        setProduct(found);
      } catch {
        notify(t("genericError"), "error");
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [notify, productId, t]);

  const categoryName = useMemo(() => {
    if (!product) {
      return t("noCategory");
    }

    const categoryMap = new Map(categories.map((category) => [category.id, category.name]));
    return categoryMap.get(product.categoryId) ?? t("noCategory");
  }, [categories, product, t]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <AppHeader />

      <main className="mx-auto w-full max-w-4xl space-y-4 px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {t("productDetailsTitle")}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/dashboard"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {t("backToDashboard")}
              </Link>
              {canManage && product ? (
                <Link
                  to={`/products/${product.id}/edit`}
                  className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  {t("edit")}
                </Link>
              ) : null}
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-slate-600 dark:text-slate-300">{t("loading")}</p>
          ) : !product ? (
            <p className="text-sm text-rose-700 dark:text-rose-300">{t("productNotFound")}</p>
          ) : (
            <div className="grid gap-5 md:grid-cols-[260px_1fr]">
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-64 w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-64 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                    {t("noCategory")}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  {product.name}
                </h3>
                <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
                  {product.description || "-"}
                </p>

                <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  <div className="rounded-md bg-slate-50 p-3 dark:bg-slate-800">
                    <dt className="font-medium text-slate-600 dark:text-slate-300">
                      {t("tableCategory")}
                    </dt>
                    <dd className="mt-1 text-slate-900 dark:text-slate-100">{categoryName}</dd>
                  </div>
                  <div className="rounded-md bg-slate-50 p-3 dark:bg-slate-800">
                    <dt className="font-medium text-slate-600 dark:text-slate-300">
                      {t("tablePrice")}
                    </dt>
                    <dd className="mt-1 text-slate-900 dark:text-slate-100">
                      ${product.price.toFixed(2)}
                    </dd>
                  </div>
                  <div className="rounded-md bg-slate-50 p-3 dark:bg-slate-800">
                    <dt className="font-medium text-slate-600 dark:text-slate-300">
                      {t("tableStock")}
                    </dt>
                    <dd className="mt-1 text-slate-900 dark:text-slate-100">{product.stock}</dd>
                  </div>
                  <div className="rounded-md bg-slate-50 p-3 dark:bg-slate-800">
                    <dt className="font-medium text-slate-600 dark:text-slate-300">ID</dt>
                    <dd className="mt-1 text-slate-900 dark:text-slate-100">{product.id}</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

