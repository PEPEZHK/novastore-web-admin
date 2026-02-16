import { Link, useRouteLoaderData } from "@remix-run/react";
import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "~/Components/AppHeader";
import { ProductFilters } from "~/Components/ProductFilters";
import { ProductTable } from "~/Components/ProductTable";
import type { Category, Product, SortBy } from "~/Interfaces/product";
import { usePreferences } from "~/context/preferences-context";
import { useToast } from "~/context/toast-context";
import type { loader as rootLoader } from "~/root";
import { loadCategories } from "~/utils/categories.client";
import {
  deleteProduct,
  ensureSeededProducts,
  replaceProducts,
  toJsonExport,
  validateProductsPayload,
} from "~/utils/products.client";

const sortProducts = (products: Product[], sortBy: SortBy): Product[] => {
  const next = [...products];

  next.sort((a, b) => {
    if (sortBy === "name-asc") {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === "price-asc") {
      return a.price - b.price;
    }
    if (sortBy === "price-desc") {
      return b.price - a.price;
    }
    if (sortBy === "stock-asc") {
      return a.stock - b.stock;
    }
    return b.stock - a.stock;
  });

  return next;
};

export const DashboardPage = () => {
  const { t } = usePreferences();
  const { notify } = useToast();
  const rootData = useRouteLoaderData<typeof rootLoader>("root");
  const canManage = rootData?.user?.role === "admin";
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortBy>("name-asc");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [seededProducts, seededCategories] = await Promise.all([
          ensureSeededProducts(),
          loadCategories(),
        ]);

        setProducts(seededProducts);
        setCategories(seededCategories);
      } catch {
        notify(t("seedError"), "error");
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [notify, t]);

  const visibleProducts = useMemo(() => {
    const bySearch = products.filter((product) =>
      product.name.toLowerCase().includes(search.toLowerCase().trim()),
    );

    const byCategory =
      categoryFilter === "all"
        ? bySearch
        : bySearch.filter(
            (product) => product.categoryId === Number(categoryFilter),
          );

    return sortProducts(byCategory, sortBy);
  }, [categoryFilter, products, search, sortBy]);

  const handleDelete = (product: Product) => {
    if (!canManage) {
      return;
    }

    if (!window.confirm(t("deleteConfirm"))) {
      return;
    }

    const deleted = deleteProduct(product.id);
    if (!deleted) {
      notify(t("genericError"), "error");
      return;
    }

    setProducts((current) => current.filter((item) => item.id !== product.id));
    notify(t("deleteSuccess"), "success");
  };

  const handleExport = () => {
    if (!canManage) {
      return;
    }

    const json = toJsonExport(products);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "novastore-products.json";
    anchor.click();
    URL.revokeObjectURL(url);
    notify(t("exportSuccess"), "success");
  };

  const handleImport = async (file: File) => {
    if (!canManage) {
      return;
    }

    try {
      const text = await file.text();
      const payload: unknown = JSON.parse(text);
      const validation = validateProductsPayload(payload);

      if (!validation.valid) {
        const translatedErrors = validation.errors.map((key) => t(key)).join(" ");
        notify(`${t("importError")} ${translatedErrors}`.trim(), "error");
        return;
      }

      replaceProducts(validation.data);
      setProducts(validation.data);
      notify(t("importSuccess"), "success");
    } catch {
      notify(t("importError"), "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <AppHeader />

      <main className="mx-auto w-full max-w-6xl space-y-4 px-4 py-6 sm:px-6 lg:px-8">
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {t("dashboardTitle")}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {t("dashboardSubtitle")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {visibleProducts.length} {t("recordsCount")}
            </p>
            {canManage ? (
              <Link
                to="/products/new"
                className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              >
                {t("addProduct")}
              </Link>
            ) : null}
          </div>
        </section>

        {canManage ? null : (
          <section className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-100">
            {t("dashboardReadOnlyNotice")}
          </section>
        )}

        <ProductFilters
          categories={categories}
          search={search}
          onSearchChange={setSearch}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          onExport={handleExport}
          onImport={handleImport}
          canManage={canManage}
          t={t}
        />

        {loading ? (
          <section className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            {t("loading")}
          </section>
        ) : (
          <ProductTable
            products={visibleProducts}
            categories={categories}
            onDelete={handleDelete}
            canManage={canManage}
            t={t}
          />
        )}
      </main>
    </div>
  );
};
